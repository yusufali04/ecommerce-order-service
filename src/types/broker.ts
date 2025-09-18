export interface MessageBroker {
    connectConsumer: () => Promise<void>;
    connectProducer: () => Promise<void>;
    disconnectConsumer: () => Promise<void>;
    disconnectProducer: () => Promise<void>;
    consumeMessage: (topics: string[], fromBeginning: boolean) => Promise<void>;
    sendMessage: (topic: string, message: string, key?: string) => Promise<void>;
}