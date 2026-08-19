'use client';

import React, { useState, useMemo } from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { useAdminAuth } from '@/components/providers/AdminAuthProvider';
import { useAdminData } from '@/components/providers/AdminDataProvider';
import { useToast } from '@/components/providers/ToastProvider';
import { Application, ApplicationType, ApplicationStatus } from '@/lib/types/admin';
import { cn } from '@/lib/utils';

const TYPE_TABS: { key: 'all' | ApplicationType; label: string }[] = [
  { key: 'all', label: 'All Applications' },
  { key: 'talent', label: 'Talent' },
  { key: 'partnership', label: 'Partnerships' },
  { key: 'client', label: 'Clients' },
  { key: 'volunteer', label: 'Volunteers' },
];

const STATUS_OPTIONS: ApplicationStatus[] = ['submitted', 'reviewing', 'approved', 'rejected', 'completed'];

const STATUS_FILTERS: { key: 'all' | ApplicationStatus; label: string }[] = [
  { key: 'all', label: 'All Status' },
  ...STATUS_OPTIONS.map((s) => ({ key: s, label: s.charAt(0).toUpperCase() + s.slice(1) })),
];

const ASSIGNEES = [
  'Unassigned',
  'Sipho Ndlovu',
  'Naledi Mokoena',
  'Bongani Dlamini',
  'Ayanda Khumalo',
  'Zanele Ncube',
  'Mfundo Ntuli',
];

const typeBadgeVariant: Record<ApplicationType, 'green' | 'blue' | 'orange' | 'purple'> = {
  talent: 'green',
  partnership: 'orange',
  client: 'blue',
  volunteer: 'purple',
};

const statusBadgeVariant: Record<ApplicationStatus, 'green' | 'blue' | 'orange' | 'outline' | 'purple'> = {
  submitted: 'outline',
  reviewing: 'blue',
  approved: 'green',
  rejected: 'outline',
  completed: 'purple',
};

function StatusSelect({
  value,
  onChange,
  disabled,
}: {
  value: ApplicationStatus;
  onChange: (v: ApplicationStatus) => void;
  disabled?: boolean;
}) {
  return (
    <select
      value={value}
      disabled={disabled}
      onChange={(e) => onChange(e.target.value as ApplicationStatus)}
      className={cn(
        'rounded-xl bg-slate-900/60 border border-slate-700 text-white text-xs font-semibold px-3 py-2 focus:outline-none focus:border-[#16A36A] focus:ring-1 focus:ring-[#16A36A] transition-colors',
        disabled && 'opacity-50 cursor-not-allowed'
      )}
    >
      {STATUS_OPTIONS.map((s) => (
        <option key={s} value={s}>
          {s.toUpperCase()}
        </option>
      ))}
    </select>
  );
}

