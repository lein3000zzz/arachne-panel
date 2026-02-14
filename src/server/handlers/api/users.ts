import * as userService from "@/app/services/users";
import * as sessionService from "@/app/services/sessions";
import { type Context } from "hono";

const SESSION_COOKIE = "session_id";
const SESSION_MAX_AGE = 60 * 60 * 24 * 7;

type AuthPayload = {
    username: string;
    password: string;
};

export async function registerUser(c: Context): Promise<Response> {
    const payload = await c.req.json<AuthPayload>();
    const user = await userService.registerUser(payload.username, payload.password);

    return c.json({ user }, 201);
}

export async function loginUser(c: Context): Promise<Response> {
    const payload = await c.req.json<AuthPayload>();
    const user = await userService.loginUser(payload.username, payload.password);
    const sessionId = await sessionService.startUserSession(user);

    c.header(
        "Set-Cookie",
        `${SESSION_COOKIE}=${encodeURIComponent(sessionId)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${SESSION_MAX_AGE}`
    );

    return c.json({ user, sessionId }, 200);
}

