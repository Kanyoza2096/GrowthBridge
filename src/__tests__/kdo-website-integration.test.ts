import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { buildKdoEventPayload } from '@/events/handlers/kdo-website.handler';

describe('KDO Website Integration event boundary', () => {
  it('keeps contact and application personal data out of outbound events', () => {
    const payload = buildKdoEventPayload({
      id: 'evt-12345678',
      type: 'application.created',
      timestamp: '2026-11-13T10:00:00.000Z',
      payload: { id: 'application-1', name: 'Private Name', email: 'private@example.com', phone: '+265000000' },
    });
    expect(payload).toEqual({
      source: 'growthbridge',
      resource_type: 'application',
      resource_id: 'application-1',
    });
    expect(JSON.stringify(payload)).not.toContain('private@example.com');
    expect(JSON.stringify(payload)).not.toContain('Private Name');
  });

  it('allows only bounded editorial metadata for blog events', () => {
    const payload = buildKdoEventPayload({
      id: 'evt-12345679',
      type: 'blog.published',
      timestamp: '2026-11-13T10:00:00.000Z',
      payload: { id: 'post-1', title: 'Launch', slug: 'launch', excerpt: 'Public excerpt', body: 'private body', email: 'private@example.com' },
    });
    expect(payload).toMatchObject({
      source: 'growthbridge',
      resource_type: 'blog',
      resource_id: 'post-1',
      title: 'Launch',
      slug: 'launch',
      excerpt: 'Public excerpt',
    });
    expect(payload).not.toHaveProperty('body');
    expect(payload).not.toHaveProperty('email');
  });
});
