// src/__tests__/unit/auth/rbac.test.ts
import { describe, it, expect } from 'vitest';
import { hasPermission, canAccessRoute, getUserPermissions } from '@/lib/auth/rbac';
import { ROLE_PERMISSIONS } from '@/lib/constants/rbac';

describe('RBAC Authorization', () => {
  it('should grant super admin full permissions', () => {
    const permissions = ROLE_PERMISSIONS['growthbridge_super_admin'];
    expect(hasPermission(permissions, 'settings', 'delete')).toBe(true);
    expect(canAccessRoute('/admin/settings', permissions)).toBe(true);
  });

  it('should restrict analyst role to read-only dashboard', () => {
    const permissions = ROLE_PERMISSIONS['growthbridge_analyst'];
    expect(hasPermission(permissions, 'settings', 'update')).toBe(false);
    expect(canAccessRoute('/admin/settings', permissions)).toBe(false);
    expect(canAccessRoute('/admin', permissions)).toBe(true);
  });

  it('should format user permissions correctly into dictionary', () => {
    const perms = getUserPermissions('growthbridge_content_manager');
    expect(perms.content).toContain('create');
    expect(perms.settings).toBeUndefined();
  });
});
