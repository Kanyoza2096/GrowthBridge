import { NextRequest } from 'next/server';

export function getTrustedClientIp(request: NextRequest): string {
  // Cloudflare's header is only trusted when the application is deployed behind
  // Cloudflare. Prefer it over user-controlled forwarding chains.
  const cf = request.headers.get('cf-connecting-ip')?.trim();
  if (cf) return cf;

  const real = request.headers.get('x-real-ip')?.trim();
  if (real) return real;

  const forwarded = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim();
  return forwarded || 'unknown';
}

export async function readJsonBody<T = unknown>(request: NextRequest, maxBytes: number): Promise<T> {
  const contentLength = request.headers.get('content-length');
  if (contentLength && Number(contentLength) > maxBytes) {
    throw new Error('REQUEST_BODY_TOO_LARGE');
  }

  if (!request.body) return {} as T;

  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let total = 0;

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      if (!value) continue;
      total += value.byteLength;
      if (total > maxBytes) throw new Error('REQUEST_BODY_TOO_LARGE');
      chunks.push(value);
    }
  } finally {
    reader.releaseLock();
  }

  const bytes = new Uint8Array(total);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.byteLength;
  }

  const text = new TextDecoder().decode(bytes);
  if (!text.trim()) return {} as T;
  return JSON.parse(text) as T;
}
