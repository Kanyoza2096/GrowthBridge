// src/lib/auth/rbac.ts
import { AdminRole, AdminPermission } from '@/lib/types/admin';
import { ROLE_PERMISSIONS, hasPermission, canAccessRoute, ROLE_LABELS } from '@/lib/constants/rbac';

export { ROLE_PERMISSIONS, hasPermission, canAccessRoute, ROLE_LABELS };

export function getUserPermissions(role: AdminRole): Record<string, string[]> {
  const permissions = ROLE_PERMISSIONS[role];
  if (!permissions) return { dashboard: ['read'] };
  return Object.fromEntries(permissions.map((p) => [p.resource, p.actions]));
}

export function isSuperAdmin(role: AdminRole): boolean {
  return role === 'growthbridge_super_admin';
}
