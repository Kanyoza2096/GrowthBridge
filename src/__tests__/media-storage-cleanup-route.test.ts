import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import { POST } from '@/app/api/cron/media-storage-cleanup/route';

vi.mock('@/lib/supabase/server', () => ({
  createAdminClient: vi.fn(),
}));

describe('media storage cleanup worker', () => {
  const originalSecret = process.env.MEDIA_STORAGE_CLEANUP_SECRET;
  const rpc = vi.fn();
  const remove = vi.fn();
  const from = vi.fn(() => ({ remove }));

  beforeEach(() => {
    vi.clearAllMocks();
    process.env.MEDIA_STORAGE_CLEANUP_SECRET = 'test-media-cleanup-secret';
    vi.mocked(createAdminClient).mockReturnValue({
      rpc,
      storage: { from },
    } as never);
    remove.mockResolvedValue({ error: null });
    rpc.mockResolvedValueOnce({
      data: [{
        id: 'job-1',
        bucket_id: 'media',
        object_path: 'uploads/file.png',
        lease_token: 'lease-1',
        attempt_count: 1,
      }],
      error: null,
    }).mockResolvedValueOnce({ data: true, error: null });
  });

  afterEach(() => {
    if (originalSecret === undefined) delete process.env.MEDIA_STORAGE_CLEANUP_SECRET;
    else process.env.MEDIA_STORAGE_CLEANUP_SECRET = originalSecret;
  });

  function request(secret = 'test-media-cleanup-secret') {
    return new NextRequest('http://localhost/api/cron/media-storage-cleanup', {
      method: 'POST',
      headers: { authorization: `Bearer ${secret}` },
    });
  }

  it('rejects requests without the worker secret before claiming jobs', async () => {
    const response = await POST(request('wrong-secret'));
    expect(response.status).toBe(401);
    expect(rpc).not.toHaveBeenCalled();
  });

  it('deletes claimed Storage objects and finalizes the matching lease', async () => {
    const response = await POST(request());
    expect(response.status).toBe(200);
    expect(from).toHaveBeenCalledWith('media');
    expect(remove).toHaveBeenCalledWith(['uploads/file.png']);
    expect(rpc).toHaveBeenNthCalledWith(2, 'finish_media_storage_cleanup_job', {
      p_job_id: 'job-1',
      p_lease_token: 'lease-1',
      p_error: null,
    });
    await expect(response.json()).resolves.toMatchObject({
      claimed: 1,
      delivered: 1,
      retried: 0,
      failed: 0,
    });
  });

  it('schedules retry when Storage deletion fails', async () => {
    remove.mockResolvedValueOnce({ error: { message: 'Storage unavailable' } });
    const response = await POST(request());
    expect(response.status).toBe(200);
    expect(rpc).toHaveBeenNthCalledWith(2, 'finish_media_storage_cleanup_job', {
      p_job_id: 'job-1',
      p_lease_token: 'lease-1',
      p_error: 'Storage unavailable',
    });
    await expect(response.json()).resolves.toMatchObject({ retried: 1, failed: 0 });
  });
});
