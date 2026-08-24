// src/services/media.service.ts
import 'server-only';
import { MediaRepository } from '@/repositories/media.repository';
import { createAdminClient } from '@/lib/supabase/server';
import type { MediaItem, MediaFolder } from '@/lib/types/admin';

export class MediaService {
  private repo = new MediaRepository();

  async getMedia(): Promise<MediaItem[]> {
    return this.repo.getAll();
  }

  async getFolders(): Promise<MediaFolder[]> {
    return this.repo.getFolders();
  }

  async uploadMedia(file: File, metadata: Partial<MediaItem>): Promise<MediaItem> {
    const supabase = createAdminClient();
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
    const filePath = `uploads/${fileName}`;

    // Upload to Supabase Storage bucket 'media'
    const { error: uploadError } = await supabase.storage
      .from('media')
      .upload(filePath, file);

    let url = `/uploads/${fileName}`;
    if (!uploadError) {
      const { data } = supabase.storage.from('media').getPublicUrl(filePath);
      url = data.publicUrl;
    }

    return this.repo.create({
      fileName: file.name,
      name: metadata.name || file.name,
      url,
      mimeType: file.type,
      size: file.size,
      folder: metadata.folder,
      altText: metadata.altText,
    });
  }

  async deleteMedia(id: string): Promise<boolean> {
    return this.repo.delete(id);
  }
}

export const mediaService = new MediaService();
