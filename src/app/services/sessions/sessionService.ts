import * as sessionRepo from "@/app/repos/sessions";
import { type User } from "@/app/types";
import {logger} from "@lib";

export async function startUserSession(user: User): Promise<string> {
    const sessKey = await sessionRepo.createSession(user);
    logger.debug("session started", user);

    return sessKey;
}

export async function stopUserSession(sessKey: string): Promise<void> {
    await sessionRepo.deleteSession(sessKey);

    logger.debug("session stopped: " + sessKey);
}

export async function getUserFromSession(sessKey: string): Promise<User | null> {
    const user = await sessionRepo.getSessionUser(sessKey);
    logger.debug(`fetched user from session: ${sessKey}, user: ` + { user });

    return user;
}