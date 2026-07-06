import { createObjectCsvWriter } from 'csv-writer';
import reportDataSchema from '../models/reportData.model.js';
import moment from 'moment';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __fileName = fileURLToPath(import.meta.url)
const __dirName = path.dirname(__fileName)

async function csvGenerator(date = {}) {
    
    try {
        if (!date.start || !date.end) {
            console.log("log::: Missing date range for csv generation", date);
            return null;
        }
        
        const startDate = new Date(date.start);
        const endDate = new Date(date.end);
        endDate.setHours(23, 59, 59, 999);

        if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime()) || startDate > endDate) {
            console.log("log::: Invalid date range for csv generation", date);
            return null;
        }
        
        const csvData = await reportDataSchema.find({ createdAt: { $gte: startDate, $lte: endDate } }).lean();
        
        if (csvData.length == 0) {
            console.log("log::: No data found", csvData)
            return null;
        }
        
        const newDirPath = path.join(__dirName, '../reports');
        if (!fs.existsSync(newDirPath)) {
            fs.mkdirSync(newDirPath, { recursive: true })
        }
        
        const fileName = `report_${moment().format('YYYY-MM-DD_HH-mm-ss')}.csv`;
        const csvFilePath = path.join(newDirPath, fileName);

        const header = Object.keys(csvData[0]).map(key => ({
            id: key,
            title: key.toUpperCase()
        }));

        const csvDataWriter = createObjectCsvWriter({
            path: csvFilePath,
            header: header
        });

        await csvDataWriter.writeRecords(csvData);
        return {
            fileName,
            filePath: csvFilePath
        };

    } catch (error) {
        console.log("error::: error generating csv file:::", error);
        return null;
    }
}
// csvGenerator()
export {
    csvGenerator
}
