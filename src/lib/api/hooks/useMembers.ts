import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../api-client';

export function useMembers() {
  return useQuery({
    queryKey: ['members'],
    queryFn: () => apiClient.getMembers(),
    staleTime: 1000 * 60 * 10,
  });
}

export function useMemberBySlug(slug: string) {
  return useQuery({
    queryKey: ['members', slug],
    queryFn: () => apiClient.getMemberBySlug(slug),
    enabled: Boolean(slug),
  });
}
