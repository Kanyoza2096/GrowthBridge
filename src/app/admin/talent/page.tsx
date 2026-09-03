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
import type { TalentProfile } from '@/lib/types/admin';

type AvailabilityFilter = 'all' | 'available' | 'interviewing' | 'hired' | 'unavailable';
type VerificationFilter = 'all' | 'pending' | 'verified' | 'unverified';

const availabilityBadge: Record<TalentProfile['availability'], { variant: 'green' | 'blue' | 'orange' | 'outline'; label: string }> = {
  available: { variant: 'green', label: 'AVAILABLE' },
  interviewing: { variant: 'blue', label: 'INTERVIEWING' },
  hired: { variant: 'orange', label: 'HIRED' },
  unavailable: { variant: 'outline', label: 'UNAVAILABLE' },
};

const verificationBadge: Record<TalentProfile['verificationStatus'], { variant: 'green' | 'orange' | 'outline'; label: string }> = {
  verified: { variant: 'green', label: 'VERIFIED' },
  pending: { variant: 'orange', label: 'PENDING' },
  unverified: { variant: 'outline', label: 'UNVERIFIED' },
};

export default function AdminTalentPage() {
  const { hasPermission } = useAdminAuth();
  const { talent, updateTalent, approveTalent, rejectTalent } = useAdminData();
  const { success, error } = useToast();

  const canRead = hasPermission('talent', 'read');
  const canUpdate = hasPermission('talent', 'update');
  const canDelete = hasPermission('talent', 'delete');

  const [availabilityFilter, setAvailabilityFilter] = useState<AvailabilityFilter>('all');
  const [verificationFilter, setVerificationFilter] = useState<VerificationFilter>('all');
  const [search, setSearch] = useState('');

  const [modalOpen, setModalOpen] = useState(false);
  const [editingTalent, setEditingTalent] = useState<TalentProfile | null>(null);

  const [formName, setFormName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formBio, setFormBio] = useState('');
  const [formSkills, setFormSkills] = useState('');
  const [formExperience, setFormExperience] = useState('');
  const [formAvailability, setFormAvailability] = useState<TalentProfile['availability']>('available');
  const [formCategories, setFormCategories] = useState('');
  const [formPortfolio, setFormPortfolio] = useState('');

  const filteredTalent = useMemo(() => {
    return talent.filter((t) => {
      const matchesAvailability = availabilityFilter === 'all' || t.availability === availabilityFilter;
      const matchesVerification = verificationFilter === 'all' || t.verificationStatus === verificationFilter;
      const s = search.toLowerCase();
      const matchesSearch =
        search === '' ||
        t.name.toLowerCase().includes(s) ||
        t.email.toLowerCase().includes(s) ||
        t.skills.some((sk) => sk.toLowerCase().includes(s)) ||
        t.bio.toLowerCase().includes(s);
      return matchesAvailability && matchesVerification && matchesSearch;
    });
  }, [talent, availabilityFilter, verificationFilter, search]);

  const openEditModal = (t: TalentProfile) => {
    if (!canUpdate) return;
    setEditingTalent(t);
    setFormName(t.name);
    setFormEmail(t.email);
    setFormPhone(t.phone);
    setFormBio(t.bio);
    setFormSkills(t.skills.join(', '));
    setFormExperience(String(t.experience));
    setFormAvailability(t.availability);
    setFormCategories(t.categories.join(', '));
    setFormPortfolio(t.portfolio || '');
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingTalent(null);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTalent || !canUpdate) return;

    const skillsArr = formSkills.split(',').map((s) => s.trim()).filter(Boolean);
    const catArr = formCategories.split(',').map((s) => s.trim()).filter(Boolean);
    const expNum = Math.max(0, parseInt(formExperience, 10) || 0);

    updateTalent(editingTalent.id, {
      name: formName,
      email: formEmail,
      phone: formPhone,
      bio: formBio,
      skills: skillsArr,
      experience: expNum,
      experienceLevel: expNum < 2 ? 'entry' : expNum < 5 ? 'mid' : expNum < 8 ? 'senior' : 'expert',
      availability: formAvailability,
      categories: catArr,
      portfolio: formPortfolio,
    });
    success('Profile Updated', `${formName}'s talent profile has been saved.`);
    closeModal();
  };

  const handleApprove = (t: TalentProfile) => {
    if (!canUpdate) return;
    approveTalent(t.id);
    success('Talent Verified', `${t.name} is now a verified talent member.`);
  };

  const handleReject = (t: TalentProfile) => {
    if (!canDelete) {
      error('Permission Denied', 'You do not have permission to remove talent.');
      return;
    }
    rejectTalent(t.id);
    success('Talent Removed', `${t.name}'s profile has been rejected and removed.`);
  };

  if (!canRead) {
    return (
      <div className="admin-page space-y-6">
        <div>
          <Badge variant="outline" className="text-[9px] mb-1">RESTRICTED</Badge>
          <h1 className="text-2xl font-extrabold text-white">Talent Hub</h1>
        </div>
        <Card variant="admin" className="p-8 text-center">
          <p className="text-[var(--admin-text-secondary)]">You do not have permission to view the Talent Hub.</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Badge variant="purple" className="text-[9px] mb-1">TALENT HUB</Badge>
          <h1 className="text-2xl font-extrabold text-white">Talent Profiles Manager</h1>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex flex-wrap gap-3 items-center">
          <div className="flex gap-2">
            {(['all', 'available', 'interviewing', 'hired', 'unavailable'] as AvailabilityFilter[]).map((f) => (
              <button
                key={f}
                onClick={() => setAvailabilityFilter(f)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                  availabilityFilter === f
                    ? 'bg-[var(--gb-green-600)] border-[var(--gb-green-600)] text-white'
                    : 'bg-[var(--admin-surface-card)] border-[var(--admin-border)] text-[var(--admin-text-secondary)] hover:text-[var(--admin-text-primary)]'
                }`}
              >
                {f.toUpperCase()}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            {(['all', 'pending', 'verified', 'unverified'] as VerificationFilter[]).map((f) => (
              <button
                key={f}
                onClick={() => setVerificationFilter(f)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                  verificationFilter === f
                    ? 'bg-[var(--gb-navy-800)] border-[var(--gb-navy-800)] text-white'
                    : 'bg-[var(--admin-surface-card)] border-[var(--admin-border)] text-[var(--admin-text-secondary)] hover:text-[var(--admin-text-primary)]'
                }`}
              >
                {f.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        <div className="max-w-md">
          <Input
            placeholder="Search by name, email, skill, or bio..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTalent.map((t) => {
          const av = availabilityBadge[t.availability];
          const vs = verificationBadge[t.verificationStatus];
          return (
            <Card key={t.id} variant="admin" className="p-6 space-y-4 flex flex-col">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <Badge variant={av.variant} className="text-[10px]">{av.label}</Badge>
                <Badge variant={vs.variant} className="text-[10px]">{vs.label}</Badge>
              </div>

              <div className="space-y-1">
                <h3 className="text-lg font-bold text-white">{t.name}</h3>
                <p className="text-xs text-[var(--admin-text-secondary)]">
                  {t.experienceLevel.toUpperCase()} · {t.experience} yrs exp
                </p>
              </div>

              <p className="text-sm text-[var(--admin-text-secondary)] leading-relaxed line-clamp-3 flex-1">
                {t.bio}
              </p>

              <div className="flex flex-wrap gap-1.5">
                {t.skills.slice(0, 4).map((sk, i) => (
                  <span
                    key={i}
                    className="px-2 py-0.5 text-[10px] font-semibold rounded-md bg-[var(--admin-surface-card)]/80 border border-[var(--admin-border)] text-[var(--gb-green-300)]"
                  >
                    {sk}
                  </span>
                ))}
                {t.skills.length > 4 && (
                  <span className="px-2 py-0.5 text-[10px] font-semibold rounded-md bg-[var(--admin-surface-card)]/80 border border-[var(--admin-border)] text-[var(--admin-text-secondary)]">
                    +{t.skills.length - 4}
                  </span>
                )}
              </div>

              <div className="flex flex-wrap gap-2 pt-2 border-t border-[var(--admin-border)]">
                {t.verificationStatus === 'pending' && canUpdate && (
                  <Button size="sm" variant="primary" onClick={() => handleApprove(t)}>
                    Verify
                  </Button>
                )}
                {t.verificationStatus === 'pending' && canDelete && (
                  <Button size="sm" variant="outline" onClick={() => handleReject(t)}>
                    Reject
                  </Button>
                )}
                {t.verificationStatus !== 'pending' && canUpdate && (
                  <Button size="sm" variant="secondary" onClick={() => openEditModal(t)}>
                    Edit Profile
                  </Button>
                )}
                {t.verificationStatus !== 'pending' && canDelete && (
                  <Button size="sm" variant="ghost" onClick={() => handleReject(t)}>
                    Delete
                  </Button>
                )}
              </div>
            </Card>
          );
        })}

        {filteredTalent.length === 0 && (
          <Card variant="admin" className="p-8 col-span-full text-center">
            <p className="text-[var(--admin-text-secondary)]">No talent profiles match the current filters.</p>
          </Card>
        )}
      </div>

      <Modal
        isOpen={modalOpen}
        onClose={closeModal}
        title={editingTalent ? `Edit: ${editingTalent.name}` : 'Talent Profile'}
        className="max-w-xl"
      >
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Full Name *"
              required
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
            />
            <Input
              label="Email *"
              type="email"
              required
              value={formEmail}
              onChange={(e) => setFormEmail(e.target.value)}
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Phone"
              value={formPhone}
              onChange={(e) => setFormPhone(e.target.value)}
            />
            <Input
              label="Years Experience"
              type="number"
              min="0"
              value={formExperience}
              onChange={(e) => setFormExperience(e.target.value)}
            />
          </div>
          <Textarea
            label="Bio"
            value={formBio}
            onChange={(e) => setFormBio(e.target.value)}
            rows={4}
          />
          <Input
            label="Skills (comma-separated)"
            placeholder="React, Node.js, TypeScript"
            value={formSkills}
            onChange={(e) => setFormSkills(e.target.value)}
          />
          <Input
            label="Categories (comma-separated)"
            placeholder="Software Engineering, Design"
            value={formCategories}
            onChange={(e) => setFormCategories(e.target.value)}
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Portfolio URL"
              value={formPortfolio}
              onChange={(e) => setFormPortfolio(e.target.value)}
            />
            <div className="w-full space-y-1.5">
              <label className="block text-xs font-semibold text-[var(--admin-text-secondary)] uppercase tracking-wider">
                Availability
              </label>
              <select
                value={formAvailability}
                onChange={(e) => setFormAvailability(e.target.value as TalentProfile['availability'])}
                className="w-full rounded-xl bg-[var(--admin-surface-card)]/60 border border-[var(--admin-border)] text-[var(--admin-text-primary)] px-4 py-3 text-sm focus:outline-none focus:border-[var(--gb-green-600)] focus:ring-1 focus:ring-[var(--gb-green-600)] cursor-pointer"
              >
                <option value="available">Available</option>
                <option value="interviewing">Interviewing</option>
                <option value="hired">Hired</option>
                <option value="unavailable">Unavailable</option>
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="ghost" onClick={closeModal}>
              Cancel
            </Button>
            <Button type="submit" variant="accent">
              Save Profile
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
