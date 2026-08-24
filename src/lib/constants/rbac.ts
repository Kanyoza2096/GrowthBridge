import { AdminRole, AdminPermission } from '../types/admin';

export const ROLE_LABELS: Record<AdminRole, string> = {
  growthbridge_super_admin: 'Super Admin',
  growthbridge_admin: 'Organization Admin',
  growthbridge_content_manager: 'Content Manager',
  growthbridge_project_manager: 'Project Manager',
  growthbridge_recruiter: 'Recruiter',
  growthbridge_analyst: 'Analyst',
};

const ALL: AdminPermission[] = [
  { resource: 'dashboard', actions: ['read', 'create', 'update', 'delete'] },
  { resource: 'services', actions: ['read', 'create', 'update', 'delete'] },
  { resource: 'projects', actions: ['read', 'create', 'update', 'delete'] },
  { resource: 'talent', actions: ['read', 'create', 'update', 'delete'] },
  { resource: 'applications', actions: ['read', 'create', 'update', 'delete'] },
  { resource: 'content', actions: ['read', 'create', 'update', 'delete'] },
  { resource: 'media', actions: ['read', 'create', 'update', 'delete'] },
  { resource: 'partners', actions: ['read', 'create', 'update', 'delete'] },
  { resource: 'analytics', actions: ['read', 'create', 'update', 'delete'] },
  { resource: 'settings', actions: ['read', 'create', 'update', 'delete'] },
  { resource: 'audit', actions: ['read', 'create', 'update', 'delete'] },
  { resource: 'notifications', actions: ['read', 'create', 'update', 'delete'] },
  { resource: 'users', actions: ['read', 'create', 'update', 'delete'] },
];

const READ_ONLY_DASHBOARD: AdminPermission[] = [
  { resource: 'dashboard', actions: ['read'] },
  { resource: 'analytics', actions: ['read'] },
];

export const ROLE_PERMISSIONS: Record<AdminRole, AdminPermission[]> = {
  growthbridge_super_admin: ALL,

  growthbridge_admin: [
    { resource: 'dashboard', actions: ['read', 'create', 'update', 'delete'] },
    { resource: 'services', actions: ['read', 'create', 'update', 'delete'] },
    { resource: 'projects', actions: ['read', 'create', 'update', 'delete'] },
    { resource: 'talent', actions: ['read', 'create', 'update', 'delete'] },
    { resource: 'applications', actions: ['read', 'create', 'update', 'delete'] },
    { resource: 'content', actions: ['read', 'create', 'update', 'delete'] },
    { resource: 'media', actions: ['read', 'create', 'update', 'delete'] },
    { resource: 'partners', actions: ['read', 'create', 'update', 'delete'] },
    { resource: 'analytics', actions: ['read', 'create', 'update', 'delete'] },
    { resource: 'settings', actions: ['read', 'update'] },
    { resource: 'audit', actions: ['read'] },
    { resource: 'notifications', actions: ['read', 'create', 'update', 'delete'] },
  ],

  growthbridge_content_manager: [
    { resource: 'dashboard', actions: ['read'] },
    { resource: 'content', actions: ['read', 'create', 'update', 'delete'] },
    { resource: 'media', actions: ['read', 'create', 'update', 'delete'] },
    { resource: 'services', actions: ['read'] },
    { resource: 'projects', actions: ['read'] },
    { resource: 'notifications', actions: ['read', 'update'] },
    { resource: 'analytics', actions: ['read'] },
  ],

  growthbridge_project_manager: [
    { resource: 'dashboard', actions: ['read'] },
    { resource: 'projects', actions: ['read', 'create', 'update', 'delete'] },
    { resource: 'media', actions: ['read', 'create', 'update', 'delete'] },
    { resource: 'services', actions: ['read'] },
    { resource: 'partners', actions: ['read'] },
    { resource: 'notifications', actions: ['read', 'update'] },
    { resource: 'analytics', actions: ['read'] },
  ],

  growthbridge_recruiter: [
    { resource: 'dashboard', actions: ['read'] },
    { resource: 'talent', actions: ['read', 'create', 'update', 'delete'] },
    { resource: 'applications', actions: ['read', 'create', 'update', 'delete'] },
    { resource: 'notifications', actions: ['read', 'update'] },
    { resource: 'analytics', actions: ['read'] },
  ],

  growthbridge_analyst: READ_ONLY_DASHBOARD,
};

export function hasPermission(
  permissions: AdminPermission[],
  resource: string,
  action: 'read' | 'create' | 'update' | 'delete'
): boolean {
  const perm = permissions.find((p) => p.resource === resource);
  if (!perm) return false;
  return perm.actions.includes(action);
}

export function canAccessRoute(route: string, permissions: AdminPermission[]): boolean {
  const routeToResource: Record<string, string> = {
    '/admin': 'dashboard',
    '/admin/services': 'services',
    '/admin/projects': 'projects',
    '/admin/talent': 'talent',
    '/admin/applications': 'applications',
    '/admin/blog': 'content',
    '/admin/testimonials': 'content',
    '/admin/faqs': 'content',
    '/admin/announcements': 'content',
    '/admin/content': 'content',
    '/admin/media': 'media',
    '/admin/partners': 'partners',
    '/admin/analytics': 'analytics',
    '/admin/settings': 'settings',
    '/admin/audit-log': 'audit',
    '/admin/notifications': 'notifications',
    '/admin/inquiries': 'applications',
    '/admin/users': 'users',
  };

  const resource = routeToResource[route];
  if (!resource) return true;
  return hasPermission(permissions, resource, 'read');
}
