import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import { POST } from '@/app/api/growthbridge-agent/dispatch/route';

vi.mock('@/lib/supabase/server', () => ({
  createAdminClient: vi.fn(),
}));

describe('GrowthBridge event-driven agent dispatcher', () => {
  const originalSecret = process.env.GROWTHBRIDGE_AGENT_DISPATCH_SECRET;
  const originalKdoSecret = process.env.KDO_WEBSITE_DISPATCH_SECRET;
  const originalAccountId = process.env.CLOUDFLARE_ACCOUNT_ID;
  const originalApiToken = process.env.CLOUDFLARE_API_TOKEN;
  const originalModel = process.env.CLOUDFLARE_AI_MODEL;

  beforeEach(() => {
    vi.clearAllMocks();
    process.env.GROWTHBRIDGE_AGENT_DISPATCH_SECRET = 'test-dispatch-secret';
    delete process.env.KDO_WEBSITE_DISPATCH_SECRET;
    delete process.env.CLOUDFLARE_ACCOUNT_ID;
    delete process.env.CLOUDFLARE_API_TOKEN;
    delete process.env.CLOUDFLARE_AI_MODEL;
    vi.stubGlobal('fetch', vi.fn());
  });

  afterEach(() => {
    if (originalSecret === undefined) delete process.env.GROWTHBRIDGE_AGENT_DISPATCH_SECRET;
    else process.env.GROWTHBRIDGE_AGENT_DISPATCH_SECRET = originalSecret;
    if (originalKdoSecret === undefined) delete process.env.KDO_WEBSITE_DISPATCH_SECRET;
    else process.env.KDO_WEBSITE_DISPATCH_SECRET = originalKdoSecret;
    if (originalAccountId === undefined) delete process.env.CLOUDFLARE_ACCOUNT_ID;
    else process.env.CLOUDFLARE_ACCOUNT_ID = originalAccountId;
    if (originalApiToken === undefined) delete process.env.CLOUDFLARE_API_TOKEN;
    else process.env.CLOUDFLARE_API_TOKEN = originalApiToken;
    if (originalModel === undefined) delete process.env.CLOUDFLARE_AI_MODEL;
    else process.env.CLOUDFLARE_AI_MODEL = originalModel;
    vi.unstubAllGlobals();
  });

  function request(secret?: string) {
    return new NextRequest('http://localhost/api/growthbridge-agent/dispatch', {
      method: 'POST',
      headers: secret ? { authorization: 'Bearer ' + secret } : {},
    });
  }

  it('rejects unauthenticated dispatch attempts before accessing the database', async () => {
    const response = await POST(request());
    expect(response.status).toBe(401);
    expect(createAdminClient).not.toHaveBeenCalled();
    expect(fetch).not.toHaveBeenCalled();
  });

  it('does not claim jobs when the Cloudflare runtime is not configured', async () => {
    const response = await POST(request('test-dispatch-secret'));
    expect(response.status).toBe(503);
    expect(createAdminClient).not.toHaveBeenCalled();
  });

  it('claims an empty queue safely without calling the model', async () => {
    process.env.CLOUDFLARE_ACCOUNT_ID = 'test-account';
    process.env.CLOUDFLARE_API_TOKEN = 'test-token';
    const rpc = vi.fn().mockResolvedValue({ data: [], error: null });
    vi.mocked(createAdminClient).mockReturnValue({ rpc } as never);

    const response = await POST(request('test-dispatch-secret'));
    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toMatchObject({ ok: true, claimed: 0, completed: 0 });
    expect(rpc).toHaveBeenCalledWith('claim_growthbridge_agent_jobs', { p_limit: 2, p_lease_seconds: 90 });
    expect(fetch).not.toHaveBeenCalled();
  });

  it('analyses only the consented enquiry content and finalizes with its lease token', async () => {
    process.env.CLOUDFLARE_ACCOUNT_ID = 'test-account';
    process.env.CLOUDFLARE_API_TOKEN = 'test-token';
    const job = {
      id: 'job-1',
      contact_submission_id: 'contact-1',
      attempt_count: 1,
      lease_token: 'lease-1',
    };
    const rpc = vi.fn().mockResolvedValue({ data: [job], error: null });
    const contactQuery = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      maybeSingle: vi.fn().mockResolvedValue({
        data: {
          id: 'contact-1',
          subject: 'GrowthBridge AI consultation request',
          message: 'I need a website for my small business.',
          type: 'general',
          name: 'Private Name',
          email: 'private@example.com',
          phone: '+265000000',
        },
        error: null,
      }),
    };
    const finalizeQuery = {
      eq: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      maybeSingle: vi.fn().mockResolvedValue({ data: { id: 'job-1' }, error: null }),
    };
    const update = vi.fn().mockReturnValue(finalizeQuery);
    const from = vi.fn((table: string) => table === 'contact_submissions'
      ? contactQuery
      : { update });
    vi.mocked(createAdminClient).mockReturnValue({ rpc, from } as never);

    const agentResult = {
      classification: 'sales_lead',
      priority: 'normal',
      summary: 'The visitor is exploring a website for a small business.',
      recommended_services: ['Web Design & Development'],
      missing_information: ['Business type', 'Desired launch window'],
      suggested_next_step: 'Ask what the website should help the business achieve.',
      confidence: 0.91,
      risk_flags: [],
    };
    vi.mocked(fetch).mockResolvedValue(new Response(JSON.stringify({
      success: true,
      result: { response: JSON.stringify(agentResult) },
    }), { status: 200, headers: { 'Content-Type': 'application/json' } }));

    const response = await POST(request('test-dispatch-secret'));
    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toMatchObject({ ok: true, claimed: 1, completed: 1 });
    const modelRequest = JSON.parse(vi.mocked(fetch).mock.calls[0][1]?.body as string);
    expect(JSON.stringify(modelRequest)).toContain('I need a website for my small business.');
    expect(JSON.stringify(modelRequest)).not.toContain('private@example.com');
    expect(JSON.stringify(modelRequest)).not.toContain('Private Name');
    expect(update).toHaveBeenCalledWith(expect.objectContaining({
      status: 'completed',
      result: agentResult,
    }));
    expect(finalizeQuery.eq).toHaveBeenCalledWith('lease_token', 'lease-1');
  });
});
