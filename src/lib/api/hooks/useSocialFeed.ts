import { useQuery } from '@tanstack/react-query';
import { getBackendProvider } from '../providers';
import type { SocialFeedItem, SocialPlatform } from '@/lib/types/social-feed';

export function useSocialFeed(platformFilter: SocialPlatform | 'all' = 'all', limit?: number) {
  return useQuery<SocialFeedItem[]>({
    queryKey: ['socialFeed', platformFilter, limit],
    queryFn: async () => {
      const provider = getBackendProvider();
      if (!provider.getSocialFeed) return [];
      return provider.getSocialFeed({ platform: platformFilter, limit });
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: false,
  });
}
