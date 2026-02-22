import Redis from 'ioredis';
import { config } from '../config';
import logger from '../utils/logger';

export const redis = new Redis({
  host: config.redis.host,
  port: config.redis.port,
  password: config.redis.password || undefined,
  retryStrategy: (times) => Math.min(times * 500, 5000),
  lazyConnect: true,
});

redis.on('connect', () => logger.info('Redis connected'));
redis.on('error', (err) => logger.error({ err }, 'Redis error'));

/**
 * Acquire a distributed lock for a seat using SETNX
 */
export async function acquireSeatLock(eventId: string, seatId: string, userId: string, ttl: number): Promise<boolean> {
  const key = `lock:seat:${eventId}:${seatId}`;
  const result = await redis.set(key, userId, 'EX', ttl, 'NX');
  return result === 'OK';
}

export async function releaseSeatLock(eventId: string, seatId: string): Promise<void> {
  await redis.del(`lock:seat:${eventId}:${seatId}`);
}

export async function setBookingHold(bookingId: string, ttl: number): Promise<void> {
  await redis.set(`hold:booking:${bookingId}`, 'active', 'EX', ttl);
}

export async function clearBookingHold(bookingId: string): Promise<void> {
  await redis.del(`hold:booking:${bookingId}`);
}

export async function checkIdempotencyKey(key: string): Promise<string | null> {
  return redis.get(`idempotency:${key}`);
}

export async function setIdempotencyKey(key: string, response: string, ttl: number): Promise<void> {
  await redis.set(`idempotency:${key}`, response, 'EX', ttl);
}
