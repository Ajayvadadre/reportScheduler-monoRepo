import cron from 'node-cron';
import fs from 'node:fs';
import path from 'node:path';
import posixPath from 'node:path/posix';
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import SftpClient from 'ssh2-sftp-client';
import { csvGenerator } from './csvGenerator.service.js';
import schedulerConfigSchema from '../models/schedulerConfig.model.js';
import reportStatusSchema from '../models/reportStatus.model.js';
import RedisConnection from '../database/redisConnection.js';

const scheduledJobs = new Map();
const localExecutionLocks = new Set();

function normalizeConfig(configData) {
    const data = configData?.data ? configData.data : configData;

    return {
        data: {
            id: data?.id,
            name: data?.name,
            type: data?.type,
            time: data?.time,
            date: data?.date
        },
        uploadType: configData?.uploadType || data?.uploadType || 'aws',
        credentials: configData?.credentials || data?.credentials || {},
        status: configData?.status
    };
}

function validateScheduleConfig(configData) {
    const config = normalizeConfig(configData);
    const { id, name, type, time, date } = config.data;

    if (!id || !name || !type || !time) {
        return { valid: false, message: 'Schedule id, name, type and time are required' };
    }

    if (!['interval', 'daily'].includes(type)) {
        return { valid: false, message: 'Schedule type must be interval or daily' };
    }

    if (type === 'interval' && (!Number.isInteger(Number(time)) || Number(time) < 1)) {
        return { valid: false, message: 'Interval time must be a positive number of minutes' };
    }

    if (type === 'daily' && !/^([01]\d|2[0-3]):[0-5]\d$/.test(time)) {
        return { valid: false, message: 'Daily time must be in HH:mm format' };
    }

    if (!date || !date.start || !date.end) {
        return { valid: false, message: 'Report date range is required' };
    }

    if (!['aws', 'sftp'].includes(config.uploadType)) {
        return { valid: false, message: 'Upload type must be aws or sftp' };
    }

    return { valid: true, config };
}

async function persistScheduleInRedis(configData) {
    const client = RedisConnection.getClient();
    if (!client) {
        return;
    }

    const config = normalizeConfig(configData);
    await client.sAdd('reportscheduler:schedules:active', config.data.id);
    await client.set(`reportscheduler:schedules:${config.data.id}`, JSON.stringify(config));
}

async function initReportSchedule(configData) {
    const validation = validateScheduleConfig(configData);
    if (!validation.valid) {
        console.log('log::: Invalid scheduler config:::', validation.message);
        return false;
    }

    const config = validation.config;
    const cronRule = buildCronRule(config);

    if (!cronRule) {
        console.log('log::: Unable to create timer for cronRule');
        return false;
    }

    await persistScheduleInRedis(config);
    return scheduleCron(cronRule, config);
}

async function initAllReportSchedules() {
    const configs = await schedulerConfigSchema.find({ active: true }).lean();

    for (const config of configs) {
        const scheduleStatus = await initReportSchedule(config);
        if (!scheduleStatus) {
            await writeReportStatus(config, 'failed', 'SchedulerRecoveryFailure::: Unable to recover schedule after restart');
        }
    }

    console.log(`log::: Recovered ${configs.length} active report schedules`);
    return configs.length;
}

function buildCronRule(configData) {
    const config = normalizeConfig(configData);

    switch (config.data.type) {
        case 'interval':
            return '* * * * *';

        case 'daily': {
            const [hour, minute] = config.data.time.split(':');
            return `${Number(minute)} ${Number(hour)} * * *`;
        }

        default:
            return null;
    }
}

async function scheduleCron(cronRule, configData) {
    try {
        const config = normalizeConfig(configData);

        if (scheduledJobs.has(config.data.id)) {
            scheduledJobs.get(config.data.id).stop();
            scheduledJobs.delete(config.data.id);
        }

        const task = cron.schedule(cronRule, () => {
            executeReport(config).catch((error) => {
                console.log(`error::: Scheduled report failed for ${config.data.name}:::`, error);
            });
        });

        scheduledJobs.set(config.data.id, task);
        console.log(`Successfully registered cron job for ID ${config.data.id} with rule: ${cronRule}`);
        return true;
    } catch (error) {
        console.log("error::: Error while scheduling cron", error);
        return false;
    }
}

async function shouldRunIntervalJob(configData) {
    const intervalMinutes = Number(configData.data.time);
    const client = RedisConnection.getClient();
    const now = Date.now();

    if (client) {
        const key = `reportscheduler:schedules:${configData.data.id}:lastRunAt`;
        const lastRunAt = Number(await client.get(key));

        if (lastRunAt && now - lastRunAt < intervalMinutes * 60 * 1000) {
            return false;
        }

        await client.set(key, String(now));
        return true;
    }

    const scheduleData = await schedulerConfigSchema.findOne({ id: configData.data.id }).lean();
    if (scheduleData?.lastRunAt && now - new Date(scheduleData.lastRunAt).getTime() < intervalMinutes * 60 * 1000) {
        return false;
    }

    return true;
}

