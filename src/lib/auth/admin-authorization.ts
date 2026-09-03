import type { AdminPermission, AdminRole } from '@/lib/types/admin';
import { hasPermission } from '@/lib/constants/rbac';

export type AdminAction = 'read' | 'create' | 'update' | 'delete';

const RESOURCE_ALIASES: Record<string, string> = {
  blog: 'content',
  testimonials: 'content',
  faqs: 'content',
  announcements: 'content',
  'audit-logs': 'audit',
  'media-folders': 'media',
  inquiries: 'applications',
  team: 'people',
};

export function canonicalAdminResource(resource: string): string {
  return RESOURCE_ALIASES[resource] || resource;
}

export function canPerformAdminAction(
  role: AdminRole | string | undefined,
  permissions: AdminPermission[] | undefined,
  resource: string,
  action: AdminAction,
): boolean {
  if (!role || !permissions) return false;
  return hasPermission(permissions, canonicalAdminResource(resource), action);
}
