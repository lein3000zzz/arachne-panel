import { serveStatic } from "hono/bun";
import mainPage from "../../public/index.html";
import * as handlers from "./handlers";
import {Hono} from "hono"
import { honoLogger } from "@logtape/hono"
import {NotFoundError, RateLimitExceededError, UnauthorizedError} from "@errors";
import {authMiddleware, rateLimiterMiddleware} from "@/server/mdlwr";

const app = new Hono();
const mainPageFile = Bun.file(mainPage.index);

app.use("*", honoLogger());
app.use("/api/*", rateLimiterMiddleware);
app.use("/assets/*", serveStatic({ root: "./public" }));

app.get("/", async (c) => c.html(await mainPageFile.text(), 200));
app.get("/api/health", (c) => c.text("OK", 200));

app.post("/api/users/register", (c) => handlers.registerUser(c));
app.post("/api/users/login", (c) => handlers.loginUser(c));

app.get("/api/sessions/me", authMiddleware, (c) => handlers.getCurrentUser(c));
app.post("/api/sessions/logout", authMiddleware, (c) => handlers.logoutUser(c));

app.post("/api/runs/send", authMiddleware, (c)=> handlers.sendRun(c));
app.get("/api/runs/history", authMiddleware, (c) => handlers.getRunsHistory(c));

app.all("/api/*", (_c) => {
    throw new NotFoundError("Not Found");
});

app.onError((err, c) => {
    if (err instanceof RateLimitExceededError) {
        return c.json({ error: err.message }, 429);
    }

    if (err instanceof UnauthorizedError) {
        return c.json({ error: err.message }, 401);
    }

    if (err instanceof NotFoundError) {
        return c.json({ error: err.message }, 404);
    }

    console.error(err);
    return c.json({ error: 'Internal Server Error' }, 500);
});

export const server = Bun.serve({
    fetch: app.fetch,
    port: 3003,
})