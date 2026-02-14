import * as sessionService from "@/app/services/sessions";
import { UnauthorizedError } from "@errors";
import { type Context, type Next } from "hono";

const SESSION_COOKIE = "session_id";

function extractSessionId(req: Request): string | null {
    const authHeader = req.headers.get("authorization");
    if (authHeader && authHeader.toLowerCase().startsWith("bearer ")) {
        return authHeader.slice(7).trim();
    }

    const headerId = req.headers.get("x-session-id");
    if (headerId) {
        return headerId.trim();
    }

    const cookieHeader = req.headers.get("cookie");
    if (!cookieHeader) {
        return null;
    }

    const cookiePair = cookieHeader
        .split(";")
        .map((part) => part.trim())
        .find((part) => part.startsWith(`${SESSION_COOKIE}=`));

    if (!cookiePair) {
        return null;
    }

    return decodeURIComponent(cookiePair.slice(`${SESSION_COOKIE}=`.length));
}

export async function authMiddleware(c: Context, next: Next): Promise<void> {
    const sessionId = extractSessionId(c.req.raw);
    if (!sessionId) {
        throw new UnauthorizedError("Session not provided");
    }

    const user = await sessionService.getUserFromSession(sessionId);
    c.set("user", user);
    c.set("sessionId", sessionId);

    await next();
}

