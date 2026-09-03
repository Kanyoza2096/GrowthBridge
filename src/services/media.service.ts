// Server-only media service. Handles validation, Storage, and database metadata.
import { MediaRepository } from '@/repositories/media.repository';
import { createAdminClient } from '@/lib/supabase/server';
import type { MediaItem, MediaFolder } from '@/lib/types/admin';

const MAX_MEDIA_BYTES = 10 * 1024 * 1024;
const ALLOWED_MEDIA_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
]);

const EXTENSIONS: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/gif': 'gif',
};

function safeBaseName(name: string): string {
  return name
    .normalize('NFKC')
    .replace(/[^a-zA-Z0-9._-]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 120) || 'file';
}

async function validateFile(file: File): Promise<void> {
  if (!(file instanceof File) || file.size <= 0) throw new Error('A valid file is required.');
  if (file.size > MAX_MEDIA_BYTES) throw new Error('File exceeds the 10 MB upload limit.');
  if (!ALLOWED_MEDIA_TYPES.has(file.type)) {
    throw new Error('Unsupported file type. Allowed: JPEG, PNG, WebP, and GIF.');
  }

  const bytes = new Uint8Array(await file.slice(0, 12).arrayBuffer());
  const startsWith = (...values: number[]) => values.every((v, i) => bytes[i] === v);
  const validSignature =
    (file.type === 'image/jpeg' && startsWith(0xff, 0xd8, 0xff)) ||
    (file.type === 'image/png' && startsWith(0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a)) ||
    (file.type === 'image/gif' &&
      ((bytes[0] === 0x47 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x38))) ||
    (file.type === 'image/webp' &&
      startsWith(0x52, 0x49, 0x46, 0x46) && bytes[8] === 0x57 && bytes[9] === 0x45 && bytes[10] === 0x42 && bytes[11] === 0x50);

  if (!validSignature) throw new Error('The file content does not match its declared type.');
}

function storagePathFromUrl(url: string): string | null {
  const marker = '/storage/v1/object/public/media/';
  const index = url.indexOf(marker);
  if (index < 0) return null;
  return decodeURIComponent(url.slice(index + marker.length).split('?')[0]);
}

export class MediaService {
  private repo = new MediaRepository();

  async getMedia(): Promise<MediaItem[]> {
    return this.repo.getAll();
  }

  async getFolders(): Promise<MediaFolder[]> {
    return this.repo.getFolders();
  }

  async uploadMedia(file: File, metadata: Partial<MediaItem>, uploadedBy: string): Promise<MediaItem> {
    await validateFile(file);

    const supabase = createAdminClient();
    const folderName = String(metadata.folder || 'root').trim().replace(/^\/+|\/+$/g, '');
    const safeFolder = folderName && /^[a-zA-Z0-9][a-zA-Z0-9/_ -]{0,80}$/.test(folderName)
      ? folderName
      : 'root';
    const safeName = String(metadata.name || file.name).trim().slice(0, 200) || file.name.slice(0, 200);
    const safeAltText = metadata.altText ? String(metadata.altText).trim().slice(0, 500) : undefined;

    let folderId: string | undefined;
    if (safeFolder !== 'root') {
      const { data: existingFolder, error: folderError } = await supabase
        .from('media_folders')
        .select('id')
        .eq('name', safeFolder)
        .limit(1)
        .maybeSingle();
      if (folderError) throw folderError;
      if (existingFolder?.id) {
        folderId = existingFolder.id;
      } else {
        const { data: createdFolder, error: createFolderError } = await supabase
          .from('media_folders')
          .insert({ name: safeFolder })
          .select('id')
          .single();
        if (createFolderError) throw createFolderError;
        folderId = createdFolder.id;
      }
    }

    const extension = EXTENSIONS[file.type];
    const originalBase = safeBaseName(file.name.replace(/\.[^.]+$/, ''));
    const storageName = `${crypto.randomUUID()}-${originalBase}.${extension}`;
    const filePath = `uploads/${storageName}`;

    const { error: uploadError } = await supabase.storage
      .from('media')
      .upload(filePath, file, { contentType: file.type, upsert: false });
    if (uploadError) throw uploadError;

    const { data: publicUrl } = supabase.storage.from('media').getPublicUrl(filePath);

    try {
      return await this.repo.create({
        fileName: file.name,
        name: safeName,
        url: publicUrl.publicUrl,
        mimeType: file.type,
        size: file.size,
        altText: safeAltText,
        folderId,
        uploadedBy,
      });
    } catch (error) {
      await supabase.storage.from('media').remove([filePath]).catch(() => undefined);
      throw error;
    }
  }

  async deleteMedia(id: string): Promise<boolean> {
    const supabase = createAdminClient();
    const { data, error } = await supabase.from('media').select('url').eq('id', id).single();
    if (error) throw error;

    const storagePath = storagePathFromUrl(data.url);
    if (storagePath) {
      const { error: storageError } = await supabase.storage.from('media').remove([storagePath]);
      if (storageError) throw storageError;
    }

    return this.repo.delete(id);
  }
}

export const mediaService = new MediaService();
