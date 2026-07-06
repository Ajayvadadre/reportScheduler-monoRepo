import dotenv from 'dotenv';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import mongoose from 'mongoose';

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: resolve(__dirname, '../.env'), quiet: true });

class MongoConnection {

    constructor() {

        this.connected = false
    }

    async startMongoDb() {
        try {
            const uri = process.env.MONGO_URI;

            if (!uri) {
                throw new Error('Missing MONGO_URI or MONGO_DATABASE in .env');
            }

          await mongoose.connect(uri, {
                maxPoolSize: 10,
                socketTimeoutMS: 5000,
                serverSelectionTimeoutMS: 5000,
            })

            console.log('log ::: Connected to mongoDB')

            mongoose.connection.on('error', (err) => {
                console.log('error ::: Mongo Connection error', err)
                this.connected = false
            })

            mongoose.connection.on('disconnected', () => {
                console.log('error ::: MongoDB disconnected');
                this.connected = false;
            });

            mongoose.connection.on('reconnected', () => {
                console.log('log ::: MongoDB reconnected');
                this.connected = true;
            });


        } catch (error) {
            console.log('error ::: Connection to mongoDB failed', error);
            throw error;
        }
    };

    async disconnect() {
        if (this.connected) {
            await mongoose.disconnect();
            this.connected = false;
            console.log('log ::: mongo connection closed');
        }
    }
};

export default new MongoConnection()
