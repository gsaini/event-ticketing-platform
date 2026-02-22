import { PrismaClient } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';
import { config } from '../config';
import { acquireSeatLock, releaseSeatLock, setBookingHold, clearBookingHold } from './lock';
import { publishEvent } from './kafka';
import logger from '../utils/logger';

const prisma = new PrismaClient();

interface HoldRequest {
  eventId: string;
  ticketTierId: string;
  seatIds?: string[];
  quantity?: number;
  promoCode?: string;
}

interface HoldResponse {
  bookingId: string;
  status: string;
  holdExpiresAt: Date;
  totalAmount: number;
  currency: string;
}

/**
 * Two-layer locking strategy:
 * Layer 1: Redis SETNX for seat-level distributed lock
 * Layer 2: PostgreSQL optimistic locking on ticket_tiers.version
 */
export async function holdSeats(userId: string, req: HoldRequest): Promise<HoldResponse> {
  const quantity = req.seatIds?.length || req.quantity || 1;
  const holdTTL = config.holdTTLSeconds;

  // Layer 1: Acquire Redis seat locks
  if (req.seatIds) {
    for (const seatId of req.seatIds) {
      const acquired = await acquireSeatLock(req.eventId, seatId, userId, holdTTL);
      if (!acquired) {
        // Rollback any acquired locks
        for (const prev of req.seatIds) {
          if (prev === seatId) break;
          await releaseSeatLock(req.eventId, prev);
        }
        throw new Error(`Seat ${seatId} is unavailable`);
      }
    }
  }

  // Layer 2: Optimistic lock on ticket tier inventory
  const tier = await prisma.ticketTier.findUnique({ where: { id: req.ticketTierId } });
  if (!tier) {
    await releaseAllSeats(req.eventId, req.seatIds);
    throw new Error('Ticket tier not found');
  }

  const available = tier.quantityTotal - tier.quantitySold - tier.quantityHeld;
  if (available < quantity) {
    await releaseAllSeats(req.eventId, req.seatIds);
    throw new Error('Insufficient inventory');
  }

  // Optimistic lock update
  const updated = await prisma.$executeRaw`
    UPDATE events.ticket_tiers
    SET quantity_held = quantity_held + ${quantity}, version = version + 1
    WHERE id = ${req.ticketTierId}::uuid
    AND quantity_sold + quantity_held + ${quantity} <= quantity_total
    AND version = ${tier.version}`;

  if (updated === 0) {
    await releaseAllSeats(req.eventId, req.seatIds);
    throw new Error('Inventory conflict — please retry');
  }

  // Create booking
  const holdExpiresAt = new Date(Date.now() + holdTTL * 1000);
  const totalAmount = Number(tier.price) * quantity;
  const bookingId = uuidv4();

  await prisma.booking.create({
    data: {
      id: bookingId,
      userId,
      eventId: req.eventId,
      status: 'held',
      totalAmount,
      promoCode: req.promoCode,
      holdExpiresAt,
      tickets: {
        create: Array.from({ length: quantity }, (_, i) => ({
          ticketTierId: req.ticketTierId,
          seatId: req.seatIds?.[i] || null,
          qrCode: `QR-${uuidv4()}`,
          status: 'held',
        })),
      },
    },
  });

  await setBookingHold(bookingId, holdTTL);

  await publishEvent('booking.held', bookingId, {
    bookingId, userId, eventId: req.eventId, status: 'held', amount: totalAmount,
  });

  logger.info({ bookingId, userId, quantity }, 'Seats held');
  return { bookingId, status: 'held', holdExpiresAt, totalAmount, currency: 'USD' };
}

export async function confirmBooking(userId: string, bookingId: string): Promise<void> {
  const booking = await prisma.booking.findUnique({ where: { id: bookingId } });
  if (!booking) throw new Error('Booking not found');
  if (booking.userId !== userId) throw new Error('Unauthorized');
  if (booking.status !== 'held') throw new Error(`Booking is in '${booking.status}' state`);

  // Optimistic lock update
  const updated = await prisma.$executeRaw`
    UPDATE bookings.bookings SET status = 'confirmed', version = version + 1, updated_at = NOW()
    WHERE id = ${bookingId}::uuid AND version = ${booking.version}`;

  if (updated === 0) throw new Error('Optimistic lock conflict');

  // Move held → sold on tier
  await prisma.$executeRaw`
    UPDATE events.ticket_tiers
    SET quantity_sold = quantity_sold + (SELECT count(*) FROM bookings.tickets WHERE booking_id = ${bookingId}::uuid),
        quantity_held = quantity_held - (SELECT count(*) FROM bookings.tickets WHERE booking_id = ${bookingId}::uuid),
        version = version + 1
    WHERE id = (SELECT ticket_tier_id FROM bookings.tickets WHERE booking_id = ${bookingId}::uuid LIMIT 1)::uuid`;

  // Update all tickets
  await prisma.ticket.updateMany({ where: { bookingId }, data: { status: 'active' } });

  await clearBookingHold(bookingId);

  await publishEvent('booking.confirmed', bookingId, {
    bookingId, userId, eventId: booking.eventId, status: 'confirmed', amount: Number(booking.totalAmount),
  });

  logger.info({ bookingId }, 'Booking confirmed');
}

export async function cancelBooking(userId: string, bookingId: string): Promise<void> {
  const booking = await prisma.booking.findUnique({ where: { id: bookingId }, include: { tickets: true } });
  if (!booking) throw new Error('Booking not found');
  if (booking.userId !== userId) throw new Error('Unauthorized');
  if (!['held', 'confirmed'].includes(booking.status)) throw new Error(`Cannot cancel in '${booking.status}' state`);

  const updated = await prisma.$executeRaw`
    UPDATE bookings.bookings SET status = 'cancelled', version = version + 1, updated_at = NOW()
    WHERE id = ${bookingId}::uuid AND version = ${booking.version}`;
  if (updated === 0) throw new Error('Optimistic lock conflict');

  // Release inventory
  const ticketCount = booking.tickets.length;
  if (booking.status === 'held') {
    await prisma.$executeRaw`
      UPDATE events.ticket_tiers SET quantity_held = GREATEST(quantity_held - ${ticketCount}, 0), version = version + 1
      WHERE id = ${booking.tickets[0]?.ticketTierId}::uuid`;
  } else {
    await prisma.$executeRaw`
      UPDATE events.ticket_tiers SET quantity_sold = GREATEST(quantity_sold - ${ticketCount}, 0), version = version + 1
      WHERE id = ${booking.tickets[0]?.ticketTierId}::uuid`;
  }

  await prisma.ticket.updateMany({ where: { bookingId }, data: { status: 'cancelled' } });
  await clearBookingHold(bookingId);

  await publishEvent('booking.cancelled', bookingId, {
    bookingId, userId, eventId: booking.eventId, status: 'cancelled',
  });

  logger.info({ bookingId }, 'Booking cancelled');
}

export async function getBooking(bookingId: string) {
  return prisma.booking.findUnique({ where: { id: bookingId }, include: { tickets: true } });
}

export async function listUserBookings(userId: string, limit: number, offset: number) {
  const [bookings, total] = await Promise.all([
    prisma.booking.findMany({
      where: { userId }, include: { tickets: true },
      orderBy: { createdAt: 'desc' }, take: limit, skip: offset,
    }),
    prisma.booking.count({ where: { userId } }),
  ]);
  return { bookings, total };
}

async function releaseAllSeats(eventId: string, seatIds?: string[]) {
  if (seatIds) {
    for (const seatId of seatIds) await releaseSeatLock(eventId, seatId);
  }
}
