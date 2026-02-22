import type { EventsResponse, SearchParams } from '@ticketing/types';
import { apiClient } from './client';

export const searchApi = {
  searchEvents: async (params: SearchParams): Promise<EventsResponse> => {
    const response = await apiClient.get<EventsResponse>('/api/v1/search/events', { params });
    return response.data;
  },

  suggest: async (query: string): Promise<{ suggestions: string[] }> => {
    const response = await apiClient.get<{ suggestions: string[] }>('/api/v1/search/suggest', {
      params: { q: query },
    });
    return response.data;
  },
};
