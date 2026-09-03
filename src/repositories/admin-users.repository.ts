import { createAdminClient } from '@/lib/supabase/server';
import type { AdminRole } from '@/lib/types/admin';

export interface AdminManagedUser {
  id: string;
  name: string;
  email: string;
  role: AdminRole;
  department: string;
  avatar: string;
  isActive: boolean;
  createdAt: string;
  lastSignInAt?: string;
}

function mapRow(row: any, authUser?: any): AdminManagedUser {
  return {
    id: row.id,
    name: row.full_name || authUser?.user_metadata?.full_name || authUser?.email?.split('@')[0] || 'User',
    email: authUser?.email || row.email || '',
    role: row.role as AdminRole,
    department: row.department || '',
    avatar: row.avatar_url || '',
    isActive: Boolean(row.is_active),
    createdAt: row.created_at,
    lastSignInAt: authUser?.last_sign_in_at || undefined,
  };
}

export class AdminUsersRepository {
  async getAll(): Promise<AdminManagedUser[]> {
    const supabase = createAdminClient();
    const [{ data: profiles, error: profileError }, { data: authData, error: authError }] = await Promise.all([
      supabase.from('profiles').select('id,email,full_name,avatar_url,role,department,created_at,is_active').order('created_at', { ascending: false }),
      supabase.auth.admin.listUsers({ page: 1, perPage: 1000 }),
    ]);

    if (profileError) throw profileError;
    if (authError) throw authError;

    const authById = new Map((authData?.users || []).map((u) => [u.id, u]));
    return (profiles || []).map((row) => mapRow(row, authById.get(row.id)));
  }

  async create(input: { email: string; password: string; name: string; role: AdminRole; department?: string }) {
    const supabase = createAdminClient();
    const { data, error } = await supabase.auth.admin.createUser({
      email: input.email,
      password: input.password,
      email_confirm: true,
      user_metadata: { full_name: input.name },
    });
    if (error || !data.user) throw error || new Error('Unable to create authentication user.');

    try {
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .update({
          full_name: input.name,
          role: input.role,
          department: input.department || null,
          is_active: true,
        })
        .eq('id', data.user.id)
        .select('id,email,full_name,avatar_url,role,department,created_at,is_active')
        .single();

      if (profileError || !profile) throw profileError || new Error('User profile could not be provisioned.');
      return mapRow(profile, data.user);
    } catch (error) {
      await supabase.auth.admin.deleteUser(data.user.id);
      throw error;
    }
  }

  async update(id: string, input: { role?: AdminRole; department?: string; isActive?: boolean; name?: string }) {
    const supabase = createAdminClient();
    const changes: Record<string, unknown> = {};
    if (input.role !== undefined) changes.role = input.role;
    if (input.department !== undefined) changes.department = input.department || null;
    if (input.isActive !== undefined) changes.is_active = input.isActive;
    if (input.name !== undefined) changes.full_name = input.name;

    const { data: profile, error } = await supabase
      .from('profiles')
      .update(changes)
      .eq('id', id)
      .select('id,email,full_name,avatar_url,role,department,created_at,is_active')
      .single();
    if (error || !profile) throw error || new Error('User not found.');

    const { data: authData } = await supabase.auth.admin.getUserById(id);
    return mapRow(profile, authData.user);
  }

  async countActiveSuperAdmins(excludeId?: string): Promise<number> {
    const supabase = createAdminClient();
    let query = supabase
      .from('profiles')
      .select('id', { count: 'exact', head: true })
      .eq('role', 'growthbridge_super_admin')
      .eq('is_active', true);
    if (excludeId) query = query.neq('id', excludeId);
    const { count, error } = await query;
    if (error) throw error;
    return count || 0;
  }
}

export const adminUsersRepository = new AdminUsersRepository();
