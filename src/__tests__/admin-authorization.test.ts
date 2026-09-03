import { describe, expect, it } from 'vitest';
import { ROLE_PERMISSIONS } from '@/lib/constants/rbac';
import { canPerformAdminAction } from '@/lib/auth/admin-authorization';

describe('admin authorization', () => {
  it('enforces resource + action permissions', () => {
    const content = ROLE_PERMISSIONS.growthbridge_content_manager;
    expect(canPerformAdminAction('growthbridge_content_manager', content, 'services', 'read')).toBe(true);
    expect(canPerformAdminAction('growthbridge_content_manager', content, 'services', 'update')).toBe(false);
    expect(canPerformAdminAction('growthbridge_content_manager', content, 'projects', 'delete')).toBe(false);
    expect(canPerformAdminAction('growthbridge_content_manager', content, 'blog', 'delete')).toBe(true);
  });

  it('maps API aliases to their RBAC resources', () => {
    const recruiter = ROLE_PERMISSIONS.growthbridge_recruiter;
    expect(canPerformAdminAction('growthbridge_recruiter', recruiter, 'applications', 'update')).toBe(true);
    expect(canPerformAdminAction('growthbridge_recruiter', recruiter, 'inquiries', 'update')).toBe(true);
    expect(canPerformAdminAction('growthbridge_recruiter', recruiter, 'media', 'update')).toBe(false);
  });

  it('keeps settings and audit access restricted', () => {
    const admin = ROLE_PERMISSIONS.growthbridge_admin;
    const analyst = ROLE_PERMISSIONS.growthbridge_analyst;
    expect(canPerformAdminAction('growthbridge_admin', admin, 'settings', 'update')).toBe(true);
    expect(canPerformAdminAction('growthbridge_admin', admin, 'audit-logs', 'read')).toBe(true);
    expect(canPerformAdminAction('growthbridge_analyst', analyst, 'settings', 'read')).toBe(false);
    expect(canPerformAdminAction('growthbridge_analyst', analyst, 'audit-logs', 'read')).toBe(false);
  });

  it('keeps navigation resources aligned with their API permissions', () => {
    const recruiter = ROLE_PERMISSIONS.growthbridge_recruiter;
    const projectManager = ROLE_PERMISSIONS.growthbridge_project_manager;
    const admin = ROLE_PERMISSIONS.growthbridge_admin;

    expect(canPerformAdminAction('growthbridge_recruiter', recruiter, 'people', 'read')).toBe(false);
    expect(canPerformAdminAction('growthbridge_project_manager', projectManager, 'people', 'read')).toBe(false);
    expect(canPerformAdminAction('growthbridge_admin', admin, 'people', 'read')).toBe(true);
  });

});
