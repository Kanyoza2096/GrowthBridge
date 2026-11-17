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

  it('cancels the request stream as soon as the multipart byte ceiling is exceeded', async () => {
    let cancelled = false;
    const stream = new ReadableStream<Uint8Array>({
      start(controller) {
        controller.enqueue(new Uint8Array(1024));
      },
      cancel() {
        cancelled = true;
      },
    });
    const request = new Request('https://growthbridge.test/upload', {
      method: 'POST',
      headers: { 'content-type': 'multipart/form-data; boundary=test' },
      body: stream,
      duplex: 'half',
    } as RequestInit & { duplex: 'half' });

    await expect(readFormDataBody(request, 512)).rejects.toThrow('REQUEST_BODY_TOO_LARGE');
    expect(cancelled).toBe(true);
  });

});