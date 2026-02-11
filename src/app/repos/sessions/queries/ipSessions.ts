import {redis} from "../db"
import {logger} from "@lib";

const RATELIM_PREFIX = "ratelimit:";

async function rateLimit(ip: string, limit = 5, windowInSeconds = 60): Promise<boolean> {
    const key = `${RATELIM_PREFIX}${ip}`;

    const current = await redis.incr(key);
    if (current === 1) {
        logger.debug(`Rate limit for ${ip} in ${limit} seconds`);
        await redis.expire(key, windowInSeconds);
    }

    return current <= limit;
}