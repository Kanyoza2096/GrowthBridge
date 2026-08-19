import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../api-client';

export function useBlogPosts() {
  return useQuery({
    queryKey: ['blog-posts'],
    queryFn: () => apiClient.getBlogPosts(),
    staleTime: 1000 * 60 * 10,
  });
}

export function useBlogPostBySlug(slug: string) {
  return useQuery({
    queryKey: ['blog-posts', slug],
    queryFn: () => apiClient.getBlogPostBySlug(slug),
    enabled: Boolean(slug),
  });
}
