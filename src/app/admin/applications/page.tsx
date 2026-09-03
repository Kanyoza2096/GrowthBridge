'use client';

import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useAdminAuth } from '@/components/providers/AdminAuthProvider';
import { useAdminData } from '@/components/providers/AdminDataProvider';
import { useToast } from '@/components/providers/ToastProvider';
import { Application, ApplicationType, ApplicationStatus } from '@/lib/types/admin';
import { cn } from '@/lib/utils';
import { AdminPageHeader, AdminToolbar } from '@/components/admin/AdminPageHeader';
import { AdminEmptyState } from '@/components/admin/AdminEmptyState';
import {
  ApplicationCard,
  STATUS_OPTIONS,
} from '@/components/admin/ApplicationCard';

const TYPE_TABS: { key: 'all' | ApplicationType; label: string }[] = [
  { key: 'all', label: 'All Applications' },
  { key: 'talent', label: 'Talent' },
  { key: 'partnership', label: 'Partnerships' },
  { key: 'client', label: 'Clients' },
  { key: 'volunteer', label: 'Volunteers' },
];

const STATUS_FILTERS: { key: 'all' | ApplicationStatus; label: string }[] = [
  { key: 'all', label: 'All Status' },
  ...STATUS_OPTIONS.map((s) => ({ key: s, label: s.charAt(0).toUpperCase() + s.slice(1) })),
];

