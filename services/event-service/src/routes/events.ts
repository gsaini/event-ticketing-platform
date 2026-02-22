import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import { authenticate, authorize } from '../middleware/auth';
import { publishEvent } from '../services/kafka';
import logger from '../utils/logger';

const router = Router();
const prisma = new PrismaClient();

// ── Schemas ─────────────────────────────────────────────────────────────────

const ticketTierSchema = z.object({
  name: z.string().max(100),
  price: z.number().min(0),
  quantityTotal: z.number().int().positive(),
  saleStart: z.string().datetime().optional(),
  saleEnd: z.string().datetime().optional(),
});

const createEventSchema = z.object({
  title: z.string().max(255),
  description: z.string().optional(),
  genre: z.string().max(50).optional(),
  venueId: z.string().uuid().optional(),
  startTime: z.string().datetime(),
  endTime: z.string().datetime(),
  ticketTiers: z.array(ticketTierSchema).optional().default([]),
  metadata: z.record(z.unknown()).optional().default({}),
});

const updateEventSchema = z.object({
  title: z.string().max(255).optional(),
  description: z.string().optional(),
  genre: z.string().max(50).optional(),
  venueId: z.string().uuid().optional().nullable(),
  startTime: z.string().datetime().optional(),
  endTime: z.string().datetime().optional(),
  metadata: z.record(z.unknown()).optional(),
});

// ── Helper ──────────────────────────────────────────────────────────────────

function validate(schema: z.ZodSchema) {
  return (req: Request, res: Response, next: Function) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      res.status(400).json({ error: 'Validation failed', details: result.error.errors });
      return;
    }
    req.body = result.data;
    next();
  };
}

const eventSelect = {
  id: true, organizerId: true, venueId: true, title: true, description: true,
  genre: true, imageUrl: true, startTime: true, endTime: true, status: true,
  metadata: true, createdAt: true, updatedAt: true,
  ticketTiers: { select: { id: true, name: true, price: true, quantityTotal: true, quantitySold: true, quantityHeld: true, saleStart: true, saleEnd: true } },
};

// ── Routes ──────────────────────────────────────────────────────────────────

// List events
router.get('/', async (req: Request, res: Response) => {
  try {
    const { genre, status, limit = '20', offset = '0' } = req.query;
    const where: any = {};
    if (genre) where.genre = genre;
    if (status) where.status = status;

    const [events, total] = await Promise.all([
      prisma.event.findMany({
        where, select: eventSelect,
        orderBy: { startTime: 'asc' },
        take: Math.min(parseInt(limit as string), 100),
        skip: parseInt(offset as string),
      }),
      prisma.event.count({ where }),
    ]);

    res.json({ events, total });
  } catch (err) {
    logger.error({ err }, 'List events failed');
    res.status(500).json({ error: 'Failed to list events' });
  }
});

// Get event
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const event = await prisma.event.findUnique({ where: { id: req.params.id }, select: eventSelect });
    if (!event) { res.status(404).json({ error: 'Event not found' }); return; }
    res.json(event);
  } catch (err) {
    res.status(500).json({ error: 'Failed to get event' });
  }
});

// Create event (organizer/admin only)
router.post('/', authenticate, authorize('organizer', 'admin'), validate(createEventSchema), async (req: Request, res: Response) => {
  try {
    const { ticketTiers, ...eventData } = req.body;
    const event = await prisma.event.create({
      data: {
        ...eventData,
        organizerId: req.user!.userId,
        startTime: new Date(eventData.startTime),
        endTime: new Date(eventData.endTime),
        ticketTiers: {
          create: ticketTiers.map((t: any) => ({
            name: t.name,
            price: t.price,
            quantityTotal: t.quantityTotal,
            saleStart: t.saleStart ? new Date(t.saleStart) : null,
            saleEnd: t.saleEnd ? new Date(t.saleEnd) : null,
          })),
        },
      },
      select: eventSelect,
    });

    await publishEvent('event.created', event.id, {
      eventId: event.id, title: event.title, genre: event.genre,
      startTime: event.startTime, status: event.status,
    });

    logger.info({ eventId: event.id }, 'Event created');
    res.status(201).json(event);
  } catch (err) {
    logger.error({ err }, 'Create event failed');
    res.status(500).json({ error: 'Failed to create event' });
  }
});

// Update event
router.put('/:id', authenticate, authorize('organizer', 'admin'), validate(updateEventSchema), async (req: Request, res: Response) => {
  try {
    const existing = await prisma.event.findUnique({ where: { id: req.params.id } });
    if (!existing) { res.status(404).json({ error: 'Event not found' }); return; }
    if (existing.organizerId !== req.user!.userId && req.user!.role !== 'admin') {
      res.status(403).json({ error: 'Not your event' }); return;
    }

    const data: any = { ...req.body };
    if (data.startTime) data.startTime = new Date(data.startTime);
    if (data.endTime) data.endTime = new Date(data.endTime);

    const event = await prisma.event.update({ where: { id: req.params.id }, data, select: eventSelect });

    await publishEvent('event.updated', event.id, {
      eventId: event.id, title: event.title, genre: event.genre,
      startTime: event.startTime, status: event.status,
    });

    res.json(event);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update event' });
  }
});

// Publish event
router.post('/:id/publish', authenticate, authorize('organizer', 'admin'), async (req: Request, res: Response) => {
  try {
    const existing = await prisma.event.findUnique({ where: { id: req.params.id }, select: { ...eventSelect } });
    if (!existing) { res.status(404).json({ error: 'Event not found' }); return; }
    if (existing.organizerId !== req.user!.userId && req.user!.role !== 'admin') {
      res.status(403).json({ error: 'Not your event' }); return;
    }
    if (existing.status !== 'draft') {
      res.status(400).json({ error: `Cannot publish event in '${existing.status}' status` }); return;
    }

    const event = await prisma.event.update({
      where: { id: req.params.id },
      data: { status: 'published' },
      select: eventSelect,
    });

    await publishEvent('event.published', event.id, {
      eventId: event.id, title: event.title, genre: event.genre, city: null,
      startTime: event.startTime, endTime: event.endTime, status: 'published',
      tiers: event.ticketTiers.map((t) => ({ name: t.name, price: Number(t.price), quantityTotal: t.quantityTotal })),
    });

    res.json(event);
  } catch (err) {
    res.status(500).json({ error: 'Failed to publish event' });
  }
});

// Cancel event
router.delete('/:id', authenticate, authorize('organizer', 'admin'), async (req: Request, res: Response) => {
  try {
    const existing = await prisma.event.findUnique({ where: { id: req.params.id } });
    if (!existing) { res.status(404).json({ error: 'Event not found' }); return; }
    if (existing.organizerId !== req.user!.userId && req.user!.role !== 'admin') {
      res.status(403).json({ error: 'Not your event' }); return;
    }

    await prisma.event.update({ where: { id: req.params.id }, data: { status: 'cancelled' } });
    await publishEvent('event.cancelled', req.params.id, { eventId: req.params.id, title: existing.title });

    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: 'Failed to cancel event' });
  }
});

export default router;
