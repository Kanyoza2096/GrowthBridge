import { createHash, timingSafeEqual } from 'node:crypto';
import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function bearerMatches(request: NextRequest, expected: string): boolean {
  const supplied = request.headers.get('authorization')?.replace(/^Bearer\s+/i, '') || '';
  if (!expected || supplied.length !== expected.length) return false;
  return timingSafeEqual(Buffer.from(supplied), Buffer.from(expected));
}

function text(value: unknown, max = 1200): string {
  return typeof value === 'string' ? value.slice(0, max) : '';
}

function jsonList(value: unknown, max = 20): unknown[] {
  return Array.isArray(value) ? value.slice(0, max) : [];
}

export async function GET(request: NextRequest) {
  const token = process.env.KDO_WEBSITE_CONNECTOR_TOKEN || '';
  const workspaceId = process.env.KDO_WEBSITE_CONNECTOR_WORKSPACE_ID || '';
  if (!token || !workspaceId) {
    return NextResponse.json({ ok: false, error: 'KDO Website Connector is not configured' }, { status: 503, headers: { 'Cache-Control': 'no-store' } });
  }
  if (!bearerMatches(request, token)) {
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401, headers: { 'Cache-Control': 'no-store' } });
  }

  try {
    const admin = createAdminClient();
    const [settingsResult, servicesResult, projectsResult, blogsResult, testimonialsResult] = await Promise.all([
      admin.from('site_settings').select('value, updated_at').eq('key', 'general').maybeSingle(),
      admin.from('services').select('id, slug, title, division, tagline, description, features, benefits, seo_title, seo_description, seo_keywords, updated_at').eq('status', 'published').is('deleted_at', null).order('display_order', { ascending: true }).limit(30),
      admin.from('projects').select('id, slug, title, category, description, short_description, technologies, impact, service_division, start_date, completed_at, updated_at').eq('status', 'published').is('deleted_at', null).order('published_at', { ascending: false }).limit(20),
      admin.from('blog_posts').select('id, slug, title, excerpt, category, tags, published_at, updated_at').eq('status', 'published').is('deleted_at', null).order('published_at', { ascending: false }).limit(30),
      admin.from('testimonials').select('id, quote, author_name, author_role, author_organization, rating, project_id, service_id').eq('status', 'approved').order('created_at', { ascending: false }).limit(20),
    ]);

    const failure = [settingsResult, servicesResult, projectsResult, blogsResult, testimonialsResult].find((result) => result.error);
    if (failure?.error) {
      console.error('[KDO context] read failed', failure.error.message);
      return NextResponse.json({ ok: false, error: 'Unable to retrieve website context' }, { status: 500, headers: { 'Cache-Control': 'no-store' } });
    }

    const settings = (settingsResult.data?.value || {}) as Record<string, any>;
    const organization = settings.organization || {};
    const homepage = settings.homepage || {};
    const seo = settings.seo || {};
    const context = {
      schema_version: '1.0',
      integration: 'growthbridge',
      workspace_id: workspaceId,
      generated_at: new Date().toISOString(),
      source_updated_at: settingsResult.data?.updated_at || null,
      website: {
        organization: {
          name: text(organization.name, 160),
          tagline: text(organization.tagline, 240),
          description: text(organization.description, 1200),
        },
        homepage: {
          hero_headline: text(homepage.heroHeadline, 240),
          hero_subheadline: text(homepage.heroSubheadline, 600),
        },
        seo: {
          default_title: text(seo.defaultTitle, 240),
          default_description: text(seo.defaultDescription, 600),
          default_keywords: jsonList(seo.defaultKeywords, 30).filter((item): item is string => typeof item === 'string').map((item) => item.slice(0, 80)),
        },
      },
      services: (servicesResult.data || []).map((row) => ({
        id: row.id, slug: row.slug, title: text(row.title, 160), division: text(row.division, 120),
        tagline: text(row.tagline, 240), description: text(row.description, 1600),
        features: jsonList(row.features), benefits: jsonList(row.benefits),
        seo_title: text(row.seo_title, 240), seo_description: text(row.seo_description, 600),
        seo_keywords: jsonList(row.seo_keywords, 30), updated_at: row.updated_at,
      })),
      projects: (projectsResult.data || []).map((row) => ({
        id: row.id, slug: row.slug, title: text(row.title, 180), category: text(row.category, 120),
        description: text(row.description, 1600), short_description: text(row.short_description, 400),
        technologies: jsonList(row.technologies), impact: row.impact || null,
        service_division: text(row.service_division, 120), start_date: row.start_date,
        completed_at: row.completed_at, updated_at: row.updated_at,
      })),
      published_articles: (blogsResult.data || []).map((row) => ({
        id: row.id, slug: row.slug, title: text(row.title, 180), excerpt: text(row.excerpt, 600),
        category: text(row.category, 100), tags: jsonList(row.tags, 30),
        published_at: row.published_at, updated_at: row.updated_at,
      })),
      approved_testimonials: (testimonialsResult.data || []).map((row) => ({
        id: row.id, quote: text(row.quote, 1000), author_name: text(row.author_name, 120),
        author_role: text(row.author_role, 120), author_organization: text(row.author_organization, 160),
        rating: row.rating, project_id: row.project_id, service_id: row.service_id,
      })),
    };

    const body = JSON.stringify({ ok: true, context });
    const etag = '"' + createHash('sha256').update(body).digest('hex') + '"';
    const headers = { 'Cache-Control': 'private, no-store', ETag: etag, Vary: 'Authorization' };
    if (request.headers.get('if-none-match') === etag) {
      return new NextResponse(null, { status: 304, headers });
    }
    return new NextResponse(body, { status: 200, headers: { ...headers, 'Content-Type': 'application/json' } });
  } catch (error) {
    console.error('[KDO context] unexpected read failure', error instanceof Error ? error.message : 'unknown');
    return NextResponse.json({ ok: false, error: 'Unable to retrieve website context' }, { status: 500, headers: { 'Cache-Control': 'no-store' } });
  }
}
