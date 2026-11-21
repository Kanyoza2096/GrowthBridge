import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import { checkFormRateLimit } from '@/lib/security/rate-limit';
import { getTrustedClientIp, readJsonBody } from '@/lib/security/request';
import { POST } from '@/app/api/growthbridge-ai/route';

vi.mock('@/lib/supabase/server', () => ({
  createAdminClient: vi.fn(),
}));

vi.mock('@/lib/security/rate-limit', () => ({
  checkFormRateLimit: vi.fn(),
}));

vi.mock('@/lib/security/request', () => ({
  getTrustedClientIp: vi.fn(),
  readJsonBody: vi.fn(),
}));

describe('GrowthBridge AI consultant route safeguards', () => {
  const originalAccountId = process.env.CLOUDFLARE_ACCOUNT_ID;
  const originalApiToken = process.env.CLOUDFLARE_API_TOKEN;
  const originalModel = process.env.CLOUDFLARE_AI_MODEL;

  beforeEach(() => {
    vi.clearAllMocks();
    delete process.env.CLOUDFLARE_ACCOUNT_ID;
    delete process.env.CLOUDFLARE_API_TOKEN;
    delete process.env.CLOUDFLARE_AI_MODEL;
    vi.mocked(getTrustedClientIp).mockReturnValue('203.0.113.10');
    vi.mocked(checkFormRateLimit).mockResolvedValue({ limited: false } as never);
    vi.mocked(readJsonBody).mockImplementation(async (request) => request.json());
    vi.mocked(createAdminClient).mockReturnValue({} as never);
  });

  afterEach(() => {
    if (originalAccountId === undefined) delete process.env.CLOUDFLARE_ACCOUNT_ID;
    else process.env.CLOUDFLARE_ACCOUNT_ID = originalAccountId;
    if (originalApiToken === undefined) delete process.env.CLOUDFLARE_API_TOKEN;
    else process.env.CLOUDFLARE_API_TOKEN = originalApiToken;
    if (originalModel === undefined) delete process.env.CLOUDFLARE_AI_MODEL;
    else process.env.CLOUDFLARE_AI_MODEL = originalModel;
  });

  function request(body: unknown) {
    return new NextRequest('http://localhost/api/growthbridge-ai', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(body),
    });
  }

  it('applies the dedicated rate limit before processing a conversation', async () => {
    vi.mocked(checkFormRateLimit).mockResolvedValueOnce({ limited: true } as never);

    const response = await POST(request({ messages: [{ role: 'user', content: 'Hello' }] }));

    expect(response.status).toBe(429);
    expect(checkFormRateLimit).toHaveBeenCalledWith('203.0.113.10', 'growthbridge-ai');
    expect(readJsonBody).not.toHaveBeenCalled();
    expect(createAdminClient).not.toHaveBeenCalled();
  });

  it('rejects an empty conversation and does not access website data', async () => {
    const response = await POST(request({ messages: [] }));

    expect(response.status).toBe(400);
    expect(createAdminClient).not.toHaveBeenCalled();
  });

  it('rejects a conversation that does not end with a visitor message', async () => {
    const response = await POST(request({
      messages: [{ role: 'assistant', content: 'How can I help?' }],
    }));

    expect(response.status).toBe(400);
    expect(createAdminClient).not.toHaveBeenCalled();
  });

  it('rejects oversized individual messages and excessive history', async () => {
    const longMessage = await POST(request({
      messages: [{ role: 'user', content: 'x'.repeat(1601) }],
    }));
    const longHistory = await POST(request({
      messages: Array.from({ length: 9 }, () => ({ role: 'user', content: 'Hello' })),
    }));

    expect(longMessage.status).toBe(400);
    expect(longHistory.status).toBe(400);
    expect(createAdminClient).not.toHaveBeenCalled();
  });

  it('returns a clear configuration response when Cloudflare credentials are absent', async () => {
    const response = await POST(request({
      messages: [{ role: 'user', content: 'Can you help my business?' }],
    }));

    expect(response.status).toBe(503);
    await expect(response.json()).resolves.toMatchObject({
      code: 'AI_NOT_CONFIGURED',
    });
    expect(createAdminClient).not.toHaveBeenCalled();
  });

  it('rejects a malformed model identifier before contacting Cloudflare', async () => {
    process.env.CLOUDFLARE_ACCOUNT_ID = 'test-account';
    process.env.CLOUDFLARE_API_TOKEN = 'test-token';
    process.env.CLOUDFLARE_AI_MODEL = 'https://example.com/steal-token';

    const response = await POST(request({
      messages: [{ role: 'user', content: 'Can you help my business?' }],
    }));

    expect(response.status).toBe(503);
    await expect(response.json()).resolves.toMatchObject({
      error: 'The AI service is temporarily misconfigured.',
    });
    expect(createAdminClient).not.toHaveBeenCalled();
  });
});
