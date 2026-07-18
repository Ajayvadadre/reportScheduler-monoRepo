import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __fileName = fileURLToPath(import.meta.url);
const __dirName = path.dirname(__fileName);
const reportsDir = path.join(__dirName, '../reports');
const oneHourInMs = 60 * 60 * 1000;

async function cleanupOldReportCsvs() {
    try {
        const files = await fs.readdir(reportsDir);
        const now = Date.now();

        for (const file of files) {
            if (!file.startsWith('report_') || !file.endsWith('.csv')) {
                continue;
            }

            const filePath = path.join(reportsDir, file);
            const fileDetails = await fs.stat(filePath);

            if (now - fileDetails.mtimeMs >= oneHourInMs) {
                await fs.unlink(filePath);
                console.log(`log::: Deleted old report csv::: ${file}`);
            }
        }
    } catch (error) {
        if (error.code === 'ENOENT') {
            return;
        }

        console.log("error::: Unable to cleanup old report csv files:::", error.message);
    }
}

function startReportCsvCleanup() {
    cleanupOldReportCsvs();

    const cleanupTimer = setInterval(cleanupOldReportCsvs, oneHourInMs);
    cleanupTimer.unref();
}

export {
    cleanupOldReportCsvs,
    startReportCsvCleanup
};
