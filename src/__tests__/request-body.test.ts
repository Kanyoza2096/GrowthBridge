import { describe, expect, it } from 'vitest';
import { readFormDataBody } from '@/lib/security/request';

describe('readFormDataBody', () => {
  it('parses multipart fields within the configured limit', async () => {
    const form = new FormData();
    form.set('name', 'brand-image');
    form.set('folder', 'campaigns');
    const request = new Request('https://growthbridge.test/upload', { method: 'POST', body: form });

    const parsed = await readFormDataBody(request, 1024);

    expect(parsed.get('name')).toBe('brand-image');
    expect(parsed.get('folder')).toBe('campaigns');
  });

  it('rejects oversized streamed bodies even without a content-length header', async () => {
    const form = new FormData();
    form.set('file', new Blob(['x'.repeat(4096)], { type: 'image/png' }), 'large.png');
    const request = new Request('https://growthbridge.test/upload', { method: 'POST', body: form });

    await expect(readFormDataBody(request, 512)).rejects.toThrow('REQUEST_BODY_TOO_LARGE');
  });

  it('rejects non-multipart requests', async () => {
    const request = new Request('https://growthbridge.test/upload', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: '{}',
    });

    await expect(readFormDataBody(request, 1024)).rejects.toThrow('INVALID_MULTIPART_BODY');
  });
});
