export type BookingStatus = 'held' | 'confirmed' | 'cancelled' | 'refunded';
export type TicketStatus = 'held' | 'active' | 'used' | 'cancelled' | 'transferred';

export interface Ticket {
  id: string;
  bookingId: string;
  ticketTierId: string;
  seatId?: string;
  qrCode: string;
  status: TicketStatus;
  createdAt: string;
}

export interface Booking {
  id: string;
  userId: string;
  eventId: string;
  status: BookingStatus;
  totalAmount: number;
  promoCode?: string;
  discountAmount: number;
  holdExpiresAt?: string;
  tickets: Ticket[];
  createdAt: string;
  updatedAt: string;
}

export interface HoldSeatsDTO {
  eventId: string;
  ticketTierId: string;
  seatIds?: string[];
  quantity?: number;
  promoCode?: string;
}

export interface ConfirmBookingDTO {
  bookingId: string;
  paymentId: string;
}

export interface BookingFilters {
  status?: BookingStatus;
  eventId?: string;
  limit?: number;
  offset?: number;
}

export interface BookingsResponse {
  bookings: Booking[];
  total: number;
}
