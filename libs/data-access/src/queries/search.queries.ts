import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { searchApi } from '../api/search.api';
import type { SearchParams } from '@ticketing/types';

export const searchKeys = {
  all: ['search'] as const,
  events: (params: SearchParams) => [...searchKeys.all, 'events', params] as const,
  suggestions: (query: string) => [...searchKeys.all, 'suggest', query] as const,
};

export function useSearchEvents(params: SearchParams) {
  return useQuery({
    queryKey: searchKeys.events(params),
    queryFn: () => searchApi.searchEvents(params),
    enabled: !!(params.q || params.genre || params.city),
    placeholderData: keepPreviousData,
  });
}

export function useSearchSuggestions(query: string) {
  return useQuery({
    queryKey: searchKeys.suggestions(query),
    queryFn: () => searchApi.suggest(query),
    enabled: query.length >= 2,
    staleTime: 1000 * 60, // 1 minute
  });
}
