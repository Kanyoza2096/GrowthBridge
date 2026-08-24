import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../api-client';

export function useServices() {
  return useQuery({
    queryKey: ['services'],
    queryFn: () => apiClient.getServices(),
    staleTime: 1000 * 60 * 10, // 10 mins
  });
}

export function useServiceBySlug(slug: string) {
  return useQuery({
    queryKey: ['services', slug],
    queryFn: () => apiClient.getServiceBySlug(slug),
    enabled: Boolean(slug),
  });
}
