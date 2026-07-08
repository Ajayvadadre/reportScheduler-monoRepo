import 'dotenv/config';
import mongoose from 'mongoose';
import reportDataSchema from '../models/reportData.model.js';

const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
    console.error('Missing MONGO_URI in .env');
    process.exit(1);
}

const agents = ['Aarav Mehta', 'Priya Sharma', 'Rohan Das', 'Neha Patel'];
const customers = ['Acme Corp', 'Nova Retail', 'Bright Finance', 'Urban Health'];
const locations = ['Mumbai', 'Delhi', 'Bengaluru', 'Hyderabad', 'Pune'];

function randomItem(items) {
    return items[Math.floor(Math.random() * items.length)];
}

function randomDateWithinLastDays(daysBack) {
    const date = new Date();
    date.setDate(date.getDate() - Math.floor(Math.random() * daysBack));
    date.setHours(Math.floor(Math.random() * 24));
    date.setMinutes(Math.floor(Math.random() * 60));
    date.setSeconds(0);
    date.setMilliseconds(0);
    return date;
}

async function seedReportData() {
    await mongoose.connect(MONGO_URI);

    const records = Array.from({ length: 150 }, () => {
        const createdAt = randomDateWithinLastDays(90);

        return {
            agentName: randomItem(agents),
            callInitiated: '10:00',
            callEnded: '10:15',
            callDuration: `${5 + Math.floor(Math.random() * 25)} min`,
            customerName: randomItem(customers),
            location: randomItem(locations),
            createdAt,
            updatedAt: createdAt
        };
    });

    await reportDataSchema.insertMany(records);

    console.log(`Inserted ${records.length} report data records`);
    await mongoose.disconnect();
}

seedReportData().catch(async (error) => {
    console.error('Seed failed:', error);
    await mongoose.disconnect();
    process.exit(1);
});