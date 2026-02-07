import {server} from "./server";
import {logger} from "./lib";

logger.info(`Started logger and server at port ${server.port}`);

setTimeout(() => {
    process.exit(1);
}, 1000 * 60 * 60); // 1 hour as an example