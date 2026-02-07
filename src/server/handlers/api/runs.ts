import { type Run } from "../../../app/types";
import { logger } from "../../../lib";
import { kp } from "../../../app/producer";

async function sendRun(req: Request): Promise<Response> {
    try {
        const run: Run = await req.json() as Run;
        await kp.sendRun(run);
        logger.debug("Run sent to Kafka: " + JSON.stringify(run));

        return Response.json({ status: "success", message: "Run sent to Kafka" }, { status: 200 });
    } catch (error) {
        logger.error(`Error sending run to Kafka: ${error}`);

        return Response.json({ status: "error", message: "Failed to send run to Kafka" }, { status: 500 });
    }
}

export { sendRun };