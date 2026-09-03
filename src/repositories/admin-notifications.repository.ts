import { createAdminClient, createServerClient } from '@/lib/supabase/server';
import type { AdminNotification } from '@/lib/types/admin';

function map(row: any): AdminNotification {
  return {
    id: row.id,
    type: row.type,
    title: row.title,
    message: row.message,
    link: row.link || undefined,
    read: Boolean(row.read),
    createdAt: row.created_at,
  };
}

export class AdminNotificationsRepository {
  async getForUser(userId: string): Promise<AdminNotification[]> {
    const supabase = await createServerClient();
    const { data, error } = await supabase
      .from('admin_notifications')
      .select('*')
      .eq('recipient_id', userId)
      .order('created_at', { ascending: false })
      .limit(100);
    if (error) throw error;
    return (data || []).map(map);
  }

  async markRead(id: string, userId: string): Promise<void> {
    const supabase = await createServerClient();
    const { error } = await supabase.from('admin_notifications').update({ read: true }).eq('id', id).eq('recipient_id', userId);
    if (error) throw error;
  }

  async markAllRead(userId: string): Promise<void> {
    const supabase = await createServerClient();
    const { error } = await supabase.from('admin_notifications').update({ read: true }).eq('recipient_id', userId).eq('read', false);
    if (error) throw error;
  }

  async clearAll(userId: string): Promise<void> {
    const supabase = await createServerClient();
    const { error } = await supabase.from('admin_notifications').delete().eq('recipient_id', userId);
    if (error) throw error;
  }

  async notifyAllActiveAdmins(input: Omit<AdminNotification, 'id' | 'read' | 'createdAt'>): Promise<void> {
    const supabase = createAdminClient();
    const { data: admins, error: adminsError } = await supabase
      .from('profiles')
      .select('id')
      .eq('is_active', true);
    if (adminsError) throw adminsError;
    const rows = (admins || []).map((admin: { id: string }) => ({
      recipient_id: admin.id,
      type: input.type,
      title: input.title,
      message: input.message,
      link: input.link || null,
      read: false,
    }));
    if (!rows.length) return;
    const { error } = await supabase.from('admin_notifications').insert(rows);
    if (error) throw error;
  }
}

export const adminNotificationsRepository = new AdminNotificationsRepository();
