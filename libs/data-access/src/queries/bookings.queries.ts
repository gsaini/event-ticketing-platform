import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { bookingsApi } from '../api/bookings.api';
import { cartKeys } from './cart.queries';
import type { BookingFilters, HoldSeatsDTO, ConfirmBookingDTO } from '@ticketing/types';

export const bookingKeys = {
  all: ['bookings'] as const,
  lists: () => [...bookingKeys.all, 'list'] as const,
  list: (filters?: BookingFilters) => [...bookingKeys.lists(), filters] as const,
  details: () => [...bookingKeys.all, 'detail'] as const,
  detail: (id: string) => [...bookingKeys.details(), id] as const,
  eventBookings: (eventId: string) => [...bookingKeys.all, 'event', eventId] as const,
};

export function useMyBookings(filters?: BookingFilters) {
  return useQuery({
    queryKey: bookingKeys.list(filters),
    queryFn: () => bookingsApi.listUserBookings(filters),
  });
}

export function useBooking(id: string) {
  return useQuery({
    queryKey: bookingKeys.detail(id),
    queryFn: () => bookingsApi.getById(id),
    enabled: !!id,
  });
}

export function useEventBookings(eventId: string, filters?: BookingFilters) {
  return useQuery({
    queryKey: bookingKeys.eventBookings(eventId),
    queryFn: () => bookingsApi.getEventBookings(eventId, filters),
    enabled: !!eventId,
  });
}

export function useHoldSeats() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: HoldSeatsDTO) => bookingsApi.hold(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: cartKeys.current() });
    },
  });
}

export function useConfirmBooking() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: ConfirmBookingDTO) => bookingsApi.confirm(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: bookingKeys.lists() });
      queryClient.invalidateQueries({ queryKey: cartKeys.current() });
    },
  });
}

export function useCancelBooking(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => bookingsApi.cancel(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: bookingKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: bookingKeys.lists() });
    },
  });
}
