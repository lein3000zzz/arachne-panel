import * as logtape from "@logtape/logtape";

const loggingLevel = Bun.env.LOGGING_LEVEL as "trace" | "debug" | "info" | "warning" | "error" | "fatal";

if (!loggingLevel) {
    console.error("LOGGING_LEVEL environment variable is not set");
    process.exit(1);
}

await logtape.configure({
    sinks: { console: logtape.getConsoleSink() },
    filters: {},
    loggers: [{ category: ["arachne-panel"], lowestLevel: loggingLevel, sinks: ["console"] }],
});

const logger: logtape.Logger = logtape.getLogger(["arachne-panel"]);

logger.info("Started logger");

export { logger };