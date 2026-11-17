import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { InMemoryRateLimitStore, UpstashRateLimitStore } from '@/lib/security/rate-limit';

describe('InMemoryRateLimitStore', () => {
  let store: InMemoryRateLimitStore;

  beforeEach(() => {
    store = new InMemoryRateLimitStore();
  });

  it('allows requests under the limit', async () => {
    const r1 = await store.check('user:1', 3, 60_000);
    expect(r1.limited).toBe(false);
    expect(r1.remaining).toBe(2);

    const r2 = await store.check('user:1', 3, 60_000);
    expect(r2.limited).toBe(false);
    expect(r2.remaining).toBe(1);
  });

  it('blocks when limit is exceeded', async () => {
    await store.check('user:2', 2, 60_000);
    await store.check('user:2', 2, 60_000);
    const blocked = await store.check('user:2', 2, 60_000);
    expect(blocked.limited).toBe(true);
    expect(blocked.remaining).toBe(0);
  });

  it('isolates keys', async () => {
    await store.check('a', 1, 60_000);
    const blockedA = await store.check('a', 1, 60_000);
    const okB = await store.check('b', 1, 60_000);
    expect(blockedA.limited).toBe(true);
    expect(okB.limited).toBe(false);
  });
});


describe('UpstashRateLimitStore outage fallback', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('continues enforcing a per-instance limit when Redis is unavailable', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('Redis unavailable')));
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
    const store = new UpstashRateLimitStore('https://redis.example', 'token');

    const first = await store.check('form:contact:203.0.113.10', 1, 60_000);
    const second = await store.check('form:contact:203.0.113.10', 1, 60_000);

    expect(first.limited).toBe(false);
    expect(first.remaining).toBe(0);
    expect(second.limited).toBe(true);
    expect(second.remaining).toBe(0);
  });

  it('isolates fallback counters by key', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('Redis unavailable')));
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
    const store = new UpstashRateLimitStore('https://redis.example', 'token');

    await store.check('form:contact:203.0.113.10', 1, 60_000);
    const sameKey = await store.check('form:contact:203.0.113.10', 1, 60_000);
    const otherKey = await store.check('form:apply:203.0.113.10', 1, 60_000);

    expect(sameKey.limited).toBe(true);
    expect(otherKey.limited).toBe(false);
  });
});
