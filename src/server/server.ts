import mainPage from "../../public/index.html"
import {sendRun} from "./handlers";
import {Hono} from "hono"
import { honoLogger } from "@logtape/hono"
import {NotFoundError, RateLimitExceededError} from "@errors";
import {rateLimiterMiddleware} from "@/server/mdlwr/ratelim";

const app = new Hono();

app.use("*", honoLogger())
app.use("/api/*", rateLimiterMiddleware)

app.get("/", (c) => c.html(mainPage as unknown as string, 200));
app.get("/api/health", (c) => c.text("OK", 200));

app.post("/api/runs/send", async (c): Promise<Response> => {
    return await sendRun(c.req.raw);
});
app.all("/api/*", (_c) => {
    throw new NotFoundError("Not Found");
});

app.onError((err, c) => {
    if (err instanceof RateLimitExceededError) {
        return c.json({ error: err.message }, 429);
    }

    if (err instanceof NotFoundError) {
        return c.json({ error: err.message }, 404);
    }

    console.error(err);
    return c.json({ error: 'Internal Server Error' }, 500);
});

export { app };