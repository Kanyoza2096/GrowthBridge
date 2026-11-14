import type { BlogPost } from '@/lib/types/admin';

type BlogAuthorValue = string | { name?: string | null } | null | undefined;

/**
 * Converts the public BlogRepository shape into the flat admin CMS contract.
 * Keep this boundary explicit: public pages use an author object, while the
 * admin editor expects a plain author string.
 */
export function toAdminBlogPost(value: Record<string, unknown>): BlogPost {
  const author = value.author as BlogAuthorValue;
  const authorName = typeof author === 'string'
    ? author
    : author && typeof author === 'object' ? author.name : undefined;

  return {
    id: String(value.id ?? ''),
    slug: String(value.slug ?? ''),
    title: String(value.title ?? ''),
    excerpt: String(value.excerpt ?? ''),
    content: String(value.content ?? ''),
    author: authorName?.trim() || 'GrowthBridge Team',
    authorId: String(value.authorId ?? ''),
    coverImage: typeof value.coverImage === 'string'
      ? value.coverImage
      : typeof value.image === 'string' ? value.image : undefined,
    tags: Array.isArray(value.tags) ? value.tags.filter((tag): tag is string => typeof tag === 'string') : [],
    category: String(value.category ?? 'General'),
    status: value.status === 'scheduled' || value.status === 'published' || value.status === 'archived'
      ? value.status
      : 'draft',
    scheduledAt: typeof value.scheduledAt === 'string' ? value.scheduledAt : undefined,
    publishedAt: typeof value.publishedAt === 'string' ? value.publishedAt : undefined,
    createdAt: typeof value.createdAt === 'string' ? value.createdAt : '',
    updatedAt: typeof value.updatedAt === 'string' ? value.updatedAt : '',
  };
}
