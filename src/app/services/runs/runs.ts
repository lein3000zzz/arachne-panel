import {logger} from "@utils";
import {type Run, type RunCfg, type User} from "@/app/types";
import * as ops from "@/app/repos/runs/kafkaOps";
import * as runsRepo from "@/app/repos/runs/pgQueries";

export async function sendRun(runCfg: RunCfg, user: User): Promise<string> {
    const run: Run = await runsRepo.saveRun(runCfg, user).catch((error) => {
        logger.error(`Error saving run to database: ${error}`);
        throw new Error(`Failed to save run to database: ${error}`);
    })

    await ops.publishRun(run).catch(async (error) => {
        logger.error(`Error publishing run to Kafka: ${error}`);

        try {
            await runsRepo.markFailed(run.id);
        } catch (markError) {
            logger.error(`Error marking run failed in repo: ${markError}`);
        }

        throw new Error(`Failed to publish run to Kafka: ${error}`);
    })

    logger.debug("Run sent to Kafka with id: " + run.id);

    return run.id;
}

export async function getRunsByUser(user: User, offset: number, limit: number): Promise<Run[]> {
    return await runsRepo.getRunsByUser(user.id, offset, limit).catch((error) => {
        logger.error(`Error fetching runs for user ${user.id}: ${error}`);
        throw new Error(`Failed to fetch runs for user ${user.id}: ${error}`);
    });
}

