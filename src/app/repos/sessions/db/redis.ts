import { createClient } from 'redis';
import {logger} from "@lib";

const url = Bun.env.REDIS_URL || 'redis://localhost:6379';
const pass = Bun.env.REDIS_PASSWORD || "";

if (!url) {
    console.error("REDIS_URL environment variable is not set");
    process.exit(1);
}

export const redis = createClient({
    url: url,
    password: pass,
});

redis.on('error', (err) => logger.error("Logger error: " + err));
redis.on('connect', () => logger.info("Connected to Redis"));

