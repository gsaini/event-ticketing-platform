import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';
import { Kafka, Producer } from 'kafkajs';
import { v4 as uuidv4 } from 'uuid';
import { z } from 'zod';
import pino from 'pino';

const logger = pino({ level: process.env.LOG_LEVEL || 'info', base: { service: 'payment-service' } });
const app = express();
const port = parseInt(process.env.PORT || '3004', 10);
const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-in-production';

// ── Kafka ───────────────────────────────────────────────────────────────────
const kafka = new Kafka({
  clientId: 'payment-service',
  brokers: (process.env.KAFKA_BROKERS || 'localhost:9092').split(','),
  retry: { retries: 10, initialRetryTime: 3000 },
});
let producer: Producer;

async function publishEvent(topic: string, key: string, data: Record<string, unknown>) {
  if (!producer) return;
  try {
    await producer.send({ topic, messages: [{ key, value: JSON.stringify(data) }] });
    logger.info({ topic, key }, 'Event published');
  } catch (err) { logger.error({ err, topic }, 'Publish failed'); }
}

// ── Auth Middleware ──────────────────────────────────────────────────────────
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

// ── Schemas ─────────────────────────────────────────────────────────────────
const intentSchema = z.object({
  bookingId: z.string().uuid(),
  amount: z.number().min(0.5),
  currency: z.string().length(3).optional().default('USD'),
});

// ── Middleware ───────────────────────────────────────────────────────────────
app.use(helmet());
app.use(cors());
app.use(express.json());

app.get('/health', (_req, res) => {
  res.json({ status: 'healthy', service: 'payment-service', timestamp: new Date().toISOString() });
});

// Actuator-compatible health (for Spring Boot Docker Compose healthcheck compat)
app.get('/actuator/health', (_req, res) => {
  res.json({ status: 'UP' });
});

// ── Create Payment Intent ───────────────────────────────────────────────────
app.post('/api/v1/payments/intent', authenticate, async (req, res) => {
  try {
    const parsed = intentSchema.safeParse(req.body);
    if (!parsed.success) { res.status(400).json({ error: 'Validation failed', details: parsed.error.errors }); return; }

    const { bookingId, amount, currency } = parsed.data;

    // Mock Stripe — generate a mock provider transaction ID
    const providerTxnId = `pi_mock_${uuidv4().substring(0, 12)}`;
    const clientSecret = `cs_mock_${uuidv4().substring(0, 12)}`;

    const payment = await prisma.payment.create({
      data: {
        bookingId,
        amount,
        currency,
        provider: 'stripe',
        providerTxnId,
        status: 'pending',
        providerMetadata: { clientSecret },
      },
    });

    await publishEvent('payment.created', payment.id, {
      paymentId: payment.id, bookingId, amount, status: 'pending',
    });

    logger.info({ paymentId: payment.id, bookingId }, 'Payment intent created');
    res.status(201).json({
      id: payment.id, bookingId, provider: 'stripe', providerTxnId,
      amount: Number(payment.amount), currency, status: 'pending', clientSecret,
      createdAt: payment.createdAt,
    });
  } catch (err) {
    logger.error({ err }, 'Create payment intent failed');
    res.status(500).json({ error: 'Failed to create payment intent' });
  }
});

// ── Get Payment ─────────────────────────────────────────────────────────────
app.get('/api/v1/payments/:id', authenticate, async (req, res) => {
  const payment = await prisma.payment.findUnique({ where: { id: req.params.id } });
  if (!payment) { res.status(404).json({ error: 'Payment not found' }); return; }
  res.json({ ...payment, amount: Number(payment.amount) });
});

// ── Get Payment by Booking ──────────────────────────────────────────────────
app.get('/api/v1/payments/booking/:bookingId', authenticate, async (req, res) => {
  const payment = await prisma.payment.findFirst({ where: { bookingId: req.params.bookingId } });
  if (!payment) { res.status(404).json({ error: 'Payment not found' }); return; }
  res.json({ ...payment, amount: Number(payment.amount) });
});

// ── Refund Payment ──────────────────────────────────────────────────────────
app.post('/api/v1/payments/:id/refund', authenticate, async (req, res) => {
  try {
    const payment = await prisma.payment.findUnique({ where: { id: req.params.id } });
    if (!payment) { res.status(404).json({ error: 'Payment not found' }); return; }
    if (payment.status !== 'success') { res.status(400).json({ error: 'Can only refund successful payments' }); return; }

    const updated = await prisma.payment.update({
      where: { id: req.params.id },
      data: { status: 'refunded' },
    });

    await publishEvent('payment.refunded', updated.id, {
      paymentId: updated.id, bookingId: updated.bookingId, amount: Number(updated.amount), status: 'refunded',
    });

    res.json({ ...updated, amount: Number(updated.amount) });
  } catch (err) {
    res.status(500).json({ error: 'Refund failed' });
  }
});

// ── Webhook / Simulate Endpoints ────────────────────────────────────────────
app.post('/api/v1/webhooks/stripe', async (req, res) => {
  try {
    const { type, data } = req.body;
    const providerTxnId = data?.object?.id;
    if (!providerTxnId) { res.status(400).json({ error: 'Missing provider txn id' }); return; }

    const payment = await prisma.payment.findUnique({ where: { providerTxnId } });
    if (!payment) { res.status(404).json({ error: 'Payment not found' }); return; }

    if (type === 'payment_intent.succeeded') {
      await prisma.payment.update({ where: { id: payment.id }, data: { status: 'success' } });
      await publishEvent('payment.success', payment.id, {
        paymentId: payment.id, bookingId: payment.bookingId, amount: Number(payment.amount), status: 'success',
      });
    } else if (type === 'payment_intent.payment_failed') {
      await prisma.payment.update({ where: { id: payment.id }, data: { status: 'failed' } });
      await publishEvent('payment.failed', payment.id, {
        paymentId: payment.id, bookingId: payment.bookingId, status: 'failed',
      });
    }

    res.json({ received: true });
  } catch (err) {
    logger.error({ err }, 'Webhook error');
    res.status(500).json({ error: 'Webhook processing failed' });
  }
});

// Simulate payment success (dev convenience)
app.post('/api/v1/webhooks/simulate/success/:providerTxnId', async (req, res) => {
  const payment = await prisma.payment.findUnique({ where: { providerTxnId: req.params.providerTxnId } });
  if (!payment) { res.status(404).json({ error: 'Payment not found' }); return; }
  await prisma.payment.update({ where: { id: payment.id }, data: { status: 'success' } });
  await publishEvent('payment.success', payment.id, {
    paymentId: payment.id, bookingId: payment.bookingId, amount: Number(payment.amount), status: 'success',
  });
  res.json({ status: 'success', paymentId: payment.id });
});

// ── Start ───────────────────────────────────────────────────────────────────
const server = app.listen(port, async () => {
  try { producer = kafka.producer(); await producer.connect(); } catch (err) { logger.warn({ err }, 'Kafka not available'); }
  logger.info({ port }, 'Payment service started');
});

const shutdown = (signal: string) => {
  logger.info({ signal }, 'Shutting down...');
  server.close(async () => { if (producer) await producer.disconnect(); process.exit(0); });
  setTimeout(() => process.exit(1), 10000);
};
process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

export default app;
