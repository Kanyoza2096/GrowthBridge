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

type FolderFilter = string | 'all';

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function iconForMime(mimeType: string): { icon: string; color: string } {
  if (mimeType.startsWith('image/')) return { icon: 'IMG', color: 'text-[var(--gb-green-400)]' };
  if (mimeType.startsWith('video/')) return { icon: 'VID', color: 'text-rose-400' };
  if (mimeType.startsWith('audio/')) return { icon: 'AUD', color: 'text-amber-400' };
  if (mimeType.includes('pdf')) return { icon: 'PDF', color: 'text-rose-400' };
  if (mimeType.includes('word') || mimeType.includes('document')) return { icon: 'DOC', color: 'text-blue-400' };
  if (mimeType.includes('sheet') || mimeType.includes('excel')) return { icon: 'XLS', color: 'text-[var(--gb-green-400)]' };
  if (mimeType.includes('zip') || mimeType.includes('compressed')) return { icon: 'ZIP', color: 'text-amber-400' };
  return { icon: 'FILE', color: 'text-[var(--admin-text-secondary)]' };
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
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

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
    setUploadForm({ ...emptyUpload, folder: folderFilter !== 'all' ? folderFilter : 'images' });
    setUploadModalOpen(true);
  };

  const handleUpload = async () => {
    if (!selectedFile) { error('File Required', 'Select a file before uploading.'); return; }
    if (!uploadForm.name.trim()) { error('Validation Error', 'Display name is required.'); return; }
    try {
      const saved = await uploadMedia(selectedFile, {
        name: uploadForm.name.trim(),
        fileName: selectedFile.name,
        folder: uploadForm.folder,
        altText: uploadForm.altText.trim() || undefined,
        mimeType: selectedFile.type || uploadForm.mimeType,
        size: selectedFile.size,
        width: uploadForm.width || undefined,
        height: uploadForm.height || undefined,
      });
      success('Upload Complete', `${saved.name || uploadForm.name} has been added to ${uploadForm.folder}.`);
      setUploadModalOpen(false);
      setUploadForm(emptyUpload);
      setSelectedFile(null);
    } catch (e) {
      error('Upload Failed', e instanceof Error ? e.message : 'The media backend rejected the upload.');
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
    const file = files[0];
    setSelectedFile(file);
    const displayName = file.name.replace(/\.[^.]+$/, '').replace(/[_\-]+/g, ' ');
    setUploadForm({
      name: displayName,
      fileName: file.name,
      folder: folderFilter !== 'all' ? folderFilter : 'images',
      altText: displayName,
      mimeType: file.type || 'application/octet-stream',
      size: file.size,
      width: 0,
      height: 0,
    });
    setUploadModalOpen(true);
    info('Preparing Upload', `${file.name} (${formatSize(file.size)}) ready to upload.`);
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
              const icon =
                f.name === 'images' ? 'IMG' : f.name === 'videos' ? 'VID' : f.name === 'documents' ? 'FILE' : 'FOLDER';
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
                <span className="text-[var(--admin-text-secondary)]">Documents</span>
                <span className="font-bold text-blue-400">
                  {media.filter(
                    (m) =>
                      !m.mimeType.startsWith('image/') &&
                      !m.mimeType.startsWith('video/') &&
                      !m.mimeType.startsWith('audio/')
                  ).length}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--admin-text-secondary)]">Videos</span>
                <span className="font-bold text-rose-400">
                  {media.filter((m) => m.mimeType.startsWith('video/')).length}
                </span>
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
              Supports images, documents, videos. Max 25MB per file.
            </div>
          </div>

          {/* Media Grid */}
          <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4">
            {filtered.map((item) => {
              const { icon, color } = iconForMime(item.mimeType);
              return (
                <Card
                  key={item.id}
                  variant="admin"
                  className="p-0 overflow-hidden group flex flex-col"
                >
                  <div className="aspect-square bg-gradient-to-br from-slate-900 via-[var(--admin-surface-deep)] to-[var(--gb-navy-800)]/30 flex items-center justify-center border-b border-[var(--admin-border)] relative">
                    <div className={`text-6xl ${color}`}>{icon}</div>
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
        onClose={() => setUploadModalOpen(false)}
        title="Upload Media"
        className="max-w-lg"
      >
        <div className="space-y-4">
          <div className="rounded-2xl border-2 border-dashed border-[var(--admin-border-strong)] bg-[var(--admin-surface-card)]/40 p-6 text-center">
            <div className="text-3xl mb-2">↑</div>
            <div className="text-sm font-semibold text-white">Secure Media Upload</div>
            <div className="text-xs text-[var(--admin-text-secondary)] mt-1">
              The selected file is sent to the authenticated media backend. No fake metadata is created.
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-[var(--admin-text-secondary)] uppercase tracking-wider">File *</label>
              <input
                type="file"
                onChange={(e) => setSelectedFile(e.target.files?.[0] ?? null)}
                className="block w-full text-sm text-[var(--admin-text-secondary)] file:mr-4 file:rounded-lg file:border-0 file:bg-emerald-600 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-[var(--gb-green-600)]"
              />
              {selectedFile && (
                <p className="text-[11px] text-[var(--admin-text-tertiary)]">
                  {selectedFile.name} · {formatSize(selectedFile.size)}
                </p>
              )}
            </div>

            <Input
              label="Display Name *"
              value={uploadForm.name}
              onChange={(e) => setUploadForm({ ...uploadForm, name: e.target.value })}
              placeholder="Hero banner - about page"
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="File Name"
                value={uploadForm.fileName}
                onChange={(e) => setUploadForm({ ...uploadForm, fileName: e.target.value })}
                placeholder="hero-about.jpg"
              />
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

            <Input
              label="Alt Text"
              value={uploadForm.altText}
              onChange={(e) => setUploadForm({ ...uploadForm, altText: e.target.value })}
              placeholder="Accessibility description"
            />

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-[var(--admin-text-secondary)] uppercase tracking-wider">
                  File Type
                </label>
                <select
                  value={uploadForm.mimeType}
                  onChange={(e) => setUploadForm({ ...uploadForm, mimeType: e.target.value })}
                  className="w-full rounded-xl bg-[var(--admin-surface-card)]/60 border border-[var(--admin-border)] text-[var(--admin-text-primary)] px-4 py-3 text-sm focus:outline-none focus:border-[var(--gb-green-600)] focus:ring-1 focus:ring-[var(--gb-green-600)]"
                >
                  <option value="image/jpeg">Image (JPG)</option>
                  <option value="image/png">Image (PNG)</option>
                  <option value="image/svg+xml">Image (SVG)</option>
                  <option value="image/webp">Image (WebP)</option>
                  <option value="video/mp4">Video (MP4)</option>
                  <option value="application/pdf">PDF Document</option>
                  <option value="application/msword">Word Document</option>
                  <option value="application/vnd.ms-excel">Excel Sheet</option>
                  <option value="application/zip">ZIP Archive</option>
                </select>
              </div>
              <Input
                type="number"
                label="Width (px)"
                value={uploadForm.width || ''}
                onChange={(e) =>
                  setUploadForm({ ...uploadForm, width: parseInt(e.target.value || '0', 10) || 0 })
                }
                placeholder="1920"
              />
              <Input
                type="number"
                label="Height (px)"
                value={uploadForm.height || ''}
                onChange={(e) =>
                  setUploadForm({ ...uploadForm, height: parseInt(e.target.value || '0', 10) || 0 })
                }
                placeholder="1080"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" onClick={() => setUploadModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpload}>Upload to Library</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
