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
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white">People Directory Management</h1>
          <p className="text-xs text-slate-400 mt-1">
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
        <div className="rounded-2xl p-4 bg-slate-900 border border-slate-800">
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Total People</p>
          <p className="text-2xl font-black text-white mt-1">{people?.length ?? 0}</p>
        </div>
        <div className="rounded-2xl p-4 bg-slate-900 border border-slate-800">
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Core Team</p>
          <p className="text-2xl font-black text-emerald-400 mt-1">
            {people?.filter((p) => p.category === 'team').length ?? 0}
          </p>
        </div>
        <div className="rounded-2xl p-4 bg-slate-900 border border-slate-800">
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Advisors & Board</p>
          <p className="text-2xl font-black text-amber-400 mt-1">
            {people?.filter((p) => p.category === 'advisor' || p.category === 'board').length ?? 0}
          </p>
        </div>
        <div className="rounded-2xl p-4 bg-slate-900 border border-slate-800">
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Alumni & Reps</p>
          <p className="text-2xl font-black text-blue-400 mt-1">
            {people?.filter((p) => p.category === 'alumni' || p.category === 'partner_rep' || p.category === 'contributor').length ?? 0}
          </p>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-slate-900 p-4 rounded-2xl border border-slate-800">
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
                ? 'bg-emerald-500 text-white'
                : 'bg-slate-800 text-slate-400 hover:text-white'
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
                  ? 'bg-emerald-500 text-white'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              {PERSON_CATEGORY_LABELS[cat]}
            </button>
          ))}
        </div>
      </div>

      {/* People Table */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900 overflow-hidden shadow-xl">
        {isLoading ? (
          <div className="py-20 text-center text-xs text-slate-500">Loading people directory...</div>
        ) : filteredPeople.length === 0 ? (
          <div className="py-20 text-center text-xs text-slate-500">No people records found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/60 text-slate-400 uppercase tracking-widest text-[10px] border-b border-slate-800">
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
                    <tr key={person.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center space-x-3">
                          {person.photo ? (
                            <img
                              src={person.photo}
                              alt={person.fullName}
                              className="w-10 h-10 rounded-xl object-cover border border-slate-700"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#123B5D] to-[#16A36A] flex items-center justify-center font-bold text-white text-xs">
                              {initials}
                            </div>
                          )}
                          <div>
                            <p className="font-bold text-white text-sm">{person.fullName}</p>
                            <p className="text-[11px] text-slate-400">{person.email || person.slug}</p>
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
                        <p className="font-semibold text-slate-200">{person.title}</p>
                        {person.department && (
                          <p className="text-[10px] text-slate-400">{person.department}</p>
                        )}
                      </td>
                      <td className="p-4 text-slate-400 font-mono text-[11px]">
                        #{person.displayOrder}
                      </td>
                      <td className="p-4 space-x-1">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                            person.active
                              ? 'bg-emerald-500/20 text-emerald-300'
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
                          <button className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white transition-colors cursor-pointer">
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
