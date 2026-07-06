import express from 'express';
import 'dotenv/config';
import schedulerRoutes from './routes/scheduler.route.js';
import MongoConnection from './database/mongoConnection.js';
import RedisConnection from './database/redisConnection.js';
import { initAllReportSchedules } from './services/reportScheduler.service.js';
import cors from 'cors';

const app = express();
const {
    PORT = 3000
} = process.env

app.use(express.json());
app.use(cors({ origin: "*" }));
app.use("/schedule", schedulerRoutes)


async function startServer() {

    try {

        await MongoConnection.startMongoDb();
        console.log('log ::: Mongo connection established');
        await RedisConnection.startRedis();
        await initAllReportSchedules();

        app.listen(PORT, () => {
            console.log("server listening on port:::", PORT);
        });

    } catch (error) {
        console.log('error ::: MongoDB connection error', error)
    }
};

startServer();
