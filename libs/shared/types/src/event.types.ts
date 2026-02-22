export type EventStatus = 'draft' | 'published' | 'cancelled' | 'completed';

export interface TicketTier {
  id: string;
  eventId: string;
  name: string;
  price: number;
  quantityTotal: number;
  quantitySold: number;
  quantityHeld: number;
  saleStart?: string;
  saleEnd?: string;
}

export interface Venue {
  id: string;
  name: string;
  address: string;
  city: string;
  country: string;
  latitude?: number;
  longitude?: number;
  totalCapacity: number;
}

export interface Event {
  id: string;
  organizerId: string;
  venueId?: string;
  title: string;
  description?: string;
  genre?: string;
  imageUrl?: string;
  startTime: string;
  endTime: string;
  status: EventStatus;
  metadata: Record<string, unknown>;
  ticketTiers: TicketTier[];
  venue?: Venue;
  createdAt: string;
  updatedAt: string;
}

export interface EventFilters {
  genre?: string;
  status?: EventStatus;
  city?: string;
  fromDate?: string;
  toDate?: string;
  minPrice?: number;
  maxPrice?: number;
  limit?: number;
  offset?: number;
}

export interface SearchParams {
  q?: string;
  genre?: string;
  city?: string;
  minPrice?: number;
  maxPrice?: number;
  fromDate?: string;
  toDate?: string;
  limit?: number;
  offset?: number;
}

export interface CreateEventDTO {
  title: string;
  description?: string;
  genre?: string;
  venueId?: string;
  startTime: string;
  endTime: string;
  ticketTiers: CreateTicketTierDTO[];
  metadata?: Record<string, unknown>;
}

export interface CreateTicketTierDTO {
  name: string;
  price: number;
  quantityTotal: number;
  saleStart?: string;
  saleEnd?: string;
}

export interface UpdateEventDTO {
  title?: string;
  description?: string;
  genre?: string;
  venueId?: string;
  startTime?: string;
  endTime?: string;
  metadata?: Record<string, unknown>;
}

export interface EventsResponse {
  events: Event[];
  total: number;
}
