import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { config } from './config';
import logger from './utils/logger';
import authRoutes from './routes/auth';
import userRoutes from './routes/users';
import { errorHandler } from './middleware/error';

const app = express();

// ── Middleware ───────────────────────────────────────────────────────────────
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// ── Request logging ─────────────────────────────────────────────────────────
app.use((req, _res, next) => {
  logger.info({ method: req.method, path: req.path }, 'Incoming request');
  next();
});

// ── Health check ────────────────────────────────────────────────────────────
app.get('/health', (_req, res) => {
  res.json({ status: 'healthy', service: 'user-service', timestamp: new Date().toISOString() });
});

// ── Routes ──────────────────────────────────────────────────────────────────
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', userRoutes);

// ── Error handling ──────────────────────────────────────────────────────────
app.use(errorHandler);

// ── Server startup ──────────────────────────────────────────────────────────
const server = app.listen(config.port, () => {
  logger.info({ port: config.port }, 'User service started');
});

// ── Graceful shutdown ───────────────────────────────────────────────────────
const shutdown = (signal: string) => {
  logger.info({ signal }, 'Shutting down gracefully...');
  server.close(() => {
    logger.info('Server closed');
    process.exit(0);
  });
  setTimeout(() => {
    logger.error('Forced shutdown after timeout');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

export default app;
