import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import type { SocialFeedItem, SocialPlatform } from '@/lib/types/social-feed';
import { serverConfig } from '@/lib/config/server';

const socialFeedItemSchema = z.object({
  id: z.string().min(1).max(200),
  platform: z.enum(['linkedin', 'twitter', 'instagram', 'youtube', 'facebook']),
  authorName: z.string().min(1).max(200),
  authorHandle: z.string().max(200).optional(),
  authorAvatar: z.string().url().or(z.literal('')).optional(),
  verified: z.boolean().optional(),
  content: z.string().max(5000),
  publishedAt: z.string().datetime(),
  likesCount: z.number().int().min(0).max(1_000_000_000).optional(),
  commentsCount: z.number().int().min(0).max(1_000_000_000).optional(),
  sharesCount: z.number().int().min(0).max(1_000_000_000).optional(),
  mediaUrl: z.string().url().optional(),
  mediaType: z.enum(['image', 'video']).optional(),
  postUrl: z.string().url().or(z.string().startsWith('/')).optional(),
  tags: z.array(z.string().max(100)).max(20).optional(),
});

const socialFeedResponseSchema = z.array(socialFeedItemSchema).max(100);

async function fetchConfiguredFeed(): Promise<SocialFeedItem[]> {
  if (!serverConfig.SOCIAL_FEED_API_URL) return [];

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 2500);
  try {
    const response = await fetch(serverConfig.SOCIAL_FEED_API_URL, {
      signal: controller.signal,
      headers: { Accept: 'application/json' },
    });
    if (!response.ok) return [];
    const parsed = socialFeedResponseSchema.safeParse(await response.json());
    if (!parsed.success) return [];
    return parsed.data.map((item) => ({
      ...item,
      authorHandle: item.authorHandle || '',
      authorAvatar: item.authorAvatar || '',
      likesCount: item.likesCount ?? 0,
      commentsCount: item.commentsCount ?? 0,
    }));
  } catch {
    return [];
  } finally {
    clearTimeout(timeout);
  }
}

/**
 * Public social aggregator. It consumes a configured public JSON feed.
 * No synthetic engagement counts, fabricated posts, or provider impersonation.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const platform = (searchParams.get('platform') || 'all') as SocialPlatform | 'all';
  const limit = Math.min(Number(searchParams.get('limit') || 12) || 12, 24);

  let items = await fetchConfiguredFeed();

  if (platform !== 'all') items = items.filter((item) => item.platform === platform);

  return NextResponse.json(
    { success: true, data: items.slice(0, limit) },
    { headers: { 'Cache-Control': 'public, s-maxage=120, stale-while-revalidate=600' } }
  );
}
