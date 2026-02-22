import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import Redis from 'ioredis';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';
import pino from 'pino';

const logger = pino({ level: process.env.LOG_LEVEL || 'info', base: { service: 'cart-service' } });
const app = express();
const port = parseInt(process.env.PORT || '3007', 10);
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-in-production';
const CART_TTL = 3600; // 1 hour

// ── Redis ───────────────────────────────────────────────────────────────────
const redis = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379', 10),
  password: process.env.REDIS_PASSWORD || undefined,
});
redis.on('connect', () => logger.info('Redis connected'));
redis.on('error', (err) => logger.error({ err }, 'Redis error'));

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

// ── Schemas ─────────────────────────────────────────────────────────────────
const cartItemSchema = z.object({
  eventId: z.string().uuid(),
  ticketTierId: z.string().uuid(),
  quantity: z.number().int().positive(),
  price: z.number().min(0),
});

// ── Routes ──────────────────────────────────────────────────────────────────
app.use(helmet());
app.use(cors());
app.use(express.json());

app.get('/health', (_req, res) => { res.json({ status: 'healthy', service: 'cart-service' }); });

const getCartKey = (userId: string) => `cart:${userId}`;

app.get('/api/v1/cart', authenticate, async (req, res) => {
  try {
    const cart = await redis.get(getCartKey(req.user!.userId));
    res.json(cart ? JSON.parse(cart) : { items: [], total: 0 });
  } catch (err) { logger.error({ err }, 'Get cart failed'); res.status(500).json({ error: 'Internal error' }); }
});

app.post('/api/v1/cart/items', authenticate, async (req, res) => {
  try {
    const parsed = cartItemSchema.safeParse(req.body);
    if (!parsed.success) { res.status(400).json({ error: 'Validation failed' }); return; }

    const key = getCartKey(req.user!.userId);
    const existing = await redis.get(key);
    let cart = existing ? JSON.parse(existing) : { items: [], total: 0 };

    const newItem = { id: uuidv4(), ...parsed.data };
    cart.items.push(newItem);
    cart.total = cart.items.reduce((sum: number, item: any) => sum + (item.price * item.quantity), 0);

    await redis.set(key, JSON.stringify(cart), 'EX', CART_TTL);
    res.json(cart);
  } catch (err) { res.status(500).json({ error: 'Add to cart failed' }); }
});

app.delete('/api/v1/cart/items/:itemId', authenticate, async (req, res) => {
  try {
    const key = getCartKey(req.user!.userId);
    const existing = await redis.get(key);
    if (!existing) { res.json({ items: [], total: 0 }); return; }

    let cart = JSON.parse(existing);
    cart.items = cart.items.filter((i: any) => i.id !== req.params.itemId);
    cart.total = cart.items.reduce((sum: number, item: any) => sum + (item.price * item.quantity), 0);

    await redis.set(key, JSON.stringify(cart), 'EX', CART_TTL);
    res.json(cart);
  } catch (err) { res.status(500).json({ error: 'Remove from cart failed' }); }
});

app.delete('/api/v1/cart', authenticate, async (req, res) => {
  await redis.del(getCartKey(req.user!.userId));
  res.status(204).send();
});

// ── Start ───────────────────────────────────────────────────────────────────
const server = app.listen(port, () => logger.info({ port }, 'Cart service started'));

const shutdown = () => {
  logger.info('Shutting down...');
  server.close(async () => { await redis.quit(); process.exit(0); });
};
process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

export default app;
