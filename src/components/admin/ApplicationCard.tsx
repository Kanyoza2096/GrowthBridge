'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Textarea } from '@/components/ui/Textarea';
import { Application, ApplicationType, ApplicationStatus } from '@/lib/types/admin';
import { cn } from '@/lib/utils';

export const STATUS_OPTIONS: ApplicationStatus[] = [
  'submitted',
  'reviewing',
  'approved',
  'rejected',
  'completed',
];

export const ASSIGNEES = [
  'Unassigned',
  'Sipho Ndlovu',
  'Naledi Mokoena',
  'Bongani Dlamini',
  'Ayanda Khumalo',
  'Zanele Ncube',
  'Mfundo Ntuli',
];

export const typeBadgeVariant: Record<ApplicationType, 'green' | 'blue' | 'orange' | 'purple'> = {
  talent: 'green',
  partnership: 'orange',
  client: 'blue',
  volunteer: 'purple',
};

export const statusBadgeVariant: Record<
  ApplicationStatus,
  'green' | 'blue' | 'orange' | 'outline' | 'purple'
> = {
  submitted: 'outline',
  reviewing: 'blue',
  approved: 'green',
  rejected: 'outline',
  completed: 'purple',
};

export function StatusSelect({
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
        'rounded-xl bg-[var(--admin-surface-card)]/60 border border-[var(--admin-border-strong)] text-white text-xs font-semibold px-3 py-2 focus:outline-none focus:border-[var(--gb-green-600)] focus:ring-1 focus:ring-[var(--gb-green-600)] transition-colors',
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

export function ApplicationCard({
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
        expanded && 'ring-1 ring-[var(--gb-green-600)]/30 shadow-2xl shadow-[var(--gb-green-600)]/5'
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
              <span className="text-[10px] text-[var(--admin-text-tertiary)] font-semibold uppercase tracking-wider">
                {submittedDate}
              </span>
              {app.assignee && (
                <Badge variant="blue" className="text-[10px]">
                  {app.assignee}
                </Badge>
              )}
            </div>
            <h3 className="text-lg sm:text-xl font-extrabold text-white truncate">{app.name}</h3>
            <p className="text-sm text-[var(--gb-green-400)] font-semibold truncate">
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
                'p-2 rounded-xl text-[var(--admin-text-secondary)] hover:text-[var(--admin-text-primary)] hover:bg-[var(--admin-surface-soft)] transition-all duration-300 cursor-pointer',
                expanded && 'rotate-180 text-[var(--gb-green-600)] bg-[var(--gb-green-600)]/10'
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
            className="mt-6 pt-6 border-t border-[var(--admin-border-strong)]/50 space-y-6 animate-in slide-in-from-top-2 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2 space-y-5">
                <div className="space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-widest text-[var(--admin-text-secondary)]">
                    Contact Information
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="p-3 rounded-xl bg-[var(--admin-surface-card)]/60 border border-[var(--admin-border)]">
                      <p className="text-[10px] text-[var(--admin-text-tertiary)] uppercase font-semibold mb-0.5">Email</p>
                      <a
                        href={`mailto:${app.email}`}
                        className="text-sm text-[var(--gb-green-400)] font-semibold hover:underline break-all"
                      >
                        {app.email}
                      </a>
                    </div>
                    <div className="p-3 rounded-xl bg-[var(--admin-surface-card)]/60 border border-[var(--admin-border)]">
                      <p className="text-[10px] text-[var(--admin-text-tertiary)] uppercase font-semibold mb-0.5">Phone</p>
                      <p className="text-sm text-white font-semibold">{app.phone}</p>
                    </div>
                    {app.portfolio && (
                      <div className="p-3 rounded-xl bg-[var(--admin-surface-card)]/60 border border-[var(--admin-border)] sm:col-span-2">
                        <p className="text-[10px] text-[var(--admin-text-tertiary)] uppercase font-semibold mb-0.5">Portfolio / Website</p>
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
                    <h4 className="text-xs font-bold uppercase tracking-widest text-[var(--admin-text-secondary)]">
                      Skills & Expertise
                    </h4>
                    <div className="flex flex-wrap gap-1.5">
                      {app.skills.map((skill) => (
                        <span
                          key={skill}
                          className="px-2.5 py-1 rounded-lg text-[10px] font-semibold bg-[var(--gb-navy-800)]/40 text-[var(--admin-text-primary)] border border-[var(--gb-navy-800)]/60"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {app.message && (
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold uppercase tracking-widest text-[var(--admin-text-secondary)]">
                      {app.type === 'talent' ? 'Motivation / Cover Letter' : 'Message / Details'}
                    </h4>
                    <div className="p-4 rounded-xl bg-[var(--admin-surface-card)]/60 border border-[var(--admin-border)]">
                      <p className="text-sm text-[var(--admin-text-primary)] leading-relaxed whitespace-pre-wrap">
                        {app.message}
                      </p>
                    </div>
                  </div>
                )}

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold uppercase tracking-widest text-[var(--admin-text-secondary)]">
                      Notes & Comments
                    </h4>
                    <span className="text-[10px] text-[var(--admin-text-tertiary)] font-semibold">
                      {app.notes.length} note{app.notes.length !== 1 ? 's' : ''}
                    </span>
                  </div>
                  <div className="space-y-2">
                    {canEdit && (
                      <div className="p-3 rounded-xl bg-[var(--gb-navy-800)]/20 border border-[var(--gb-navy-800)]/40 space-y-2">
                        <Textarea
                          placeholder="Add an internal note about this application..."
                          value={noteText}
                          onChange={(e) => setNoteText(e.target.value)}
                          className="min-h-[80px] bg-[var(--admin-surface-card)]/80"
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
                      <div className="p-6 rounded-xl bg-[var(--admin-surface-card)]/40 border border-[var(--admin-border)] text-center">
                        <p className="text-xs text-[var(--admin-text-tertiary)]">No notes yet.</p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {[...app.notes].reverse().map((note) => (
                          <div
                            key={note.id}
                            className="p-3 rounded-xl bg-[var(--admin-surface-card)]/60 border border-[var(--admin-border)] space-y-1.5"
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[var(--gb-navy-800)] to-[var(--gb-green-600)] flex items-center justify-center text-[9px] font-bold text-white">
                                  {note.authorName.charAt(0)}
                                </div>
                                <span className="text-xs font-bold text-white">{note.authorName}</span>
                              </div>
                              <span className="text-[10px] text-[var(--admin-text-tertiary)] font-semibold">
                                {new Date(note.createdAt).toLocaleDateString('en-US', {
                                  month: 'short',
                                  day: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                              </span>
                            </div>
                            <p className="text-xs text-[var(--admin-text-secondary)] leading-relaxed pl-8">
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
                  <h4 className="text-xs font-bold uppercase tracking-widest text-[var(--admin-text-secondary)]">
                    Assigned To
                  </h4>
                  {canEdit ? (
                    <select
                      value={app.assignee || 'Unassigned'}
                      onChange={(e) =>
                        onAssigneeChange(e.target.value === 'Unassigned' ? '' : e.target.value)
                      }
                      className="w-full rounded-xl bg-[var(--admin-surface-card)]/60 border border-[var(--admin-border-strong)] text-white text-xs font-semibold px-3 py-2.5 focus:outline-none focus:border-[var(--gb-green-600)] focus:ring-1 focus:ring-[var(--gb-green-600)]"
                    >
                      {ASSIGNEES.map((a) => (
                        <option key={a} value={a}>
                          {a}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <div className="p-3 rounded-xl bg-[var(--admin-surface-card)]/60 border border-[var(--admin-border)]">
                      <p className="text-sm text-white font-semibold">{app.assignee || 'Unassigned'}</p>
                    </div>
                  )}
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold uppercase tracking-widest text-[var(--admin-text-secondary)]">
                      History Timeline
                    </h4>
                    <span className="text-[10px] text-[var(--admin-text-tertiary)] font-semibold">
                      {app.history.length} event{app.history.length !== 1 ? 's' : ''}
                    </span>
                  </div>
                  <div className="relative pl-5 space-y-0">
                    <div className="absolute left-1.5 top-1.5 bottom-1.5 w-px bg-gradient-to-b from-[var(--gb-green-600)]/60 via-[var(--gb-navy-800)] to-transparent" />
                    {[...app.history].reverse().map((h, idx, arr) => (
                      <div key={h.id} className="relative pb-4 last:pb-0">
                        <div
                          className={cn(
                            'absolute -left-[17px] top-1 w-3 h-3 rounded-full border-2 border-[var(--admin-surface-deep)]',
                            idx === 0
                              ? 'bg-[var(--gb-green-600)] shadow-[0_0_0_3px_rgba(22,163,106,0.2)]'
                              : 'bg-[var(--gb-navy-800)]'
                          )}
                        />
                        <div className="space-y-0.5">
                          <p className="text-xs font-bold text-white leading-tight">
                            {h.action}
                          </p>
                          {h.oldStatus && h.newStatus && (
                            <p className="text-[11px] text-[var(--admin-text-secondary)] font-medium">
                              <span className={cn(
                                'px-1.5 py-0.5 rounded text-[9px] mr-1',
                                h.oldStatus === 'rejected'
                                  ? 'bg-rose-500/15 text-rose-300'
                                  : 'bg-[var(--admin-border-strong)]/50 text-[var(--admin-text-secondary)]'
                              )}>
                                {h.oldStatus}
                              </span>
                              <span className="text-[var(--admin-text-tertiary)] mx-0.5">→</span>
                              <span className={cn(
                                'px-1.5 py-0.5 rounded text-[9px] ml-1',
                                h.newStatus === 'approved'
                                  ? 'bg-[var(--gb-green-600)]/15 text-[var(--gb-green-300)]'
                                  : h.newStatus === 'rejected'
                                  ? 'bg-rose-500/15 text-rose-300'
                                  : h.newStatus === 'completed'
                                  ? 'bg-purple-500/15 text-purple-300'
                                  : 'bg-[var(--gb-navy-800)]/40 text-blue-300'
                              )}>
                                {h.newStatus}
                              </span>
                            </p>
                          )}
                          <p className="text-[10px] text-[var(--admin-text-tertiary)]">
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

