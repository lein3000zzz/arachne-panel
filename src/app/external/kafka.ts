import { logger } from "@utils";
import { Kafka, Partitioners, type Message } from "kafkajs";

const brokers = Bun.env.KAFKA_BROKERS?.split(",") ?? ["localhost:9092"];
const clientId = Bun.env.KAFKA_CLIENT_ID || "arachne-panel";

const kafkaConfig: any = {
    clientId,
    brokers,
};

if (Bun.env.KAFKA_USERNAME && Bun.env.KAFKA_PASSWORD) {
    kafkaConfig.sasl = {
        mechanism: 'plain',
        username: Bun.env.KAFKA_USERNAME,
        password: Bun.env.KAFKA_PASSWORD
    };
}

const kafka = new Kafka(kafkaConfig);
const producer = kafka.producer({
    createPartitioner: Partitioners.DefaultPartitioner,
});

try {
    logger.info(`Connecting to Kafka at ${brokers}...`);
    await producer.connect();
    logger.info("Kafka Producer connected successfully.");
} catch (error) {
    logger.fatal(`Failed to connect to Kafka: ${error}`);
    process.exit(1);
}

export const sendMessage = async (topic: string, messages: Message[]) => {
    try {
        await producer.send({
            topic,
            messages,
        });
    } catch (error) {
        logger.error(`Failed to send message to topic ${topic}: ${error}`);
        throw error;
    }
};

export const disconnectKafka = async () => {
    await producer.disconnect();
    logger.info("Kafka Producer disconnected.");
};