import * as sessionService from "@/app/services/sessions";
import { type Context } from "hono";

const SESSION_COOKIE = "session_id";

function getSessionIdFromContext(c: Context): string | null {
    const sessionId = c.get("sessionId") as string | undefined;
    return sessionId ?? null;
}

export async function getCurrentUser(c: Context): Promise<Response> {
    const user = c.get("user");

    return c.json({ user }, 200);
}

export async function logoutUser(c: Context): Promise<Response> {
    const sessionId = getSessionIdFromContext(c);
    if (sessionId) {
        await sessionService.stopUserSession(sessionId);
    }

    c.header("Set-Cookie", `${SESSION_COOKIE}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`);

    return c.json({ status: "success" }, 200);
}

