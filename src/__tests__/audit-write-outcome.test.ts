import { describe, expect, it, vi } from 'vitest';
import { auditWarning, recordAuditSafely } from '@/lib/audit/write-outcome';

describe('recordAuditSafely', () => {
  it('reports a persisted audit record', async () => {
    const outcome = await recordAuditSafely(async () => ({ id: 'audit-1' }), 'test');
    expect(outcome).toBe('recorded');
    expect(auditWarning(outcome)).toBeUndefined();
  });

  it('reports an unavailable audit record without throwing after a committed mutation', async () => {
    const error = new Error('database unavailable');
    const log = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    const outcome = await recordAuditSafely(async () => { throw error; }, 'test');
    expect(outcome).toBe('unavailable');
    expect(auditWarning(outcome)).toMatch(/change was saved/i);
    expect(log).toHaveBeenCalledOnce();
    log.mockRestore();
  });
});
