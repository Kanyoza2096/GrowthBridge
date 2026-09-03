/**
 * Rate limiting utilities for GrowthBridge.
 *
 * Production: set UPSTASH_REDIS_REST_URL + UPSTASH_REDIS_REST_TOKEN to use
 * a distributed Upstash Redis store. Otherwise the in-memory store is used
 * (suitable only for single-instance / local development).
 */

export interface RateLimitResult {
  limited: boolean;
  remaining: number;
  reset: number; // unix ms
  limit: number;
}

export interface RateLimitStore {
  check(key: string, max: number, windowMs: number): Promise<RateLimitResult>;
  prune?(): void;
}

// ---------------------------------------------------------------------------
// In-memory sliding-window store (dev / single instance only)
// ---------------------------------------------------------------------------

const MAX_ENTRIES = 20_000;
const PRUNE_INTERVAL_MS = 30_000;

class InMemoryRateLimitStore implements RateLimitStore {
  private store = new Map<string, { count: number; reset: number }>();
  private lastPrune = 0;

  async check(key: string, max: number, windowMs: number): Promise<RateLimitResult> {
    this.maybePrune();

    const now = Date.now();
    const existing = this.store.get(key);

    if (!existing || existing.reset < now) {
      this.store.set(key, { count: 1, reset: now + windowMs });
      return { limited: false, remaining: max - 1, reset: now + windowMs, limit: max };
    }

    existing.count += 1;
    if (existing.count > max) {
      return { limited: true, remaining: 0, reset: existing.reset, limit: max };
    }
    return {
      limited: false,
      remaining: Math.max(0, max - existing.count),
      reset: existing.reset,
      limit: max,
    };
  }

  prune(): void {
    const now = Date.now();
    for (const [key, entry] of this.store) {
      if (entry.reset < now) this.store.delete(key);
    }
    if (this.store.size > MAX_ENTRIES) {
      const excess = this.store.size - MAX_ENTRIES;
      const keys = this.store.keys();
      for (let i = 0; i < excess; i++) {
        const next = keys.next();
        if (next.done) break;
        this.store.delete(next.value);
      }
    }
  }

  private maybePrune(): void {
    const now = Date.now();
    if (now - this.lastPrune > PRUNE_INTERVAL_MS) {
      this.prune();
      this.lastPrune = now;
    }
  }
}

// ---------------------------------------------------------------------------
// Upstash Redis REST store (production / multi-instance)
// Uses fixed-window counters via INCR + EXPIRE for simplicity and speed.
// ---------------------------------------------------------------------------

class UpstashRateLimitStore implements RateLimitStore {
  constructor(
    private readonly url: string,
    private readonly token: string
  ) {}

  private async redis(command: (string | number)[]): Promise<unknown> {
    const res = await fetch(this.url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(command),
      cache: 'no-store',
    });
    if (!res.ok) {
      throw new Error(`Upstash error ${res.status}`);
    }
    const data = (await res.json()) as { result?: unknown };
    return data.result;
  }

  async check(key: string, max: number, windowMs: number): Promise<RateLimitResult> {
    const windowSec = Math.max(1, Math.ceil(windowMs / 1000));
    const bucket = Math.floor(Date.now() / windowMs);
    const redisKey = `rl:${key}:${bucket}`;
    const reset = (bucket + 1) * windowMs;

    try {
      const count = Number(await this.redis(['INCR', redisKey]));
      if (count === 1) {
        await this.redis(['EXPIRE', redisKey, windowSec]);
      }

      if (count > max) {
        return { limited: true, remaining: 0, reset, limit: max };
      }
      return {
        limited: false,
        remaining: Math.max(0, max - count),
        reset,
        limit: max,
      };
    } catch (err) {
      // Fail open on Redis outage so the site stays available, but log loudly.
      console.error('[rate-limit] Upstash unavailable, allowing request:', err);
      return { limited: false, remaining: max, reset: Date.now() + windowMs, limit: max };
    }
  }
}

// ---------------------------------------------------------------------------
// Store selection
// ---------------------------------------------------------------------------

function createRateLimitStore(): RateLimitStore {
  const url = process.env.UPSTASH_REDIS_REST_URL?.trim();
  const token = process.env.UPSTASH_REDIS_REST_TOKEN?.trim();

  if (url && token) return new UpstashRateLimitStore(url, token);
  return new InMemoryRateLimitStore();
}

function positiveInt(value: string | undefined, fallback: number, max: number): number {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < 1) return fallback;
  return Math.min(Math.floor(parsed), max);
}

/** Singleton store — Upstash when configured, otherwise in-memory. */
export const rateLimitStore: RateLimitStore = createRateLimitStore();
// Emergency per-process limiter ensures login attempts remain throttled even
// if the distributed Redis service is unavailable.
const emergencyLoginStore = new InMemoryRateLimitStore();

export const RATE_LIMIT_WINDOW_MS = 60 * 1000;

export function getRateLimitConfig() {
  return {
    apiPerMinute: positiveInt(process.env.RATE_LIMIT_REQUESTS_PER_MINUTE, 60, 10000),
    formPerMinute: positiveInt(process.env.RATE_LIMIT_FORM_REQUESTS_PER_MINUTE, 10, 1000),
    adminLoginPerIp: positiveInt(process.env.RATE_LIMIT_ADMIN_LOGIN_PER_IP, 5, 100),
  };
}

export async function checkApiRateLimit(ip: string): Promise<RateLimitResult> {
  const { apiPerMinute } = getRateLimitConfig();
  return rateLimitStore.check(`api:${ip}`, apiPerMinute, RATE_LIMIT_WINDOW_MS);
}

export async function checkFormRateLimit(ip: string, form: string): Promise<RateLimitResult> {
  const { formPerMinute } = getRateLimitConfig();
  return rateLimitStore.check(`form:${form}:${ip}`, formPerMinute, RATE_LIMIT_WINDOW_MS);
}

export async function checkLoginRateLimit(key: string): Promise<RateLimitResult> {
  const { adminLoginPerIp } = getRateLimitConfig();
  // key is typically "account:email:ip". Also enforce a pure-IP ceiling so
  // credential-stuffing across many accounts from one IP is still throttled.
  // Both stores remain fail-open / in-memory when Redis is unavailable.
  const pureIp = key.includes(':') ? key.split(':').pop() || key : key;
  const [distributed, emergencyAccount, emergencyIp] = await Promise.all([
    rateLimitStore.check(`login:${key}`, adminLoginPerIp, RATE_LIMIT_WINDOW_MS),
    emergencyLoginStore.check(`login:${key}`, adminLoginPerIp, RATE_LIMIT_WINDOW_MS),
    // Slightly higher pure-IP budget so legitimate NAT users are not blocked too aggressively.
    emergencyLoginStore.check(`login:ip:${pureIp}`, adminLoginPerIp * 4, RATE_LIMIT_WINDOW_MS),
  ]);
  if (distributed.limited) return distributed;
  if (emergencyAccount.limited) return emergencyAccount;
  if (emergencyIp.limited) return emergencyIp;
  return distributed;
}

/** Exposed for unit tests */
export { InMemoryRateLimitStore, UpstashRateLimitStore };
