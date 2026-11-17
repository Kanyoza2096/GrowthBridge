export type AuditWriteOutcome = 'recorded' | 'unavailable' | 'not_attempted';

/**
 * Audit persistence happens after the business mutation in the current API
 * architecture. Never turn an already-committed mutation into an apparent
 * failure (which invites unsafe retries), and never silently label it audited.
 */
export async function recordAuditSafely(
  write: () => Promise<unknown>,
  context: string,
): Promise<AuditWriteOutcome> {
  try {
    await write();
    return 'recorded';
  } catch (error) {
    console.error('[AuditWrite] persistence failed', { context, error });
    return 'unavailable';
  }
}

export function auditWarning(outcome: AuditWriteOutcome): string | undefined {
  return outcome === 'unavailable'
    ? 'The change was saved, but its audit record could not be written. Do not repeat the change; an administrator should review the audit log.'
    : undefined;
}
