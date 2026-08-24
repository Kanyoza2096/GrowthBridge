// src/__tests__/unit/integrations/autonomous-platform.test.ts
import { describe, it, expect } from 'vitest';
import { AutonomousPlatformClient } from '@/integrations/autonomous-platform/client';
import { CircuitBreaker } from '@/integrations/autonomous-platform/resilience';

describe('Autonomous Platform Graceful Degradation', () => {
  it('should return null when platform is disabled or not configured', async () => {
    const client = new AutonomousPlatformClient();
    const result = await client.generateContent({ topic: 'Test Topic' });
    expect(result).toBeNull();
  });

  it('circuit breaker should fast-fail after threshold failures', async () => {
    const breaker = new CircuitBreaker({ failureThreshold: 2, resetTimeoutMs: 1000 });

    // 1st failure
    await breaker.execute(async () => {
      throw new Error('500 Internal Error');
    });

    // 2nd failure
    await breaker.execute(async () => {
      throw new Error('500 Internal Error');
    });

    // 3rd call should be fast-failed by open breaker
    const fastFail = await breaker.execute(async () => 'success');
    expect(fastFail).toBeNull();
  });
});
