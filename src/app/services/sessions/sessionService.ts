import * as sessionRepo from "@/app/repos/sessions/redisQueries";
import { type User } from "@/app/types";
import {logger} from "@utils";

export async function startUserSession(user: User): Promise<string> {
    const sessKey = await sessionRepo.createSession(user);
    logger.debug("session started", user);

    return sessKey;
}

export async function stopUserSession(sessKey: string): Promise<void> {
    await sessionRepo.deleteSession(sessKey);

    logger.debug("session stopped: " + sessKey);
}

export async function getUserFromSession(sessKey: string): Promise<User> {
    const user = await sessionRepo.getSessionUser(sessKey);
    logger.debug(`fetched user from session: ${sessKey}, user: ` + { user });

    return user;
}

export async function checkRateLim(ip: string): Promise<boolean> {
    return await sessionRepo.rateLimit(ip)
}