async function acquireExecutionLock(scheduleId) {
    const lockKey = `reportscheduler:schedules:${scheduleId}:lock`;
    const client = RedisConnection.getClient();

    if (client) {
        const result = await client.set(lockKey, process.pid.toString(), {
            NX: true,
            EX: 60 * 30
        });
        return result === 'OK';
    }

    if (localExecutionLocks.has(scheduleId)) {
        return false;
    }

    localExecutionLocks.add(scheduleId);
    return true;
}

async function releaseExecutionLock(scheduleId) {
    const client = RedisConnection.getClient();

    if (client) {
        await client.del(`reportscheduler:schedules:${scheduleId}:lock`);
        return;
    }

    localExecutionLocks.delete(scheduleId);
}

async function executeReport(configData) {
    const config = normalizeConfig(configData);
    const { id, date } = config.data;

    const lockAcquired = await acquireExecutionLock(id);
    if (!lockAcquired) {
        console.log(`log::: Report execution already running for ${id}`);
        return;
    }

    try {
        if (config.data.type === 'interval' && !(await shouldRunIntervalJob(config))) {
            return;
        }

        const scheduleData = await schedulerConfigSchema.findOne({ id, active: true }).lean();

        if (!scheduleData) {
            console.log("log::: Unable to find config to generate the csv report", id);
            await writeReportStatus(config, 'failed', 'ReportGenerateFailure::: Unable to find config to generate csv report');
            return;
        }

        const mergedConfig = normalizeConfig({ ...scheduleData, ...config });
        const generatedCsv = await csvGenerator(date);

        if (!generatedCsv) {
            console.log("log::: Unable to generate report csv");
            await writeReportStatus(mergedConfig, 'failed', 'ReportGenerateFailure::: No report data found for the selected date range');
            return;
        }

        if (mergedConfig.uploadType === 'aws') {
            await uploadToS3(generatedCsv, mergedConfig);
        } else {
            await uploadToSFTP(generatedCsv, mergedConfig);
        }

        await schedulerConfigSchema.updateOne(
            { id },
            { $set: { lastRunAt: new Date(), lastStatus: 'successful' } }
        );
        await writeReportStatus(mergedConfig, 'successful', `ReportGenerateSuccess::: ${generatedCsv.fileName} uploaded successfully`);
    } catch (error) {
        console.log(`error::: csv generation failed for:::${config.data.name}:::Error:::${error}`);
        await schedulerConfigSchema.updateOne(
            { id },
            { $set: { lastStatus: 'failed' } }
        );
        await writeReportStatus(config, 'failed', `ReportGenerateFailure::: ${error.message}`);
    } finally {
        await releaseExecutionLock(id);
    }
}

async function writeReportStatus(configData, status, message) {
    const config = normalizeConfig(configData);

    await reportStatusSchema.insertOne({
        status,
        message,
        type: config.data.type,
        name: config.data.name,
        scheduleTime: config.data.time
    });
}

async function uploadToS3(generatedCsv, configData) {
    const awsConfig = configData.credentials || {};
    const bucket = awsConfig.bucket || process.env.AWS_S3_BUCKET;

    if (!bucket) {
        throw new Error('Missing S3 bucket. Provide credentials.bucket or AWS_S3_BUCKET');
    }

    const s3Client = new S3Client({
        region: awsConfig.region || process.env.AWS_REGION,
        credentials: awsConfig.accessKeyId && awsConfig.secretAccessKey
            ? {
                accessKeyId: awsConfig.accessKeyId,
                secretAccessKey: awsConfig.secretAccessKey
            }
            : undefined
    });

    const keyPrefix = awsConfig.keyPrefix || process.env.AWS_S3_KEY_PREFIX || 'reports';
    const key = `${keyPrefix.replace(/\/$/, '')}/${generatedCsv.fileName}`;

    await s3Client.send(new PutObjectCommand({
        Bucket: bucket,
        Key: key,
        Body: fs.createReadStream(generatedCsv.filePath),
        ContentType: 'text/csv'
    }));
}

async function uploadToSFTP(generatedCsv, configData) {
    const sftpConfig = configData.credentials || {};
    const client = new SftpClient();

    if (!sftpConfig.host || !sftpConfig.username || !sftpConfig.password) {
        throw new Error('Missing SFTP host, username or password');
    }

    try {
        await client.connect({
            host: sftpConfig.host,
            port: Number(sftpConfig.port || 22),
            username: sftpConfig.username,
            password: sftpConfig.password
        });

        const remoteDir = sftpConfig.path || '/uploads/reports';
        const remotePath = posixPath.join(remoteDir, path.basename(generatedCsv.fileName));
        await client.mkdir(remoteDir, true);
        await client.fastPut(generatedCsv.filePath, remotePath);
    } finally {
        await client.end();
    }
}

export {
    initReportSchedule,
    initAllReportSchedules,
    validateScheduleConfig
};
