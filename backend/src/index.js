import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser'
import 'dotenv/config';
import authMiddleware from './middleware/auth.middleware.js';
import schedulerRoutes from './routes/scheduler.route.js';
import authRoutes from './routes/auth.route.js'
import MongoConnection from './database/mongoConnection.js';
import RedisConnection from './database/redisConnection.js';
import { initAllReportSchedules } from './services/reportScheduler.service.js';
import { startReportCsvCleanup } from './services/reportCleanup.service.js';

const app = express();
const {
    PORT = 3000
} = process.env

app.use(express.json());
app.use(cookieParser());
app.use(cors({
    origin: process.env.ALLOWED_ORIGINS,
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use("/auth", authRoutes)
app.use(authMiddleware)
app.use("/schedule", schedulerRoutes)

async function startServer() {

    try {

        await MongoConnection.startMongoDb();
        console.log('log ::: Mongo connection established');
        await RedisConnection.startRedis();
        await initAllReportSchedules();
        startReportCsvCleanup();

        app.listen(PORT, () => {
            console.log("server listening on port:::", PORT);
        });

    } catch (error) {
        console.log('error ::: MongoDB connection error', error)
    }
};

startServer();
