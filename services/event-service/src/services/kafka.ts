import { Kafka, Producer } from 'kafkajs';
import { config } from '../config';
import logger from '../utils/logger';

const kafka = new Kafka({
  clientId: 'event-service',
  brokers: config.kafkaBrokers,
  retry: { retries: 10, initialRetryTime: 3000 },
});

let producer: Producer;

export async function connectKafka(): Promise<void> {
  try {
    producer = kafka.producer();
    await producer.connect();
    logger.info('Kafka producer connected');
  } catch (err) {
    logger.warn({ err }, 'Kafka connection failed — events will not be published');
  }
}

export async function publishEvent(topic: string, key: string, data: Record<string, unknown>): Promise<void> {
  if (!producer) return;
  try {
    await producer.send({
      topic,
      messages: [{ key, value: JSON.stringify(data) }],
    });
    logger.info({ topic, key }, 'Event published');
  } catch (err) {
    logger.error({ err, topic }, 'Failed to publish event');
  }
}

export async function disconnectKafka(): Promise<void> {
  if (producer) {
    await producer.disconnect();
    logger.info('Kafka producer disconnected');
  }
}
