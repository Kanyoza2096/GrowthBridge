import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../api-client';

export function useStats() {
  return useQuery({
    queryKey: ['stats'],
    queryFn: () => apiClient.getStats(),
    staleTime: 1000 * 60 * 30, // 30 mins
  });
}

export function useTestimonials() {
  return useQuery({
    queryKey: ['testimonials'],
    queryFn: () => apiClient.getTestimonials(),
    staleTime: 1000 * 60 * 30,
  });
}
