import {logger} from "@/lib/utils";
import {Kafka, Partitioners, type Producer} from "kafkajs";
import type { Run } from "../types";

class KafkaProducer {
    private producer: Producer;
    private readonly defaultTopic: string;

    constructor(kafkaSeeds: string[], kafkaClientID: string, defaultTopic: string) {
        logger.info(`Initializing KafkaProducer with seeds: ${kafkaSeeds}, clientID: ${kafkaClientID}, defaultTopic: ${defaultTopic}`);

        const kafkaConfig: any = {
            clientId: kafkaClientID,
            brokers: kafkaSeeds,
        };

        if (Bun.env.KAFKA_USERNAME && Bun.env.KAFKA_PASSWORD) {
            kafkaConfig.sasl = {
                mechanism: 'plain',
                username: Bun.env.KAFKA_USERNAME,
                password: Bun.env.KAFKA_PASSWORD
            };
        }

        const kafka = new Kafka(kafkaConfig);

        this.producer = kafka.producer({
            createPartitioner: Partitioners.DefaultPartitioner,
        });

        this.defaultTopic = defaultTopic;
    }

    async connect() {
        logger.info("trying to connect to kafka")
        await this.producer.connect();
        logger.info("Connected to Kafka");
    }

    async sendRun(run: Run): Promise<void> {
        await this.producer.send({
            topic: this.defaultTopic,
            messages: [
                {
                    value: JSON.stringify(run)
                },
            ],
        });
    }

    async disconnect() {
        await this.producer.disconnect();
        logger.info("Disconnected from Kafka");
    }
}

const kp = new KafkaProducer(
    Bun.env.KAFKA_BROKERS ? Bun.env.KAFKA_BROKERS!.split(",") : ["localhost:9092"],
    Bun.env.KAFKA_CLIENT_ID || "arachne-panel",
    Bun.env.KAFKA_DEFAULT_TOPIC || "runs"
);

try {
    await kp.connect();
} catch (error) {
    logger.fatal(`Error connecting to Kafka: ${error}`, () => {
        process.exit(1);
    });
}

export { kp };