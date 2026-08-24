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
import type { Partner } from '@/lib/types/admin';

type StatusFilter = 'all' | Partner['status'];

const statusBadge: Record<string, { variant: 'green' | 'blue' | 'orange' | 'outline'; label: string }> = {
  active: { variant: 'green', label: 'ACTIVE' },
  prospect: { variant: 'blue', label: 'PROSPECT' },
  inactive: { variant: 'orange', label: 'INACTIVE' },
  terminated: { variant: 'outline', label: 'TERMINATED' },
};

const partnershipTypeLabels: Record<string, string> = {
  sponsor: 'Sponsor',
  client: 'Client',
  collaborator: 'Collaborator',
  vendor: 'Vendor',
};

export default function AdminPartnersPage() {
  const { hasPermission } = useAdminAuth();
  const { partners, upsertPartner, deletePartner } = useAdminData();
  const { success, error } = useToast();

  const canRead = hasPermission('partners', 'read');
  const canCreate = hasPermission('partners', 'create');
  const canUpdate = hasPermission('partners', 'update');
  const canDelete = hasPermission('partners', 'delete');

  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [industryFilter, setIndustryFilter] = useState<string>('all');
  const [search, setSearch] = useState('');

  const [modalOpen, setModalOpen] = useState(false);
  const [editingPartner, setEditingPartner] = useState<Partner | null>(null);

  const [formOrgName, setFormOrgName] = useState('');
  const [formContactPerson, setFormContactPerson] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formWebsite, setFormWebsite] = useState('');
  const [formIndustry, setFormIndustry] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formStatus, setFormStatus] = useState<Partner['status']>('prospect');
  const [formType, setFormType] = useState<Partner['partnershipType']>('collaborator');
  const [formStartDate, setFormStartDate] = useState('');
  const [formEndDate, setFormEndDate] = useState('');
  const [formAddress, setFormAddress] = useState('');
  const [formNotes, setFormNotes] = useState('');

  const industries = useMemo(() => {
    const set = new Set(partners.map((p) => p.industry).filter(Boolean));
    return Array.from(set) as string[];
  }, [partners]);

  const filteredPartners = useMemo(() => {
    return partners.filter((p) => {
      const matchesStatus = statusFilter === 'all' || p.status === statusFilter;
      const matchesIndustry = industryFilter === 'all' || p.industry === industryFilter;
      const s = search.toLowerCase();
      const matchesSearch =
        search === '' ||
        p.organizationName.toLowerCase().includes(s) ||
        p.contactPerson.toLowerCase().includes(s) ||
        p.email.toLowerCase().includes(s) ||
        p.industry.toLowerCase().includes(s);
      return matchesStatus && matchesIndustry && matchesSearch;
    });
  }, [partners, statusFilter, industryFilter, search]);

  const resetForm = () => {
    setFormOrgName('');
    setFormContactPerson('');
    setFormEmail('');
    setFormPhone('');
    setFormWebsite('');
    setFormIndustry('');
    setFormDescription('');
    setFormStatus('prospect');
    setFormType('collaborator');
    setFormStartDate('');
    setFormEndDate('');
    setFormAddress('');
    setFormNotes('');
  };

  const openCreateModal = () => {
    if (!canCreate) return;
    setEditingPartner(null);
    resetForm();
    setModalOpen(true);
  };

  const openEditModal = (p: Partner) => {
    if (!canUpdate) return;
    setEditingPartner(p);
    setFormOrgName(p.organizationName);
    setFormContactPerson(p.contactPerson);
    setFormEmail(p.email);
    setFormPhone(p.phone);
    setFormWebsite(p.website || '');
    setFormIndustry(p.industry);
    setFormDescription(p.description);
    setFormStatus(p.status);
    setFormType(p.partnershipType);
    setFormStartDate(p.partnershipStartDate || '');
    setFormEndDate(p.partnershipEndDate || '');
    setFormAddress(p.address || '');
    setFormNotes(p.notes || '');
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingPartner(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingPartner ? !canUpdate : !canCreate) return;

    const payload: Partial<Partner> & { id?: string } = {
      organizationName: formOrgName.trim(),
      contactPerson: formContactPerson.trim(),
      email: formEmail.trim(),
      phone: formPhone.trim(),
      website: formWebsite.trim() || undefined,
      industry: formIndustry.trim(),
      description: formDescription.trim(),
      status: formStatus,
      partnershipType: formType,
      partnershipStartDate: formStartDate || undefined,
      partnershipEndDate: formEndDate || undefined,
      address: formAddress.trim() || undefined,
      notes: formNotes.trim() || undefined,
    };

    if (editingPartner) {
      payload.id = editingPartner.id;
      upsertPartner(payload);
      success('Partner Updated', `${formOrgName} has been updated.`);
    } else {
      upsertPartner(payload);
      success('Partner Added', `${formOrgName} has been added to the partner directory.`);
    }
    closeModal();
  };

  const handleDelete = (p: Partner) => {
    if (!canDelete) {
      error('Permission Denied', 'You do not have permission to delete partners.');
      return;
    }
    deletePartner(p.id);
    success('Partner Removed', `${p.organizationName} has been deleted.`);
  };

  if (!canRead) {
    return (
      <div className="space-y-6">
        <div>
          <Badge variant="outline" className="text-[9px] mb-1">RESTRICTED</Badge>
          <h1 className="text-2xl font-extrabold text-[var(--text-primary)]">Partner Management</h1>
        </div>
        <Card variant="glass" className="p-8 text-center">
          <p className="text-[var(--text-secondary)]">You do not have permission to view partners.</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Badge variant="blue" className="text-[9px] mb-1">PARTNERS CMS</Badge>
          <h1 className="text-2xl font-extrabold text-[var(--text-primary)]">Partner Management</h1>
        </div>
        {canCreate && (
          <Button onClick={openCreateModal} variant="primary" size="sm">
            + Add New Partner
          </Button>
        )}
      </div>

      <div className="space-y-4">
        <div className="flex flex-wrap gap-3 items-center">
          <div className="flex gap-2 flex-wrap">
            {(['all', 'prospect', 'active', 'inactive', 'terminated'] as StatusFilter[]).map((f) => (
              <button
                key={f}
                onClick={() => setStatusFilter(f)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                  statusFilter === f
                    ? 'bg-[var(--gb-green-600)] border-[var(--gb-green-600)] text-white'
                    : 'bg-[var(--surface-subtle)] border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                }`}
              >
                {f.toUpperCase()}
              </button>
            ))}
          </div>
          <div className="w-full sm:w-48">
            <select
              value={industryFilter}
              onChange={(e) => setIndustryFilter(e.target.value)}
              className="w-full rounded-xl bg-[var(--form-bg)] border border-[var(--form-border)] text-[var(--form-text)] px-3 py-2 text-xs font-semibold focus:outline-none focus:border-[var(--form-border-focus)] cursor-pointer"
            >
              <option value="all">ALL INDUSTRIES</option>
              {industries.map((ind) => (
                <option key={ind} value={ind}>{ind.toUpperCase()}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="max-w-md">
          <Input
            placeholder="Search by organization, contact, email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredPartners.map((p) => {
          const sb = statusBadge[p.status] ?? statusBadge.prospect;
          return (
            <Card key={p.id} variant="glass" className="p-6 space-y-4">
              <div className="flex items-start justify-between gap-2 flex-wrap">
                <div className="space-y-1">
                  <h3 className="text-lg font-bold text-[var(--text-primary)]">{p.organizationName}</h3>
                  <p className="text-xs text-[var(--text-tertiary)]">
                    {partnershipTypeLabels[p.partnershipType] ?? 'Collaborator'} · {p.industry}
                  </p>
                </div>
                <Badge variant={sb.variant} className="text-[10px]">{sb.label}</Badge>
              </div>

              <div className="space-y-2 text-xs">
                <p className="text-[var(--text-secondary)]">
                  <span className="text-[var(--text-tertiary)]">Contact:</span>{' '}
                  <span className="text-[var(--text-primary)] font-semibold">{p.contactPerson}</span>
                </p>
                <p className="text-[var(--text-secondary)]">
                  <span className="text-[var(--text-tertiary)]">Email:</span>{' '}
                  <a href={`mailto:${p.email}`} className="text-[var(--text-accent)] hover:underline">{p.email}</a>
                </p>
                <p className="text-[var(--text-secondary)]">
                  <span className="text-[var(--text-tertiary)]">Phone:</span>{' '}
                  <span className="text-[var(--text-primary)]">{p.phone}</span>
                </p>
                {p.website && (
                  <p className="text-[var(--text-secondary)]">
                    <span className="text-[var(--text-tertiary)]">Website:</span>{' '}
                    <a href={p.website} target="_blank" rel="noreferrer" className="text-[var(--text-link)] hover:underline">
                      {p.website}
                    </a>
                  </p>
                )}
              </div>

              {p.description && (
                <p className="text-xs text-[var(--text-secondary)] leading-relaxed bg-[var(--surface-soft)] p-3 rounded-xl border border-[var(--border-subtle)] line-clamp-3">
                  {p.description}
                </p>
              )}

              <div className="flex flex-wrap gap-2 pt-2 border-t border-[var(--border-subtle)]">
                {canUpdate && (
                  <Button size="sm" variant="secondary" onClick={() => openEditModal(p)}>
                    Edit
                  </Button>
                )}
                {canDelete && (
                  <Button size="sm" variant="ghost" onClick={() => handleDelete(p)}>
                    Delete
                  </Button>
                )}
              </div>
            </Card>
          );
        })}

        {filteredPartners.length === 0 && (
          <Card variant="glass" className="p-8 col-span-full text-center">
            <p className="text-[var(--text-secondary)]">No partners match the current filters.</p>
          </Card>
        )}
      </div>

      <Modal
        isOpen={modalOpen}
        onClose={closeModal}
        title={editingPartner ? `Edit Partner: ${editingPartner.organizationName}` : 'Add New Partner'}
        className="max-w-2xl"
      >
        <form onSubmit={handleSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Organization Name *"
              required
              value={formOrgName}
              onChange={(e) => setFormOrgName(e.target.value)}
            />
            <Input
              label="Contact Person *"
              required
              value={formContactPerson}
              onChange={(e) => setFormContactPerson(e.target.value)}
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Email *"
              type="email"
              required
              value={formEmail}
              onChange={(e) => setFormEmail(e.target.value)}
            />
            <Input
              label="Phone *"
              required
              value={formPhone}
              onChange={(e) => setFormPhone(e.target.value)}
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Website"
              placeholder="https://..."
              value={formWebsite}
              onChange={(e) => setFormWebsite(e.target.value)}
            />
            <Input
              label="Industry *"
              required
              placeholder="e.g. Technology, Healthcare, Government"
              value={formIndustry}
              onChange={(e) => setFormIndustry(e.target.value)}
            />
          </div>
          <Textarea
            label="Description"
            value={formDescription}
            onChange={(e) => setFormDescription(e.target.value)}
            rows={3}
            placeholder="Brief description of the partnership..."
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="w-full space-y-1.5">
              <label className="block text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">
                Status
              </label>
              <select
                value={formStatus}
                onChange={(e) => setFormStatus(e.target.value as Partner['status'])}
                className="w-full rounded-xl bg-[var(--form-bg)] border border-[var(--form-border)] text-[var(--form-text)] px-4 py-3 text-sm focus:outline-none focus:border-[var(--form-border-focus)] focus:ring-1 focus:ring-[var(--form-border-focus)] cursor-pointer"
              >
                <option value="prospect">Prospect</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="terminated">Terminated</option>
              </select>
            </div>
            <div className="w-full space-y-1.5">
              <label className="block text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">
                Partnership Type
              </label>
              <select
                value={formType}
                onChange={(e) => setFormType(e.target.value as Partner['partnershipType'])}
                className="w-full rounded-xl bg-[var(--form-bg)] border border-[var(--form-border)] text-[var(--form-text)] px-4 py-3 text-sm focus:outline-none focus:border-[var(--form-border-focus)] focus:ring-1 focus:ring-[var(--form-border-focus)] cursor-pointer"
              >
                <option value="sponsor">Sponsor</option>
                <option value="client">Client</option>
                <option value="collaborator">Collaborator</option>
                <option value="vendor">Vendor</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Partnership Start Date"
              type="date"
              value={formStartDate}
              onChange={(e) => setFormStartDate(e.target.value)}
            />
            <Input
              label="Partnership End Date"
              type="date"
              value={formEndDate}
              onChange={(e) => setFormEndDate(e.target.value)}
            />
          </div>
          <Input
            label="Address"
            value={formAddress}
            onChange={(e) => setFormAddress(e.target.value)}
          />
          <Textarea
            label="Notes"
            value={formNotes}
            onChange={(e) => setFormNotes(e.target.value)}
            rows={2}
            placeholder="Internal notes about this partner..."
          />
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="ghost" onClick={closeModal}>
              Cancel
            </Button>
            <Button type="submit" variant="accent">
              {editingPartner ? 'Save Changes' : 'Add Partner'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
