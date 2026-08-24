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
import { Application, ApplicationStatus } from '@/lib/types/admin';
import { cn } from '@/lib/utils';

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

const ASSIGNEES = [
  'Unassigned',
  'Sipho Ndlovu',
  'Naledi Mokoena',
  'Bongani Dlamini',
  'Ayanda Khumalo',
  'Zanele Ncube',
  'Mfundo Ntuli',
];

function mapStatusToInquiry(status: ApplicationStatus): 'new' | 'contacted' | 'closed' {
  if (status === 'submitted') return 'new';
  if (status === 'reviewing') return 'contacted';
  return 'closed';
}

function mapInquiryToAppStatus(inquiryStatus: 'new' | 'contacted' | 'closed'): ApplicationStatus {
  if (inquiryStatus === 'new') return 'submitted';
  if (inquiryStatus === 'contacted') return 'reviewing';
  return 'completed';
}

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
  onOpenDetail,
  canEdit,
}: {
  inquiry: Application;
  onMarkContacted: () => void;
  onClose: () => void;
  onOpenDetail: () => void;
  canEdit: boolean;
}) {
  const istatus = mapStatusToInquiry(inquiry.status);
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
  onAssign,
  canEdit,
}: {
  inquiry: Application;
  onOpenDetail: () => void;
  onMarkContacted: () => void;
  onClose: () => void;
  onAssign: (assignee: string) => void;
  canEdit: boolean;
}) {
  const istatus = mapStatusToInquiry(inquiry.status);
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
      variant="glass"
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
              <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">
                {submittedDate}
              </span>
              {inquiry.assignee && (
                <Badge variant="blue" className="text-[10px]">
                  👤 {inquiry.assignee}
                </Badge>
              )}
            </div>
            <h3 className="text-lg font-extrabold text-white leading-snug">
              {inquiry.subject || 'No subject provided'}
            </h3>
          </div>

          {canEdit && (
            <select
              value={inquiry.status}
              onChange={(e) => {
                const v = e.target.value as ApplicationStatus;
                if (v === 'submitted') onMarkContacted();
                else if (v === 'reviewing') onMarkContacted();
                else onClose();
              }}
              className="rounded-xl bg-slate-900/60 border border-slate-700 text-white text-xs font-semibold px-3 py-2 focus:outline-none focus:border-[#16A36A] focus:ring-1 focus:ring-[#16A36A] self-start whitespace-nowrap"
            >
              <option value="submitted">NEW</option>
              <option value="reviewing">CONTACTED</option>
              <option value="completed">CLOSED</option>
            </select>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="p-2.5 rounded-xl bg-slate-900/50 border border-slate-800">
            <p className="text-[10px] text-slate-500 uppercase font-semibold mb-0.5">Sender</p>
            <p className="text-sm font-bold text-white truncate">{inquiry.name}</p>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-900/50 border border-slate-800">
            <p className="text-[10px] text-slate-500 uppercase font-semibold mb-0.5">Email</p>
            <a
              href={`mailto:${inquiry.email}`}
              className="text-sm font-semibold text-emerald-400 hover:underline truncate block"
            >
              {inquiry.email}
            </a>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-900/50 border border-slate-800">
            <p className="text-[10px] text-slate-500 uppercase font-semibold mb-0.5">Phone</p>
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
            className="text-xs text-slate-300 leading-relaxed bg-slate-900/50 border border-slate-800 p-3 rounded-xl line-clamp-3"
            title={inquiry.message}
          >
            {inquiry.message}
          </p>
        )}

        {inquiry.notes.length > 0 && (
          <div className="flex items-center gap-2 text-[10px] text-slate-500 font-semibold">
            <span>📝</span>
            <span>{inquiry.notes.length} internal note{inquiry.notes.length !== 1 ? 's' : ''}</span>
          </div>
        )}

        <div className="pt-3 border-t border-slate-800/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <QuickActionsRow
            inquiry={inquiry}
            onMarkContacted={onMarkContacted}
            onClose={onClose}
            onOpenDetail={onOpenDetail}
            canEdit={canEdit}
          />
          {canEdit && (
            <select
              value={inquiry.assignee || 'Unassigned'}
              onChange={(e) => onAssign(e.target.value === 'Unassigned' ? '' : e.target.value)}
              className="rounded-lg bg-slate-900/60 border border-slate-800 text-[10px] font-bold uppercase tracking-wider text-slate-300 px-2.5 py-1.5 focus:outline-none focus:border-[#16A36A] self-start sm:self-auto"
            >
              {ASSIGNEES.map((a) => (
                <option key={a} value={a}>
                  {a === 'Unassigned' ? 'Assign to...' : a}
                </option>
              ))}
            </select>
          )}
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
  inquiry: Application | null;
  canEdit: boolean;
  onMarkContacted: () => void;
  onCloseInquiry: () => void;
  onAddNote: (content: string) => void;
  onSendReply: (message: string) => void;
  currentUserName: string;
  currentUserId: string;
}) {
  const [noteText, setNoteText] = useState('');
  const [replyText, setReplyText] = useState('');
  const [tab, setTab] = useState<'reply' | 'notes' | 'history'>('reply');
  const [loadingAction, setLoadingAction] = useState<string | null>(null);

  if (!inquiry) return null;

  const istatus = mapStatusToInquiry(inquiry.status);
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
        <div className="px-6 py-4 border-b border-slate-800 bg-gradient-to-r from-[#123B5D]/30 via-transparent to-[#16A36A]/10">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <Badge variant={typeBadgeMap[inquiryType]} className="text-[10px] uppercase">
              {inquiryType === 'partnership' ? 'PARTNERSHIP LEAD' : 'CLIENT INQUIRY'}
            </Badge>
            <Badge variant={inquiryStatusBadge[istatus]} className="text-[10px] font-bold uppercase">
              {istatus}
            </Badge>
            {inquiry.assignee && (
              <Badge variant="blue" className="text-[10px]">
                👤 Owned by {inquiry.assignee}
              </Badge>
            )}
            <span className="text-[10px] text-slate-500 font-semibold ml-auto">
              Received {new Date(inquiry.submittedAt).toLocaleString()}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3">
            <div>
              <p className="text-[10px] text-slate-500 uppercase font-bold mb-0.5">From</p>
              <p className="text-sm font-bold text-white">{inquiry.name}</p>
            </div>
            <div>
              <p className="text-[10px] text-slate-500 uppercase font-bold mb-0.5">Email</p>
              <a
                href={`mailto:${inquiry.email}`}
                className="text-sm text-emerald-400 font-semibold hover:underline"
              >
                {inquiry.email}
              </a>
            </div>
            <div>
              <p className="text-[10px] text-slate-500 uppercase font-bold mb-0.5">Phone</p>
              <a href={`tel:${inquiry.phone}`} className="text-sm text-white font-semibold">
                {inquiry.phone}
              </a>
            </div>
          </div>
        </div>

        <div className="px-6 py-4 border-b border-slate-800">
          <p className="text-[10px] text-slate-500 uppercase font-bold mb-2">Original Message</p>
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
            <p className="text-sm text-slate-200 leading-relaxed whitespace-pre-wrap">
              {inquiry.message || '(No message included with this submission.)'}
            </p>
          </div>
        </div>

        <div className="px-6 py-3 border-b border-slate-800 flex gap-2">
          {(['reply', 'notes', 'history'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={cn(
                'px-3 py-1.5 rounded-lg text-[11px] font-bold uppercase transition-all cursor-pointer tracking-wide',
                tab === t
                  ? 'bg-[#16A36A]/15 text-emerald-400 border border-[#16A36A]/40'
                  : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800/60'
              )}
            >
              {t}
              {t === 'notes' && (
                <span className="ml-1.5 px-1.5 rounded-full bg-slate-800 text-[9px]">
                  {inquiry.notes.length}
                </span>
              )}
              {t === 'history' && (
                <span className="ml-1.5 px-1.5 rounded-full bg-slate-800 text-[9px]">
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
                <p className="text-[10px] text-slate-500 uppercase font-bold">
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
                <div className="p-3 rounded-xl bg-[#123B5D]/20 border border-[#123B5D]/40 space-y-2">
                  <Textarea
                    placeholder="Add an internal note (not visible to sender)..."
                    value={noteText}
                    onChange={(e) => setNoteText(e.target.value)}
                    className="min-h-[80px] bg-slate-900/80"
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
                <div className="p-8 text-center rounded-xl bg-slate-900/40 border border-slate-800">
                  <p className="text-xs text-slate-500">No internal notes yet.</p>
                </div>
              ) : (
                [...inquiry.notes].reverse().map((note) => (
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
                        <Badge variant="outline" className="text-[9px]">
                          INTERNAL
                        </Badge>
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
                ))
              )}
            </div>
          )}

          {tab === 'history' && (
            <div className="relative pl-5 space-y-0">
              <div className="absolute left-1.5 top-1.5 bottom-1.5 w-px bg-gradient-to-b from-[#16A36A]/60 via-[#123B5D] to-transparent" />
              {[...inquiry.history].reverse().map((h, idx) => (
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
                    <p className="text-xs font-bold text-white leading-tight">{h.action}</p>
                    {h.oldStatus && h.newStatus && (
                      <p className="text-[11px] text-slate-400 font-medium">
                        <span className="px-1.5 py-0.5 rounded text-[9px] mr-1 bg-slate-700/50 text-slate-300">
                          {h.oldStatus}
                        </span>
                        <span className="text-slate-500 mx-0.5">→</span>
                        <span
                          className={cn(
                            'px-1.5 py-0.5 rounded text-[9px] ml-1',
                            h.newStatus === 'approved' || h.newStatus === 'completed'
                              ? 'bg-emerald-500/15 text-emerald-300'
                              : h.newStatus === 'rejected'
                              ? 'bg-rose-500/15 text-rose-300'
                              : 'bg-[#123B5D]/40 text-blue-300'
                          )}
                        >
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
          )}
        </div>

        <div className="px-6 py-4 border-t border-slate-800 bg-slate-900/40 flex flex-wrap justify-end gap-2">
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

export default function AdminInquiriesPage() {
  const { hasPermission, user } = useAdminAuth();
  const { applications, updateApplicationStatus, addApplicationNote } = useAdminData();
  const { success, info, error } = useToast();

  const [filterTab, setFilterTab] = useState<InquiryTab>('all');
  const [statusFilter, setStatusFilter] = useState<InquiryStatus>('all');
  const [search, setSearch] = useState('');
  const [detailInquiry, setDetailInquiry] = useState<Application | null>(null);

  const canEdit = hasPermission('applications', 'update');
  const canRead = hasPermission('applications', 'read');

  const inquiries = useMemo(() => {
    return applications.filter((a) => a.type === 'client' || a.type === 'partnership');
  }, [applications]);

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

      const istatus = mapStatusToInquiry(a.status);
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
      return applications.find((x) => x.id === id) || cur;
    });
  };

  const handleMarkContacted = (id: string) => {
    try {
      updateApplicationStatus(id, 'reviewing');
      success('Inquiry Updated', 'Status changed to CONTACTED.');
      refreshDetail(id);
    } catch (e) {
      error('Update Failed', 'Could not update inquiry status.');
    }
  };

  const handleCloseInquiry = (id: string) => {
    try {
      updateApplicationStatus(id, 'completed');
      success('Inquiry Closed', 'The inquiry has been marked as closed.');
      refreshDetail(id);
    } catch (e) {
      error('Close Failed', 'Could not close the inquiry.');
    }
  };

  const handleAddNote = (id: string, content: string) => {
    try {
      addApplicationNote(id, content, user?.id || 'admin-1', user?.name || 'Admin User');
      success('Note Added', 'Internal note saved.');
      refreshDetail(id);
    } catch (e) {
      error('Note Failed', 'Could not save the note.');
    }
  };

  const handleSendReply = (id: string, _message: string) => {
    try {
      updateApplicationStatus(id, 'reviewing');
      info('Reply Prepared', 'Reply has been copied. Send via your email client.');
      refreshDetail(id);
    } catch (e) {
      error('Reply Failed', 'Could not process the reply.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Badge variant="green" className="text-[9px] mb-1.5">
            INBOX · LEADS & MESSAGES
          </Badge>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
            Inquiries &amp; Leads Manager
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Review, respond to, and track client requests &amp; partnership opportunities.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => {
              setFilterTab('all');
              setStatusFilter('all');
              setSearch('');
            }}
          >
            Reset Filters
          </Button>
          {canEdit && (
            <Button variant="accent" size="sm">
              ⤓ Export Leads
            </Button>
          )}
        </div>
      </div>

      <Card variant="solid" className="p-4 sm:p-5 space-y-4">
        <div className="flex flex-wrap gap-2">
          {INQUIRY_TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setFilterTab(tab.key)}
              className={cn(
                'px-3.5 py-2 rounded-xl text-xs font-bold border transition-all duration-200 cursor-pointer flex items-center gap-2',
                filterTab === tab.key
                  ? 'bg-[#16A36A] border-[#16A36A] text-white shadow-lg shadow-[#16A36A]/20'
                  : 'bg-slate-900/60 border-slate-700 text-slate-400 hover:text-white hover:border-slate-600'
              )}
            >
              {tab.label}
              <span
                className={cn(
                  'px-1.5 py-0.5 rounded-full text-[9px] font-bold',
                  filterTab === tab.key
                    ? 'bg-white/20 text-white'
                    : 'bg-slate-800 text-slate-500'
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
          <span className="text-white">{inquiries.length}</span> inquiries
        </p>
        {filtered.length > 0 && canEdit && (
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="secondary"
              onClick={() => {
                filtered
                  .filter((i) => mapStatusToInquiry(i.status) === 'new')
                  .forEach((i) => handleMarkContacted(i.id));
              }}
            >
              ✓ Mark All New as Contacted
            </Button>
          </div>
        )}
      </div>

      {!canRead ? (
        <Card variant="glass" className="p-10 text-center">
          <div className="text-4xl mb-3">🔒</div>
          <h3 className="text-lg font-bold text-white mb-1">Access Restricted</h3>
          <p className="text-xs text-slate-400">
            You do not have permission to view inquiries.
          </p>
        </Card>
      ) : filtered.length === 0 ? (
        <Card variant="glass" className="p-12 text-center">
          <div className="text-5xl mb-4">📭</div>
          <h3 className="text-lg font-bold text-white mb-1">Inbox Zero</h3>
          <p className="text-xs text-slate-400">
            No inquiries match your current filters.
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filtered.map((inq) => (
            <InquiryCard
              key={inq.id}
              inquiry={inq}
              onOpenDetail={() =>
                setDetailInquiry(applications.find((a) => a.id === inq.id) || inq)
              }
              onMarkContacted={() => handleMarkContacted(inq.id)}
              onClose={() => handleCloseInquiry(inq.id)}
              onAssign={() => {}}
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
        currentUserName={user?.name || 'Admin User'}
        currentUserId={user?.id || 'admin-1'}
      />
    </div>
  );
}
