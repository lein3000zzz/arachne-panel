import {logger} from "../../../lib";
import postgres from 'postgres'

const pgUrl = process.env.CRAWLER_PG_URI || '';

if (!pgUrl) {
    logger.error("CRAWLER_PG_URI environment variable is not set");
    process.exit(1);
}

const crawlerPg = postgres(pgUrl, {
    max: 10,
    idle_timeout: 180,
    connect_timeout: 60,
    prepare: true,
    fetch_types: false,
})

export { crawlerPg };