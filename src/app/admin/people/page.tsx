'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { usePeople } from '@/lib/api/hooks/usePeople';
import { apiClient } from '@/lib/api/api-client';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import {
  PERSON_CATEGORIES,
  PERSON_CATEGORY_LABELS,
  type PersonCategory,
  type Person,
} from '@/lib/types/person';

export default function AdminPeoplePage() {
  const [selectedCategory, setSelectedCategory] = useState<PersonCategory | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const { data: people, isLoading, refetch } = usePeople({
    onlyActive: false,
  });

  const filteredPeople = useMemo(() => {
    if (!people) return [];
    let list = [...people];
    if (selectedCategory !== 'all') {
      list = list.filter((p) => p.category === selectedCategory);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (p) =>
          p.fullName.toLowerCase().includes(q) ||
          p.title.toLowerCase().includes(q) ||
          (p.department && p.department.toLowerCase().includes(q)) ||
          (p.email && p.email.toLowerCase().includes(q))
      );
    }
    return list;
  }, [people, selectedCategory, searchQuery]);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this person record?')) return;
    setDeletingId(id);
    try {
      if (apiClient.deletePerson) {
        await apiClient.deletePerson(id);
      }
      await refetch();
    } catch (err) {
      alert('Failed to delete person: ' + (err as Error).message);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="admin-page space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white">People Directory Management</h1>
          <p className="text-xs text-[var(--admin-text-secondary)] mt-1">
            Manage core team members, advisors, board directors, alumni, partner reps, and contributors.
          </p>
        </div>

        <Link href="/admin/people/new">
          <Button variant="accent" size="sm">
            + Add New Person
          </Button>
        </Link>
      </div>

      {/* Stats Quick Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="rounded-2xl p-4 bg-[var(--admin-surface-card)] border border-[var(--admin-border)]">
          <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--admin-text-secondary)]">Total People</p>
          <p className="text-2xl font-black text-white mt-1">{people?.length ?? 0}</p>
        </div>
        <div className="rounded-2xl p-4 bg-[var(--admin-surface-card)] border border-[var(--admin-border)]">
          <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--admin-text-secondary)]">Core Team</p>
          <p className="text-2xl font-black text-[var(--gb-green-400)] mt-1">
            {people?.filter((p) => p.category === 'team').length ?? 0}
          </p>
        </div>
        <div className="rounded-2xl p-4 bg-[var(--admin-surface-card)] border border-[var(--admin-border)]">
          <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--admin-text-secondary)]">Advisors & Board</p>
          <p className="text-2xl font-black text-amber-400 mt-1">
            {people?.filter((p) => p.category === 'advisor' || p.category === 'board').length ?? 0}
          </p>
        </div>
        <div className="rounded-2xl p-4 bg-[var(--admin-surface-card)] border border-[var(--admin-border)]">
          <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--admin-text-secondary)]">Alumni & Reps</p>
          <p className="text-2xl font-black text-blue-400 mt-1">
            {people?.filter((p) => p.category === 'alumni' || p.category === 'partner_rep' || p.category === 'contributor').length ?? 0}
          </p>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-[var(--admin-surface-card)] p-4 rounded-2xl border border-[var(--admin-border)]">
        <div className="w-full sm:w-72">
          <Input
            placeholder="Search by name, role, email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="flex flex-wrap gap-2 w-full sm:w-auto">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition-colors cursor-pointer ${
              selectedCategory === 'all'
                ? 'bg-[var(--gb-green-600)] text-white'
                : 'bg-[var(--admin-surface-soft)] text-[var(--admin-text-secondary)] hover:text-[var(--admin-text-primary)]'
            }`}
          >
            All ({people?.length ?? 0})
          </button>
          {PERSON_CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition-colors cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-[var(--gb-green-600)] text-white'
                  : 'bg-[var(--admin-surface-soft)] text-[var(--admin-text-secondary)] hover:text-[var(--admin-text-primary)]'
              }`}
            >
              {PERSON_CATEGORY_LABELS[cat]}
            </button>
          ))}
        </div>
      </div>

      {/* People Table */}
      <div className="rounded-2xl border border-[var(--admin-border)] bg-[var(--admin-surface-card)] overflow-hidden shadow-xl">
        {isLoading ? (
          <div className="py-20 text-center text-xs text-[var(--admin-text-tertiary)]">Loading people directory...</div>
        ) : filteredPeople.length === 0 ? (
          <div className="py-20 text-center text-xs text-[var(--admin-text-tertiary)]">No people records found.</div>
        ) : (
          <div className="gb-table-wrap">
            <table className="w-full min-w-[720px] text-left text-xs">
              <thead className="bg-[var(--admin-surface-deep)]/60 text-[var(--admin-text-secondary)] uppercase tracking-widest text-[10px] border-b border-[var(--admin-border)]">
                <tr>
                  <th className="p-4">Person</th>
                  <th className="p-4">Category</th>
                  <th className="p-4">Title / Dept</th>
                  <th className="p-4">Order</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredPeople.map((person) => {
                  const initials = person.fullName
                    .split(' ')
                    .map((n) => n[0])
                    .join('')
                    .substring(0, 2)
                    .toUpperCase();

                  return (
                    <tr key={person.id} className="hover:bg-[var(--admin-surface-soft)]/40 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center space-x-3">
                          {person.photo ? (
                            <img
                              src={person.photo}
                              alt={person.fullName}
                              className="w-10 h-10 rounded-xl object-cover border border-[var(--admin-border-strong)]"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--gb-navy-800)] to-[var(--gb-green-600)] flex items-center justify-center font-bold text-white text-xs">
                              {initials}
                            </div>
                          )}
                          <div>
                            <p className="font-bold text-white text-sm">{person.fullName}</p>
                            <p className="text-[11px] text-[var(--admin-text-secondary)]">{person.email || person.slug}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <Badge
                          variant={
                            person.category === 'team'
                              ? 'green'
                              : person.category === 'advisor'
                              ? 'orange'
                              : person.category === 'board'
                              ? 'blue'
                              : 'gray'
                          }
                          className="text-[10px]"
                        >
                          {PERSON_CATEGORY_LABELS[person.category]}
                        </Badge>
                      </td>
                      <td className="p-4">
                        <p className="font-semibold text-[var(--admin-text-primary)]">{person.title}</p>
                        {person.department && (
                          <p className="text-[10px] text-[var(--admin-text-secondary)]">{person.department}</p>
                        )}
                      </td>
                      <td className="p-4 text-[var(--admin-text-secondary)] font-mono text-[11px]">
                        #{person.displayOrder}
                      </td>
                      <td className="p-4 space-x-1">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                            person.active
                              ? 'bg-[var(--gb-green-600)]/20 text-[var(--gb-green-300)]'
                              : 'bg-rose-500/20 text-rose-300'
                          }`}
                        >
                          {person.active ? 'Active' : 'Inactive'}
                        </span>
                        {person.featured && (
                          <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300">
                            Featured
                          </span>
                        )}
                      </td>
                      <td className="p-4 text-right space-x-2">
                        <Link href={`/admin/people/${person.id}/edit`}>
                          <button className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-[var(--admin-surface-soft)] text-[var(--admin-text-secondary)] hover:bg-[var(--admin-border-strong)] hover:text-[var(--admin-text-primary)] transition-colors cursor-pointer">
                            Edit
                          </button>
                        </Link>
                        <button
                          onClick={() => handleDelete(person.id)}
                          disabled={deletingId === person.id}
                          className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 transition-colors cursor-pointer disabled:opacity-50"
                        >
                          {deletingId === person.id ? 'Deleting...' : 'Delete'}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
