import { describe, it, expect, beforeEach } from 'vitest';
import { InMemoryRateLimitStore } from '@/lib/security/rate-limit';

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
