import { useMutation, useQuery, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import { eventsApi } from '../api/events.api';
import type { EventFilters, CreateEventDTO, UpdateEventDTO } from '@ticketing/types';

export const eventKeys = {
  all: ['events'] as const,
  lists: () => [...eventKeys.all, 'list'] as const,
  list: (filters: EventFilters) => [...eventKeys.lists(), filters] as const,
  details: () => [...eventKeys.all, 'detail'] as const,
  detail: (id: string) => [...eventKeys.details(), id] as const,
  featured: () => [...eventKeys.all, 'featured'] as const,
  myEvents: () => [...eventKeys.all, 'my-events'] as const,
};

export function useEvents(filters: EventFilters = {}) {
  return useQuery({
    queryKey: eventKeys.list(filters),
    queryFn: () => eventsApi.list(filters),
    placeholderData: keepPreviousData,
  });
}

export function useEvent(id: string) {
  return useQuery({
    queryKey: eventKeys.detail(id),
    queryFn: () => eventsApi.getById(id),
    enabled: !!id,
  });
}

export function useFeaturedEvents() {
  return useQuery({
    queryKey: eventKeys.featured(),
    queryFn: () => eventsApi.list({ status: 'published', limit: 6 }),
    staleTime: 1000 * 60 * 5,
  });
}

export function useMyEvents() {
  return useQuery({
    queryKey: eventKeys.myEvents(),
    queryFn: eventsApi.getMyEvents,
  });
}

export function useCreateEvent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateEventDTO) => eventsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: eventKeys.myEvents() });
    },
  });
}

export function useUpdateEvent(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateEventDTO) => eventsApi.update(id, data),
    onSuccess: (updatedEvent) => {
      queryClient.setQueryData(eventKeys.detail(id), updatedEvent);
      queryClient.invalidateQueries({ queryKey: eventKeys.myEvents() });
    },
  });
}

export function usePublishEvent(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => eventsApi.publish(id),
    onSuccess: (updatedEvent) => {
      queryClient.setQueryData(eventKeys.detail(id), updatedEvent);
      queryClient.invalidateQueries({ queryKey: eventKeys.lists() });
    },
  });
}

export function useCancelEvent(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => eventsApi.cancel(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: eventKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: eventKeys.myEvents() });
    },
  });
}
