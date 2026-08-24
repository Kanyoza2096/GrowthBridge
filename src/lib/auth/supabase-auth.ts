// src/lib/auth/supabase-auth.ts
import 'server-only';
import { createServerClient, createAdminClient } from '@/lib/supabase/server';
import type { AdminUser, AdminRole } from '@/lib/types/admin';
import { ROLE_PERMISSIONS } from '@/lib/constants/rbac';

export async function getServerUser(): Promise<AdminUser | null> {
  try {
    const supabase = await createServerClient();
    const {
      data: { user: authUser },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !authUser) return null;

    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', authUser.id)
      .single();

    const role = (profile?.role || 'growthbridge_analyst') as AdminRole;
    const permissions = ROLE_PERMISSIONS[role] || [];

    return {
      id: authUser.id,
      name: profile?.full_name || authUser.user_metadata?.full_name || authUser.email?.split('@')[0] || 'User',
      email: authUser.email || '',
      role,
      department: profile?.department || '',
      avatar: profile?.avatar_url || authUser.user_metadata?.avatar_url || '',
      permissions,
      createdAt: profile?.created_at || authUser.created_at,
    };
  } catch (error) {
    console.error('[SupabaseAuth] Error getting server user:', error);
    return null;
  }
}

export async function requireAuth(): Promise<AdminUser> {
  const user = await getServerUser();
  if (!user) {
    throw new Error('Unauthorized');
  }
  return user;
}

export async function requireRole(allowedRoles: AdminRole[]): Promise<AdminUser> {
  const user = await requireAuth();
  if (!allowedRoles.includes(user.role)) {
    throw new Error('Forbidden: insufficient permissions');
  }
  return user;
}
