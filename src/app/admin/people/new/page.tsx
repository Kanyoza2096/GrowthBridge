'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api/api-client';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { MediaPicker } from '@/components/admin/MediaPicker';
import { Textarea } from '@/components/ui/Textarea';
import {
  PERSON_CATEGORIES,
  PERSON_CATEGORY_LABELS,
  type PersonCategory,
} from '@/lib/types/person';

export default function AdminNewPersonPage() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);

  const [fullName, setFullName] = useState('');
  const [category, setCategory] = useState<PersonCategory>('team');
  const [title, setTitle] = useState('');
  const [department, setDepartment] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [location, setLocation] = useState('');
  const [bio, setBio] = useState('');
  const [shortBio, setShortBio] = useState('');
  const [photo, setPhoto] = useState('');
  const [skillsRaw, setSkillsRaw] = useState('');
  const [certsRaw, setCertsRaw] = useState('');
  const [linkedin, setLinkedin] = useState('');
  const [github, setGithub] = useState('');
  const [twitter, setTwitter] = useState('');
  const [website, setWebsite] = useState('');
  const [displayOrder, setDisplayOrder] = useState<number>(1);
  const [featured, setFeatured] = useState(false);
  const [active, setActive] = useState(true);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !title.trim()) {
      alert('Full Name and Title are required.');
      return;
    }

    setSubmitting(true);
    try {
      const skills = skillsRaw.split(',').map((s) => s.trim()).filter(Boolean);
      const certifications = certsRaw.split(',').map((c) => c.trim()).filter(Boolean);

      if (apiClient.createPerson) {
        await apiClient.createPerson({
          fullName,
          category,
          title,
          department,
          email,
          phone,
          location,
          bio,
          shortBio: shortBio || bio.slice(0, 150),
          photo,
          skills,
          certifications,
          socialLinks: { linkedin, github, twitter, website },
          displayOrder,
          featured,
          active,
        });
      }
      router.push('/admin/people');
    } catch (err) {
      alert('Error creating person: ' + (err as Error).message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Link
            href="/admin/people"
            className="text-xs font-bold text-[var(--admin-text-secondary)] hover:text-[var(--gb-green-400)] transition-colors"
          >
            ← Back to People Directory
          </Link>
          <h1 className="text-2xl font-black text-white mt-1">Add New Person Profile</h1>
        </div>
      </div>

      {/* Form Card */}
      <form onSubmit={handleSubmit} className="rounded-3xl p-6 sm:p-8 bg-[var(--admin-surface-card)] border border-[var(--admin-border)] space-y-6">
        {/* Basic Info Section */}
        <div className="space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-widest text-[var(--gb-green-400)] border-b border-[var(--admin-border)] pb-2">
            Basic Information
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[var(--admin-text-secondary)] mb-1">
                Full Name <span className="text-rose-400">*</span>
              </label>
              <Input
                placeholder="e.g. Dr. Jane Doe"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[var(--admin-text-secondary)] mb-1">
                Person Category <span className="text-rose-400">*</span>
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as PersonCategory)}
                className="w-full h-11 px-3 rounded-xl bg-[var(--admin-surface-deep)] border border-[var(--admin-border)] text-xs font-semibold text-[var(--admin-text-primary)] focus:outline-none focus:border-[var(--gb-green-600)]"
              >
                {PERSON_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {PERSON_CATEGORY_LABELS[cat]}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-[var(--admin-text-secondary)] mb-1">
                Title / Role <span className="text-rose-400">*</span>
              </label>
              <Input
                placeholder="e.g. Lead Software Architect"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[var(--admin-text-secondary)] mb-1">Department</label>
              <Input
                placeholder="e.g. Digital / Technology"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Contact & Location Section */}
        <div className="space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-widest text-[var(--gb-green-400)] border-b border-[var(--admin-border)] pb-2">
            Contact & Location
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-[var(--admin-text-secondary)] mb-1">Email Address</label>
              <Input
                type="email"
                placeholder="e.g. jane@growthbridge.org"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[var(--admin-text-secondary)] mb-1">Phone Number</label>
              <Input
                placeholder="e.g. +27 11 234 5678"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[var(--admin-text-secondary)] mb-1">Location</label>
              <Input
                placeholder="e.g. Cape Town, South Africa"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Biography & Photo */}
        <div className="space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-widest text-[var(--gb-green-400)] border-b border-[var(--admin-border)] pb-2">
            Biography & Photo
          </h2>

          <MediaPicker
            label="Team photo"
            value={photo}
            onChange={setPhoto}
            helper="Upload the portrait in Admin → Media, then select it here. Public team pages use this URL."
          />

          <div>
            <label className="block text-xs font-bold text-[var(--admin-text-secondary)] mb-1">Short Excerpt / Bio Summary</label>
            <Input
              placeholder="Brief 1-2 sentence overview for cards"
              value={shortBio}
              onChange={(e) => setShortBio(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[var(--admin-text-secondary)] mb-1">Full Biography</label>
            <Textarea
              rows={4}
              placeholder="Detailed background, experience, and accomplishments..."
              value={bio}
              onChange={(e) => setBio(e.target.value)}
            />
          </div>
        </div>

        {/* Skills & Certifications */}
        <div className="space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-widest text-[var(--gb-green-400)] border-b border-[var(--admin-border)] pb-2">
            Skills & Certifications
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[var(--admin-text-secondary)] mb-1">Skills (comma-separated)</label>
              <Input
                placeholder="React, Next.js, Strategy, Leadership"
                value={skillsRaw}
                onChange={(e) => setSkillsRaw(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[var(--admin-text-secondary)] mb-1">Certifications (comma-separated)</label>
              <Input
                placeholder="AWS Certified, PMP, Certified Scrum Master"
                value={certsRaw}
                onChange={(e) => setCertsRaw(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Social Links */}
        <div className="space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-widest text-[var(--gb-green-400)] border-b border-[var(--admin-border)] pb-2">
            Social Profiles
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[var(--admin-text-secondary)] mb-1">LinkedIn URL</label>
              <Input
                placeholder="https://linkedin.com/in/..."
                value={linkedin}
                onChange={(e) => setLinkedin(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[var(--admin-text-secondary)] mb-1">GitHub URL</label>
              <Input
                placeholder="https://github.com/..."
                value={github}
                onChange={(e) => setGithub(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[var(--admin-text-secondary)] mb-1">Twitter URL</label>
              <Input
                placeholder="https://twitter.com/..."
                value={twitter}
                onChange={(e) => setTwitter(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[var(--admin-text-secondary)] mb-1">Personal Website URL</label>
              <Input
                placeholder="https://..."
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Display Settings */}
        <div className="space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-widest text-[var(--gb-green-400)] border-b border-[var(--admin-border)] pb-2">
            Display Settings
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
            <div>
              <label className="block text-xs font-bold text-[var(--admin-text-secondary)] mb-1">Display Order</label>
              <Input
                type="number"
                value={displayOrder}
                onChange={(e) => setDisplayOrder(Number(e.target.value))}
              />
            </div>

            <div className="flex items-center space-x-2 pt-5">
              <input
                type="checkbox"
                id="featured"
                checked={featured}
                onChange={(e) => setFeatured(e.target.checked)}
                className="w-4 h-4 rounded text-emerald-500 bg-[var(--admin-surface-deep)] border-[var(--admin-border)] focus:ring-0"
              />
              <label htmlFor="featured" className="text-xs font-bold text-[var(--admin-text-secondary)] cursor-pointer">
                Featured Profile
              </label>
            </div>

            <div className="flex items-center space-x-2 pt-5">
              <input
                type="checkbox"
                id="active"
                checked={active}
                onChange={(e) => setActive(e.target.checked)}
                className="w-4 h-4 rounded text-emerald-500 bg-[var(--admin-surface-deep)] border-[var(--admin-border)] focus:ring-0"
              />
              <label htmlFor="active" className="text-xs font-bold text-[var(--admin-text-secondary)] cursor-pointer">
                Active Status
              </label>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-4 border-t border-[var(--admin-border)] flex justify-end space-x-3">
          <Link href="/admin/people">
            <Button variant="ghost" type="button">
              Cancel
            </Button>
          </Link>
          <Button variant="accent" type="submit" disabled={submitting}>
            {submitting ? 'Saving...' : 'Save Person Profile'}
          </Button>
        </div>
      </form>
    </div>
  );
}
