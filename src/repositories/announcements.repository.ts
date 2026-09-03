// src/repositories/announcements.repository.ts
import { createServerClient, createAdminClient } from '@/lib/supabase/server';
import type { Announcement } from '@/lib/types/admin';

function mapDbToAnnouncement(row: any): Announcement {
  return {
    id: row.id,
    title: row.title,
    content: row.content,
    type: row.type,
    priority: row.priority,
    audience: row.audience,
    status: row.status,
    scheduledAt: row.scheduled_at || undefined,
    publishedAt: row.published_at || undefined,
    expiresAt: row.expires_at || undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export class AnnouncementsRepository {
  async getAll(): Promise<Announcement[]> {
    const supabase = await createServerClient();
    const { data, error } = await supabase
      .from('announcements')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[AnnouncementsRepository.getAll]', error);
      throw error;
    }
    return (data || []).map(mapDbToAnnouncement);
  }

  async create(announcement: Partial<Announcement>): Promise<Announcement> {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from('announcements')
      .insert({
        title: announcement.title!,
        content: announcement.content!,
        type: announcement.type || 'info',
        priority: announcement.priority || 'medium',
        audience: announcement.audience || 'public',
        status: announcement.status || 'published',
        scheduled_at: announcement.scheduledAt,
        published_at: announcement.publishedAt || new Date().toISOString(),
        expires_at: announcement.expiresAt,
      } as any)
      .select()
      .single();

    if (error) throw error;
    return mapDbToAnnouncement(data);
  }

  async update(id: string, updates: Partial<Announcement>): Promise<Announcement> {
    const supabase = createAdminClient();
    const payload: any = {};
    if (updates.title !== undefined) payload.title = updates.title;
    if (updates.content !== undefined) payload.content = updates.content;
    if (updates.type !== undefined) payload.type = updates.type;
    if (updates.priority !== undefined) payload.priority = updates.priority;
    if (updates.audience !== undefined) payload.audience = updates.audience;
    if (updates.status !== undefined) payload.status = updates.status;
    if (updates.scheduledAt !== undefined) payload.scheduled_at = updates.scheduledAt;
    if (updates.publishedAt !== undefined) payload.published_at = updates.publishedAt;
    if (updates.expiresAt !== undefined) payload.expires_at = updates.expiresAt;

    const { data, error } = await supabase
      .from('announcements')
      .update(payload)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return mapDbToAnnouncement(data);
  }

  async delete(id: string): Promise<boolean> {
    const supabase = createAdminClient();
    const { error } = await supabase.from('announcements').delete().eq('id', id);
    if (error) throw error;
    return true;
  }
}
