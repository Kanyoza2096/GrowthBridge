import { NextResponse, type NextRequest } from 'next/server';
import { publicConfig } from '@/lib/config/public';
import { createMiddlewareClient } from '@/lib/supabase/middleware-client';

const ADMIN_PATHS = ['/admin'];
const PUBLIC_PATHS = ['/admin/login'];
const API_PATHS = ['/api'];

const CSRF_COOKIE = 'gb_csrf_token';
const RATE_LIMIT_WINDOW_MS = 60 * 1000;
const RATE_LIMIT_DEFAULT_MAX = Number(process.env.RATE_LIMIT_REQUESTS_PER_MINUTE || 60);
const ADMIN_LOGIN_MAX_ATTEMPTS = Number(process.env.RATE_LIMIT_ADMIN_LOGIN_PER_IP || 5);

const HARDENED_HEADERS: Record<string, string> = {
  'X-DNS-Prefetch-Control': 'on',
  'Strict-Transport-Security': 'max-age=63072000; includeSubDomains; preload',
  'X-Frame-Options': 'DENY',
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy':
    'camera=(), microphone=(), geolocation=(), payment=(), usb=(), bluetooth=(), ' +
    'gyroscope=(), accelerometer=(), magnetometer=(), fullscreen=(self), screen-wake-lock=(), ' +
    'interest-cohort=()',
  'Content-Security-Policy':
    "default-src 'self'; " +
    "script-src 'self' 'unsafe-inline' https://challenges.cloudflare.com; " +
    "style-src 'self' 'unsafe-inline' https:; " +
    "img-src 'self' blob: data: https:; " +
    "font-src 'self' data: https:; " +
    "connect-src 'self' https: wss:; " +
    "media-src 'self' blob: https:; " +
    "object-src 'none'; " +
    "base-uri 'self'; " +
    "form-action 'self'; " +
    "frame-ancestors 'none'; " +
    "upgrade-insecure-requests; " +
    "block-all-mixed-content;",
  'X-Permitted-Cross-Domain-Policies': 'none',
  'Cross-Origin-Opener-Policy': 'same-origin-allow-popups',
  'Cross-Origin-Cross-Resource-Policy': 'same-origin',
  'Origin-Agent-Cluster': '?1',
  'X-Robots-Tag': 'all',
};

function withHardenedHeaders(existingHeaders?: Headers): Headers {
  const out = new Headers(existingHeaders);
  for (const [key, value] of Object.entries(HARDENED_HEADERS)) {
    if (!out.has(key)) out.set(key, value);
  }
  return out;
}

function withHardenedHeadersOnResponse(response: NextResponse): NextResponse {
  for (const [key, value] of Object.entries(HARDENED_HEADERS)) {
    if (!response.headers.has(key)) response.headers.set(key, value);
  }
  return response;
}

const ipRequestCounts = new Map<string, { count: number; reset: number }>();
const loginAttemptCounts = new Map<string, { count: number; reset: number }>();
const MAX_MAP_SIZE = 10_000;

function pruneStore(store: Map<string, { count: number; reset: number }>) {
  if (store.size <= MAX_MAP_SIZE) return;
  const now = Date.now();
  for (const [key, entry] of store) {
    if (entry.reset < now) store.delete(key);
  }
}

function getClientIp(request: NextRequest): string {
  const realIp = request.headers.get('x-real-ip');
  if (realIp) return realIp.trim();
  const forwardedFor = request.headers.get('x-forwarded-for');
  if (forwardedFor) {
    const firstIp = forwardedFor.split(',')[0]?.trim();
    if (firstIp) return firstIp;
  }
  return 'unknown-ip';
}

function checkRateLimit(
  store: Map<string, { count: number; reset: number }>,
  key: string,
  max: number
): { limited: boolean; remaining: number; reset: number } {
  const now = Date.now();
  const existing = store.get(key);

  if (!existing || existing.reset < now) {
    store.set(key, { count: 1, reset: now + RATE_LIMIT_WINDOW_MS });
    return { limited: false, remaining: max - 1, reset: now + RATE_LIMIT_WINDOW_MS };
  }

  existing.count += 1;
  if (existing.count > max) {
    return { limited: true, remaining: 0, reset: existing.reset };
  }
  return { limited: false, remaining: max - existing.count, reset: existing.reset };
}