function ApplicationCard({
  app,
  expanded,
  onToggle,
  canEdit,
  onStatusChange,
  onAddNote,
  onAssigneeChange,
}: {
  app: Application;
  expanded: boolean;
  onToggle: () => void;
  canEdit: boolean;
  onStatusChange: (status: ApplicationStatus) => void;
  onAddNote: (content: string) => void;
  onAssigneeChange: (assignee: string) => void;
}) {
  const [noteText, setNoteText] = useState('');
  const [noteLoading, setNoteLoading] = useState(false);

  const handleAddNote = () => {
    if (!noteText.trim()) return;
    setNoteLoading(true);
    onAddNote(noteText.trim());
    setNoteText('');
    setTimeout(() => setNoteLoading(false), 300);
  };

  const submittedDate = new Date(app.submittedAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <Card
      variant={expanded ? 'gradient' : 'glass'}
      hoverEffect={!expanded}
      className={cn(
        'cursor-pointer transition-all duration-300',
        expanded && 'ring-1 ring-[#16A36A]/30 shadow-2xl shadow-[#16A36A]/5'
      )}
      onClick={onToggle}
    >
      <div className="space-y-0">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="flex-1 min-w-0 space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant={typeBadgeVariant[app.type]} className="text-[10px] uppercase">
                {app.type}
              </Badge>
              <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">
                {submittedDate}
              </span>
              {app.assignee && (
                <Badge variant="blue" className="text-[10px]">
                  👤 {app.assignee}
                </Badge>
              )}
            </div>
            <h3 className="text-lg sm:text-xl font-extrabold text-white truncate">{app.name}</h3>
            <p className="text-sm text-emerald-400 font-semibold truncate">
              {app.role || app.subject || 'No subject provided'}
            </p>
          </div>

          <div
            className="flex items-center gap-3"
            onClick={(e) => e.stopPropagation()}
          >
            <StatusSelect
              value={app.status}
              onChange={onStatusChange}
              disabled={!canEdit}
            />
            <Badge variant={statusBadgeVariant[app.status]} className="text-[10px] font-bold">
              {app.status.toUpperCase()}
            </Badge>
            <button
              className={cn(
                'p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-all duration-300 cursor-pointer',
                expanded && 'rotate-180 text-[#16A36A] bg-[#16A36A]/10'
              )}
              aria-label={expanded ? 'Collapse' : 'Expand'}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>
        </div>

        {expanded && (
          <div
            className="mt-6 pt-6 border-t border-slate-700/50 space-y-6 animate-in slide-in-from-top-2 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2 space-y-5">
                <div className="space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-widest text-slate-400">
                    Contact Information
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                      <p className="text-[10px] text-slate-500 uppercase font-semibold mb-0.5">Email</p>
                      <a
                        href={`mailto:${app.email}`}
                        className="text-sm text-emerald-400 font-semibold hover:underline break-all"
                      >
                        {app.email}
                      </a>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                      <p className="text-[10px] text-slate-500 uppercase font-semibold mb-0.5">Phone</p>
                      <p className="text-sm text-white font-semibold">{app.phone}</p>
                    </div>
                    {app.portfolio && (
                      <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 sm:col-span-2">
                        <p className="text-[10px] text-slate-500 uppercase font-semibold mb-0.5">Portfolio / Website</p>
                        <a
                          href={app.portfolio}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-blue-400 font-semibold hover:underline break-all"
                        >
                          {app.portfolio} ↗
                        </a>
                      </div>
                    )}
                  </div>
                </div>

                {(app.skills && app.skills.length > 0) && (
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold uppercase tracking-widest text-slate-400">
                      Skills & Expertise
                    </h4>
                    <div className="flex flex-wrap gap-1.5">
                      {app.skills.map((skill) => (
                        <span
                          key={skill}
                          className="px-2.5 py-1 rounded-lg text-[10px] font-semibold bg-[#123B5D]/40 text-slate-200 border border-[#123B5D]/60"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {app.message && (
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold uppercase tracking-widest text-slate-400">
                      {app.type === 'talent' ? 'Motivation / Cover Letter' : 'Message / Details'}
                    </h4>
                    <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
                      <p className="text-sm text-slate-200 leading-relaxed whitespace-pre-wrap">
                        {app.message}
                      </p>
                    </div>
                  </div>
                )}

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold uppercase tracking-widest text-slate-400">
                      Notes & Comments
                    </h4>
                    <span className="text-[10px] text-slate-500 font-semibold">
                      {app.notes.length} note{app.notes.length !== 1 ? 's' : ''}
                    </span>
                  </div>
                  <div className="space-y-2">
                    {canEdit && (
                      <div className="p-3 rounded-xl bg-[#123B5D]/20 border border-[#123B5D]/40 space-y-2">
                        <Textarea
                          placeholder="Add an internal note about this application..."
                          value={noteText}
                          onChange={(e) => setNoteText(e.target.value)}
                          className="min-h-[80px] bg-slate-900/80"
                        />
                        <div className="flex justify-end">
                          <Button
                            size="sm"
                            variant="primary"
                            onClick={handleAddNote}
                            isLoading={noteLoading}
                            disabled={!noteText.trim()}
                          >
                            + Add Note
                          </Button>
                        </div>
                      </div>
                    )}
                    {app.notes.length === 0 ? (
                      <div className="p-6 rounded-xl bg-slate-900/40 border border-slate-800 text-center">
                        <p className="text-xs text-slate-500">No notes yet.</p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {[...app.notes].reverse().map((note) => (
                          <div
                            key={note.id}
                            className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1.5"
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[#123B5D] to-[#16A36A] flex items-center justify-center text-[9px] font-bold text-white">
                                  {note.authorName.charAt(0)}
                                </div>
                                <span className="text-xs font-bold text-white">{note.authorName}</span>
                              </div>
                              <span className="text-[10px] text-slate-500 font-semibold">
                                {new Date(note.createdAt).toLocaleDateString('en-US', {
                                  month: 'short',
                                  day: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                              </span>
                            </div>
                            <p className="text-xs text-slate-300 leading-relaxed pl-8">
                              {note.content}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-5">
                <div className="space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-widest text-slate-400">
                    Assigned To
                  </h4>
                  {canEdit ? (
                    <select
                      value={app.assignee || 'Unassigned'}
                      onChange={(e) =>
                        onAssigneeChange(e.target.value === 'Unassigned' ? '' : e.target.value)
                      }
                      className="w-full rounded-xl bg-slate-900/60 border border-slate-700 text-white text-xs font-semibold px-3 py-2.5 focus:outline-none focus:border-[#16A36A] focus:ring-1 focus:ring-[#16A36A]"
                    >
                      {ASSIGNEES.map((a) => (
                        <option key={a} value={a}>
                          {a}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                      <p className="text-sm text-white font-semibold">{app.assignee || 'Unassigned'}</p>
                    </div>
                  )}
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold uppercase tracking-widest text-slate-400">
                      History Timeline
                    </h4>
                    <span className="text-[10px] text-slate-500 font-semibold">
                      {app.history.length} event{app.history.length !== 1 ? 's' : ''}
                    </span>
                  </div>
                  <div className="relative pl-5 space-y-0">
                    <div className="absolute left-1.5 top-1.5 bottom-1.5 w-px bg-gradient-to-b from-[#16A36A]/60 via-[#123B5D] to-transparent" />
                    {[...app.history].reverse().map((h, idx, arr) => (
                      <div key={h.id} className="relative pb-4 last:pb-0">
                        <div
                          className={cn(
                            'absolute -left-[17px] top-1 w-3 h-3 rounded-full border-2 border-slate-900',
                            idx === 0
                              ? 'bg-[#16A36A] shadow-[0_0_0_3px_rgba(22,163,106,0.2)]'
                              : 'bg-[#123B5D]'
                          )}
                        />
                        <div className="space-y-0.5">
                          <p className="text-xs font-bold text-white leading-tight">
                            {h.action}
                          </p>
                          {h.oldStatus && h.newStatus && (
                            <p className="text-[11px] text-slate-400 font-medium">
                              <span className={cn(
                                'px-1.5 py-0.5 rounded text-[9px] mr-1',
                                h.oldStatus === 'rejected'
                                  ? 'bg-rose-500/15 text-rose-300'
                                  : 'bg-slate-700/50 text-slate-300'
                              )}>
                                {h.oldStatus}
                              </span>
                              <span className="text-slate-500 mx-0.5">→</span>
                              <span className={cn(
                                'px-1.5 py-0.5 rounded text-[9px] ml-1',
                                h.newStatus === 'approved'
                                  ? 'bg-emerald-500/15 text-emerald-300'
                                  : h.newStatus === 'rejected'
                                  ? 'bg-rose-500/15 text-rose-300'
                                  : h.newStatus === 'completed'
                                  ? 'bg-purple-500/15 text-purple-300'
                                  : 'bg-[#123B5D]/40 text-blue-300'
                              )}>
                                {h.newStatus}
                              </span>
                            </p>
                          )}
                          <p className="text-[10px] text-slate-500">
                            {h.actorName} ·{' '}
                            {new Date(h.timestamp).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
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
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Badge variant="orange" className="text-[9px] mb-1.5">
            UNIFIED APPLICATION PIPELINE
          </Badge>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
            Application Manager
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Manage talent, partnership, client, and volunteer submissions in one place.
          </p>
        </div>
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
            <Button variant="accent" size="sm">
              ⤓ Export CSV
            </Button>
          )}
        </div>
      </div>

      <Card variant="solid" className="p-4 sm:p-5 space-y-4">
        <div className="flex flex-wrap gap-2">
          {TYPE_TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setTypeTab(tab.key)}
              className={cn(
                'px-3.5 py-2 rounded-xl text-xs font-bold border transition-all duration-200 cursor-pointer flex items-center gap-2',
                typeTab === tab.key
                  ? 'bg-[#16A36A] border-[#16A36A] text-white shadow-lg shadow-[#16A36A]/20'
                  : 'bg-slate-900/60 border-slate-700 text-slate-400 hover:text-white hover:border-slate-600'
              )}
            >
              {tab.label}
              <span
                className={cn(
                  'px-1.5 py-0.5 rounded-full text-[9px] font-bold',
                  typeTab === tab.key
                    ? 'bg-white/20 text-white'
                    : 'bg-slate-800 text-slate-500'
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
                    ? 'bg-[#123B5D] border-[#123B5D] text-white'
                    : 'bg-slate-900/60 border-slate-800 text-slate-500 hover:text-slate-300 hover:border-slate-700'
                )}
              >
                {sf.label}
              </button>
            ))}
          </div>
        </div>
      </Card>

      <div className="flex items-center justify-between">
        <p className="text-xs text-slate-400 font-semibold">
          Showing <span className="text-white">{filtered.length}</span> of{' '}
          <span className="text-white">{applications.length}</span> applications
        </p>
      </div>

      {!canRead ? (
        <Card variant="glass" className="p-10 text-center">
          <div className="text-4xl mb-3">🔒</div>
          <h3 className="text-lg font-bold text-white mb-1">Access Restricted</h3>
          <p className="text-xs text-slate-400">
            You do not have permission to view applications.
          </p>
        </Card>
      ) : filtered.length === 0 ? (
        <Card variant="glass" className="p-12 text-center">
          <div className="text-5xl mb-4">📭</div>
          <h3 className="text-lg font-bold text-white mb-1">No Applications Found</h3>
          <p className="text-xs text-slate-400">
            Try adjusting your filters or search query.
          </p>
        </Card>
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
