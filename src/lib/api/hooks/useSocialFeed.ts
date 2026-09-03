import { useQuery } from '@tanstack/react-query';
import type { SocialFeedItem, SocialPlatform } from '@/lib/types/social-feed';

async function fetchSocialFeed(
  platformFilter: SocialPlatform | 'all',
  limit?: number
): Promise<SocialFeedItem[]> {
  const params = new URLSearchParams();
  if (platformFilter && platformFilter !== 'all') params.set('platform', platformFilter);
  if (limit) params.set('limit', String(limit));
  const qs = params.toString();
  const res = await fetch(`/api/public/social-feed${qs ? `?${qs}` : ''}`);
  if (!res.ok) return [];
  const json = await res.json();
  return (json?.data as SocialFeedItem[]) || [];
}

export function useSocialFeed(platformFilter: SocialPlatform | 'all' = 'all', limit?: number) {
  return useQuery<SocialFeedItem[]>({
    queryKey: ['socialFeed', platformFilter, limit],
    queryFn: () => fetchSocialFeed(platformFilter, limit),
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  });
}