function generateCsrfToken(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, (b) => b.toString(16).padStart(2, '0')).join('');
}

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const path = request.nextUrl.pathname;
  const method = request.method;

  // 1. Setup Supabase Client and session refresh
  const supabase = createMiddlewareClient(request, response);
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // 2. API Security & Rate Limiting
  if (API_PATHS.some((p) => path.startsWith(p))) {
    const ip = getClientIp(request);
    const rate = checkRateLimit(ipRequestCounts, `api:${ip}`, RATE_LIMIT_DEFAULT_MAX);
    pruneStore(ipRequestCounts);

    if (rate.limited) {
      const retryAfter = Math.ceil((rate.reset - Date.now()) / 1000);
      const headers = withHardenedHeaders(
        new Headers({
          'Retry-After': String(retryAfter),
          'X-RateLimit-Limit': String(RATE_LIMIT_DEFAULT_MAX),
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': String(Math.ceil(rate.reset / 1000)),
        })
      );
      return NextResponse.json(
        { success: false, error: 'Too many requests. Please try again later.', retryAfter },
        { status: 429, headers }
      );
    }

    if (path === '/api/admin/login' && method === 'POST') {
      const loginRate = checkRateLimit(loginAttemptCounts, `login:${ip}`, ADMIN_LOGIN_MAX_ATTEMPTS);
      pruneStore(loginAttemptCounts);

      if (loginRate.limited) {
        const retryAfter = Math.ceil((loginRate.reset - Date.now()) / 1000);
        const headers = withHardenedHeaders(
          new Headers({
            'Retry-After': String(retryAfter),
            'X-RateLimit-Limit': String(ADMIN_LOGIN_MAX_ATTEMPTS),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': String(Math.ceil(loginRate.reset / 1000)),
          })
        );
        return NextResponse.json(
          { success: false, error: 'Too many login attempts. Please try again later.', retryAfter },
          { status: 429, headers }
        );
      }
    }

    if (path.startsWith('/api/admin/data/') && !PUBLIC_PATHS.includes(path)) {
      if (!user) {
        return NextResponse.json(
          { success: false, error: 'Unauthorized - valid Supabase admin session required' },
          { status: 401, headers: withHardenedHeaders() }
        );
      }
    }

    const allowedOrigins = [
      publicConfig.NEXT_PUBLIC_SITE_URL,
      'https://www.growthbridge.org',
      'https://growthbridge.org',
    ].filter(Boolean) as string[];

    if (process.env.NODE_ENV === 'development') {
      allowedOrigins.push(
        'http://localhost:3000',
        'http://127.0.0.1:3000',
        'http://localhost:3001',
        'http://127.0.0.1:3001'
      );
    }

    const origin = request.headers.get('origin');
    const corsHeaders: Record<string, string> = {
      'Access-Control-Allow-Credentials': 'true',
      'Vary': 'Origin',
    };

    if (origin && allowedOrigins.includes(origin)) {
      corsHeaders['Access-Control-Allow-Origin'] = origin;
    }

    if (method === 'OPTIONS') {
      const preflightHeaders = withHardenedHeaders(
        new Headers({
          ...corsHeaders,
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
          'Access-Control-Allow-Headers':
            'Content-Type, Authorization, X-CSRF-Token, X-Requested-With, Accept, ' +
            'Accept-Version, Content-Length, Content-MD5, Date, X-Api-Version',
          'Access-Control-Max-Age': '86400',
        })
      );
      return new NextResponse(null, { status: 204, headers: preflightHeaders });
    }

    if (
      method !== 'GET' &&
      method !== 'HEAD' &&
      method !== 'OPTIONS' &&
      path !== '/api/admin/login' &&
      path !== '/api/admin/csrf-token'
    ) {
      const csrfCookie = request.cookies.get(CSRF_COOKIE)?.value;
      const csrfHeader = request.headers.get('x-csrf-token');

      if (path.startsWith('/api/admin/') && (!csrfCookie || !csrfHeader || csrfCookie !== csrfHeader)) {
        return NextResponse.json(
          { success: false, error: 'Invalid or missing CSRF token' },
          { status: 403, headers: withHardenedHeaders() }
        );
      }
    }

    for (const [key, value] of Object.entries(corsHeaders)) {
      response.headers.set(key, value);
    }
    response.headers.set('X-RateLimit-Limit', String(RATE_LIMIT_DEFAULT_MAX));
    response.headers.set('X-RateLimit-Remaining', String(rate.remaining));
    response.headers.set('X-RateLimit-Reset', String(Math.ceil(rate.reset / 1000)));
    return withHardenedHeadersOnResponse(response);
  }

  // 3. Admin Page Route Protection
  if (ADMIN_PATHS.some((p) => path.startsWith(p)) && !PUBLIC_PATHS.includes(path)) {
    if (!user) {
      const loginUrl = new URL('/admin/login', request.url);
      loginUrl.searchParams.set('redirect', path);
      return withHardenedHeadersOnResponse(NextResponse.redirect(loginUrl));
    }

    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('x-admin-authenticated', 'true');
    return withHardenedHeadersOnResponse(
      NextResponse.next({ request: { headers: requestHeaders } })
    );
  }

  // 4. CSRF Cookie Setting
  if (!request.cookies.has(CSRF_COOKIE)) {
    response.cookies.set({
      name: CSRF_COOKIE,
      value: generateCsrfToken(),
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24,
    });
  }

  return withHardenedHeadersOnResponse(response);
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon\\.ico|.*\\.png$|.*\\.jpg$|.*\\.jpeg$|.*\\.svg$|.*\\.ico$|.*\\.webp$|.*\\.avif$).*)'],
};
