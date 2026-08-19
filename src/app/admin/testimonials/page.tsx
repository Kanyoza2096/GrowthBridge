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

type StatusFilter = 'all' | 'pending' | 'approved' | 'rejected';

interface TestimonialForm {
  authorName: string;
  authorTitle: string;
  content: string;
  rating: number;
  featured: boolean;
  projectId: string;
}

const emptyForm: TestimonialForm = {
  authorName: '',
  authorTitle: '',
  content: '',
  rating: 5,
  featured: false,
  projectId: '',
};

const statusBadgeVariant: Record<string, 'orange' | 'green' | 'outline' | 'blue'> = {
  pending: 'orange',
  approved: 'green',
  rejected: 'outline',
};

function StarRating({ value, onChange, size = 'md' }: { value: number; onChange?: (v: number) => void; size?: 'sm' | 'md' }) {
  const [hover, setHover] = useState<number | null>(null);
  const sizeCls = size === 'sm' ? 'w-4 h-4' : 'w-5 h-5';
  const displayValue = hover ?? value;

  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={!onChange}
          onClick={() => onChange?.(star)}
          onMouseEnter={() => onChange && setHover(star)}
          onMouseLeave={() => setHover(null)}
          className={cn(
            'transition-colors',
            onChange && 'cursor-pointer',
            !onChange && 'cursor-default'
          )}
        >
          <svg
            className={cn(sizeCls, star <= displayValue ? 'text-amber-400 fill-amber-400' : 'text-slate-600 fill-slate-700')}
            viewBox="0 0 20 20"
            stroke="currentColor"
            strokeWidth="1"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.957a1 1 0 00.95.69h4.162c.969 0 1.371 1.24.588 1.81l-3.37 2.448a1 1 0 00-.364 1.118l1.287 3.957c.3.921-.755 1.688-1.54 1.118l-3.37-2.449a1 1 0 00-1.175 0l-3.37 2.449c-.784.57-1.838-.197-1.539-1.118l1.287-3.957a1 1 0 00-.364-1.118L2.05 9.384c-.783-.57-.38-1.81.588-1.81h4.162a1 1 0 00.95-.69l1.286-3.957z" />
          </svg>
        </button>
      ))}
    </div>
  );
}

function Avatar({ name }: { name: string }) {
  const initials = name
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
  const hues = [210, 160, 40, 0, 280, 30];
  const hue = name.split('').reduce((a, c) => a + c.charCodeAt(0), 0) % hues.length;
  return (
    <div
      className="w-11 h-11 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0 border-2 border-slate-800"
      style={{ backgroundColor: `hsl(${hues[hue]}, 60%, 35%)` }}
    >
      {initials || '?'}
    </div>
  );
}

