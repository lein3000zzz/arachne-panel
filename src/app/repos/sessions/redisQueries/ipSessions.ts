import {redis} from "@/app/external"
import {logger} from "@utils";

const RATELIM_PREFIX = "ratelimit:";

export async function rateLimit(ip: string, limit = 5, windowInSeconds = 60): Promise<boolean> {
    const key = `${RATELIM_PREFIX}${ip}`;

    const results = await redis
        .multi()
        .incr(key)
        .expire(key, windowInSeconds, 'NX')
        .exec();

    if (!results || results.length === 0) {
        logger.error("Rate limit check failed: Redis transaction returned no results.");
        return false;
    }

    const current = results[0] as unknown as number;

    logger.debug(`rate limit check, current is ${current}`);

    return current <= limit;
}