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
import { AdminEmptyState } from '@/components/admin/AdminEmptyState';
import { AdminPageHeader, AdminToolbar } from '@/components/admin/AdminPageHeader';
import type { Inquiry } from '@/lib/types/inquiry';
import { adminFetch } from '@/lib/api/admin-client';

type InquiryTab = 'all' | 'general' | 'partnership';
type InquiryStatus = 'all' | 'new' | 'contacted' | 'closed';

const INQUIRY_TABS: { key: InquiryTab; label: string }[] = [
  { key: 'all', label: 'All Inquiries' },
  { key: 'general', label: 'General / Client' },
  { key: 'partnership', label: 'Partnerships' },
];

const INQUIRY_STATUS_OPTIONS: { key: InquiryStatus; label: string }[] = [
  { key: 'all', label: 'All Status' },
  { key: 'new', label: 'New' },
  { key: 'contacted', label: 'Contacted' },
  { key: 'closed', label: 'Closed' },
];


const inquiryStatusBadge: Record<'new' | 'contacted' | 'closed', 'green' | 'blue' | 'outline' | 'orange' | 'purple'> = {
  new: 'green',
  contacted: 'blue',
  closed: 'outline',
};

const typeBadgeMap: Record<'general' | 'partnership', 'blue' | 'orange'> = {
  general: 'blue',
  partnership: 'orange',
};

function QuickActionsRow({
  inquiry,
  onMarkContacted,
  onClose,
  onStatusChange,
  onOpenDetail,
  canEdit,
}: {
  inquiry: Inquiry;
  onMarkContacted: () => void;
  onClose: () => void;
  onStatusChange: (status: Inquiry['status']) => void;
  onOpenDetail: () => void;
  canEdit: boolean;
}) {
  const istatus = inquiry.status;
  return (
    <div className="flex flex-wrap gap-2">
      {istatus === 'new' && canEdit && (
        <Button size="sm" variant="secondary" onClick={onMarkContacted}>
          ✓ Mark Contacted
        </Button>
      )}
      {istatus !== 'closed' && canEdit && (
        <Button size="sm" variant="accent" onClick={onClose}>
          ✕ Close Inquiry
        </Button>
      )}
      <Button size="sm" variant="outline" onClick={onOpenDetail}>
        View Full Inquiry
      </Button>
    </div>
  );
}

