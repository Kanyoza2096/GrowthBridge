import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../api-client';
import type { PeopleQueryParams } from '@/lib/types';

export function usePeople(params: PeopleQueryParams = {}) {
  return useQuery({
    queryKey: ['people', params],
    queryFn: () => apiClient.getPeople(params),
    staleTime: 1000 * 60 * 5,
  });
}

export function usePersonBySlug(slug: string) {
  return useQuery({
    queryKey: ['person', 'slug', slug],
    queryFn: () => apiClient.getPersonBySlug(slug),
    enabled: Boolean(slug),
  });
}

export function usePersonById(id: string) {
  return useQuery({
    queryKey: ['person', 'id', id],
    queryFn: () => (apiClient.getPersonById ? apiClient.getPersonById(id) : null),
    enabled: Boolean(id),
  });
}
