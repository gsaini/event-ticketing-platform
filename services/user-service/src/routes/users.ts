import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import { authenticate, authorize } from '../middleware/auth';
import { validate } from '../middleware/validate';

const router = Router();
const prisma = new PrismaClient();

const updateProfileSchema = z.object({
  firstName: z.string().min(1).max(100).optional(),
  lastName: z.string().min(1).max(100).optional(),
  phone: z.string().optional(),
});

// ── Get current user ────────────────────────────────────────────────────────
router.get('/me', authenticate, async (req: Request, res: Response) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.userId },
      select: {
        id: true, email: true, firstName: true, lastName: true,
        phone: true, role: true, createdAt: true, updatedAt: true,
        organizer: { select: { id: true, companyName: true, verified: true } },
      },
    });
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch user profile' });
  }
});

// ── Update current user ─────────────────────────────────────────────────────
router.patch('/me', authenticate, validate(updateProfileSchema), async (req: Request, res: Response) => {
  try {
    const user = await prisma.user.update({
      where: { id: req.user!.userId },
      data: req.body,
      select: {
        id: true, email: true, firstName: true, lastName: true,
        phone: true, role: true, updatedAt: true,
      },
    });
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// ── Get user by ID (admin) ──────────────────────────────────────────────────
router.get('/:id', authenticate, authorize('admin'), async (req: Request, res: Response) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.params.id },
      select: {
        id: true, email: true, firstName: true, lastName: true,
        phone: true, role: true, isActive: true, createdAt: true,
      },
    });
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

export default router;
