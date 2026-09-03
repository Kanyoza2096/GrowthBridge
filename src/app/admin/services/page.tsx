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
import { Service } from '@/lib/types/admin';

type StatusFilter = 'all' | 'draft' | 'published' | 'archived';

const emptyForm = {
  id: undefined as string | undefined,
  title: '',
  slug: '',
  description: '',
  category: '',
  features: '',
  status: 'draft' as Service['status'],
  seoTitle: '',
  seoDescription: '',
  seoKeywords: '',
};

function statusVariant(status: Service['status']) {
  if (status === 'published') return 'green';
  if (status === 'draft') return 'outline';
  return 'orange';
}

export default function AdminServicesPage() {
  const { hasPermission } = useAdminAuth();
  const { services, upsertService, deleteService } = useAdminData();
  const { success, error, warning } = useToast();

  const [filterStatus, setFilterStatus] = useState<StatusFilter>('all');
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [isEditing, setIsEditing] = useState(false);

  const canCreate = hasPermission('services', 'create');
  const canUpdate = hasPermission('services', 'update');
  const canDelete = hasPermission('services', 'delete');

  const filtered = useMemo(() => {
    return services.filter((s) => {
      const matchesStatus = filterStatus === 'all' || s.status === filterStatus;
      const q = search.toLowerCase();
      const matchesSearch =
        s.title.toLowerCase().includes(q) ||
        s.category.toLowerCase().includes(q) ||
        s.slug.toLowerCase().includes(q) ||
        s.seoKeywords.some((k) => k.toLowerCase().includes(q));
      return matchesStatus && matchesSearch;
    });
  }, [services, filterStatus, search]);

  const openCreate = () => {
    if (!canCreate) {
      warning('Permission Denied', 'You do not have permission to create services.');
      return;
    }
    setForm(emptyForm);
    setIsEditing(false);
    setModalOpen(true);
  };

  const openEdit = (svc: Service) => {
    if (!canUpdate) {
      warning('Permission Denied', 'You do not have permission to edit services.');
      return;
    }
    setForm({
      id: svc.id,
      title: svc.title,
      slug: svc.slug,
      description: svc.description,
      category: svc.category,
      features: svc.features.join('\n'),
      status: svc.status,
      seoTitle: svc.seoTitle,
      seoDescription: svc.seoDescription,
      seoKeywords: svc.seoKeywords.join(', '),
    });
    setIsEditing(true);
    setModalOpen(true);
  };

  const handleSubmit = () => {
    if (!form.title.trim()) {
      error('Validation Error', 'Title is required.');
      return;
    }
    const featuresArr = form.features
      .split('\n')
      .map((f) => f.trim())
      .filter(Boolean);
    const keywordsArr = form.seoKeywords
      .split(',')
      .map((k) => k.trim())
      .filter(Boolean);

    upsertService({
      id: form.id,
      title: form.title.trim(),
      slug: form.slug.trim() || form.title.toLowerCase().replace(/\s+/g, '-'),
      description: form.description.trim(),
      category: form.category.trim() || 'General',
      features: featuresArr,
      status: form.status,
      seoTitle: form.seoTitle.trim() || form.title.trim(),
      seoDescription: form.seoDescription.trim(),
      seoKeywords: keywordsArr,
    });

    success(isEditing ? 'Service Updated' : 'Service Created', `${form.title} has been saved.`);
    setModalOpen(false);
    setForm(emptyForm);
  };

  const handleDelete = (svc: Service) => {
    if (!canDelete) {
      warning('Permission Denied', 'You do not have permission to delete services.');
      return;
    }
    if (!window.confirm(`Delete service "${svc.title}"? This cannot be undone.`)) return;
    deleteService(svc.id);
    success('Service Deleted', `${svc.title} has been removed.`);
  };

  const togglePublish = (svc: Service) => {
    if (!canUpdate) {
      warning('Permission Denied', 'You do not have permission to publish services.');
      return;
    }
    const next: Service['status'] = svc.status === 'published' ? 'draft' : 'published';
    upsertService({ id: svc.id, status: next });
    success('Status Updated', `${svc.title} is now ${next.toUpperCase()}.`);
  };

  const counts = useMemo(() => ({
    all: services.length,
    published: services.filter((s) => s.status === 'published').length,
    draft: services.filter((s) => s.status === 'draft').length,
    archived: services.filter((s) => s.status === 'archived').length,
  }), [services]);

  return (
    <div className="admin-page space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Badge variant="green" className="text-[9px] mb-1">CONTENT MANAGEMENT</Badge>
          <h1 className="text-2xl font-extrabold text-white">Services</h1>
        </div>
        <div className="flex flex-wrap gap-2">
          {(['all', 'published', 'draft', 'archived'] as StatusFilter[]).map((st) => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                filterStatus === st
                  ? 'bg-[var(--gb-green-600)] border-[var(--gb-green-600)] text-white'
                  : 'bg-[var(--admin-surface-card)] border-[var(--admin-border)] text-[var(--admin-text-secondary)] hover:text-[var(--admin-text-primary)]'
              }`}
            >
              {st.toUpperCase()} ({counts[st]})
            </button>
          ))}
          <Button size="sm" onClick={openCreate} disabled={!canCreate}>
            + Add Service
          </Button>
        </div>
      </div>

      <div className="max-w-md">
        <Input
          placeholder="Search services by title, category, keywords..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filtered.map((svc) => (
          <Card key={svc.id} variant="admin" className="p-5 space-y-4 flex flex-col">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <Badge variant="blue">{svc.category}</Badge>
                  <Badge variant={statusVariant(svc.status)}>{svc.status.toUpperCase()}</Badge>
                </div>
                <h3 className="text-lg font-bold text-white truncate">{svc.title}</h3>
              </div>
            </div>

            <p className="text-sm text-[var(--admin-text-secondary)] line-clamp-2">{svc.description || <span className="text-[var(--admin-text-tertiary)] italic">No description</span>}</p>

            <div className="space-y-2">
              <div className="text-[10px] uppercase tracking-wider text-[var(--admin-text-tertiary)] font-semibold">Features</div>
              <ul className="space-y-1">
                {svc.features.slice(0, 4).map((f) => (
                  <li key={f} className="text-xs text-[var(--admin-text-secondary)] flex items-center gap-2">
                    <span className="text-[var(--gb-green-400)]">•</span>
                    <span className="line-clamp-1">{f}</span>
                  </li>
                ))}
                {svc.features.length > 4 && (
                  <li className="text-xs text-[var(--admin-text-tertiary)]">+{svc.features.length - 4} more</li>
                )}
                {svc.features.length === 0 && <li className="text-xs text-[var(--admin-text-tertiary)] italic">No features listed</li>}
              </ul>
            </div>

            <div className="pt-3 border-t border-[var(--admin-border)] space-y-2 mt-auto">
              <div className="text-[10px] uppercase tracking-wider text-[var(--admin-text-tertiary)] font-semibold">SEO</div>
              <div className="text-xs text-[var(--admin-text-secondary)] space-y-0.5">
                <div>Title: <span className="text-white">{svc.seoTitle || <span className="text-[var(--admin-text-tertiary)]">—</span>}</span></div>
                <div className="line-clamp-1">Desc: <span className="text-[var(--admin-text-secondary)]">{svc.seoDescription || '—'}</span></div>
                {svc.seoKeywords.length > 0 && (
                  <div className="flex flex-wrap gap-1 pt-1">
                    {svc.seoKeywords.slice(0, 4).map((k) => (
                      <span key={k} className="px-1.5 py-0.5 rounded bg-[var(--gb-navy-800)]/40 text-[10px] text-blue-300">{k}</span>
                    ))}
                    {svc.seoKeywords.length > 4 && <span className="text-[10px] text-[var(--admin-text-tertiary)]">+{svc.seoKeywords.length - 4}</span>}
                  </div>
                )}
              </div>
            </div>

            <div className="flex flex-wrap gap-2 pt-2">
              <label className="inline-flex items-center gap-2 text-xs text-[var(--admin-text-secondary)] cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={svc.status === 'published'}
                  onChange={() => togglePublish(svc)}
                  className="w-4 h-4 rounded accent-[var(--gb-green-600)] bg-[var(--admin-surface-soft)] border-[var(--admin-border-strong)]"
                />
                Publish
              </label>
              <div className="flex-1" />
              <Button size="sm" variant="outline" onClick={() => openEdit(svc)} disabled={!canUpdate}>Edit</Button>
              <Button size="sm" variant="ghost" onClick={() => handleDelete(svc)} disabled={!canDelete} className="text-rose-400 hover:text-rose-300 hover:bg-rose-500/10">Delete</Button>
            </div>
          </Card>
        ))}
        {filtered.length === 0 && (
          <Card variant="admin" className="md:col-span-2 lg:col-span-3 p-10 text-center">
            <p className="text-[var(--admin-text-secondary)]">No services match your filters.</p>
          </Card>
        )}
      </div>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={isEditing ? 'Edit Service' : 'Create Service'} className="max-w-2xl">
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label="Title *" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="e.g. Digital Solutions" />
            <Input label="Slug" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} placeholder="auto-generated if empty" />
          </div>
          <Textarea label="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Short summary of this service..." rows={3} />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label="Category" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} placeholder="Technology, Consulting, ..." />
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-[var(--admin-text-secondary)] uppercase tracking-wider">Status</label>
              <select
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value as Service['status'] })}
                className="w-full rounded-xl bg-[var(--admin-surface-card)]/60 border border-[var(--admin-border)] text-[var(--admin-text-primary)] px-4 py-3 text-sm focus:outline-none focus:border-[var(--gb-green-600)] focus:ring-1 focus:ring-[var(--gb-green-600)]"
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
                <option value="archived">Archived</option>
              </select>
            </div>
          </div>
          <Textarea label="Features (one per line)" value={form.features} onChange={(e) => setForm({ ...form, features: e.target.value })} placeholder="Custom Web Development&#10;Mobile Applications&#10;Cloud Infrastructure" rows={5} />
          <div className="pt-2 border-t border-[var(--admin-border)] space-y-4">
            <div className="text-[11px] uppercase tracking-wider text-amber-400/80 font-bold">SEO Fields</div>
            <Input label="SEO Title" value={form.seoTitle} onChange={(e) => setForm({ ...form, seoTitle: e.target.value })} placeholder="Defaults to service title" />
            <Textarea label="SEO Description" value={form.seoDescription} onChange={(e) => setForm({ ...form, seoDescription: e.target.value })} placeholder="Meta description for search engines..." rows={2} />
            <Input label="SEO Keywords (comma-separated)" value={form.seoKeywords} onChange={(e) => setForm({ ...form, seoKeywords: e.target.value })} placeholder="digital, web development, consulting" />
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button onClick={handleSubmit}>{isEditing ? 'Save Changes' : 'Create Service'}</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
