import { initReportSchedule, stopReportSchedule, validateScheduleConfig } from '../services/reportScheduler.service.js';
import reportStatusSchema from '../models/reportStatus.model.js';
import schedulerConfigSchema from '../models/schedulerConfig.model.js';
import reportDataSchema from '../models/reportData.model.js';


async function getReportStatus() { 

    let reportData = await reportStatusSchema.find({}).sort({ _id: -1 }).limit(50);

    if (reportData.length == 0) {
        console.log('log::: No reportData found');
        return;
    };

    return reportData;
};

async function getConfigData() {

    let configData = await schedulerConfigSchema.find({}).limit(50);
    if (configData.length == 0) {
        console.log('log::: No configData found');
        return;
    };

    return configData
}

async function saveSchedulerConfig(scheduleConfig) {

    const validation = validateScheduleConfig(scheduleConfig);
    if (!validation.valid) {
        console.log('log::: Scheduler config validation failed:::', validation.message);
        return false;
    }

    const config = validation.config;

    //save config inside mongoDB
    await schedulerConfigSchema.updateOne(
        { id: config.data.id },
        {
            $set: {
                ...config.data,
                uploadType: config.uploadType,
                credentials: config.credentials,
                active: true,
                status: config.status
            }
        },
        { upsert: true }
    );
    console.log("Configuration inserted ")

    //Initialising cron job for config
    const reportStatus = await initReportSchedule(config);

    if (!reportStatus) {
        console.log('log::: Report schedule unsuccessfull :::', reportStatus)
        return false
    };

    return true;

}

async function insertReportData(data) {

    await reportDataSchema.insertOne(data);
}

async function updateScheduleList(data) {

    const configs = await schedulerConfigSchema.find(
        { _id: { $in: data.ids } },
        { id: 1 }
    ).lean();

    for (const config of configs) {
        await stopReportSchedule(config.id);
    }

    if (data.status == 'terminate') {

        return await schedulerConfigSchema.deleteMany(
            { _id: { $in: data.ids } }
        )
    } else {

        return await schedulerConfigSchema.updateMany(
            {
                _id: { $in: data.ids },
            },
            {
                $set: { status: data.status }
            }
        )
    }
}

export {
    getReportStatus,
    getConfigData,
    saveSchedulerConfig,
    insertReportData,
    updateScheduleList
}