function InquiryCard({
  inquiry,
  onOpenDetail,
  onMarkContacted,
  onClose,
  canEdit,
}: {
  inquiry: Inquiry;
  onOpenDetail: () => void;
  onMarkContacted: () => void;
  onClose: () => void;
  canEdit: boolean;
}) {
  const istatus = inquiry.status;
  const inquiryType: 'general' | 'partnership' =
    inquiry.type === 'partnership' ? 'partnership' : 'general';

  const submittedDate = new Date(inquiry.submittedAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <Card
      variant="admin"
      className="hover:-translate-y-0.5 transition-all duration-300"
    >
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant={typeBadgeMap[inquiryType]} className="text-[10px] uppercase">
                {inquiryType === 'partnership' ? 'PARTNERSHIP' : 'CLIENT / GENERAL'}
              </Badge>
              <Badge variant={inquiryStatusBadge[istatus]} className="text-[10px] font-bold uppercase">
                {istatus}
              </Badge>
              <span className="text-[10px] text-[var(--admin-text-tertiary)] font-semibold uppercase tracking-wider">
                {submittedDate}
              </span>
              {inquiry.assignee && (
                <Badge variant="blue" className="text-[10px]">
                  {inquiry.assignee}
                </Badge>
              )}
            </div>
            <h3 className="text-lg font-extrabold text-white leading-snug">
              {inquiry.subject || 'No subject provided'}
            </h3>
          </div>

          {canEdit && (
            <select
              value={inquiry.status === 'new' ? 'submitted' : inquiry.status === 'contacted' ? 'reviewing' : 'completed'}
              onChange={(e) => {
                const v = e.target.value;
                if (v === 'submitted') onStatusChange('new');
                else if (v === 'reviewing') onStatusChange('contacted');
                else onStatusChange('closed');
              }}
              className="rounded-xl bg-[var(--admin-surface-card)]/60 border border-[var(--admin-border-strong)] text-[var(--admin-text-primary)] text-xs font-semibold px-3 py-2 focus:outline-none focus:border-[var(--gb-green-600)] focus:ring-1 focus:ring-[var(--gb-green-600)] self-start whitespace-nowrap"
            >
              <option value="submitted">NEW</option>
              <option value="reviewing">CONTACTED</option>
              <option value="completed">CLOSED</option>
            </select>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="p-2.5 rounded-xl bg-[var(--admin-surface-card)]/50 border border-[var(--admin-border)]">
            <p className="text-[10px] text-[var(--admin-text-tertiary)] uppercase font-semibold mb-0.5">Sender</p>
            <p className="text-sm font-bold text-white truncate">{inquiry.name}</p>
          </div>
          <div className="p-2.5 rounded-xl bg-[var(--admin-surface-card)]/50 border border-[var(--admin-border)]">
            <p className="text-[10px] text-[var(--admin-text-tertiary)] uppercase font-semibold mb-0.5">Email</p>
            <a
              href={`mailto:${inquiry.email}`}
              className="text-sm font-semibold text-[var(--gb-green-400)] hover:underline truncate block"
            >
              {inquiry.email}
            </a>
          </div>
          <div className="p-2.5 rounded-xl bg-[var(--admin-surface-card)]/50 border border-[var(--admin-border)]">
            <p className="text-[10px] text-[var(--admin-text-tertiary)] uppercase font-semibold mb-0.5">Phone</p>
            <a
              href={`tel:${inquiry.phone}`}
              className="text-sm font-semibold text-white truncate block"
            >
              {inquiry.phone}
            </a>
          </div>
        </div>

        {inquiry.message && (
          <p
            className="text-xs text-[var(--admin-text-secondary)] leading-relaxed bg-[var(--admin-surface-card)]/50 border border-[var(--admin-border)] p-3 rounded-xl line-clamp-3"
            title={inquiry.message}
          >
            {inquiry.message}
          </p>
        )}

        {inquiry.notes.length > 0 && (
          <div className="flex items-center gap-2 text-[10px] text-[var(--admin-text-tertiary)] font-semibold">
            <span aria-hidden="true" className="text-[var(--admin-accent)]">●</span>
            <span>{inquiry.notes.length} internal note{inquiry.notes.length !== 1 ? 's' : ''}</span>
          </div>
        )}

        <div className="pt-3 border-t border-[var(--admin-border)]/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <QuickActionsRow
            inquiry={inquiry}
            onMarkContacted={onMarkContacted}
            onClose={onClose}
            onOpenDetail={onOpenDetail}
            canEdit={canEdit}
          />
        </div>
      </div>
    </Card>
  );
}

function InquiryDetailModal({
  open,
  onClose,
  inquiry,
  canEdit,
  onMarkContacted,
  onCloseInquiry,
  onAddNote,
  onSendReply,
  currentUserName,
  currentUserId,
}: {
  open: boolean;
  onClose: () => void;
  inquiry: Inquiry | null;
  canEdit: boolean;
  onMarkContacted: () => void;
  onCloseInquiry: () => void;
  onAddNote: (content: string) => void;
  onSendReply: (message: string) => void;
}) {
  const [noteText, setNoteText] = useState('');
  const [replyText, setReplyText] = useState('');
  const [tab, setTab] = useState<'reply' | 'notes' | 'history'>('reply');
  const [loadingAction, setLoadingAction] = useState<string | null>(null);

  if (!inquiry) return null;

  const istatus = inquiry.status;
  const inquiryType: 'general' | 'partnership' =
    inquiry.type === 'partnership' ? 'partnership' : 'general';

  const doAction = async (label: string, fn: () => void) => {
    setLoadingAction(label);
    await new Promise((r) => setTimeout(r, 250));
    fn();
    setLoadingAction(null);
  };

  const submitNote = () => {
    if (!noteText.trim()) return;
    doAction('note', () => {
      onAddNote(noteText.trim());
      setNoteText('');
    });
  };

  const submitReply = () => {
    if (!replyText.trim()) return;
    doAction('reply', () => {
      onSendReply(replyText.trim());
      setReplyText('');
    });
  };

  return (
    <Modal
      isOpen={open}
      onClose={onClose}
      title={inquiry.subject || 'Inquiry Details'}
      className="!max-w-3xl !p-0 overflow-hidden"
    >
      <div className="max-h-[75vh] flex flex-col">
        <div className="px-6 py-4 border-b border-[var(--admin-border)] bg-gradient-to-r from-[var(--gb-navy-800)]/30 via-transparent to-[var(--gb-green-600)]/10">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <Badge variant={typeBadgeMap[inquiryType]} className="text-[10px] uppercase">
              {inquiryType === 'partnership' ? 'PARTNERSHIP LEAD' : 'CLIENT INQUIRY'}
            </Badge>
            <Badge variant={inquiryStatusBadge[istatus]} className="text-[10px] font-bold uppercase">
              {istatus}
            </Badge>
            {inquiry.assignee && (
              <Badge variant="blue" className="text-[10px]">
                Owned by {inquiry.assignee}
              </Badge>
            )}
            <span className="text-[10px] text-[var(--admin-text-tertiary)] font-semibold ml-auto">
              Received {new Date(inquiry.submittedAt).toLocaleString()}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3">
            <div>
              <p className="text-[10px] text-[var(--admin-text-tertiary)] uppercase font-bold mb-0.5">From</p>
              <p className="text-sm font-bold text-white">{inquiry.name}</p>
            </div>
            <div>
              <p className="text-[10px] text-[var(--admin-text-tertiary)] uppercase font-bold mb-0.5">Email</p>
              <a
                href={`mailto:${inquiry.email}`}
                className="text-sm text-[var(--gb-green-400)] font-semibold hover:underline"
              >
                {inquiry.email}
              </a>
            </div>
            <div>
              <p className="text-[10px] text-[var(--admin-text-tertiary)] uppercase font-bold mb-0.5">Phone</p>
              <a href={`tel:${inquiry.phone}`} className="text-sm text-white font-semibold">
                {inquiry.phone}
              </a>
            </div>
          </div>
        </div>

        <div className="px-6 py-4 border-b border-[var(--admin-border)]">
          <p className="text-[10px] text-[var(--admin-text-tertiary)] uppercase font-bold mb-2">Original Message</p>
          <div className="p-4 rounded-xl bg-[var(--admin-surface-card)]/60 border border-[var(--admin-border)]">
            <p className="text-sm text-[var(--admin-text-primary)] leading-relaxed whitespace-pre-wrap">
              {inquiry.message || '(No message included with this submission.)'}
            </p>
          </div>
        </div>

        <div className="px-6 py-3 border-b border-[var(--admin-border)] flex gap-2">
          {(['reply', 'notes', 'history'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={cn(
                'px-3 py-1.5 rounded-lg text-[11px] font-bold uppercase transition-all cursor-pointer tracking-wide',
                tab === t
                  ? 'bg-[var(--gb-green-600)]/15 text-[var(--gb-green-400)] border border-[var(--gb-green-600)]/40'
                  : 'text-[var(--admin-text-tertiary)] hover:text-[var(--admin-text-secondary)] hover:bg-[var(--admin-surface-soft)]/60'
              )}
            >
              {t}
              {t === 'notes' && (
                <span className="ml-1.5 px-1.5 rounded-full bg-[var(--admin-surface-soft)] text-[9px]">
                  {inquiry.notes.length}
                </span>
              )}
              {t === 'history' && (
                <span className="ml-1.5 px-1.5 rounded-full bg-[var(--admin-surface-soft)] text-[9px]">
                  {inquiry.history.length}
                </span>
              )}
            </button>
          ))}
        </div>

        <div className="px-6 py-4 flex-1 overflow-y-auto space-y-4">
          {tab === 'reply' && (
            <div className="space-y-4">
              <div className="space-y-2">
                <p className="text-[10px] text-[var(--admin-text-tertiary)] uppercase font-bold">
                  Compose Reply
                </p>
                <Textarea
                  placeholder={`Write a reply to ${inquiry.name}...`}
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  className="min-h-[160px]"
                />
                <div className="flex flex-wrap justify-end gap-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      setReplyText(
                        `Hi ${inquiry.name.split(' ')[0]},\n\nThank you for reaching out to Growthbridge regarding "${inquiry.subject || 'your inquiry'}". We've received your message and a member of our team will be in touch with you shortly.\n\nBest regards,\nThe Growthbridge Team`
                      );
                    }}
                  >
                    Use Template
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      if (!replyText.trim()) return;
                      navigator.clipboard?.writeText(replyText);
                    }}
                  >
                    Copy
                  </Button>
                  <Button
                    size="sm"
                    variant="primary"
                    isLoading={loadingAction === 'reply'}
                    disabled={!replyText.trim() || !canEdit}
                    onClick={submitReply}
                  >
                    Send & Mark Contacted
                  </Button>
                </div>
              </div>
            </div>
          )}

          {tab === 'notes' && (
            <div className="space-y-3">
              {canEdit && (
                <div className="p-3 rounded-xl bg-[var(--gb-navy-800)]/20 border border-[var(--gb-navy-800)]/40 space-y-2">
                  <Textarea
                    placeholder="Add an internal note (not visible to sender)..."
                    value={noteText}
                    onChange={(e) => setNoteText(e.target.value)}
                    className="min-h-[80px] bg-[var(--admin-surface-card)]/80"
                  />
                  <div className="flex justify-end">
                    <Button
                      size="sm"
                      variant="primary"
                      onClick={submitNote}
                      isLoading={loadingAction === 'note'}
                      disabled={!noteText.trim()}
                    >
                      + Add Note
                    </Button>
                  </div>
                </div>
              )}
              {inquiry.notes.length === 0 ? (
                <div className="p-8 text-center rounded-xl bg-[var(--admin-surface-card)]/40 border border-[var(--admin-border)]">
                  <p className="text-xs text-[var(--admin-text-tertiary)]">No internal notes yet.</p>
                </div>
              ) : (
                [...inquiry.notes].reverse().map((note) => (
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
                        <Badge variant="outline" className="text-[9px]">
                          INTERNAL
                        </Badge>
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
                ))
              )}
            </div>
          )}

          {tab === 'history' && (
            <div className="relative pl-5 space-y-0">
              <div className="absolute left-1.5 top-1.5 bottom-1.5 w-px bg-gradient-to-b from-[var(--gb-green-600)]/60 via-[var(--gb-navy-800)] to-transparent" />
              {[...inquiry.history].reverse().map((h, idx) => (
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
                    <p className="text-xs font-bold text-white leading-tight">{h.action}</p>
                    {h.oldStatus && h.newStatus && (
                      <p className="text-[11px] text-[var(--admin-text-secondary)] font-medium">
                        <span className="px-1.5 py-0.5 rounded text-[9px] mr-1 bg-[var(--admin-border-strong)]/50 text-[var(--admin-text-secondary)]">
                          {h.oldStatus}
                        </span>
                        <span className="text-[var(--admin-text-tertiary)] mx-0.5">→</span>
                        <span
                          className={cn(
                            'px-1.5 py-0.5 rounded text-[9px] ml-1',
                            h.newStatus === 'approved' || h.newStatus === 'completed'
                              ? 'bg-[var(--gb-green-600)]/15 text-[var(--gb-green-300)]'
                              : h.newStatus === 'rejected'
                              ? 'bg-rose-500/15 text-rose-300'
                              : 'bg-[var(--gb-navy-800)]/40 text-blue-300'
                          )}
                        >
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
          )}
        </div>

        <div className="px-6 py-4 border-t border-[var(--admin-border)] bg-[var(--admin-surface-card)]/40 flex flex-wrap justify-end gap-2">
          {istatus === 'new' && canEdit && (
            <Button
              size="sm"
              variant="secondary"
              onClick={() => doAction('contacted', onMarkContacted)}
              isLoading={loadingAction === 'contacted'}
            >
              ✓ Mark as Contacted
            </Button>
          )}
          {istatus !== 'closed' && canEdit && (
            <Button
              size="sm"
              variant="accent"
              onClick={() => doAction('close', onCloseInquiry)}
              isLoading={loadingAction === 'close'}
            >
              ✕ Close Inquiry
            </Button>
          )}
          <Button size="sm" variant="ghost" onClick={onClose}>
            Close Panel
          </Button>
        </div>
      </div>
    </Modal>
  );
}

function exportInquiries(items: Inquiry[]) {
  const headers = ['Name', 'Email', 'Phone', 'Type', 'Status', 'Subject', 'Submitted At'];
  const escape = (value: string) => `"${value.replace(/"/g, '""')}"`;
  const rows = items.map((item) => [item.name, item.email, item.phone, item.type, item.status, item.subject || '', item.submittedAt].map(escape).join(','));
  const blob = new Blob([[headers.map(escape).join(','), ...rows].join('\n')], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `growthbridge-inquiries-${new Date().toISOString().slice(0, 10)}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

export default function AdminInquiriesPage() {
  const { hasPermission, user } = useAdminAuth();
  const { addApplicationNote } = useAdminData();
  const { success, info, error } = useToast();
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [loadingInquiries, setLoadingInquiries] = useState(true);

  const loadInquiries = React.useCallback(async () => {
    setLoadingInquiries(true);
    try { setInquiries(await adminFetch<Inquiry[]>('/api/admin/inquiries')); }
    catch (e) { error('Inbox unavailable', 'Could not load contact and partnership inquiries.'); }
    finally { setLoadingInquiries(false); }
  }, [error]);
  React.useEffect(() => { void loadInquiries(); }, [loadInquiries]);

  const [filterTab, setFilterTab] = useState<InquiryTab>('all');
  const [statusFilter, setStatusFilter] = useState<InquiryStatus>('all');
  const [search, setSearch] = useState('');
  const [detailInquiry, setDetailInquiry] = useState<Inquiry | null>(null);

  const canEdit = hasPermission('applications', 'update');
  const canRead = hasPermission('applications', 'read');


  const counts = useMemo(() => {
    const base = {
      all: inquiries.length,
      general: 0,
      partnership: 0,
    };
    inquiries.forEach((a) => {
      if (a.type === 'partnership') base.partnership++;
      else base.general++;
    });
    return base;
  }, [inquiries]);

  const filtered = useMemo(() => {
    return inquiries.filter((a) => {
      const itype: 'general' | 'partnership' =
        a.type === 'partnership' ? 'partnership' : 'general';
      if (filterTab !== 'all' && itype !== filterTab) return false;

      const istatus = a.status;
      if (statusFilter !== 'all' && istatus !== statusFilter) return false;

      if (search) {
        const q = search.toLowerCase();
        const haystack = [
          a.name,
          a.email,
          a.phone,
          a.subject || '',
          a.message || '',
        ]
          .join(' ')
          .toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });
  }, [inquiries, filterTab, statusFilter, search]);

  const refreshDetail = (id: string) => {
    setDetailInquiry((cur) => {
      if (!cur || cur.id !== id) return cur;
      return inquiries.find((x) => x.id === id) || cur;
    });
  };

  const updateInquiryStatus = async (id: string, next: Inquiry['status']) => {
    const current = inquiries.find((i) => i.id === id);
    if (!current) return;
    try {
      await adminFetch('/api/admin/inquiries', { method:'PATCH', body: JSON.stringify({ id, source: current.source, status: next }) });
      setInquiries((items) => items.map((i) => i.id === id ? { ...i, status: next } : i));
      success('Inquiry Updated', next === 'closed' ? 'The inquiry has been closed.' : next === 'new' ? 'The inquiry is back in NEW.' : 'Status changed to CONTACTED.');
      refreshDetail(id);
    } catch { error('Update Failed', 'Could not update inquiry status.'); }
  };
  const handleMarkContacted = (id: string) => { void updateInquiryStatus(id, 'contacted'); };
  const handleStatusChange = (id: string, status: Inquiry['status']) => { void updateInquiryStatus(id, status); };
  const handleCloseInquiry = (id: string) => { void updateInquiryStatus(id, 'closed'); };

  const handleAddNote = (id: string, content: string) => {
    try {
      const inquiry = inquiries.find((item) => item.id === id);
      if (inquiry?.source !== 'application') { info('Notes unavailable', 'Internal notes are currently supported for application records only.'); return; }
      addApplicationNote(id, content, user?.id || 'admin-1', user?.name || 'Admin User');
      success('Note Added', 'Internal note saved.');
      refreshDetail(id);
    } catch (e) {
      error('Note Failed', 'Could not save the note.');
    }
  };

  const handleSendReply = (id: string, _message: string) => {
    try {
      void updateInquiryStatus(id, 'contacted');
      info('Reply Prepared', 'Reply has been prepared. Send via your email client.');
      refreshDetail(id);
    } catch (e) {
      error('Reply Failed', 'Could not process the reply.');
    }
  };

  return (
    <div className="admin-page space-y-6">
      <AdminPageHeader
        eyebrow="Operations / Inbox"
        title="Inquiries & Leads"
        description="Review, respond to, and track client requests and partnership opportunities."
        actions={
          <div className="flex flex-wrap gap-2">
            <Button variant="secondary" size="sm" onClick={() => { setFilterTab('all'); setStatusFilter('all'); setSearch(''); }}>
              Reset Filters
            </Button>
            {canEdit && (
              <Button variant="accent" size="sm" onClick={() => exportInquiries(filtered)}>
                Export CSV
              </Button>
            )}
          </div>
        }
      />

      <Card variant="solid" className="p-4 sm:p-5 space-y-4">
        <div className="flex flex-wrap gap-2">
          {INQUIRY_TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setFilterTab(tab.key)}
              className={cn(
                'px-3.5 py-2 rounded-xl text-xs font-bold border transition-all duration-200 cursor-pointer flex items-center gap-2',
                filterTab === tab.key
                  ? 'bg-[var(--gb-green-600)] border-[var(--gb-green-600)] text-white shadow-lg shadow-[var(--gb-green-600)]/20'
                  : 'bg-[var(--admin-surface-card)]/60 border-[var(--admin-border-strong)] text-[var(--admin-text-secondary)] hover:text-[var(--admin-text-primary)] hover:border-[var(--admin-border-strong)]'
              )}
            >
              {tab.label}
              <span
                className={cn(
                  'px-1.5 py-0.5 rounded-full text-[9px] font-bold',
                  filterTab === tab.key
                    ? 'bg-white/20 text-white'
                    : 'bg-[var(--admin-surface-soft)] text-[var(--admin-text-tertiary)]'
                )}
              >
                {counts[tab.key]}
              </span>
            </button>
          ))}
        </div>

        <div className="flex flex-col md:flex-row md:items-center gap-4">
          <div className="flex-1 max-w-md">
            <Input
              placeholder="Search sender, email, subject, message..."
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
            {INQUIRY_STATUS_OPTIONS.map((sf) => (
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
      </Card>

      <div className="flex items-center justify-between">
        <p className="text-xs text-[var(--admin-text-secondary)] font-semibold">
          Showing <span className="text-white">{filtered.length}</span> of{' '}
          <span className="text-white">{inquiries.length}</span> inquiries
        </p>
        {filtered.length > 0 && canEdit && (
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="secondary"
              onClick={() => {
                filtered
                  .filter((i) => i.status === 'new')
                  .forEach((i) => handleMarkContacted(i.id));
              }}
            >
              ✓ Mark All New as Contacted
            </Button>
          </div>
        )}
      </div>

      {!canRead ? (
        <AdminEmptyState
          icon="lock"
          title="Access restricted"
          description="Your current role does not have permission to view inquiries."
        />
      ) : filtered.length === 0 ? (
        <AdminEmptyState
          icon={search ? 'search' : 'inbox'}
          title={search ? 'No matching inquiries' : 'Inbox zero'}
          description={search ? 'Try a broader search or clear one of the active filters.' : 'New client and partnership messages will appear here when they arrive.'}
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filtered.map((inq) => (
            <InquiryCard
              key={inq.id}
              inquiry={inq}
              onOpenDetail={() =>
                setDetailInquiry(inq)
              }
              onMarkContacted={() => handleMarkContacted(inq.id)}
              onClose={() => handleCloseInquiry(inq.id)}
              onStatusChange={(status) => handleStatusChange(inq.id, status)}
              canEdit={canEdit}
            />
          ))}
        </div>
      )}

      <InquiryDetailModal
        open={detailInquiry !== null}
        onClose={() => setDetailInquiry(null)}
        inquiry={detailInquiry}
        canEdit={canEdit}
        onMarkContacted={() => detailInquiry && handleMarkContacted(detailInquiry.id)}
        onCloseInquiry={() => detailInquiry && handleCloseInquiry(detailInquiry.id)}
        onAddNote={(content) => detailInquiry && handleAddNote(detailInquiry.id, content)}
        onSendReply={(message) => detailInquiry && handleSendReply(detailInquiry.id, message)}
      />
    </div>
  );
}
