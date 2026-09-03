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

type StatusFilter = 'all' | 'draft' | 'published';

interface FAQForm {
  question: string;
  answer: string;
  category: string;
  order: number;
  status: 'draft' | 'published';
}

const emptyForm: FAQForm = {
  question: '',
  answer: '',
  category: 'General',
  order: 1,
  status: 'draft',
};

const categoryColors: Record<string, 'green' | 'blue' | 'orange' | 'purple' | 'outline'> = {
  General: 'blue',
  Partnerships: 'green',
  Services: 'orange',
  'Talent & Training': 'purple',
  Community: 'green',
  Other: 'outline',
};

export default function AdminFAQsPage() {
  const { hasPermission } = useAdminAuth();
  const { faqs, upsertFAQ, deleteFAQ } = useAdminData();
  const { success, info, error } = useToast();

  const canCreate = hasPermission('faq', 'create');
  const canUpdate = hasPermission('faq', 'update');
  const canDelete = hasPermission('faq', 'delete');

  const categories = useMemo(() => {
    const set = new Set(faqs.map((f) => f.category));
    return ['all', ...Array.from(set)];
  }, [faqs]);

  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [search, setSearch] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FAQForm>(emptyForm);

  const filtered = useMemo(() => {
    return faqs
      .filter((f) => {
        const matchesStatus = statusFilter === 'all' || f.status === statusFilter;
        const matchesCategory = categoryFilter === 'all' || f.category === categoryFilter;
        const q = search.toLowerCase();
        const matchesSearch =
          !q ||
          f.question.toLowerCase().includes(q) ||
          f.answer.toLowerCase().includes(q) ||
          f.category.toLowerCase().includes(q);
        return matchesStatus && matchesCategory && matchesSearch;
      })
      .sort((a, b) => a.order - b.order);
  }, [faqs, statusFilter, categoryFilter, search]);

  const openCreate = () => {
    if (!canCreate) return;
    setEditingId(null);
    setForm({ ...emptyForm, order: faqs.length + 1 });
    setModalOpen(true);
  };

  const openEdit = (id: string) => {
    if (!canUpdate) return;
    const f = faqs.find((x) => x.id === id);
    if (!f) return;
    setEditingId(id);
    setForm({
      question: f.question,
      answer: f.answer,
      category: f.category,
      order: f.order,
      status: f.status,
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
    if (!form.question.trim() || !form.answer.trim()) {
      error('Validation Error', 'Question and answer are required.');
      return;
    }
    upsertFAQ({
      id: editingId ?? undefined,
      question: form.question,
      answer: form.answer,
      category: form.category,
      order: form.order,
      status: form.status,
    });
    success(
      editingId ? 'FAQ Updated' : 'FAQ Created',
      editingId
        ? `Question updated successfully.`
        : 'New FAQ added to the knowledge base.'
    );
    closeModal();
  };

  const handleDelete = (id: string) => {
    if (!canDelete) return;
    const f = faqs.find((x) => x.id === id);
    if (!f) return;
    if (!window.confirm(`Delete this FAQ?\n\n"${f.question}"\n\nThis cannot be undone.`)) return;
    deleteFAQ(id);
    success('FAQ Deleted', 'Question removed from knowledge base.');
  };

  const toggleExpand = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  return (
    <div className="admin-page space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Badge variant="purple" className="text-[9px] mb-1">KNOWLEDGE BASE CMS</Badge>
          <h1 className="text-2xl font-extrabold text-white">FAQs Manager</h1>
        </div>
        {canCreate && (
          <Button onClick={openCreate} variant="primary" size="sm">
            + Add FAQ
          </Button>
        )}
      </div>

      <div className="flex flex-col lg:flex-row gap-4 lg:items-center justify-between">
        <div className="flex flex-wrap gap-2">
          {(['all', 'draft', 'published'] as StatusFilter[]).map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={cn(
                'px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all capitalize cursor-pointer',
                statusFilter === st
                  ? 'bg-[var(--gb-green-600)] border-[var(--gb-green-600)] text-white'
                  : 'bg-[var(--admin-surface-card)] border-[var(--admin-border)] text-[var(--admin-text-secondary)] hover:text-[var(--admin-text-primary)] hover:border-[var(--admin-border-strong)]'
              )}
            >
              {st === 'all' ? 'ALL' : st.toUpperCase()}
              {st !== 'all' && (
                <span className="ml-1.5 opacity-70">
                  {faqs.filter((f) => f.status === st).length}
                </span>
              )}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap gap-2 lg:ml-auto">
          <div className="flex gap-1 flex-wrap">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                className={cn(
                  'px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer',
                  categoryFilter === cat
                    ? 'bg-[var(--gb-navy-800)] border-[var(--gb-navy-800)] text-white'
                    : 'bg-[var(--admin-surface-card)] border-[var(--admin-border)] text-[var(--admin-text-secondary)] hover:text-[var(--admin-text-primary)] hover:border-[var(--admin-border-strong)]'
                )}
              >
                {cat === 'all' ? 'ALL CATEGORIES' : cat.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-md">
        <Input
          placeholder="Search FAQ question, answer, or category..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="space-y-3">
        {filtered.map((f) => {
          const isExpanded = expandedId === f.id;
          const badgeVariant = categoryColors[f.category] ?? 'blue';
          return (
            <Card
              key={f.id}
              variant="admin"
              className={cn(
                'p-0 overflow-hidden transition-all',
                isExpanded && 'ring-1 ring-[var(--gb-green-600)]/40'
              )}
            >
              <button
                onClick={() => toggleExpand(f.id)}
                className="w-full p-5 flex items-start justify-between gap-4 text-left cursor-pointer"
              >
                <div className="flex items-start gap-4 flex-1 min-w-0">
                  <div
                    className={cn(
                      'w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm shrink-0 border',
                      isExpanded
                        ? 'bg-[var(--gb-green-600)] border-[var(--gb-green-600)] text-white'
                        : 'bg-[var(--admin-surface-card)] border-[var(--admin-border-strong)] text-[var(--admin-text-secondary)]'
                    )}
                  >
                    {String(f.order).padStart(2, '0')}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-1.5">
                      <Badge variant={badgeVariant} className="text-[10px]">
                        {f.category.toUpperCase()}
                      </Badge>
                      <Badge variant={f.status === 'published' ? 'green' : 'outline'} className="text-[10px] capitalize">
                        {f.status}
                      </Badge>
                    </div>
                    <h3 className="text-base font-bold text-white leading-snug truncate">
                      {f.question}
                    </h3>
                  </div>
                </div>
                <svg
                  className={cn(
                    'w-5 h-5 text-[var(--admin-text-secondary)] shrink-0 mt-1 transition-transform duration-300',
                    isExpanded && 'rotate-180 text-[var(--gb-green-600)]'
                  )}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              <div
                className={cn(
                  'grid transition-all duration-300 ease-in-out',
                  isExpanded ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
                )}
              >
                <div className="overflow-hidden">
                  <div className="px-5 pb-5 pt-1 ml-12 border-t border-[var(--admin-border)]/50 space-y-4">
                    <p className="text-sm text-[var(--admin-text-secondary)] leading-relaxed pt-4">
                      {f.answer}
                    </p>
                    <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                      <div className="text-[11px] text-[var(--admin-text-tertiary)]">
                        Last updated: {new Date(f.updatedAt || f.createdAt).toLocaleString()}
                      </div>
                      <div className="flex gap-2">
                        {canUpdate && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              openEdit(f.id);
                            }}
                          >
                            Edit
                          </Button>
                        )}
                        {canDelete && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(f.id);
                            }}
                            className="!border-rose-500/40 !text-rose-400 hover:!bg-rose-500/10 hover:!border-rose-500/60"
                          >
                            Delete
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          );
        })}

        {filtered.length === 0 && (
          <Card variant="solid" className="p-10 text-center">
            <div className="text-2xl mb-3 opacity-50" aria-hidden="true">?</div>
            <p className="text-[var(--admin-text-secondary)]">No FAQs match your filters.</p>
          </Card>
        )}
      </div>

      <Modal
        isOpen={modalOpen}
        onClose={closeModal}
        title={editingId ? 'Edit FAQ' : 'Create FAQ'}
        className="max-w-xl"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Question *"
            placeholder="e.g. What services does Growthbridge offer?"
            value={form.question}
            onChange={(e) => setForm({ ...form, question: e.target.value })}
            required
          />
          <Textarea
            label="Answer *"
            placeholder="Provide a clear, helpful answer..."
            value={form.answer}
            onChange={(e) => setForm({ ...form, answer: e.target.value })}
            required
            className="min-h-[160px]"
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-[var(--admin-text-secondary)] uppercase tracking-wider">
                Category
              </label>
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="w-full rounded-xl bg-[var(--admin-surface-card)]/60 border border-[var(--admin-border)] text-[var(--admin-text-primary)] px-4 py-3 text-sm transition-colors focus:outline-none focus:border-[var(--gb-green-600)] focus:ring-1 focus:ring-[var(--gb-green-600)] cursor-pointer"
              >
                <option value="General">General</option>
                <option value="Services">Services</option>
                <option value="Partnerships">Partnerships</option>
                <option value="Talent & Training">Talent & Training</option>
                <option value="Community">Community</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Order #"
                type="number"
                min={1}
                value={form.order}
                onChange={(e) => setForm({ ...form, order: Math.max(1, parseInt(e.target.value) || 1) })}
              />
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-[var(--admin-text-secondary)] uppercase tracking-wider">
                  Status
                </label>
                <select
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value as 'draft' | 'published' })}
                  className="w-full h-[calc(100%-1.5rem)] mt-[1.5rem] rounded-xl bg-[var(--admin-surface-card)]/60 border border-[var(--admin-border)] text-[var(--admin-text-primary)] px-4 py-3 text-sm transition-colors focus:outline-none focus:border-[var(--gb-green-600)] focus:ring-1 focus:ring-[var(--gb-green-600)] cursor-pointer"
                >
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                </select>
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" onClick={closeModal} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" variant="accent" className="flex-1">
              {editingId ? 'Save Changes' : 'Create FAQ'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
