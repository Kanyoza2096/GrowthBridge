// src/repositories/media.repository.ts
import 'server-only';
import { createServerClient, createAdminClient } from '@/lib/supabase/server';
import type { MediaItem, MediaFolder } from '@/lib/types/admin';

function mapDbToMedia(row: any): MediaItem {
  return {
    id: row.id,
    name: row.name,
    fileName: row.file_name,
    url: row.url,
    mimeType: row.mime_type,
    size: Number(row.size_bytes),
    width: row.width || undefined,
    height: row.height || undefined,
    folder: row.folder_id || 'root',
    uploadedBy: row.uploaded_by || 'Admin',
    altText: row.alt_text || undefined,
    createdAt: row.created_at,
  };
}

export class MediaRepository {
  async getAll(): Promise<MediaItem[]> {
    const supabase = await createServerClient();
    const { data, error } = await supabase
      .from('media')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[MediaRepository.getAll]', error);
      return [];
    }
    return (data || []).map(mapDbToMedia);
  }

  async getFolders(): Promise<MediaFolder[]> {
    const supabase = await createServerClient();
    const { data, error } = await supabase
      .from('media_folders')
      .select('*')
      .order('name', { ascending: true });

    if (error) {
      console.error('[MediaRepository.getFolders]', error);
      return [];
    }
    return (data || []).map((f: any) => ({
      id: f.id,
      name: f.name,
      parentId: f.parent_id || undefined,
      itemCount: 0,
      createdAt: f.created_at,
    }));
  }

  async create(media: Partial<MediaItem>): Promise<MediaItem> {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from('media')
      .insert({
        name: media.name || media.fileName!,
        file_name: media.fileName!,
        url: media.url!,
        mime_type: media.mimeType || 'image/jpeg',
        size_bytes: media.size || 0,
        width: media.width,
        height: media.height,
        alt_text: media.altText,
      } as any)
      .select()
      .single();

    if (error) throw error;
    return mapDbToMedia(data);
  }

  async delete(id: string): Promise<boolean> {
    const supabase = createAdminClient();
    const { error } = await supabase.from('media').delete().eq('id', id);
    return !error;
  }
}
