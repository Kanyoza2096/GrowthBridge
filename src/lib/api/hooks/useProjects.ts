import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../api-client';

export function useProjects() {
  return useQuery({
    queryKey: ['projects'],
    queryFn: () => apiClient.getProjects(),
    staleTime: 1000 * 60 * 10,
  });
}

export function useProjectBySlug(slug: string) {
  return useQuery({
    queryKey: ['projects', slug],
    queryFn: () => apiClient.getProjectBySlug(slug),
    enabled: Boolean(slug),
  });
}
