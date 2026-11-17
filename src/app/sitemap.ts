import type { MetadataRoute } from 'next';
import { createAdminClient } from '@/lib/supabase/server';
import { publicConfig } from '@/lib/config/public';

const SITE_URL = new URL(publicConfig.NEXT_PUBLIC_SITE_URL).origin;
const PAGE_SIZE = 1000;

// Regenerate the sitemap at request time so newly published content is discoverable
// without requiring an application deployment.
export const dynamic = 'force-dynamic';

type PageResult<T> = { data: T[] | null; error: unknown };

async function fetchAllRows<T>(
  fetchPage: (from: number, to: number) => Promise<PageResult<T>>
): Promise<T[]> {
  const rows: T[] = [];
  for (let from = 0; ; from += PAGE_SIZE) {
    const { data, error } = await fetchPage(from, from + PAGE_SIZE - 1);
    if (error) throw error;
    const page = data ?? [];
    rows.push(...page);
    if (page.length < PAGE_SIZE) return rows;
  }
}

/**
 * Dynamic sitemap: published public content is read from the canonical database.
 * Any failed content query falls back to the complete static route list rather
 * than silently returning a partially populated sitemap.
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
      fetchAllRows((from, to) => supabase.from('blog_posts')
        .select('slug, published_at, updated_at')
        .eq('status', 'published')
        .is('deleted_at', null)
        .order('slug')
        .range(from, to)),
      fetchAllRows((from, to) => supabase.from('projects')
        .select('slug, updated_at')
        .eq('status', 'published')
        .is('deleted_at', null)
        .order('slug')
        .range(from, to)),
      fetchAllRows((from, to) => supabase.from('services')
        .select('slug, updated_at')
        .eq('status', 'published')
        .is('deleted_at', null)
        .order('slug')
        .range(from, to)),
      fetchAllRows((from, to) => supabase.from('people')
        .select('slug, updated_at')
        .eq('active', true)
        .is('deleted_at', null)
        .order('slug')
        .range(from, to)),
    ]);

    return [
      ...staticPages,
      ...blogs.map((row) => ({
        url: `${SITE_URL}/blog/${encodeURIComponent(row.slug)}`,
        lastModified: row.updated_at || row.published_at || undefined,
        changeFrequency: 'monthly' as const,
        priority: 0.7,
      })),
      ...projects.map((row) => ({
        url: `${SITE_URL}/projects/${encodeURIComponent(row.slug)}`,
        lastModified: row.updated_at || undefined,
        changeFrequency: 'monthly' as const,
        priority: 0.6,
      })),
      ...services.map((row) => ({
        url: `${SITE_URL}/services/${encodeURIComponent(row.slug)}`,
        lastModified: row.updated_at || undefined,
        changeFrequency: 'monthly' as const,
        priority: 0.7,
      })),
      ...people.map((row) => ({
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
