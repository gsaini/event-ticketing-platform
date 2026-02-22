export const config = {
  port: parseInt(process.env.PORT || '3003', 10),
  databaseUrl: process.env.DATABASE_URL || '',
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379', 10),
    password: process.env.REDIS_PASSWORD || '',
  },
  kafkaBrokers: (process.env.KAFKA_BROKERS || 'localhost:9092').split(','),
  jwt: {
    secret: process.env.JWT_SECRET || 'dev-secret-change-in-production',
  },
  holdTTLSeconds: parseInt(process.env.HOLD_TTL_SECONDS || '300', 10),
  idempotencyTTLSeconds: parseInt(process.env.IDEMPOTENCY_TTL_SECONDS || '86400', 10),
  logLevel: process.env.LOG_LEVEL || 'info',
};