export default function AdminTestimonialsPage() {
  const { hasPermission } = useAdminAuth();
  const { testimonials, projects, upsertTestimonial } = useAdminData();
  const { success, info, error } = useToast();

  const canCreate = hasPermission('testimonial', 'create');
  const canUpdate = hasPermission('testimonial', 'update');
  const canDelete = hasPermission('testimonial', 'delete');

  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<TestimonialForm>(emptyForm);

  const filtered = useMemo(() => {
    return testimonials.filter((t) => {
      const matchesStatus = statusFilter === 'all' || t.status === statusFilter;
      const q = search.toLowerCase();
      const matchesSearch =
        !q ||
        t.authorName.toLowerCase().includes(q) ||
        t.authorTitle.toLowerCase().includes(q) ||
        t.content.toLowerCase().includes(q);
      return matchesStatus && matchesSearch;
    });
  }, [testimonials, statusFilter, search]);

  const openCreate = () => {
    if (!canCreate) return;
    setEditingId(null);
    setForm(emptyForm);
    setModalOpen(true);
  };

  const openEdit = (id: string) => {
    if (!canUpdate) return;
    const t = testimonials.find((x) => x.id === id);
    if (!t) return;
    setEditingId(id);
    setForm({
      authorName: t.authorName,
      authorTitle: t.authorTitle,
      content: t.content,
      rating: t.rating,
      featured: t.featured,
      projectId: t.projectId || '',
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
    if (!form.authorName.trim() || !form.content.trim()) {
      error('Validation Error', 'Author name and content are required.');
      return;
    }
    upsertTestimonial({
      id: editingId ?? undefined,
      authorName: form.authorName,
      authorTitle: form.authorTitle,
      content: form.content,
      rating: form.rating,
      featured: form.featured,
      projectId: form.projectId || undefined,
      status: editingId ? undefined : 'pending',
    });
    success(
      editingId ? 'Testimonial Updated' : 'Testimonial Created',
      editingId ? `${form.authorName}'s testimonial has been updated.` : 'New testimonial submitted for review.'
    );
    closeModal();
  };

  const quickAction = (id: string, action: 'approve' | 'reject') => {
    const t = testimonials.find((x) => x.id === id);
    if (!t) return;
    const status = action === 'approve' ? 'approved' : 'rejected';
    upsertTestimonial({ id, status });
    success(
      action === 'approve' ? 'Testimonial Approved' : 'Testimonial Rejected',
      `${t.authorName}'s testimonial ${action === 'approve' ? 'is now live.' : 'has been rejected.'}`
    );
  };

  const toggleFeatured = (id: string) => {
    const t = testimonials.find((x) => x.id === id);
    if (!t) return;
    upsertTestimonial({ id, featured: !t.featured });
    info('Featured Updated', `${t.authorName}: ${!t.featured ? 'Pinned to homepage.' : 'Removed from featured.'}`);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Badge variant="blue" className="text-[9px] mb-1">SOCIAL PROOF CMS</Badge>
          <h1 className="text-2xl font-extrabold text-white">Testimonials Manager</h1>
        </div>
        <div className="flex flex-wrap gap-2">
          {(['all', 'pending', 'approved', 'rejected'] as StatusFilter[]).map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={cn(
                'px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all capitalize cursor-pointer',
                statusFilter === st
                  ? 'bg-[#16A36A] border-[#16A36A] text-white'
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
              )}
            >
              {st === 'all' ? 'ALL' : st.toUpperCase()}
              {st !== 'all' && (
                <span className="ml-1.5 opacity-70">
                  {testimonials.filter((t) => t.status === st).length}
                </span>
              )}
            </button>
          ))}
          {canCreate && (
            <Button onClick={openCreate} variant="primary" size="sm" className="ml-2">
              + New Testimonial
            </Button>
          )}
        </div>
      </div>

      <div className="max-w-md">
        <Input
          placeholder="Search author, title, or quote..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filtered.map((t) => {
          const project = projects.find((p) => p.id === t.projectId);
          return (
            <Card key={t.id} variant="glass" className="p-6 space-y-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <Avatar name={t.authorName} />
                  <div>
                    <h3 className="text-sm font-bold text-white leading-tight">{t.authorName}</h3>
                    <p className="text-xs text-slate-400">{t.authorTitle}</p>
                    <div className="mt-1.5">
                      <StarRating value={t.rating} size="sm" />
                    </div>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1.5 shrink-0">
                  <Badge variant={statusBadgeVariant[t.status]} className="text-[10px] capitalize">
                    {t.status}
                  </Badge>
                  <button
                    onClick={() => canUpdate && toggleFeatured(t.id)}
                    disabled={!canUpdate}
                    className={cn(
                      'px-2.5 py-1 rounded-full text-[10px] font-bold border transition-colors',
                      canUpdate ? 'cursor-pointer' : 'cursor-not-allowed opacity-50',
                      t.featured
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500/50'
                        : 'bg-slate-900 text-slate-400 border-slate-800 hover:border-slate-700'
                    )}
                  >
                    {t.featured ? '★ FEATURED' : '☆ REGULAR'}
                  </button>
                </div>
              </div>

              <blockquote className="text-sm text-slate-300 leading-relaxed bg-slate-900/60 p-4 rounded-xl border border-slate-800 relative">
                <span className="absolute -top-2 left-3 text-[#16A36A] text-2xl font-serif leading-none select-none">&ldquo;</span>
                <span className="line-clamp-3">{t.content}</span>
                <span className="absolute -bottom-3 right-3 text-[#16A36A] text-2xl font-serif leading-none select-none">&rdquo;</span>
              </blockquote>

              <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-800">
                {project && (
                  <div className="text-[11px] text-slate-400">
                    Project: <span className="text-emerald-400 font-semibold">{project.title}</span>
                  </div>
                )}
                <div className="text-[11px] text-slate-500 ml-auto">
                  {new Date(t.createdAt).toLocaleDateString()}
                </div>
                <div className="flex gap-2 w-full sm:w-auto">
                  {canUpdate && t.status === 'pending' && (
                    <>
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => quickAction(t.id, 'approve')}
                        className="flex-1 sm:flex-none"
                      >
                        ✓ Approve
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => quickAction(t.id, 'reject')}
                        className="flex-1 sm:flex-none"
                      >
                        ✕ Reject
                      </Button>
                    </>
                  )}
                  {canUpdate && t.status !== 'pending' && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => openEdit(t.id)}
                      className="flex-1 sm:flex-none"
                    >
                      Edit
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          );
        })}

        {filtered.length === 0 && (
          <div className="col-span-full">
            <Card variant="solid" className="p-10 text-center">
              <div className="text-4xl mb-3 opacity-50">💬</div>
              <p className="text-slate-400">No testimonials match your filters.</p>
            </Card>
          </div>
        )}
      </div>

      <Modal
        isOpen={modalOpen}
        onClose={closeModal}
        title={editingId ? 'Edit Testimonial' : 'Create Testimonial'}
        className="max-w-xl"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Author Name *"
              placeholder="e.g. Dr. Precious Mkhize"
              value={form.authorName}
              onChange={(e) => setForm({ ...form, authorName: e.target.value })}
              required
            />
            <Input
              label="Author Title"
              placeholder="e.g. Director, Department of Health"
              value={form.authorTitle}
              onChange={(e) => setForm({ ...form, authorTitle: e.target.value })}
            />
          </div>

          <Textarea
            label="Testimonial Content *"
            placeholder="Write the testimonial quote..."
            value={form.content}
            onChange={(e) => setForm({ ...form, content: e.target.value })}
            required
            className="min-h-[140px]"
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Star Rating
              </label>
              <div className="bg-slate-900/60 border border-slate-800 rounded-xl px-4 py-3">
                <StarRating value={form.rating} onChange={(v) => setForm({ ...form, rating: v })} />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Linked Project
              </label>
              <select
                value={form.projectId}
                onChange={(e) => setForm({ ...form, projectId: e.target.value })}
                className="w-full rounded-xl bg-slate-900/60 border border-slate-800 text-slate-100 px-4 py-3 text-sm transition-colors focus:outline-none focus:border-[#16A36A] focus:ring-1 focus:ring-[#16A36A] cursor-pointer"
              >
                <option value="">— No project linked —</option>
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.title}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <label className="flex items-center gap-3 p-3 rounded-xl bg-slate-900/60 border border-slate-800 cursor-pointer">
            <input
              type="checkbox"
              checked={form.featured}
              onChange={(e) => setForm({ ...form, featured: e.target.checked })}
              className="w-4 h-4 accent-[#16A36A] cursor-pointer"
            />
            <span className="text-sm text-slate-200">
              <span className="font-semibold">Pin as Featured</span>
              <span className="text-slate-400"> — Display on homepage carousel</span>
            </span>
          </label>

          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" onClick={closeModal} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" variant="accent" className="flex-1">
              {editingId ? 'Save Changes' : 'Submit Testimonial'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
