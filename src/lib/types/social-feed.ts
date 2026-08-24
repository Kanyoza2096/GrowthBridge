export type SocialPlatform = 'linkedin' | 'twitter' | 'facebook' | 'instagram' | 'youtube';

export interface SocialFeedItem {
  id: string;
  platform: SocialPlatform;
  authorName: string;
  authorHandle: string;
  authorAvatar: string;
  verified?: boolean;
  content: string;
  mediaUrl?: string;
  mediaType?: 'image' | 'video';
  publishedAt: string;
  likesCount: number;
  commentsCount: number;
  sharesCount?: number;
  postUrl: string;
  tags?: string[];
}

export interface SocialFeedQueryParams {
  platform?: SocialPlatform | 'all';
  limit?: number;
}
