import {type Run, type RunCfg, type User} from "@/app/types";
import { logger } from "@/lib/utils";
import * as runsService from "@/app/services/runs";
import {type Context} from "hono";

export async function sendRun(c: Context): Promise<Response> {
    try {
        const runCfg: RunCfg = await c.req.raw.json() as RunCfg;
        const user: User = c.get("user")

        await runsService.sendRun(runCfg, user);
        logger.debug("Run sent to Kafka: " + JSON.stringify(runCfg));

        return Response.json({ status: "success", message: "Run sent to Kafka" }, { status: 200 });
    } catch (error) {
        logger.error(`Error sending run to Kafka: ${error}`);

        return Response.json({ status: "error", message: "Failed to send run to Kafka" }, { status: 500 });
    }
}

export async function getRunsHistory(c: Context): Promise<Response> {
    try {
        const user: User = c.get("user");
        const offset: number = c.req.query("offset") ? parseInt(c.req.query("offset") as string, 10) : 0;
        const limit: number = c.req.query("limit") ? parseInt(c.req.query("limit") as string, 10) : 10;

        const runs: Run[] = await runsService.getRunsByUser(user, offset, limit);

        return Response.json({ status: "success", data: runs }, { status: 200 });
    } catch (error) {
        logger.error(`Error fetching runs: ${error}`);

        return Response.json({ status: "error", message: "Failed to fetch runs" }, { status: 500 });
    }
}