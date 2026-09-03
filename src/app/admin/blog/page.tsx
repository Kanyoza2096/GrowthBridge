'use client';

import React, { useState, useMemo } from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Modal } from '@/components/ui/Modal';
import { useAdminAuth } from '@/components/providers/AdminAuthProvider';
import { useAdminData } from '@/components/providers/AdminDataProvider';
import { useToast } from '@/components/providers/ToastProvider';
import type { BlogPost } from '@/lib/types/admin';

type StatusFilter = 'all' | BlogPost['status'];

const statusBadge: Record<string, { variant: 'green' | 'blue' | 'orange' | 'outline'; label: string }> = {
  published: { variant: 'green', label: 'PUBLISHED' },
  scheduled: { variant: 'blue', label: 'SCHEDULED' },
  draft: { variant: 'orange', label: 'DRAFT' },
  archived: { variant: 'outline', label: 'ARCHIVED' },
};

function formatDate(iso?: string): string {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
  } catch {
    return '—';
  }
}

export default function AdminBlogPage() {
  const { hasPermission } = useAdminAuth();
  const { blogPosts, upsertBlogPost, deleteBlogPost } = useAdminData();
  const { success, error } = useToast();

  const canRead = hasPermission('blog', 'read');
  const canCreate = hasPermission('blog', 'create');
  const canUpdate = hasPermission('blog', 'update');
  const canDelete = hasPermission('blog', 'delete');

  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [search, setSearch] = useState('');

  const [modalOpen, setModalOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);

  const [formTitle, setFormTitle] = useState('');
  const [formSlug, setFormSlug] = useState('');
  const [formCategory, setFormCategory] = useState('');
  const [formTags, setFormTags] = useState('');
  const [formExcerpt, setFormExcerpt] = useState('');
  const [formContent, setFormContent] = useState('');
  const [formStatus, setFormStatus] = useState<BlogPost['status']>('draft');
  const [formScheduledAt, setFormScheduledAt] = useState('');
  const [formAuthor, setFormAuthor] = useState('');

  const filteredPosts = useMemo(() => {
    return blogPosts.filter((b) => {
      const matchesStatus = statusFilter === 'all' || b.status === statusFilter;
      const s = search.toLowerCase();
      const matchesSearch =
        search === '' ||
        b.title.toLowerCase().includes(s) ||
        b.author.toLowerCase().includes(s) ||
        b.category.toLowerCase().includes(s);
      return matchesStatus && matchesSearch;
    });
  }, [blogPosts, statusFilter, search]);

  const resetForm = () => {
    setFormTitle('');
    setFormSlug('');
    setFormCategory('');
    setFormTags('');
    setFormExcerpt('');
    setFormContent('');
    setFormStatus('draft');
    setFormScheduledAt('');
    setFormAuthor('');
  };

  const autoSlug = (title: string) => {
    return title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
  };

  const handleTitleChange = (val: string) => {
    setFormTitle(val);
    if (!editingPost && !formSlug) {
      setFormSlug(autoSlug(val));
    }
  };

  const openCreateModal = () => {
    if (!canCreate) return;
    setEditingPost(null);
    resetForm();
    setModalOpen(true);
  };

  const openEditModal = (b: BlogPost) => {
    if (!canUpdate) return;
    setEditingPost(b);
    setFormTitle(b.title);
    setFormSlug(b.slug);
    setFormCategory(b.category);
    setFormTags(b.tags.join(', '));
    setFormExcerpt(b.excerpt);
    setFormContent(b.content);
    setFormStatus(b.status);
    setFormScheduledAt(b.scheduledAt ? b.scheduledAt.slice(0, 16) : '');
    setFormAuthor(b.author);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingPost(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingPost ? !canUpdate : !canCreate) return;

    const tagsArr = formTags
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    const finalSlug = formSlug || autoSlug(formTitle);

    const payload: Partial<BlogPost> & { id?: string } = {
      slug: finalSlug,
      title: formTitle.trim(),
      excerpt: formExcerpt.trim(),
      content: formContent,
      category: formCategory.trim() || 'General',
      tags: tagsArr,
      status: formStatus,
      scheduledAt: formStatus === 'scheduled' ? new Date(formScheduledAt).toISOString() : undefined,
      author: formAuthor.trim() || 'Admin',
      authorId: 'admin-1',
    };

    if (editingPost) {
      payload.id = editingPost.id;
      upsertBlogPost(payload);
      success('Post Updated', `"${formTitle}" has been updated.`);
    } else {
      upsertBlogPost(payload);
      success('Post Created', `"${formTitle}" has been added to the blog.`);
    }
    closeModal();
  };

  const handleDelete = (b: BlogPost) => {
    if (!canDelete) {
      error('Permission Denied', 'You do not have permission to delete blog posts.');
      return;
    }
    deleteBlogPost(b.id);
    success('Post Deleted', `"${b.title}" has been removed.`);
  };

  if (!canRead) {
    return (
      <div className="admin-page space-y-6">
        <div>
          <Badge variant="outline" className="text-[9px] mb-1">RESTRICTED</Badge>
          <h1 className="text-2xl font-extrabold text-[var(--text-primary)]">Blog CMS</h1>
        </div>
        <Card variant="admin" className="p-8 text-center">
          <p className="text-[var(--text-secondary)]">You do not have permission to view the blog CMS.</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Badge variant="orange" className="text-[9px] mb-1">BLOG CMS</Badge>
          <h1 className="text-2xl font-extrabold text-[var(--text-primary)]">Blog Content Manager</h1>
        </div>
        {canCreate && (
          <Button onClick={openCreateModal} variant="primary" size="sm">
            + New Blog Post
          </Button>
        )}
      </div>

      <div className="space-y-4">
        <div className="flex gap-2 flex-wrap">
          {(['all', 'draft', 'scheduled', 'published', 'archived'] as StatusFilter[]).map((f) => (
            <button
              key={f}
              onClick={() => setStatusFilter(f)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                statusFilter === f
                  ? 'bg-[var(--gb-green-600)] border-[var(--gb-green-600)] text-white'
                  : 'bg-[var(--surface-subtle)] border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              {f.toUpperCase()}
            </button>
          ))}
        </div>

        <div className="max-w-md">
          <Input
            placeholder="Search by title, author, or category..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredPosts.map((b) => {
          const sb = statusBadge[b.status] ?? statusBadge.draft;
          return (
            <Card key={b.id} variant="admin" className="p-6 space-y-4 flex flex-col">
              <div className="flex items-start justify-between gap-2 flex-wrap">
                <Badge variant="blue" className="text-[10px]">{b.category.toUpperCase()}</Badge>
                <Badge variant={sb.variant} className="text-[10px]">{sb.label}</Badge>
              </div>

              <div className="space-y-1 flex-1">
                <h3 className="text-lg font-bold text-[var(--text-primary)] leading-tight">{b.title}</h3>
                <p className="text-xs text-[var(--text-tertiary)]">
                  By <span className="text-[var(--text-primary)] font-semibold">{b.author}</span>
                  {b.publishedAt && (
                    <> · Published {formatDate(b.publishedAt)}</>
                  )}
                  {b.status === 'scheduled' && b.scheduledAt && (
                    <> · Scheduled {formatDate(b.scheduledAt)}</>
                  )}
                </p>
              </div>

              <p className="text-sm text-[var(--text-secondary)] leading-relaxed line-clamp-3">
                {b.excerpt}
              </p>

              {b.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {(b.tags as string[]).slice(0, 4).map((t, i) => (
                    <span
                      key={i}
                      className="px-2 py-0.5 text-[10px] font-semibold rounded-md bg-[var(--chip-orange-bg)] border border-[var(--chip-orange-border)] text-[var(--chip-orange-text)]"
                    >
                      {t}
                    </span>
                  ))}
                  {b.tags.length > 4 && (
                    <span className="px-2 py-0.5 text-[10px] font-semibold rounded-md bg-[var(--surface-subtle)] border border-[var(--border-subtle)] text-[var(--text-tertiary)]">
                      +{b.tags.length - 4}
                    </span>
                  )}
                </div>
              )}

              <div className="flex flex-wrap gap-2 pt-2 border-t border-[var(--border-subtle)]">
                {canUpdate && (
                  <Button size="sm" variant="secondary" onClick={() => openEditModal(b)}>
                    Edit
                  </Button>
                )}
                {canDelete && (
                  <Button size="sm" variant="ghost" onClick={() => handleDelete(b)}>
                    Delete
                  </Button>
                )}
              </div>
            </Card>
          );
        })}

        {filteredPosts.length === 0 && (
          <Card variant="admin" className="p-8 col-span-full text-center">
            <p className="text-[var(--text-secondary)]">No blog posts match the current filters.</p>
          </Card>
        )}
      </div>

      <Modal
        isOpen={modalOpen}
        onClose={closeModal}
        title={editingPost ? `Edit Post: ${editingPost.title}` : 'Create New Blog Post'}
        className="max-w-2xl"
      >
        <form onSubmit={handleSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
          <Input
            label="Title *"
            required
            value={formTitle}
            onChange={(e) => handleTitleChange(e.target.value)}
            placeholder="An engaging blog post title"
          />
          <Input
            label="Slug *"
            required
            value={formSlug}
            onChange={(e) => setFormSlug(e.target.value)}
            placeholder="url-friendly-slug"
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Category"
              value={formCategory}
              onChange={(e) => setFormCategory(e.target.value)}
              placeholder="e.g. Case Studies, Impact Stories"
            />
            <Input
              label="Author"
              value={formAuthor}
              onChange={(e) => setFormAuthor(e.target.value)}
              placeholder="Author name"
            />
          </div>
          <Input
            label="Tags (comma-separated)"
            value={formTags}
            onChange={(e) => setFormTags(e.target.value)}
            placeholder="Healthcare, Digital Transformation, Case Study"
          />
          <Textarea
            label="Excerpt"
            value={formExcerpt}
            onChange={(e) => setFormExcerpt(e.target.value)}
            rows={2}
            placeholder="Short summary displayed on blog list..."
          />
          <Textarea
            label="Content"
            value={formContent}
            onChange={(e) => setFormContent(e.target.value)}
            rows={6}
            placeholder="Full article content (HTML supported)..."
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="w-full space-y-1.5">
              <label className="block text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">
                Status
              </label>
              <select
                value={formStatus}
                onChange={(e) => setFormStatus(e.target.value as BlogPost['status'])}
                className="w-full rounded-xl bg-[var(--form-bg)] border border-[var(--form-border)] text-[var(--form-text)] px-4 py-3 text-sm focus:outline-none focus:border-[var(--form-border-focus)] focus:ring-1 focus:ring-[var(--form-border-focus)] cursor-pointer"
              >
                <option value="draft">Draft</option>
                <option value="scheduled">Scheduled</option>
                <option value="published">Published</option>
                <option value="archived">Archived</option>
              </select>
            </div>
            <Input
              label={formStatus === 'scheduled' ? 'Scheduled Date *' : 'Scheduled Date'}
              type="datetime-local"
              value={formScheduledAt}
              onChange={(e) => setFormScheduledAt(e.target.value)}
              disabled={formStatus !== 'scheduled'}
              className={formStatus !== 'scheduled' ? 'opacity-50' : ''}
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="ghost" onClick={closeModal}>
              Cancel
            </Button>
            <Button type="submit" variant="accent">
              {editingPost ? 'Save Changes' : 'Create Post'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
