import { describe, expect, it } from 'vitest';
import { validateAdminResourcePayload } from '@/lib/security/admin-validate';

describe('admin payload validation', () => {
  it('rejects malformed create payloads', () => {
    expect(validateAdminResourcePayload('services', { title: 'Only title' }, 'create').success).toBe(false);
    expect(validateAdminResourcePayload('people', { slug: 'x', fullName: 'A', title: 'B', category: 'team', email: 'bad' }, 'create').success).toBe(false);
  });

  it('accepts valid updates and empty-string clearing', () => {
    const result = validateAdminResourcePayload('services', { description: '', tagline: '' }, 'update');
    expect(result.success).toBe(true);
  });

  it('rejects non-http URL schemes', () => {
    const result = validateAdminResourcePayload('projects', { url: 'javascript:alert(1)' }, 'update');
    expect(result.success).toBe(false);
  });
});
