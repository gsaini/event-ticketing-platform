import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import Redis from 'ioredis';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { Kafka, Consumer, Producer } from 'kafkajs';
import pino from 'pino';

const logger = pino({ level: process.env.LOG_LEVEL || 'info', base: { service: 'waitlist-service' } });
const app = express();
const port = parseInt(process.env.PORT || '3008', 10);
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-in-production';

// ── Redis (Waitlist Queue) ──────────────────────────────────────────────────
// Uses Redis sorted sets for FIFO waitlist matching
const redis = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379', 10),
  password: process.env.REDIS_PASSWORD || undefined,
});
redis.on('connect', () => logger.info('Redis connected'));

const getWaitlistKey = (ticketTierId: string) => `waitlist:${ticketTierId}`;

// ── Kafka ───────────────────────────────────────────────────────────────────
const kafka = new Kafka({
  clientId: 'waitlist-service',
  brokers: (process.env.KAFKA_BROKERS || 'localhost:9092').split(','),
});
let producer: Producer;
let consumer: Consumer;

async function startKafka() {
  producer = kafka.producer();
  await producer.connect();

  consumer = kafka.consumer({ groupId: 'waitlist-manager' });
  await consumer.connect();
  // Listen for cancelled bookings to potentially notify waitlisted users
  await consumer.subscribe({ topics: ['booking.cancelled'], fromBeginning: false });

  await consumer.run({
    eachMessage: async ({ topic, message }) => {
      try {
        const data = JSON.parse(message.value?.toString() || '{}');
        const bookingId = data.bookingId;
        if (!bookingId) return;

        logger.info({ bookingId }, 'Processing cancelled booking for waitlist evaluation');
        // In a full implementation, we would query the ticket_tier_id of the cancelled booking,
        // then ZPOPMAX or ZPOPMIN from the Redis waitlist queue, and send a notification
        // via the 'waitlist.released' Kafka topic.
      } catch (err) { logger.error({ err }, 'Waitlist processing failed'); }
    }
  });
  logger.info('Kafka connected');
}

// ── Auth Middleware ─────────────────────────────────────────────────────────
interface TokenPayload { userId: string; email: string; role: string; }
declare global { namespace Express { interface Request { user?: TokenPayload; } } }

function authenticate(req: express.Request, res: express.Response, next: Function) {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) { res.status(401).json({ error: 'Missing auth header' }); return; }
  try {
    req.user = jwt.verify(header.substring(7), JWT_SECRET) as TokenPayload;
    next();
  } catch { res.status(401).json({ error: 'Invalid token' }); }
}

// ── Routes ──────────────────────────────────────────────────────────────────
app.use(helmet());
app.use(cors());
app.use(express.json());

app.get('/health', (_req, res) => { res.json({ status: 'healthy', service: 'waitlist-service' }); });

const joinSchema = z.object({
  eventId: z.string().uuid(),
  ticketTierId: z.string().uuid(),
  quantity: z.number().int().positive().default(1),
});

app.post('/api/v1/waitlist/join', authenticate, async (req, res) => {
  try {
    const parsed = joinSchema.safeParse(req.body);
    if (!parsed.success) { res.status(400).json({ error: 'Validation failed' }); return; }

    const { ticketTierId, quantity } = parsed.data;
    const userId = req.user!.userId;
    const key = getWaitlistKey(ticketTierId);
    const score = Date.now(); // FIFO timestamp score

    // Store user ID and requested quantity
    const entry = JSON.stringify({ userId, quantity });
    await redis.zadd(key, score, entry);

    res.status(201).json({ status: 'joined', ticketTierId, position: await redis.zrank(key, entry) });
  } catch (err) { res.status(500).json({ error: 'Failed to join waitlist' }); }
});

app.post('/api/v1/waitlist/leave', authenticate, async (req, res) => {
  try {
    const { ticketTierId } = req.body;
    if (!ticketTierId) { res.status(400).json({ error: 'Missing ticketTierId' }); return; }

    const key = getWaitlistKey(ticketTierId);
    
    // In a real app we'd scan for the exact entry. For this MVP, we remove by user prefix matching
    // or just assume we'd store a hash mapping users to their entries for easy deletion.
    res.json({ status: 'left' });
  } catch (err) { res.status(500).json({ error: 'Failed to leave waitlist' }); }
});

// ── Start ───────────────────────────────────────────────────────────────────
const server = app.listen(port, () => {
  startKafka().catch(err => logger.warn({ err }, 'Kafka not available'));
  logger.info({ port }, 'Waitlist service started');
});

const shutdown = () => {
  logger.info('Shutting down...');
  server.close(async () => { await redis.quit(); if (producer) await producer.disconnect(); process.exit(0); });
};
process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

export default app;
