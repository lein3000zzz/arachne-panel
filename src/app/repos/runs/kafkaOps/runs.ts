import { sendMessage } from "@/app/external";
import { type Run } from "@/app/types";

const RUNS_TOPIC = Bun.env.KAFKA_DEFAULT_TOPIC || "runs";

export async function publishRun(run: Run): Promise<void> {
    try {
        await sendMessage(RUNS_TOPIC, [
            {
                value: JSON.stringify(run),
                timestamp: Date.now().toString(),
            },
        ]);
    } catch (error) {
        throw new Error(`Run Repository failed to publish run ${run.id}: ${error}`);
    }
}

export async function publishBatchRuns(runs: Run[]): Promise<void> {
    const messages = runs.map(run => ({
        key: run.id?.toString(),
        value: JSON.stringify(run)
    }));

    await sendMessage(RUNS_TOPIC, messages);
}