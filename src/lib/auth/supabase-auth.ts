// Server-side authentication and authorization helpers.
import { createServerClient } from '@/lib/supabase/server';
import type { AdminUser, AdminRole } from '@/lib/types/admin';
import { ROLE_PERMISSIONS } from '@/lib/constants/rbac';

const VALID_ROLES = new Set<AdminRole>([
  'growthbridge_super_admin',
  'growthbridge_admin',
  'growthbridge_content_manager',
  'growthbridge_project_manager',
  'growthbridge_recruiter',
  'growthbridge_analyst',
]);

export async function getServerUser(): Promise<AdminUser | null> {
  try {
    const supabase = await createServerClient();
    const {
      data: { user: authUser },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !authUser) return null;

    // RLS permits a user to read only their own profile.
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id,email,full_name,avatar_url,role,department,created_at,is_active')
      .eq('id', authUser.id)
      .single();

    if (profileError || !profile || !profile.is_active || !VALID_ROLES.has(profile.role as AdminRole)) {
      return null;
    }

    const role = profile.role as AdminRole;
    const permissions = ROLE_PERMISSIONS[role] || [];

    return {
      id: authUser.id,
      name: profile.full_name || authUser.user_metadata?.full_name || authUser.email?.split('@')[0] || 'User',
      email: authUser.email || profile.email || '',
      role,
      department: profile.department || '',
      avatar: profile.avatar_url || '',
      permissions,
      createdAt: profile.created_at || authUser.created_at,
    };
  } catch (error) {
    console.error('[SupabaseAuth] Error getting server user:', error);
    return null;
  }
}

export async function requireAuth(): Promise<AdminUser> {
  const user = await getServerUser();
  if (!user) throw new Error('Unauthorized');
  return user;
}

export async function requireRole(allowedRoles: AdminRole[]): Promise<AdminUser> {
  const user = await requireAuth();
  if (!allowedRoles.includes(user.role)) throw new Error('Forbidden: insufficient permissions');
  return user;
}
