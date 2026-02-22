export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

export const STRIPE_PUBLISHABLE_KEY = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || '';

export const EVENT_GENRES = [
  'music',
  'sports',
  'theater',
  'comedy',
  'conference',
  'festival',
  'exhibition',
  'workshop',
  'other',
] as const;

export const BOOKING_STATUS_LABELS = {
  held: 'Reserved',
  confirmed: 'Confirmed',
  cancelled: 'Cancelled',
  refunded: 'Refunded',
} as const;

export const EVENT_STATUS_LABELS = {
  draft: 'Draft',
  published: 'Published',
  cancelled: 'Cancelled',
  completed: 'Completed',
} as const;

export const HOLD_EXPIRY_MINUTES = 5;

export const MAX_TICKETS_PER_ORDER = 10;

export const ROUTES = {
  home: '/',
  events: '/events',
  eventDetail: (id: string) => `/events/${id}`,
  login: '/login',
  register: '/register',
  cart: '/cart',
  checkout: '/checkout',
  checkoutSuccess: '/checkout/success',
  bookings: '/bookings',
  bookingDetail: (id: string) => `/bookings/${id}`,
  profile: '/profile',
  organizerDashboard: '/organizer',
  createEvent: '/organizer/events/create',
  editEvent: (id: string) => `/organizer/events/${id}/edit`,
  adminDashboard: '/admin',
  userManagement: '/admin/users',
} as const;
