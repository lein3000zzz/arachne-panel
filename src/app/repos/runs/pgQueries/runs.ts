import {crawlerPg} from "@/app/external";
import {logger} from "@utils";
import {type Run, type RunCfg, type RunStatus, type User} from "@/app/types";

export async function saveRun(runCfg: RunCfg, user: User): Promise<Run> {
    const runId = Bun.randomUUIDv7();
    try {
        await crawlerPg`
            INSERT INTO runs (id, user_id, config, status, created_at)
            VALUES (${runId}, ${user.id}, ${JSON.stringify(runCfg)}, ${"queued"}, ${new Date()})
        `;
        logger.info(`Run ${runId} saved successfully.`);

        return {
            id: runId,
            status: "queued",
            ...runCfg,
        }
    } catch (error) {
        logger.error(`Error saving run ${runId}: ${error}`);
        throw new Error(`Failed to save run ${runId}: ${error}`);
    }
}

export async function markFailed(runId: string): Promise<void> {
    try {
        await crawlerPg`
            UPDATE runs
            SET status = ${"failed"}
            WHERE id = ${runId}
        `;
        logger.info(`Run ${runId} marked as failed.`);
    } catch (error) {
        logger.error(`Error marking run ${runId} as FAILED: ${error}`);
        throw new Error(`Failed to mark run ${runId} as FAILED: ${error}`);
    }
}

export async function getRunsByUser(userId: string, offset: number, limit: number): Promise<Run[]> {
    try {
        const runs = await crawlerPg`
            SELECT id, status, config
            FROM runs
            WHERE user_id = ${userId}
            ORDER BY created_at DESC
            OFFSET ${offset}
            LIMIT ${limit}
        `;

        return runs.map((run) => {
            const cfg = typeof run.config === "string" ? JSON.parse(run.config) : run.config;
            return {
                id: run.id,
                status: run.status as RunStatus,
                ...cfg,
            };
        });
    } catch (error) {
        logger.error(`Error fetching runs for user ${userId}: ${error}`);
        throw new Error(`Failed to fetch runs for user ${userId}: ${error}`);
    }
}