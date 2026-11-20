'use client';

import React, { useState, useMemo } from 'react';
import { AdminEmptyState } from '@/components/admin/AdminEmptyState';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { useAdminAuth } from '@/components/providers/AdminAuthProvider';
import { useAdminData } from '@/components/providers/AdminDataProvider';
import { useToast } from '@/components/providers/ToastProvider';
import { MediaItem, MediaFolder } from '@/lib/types/admin';
import { optimizeImageForUpload } from '@/lib/media/optimize-image';

type FolderFilter = string | 'all';

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

const emptyUpload = {
  name: '',
  fileName: '',
  folder: 'images',
  altText: '',
  mimeType: 'image/jpeg',
  size: 0,
  width: 0,
  height: 0,
};

export default function AdminMediaPage() {
  const { hasPermission } = useAdminAuth();
  const { media, mediaFolders, uploadMedia, deleteMedia } = useAdminData();
  const { success, error, warning, info } = useToast();

  const [folderFilter, setFolderFilter] = useState<FolderFilter>('all');
  const [search, setSearch] = useState('');
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [uploadForm, setUploadForm] = useState(emptyUpload);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({ completed: 0, total: 0 });
  const MAX_BATCH_FILES = 20;

  const canCreate = hasPermission('media', 'create');
  const canDelete = hasPermission('media', 'delete');

  const allFolders: MediaFolder[] = useMemo(() => {
    const names = new Set(mediaFolders.map((f) => f.name));
    media.forEach((m) => {
      const top = m.folder.split('/')[0];
      if (top) names.add(top);
    });
    const merged: MediaFolder[] = [...mediaFolders];
    names.forEach((n) => {
      if (!merged.some((f) => f.name === n)) {
        merged.push({ id: `f-${n}`, name: n, itemCount: 0, createdAt: new Date().toISOString() });
      }
    });
    return merged.sort((a, b) => a.name.localeCompare(b.name));
  }, [mediaFolders, media]);

  const filtered = useMemo(() => {
    return media.filter((m) => {
      const matchesFolder =
        folderFilter === 'all' || m.folder === folderFilter || m.folder.startsWith(folderFilter + '/');
      const q = search.toLowerCase();
      const matchesSearch =
        m.name.toLowerCase().includes(q) ||
        m.fileName.toLowerCase().includes(q) ||
        (m.altText || '').toLowerCase().includes(q) ||
        m.uploadedBy.toLowerCase().includes(q);
      return matchesFolder && matchesSearch;
    });
  }, [media, folderFilter, search]);

  const folderCounts = useMemo(() => {
    const counts: Record<string, number> = { all: media.length };
    media.forEach((m) => {
      const top = m.folder.split('/')[0];
      counts[top] = (counts[top] || 0) + 1;
      counts[m.folder] = (counts[m.folder] || 0) + 1;
    });
    return counts;
  }, [media]);

  const openUpload = () => {
    if (!canCreate) {
      warning('Permission Denied', 'You do not have permission to upload media.');
      return;
    }
    setSelectedFiles([]);
    setUploadProgress({ completed: 0, total: 0 });
    setUploadForm({ ...emptyUpload, folder: folderFilter !== 'all' ? folderFilter : 'images' });
    setUploadModalOpen(true);
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) { error('Files Required', 'Choose one or more images before uploading.'); return; }
    if (selectedFiles.length > MAX_BATCH_FILES) {
      error('Batch Too Large', `Choose no more than ${MAX_BATCH_FILES} images per batch.`);
      return;
    }
    if (selectedFiles.length === 1 && !uploadForm.name.trim()) {
      error('Validation Error', 'Display name is required.');
      return;
    }

    setIsUploading(true);
    setUploadProgress({ completed: 0, total: selectedFiles.length });
    const failures: string[] = [];
    let uploaded = 0;

    try {
      for (const [index, sourceFile] of selectedFiles.entries()) {
        const baseName = sourceFile.name.replace(/\\.[^.]+$/, '').replace(/[_-]+/g, ' ').trim();
        try {
          const optimized = await optimizeImageForUpload(sourceFile);
          await uploadMedia(optimized.file, {
            name: selectedFiles.length === 1 ? uploadForm.name.trim() : baseName || 'Uploaded image',
            fileName: optimized.file.name,
            folder: uploadForm.folder,
            altText: selectedFiles.length === 1
              ? uploadForm.altText.trim() || undefined
              : baseName || undefined,
            mimeType: optimized.file.type,
            size: optimized.file.size,
            width: optimized.width || (selectedFiles.length === 1 ? uploadForm.width : undefined) || undefined,
            height: optimized.height || (selectedFiles.length === 1 ? uploadForm.height : undefined) || undefined,
          });
          uploaded += 1;
        } catch (uploadError) {
          failures.push(`${sourceFile.name}: ${uploadError instanceof Error ? uploadError.message : 'Upload failed'}`);
        } finally {
          setUploadProgress({ completed: index + 1, total: selectedFiles.length });
        }
      }

      if (uploaded > 0) {
        success('Batch Upload Complete', `${uploaded} of ${selectedFiles.length} images added to ${uploadForm.folder}.`);
      }
      if (failures.length > 0) {
        error('Some Images Were Not Uploaded', failures.slice(0, 3).join(' • ') + (failures.length > 3 ? ` • and ${failures.length - 3} more` : ''));
      }
      if (failures.length === 0) {
        setUploadModalOpen(false);
        setUploadForm(emptyUpload);
        setSelectedFiles([]);
      }
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (item: MediaItem) => {
    if (!canDelete) { warning('Permission Denied', 'You do not have permission to delete media.'); return; }
    if (!window.confirm(`Delete "${item.name}"? This cannot be undone.`)) return;
    try {
      await deleteMedia(item.id);
      success('Media Deleted', `${item.name} has been removed.`);
    } catch (e) {
      error('Delete Failed', e instanceof Error ? e.message : 'The media backend rejected the deletion.');
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (!canCreate) {
      warning('Permission Denied', 'You do not have permission to upload media.');
      return;
    }
    const files = Array.from(e.dataTransfer.files || []);
    if (files.length === 0) {
      info('Drop Detected', 'No files found in drop. Use the upload dialog.');
      openUpload();
      return;
    }
    const images = files.filter((file) => file.type.startsWith('image/')).slice(0, MAX_BATCH_FILES);
    if (images.length === 0) {
      warning('No Supported Images', 'Drop JPEG, PNG, WebP or GIF images to upload.');
      return;
    }
    setSelectedFiles(images);
    const firstName = images[0].name.replace(/\.[^.]+$/, '').replace(/[_-]+/g, ' ');
    setUploadForm({
      ...emptyUpload,
      name: firstName,
      fileName: images[0].name,
      folder: folderFilter !== 'all' ? folderFilter : 'images',
      altText: firstName,
    });
    setUploadModalOpen(true);
    info('Images Ready', `${images.length} image${images.length === 1 ? '' : 's'} selected for upload.`);
  };

  return (
    <div className="admin-page space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Badge variant="orange" className="text-[9px] mb-1">ASSETS & STORAGE</Badge>
          <h1 className="text-2xl font-extrabold text-white">Media Library</h1>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button size="sm" onClick={openUpload} disabled={!canCreate}>
            ⬆ Upload Media
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-6">
        {/* Sidebar - Folders */}
        <aside className="space-y-4">
          <Card variant="solid" className="p-4 space-y-1">
            <div className="text-[10px] uppercase tracking-wider text-[var(--admin-text-tertiary)] font-bold px-2 pb-2">
              Folders
            </div>
            <button
              onClick={() => setFolderFilter('all')}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm transition-colors cursor-pointer ${
                folderFilter === 'all'
                  ? 'bg-[var(--gb-green-600)]/15 border border-[var(--gb-green-600)]/40 text-[var(--gb-green-300)]'
                  : 'text-[var(--admin-text-secondary)] hover:bg-[var(--admin-surface-soft)]/60'
              }`}
            >
              <span className="flex items-center gap-2.5">
                <span className="text-base">Media</span>
                <span className="font-medium">All Media</span>
              </span>
              <span className="text-xs font-semibold opacity-70">{folderCounts.all || 0}</span>
            </button>
            <div className="my-2 border-t border-[var(--admin-border)]" />
            {allFolders.map((f) => {
              const count = folderCounts[f.name] || f.itemCount || 0;
              const icon = f.name === 'images' ? 'IMG' : 'FOLDER';
              return (
                <button
                  key={f.id}
                  onClick={() => setFolderFilter(f.name)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm transition-colors cursor-pointer ${
                    folderFilter === f.name
                      ? 'bg-[var(--gb-navy-800)]/60 border border-[var(--gb-navy-800)] text-blue-200'
                      : 'text-[var(--admin-text-secondary)] hover:bg-[var(--admin-surface-soft)]/60'
                  }`}
                >
                  <span className="flex items-center gap-2.5">
                    <span className="text-base">{icon}</span>
                    <span className="font-medium capitalize">{f.name}</span>
                  </span>
                  <span className="text-xs font-semibold opacity-70">{count}</span>
                </button>
              );
            })}
          </Card>

          <Card variant="admin" className="p-4">
            <div className="text-[10px] uppercase tracking-wider text-[var(--admin-text-tertiary)] font-bold pb-2">
              Quick Stats
            </div>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-[var(--admin-text-secondary)]">Total Items</span>
                <span className="font-bold text-white">{media.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--admin-text-secondary)]">Images</span>
                <span className="font-bold text-[var(--gb-green-400)]">
                  {media.filter((m) => m.mimeType.startsWith('image/')).length}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--admin-text-secondary)]">Storage used</span>
                <span className="font-bold text-white">{formatSize(media.reduce((total, item) => total + item.size, 0))}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--admin-text-secondary)]">Upload limit</span>
                <span className="font-bold text-[var(--gb-green-400)]">2 MB / image</span>
              </div>
            </div>
          </Card>
        </aside>

        {/* Main Content */}
        <main className="space-y-5 min-w-0">
          <div className="max-w-md">
            <Input
              placeholder="Search by name, file, uploader..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {/* Drop Zone */}
          <div
            onDragOver={(e) => {
              e.preventDefault();
            }}
            onDrop={handleDrop}
            className="border-2 border-dashed border-[var(--admin-border-strong)] hover:border-[var(--gb-green-600)]/60 rounded-2xl p-8 text-center transition-colors bg-[var(--admin-surface-card)]/30 cursor-pointer"
            onClick={openUpload}
          >
            <div className="text-4xl mb-2">↑</div>
            <div className="text-sm font-semibold text-white">
              Drag &amp; drop files here, or click to upload
            </div>
            <div className="text-xs text-[var(--admin-text-secondary)] mt-1">
              JPEG, PNG, WebP and GIF images only · Max 2 MB after optimization.
            </div>
          </div>

          {/* Media Grid */}
          <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4">
            {filtered.map((item) => {
              return (
                <Card
                  key={item.id}
                  variant="admin"
                  className="p-0 overflow-hidden group flex flex-col"
                >
                  <div className="aspect-square bg-gradient-to-br from-slate-900 via-[var(--admin-surface-deep)] to-[var(--gb-navy-800)]/30 flex items-center justify-center border-b border-[var(--admin-border)] relative">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={item.url} alt={item.altText || item.name} loading="lazy" className="w-full h-full object-cover" />
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(item);
                        }}
                        disabled={!canDelete}
                        className="bg-[var(--admin-surface-deep)]/80 backdrop-blur-sm text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 !px-2 !py-1"
                      >
                        ✕
                      </Button>
                    </div>
                  </div>
                  <div className="p-3 space-y-2 flex-1 flex flex-col">
                    <div className="min-w-0">
                      <div className="text-sm font-semibold text-white truncate" title={item.name}>
                        {item.name}
                      </div>
                      <div className="text-[11px] text-[var(--admin-text-tertiary)] truncate" title={item.fileName}>
                        {item.fileName}
                      </div>
                    </div>
                    <div className="mt-auto space-y-1 text-[11px] text-[var(--admin-text-secondary)]">
                      <div className="flex justify-between">
                        <span>Size</span>
                        <span className="text-[var(--admin-text-primary)] font-medium">{formatSize(item.size)}</span>
                      </div>
                      {(item.width || item.height) && (
                        <div className="flex justify-between">
                          <span>Dimensions</span>
                          <span className="text-[var(--admin-text-primary)] font-medium">
                            {item.width || '?'} × {item.height || '?'}
                          </span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span>Folder</span>
                        <span className="text-[var(--admin-text-primary)] font-medium capitalize">{item.folder}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Uploader</span>
                        <span className="text-[var(--admin-text-primary)] font-medium truncate ml-2" title={item.uploadedBy}>
                          {item.uploadedBy}
                        </span>
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })}
            {filtered.length === 0 && (
              <AdminEmptyState
                icon={search ? 'search' : 'inbox'}
                title={search ? 'No matching media' : 'Media library is empty'}
                description={search ? 'Try another search or clear the current filters.' : 'Upload approved brand assets, team portraits, and marketing imagery to make them available across the site.'}
                action={<Button size="sm" variant="outline" onClick={openUpload} disabled={!canCreate}>Upload media</Button>}
              />
            )}
          </div>
        </main>
      </div>

      <Modal
        isOpen={uploadModalOpen}
        onClose={() => { if (!isUploading) setUploadModalOpen(false); }}
        title="Upload Media"
        className="max-w-lg"
      >
        <div className="space-y-4">
          <div className="rounded-2xl border-2 border-dashed border-[var(--admin-border-strong)] bg-[var(--admin-surface-card)]/40 p-6 text-center">
            <div className="text-3xl mb-2">↑</div>
            <div className="text-sm font-semibold text-white">Secure Media Upload</div>
            <div className="text-xs text-[var(--admin-text-secondary)] mt-1">
              Images are optimized in your browser before upload. Raster images become WebP; animated GIFs stay animated. Videos and documents are blocked.
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-[var(--admin-text-secondary)] uppercase tracking-wider">File *</label>
              <input
                type="file"
                multiple
                accept="image/jpeg,image/png,image/webp,image/gif"
                disabled={isUploading}
                onChange={(e) => {
                  const files = Array.from(e.target.files || []).slice(0, MAX_BATCH_FILES);
                  setSelectedFiles(files);
                  if (files.length > 0) {
                    const firstName = files[0].name.replace(/\.[^.]+$/, '').replace(/[_-]+/g, ' ');
                    setUploadForm((current) => ({
                      ...current,
                      name: firstName,
                      fileName: files[0].name,
                      altText: firstName,
                    }));
                  }
                }}
                className="block w-full text-sm text-[var(--admin-text-secondary)] file:mr-4 file:rounded-lg file:border-0 file:bg-emerald-600 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-[var(--gb-green-600)]"
              />
              <p className="text-[11px] text-[var(--admin-text-tertiary)]">
                Select up to {MAX_BATCH_FILES} images at once. Each image is optimized and uploaded separately.
              </p>
              {selectedFiles.length > 0 && (
                <div className="rounded-xl border border-[var(--admin-border)] bg-[var(--admin-surface-card)]/40 p-3 space-y-1">
                  <p className="text-xs font-semibold text-white">{selectedFiles.length} image{selectedFiles.length === 1 ? '' : 's'} selected · {formatSize(selectedFiles.reduce((total, file) => total + file.size, 0))} total</p>
                  <ul className="max-h-28 overflow-y-auto text-[11px] text-[var(--admin-text-secondary)] space-y-1">
                    {selectedFiles.map((file) => <li key={file.name + file.lastModified}>{file.name} · {formatSize(file.size)}</li>)}
                  </ul>
                </div>
              )}
            </div>

            {selectedFiles.length <= 1 && (
              <>
                <Input
                  label="Display Name *"
                  value={uploadForm.name}
                  onChange={(e) => setUploadForm({ ...uploadForm, name: e.target.value })}
                  placeholder="Hero banner - about page"
                />
                <Input
                  label="Alt Text"
                  value={uploadForm.altText}
                  onChange={(e) => setUploadForm({ ...uploadForm, altText: e.target.value })}
                  placeholder="Accessibility description"
                />
              </>
            )}
            {selectedFiles.length > 1 && (
              <p className="text-xs text-[var(--admin-text-secondary)]">
                Each image will use its filename as its display name and draft alt text. You can edit individual details after upload.
              </p>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-[var(--admin-text-secondary)] uppercase tracking-wider">
                  Folder
                </label>
                <select
                  value={uploadForm.folder}
                  onChange={(e) => setUploadForm({ ...uploadForm, folder: e.target.value })}
                  className="w-full rounded-xl bg-[var(--admin-surface-card)]/60 border border-[var(--admin-border)] text-[var(--admin-text-primary)] px-4 py-3 text-sm focus:outline-none focus:border-[var(--gb-green-600)] focus:ring-1 focus:ring-[var(--gb-green-600)]"
                >
                  {allFolders.map((f) => (
                    <option key={f.id} value={f.name}>
                      {f.name.charAt(0).toUpperCase() + f.name.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="rounded-xl border border-[var(--admin-border)] bg-[var(--admin-surface-card)]/50 px-4 py-3 text-xs text-[var(--admin-text-secondary)]">
                <span className="block font-semibold text-[var(--admin-text-primary)]">Automatic optimization</span>
                JPEG, PNG and WebP are resized and converted to WebP. Animated GIFs are preserved.
              </div>
              {selectedFiles.length <= 1 && (
                <Input
                  type="number"
                  label="Width (px)"
                  value={uploadForm.width || ''}
                  onChange={(e) =>
                    setUploadForm({ ...uploadForm, width: parseInt(e.target.value || '0', 10) || 0 })
                  }
                  placeholder="1920"
                />
              )}
              {selectedFiles.length <= 1 && (
                <Input
                  type="number"
                  label="Height (px)"
                  value={uploadForm.height || ''}
                  onChange={(e) =>
                    setUploadForm({ ...uploadForm, height: parseInt(e.target.value || '0', 10) || 0 })
                  }
                  placeholder="1080"
                />
              )}
            </div>
          </div>

          {isUploading && (
            <div className="space-y-2" aria-live="polite">
              <div className="flex justify-between text-xs text-[var(--admin-text-secondary)]">
                <span>Uploading images…</span>
                <span>{uploadProgress.completed} / {uploadProgress.total}</span>
              </div>
              <div className="h-2 rounded-full bg-[var(--admin-surface-soft)] overflow-hidden">
                <div
                  className="h-full bg-[var(--gb-green-600)] transition-all"
                  style={{ width: `${uploadProgress.total ? (uploadProgress.completed / uploadProgress.total) * 100 : 0}%` }}
                />
              </div>
            </div>
          )}
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" disabled={isUploading} onClick={() => setUploadModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpload} disabled={isUploading || selectedFiles.length === 0}>
              {isUploading ? 'Uploading…' : selectedFiles.length > 1 ? `Upload ${selectedFiles.length} Images` : 'Upload to Library'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
