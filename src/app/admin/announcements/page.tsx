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
import { cn } from '@/lib/utils';
import type { Announcement } from '@/lib/types/admin';

type StatusFilter = 'all' | 'draft' | 'scheduled' | 'published' | 'archived';
type TypeFilter = 'all' | 'info' | 'success' | 'warning' | 'urgent';
type AudienceFilter = 'all' | 'public' | 'talent' | 'partners' | 'admin';

interface AnnouncementForm {
  title: string;
  content: string;
  type: Announcement['type'];
  priority: Announcement['priority'];
  audience: Announcement['audience'];
  status: Announcement['status'];
  scheduledAt: string;
  expiresAt: string;
}

const emptyForm: AnnouncementForm = {
  title: '',
  content: '',
  type: 'info',
  priority: 'medium',
  audience: 'public',
  status: 'draft',
  scheduledAt: '',
  expiresAt: '',
};

const typeConfig: Record<string, { variant: 'blue' | 'green' | 'orange' | 'outline'; label: string; accent: string; dot: string }> = {
  info: { variant: 'blue', label: 'INFO', accent: 'border-l-[var(--gb-blue-500)]', dot: 'bg-[var(--gb-blue-500)]' },
  success: { variant: 'green', label: 'SUCCESS', accent: 'border-l-[var(--gb-green-600)]', dot: 'bg-[var(--gb-green-600)]' },
  warning: { variant: 'orange', label: 'WARNING', accent: 'border-l-[var(--gb-orange-500)]', dot: 'bg-[var(--gb-orange-500)]' },
  urgent: { variant: 'outline', label: 'URGENT', accent: 'border-l-[var(--danger)]', dot: 'bg-[var(--danger)]' },
};

const priorityConfig: Record<string, { label: string; bar: string }> = {
  low: { label: 'Low', bar: 'bg-[var(--text-tertiary)] w-1/3' },
  medium: { label: 'Medium', bar: 'bg-[var(--gb-orange-500)] w-2/3' },
  high: { label: 'High', bar: 'bg-[var(--danger)] w-full' },
};

const audienceLabels: Record<string, string> = {
  public: 'Public',
  talent: 'Talent Hub',
  partners: 'Partners',
  admin: 'Internal Admin',
};

const statusBadgeVariant: Record<string, 'outline' | 'orange' | 'green' | 'blue'> = {
  draft: 'outline',
  scheduled: 'orange',
  published: 'green',
  archived: 'blue',
};

