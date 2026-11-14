import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';

const { createAdminClient } = vi.hoisted(() => ({ createAdminClient: vi.fn() }));
vi.mock('@/lib/supabase/server', () => ({ createAdminClient }));

import { GET } from './route';

function queryResult(data: unknown) {
  const result = Promise.resolve({ data, error: null });
  const query: any = {
    select: () => query,
    eq: () => query,
    is: () => query,
    order: () => query,
    limit: () => query,
    maybeSingle: () => Promise.resolve({ data, error: null }),
    then: result.then.bind(result),
  };
  return query;
}

describe('GET /api/kdo/context', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.KDO_WEBSITE_CONNECTOR_TOKEN = 'test-connector-token';
    process.env.KDO_WEBSITE_CONNECTOR_WORKSPACE_ID = 'workspace-test';
    createAdminClient.mockReturnValue({
      from: (table: string) => queryResult({
        site_settings: {
          value: {
            organization: { name: 'GrowthBridge', description: 'Business context', email: 'private@example.com' },
            homepage: { heroHeadline: 'Bridging Skills' },
            api: { apiKeys: ['must-not-leak'] },
            seo: { defaultTitle: 'GrowthBridge', defaultKeywords: ['Africa'] },
          },
          updated_at: '2026-01-01T00:00:00.000Z',
        },
        services: [{ id: 'service-1', slug: 'engineering', title: 'Engineering', description: 'Build systems', status: 'published' }],
        projects: [{ id: 'project-1', slug: 'platform', title: 'Platform', description: 'A project', technologies: ['Python'] }],
        blog_posts: [{ id: 'blog-1', slug: 'hello', title: 'Hello', excerpt: 'A public article', tags: ['news'] }],
        testimonials: [{ id: 'testimonial-1', quote: 'Excellent', author_name: 'Public Author', rating: 5 }],
      }[table] ?? []),
    });
  });

  it('rejects requests without the connector bearer token', async () => {
    const response = await GET(new NextRequest('https://growthbridge.test/api/kdo/context'));
    expect(response.status).toBe(401);
    expect(createAdminClient).not.toHaveBeenCalled();
  });

  it('returns only curated public website context and an ETag', async () => {
    const response = await GET(new NextRequest('https://growthbridge.test/api/kdo/context', {
      headers: { Authorization: 'Bearer test-connector-token' },
    }));
    expect(response.status).toBe(200);
    expect(response.headers.get('etag')).toBeTruthy();
    expect(response.headers.get('cache-control')).toContain('no-store');
    const payload = await response.json();
    expect(payload.context.workspace_id).toBe('workspace-test');
    expect(payload.context.website.organization.name).toBe('GrowthBridge');
    expect(payload.context.services[0].title).toBe('Engineering');
    expect(payload.context.projects[0].title).toBe('Platform');
    expect(payload.context.published_articles[0].title).toBe('Hello');
    expect(JSON.stringify(payload)).not.toContain('private@example.com');
    expect(JSON.stringify(payload)).not.toContain('must-not-leak');
  });
});
