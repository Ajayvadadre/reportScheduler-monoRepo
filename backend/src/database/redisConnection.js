import { createClient } from 'redis';

class RedisConnection {
    constructor() {
        this.client = null;
        this.connected = false;
        this.enabled = Boolean(process.env.REDIS_URL);
    }

    async startRedis() {
        if (!this.enabled) {
            console.log('log ::: REDIS_URL not configured; Redis-backed recovery is disabled');
            return null;
        }

        if (this.connected && this.client) {
            return this.client;
        }

        this.client = createClient({
            url: process.env.REDIS_URL
        });

        this.client.on('error', (error) => {
            this.connected = false;
            console.log('error ::: Redis connection error', error);
        });

        this.client.on('ready', () => {
            this.connected = true;
            console.log('log ::: Connected to Redis');
        });

        await this.client.connect();
        return this.client;
    }

    getClient() {
        return this.connected ? this.client : null;
    }

    async disconnect() {
        if (this.client && this.connected) {
            await this.client.quit();
        }

        this.connected = false;
        this.client = null;
    }
}

export default new RedisConnection();
