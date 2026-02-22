import { z } from 'zod';

export const emailSchema = z.string().email('Invalid email address');

export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .max(128, 'Password must be at most 128 characters');

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required'),
});

export const registerSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  firstName: z.string().min(1, 'First name is required').max(100),
  lastName: z.string().min(1, 'Last name is required').max(100),
  phone: z.string().optional(),
  role: z.enum(['attendee', 'organizer']).optional().default('attendee'),
});

export const updateProfileSchema = z.object({
  firstName: z.string().min(1).max(100).optional(),
  lastName: z.string().min(1).max(100).optional(),
  phone: z.string().optional(),
});

export const createEventSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  description: z.string().max(5000).optional(),
  genre: z.string().optional(),
  venueId: z.string().uuid().optional(),
  startTime: z.string().datetime(),
  endTime: z.string().datetime(),
  ticketTiers: z.array(
    z.object({
      name: z.string().min(1),
      price: z.number().min(0),
      quantityTotal: z.number().int().min(1),
      saleStart: z.string().datetime().optional(),
      saleEnd: z.string().datetime().optional(),
    })
  ).min(1, 'At least one ticket tier is required'),
});

export const addToCartSchema = z.object({
  eventId: z.string().uuid(),
  ticketTierId: z.string().uuid(),
  quantity: z.number().int().min(1).max(10),
  price: z.number().min(0),
});

export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;
export type UpdateProfileFormData = z.infer<typeof updateProfileSchema>;
export type CreateEventFormData = z.infer<typeof createEventSchema>;
export type AddToCartFormData = z.infer<typeof addToCartSchema>;
