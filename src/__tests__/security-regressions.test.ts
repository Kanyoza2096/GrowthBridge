import { describe, expect, it } from 'vitest';
import { ROLE_PERMISSIONS } from '@/lib/constants/rbac';
import { canPerformAdminAction } from '@/lib/auth/admin-authorization';
import { validateAdminResourcePayload } from '@/lib/security/admin-validate';
import { readFileSync } from 'fs';
import { join } from 'path';

describe('production security regressions', () => {
  it('does not accept arbitrary fields in admin mutations', () => {
    const result = validateAdminResourcePayload('services', {
      slug: 'safe',
      title: 'Safe',
      description: 'Safe description',
      role: 'growthbridge_super_admin',
      is_active: true,
    }, 'create');

    expect(result.success).toBe(true);
    if (result.success) {
      expect('role' in result.data).toBe(false);
      expect('is_active' in result.data).toBe(false);
    }
  });

  it('keeps read-only roles unable to mutate data', () => {
    const permissions = ROLE_PERMISSIONS.growthbridge_content_manager;
    expect(canPerformAdminAction('growthbridge_content_manager', permissions, 'services', 'read')).toBe(true);
    expect(canPerformAdminAction('growthbridge_content_manager', permissions, 'services', 'update')).toBe(false);
    expect(canPerformAdminAction('growthbridge_content_manager', permissions, 'projects', 'delete')).toBe(false);
  });

  it('does not grant settings access to analysts', () => {
    const permissions = ROLE_PERMISSIONS.growthbridge_analyst;
    expect(canPerformAdminAction('growthbridge_analyst', permissions, 'settings', 'read')).toBe(false);
    expect(canPerformAdminAction('growthbridge_analyst', permissions, 'settings', 'update')).toBe(false);
  });

  it('people repository exposes public-safe methods that strip PII', () => {
    const src = readFileSync(join(process.cwd(), 'src/repositories/people.repository.ts'), 'utf8');
    expect(src).toContain('mapDbToPublicPerson');
    expect(src).toContain('getPublicAll');
    expect(src).toContain('getPublicBySlug');
    expect(src).toContain("from('public_people')");
    // Public mapper must force email/phone off
    expect(src).toMatch(/email:\s*undefined/);
    expect(src).toMatch(/phone:\s*undefined/);
  });

  it('debug endpoint is gated in production', () => {
    const src = readFileSync(join(process.cwd(), 'src/app/api/admin/debug/route.ts'), 'utf8');
    expect(src).toMatch(/NODE_ENV\s*===\s*['"]production['"]/);
    expect(src).toMatch(/status:\s*404/);
  });

  it('rate limiter supports graceful Redis fallback', () => {
    const src = readFileSync(join(process.cwd(), 'src/lib/security/rate-limit.ts'), 'utf8');
    expect(src).toContain('UpstashRateLimitStore');
    expect(src).toContain('InMemoryRateLimitStore');
    expect(src).toMatch(/unavailable|allowing request|fail-open/i);
  });

  it('super admin has full permissions while analyst is restricted', () => {
    const superPerms = ROLE_PERMISSIONS.growthbridge_super_admin;
    const analystPerms = ROLE_PERMISSIONS.growthbridge_analyst;

    expect(canPerformAdminAction('growthbridge_super_admin', superPerms, 'users', 'delete')).toBe(true);
    expect(canPerformAdminAction('growthbridge_super_admin', superPerms, 'audit', 'read')).toBe(true);

    expect(canPerformAdminAction('growthbridge_analyst', analystPerms, 'users', 'delete')).toBe(false);
    expect(canPerformAdminAction('growthbridge_analyst', analystPerms, 'media', 'create')).toBe(false);
  });
});
