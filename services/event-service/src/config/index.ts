export const config = {
  port: parseInt(process.env.PORT || '3002', 10),
  databaseUrl: process.env.DATABASE_URL || '',
  kafkaBrokers: (process.env.KAFKA_BROKERS || 'localhost:9092').split(','),
  minio: {
    endpoint: process.env.MINIO_ENDPOINT || 'localhost',
    port: parseInt(process.env.MINIO_PORT || '9000', 10),
    accessKey: process.env.MINIO_ACCESS_KEY || 'minioadmin',
    secretKey: process.env.MINIO_SECRET_KEY || 'changeme_minio_secret',
    bucket: process.env.MINIO_BUCKET || 'event-assets',
    useSSL: process.env.MINIO_USE_SSL === 'true',
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'dev-secret-change-in-production',
  },
  logLevel: process.env.LOG_LEVEL || 'info',
};
