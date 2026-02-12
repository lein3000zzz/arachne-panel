import {logger} from "@utils";
import {redis} from "@/app/db";
import {type User} from "@/app/types";
import {NotFoundError} from "@errors";

const SESSION_PREFIX = "session:";
const SESSION_TTL = 60 * 60 * 24 * 7; // неделя в секундах

export async function createSession(user: User): Promise<string> {
    const sessionId = Bun.randomUUIDv7();
    const sessionKey = SESSION_PREFIX + sessionId;

    const sessionData = JSON.stringify({
        id: user.id,
        username: user.username,
        hasAccess: user.hasAccess,
        createdAt: Date.now()
    });

    try {
        await redis.set(sessionKey, sessionData, {
            EX: SESSION_TTL,
        });

        logger.info(`Session created for user ${user.id}`);
        return sessionId;
    } catch (error) {
        logger.error(`Error creating session for user ${user.id}: ${error}`);
        throw new Error(`Failed to create session for ${user.id}: ${error}`);
    }
}

export async function getSessionUser(sessionId: string): Promise<User> {
    const sessData = await redis.get(`${SESSION_PREFIX}${sessionId}`);
    if (!sessData) throw new NotFoundError("Session does not exist");

    return JSON.parse(sessData) as User;
}

export async function deleteSession(sessionId: string): Promise<void> {
    try {
        await redis.del(`${SESSION_PREFIX}${sessionId}`);
        logger.info(`Session ${sessionId} deleted successfully.`);
    } catch (error) {
        logger.error(`Error deleting session ${sessionId}: ${error}`);
        throw new Error(`Failed to delete session ${sessionId}: ${error}`);
    }
}