function exportApplications(items: Application[]) {
  const headers = ['Name', 'Email', 'Phone', 'Type', 'Status', 'Subject', 'Submitted At'];
  const escape = (value: string) => `"${value.replace(/"/g, '""')}"`;
  const rows = items.map((item) => [item.applicant_name, item.email, item.phone || '', item.type, item.status, item.subject || '', item.submitted_at].map((v) => escape(String(v))).join(','));
  const blob = new Blob([[headers.map(escape).join(','), ...rows].join('\n')], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `growthbridge-applications-${new Date().toISOString().slice(0, 10)}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

export default function AdminApplicationsPage() {
  const { hasPermission, user } = useAdminAuth();
  const { applications, updateApplicationStatus, addApplicationNote } = useAdminData();
  const { success, error } = useToast();

  const [typeTab, setTypeTab] = useState<'all' | ApplicationType>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | ApplicationStatus>('all');
  const [search, setSearch] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const canEdit = hasPermission('applications', 'update');
  const canRead = hasPermission('applications', 'read');

  const counts = useMemo(() => {
    const base: Record<string, number> = {
      all: applications.length,
      talent: 0,
      partnership: 0,
      client: 0,
      volunteer: 0,
    };
    applications.forEach((a) => {
      base[a.type] = (base[a.type] || 0) + 1;
    });
    return base;
  }, [applications]);

  const filtered = useMemo(() => {
    return applications.filter((a) => {
      if (typeTab !== 'all' && a.type !== typeTab) return false;
      if (statusFilter !== 'all' && a.status !== statusFilter) return false;
      if (search) {
        const q = search.toLowerCase();
        const haystack = [
          a.name,
          a.email,
          a.phone,
          a.role || '',
          a.subject || '',
          a.message || '',
          ...(a.skills || []),
        ]
          .join(' ')
          .toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });
  }, [applications, typeTab, statusFilter, search]);

  const handleStatusChange = (id: string, newStatus: ApplicationStatus) => {
    try {
      updateApplicationStatus(id, newStatus);
      success('Status Updated', `Application moved to ${newStatus.toUpperCase()}`);
    } catch (e) {
      error('Update Failed', 'Could not update application status.');
    }
  };

  const handleAddNote = (id: string, content: string) => {
    try {
      addApplicationNote(id, content, user?.id || 'admin-1', user?.name || 'Admin User');
      success('Note Added', 'Internal note has been saved.');
    } catch (e) {
      error('Note Failed', 'Could not add the note.');
    }
  };

  return (
    <div className="admin-page space-y-6">
      <AdminPageHeader
        eyebrow="Operations / Intake"
        title="Application pipeline"
        description="Review, assign, and move submissions through a single operational workflow."
        actions={
          <div className="flex flex-wrap gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => {
              setTypeTab('all');
              setStatusFilter('all');
              setSearch('');
              setExpandedId(null);
            }}
          >
            Reset Filters
          </Button>
          {canEdit && (
            <Button variant="outline" size="sm" leftIcon={<span aria-hidden="true">↓</span>} onClick={() => exportApplications(filtered)}>
              Export CSV
            </Button>
          )}
          </div>
        }
      />

      <AdminToolbar className="flex-col md:flex-row md:items-center">
        <div className="flex flex-wrap gap-2">
          {TYPE_TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setTypeTab(tab.key)}
              className={cn(
                'px-3.5 py-2 rounded-xl text-xs font-bold border transition-all duration-200 cursor-pointer flex items-center gap-2',
                typeTab === tab.key
                  ? 'bg-[var(--gb-green-600)] border-[var(--gb-green-600)] text-white shadow-lg shadow-[var(--gb-green-600)]/20'
                  : 'bg-[var(--admin-surface-card)]/60 border-[var(--admin-border-strong)] text-[var(--admin-text-secondary)] hover:text-[var(--admin-text-primary)] hover:border-[var(--admin-border-strong)]'
              )}
            >
              {tab.label}
              <span
                className={cn(
                  'px-1.5 py-0.5 rounded-full text-[9px] font-bold',
                  typeTab === tab.key
                    ? 'bg-white/20 text-white'
                    : 'bg-[var(--admin-surface-soft)] text-[var(--admin-text-tertiary)]'
                )}
              >
                {counts[tab.key] || 0}
              </span>
            </button>
          ))}
        </div>

        <div className="flex flex-col md:flex-row md:items-center gap-4">
          <div className="flex-1 max-w-md">
            <Input
              placeholder="Search name, email, subject, skills, message..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              leftIcon={
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              }
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {STATUS_FILTERS.map((sf) => (
              <button
                key={sf.key}
                onClick={() => setStatusFilter(sf.key)}
                className={cn(
                  'px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase border transition-all cursor-pointer tracking-wide',
                  statusFilter === sf.key
                    ? 'bg-[var(--gb-navy-800)] border-[var(--gb-navy-800)] text-white'
                    : 'bg-[var(--admin-surface-card)]/60 border-[var(--admin-border)] text-[var(--admin-text-tertiary)] hover:text-[var(--admin-text-secondary)] hover:border-[var(--admin-border-strong)]'
                )}
              >
                {sf.label}
              </button>
            ))}
          </div>
        </div>
      </AdminToolbar>

      <div className="flex items-center justify-between">
        <p className="text-xs text-[var(--admin-text-secondary)] font-semibold">
          Showing <span className="text-[var(--admin-text-primary)]">{filtered.length}</span> of{' '}
          <span className="text-[var(--admin-text-primary)]">{applications.length}</span> applications
        </p>
      </div>

      {!canRead ? (
        <AdminEmptyState
          icon="lock"
          title="Access restricted"
          description="Your current role does not have permission to view applications."
        />
      ) : filtered.length === 0 ? (
        <AdminEmptyState
          icon={search ? 'search' : 'inbox'}
          title={search ? 'No matching applications' : 'No applications yet'}
          description={search ? 'Try a broader search or clear one of the active filters.' : 'New submissions will appear here when they are received.'}
          action={(search || typeTab !== 'all' || statusFilter !== 'all') ? (
            <Button variant="ghost" size="sm" onClick={() => { setTypeTab('all'); setStatusFilter('all'); setSearch(''); }}>
              Clear filters
            </Button>
          ) : undefined}
        />
      ) : (
        <div className="space-y-4">
          {filtered.map((app) => (
            <ApplicationCard
              key={app.id}
              app={app}
              expanded={expandedId === app.id}
              onToggle={() => setExpandedId(expandedId === app.id ? null : app.id)}
              canEdit={canEdit}
              onStatusChange={(status) => handleStatusChange(app.id, status)}
              onAddNote={(content) => handleAddNote(app.id, content)}
              onAssigneeChange={() => {}}
            />
          ))}
        </div>
      )}
    </div>
  );
}
