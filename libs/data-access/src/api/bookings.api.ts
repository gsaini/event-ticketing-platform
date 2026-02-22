import type { Booking, BookingFilters, BookingsResponse, HoldSeatsDTO, ConfirmBookingDTO } from '@ticketing/types';
import { apiClient } from './client';

export const bookingsApi = {
  hold: async (data: HoldSeatsDTO): Promise<Booking> => {
    const response = await apiClient.post<Booking>('/api/v1/bookings/hold', data);
    return response.data;
  },

  confirm: async (data: ConfirmBookingDTO): Promise<{ status: string; bookingId: string }> => {
    const response = await apiClient.post<{ status: string; bookingId: string }>(
      '/api/v1/bookings/confirm',
      data
    );
    return response.data;
  },

  getById: async (id: string): Promise<Booking> => {
    const response = await apiClient.get<Booking>(`/api/v1/bookings/${id}`);
    return response.data;
  },

  listUserBookings: async (filters?: BookingFilters): Promise<BookingsResponse> => {
    const response = await apiClient.get<BookingsResponse>('/api/v1/bookings', { params: filters });
    return response.data;
  },

  cancel: async (id: string): Promise<{ status: string; bookingId: string }> => {
    const response = await apiClient.delete<{ status: string; bookingId: string }>(`/api/v1/bookings/${id}`);
    return response.data;
  },

  getEventBookings: async (eventId: string, filters?: BookingFilters): Promise<BookingsResponse> => {
    const response = await apiClient.get<BookingsResponse>(`/api/v1/events/${eventId}/bookings`, {
      params: filters,
    });
    return response.data;
  },
};
