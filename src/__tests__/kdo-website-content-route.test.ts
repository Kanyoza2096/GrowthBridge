import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import { POST } from '@/app/api/kdo/content/route';

vi.mock('@/lib/supabase/server', () => ({
  createAdminClient: vi.fn(),
}));

describe('KDO content publication route', () => {
  const originalToken = process.env.KDO_WEBSITE_CONNECTOR_TOKEN;
  const originalWorkspace = process.env.KDO_WEBSITE_CONNECTOR_WORKSPACE_ID;
  const rpc = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    process.env.KDO_WEBSITE_CONNECTOR_TOKEN = 'test-connector-token';
    process.env.KDO_WEBSITE_CONNECTOR_WORKSPACE_ID = 'growthbridge-workspace';
    vi.mocked(createAdminClient).mockReturnValue({ rpc } as never);
    rpc.mockResolvedValue({
      data: { id: 'post-1', post_id: 'post-1', slug: 'launch', status: 'published' },
      error: null,
    });
  });

  afterEach(() => {
    if (originalToken === undefined) delete process.env.KDO_WEBSITE_CONNECTOR_TOKEN;
    else process.env.KDO_WEBSITE_CONNECTOR_TOKEN = originalToken;
    if (originalWorkspace === undefined) delete process.env.KDO_WEBSITE_CONNECTOR_WORKSPACE_ID;
    else process.env.KDO_WEBSITE_CONNECTOR_WORKSPACE_ID = originalWorkspace;
  });

  function request(body: Record<string, unknown>, token = 'test-connector-token') {
    return new NextRequest('http://localhost/api/kdo/content', {
      method: 'POST',
      headers: {
        authorization: `Bearer ${token}`,
        'content-type': 'application/json',
        'idempotency-key': 'kdo-publication-0001',
      },
      body: JSON.stringify(body),
    });
  }

  const validBody = {
    workspace_id: 'growthbridge-workspace',
    title: 'Launch',
    content: 'Public article body',
    status: 'publish',
  };

  it('rejects missing or incorrect connector credentials before database access', async () => {
    const response = await POST(request(validBody, 'wrong-token'));
    expect(response.status).toBe(401);
    expect(rpc).not.toHaveBeenCalled();
  });

  it('rejects a workspace outside the configured integration boundary', async () => {
    const response = await POST(request({ ...validBody, workspace_id: 'another-workspace' }));
    expect(response.status).toBe(400);
    expect(rpc).not.toHaveBeenCalled();
  });

  it('calls the atomic idempotent publication RPC with the request key', async () => {
    const response = await POST(request(validBody));
    expect(response.status).toBe(200);
    expect(rpc).toHaveBeenCalledTimes(1);
    expect(rpc).toHaveBeenCalledWith('publish_kdo_blog_content', expect.objectContaining({
      p_idempotency_key: 'kdo-publication-0001',
      p_workspace_id: 'growthbridge-workspace',
      p_title: 'Launch',
      p_content: 'Public article body',
      p_status: 'published',
    }));
    await expect(response.json()).resolves.toMatchObject({ id: 'post-1', slug: 'launch' });
  });

  it('returns a conflict when the RPC rejects a duplicate slug or mismatched idempotency key', async () => {
    rpc.mockResolvedValueOnce({
      data: null,
      error: { code: '23505', message: 'duplicate key value violates unique constraint' },
    });
    const response = await POST(request(validBody));
    expect(response.status).toBe(409);
    await expect(response.json()).resolves.toMatchObject({
      success: false,
      error: 'Publication conflicts with an existing request or slug',
    });
  });
});
