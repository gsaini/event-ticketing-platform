import { Router, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { config } from '../config';
import { holdSeats, confirmBooking, cancelBooking, getBooking, listUserBookings } from '../services/booking';
import logger from '../utils/logger';

const router = Router();

// ── Auth Middleware ──────────────────────────────────────────────────────────

interface TokenPayload { userId: string; email: string; role: string; }
declare global { namespace Express { interface Request { user?: TokenPayload; } } }

function authenticate(req: Request, res: Response, next: Function): void {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) { res.status(401).json({ error: 'Missing auth header' }); return; }
  try {
    req.user = jwt.verify(header.substring(7), config.jwt.secret) as TokenPayload;
    next();
  } catch { res.status(401).json({ error: 'Invalid token' }); }
}

// ── Schemas ─────────────────────────────────────────────────────────────────

const holdSchema = z.object({
  eventId: z.string().uuid(),
  ticketTierId: z.string().uuid(),
  seatIds: z.array(z.string().uuid()).optional(),
  quantity: z.number().int().positive().optional(),
  promoCode: z.string().optional(),
});

const confirmSchema = z.object({
  bookingId: z.string().uuid(),
  paymentId: z.string().uuid(),
});

// ── Routes ──────────────────────────────────────────────────────────────────

router.post('/hold', authenticate, async (req: Request, res: Response) => {
  try {
    const parsed = holdSchema.safeParse(req.body);
    if (!parsed.success) { res.status(400).json({ error: 'Validation failed', details: parsed.error.errors }); return; }

    const result = await holdSeats(req.user!.userId, parsed.data);
    res.status(201).json(result);
  } catch (err: any) {
    logger.error({ err }, 'Hold failed');
    res.status(409).json({ error: err.message });
  }
});

router.post('/confirm', authenticate, async (req: Request, res: Response) => {
  try {
    const parsed = confirmSchema.safeParse(req.body);
    if (!parsed.success) { res.status(400).json({ error: 'Validation failed' }); return; }

    await confirmBooking(req.user!.userId, parsed.data.bookingId);
    res.json({ status: 'confirmed', bookingId: parsed.data.bookingId });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

router.delete('/:id', authenticate, async (req: Request, res: Response) => {
  try {
    await cancelBooking(req.user!.userId, req.params.id);
    res.json({ status: 'cancelled', bookingId: req.params.id });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

router.get('/:id', authenticate, async (req: Request, res: Response) => {
  const booking = await getBooking(req.params.id);
  if (!booking) { res.status(404).json({ error: 'Booking not found' }); return; }
  res.json(booking);
});

router.get('/', authenticate, async (req: Request, res: Response) => {
  const limit = Math.min(parseInt(req.query.limit as string) || 20, 100);
  const offset = parseInt(req.query.offset as string) || 0;
  const result = await listUserBookings(req.user!.userId, limit, offset);
  res.json(result);
});

export default router;
