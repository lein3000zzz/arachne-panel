import * as sessionService from "@/app/services/sessions"
import {NotFoundError, RateLimitExceededError} from "@errors";
import {type Context, type Next} from "hono";
import {getConnInfo} from "hono/bun";

export async function rateLimiterMiddleware(c: Context, next: Next)  {
    const connInfo = getConnInfo(c);
    const ip = connInfo.remote.address;

    if (!ip) {
        throw new NotFoundError("Unable to determine client IP address");
    }

    const isValid = await sessionService.checkRateLim(ip)

    if (!isValid) {
        throw new RateLimitExceededError("Too many requests from this IP address. Please try again later.");
    }

    await next();
}