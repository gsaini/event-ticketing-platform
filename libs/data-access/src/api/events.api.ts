import type { Event, EventFilters, EventsResponse, CreateEventDTO, UpdateEventDTO } from '@ticketing/types';
import { apiClient } from './client';

export const eventsApi = {
  list: async (filters?: EventFilters): Promise<EventsResponse> => {
    const response = await apiClient.get<EventsResponse>('/api/v1/events', { params: filters });
    return response.data;
  },

  getById: async (id: string): Promise<Event> => {
    const response = await apiClient.get<Event>(`/api/v1/events/${id}`);
    return response.data;
  },

  create: async (data: CreateEventDTO): Promise<Event> => {
    const response = await apiClient.post<Event>('/api/v1/events', data);
    return response.data;
  },

  update: async (id: string, data: UpdateEventDTO): Promise<Event> => {
    const response = await apiClient.put<Event>(`/api/v1/events/${id}`, data);
    return response.data;
  },

  publish: async (id: string): Promise<Event> => {
    const response = await apiClient.post<Event>(`/api/v1/events/${id}/publish`);
    return response.data;
  },

  cancel: async (id: string): Promise<void> => {
    await apiClient.delete(`/api/v1/events/${id}`);
  },

  getMyEvents: async (): Promise<EventsResponse> => {
    const response = await apiClient.get<EventsResponse>('/api/v1/events', {
      params: { organizer: 'me' },
    });
    return response.data;
  },
};
