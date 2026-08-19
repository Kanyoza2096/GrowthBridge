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
import { Project } from '@/lib/types/admin';

type StatusFilter = 'all' | 'draft' | 'published' | 'archived';

const emptyForm = {
  id: undefined as string | undefined,
  title: '',
  slug: '',
  client: '',
  description: '',
  longDescription: '',
  category: '',
  technologies: '',
  impactStats: '',
  featured: false,
  status: 'draft' as Project['status'],
  startDate: '',
  endDate: '',
};

function statusVariant(status: Project['status']) {
  if (status === 'published') return 'green';
  if (status === 'draft') return 'outline';
  return 'orange';
}

export default function AdminProjectsPage() {
  const { hasPermission } = useAdminAuth();
  const { projects, upsertProject, deleteProject } = useAdminData();
  const { success, error, warning } = useToast();

  const [filterStatus, setFilterStatus] = useState<StatusFilter>('all');
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [isEditing, setIsEditing] = useState(false);

  const canCreate = hasPermission('projects', 'create');
  const canUpdate = hasPermission('projects', 'update');
  const canDelete = hasPermission('projects', 'delete');

  const filtered = useMemo(() => {
    return projects.filter((p) => {
      const matchesStatus = filterStatus === 'all' || p.status === filterStatus;
      const q = search.toLowerCase();
      const matchesSearch =
        p.title.toLowerCase().includes(q) ||
        p.client.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.technologies.some((t) => t.toLowerCase().includes(q));
      return matchesStatus && matchesSearch;
    });
  }, [projects, filterStatus, search]);

  const openCreate = () => {
    if (!canCreate) {
      warning('Permission Denied', 'You do not have permission to create projects.');
      return;
    }
    setForm(emptyForm);
    setIsEditing(false);
    setModalOpen(true);
  };

  const openEdit = (proj: Project) => {
    if (!canUpdate) {
      warning('Permission Denied', 'You do not have permission to edit projects.');
      return;
    }
    setForm({
      id: proj.id,
      title: proj.title,
      slug: proj.slug,
      client: proj.client,
      description: proj.description,
      longDescription: proj.longDescription || '',
      category: proj.category,
      technologies: proj.technologies.join(', '),
      impactStats: proj.impactStats.map((s) => `${s.label}:${s.value}`).join('\n'),
      featured: proj.featured,
      status: proj.status,
      startDate: proj.startDate || '',
      endDate: proj.endDate || '',
    });
    setIsEditing(true);
    setModalOpen(true);
  };

  const handleSubmit = () => {
    if (!form.title.trim()) {
      error('Validation Error', 'Title is required.');
      return;
    }
    const techArr = form.technologies
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);
    const statsArr = form.impactStats
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line) => {
        const idx = line.indexOf(':');
        if (idx === -1) return { label: line, value: '' };
        return { label: line.slice(0, idx).trim(), value: line.slice(idx + 1).trim() };
      })
      .filter((s) => s.label);

    upsertProject({
      id: form.id,
      title: form.title.trim(),
      slug: form.slug.trim() || form.title.toLowerCase().replace(/\s+/g, '-'),
      client: form.client.trim(),
      description: form.description.trim(),
      longDescription: form.longDescription.trim() || undefined,
      category: form.category.trim() || 'General',
      technologies: techArr,
      impactStats: statsArr,
      featured: form.featured,
      status: form.status,
      startDate: form.startDate || undefined,
      endDate: form.endDate || undefined,
    });

    success(isEditing ? 'Project Updated' : 'Project Created', `${form.title} has been saved.`);
    setModalOpen(false);
    setForm(emptyForm);
  };

  const handleDelete = (proj: Project) => {
    if (!canDelete) {
      warning('Permission Denied', 'You do not have permission to delete projects.');
      return;
    }
    if (!window.confirm(`Delete project "${proj.title}"? This cannot be undone.`)) return;
    deleteProject(proj.id);
    success('Project Deleted', `${proj.title} has been removed.`);
  };

  const toggleFeatured = (proj: Project) => {
    if (!canUpdate) {
      warning('Permission Denied', 'You do not have permission to feature projects.');
      return;
    }
    upsertProject({ id: proj.id, featured: !proj.featured });
    success('Project Updated', `${proj.title} is now ${!proj.featured ? 'featured' : 'unfeatured'}.`);
  };

  const counts = useMemo(() => ({
    all: projects.length,
    published: projects.filter((p) => p.status === 'published').length,
    draft: projects.filter((p) => p.status === 'draft').length,
    archived: projects.filter((p) => p.status === 'archived').length,
  }), [projects]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Badge variant="blue" className="text-[9px] mb-1">PORTFOLIO MANAGEMENT</Badge>
          <h1 className="text-2xl font-extrabold text-white">Projects</h1>
        </div>
        <div className="flex flex-wrap gap-2">
          {(['all', 'published', 'draft', 'archived'] as StatusFilter[]).map((st) => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                filterStatus === st
                  ? 'bg-[#16A36A] border-[#16A36A] text-white'
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              {st.toUpperCase()} ({counts[st]})
            </button>
          ))}
          <Button size="sm" onClick={openCreate} disabled={!canCreate}>
            + Add Project
          </Button>
        </div>
      </div>

      <div className="max-w-md">
        <Input
          placeholder="Search projects by title, client, tech..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {filtered.map((proj) => (
          <Card key={proj.id} variant="glass" className="p-5 space-y-4 flex flex-col">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <Badge variant="blue">{proj.category}</Badge>
                  <Badge variant={statusVariant(proj.status)}>{proj.status.toUpperCase()}</Badge>
                  {proj.featured && (
                    <Badge variant="orange" title="Featured">
                      ★ FEATURED
                    </Badge>
                  )}
                </div>
                <h3 className="text-lg font-bold text-white truncate">{proj.title}</h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Client: <span className="text-slate-200">{proj.client || '—'}</span>
                </p>
              </div>
              <button
                onClick={() => toggleFeatured(proj)}
                title={proj.featured ? 'Unfeature' : 'Feature'}
                className={`text-2xl leading-none transition-colors cursor-pointer ${proj.featured ? 'text-amber-400' : 'text-slate-600 hover:text-amber-400/70'}`}
                disabled={!canUpdate}
              >
                ★
              </button>
            </div>

            <p className="text-sm text-slate-300 line-clamp-2">{proj.description || <span className="text-slate-500 italic">No description</span>}</p>

            {proj.technologies.length > 0 && (
              <div className="space-y-1.5">
                <div className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold">Tech Stack</div>
                <div className="flex flex-wrap gap-1.5">
                  {proj.technologies.slice(0, 6).map((t) => (
                    <span key={t} className="px-2 py-0.5 rounded-lg bg-[#123B5D]/60 border border-[#123B5D]/50 text-[11px] text-blue-200">
                      {t}
                    </span>
                  ))}
                  {proj.technologies.length > 6 && (
                    <span className="px-2 py-0.5 text-[11px] text-slate-500">+{proj.technologies.length - 6}</span>
                  )}
                </div>
              </div>
            )}

            {proj.impactStats.length > 0 && (
              <div className="pt-3 border-t border-slate-800 space-y-1.5">
                <div className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold">Impact</div>
                <div className="grid grid-cols-2 gap-2">
                  {proj.impactStats.slice(0, 4).map((s, i) => (
                    <div key={`${proj.id}-${s.label}-${i}`} className="bg-slate-900/50 rounded-xl px-3 py-2 border border-slate-800">
                      <div className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold truncate">{s.label}</div>
                      <div className="text-sm font-bold text-emerald-400 truncate">{s.value}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex flex-wrap gap-2 pt-2 mt-auto">
              <div className="flex-1" />
              <Button size="sm" variant="outline" onClick={() => openEdit(proj)} disabled={!canUpdate}>Edit</Button>
              <Button size="sm" variant="ghost" onClick={() => handleDelete(proj)} disabled={!canDelete} className="text-rose-400 hover:text-rose-300 hover:bg-rose-500/10">Delete</Button>
            </div>
          </Card>
        ))}
        {filtered.length === 0 && (
          <Card variant="glass" className="md:col-span-2 p-10 text-center">
            <p className="text-slate-400">No projects match your filters.</p>
          </Card>
        )}
      </div>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={isEditing ? 'Edit Project' : 'Create Project'} className="max-w-2xl">
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label="Title *" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Project title" />
            <Input label="Slug" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} placeholder="auto-generated if empty" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label="Client" value={form.client} onChange={(e) => setForm({ ...form, client: e.target.value })} placeholder="Client organization" />
            <Input label="Category" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} placeholder="Healthcare, E-Commerce, ..." />
          </div>
          <Textarea label="Short Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="One-liner for listings..." rows={2} />
          <Textarea label="Long Description" value={form.longDescription} onChange={(e) => setForm({ ...form, longDescription: e.target.value })} placeholder="Full case study details..." rows={4} />
          <Input label="Technologies (comma-separated)" value={form.technologies} onChange={(e) => setForm({ ...form, technologies: e.target.value })} placeholder="Next.js, TypeScript, PostgreSQL, ..." />
          <Textarea
            label="Impact Stats (label:value, one per line)"
            value={form.impactStats}
            onChange={(e) => setForm({ ...form, impactStats: e.target.value })}
            placeholder="Wait Time Reduction:-60%&#10;Facilities Served:120+&#10;Patients Registered:500K+"
            rows={4}
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input type="date" label="Start Date" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} />
            <Input type="date" label="End Date" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">Status</label>
              <select
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value as Project['status'] })}
                className="w-full rounded-xl bg-slate-900/60 border border-slate-800 text-slate-100 px-4 py-3 text-sm focus:outline-none focus:border-[#16A36A] focus:ring-1 focus:ring-[#16A36A]"
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
                <option value="archived">Archived</option>
              </select>
            </div>
            <div className="flex items-end">
              <label className="inline-flex items-center gap-3 text-sm text-slate-200 cursor-pointer select-none bg-slate-900/60 border border-slate-800 rounded-xl px-4 py-3 w-full">
                <input
                  type="checkbox"
                  checked={form.featured}
                  onChange={(e) => setForm({ ...form, featured: e.target.checked })}
                  className="w-4 h-4 rounded accent-amber-500 bg-slate-800 border-slate-700"
                />
                <div>
                  <div className="font-semibold">Featured Project</div>
                  <div className="text-[11px] text-slate-400">Show in homepage showcase</div>
                </div>
              </label>
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button onClick={handleSubmit}>{isEditing ? 'Save Changes' : 'Create Project'}</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