function formatDate(d?: string) {
  if (!d) return '—';
  const date = new Date(d);
  if (isNaN(date.getTime())) return d;
  return date.toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function AdminAnnouncementsPage() {
  const { hasPermission } = useAdminAuth();
  const { announcements, upsertAnnouncement, deleteAnnouncement } = useAdminData();
  const { success, info: toastInfo, error } = useToast();

  const canCreate = hasPermission('announcement', 'create');
  const canUpdate = hasPermission('announcement', 'update');
  const canDelete = hasPermission('announcement', 'delete');

  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('all');
  const [audienceFilter, setAudienceFilter] = useState<AudienceFilter>('all');
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<AnnouncementForm>(emptyForm);

  const filtered = useMemo(() => {
    return announcements
      .filter((a) => {
        const matchesStatus = statusFilter === 'all' || a.status === statusFilter;
        const matchesType = typeFilter === 'all' || a.type === typeFilter;
        const matchesAudience = audienceFilter === 'all' || a.audience === audienceFilter;
        const q = search.toLowerCase();
        const matchesSearch =
          !q ||
          a.title.toLowerCase().includes(q) ||
          a.content.toLowerCase().includes(q);
        return matchesStatus && matchesType && matchesAudience && matchesSearch;
      })
      .sort((a, b) => {
        const order: Record<string, number> = { urgent: 0, warning: 1, success: 2, info: 3 };
        const diff = (order[String(a.type)] ?? 3) - (order[String(b.type)] ?? 3);
        if (diff !== 0) return diff;
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
  }, [announcements, statusFilter, typeFilter, audienceFilter, search]);

  const openCreate = () => {
    if (!canCreate) return;
    setEditingId(null);
    setForm(emptyForm);
    setModalOpen(true);
  };

  const openEdit = (id: string) => {
    if (!canUpdate) return;
    const a = announcements.find((x) => x.id === id);
    if (!a) return;
    setEditingId(id);
    setForm({
      title: a.title,
      content: a.content,
      type: a.type,
      priority: a.priority,
      audience: a.audience,
      status: a.status,
      scheduledAt: a.scheduledAt ? a.scheduledAt.slice(0, 16) : '',
      expiresAt: a.expiresAt ? a.expiresAt.slice(0, 16) : '',
    });
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingId(null);
    setForm(emptyForm);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim() || !form.content.trim()) {
      error('Validation Error', 'Title and content are required.');
      return;
    }
    const payload: Partial<Announcement> & { id?: string } = {
      id: editingId ?? undefined,
      title: form.title,
      content: form.content,
      type: form.type,
      priority: form.priority,
      audience: form.audience,
      status: form.status,
      scheduledAt: form.scheduledAt ? new Date(form.scheduledAt).toISOString() : undefined,
      expiresAt: form.expiresAt ? new Date(form.expiresAt).toISOString() : undefined,
    };
    upsertAnnouncement(payload);
    success(
      editingId ? 'Announcement Updated' : 'Announcement Created',
      editingId
        ? `${form.title} has been updated.`
        : `New announcement "${form.title}" created.`
    );
    closeModal();
  };

  const handleDelete = (id: string) => {
    if (!canDelete) return;
    const a = announcements.find((x) => x.id === id);
    if (!a) return;
    if (!window.confirm(`Delete this announcement?\n\n"${a.title}"\n\nThis cannot be undone.`)) return;
    deleteAnnouncement(id);
    success('Announcement Deleted', `"${a.title}" removed.`);
  };

  const publishNow = (id: string) => {
    const a = announcements.find((x) => x.id === id);
    if (!a) return;
    upsertAnnouncement({ id, status: 'published', publishedAt: new Date().toISOString() });
    toastInfo('Published', `Announcement "${a.title}" is now live.`);
  };

  return (
    <div className="admin-page space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Badge variant="orange" className="text-[9px] mb-1">NOTIFICATIONS CMS</Badge>
          <h1 className="text-2xl font-extrabold text-[var(--text-primary)]">Announcements Center</h1>
        </div>
        <div className="flex flex-wrap gap-2">
          {(['all', 'info', 'success', 'warning', 'urgent'] as TypeFilter[]).map((t) => {
            const cfg = t !== 'all' ? typeConfig[t] : null;
            return (
              <button
                key={t}
                onClick={() => setTypeFilter(t)}
                className={cn(
                  'px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all capitalize cursor-pointer flex items-center gap-1.5',
                  typeFilter === t
                    ? 'bg-[var(--gb-green-600)] border-[var(--gb-green-600)] text-white'
                    : 'bg-[var(--surface-subtle)] border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--border-strong)]'
                )}
              >
                {cfg && <span className={cn('w-1.5 h-1.5 rounded-full', cfg.dot)} />}
                {t === 'all' ? 'ALL TYPES' : t.toUpperCase()}
              </button>
            );
          })}
          {canCreate && (
            <Button onClick={openCreate} variant="primary" size="sm" className="ml-2">
              + New Announcement
            </Button>
          )}
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4 md:items-center justify-between">
        <div className="flex flex-wrap gap-2">
          {(['all', 'draft', 'scheduled', 'published', 'archived'] as StatusFilter[]).map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={cn(
                'px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all capitalize cursor-pointer',
                statusFilter === st
                  ? 'bg-[var(--gb-navy-600)] border-[var(--gb-navy-600)] text-white'
                  : 'bg-[var(--surface-subtle)] border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--border-strong)]'
              )}
            >
              {st === 'all' ? 'ALL' : st.toUpperCase()}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap gap-2 md:ml-auto">
          {(['all', 'public', 'talent', 'partners', 'admin'] as AudienceFilter[]).map((a) => (
            <button
              key={a}
              onClick={() => setAudienceFilter(a)}
              className={cn(
                'px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer',
                audienceFilter === a
                  ? 'bg-[var(--surface-muted)] border-[var(--border-strong)] text-[var(--text-primary)]'
                  : 'bg-[var(--surface-subtle)] border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--border-strong)]'
              )}
            >
              {a === 'all' ? 'ALL AUDIENCES' : audienceLabels[a].toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-md">
        <Input
          placeholder="Search title or content..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="space-y-4">
        {filtered.map((a) => {
          const tCfg = typeConfig[a.type] ?? typeConfig.info;
          const pCfg = priorityConfig[a.priority] ?? priorityConfig.medium;
          return (
            <Card
              key={a.id}
              variant="admin"
              className={cn('p-0 overflow-hidden border-l-4', tCfg.accent)}
            >
              <div className="p-5 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <div className={cn('w-2.5 h-2.5 rounded-full mt-2 shrink-0', tCfg.dot)} />
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2 mb-1.5">
                        <Badge variant={tCfg.variant} className="text-[10px]">
                          {tCfg.label}
                        </Badge>
                        <Badge variant="blue" className="text-[10px]">
                          {audienceLabels[a.audience].toUpperCase()}
                        </Badge>
                        <Badge variant={statusBadgeVariant[a.status]} className="text-[10px] capitalize">
                          {a.status}
                        </Badge>
                      </div>
                      <h3 className="text-base font-bold text-[var(--text-primary)] leading-snug">
                        {a.title}
                      </h3>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {canUpdate && a.status !== 'published' && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => publishNow(a.id)}
                        className="!text-[var(--gb-green-600)] hover:!bg-[var(--chip-green-bg)]"
                      >
                        Publish
                      </Button>
                    )}
                    {canUpdate && (
                      <Button variant="ghost" size="sm" onClick={() => openEdit(a.id)}>
                        Edit
                      </Button>
                    )}
                    {canDelete && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(a.id)}
                        className="!text-[var(--danger-text)] hover:!bg-[var(--danger-bg)]"
                      >
                        ✕
                      </Button>
                    )}
                  </div>
                </div>

                <p className="text-sm text-[var(--text-secondary)] leading-relaxed line-clamp-3 bg-[var(--surface-soft)] p-3 rounded-xl border border-[var(--border-subtle)]">
                  {a.content}
                </p>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
                  <div className="space-y-2 sm:space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] text-[var(--text-tertiary)] uppercase tracking-wide w-20 shrink-0">Priority</span>
                      <div className="flex items-center gap-2 flex-1">
                        <div className="flex-1 max-w-[140px] h-1.5 rounded-full bg-[var(--surface-muted)] overflow-hidden">
                          <div className={cn('h-full rounded-full transition-all', pCfg.bar)} />
                        </div>
                        <span className="text-[11px] font-semibold text-[var(--text-secondary)] w-14">{pCfg.label}</span>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-x-6 gap-y-1 text-[11px] text-[var(--text-tertiary)]">
                      {a.scheduledAt && (
                        <span>
                          Scheduled: <span className="text-[var(--gb-orange-500)] font-semibold">{formatDate(a.scheduledAt)}</span>
                        </span>
                      )}
                      {a.publishedAt && (
                        <span>
                          Published: <span className="text-[var(--gb-green-600)] font-semibold">{formatDate(a.publishedAt)}</span>
                        </span>
                      )}
                      {a.expiresAt && (
                        <span>
                          Expires: <span className="text-[var(--danger-text)] font-semibold">{formatDate(a.expiresAt)}</span>
                        </span>
                      )}
                      {!a.scheduledAt && !a.publishedAt && !a.expiresAt && (
                        <span>Created: {formatDate(a.createdAt)}</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          );
        })}

        {filtered.length === 0 && (
          <Card variant="solid" className="p-10 text-center">
            <div className="text-4xl mb-3 opacity-50">NEWS</div>
            <p className="text-[var(--text-secondary)]">No announcements match your filters.</p>
          </Card>
        )}
      </div>

      <Modal
        isOpen={modalOpen}
        onClose={closeModal}
        title={editingId ? 'Edit Announcement' : 'Create Announcement'}
        className="max-w-xl"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Title *"
            placeholder="e.g. Youth Innovation Summit 2026 Registration Open"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            required
          />
          <Textarea
            label="Content *"
            placeholder="Write the announcement details..."
            value={form.content}
            onChange={(e) => setForm({ ...form, content: e.target.value })}
            required
            className="min-h-[130px]"
          />

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">
                Type
              </label>
              <select
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value as Announcement['type'] })}
                className="w-full rounded-xl bg-[var(--form-bg)] border border-[var(--form-border)] text-[var(--form-text)] px-4 py-3 text-sm transition-colors focus:outline-none focus:border-[var(--form-border-focus)] focus:ring-1 focus:ring-[var(--form-border-focus)] cursor-pointer"
              >
                <option value="info">Info</option>
                <option value="success">OK Success</option>
                <option value="warning">Warning</option>
                <option value="urgent">URG Urgent</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">
                Priority
              </label>
              <select
                value={form.priority}
                onChange={(e) => setForm({ ...form, priority: e.target.value as Announcement['priority'] })}
                className="w-full rounded-xl bg-[var(--form-bg)] border border-[var(--form-border)] text-[var(--form-text)] px-4 py-3 text-sm transition-colors focus:outline-none focus:border-[var(--form-border-focus)] focus:ring-1 focus:ring-[var(--form-border-focus)] cursor-pointer"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">
                Audience
              </label>
              <select
                value={form.audience}
                onChange={(e) => setForm({ ...form, audience: e.target.value as Announcement['audience'] })}
                className="w-full rounded-xl bg-[var(--form-bg)] border border-[var(--form-border)] text-[var(--form-text)] px-4 py-3 text-sm transition-colors focus:outline-none focus:border-[var(--form-border-focus)] focus:ring-1 focus:ring-[var(--form-border-focus)] cursor-pointer"
              >
                <option value="public">PUB Public</option>
                <option value="talent">TAL Talent Hub</option>
                <option value="partners">PART Partners</option>
                <option value="admin">LOCK Internal Admin</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">
                Status
              </label>
              <select
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value as Announcement['status'] })}
                className="w-full rounded-xl bg-[var(--form-bg)] border border-[var(--form-border)] text-[var(--form-text)] px-4 py-3 text-sm transition-colors focus:outline-none focus:border-[var(--form-border-focus)] focus:ring-1 focus:ring-[var(--form-border-focus)] cursor-pointer"
              >
                <option value="draft">Draft</option>
                <option value="scheduled">Scheduled</option>
                <option value="published">Projects Published</option>
                <option value="archived">ARC Archived</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">
                Scheduled
              </label>
              <input
                type="datetime-local"
                value={form.scheduledAt}
                onChange={(e) => setForm({ ...form, scheduledAt: e.target.value })}
                className="w-full rounded-xl bg-[var(--form-bg)] border border-[var(--form-border)] text-[var(--form-text)] px-4 py-3 text-sm transition-colors focus:outline-none focus:border-[var(--form-border-focus)] focus:ring-1 focus:ring-[var(--form-border-focus)] cursor-pointer"
              />
            </div>
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">
                Expires
              </label>
              <input
                type="datetime-local"
                value={form.expiresAt}
                onChange={(e) => setForm({ ...form, expiresAt: e.target.value })}
                className="w-full rounded-xl bg-[var(--form-bg)] border border-[var(--form-border)] text-[var(--form-text)] px-4 py-3 text-sm transition-colors focus:outline-none focus:border-[var(--form-border-focus)] focus:ring-1 focus:ring-[var(--form-border-focus)] cursor-pointer"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" onClick={closeModal} type="button">
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              {editingId ? 'Update Announcement' : 'Create Announcement'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
