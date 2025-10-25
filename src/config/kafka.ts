import { Consumer, EachMessagePayload, Kafka, KafkaConfig, Producer } from "kafkajs";
import { MessageBroker } from "../types/broker";
import { handleProductUpdate } from "../productCache/productUpdateHandler";
import { handleToppingUpdate } from "../toppingCache/toppingUpdateHandler";
import config from "config";

export class KafkaBroker implements MessageBroker {
    private consumer: Consumer;
    private producer: Producer;
    constructor(clientId: string, brokers: string[]) {
        let kafkaConfig: KafkaConfig = {
            clientId,
            brokers,
        };
        if (process.env.NODE_ENV === "production") {
            kafkaConfig = {
                ...kafkaConfig,
                ssl: true,
                connectionTimeout: 45000,
                sasl: {
                    mechanism: "plain",
                    username: config.get("kafka.sasl.username"),
                    password: config.get("kafka.sasl.password"),
                },
            };
        }
        const kafka = new Kafka(kafkaConfig)
        this.producer = kafka.producer();
        this.consumer = kafka.consumer({ groupId: clientId })
    }
    /**
     * Connect the consumer
     */
    async connectConsumer() {
        await this.consumer.connect();
    }
    /**
     * Connect the producer
     */
    async connectProducer() {
        if (this.producer) {
            await this.producer.connect();
        }
    }
    /**
     * Disconnect the consumer
     */
    async disconnectConsumer() {
        await this.consumer.disconnect();
    }
    /**
     * Disconnect the producer
     */
    async disconnectProducer() {
        await this.producer.disconnect();
    }
    async consumeMessage(topics: string[], fromBeginning: boolean = false) {
        await this.consumer.subscribe({ topics, fromBeginning })
        await this.consumer.run({
            eachMessage: async ({ topic, message }: EachMessagePayload) => {
                switch (topic) {
                    case "product":
                        await handleProductUpdate(message.value.toString());
                        return;
                    case "topping":
                        await handleToppingUpdate(message.value.toString())
                        return;
                    default:
                        return;
                }
            }
        })
    }
    /**
     * @param topic - Topic to which the message should be sent
     * @param message - Message to send
     * @throws {Error} - When the producer is not connected
     */
    async sendMessage(topic: string, message: string, key: string) {
        const data: { value: string, key?: string } = {
            value: message
        }
        if (key) {
            data.key = key
        }
        await this.producer.send({
            topic,
            messages: [data],
        });
    }
}