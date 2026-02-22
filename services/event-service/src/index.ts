import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { config } from './config';
import logger from './utils/logger';
import eventRoutes from './routes/events';
import { connectKafka, disconnectKafka } from './services/kafka';

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '10mb' }));

app.get('/health', (_req, res) => {
  res.json({ status: 'healthy', service: 'event-service', timestamp: new Date().toISOString() });
});

app.use('/api/v1/events', eventRoutes);

app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  logger.error({ err }, 'Unhandled error');
  res.status(500).json({ error: 'Internal server error' });
});

const server = app.listen(config.port, async () => {
  await connectKafka();
  logger.info({ port: config.port }, 'Event service started');
});

const shutdown = (signal: string) => {
  logger.info({ signal }, 'Shutting down...');
  server.close(async () => {
    await disconnectKafka();
    process.exit(0);
  });
  setTimeout(() => process.exit(1), 10000);
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

export default app;
