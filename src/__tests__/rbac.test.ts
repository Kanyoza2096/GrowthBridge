import { describe, it, expect } from 'vitest';
import { ROLE_PERMISSIONS, hasPermission, canAccessRoute } from '@/lib/constants/rbac';
import type { AdminRole } from '@/lib/types/admin';

describe('RBAC', () => {
  it('super admin has full dashboard access', () => {
    const perms = ROLE_PERMISSIONS.growthbridge_super_admin;
    expect(hasPermission(perms, 'dashboard', 'read')).toBe(true);
    expect(hasPermission(perms, 'settings', 'delete')).toBe(true);
    expect(hasPermission(perms, 'users', 'create')).toBe(true);
  });

  it('analyst is read-only on dashboard/analytics', () => {
    const perms = ROLE_PERMISSIONS.growthbridge_analyst;
    expect(hasPermission(perms, 'dashboard', 'read')).toBe(true);
    expect(hasPermission(perms, 'analytics', 'read')).toBe(true);
    expect(hasPermission(perms, 'applications', 'update')).toBe(false);
    expect(hasPermission(perms, 'settings', 'delete')).toBe(false);
  });

  it('recruiter can manage applications and talent', () => {
    const perms = ROLE_PERMISSIONS.growthbridge_recruiter;
    expect(hasPermission(perms, 'applications', 'update')).toBe(true);
    expect(hasPermission(perms, 'talent', 'create')).toBe(true);
    expect(hasPermission(perms, 'settings', 'update')).toBe(false);
  });

  it('canAccessRoute maps admin routes correctly', () => {
    const recruiter = ROLE_PERMISSIONS.growthbridge_recruiter;
    expect(canAccessRoute('/admin', recruiter)).toBe(true);
    expect(canAccessRoute('/admin/applications', recruiter)).toBe(true);
    // settings typically requires settings permission — analyst/recruiter may not have it
    const analyst = ROLE_PERMISSIONS.growthbridge_analyst;
    expect(canAccessRoute('/admin/settings', analyst)).toBe(false);
  });

  it('every role has a permission set defined', () => {
    const roles: AdminRole[] = [
      'growthbridge_super_admin',
      'growthbridge_admin',
      'growthbridge_content_manager',
      'growthbridge_project_manager',
      'growthbridge_recruiter',
      'growthbridge_analyst',
    ];
    for (const role of roles) {
      expect(ROLE_PERMISSIONS[role]).toBeDefined();
      expect(ROLE_PERMISSIONS[role].length).toBeGreaterThan(0);
    }
  });
});
