import type { MetadataRoute } from 'next';
import { createAdminClient } from '@/lib/supabase/server';

const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'https://growthbridge.org').replace(/\/$/, '');

/**
 * Dynamic sitemap: public content changes without requiring a deployment.
 * Only published/active public records are emitted.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPages: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`, changeFrequency: 'daily', priority: 1 },
    { url: `${SITE_URL}/about`, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${SITE_URL}/contact`, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${SITE_URL}/blog`, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${SITE_URL}/projects`, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${SITE_URL}/services`, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${SITE_URL}/team`, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${SITE_URL}/talent-hub`, changeFrequency: 'weekly', priority: 0.7 },
    { url: `${SITE_URL}/privacy`, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${SITE_URL}/terms`, changeFrequency: 'yearly', priority: 0.3 },
  ];

  try {
    const supabase = createAdminClient();
    const [blogs, projects, services, people] = await Promise.all([
      supabase.from('blog_posts').select('slug, published_at, updated_at').eq('status', 'published').is('deleted_at', null),
      supabase.from('projects').select('slug, updated_at').eq('status', 'published').is('deleted_at', null),
      supabase.from('services').select('slug, updated_at').eq('status', 'published').is('deleted_at', null),
      supabase.from('people').select('slug, updated_at').eq('active', true).is('deleted_at', null),
    ]);

    return [
      ...staticPages,
      ...(blogs.data || []).map((row) => ({
        url: `${SITE_URL}/blog/${encodeURIComponent(row.slug)}`,
        lastModified: row.updated_at || row.published_at || undefined,
        changeFrequency: 'monthly' as const,
        priority: 0.7,
      })),
      ...(projects.data || []).map((row) => ({
        url: `${SITE_URL}/projects/${encodeURIComponent(row.slug)}`,
        lastModified: row.updated_at || undefined,
        changeFrequency: 'monthly' as const,
        priority: 0.6,
      })),
      ...(services.data || []).map((row) => ({
        url: `${SITE_URL}/services/${encodeURIComponent(row.slug)}`,
        lastModified: row.updated_at || undefined,
        changeFrequency: 'monthly' as const,
        priority: 0.7,
      })),
      ...(people.data || []).map((row) => ({
        url: `${SITE_URL}/team/${encodeURIComponent(row.slug)}`,
        lastModified: row.updated_at || undefined,
        changeFrequency: 'monthly' as const,
        priority: 0.5,
      })),
    ];
  } catch (error) {
    console.error('[sitemap] Dynamic content unavailable; returning static URLs.', error);
    return staticPages;
  }
}
