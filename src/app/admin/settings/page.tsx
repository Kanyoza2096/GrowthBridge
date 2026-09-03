'use client';

import React, { useState, useEffect } from 'react';
import { useAdminData } from '@/components/providers/AdminDataProvider';
import type { Settings } from '@/lib/types/admin';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Badge } from '@/components/ui/Badge';
import { cn } from '@/lib/utils';
import { MediaPicker } from '@/components/admin/MediaPicker';

type TabId = 'branding' | 'social' | 'seo' | 'features' | 'api' | 'email';

const TABS: { id: TabId; label: string; icon: string; description: string }[] = [
 { id: 'branding', label: 'Organization & Logo', icon: 'BR', description: 'Logo, site identity, organization name, address, and contact info.' },
 { id: 'social', label: 'Social Media', icon: 'SO', description: 'Official social profiles and external platform links.' },
 { id: 'seo', label: 'SEO & Metadata', icon: 'SEO', description: 'Default search titles, meta descriptions, keywords, and OpenGraph images.' },
 { id: 'features', label: 'Dynamic Features', icon: 'FX', description: 'Enable/disable platform modules and maintenance mode.' },
 { id: 'email', label: 'Email & SMTP', icon: 'EM', description: 'Sender identities, notification addresses, and SMTP configuration.' },
 { id: 'api', label: 'API & Keys', icon: 'API', description: 'Public API settings, rate limits, and authentication keys.' },
];

export default function AdminSettingsPage() {
 const { settings: loadedSettings, updateSettings, isLoading: dataLoading } = useAdminData();
 const [settings, setSettings] = useState<Settings | null>(null);
 const [activeTab, setActiveTab] = useState<TabId>('branding');
 const [loading, setLoading] = useState<boolean>(true);
 const [saving, setSaving] = useState<boolean>(false);
 const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
 const [newKeyword, setNewKeyword] = useState<string>('');

 useEffect(() => {
  if (loadedSettings) setSettings(loadedSettings);
  setLoading(dataLoading);
 }, [loadedSettings, dataLoading]);

 const handleSave = async () => {
  if (!settings) return;
  setSaving(true);
  setToastMessage(null);

  try {
   await updateSettings(settings);
   setToastMessage({ type: 'success', text: 'Settings updated successfully!' });
   setTimeout(() => setToastMessage(null), 4000);
  } catch (err) {
   console.error('Failed to save settings:', err);
   setToastMessage({ type: 'error', text: 'Failed to save settings. Please try again.' });
  } finally {
   setSaving(false);
  }
 };

 const updateOrgField = (field: keyof Settings['organization'], value: string) => {
  if (!settings) return;
  setSettings({
   ...settings,
   organization: { ...settings.organization, [field]: value },
  });
 };

 const updateSocialField = (field: keyof Settings['social'], value: string) => {
  if (!settings) return;
  setSettings({
   ...settings,
   social: { ...settings.social, [field]: value },
  });
 };

 const updateSeoField = (field: keyof Settings['seo'], value: any) => {
  if (!settings) return;
  setSettings({
   ...settings,
   seo: { ...settings.seo, [field]: value },
  });
 };

 const updateHomepageField = (field: keyof NonNullable<Settings['homepage']>, value: string) => {
  if (!settings) return;
  setSettings({
   ...settings,
   homepage: { ...(settings.homepage || {}), [field]: value },
  });
 };


 const updateFeatureToggle = (field: keyof Settings['features'], value: boolean) => {
  if (!settings) return;
  setSettings({
   ...settings,
   features: { ...settings.features, [field]: value },
  });
 };

 const updateEmailField = (field: keyof Settings['email'], value: any) => {
  if (!settings) return;
  setSettings({
   ...settings,
   email: { ...settings.email, [field]: value },
  });
 };

 const updateApiField = (field: keyof Settings['api'], value: any) => {
  if (!settings) return;
  setSettings({
   ...settings,
   api: { ...settings.api, [field]: value },
  });
 };

 const addKeyword = () => {
  if (!newKeyword.trim() || !settings) return;
  const current = settings.seo.defaultKeywords || [];
  if (!current.includes(newKeyword.trim())) {
   updateSeoField('defaultKeywords', [...current, newKeyword.trim()]);
  }
  setNewKeyword('');
 };

 const removeKeyword = (kw: string) => {
  if (!settings) return;
  const current = settings.seo.defaultKeywords || [];
  updateSeoField('defaultKeywords', current.filter((k) => k !== kw));
 };

 if (loading) {
  return (
   <div className="p-8 space-y-6">
    <div className="h-8 w-64 bg-[var(--admin-surface-soft)] rounded animate-pulse" />
    <div className="h-4 w-96 bg-[var(--admin-surface-soft)] rounded animate-pulse" />
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 pt-6">
     <div className="h-64 bg-[var(--admin-surface-soft)] rounded-xl animate-pulse" />
     <div className="md:col-span-3 h-96 bg-[var(--admin-surface-soft)] rounded-xl animate-pulse" />
    </div>
   </div>
  );
 }

 if (!settings) {
  return (
   <div className="p-8 text-center space-y-4">
    <p className="text-[var(--admin-text-tertiary)]">Failed to load platform settings.</p>
    <Button onClick={() => window.location.reload()}>Retry</Button>
   </div>
  );
 }

 return (
  <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
   {/* Header */}
   <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[var(--admin-border)] pb-6">
    <div>
     <div className="flex items-center gap-3">
      <span className="text-2xl">FX</span>
      <h1 className="text-2xl font-bold text-[var(--admin-text-primary)] ">Platform Settings</h1>
     </div>
     <p className="text-sm text-[var(--admin-text-tertiary)] mt-1">
      Manage global platform configuration, branding, dynamic features, and API integrations.
     </p>
    </div>

    <div className="flex items-center gap-3">
     {toastMessage && (
      <div
       className={cn(
        'text-xs font-semibold px-3 py-2 rounded-lg transition-all animate-fade-in',
        toastMessage.type === 'success' ? 'bg-[var(--gb-green-600)]/10 text-emerald-600 text-[var(--gb-green-400)] border border-[var(--gb-green-600)]/20' : 'bg-red-500/10 text-red-600 text-red-500 border border-red-500/20'
       )}
      >
       {toastMessage.text}
      </div>
     )}
     <Button
      onClick={handleSave}
      disabled={saving}
      className="bg-[var(--gb-green-700)] hover:bg-[var(--gb-green-800)] text-white shadow-md font-semibold px-6"
     >
      {saving ? 'Saving Changes...' : 'Save Changes'}
     </Button>
    </div>
   </div>

   {/* Main Grid: Left Tabs / Right Active Panel */}
   <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
    {/* Navigation Sidebar Tabs */}
    <div className="lg:col-span-3 space-y-2">
     {TABS.map((tab) => {
      const active = activeTab === tab.id;
      return (
       <button
        key={tab.id}
        onClick={() => setActiveTab(tab.id)}
        className={cn(
         'w-full flex items-start gap-3 p-3.5 rounded-xl text-left transition-all border',
         active
          ? 'bg-[var(--gb-navy-800)] text-white border-[var(--gb-navy-800)] shadow-md bg-[var(--gb-green-600)] border-[var(--gb-green-600)]'
          : 'bg-[var(--admin-surface-card)] text-[var(--admin-text-secondary)] border-[var(--admin-border)] hover:bg-[var(--admin-surface-soft)] '
        )}
       >
        <span className="text-xl flex-shrink-0 mt-0.5">{tab.icon}</span>
        <div>
         <div className={cn('text-sm font-semibold', active ? 'text-white' : 'text-[var(--admin-text-primary)] ')}>
          {tab.label}
         </div>
         <div className={cn('text-xs line-clamp-1 mt-0.5', active ? 'text-white/80' : 'text-[var(--admin-text-tertiary)] ')}>
          {tab.description}
         </div>
        </div>
       </button>
      );
     })}
    </div>

    {/* Content Panel */}
    <div className="lg:col-span-9">
     {/* TAB 1: BRANDING & ORGANIZATION */}
     {activeTab === 'branding' && (
      <Card>
       <CardHeader>
        <div className="flex items-center gap-2">
         <span className="admin-icon-tile">BR</span>
         <CardTitle>Organization & Branding</CardTitle>
        </div>
        <CardDescription>
         Configure site identity, organization name, primary logo, physical location, and main contact info.
        </CardDescription>
       </CardHeader>
       <CardContent className="space-y-6">
        {/* Logo Section with Live Preview */}
        <div className="p-5 rounded-2xl bg-[var(--admin-surface-soft)] bg-[var(--admin-surface-card)]/60 border border-[var(--admin-border)] space-y-4">
         <label className="text-xs font-bold uppercase tracking-wider text-[var(--admin-text-secondary)] ">
          Platform Logo & Branding Mark
         </label>
         <div className="flex flex-col sm:flex-row items-center gap-6">
          {/* Live Preview Box */}
          <div className="flex flex-col items-center justify-center p-4 w-44 h-28 rounded-xl bg-[var(--admin-surface-card)] border border-[var(--admin-border)] shadow-sm text-center">
           {settings.organization.logo ? (
            <img
             src={settings.organization.logo}
             alt="Logo Preview"
             className="max-h-16 max-w-full object-contain"
             onError={(e) => {
              (e.target as HTMLElement).style.display = 'none';
             }}
            />
           ) : (
            <div className="flex items-center gap-2 font-extrabold text-[var(--gb-navy-800)] text-[var(--gb-green-400)] text-lg">
             <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[var(--gb-navy-800)] to-[var(--gb-green-700)] flex items-center justify-center text-white font-black text-sm">
              GB
             </div>
             GROWTHBRIDGE
            </div>
           )}
           <span className="text-[10px] text-[var(--admin-text-secondary)] mt-2 font-medium">Live Header Preview</span>
          </div>

          {/* Logo Input Fields */}
          <div className="flex-1 space-y-3 w-full">
           <MediaPicker
             label="Logo Image (from Media library)"
             value={settings.organization.logo || ''}
             onChange={(url) => updateOrgField('logo', url)}
             helper="Upload in Admin → Media, then choose here. Same pattern as team photos and homepage hero."
           />
          </div>
         </div>
        </div>

        <div className="p-5 rounded-2xl border border-[var(--admin-border)] bg-[var(--admin-surface-card)]/40 space-y-4">
         <div>
          <p className="text-xs font-bold uppercase tracking-wider text-[var(--admin-text-secondary)]">Homepage hero</p>
          <p className="text-[11px] text-[var(--admin-text-tertiary)] mt-1">
            Poster-style photo for the public homepage. Upload under <strong>Media</strong>, then select below.
            Team member photos use the same Media library pattern.
          </p>
         </div>
         <MediaPicker
           label="Hero background image"
           value={settings.homepage?.heroImage || ''}
           onChange={(url) => updateHomepageField('heroImage', url)}
         />
         <div>
          <label className="text-xs font-semibold text-[var(--admin-text-secondary)] mb-1 block">Hero headline</label>
          <Input
            value={settings.homepage?.heroHeadline || ''}
            onChange={(e) => updateHomepageField('heroHeadline', e.target.value)}
            placeholder="Bridging Skills. Driving Growth."
          />
         </div>
         <div>
          <label className="text-xs font-semibold text-[var(--admin-text-secondary)] mb-1 block">Hero subheadline</label>
          <Textarea
            value={settings.homepage?.heroSubheadline || ''}
            onChange={(e) => updateHomepageField('heroSubheadline', e.target.value)}
            placeholder="Short supporting line under the headline"
          />
         </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
         <div>
          <label className="text-xs font-semibold text-[var(--admin-text-secondary)] mb-1 block">
           Organization Name
          </label>
          <Input
           value={settings.organization.name}
           onChange={(e) => updateOrgField('name', e.target.value)}
          />
         </div>

         <div>
          <label className="text-xs font-semibold text-[var(--admin-text-secondary)] mb-1 block">
           Slogan / Tagline
          </label>
          <Input
           value={settings.organization.tagline}
           onChange={(e) => updateOrgField('tagline', e.target.value)}
          />
         </div>
        </div>

        <div>
         <label className="text-xs font-semibold text-[var(--admin-text-secondary)] mb-1 block">
          Organization Mission & About Description
         </label>
         <Textarea
          rows={4}
          value={settings.organization.description}
          onChange={(e) => updateOrgField('description', e.target.value)}
         />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
         <div>
          <label className="text-xs font-semibold text-[var(--admin-text-secondary)] mb-1 block">
           Official Contact Email
          </label>
          <Input
           type="email"
           value={settings.organization.email}
           onChange={(e) => updateOrgField('email', e.target.value)}
          />
         </div>

         <div>
          <label className="text-xs font-semibold text-[var(--admin-text-secondary)] mb-1 block">
           Official Phone Line
          </label>
          <Input
           value={settings.organization.phone}
           onChange={(e) => updateOrgField('phone', e.target.value)}
          />
         </div>

         <div>
          <label className="text-xs font-semibold text-[var(--admin-text-secondary)] mb-1 block">
           Physical Location / Address
          </label>
          <Input
           value={settings.organization.address}
           onChange={(e) => updateOrgField('address', e.target.value)}
          />
         </div>
        </div>
       </CardContent>
      </Card>
     )}

     {/* TAB 2: SOCIAL MEDIA */}
     {activeTab === 'social' && (
      <Card>
       <CardHeader>
        <div className="flex items-center gap-2">
         <span className="admin-icon-tile">SO</span>
         <CardTitle>Social Media Profiles</CardTitle>
        </div>
        <CardDescription>
         Links to Growthbridge official social media handles displayed across the header and footer.
        </CardDescription>
       </CardHeader>
       <CardContent className="space-y-4">
        <div>
         <label className="text-xs font-semibold text-[var(--admin-text-secondary)] mb-1 block flex items-center gap-2">
          <span>LinkedIn Page URL</span>
         </label>
         <Input
          value={settings.social.linkedin || ''}
          onChange={(e) => updateSocialField('linkedin', e.target.value)}
          placeholder="https://linkedin.com/company/growthbridge"
         />
        </div>

        <div>
         <label className="text-xs font-semibold text-[var(--admin-text-secondary)] mb-1 block flex items-center gap-2">
          <span>Twitter / X Profile URL</span>
         </label>
         <Input
          value={settings.social.twitter || ''}
          onChange={(e) => updateSocialField('twitter', e.target.value)}
          placeholder="https://twitter.com/growthbridge"
         />
        </div>

        <div>
         <label className="text-xs font-semibold text-[var(--admin-text-secondary)] mb-1 block flex items-center gap-2">
          <span>Facebook Page URL</span>
         </label>
         <Input
          value={settings.social.facebook || ''}
          onChange={(e) => updateSocialField('facebook', e.target.value)}
          placeholder="https://facebook.com/growthbridge"
         />
        </div>

        <div>
         <label className="text-xs font-semibold text-[var(--admin-text-secondary)] mb-1 block flex items-center gap-2">
          <span>Instagram Profile URL</span>
         </label>
         <Input
          value={settings.social.instagram || ''}
          onChange={(e) => updateSocialField('instagram', e.target.value)}
          placeholder="https://instagram.com/growthbridge"
         />
        </div>

        <div>
         <label className="text-xs font-semibold text-[var(--admin-text-secondary)] mb-1 block flex items-center gap-2">
          <span>YouTube Channel URL</span>
         </label>
         <Input
          value={settings.social.youtube || ''}
          onChange={(e) => updateSocialField('youtube', e.target.value)}
          placeholder="https://youtube.com/@growthbridge"
         />
        </div>
       </CardContent>
      </Card>
     )}

     {/* TAB 3: SEO & METADATA */}
     {activeTab === 'seo' && (
      <Card>
       <CardHeader>
        <div className="flex items-center gap-2">
         <span className="admin-icon-tile">SEO</span>
         <CardTitle>Search Engine Optimization & Metadata</CardTitle>
        </div>
        <CardDescription>
         Global default meta titles, descriptions, open-graph image tags, and search index keywords.
        </CardDescription>
       </CardHeader>
       <CardContent className="space-y-6">
        <div>
         <label className="text-xs font-semibold text-[var(--admin-text-secondary)] mb-1 block">
          Default Page Title
         </label>
         <Input
          value={settings.seo.defaultTitle}
          onChange={(e) => updateSeoField('defaultTitle', e.target.value)}
         />
        </div>

        <div>
         <label className="text-xs font-semibold text-[var(--admin-text-secondary)] mb-1 block">
          Default Meta Description
         </label>
         <Textarea
          rows={3}
          value={settings.seo.defaultDescription}
          onChange={(e) => updateSeoField('defaultDescription', e.target.value)}
         />
        </div>

        <div>
         <label className="text-xs font-semibold text-[var(--admin-text-secondary)] mb-1 block">
          Default OpenGraph Social Preview Image URL
         </label>
         <MediaPicker
          label="Open Graph / social share image"
          value={settings.seo.ogImage || ''}
          onChange={(url) => updateSeoField('ogImage', url)}
          helper="Upload in Admin → Media, then select. Used for social link previews."
         />
        </div>

        {/* Keywords Manager */}
        <div className="space-y-3">
         <label className="text-xs font-semibold text-[var(--admin-text-secondary)] block">
          SEO Keywords
         </label>
         <div className="flex gap-2">
          <Input
           value={newKeyword}
           onChange={(e) => setNewKeyword(e.target.value)}
           onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addKeyword())}
           placeholder="Add SEO Keyword (press Enter)"
           className="flex-1"
          />
          <Button onClick={addKeyword} type="button" variant="outline">
           Add
          </Button>
         </div>
         <div className="flex flex-wrap gap-2 pt-2">
          {(settings.seo.defaultKeywords || []).map((kw) => (
           <span
            key={kw}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-[var(--gb-green-600)]/10 text-emerald-600 text-[var(--gb-green-400)] border border-[var(--gb-green-600)]/20"
           >
            {kw}
            <button
             type="button"
             onClick={() => removeKeyword(kw)}
             className="hover:text-red-500 ml-1 font-bold"
            >
             ×
            </button>
           </span>
          ))}
         </div>
        </div>
       </CardContent>
      </Card>
     )}

     {/* TAB 4: DYNAMIC FEATURE TOGGLES */}
     {activeTab === 'features' && (
      <Card>
       <CardHeader>
        <div className="flex items-center gap-2">
         <span className="text-xl">FX</span>
         <CardTitle>Dynamic Feature Modules & Maintenance</CardTitle>
        </div>
        <CardDescription>
         Toggle dynamic features on or off in real-time across the Growthbridge public application.
        </CardDescription>
       </CardHeader>
       <CardContent className="space-y-4">
        {/* Feature Toggles List */}
        <div className="divide-y divide-[var(--admin-border)] divide-[var(--admin-border)]">
         <div className="py-4 flex items-center justify-between">
          <div>
           <div className="text-sm font-semibold text-[var(--admin-text-primary)] ">Youth Talent Hub</div>
           <div className="text-xs text-[var(--admin-text-tertiary)] ">
            Enable youth candidate profile registration, skill browsing, and recruiter search.
           </div>
          </div>
          <input
           type="checkbox"
           checked={settings.features.enableTalentHub}
           onChange={(e) => updateFeatureToggle('enableTalentHub', e.target.checked)}
           className="w-5 h-5 accent-[var(--gb-green-700)] rounded cursor-pointer"
          />
         </div>

         <div className="py-4 flex items-center justify-between">
          <div>
           <div className="text-sm font-semibold text-[var(--admin-text-primary)] ">Blog & News Module</div>
           <div className="text-xs text-[var(--admin-text-tertiary)] ">
            Show news, updates, impact stories, and blog posts.
           </div>
          </div>
          <input
           type="checkbox"
           checked={settings.features.enableBlog}
           onChange={(e) => updateFeatureToggle('enableBlog', e.target.checked)}
           className="w-5 h-5 accent-[var(--gb-green-700)] rounded cursor-pointer"
          />
         </div>

         <div className="py-4 flex items-center justify-between">
          <div>
           <div className="text-sm font-semibold text-[var(--admin-text-primary)] ">Partner Portal</div>
           <div className="text-xs text-[var(--admin-text-tertiary)] ">
            Enable corporate partnership inquiries and partner logo showcases.
           </div>
          </div>
          <input
           type="checkbox"
           checked={settings.features.enablePartnerPortal}
           onChange={(e) => updateFeatureToggle('enablePartnerPortal', e.target.checked)}
           className="w-5 h-5 accent-[var(--gb-green-700)] rounded cursor-pointer"
          />
         </div>

         <div className="py-4 flex items-center justify-between">
          <div>
           <div className="text-sm font-semibold text-[var(--admin-text-primary)] ">Partner Logo Carousel & Marquee Banner</div>
           <div className="text-xs text-[var(--admin-text-tertiary)] ">
            Enable interactive marquee slider featuring corporate partners, sponsors, and innovation collaborators on the public home page.
           </div>
          </div>
          <input
           type="checkbox"
           checked={settings.features.enablePartnerCarousel ?? true}
           onChange={(e) => updateFeatureToggle('enablePartnerCarousel', e.target.checked)}
           className="w-5 h-5 accent-[var(--gb-green-700)] rounded cursor-pointer"
          />
         </div>

         <div className="py-4 flex items-center justify-between">
          <div>
           <div className="text-sm font-semibold text-[var(--admin-text-primary)] ">AI Growth Assistant</div>
           <div className="text-xs text-[var(--admin-text-tertiary)] ">
            Enable intelligent conversational chat for youth talent guidance and inquiries.
           </div>
          </div>
          <input
           type="checkbox"
           checked={settings.features.enableAIAssistant}
           onChange={(e) => updateFeatureToggle('enableAIAssistant', e.target.checked)}
           className="w-5 h-5 accent-[var(--gb-green-700)] rounded cursor-pointer"
          />
         </div>

         <div className="py-4 flex items-center justify-between">
          <div>
           <div className="text-sm font-semibold text-[var(--admin-text-primary)] ">Telemetry & Analytics</div>
           <div className="text-xs text-[var(--admin-text-tertiary)] ">
            Log anonymized system activity and pageview performance statistics.
           </div>
          </div>
          <input
           type="checkbox"
           checked={settings.features.enableAnalytics}
           onChange={(e) => updateFeatureToggle('enableAnalytics', e.target.checked)}
           className="w-5 h-5 accent-[var(--gb-green-700)] rounded cursor-pointer"
          />
         </div>

         <div className="py-4 flex items-center justify-between bg-amber-500/5 p-4 rounded-xl border border-amber-500/20">
          <div>
           <div className="text-sm font-bold text-amber-600 text-amber-600 flex items-center gap-2">
            <span>System Maintenance Mode</span>
           </div>
           <div className="text-xs text-[var(--admin-text-tertiary)] ">
            When enabled, non-admin visitors will see a graceful maintenance page.
           </div>
          </div>
          <input
           type="checkbox"
           checked={settings.features.maintenanceMode}
           onChange={(e) => updateFeatureToggle('maintenanceMode', e.target.checked)}
           className="w-5 h-5 accent-amber-600 rounded cursor-pointer"
          />
         </div>
        </div>
       </CardContent>
      </Card>
     )}

     {/* TAB 5: EMAIL & SMTP */}
     {activeTab === 'email' && (
      <Card>
       <CardHeader>
        <div className="flex items-center gap-2">
         <span className="text-xl">EM</span>
         <CardTitle>Email Notifications & SMTP Settings</CardTitle>
        </div>
        <CardDescription>
         Configure outbound notification addresses and mail delivery credentials.
        </CardDescription>
       </CardHeader>
       <CardContent className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
         <div>
          <label className="text-xs font-semibold text-[var(--admin-text-secondary)] mb-1 block">
           Sender Name
          </label>
          <Input
           value={settings.email.fromName}
           onChange={(e) => updateEmailField('fromName', e.target.value)}
          />
         </div>

         <div>
          <label className="text-xs font-semibold text-[var(--admin-text-secondary)] mb-1 block">
           Sender Email Address
          </label>
          <Input
           type="email"
           value={settings.email.fromAddress}
           onChange={(e) => updateEmailField('fromAddress', e.target.value)}
          />
         </div>
        </div>

        <div className="pt-4 border-t border-[var(--admin-border)] space-y-4">
         <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--admin-text-secondary)] ">
          SMTP Server Configuration
         </h3>

         <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="sm:col-span-2">
           <label className="text-xs font-semibold text-[var(--admin-text-secondary)] mb-1 block">
            SMTP Host
           </label>
           <Input
            value={settings.email.smtpHost || ''}
            onChange={(e) => updateEmailField('smtpHost', e.target.value)}
            placeholder="smtp.sendgrid.net"
           />
          </div>

          <div>
           <label className="text-xs font-semibold text-[var(--admin-text-secondary)] mb-1 block">
            Port
           </label>
           <Input
            type="number"
            value={settings.email.smtpPort || 587}
            onChange={(e) => updateEmailField('smtpPort', Number(e.target.value))}
           />
          </div>
         </div>
        </div>
       </CardContent>
      </Card>
     )}

     {/* TAB 6: API & KEYS */}
     {activeTab === 'api' && (
      <Card>
       <CardHeader>
        <div className="flex items-center gap-2">
         <span className="admin-icon-tile">API</span>
         <CardTitle>API Access & Integration Keys</CardTitle>
        </div>
        <CardDescription>
         Manage public API access, rate limits, and authentication keys for the Growthbridge platform.
        </CardDescription>
       </CardHeader>
       <CardContent className="space-y-6">
        <div className="flex items-center justify-between p-4 rounded-xl bg-[var(--admin-surface-soft)] bg-[var(--admin-surface-card)] border border-[var(--admin-border)] ">
         <div>
          <div className="text-sm font-semibold text-[var(--admin-text-primary)] ">Public Headless API</div>
          <div className="text-xs text-[var(--admin-text-tertiary)]">Allow third-party mobile or web apps to consume public endpoints.</div>
         </div>
         <input
          type="checkbox"
          checked={settings.api.enablePublicApi}
          onChange={(e) => updateApiField('enablePublicApi', e.target.checked)}
          className="w-5 h-5 accent-[var(--gb-green-700)] rounded cursor-pointer"
         />
        </div>

        <div>
         <label className="text-xs font-semibold text-[var(--admin-text-secondary)] mb-1 block">
          Rate Limit (Requests per Minute per IP)
         </label>
         <Input
          type="number"
          value={settings.api.rateLimitPerMinute}
          onChange={(e) => updateApiField('rateLimitPerMinute', Number(e.target.value))}
         />
        </div>

        <div className="space-y-3">
         <label className="text-xs font-bold uppercase tracking-wider text-[var(--admin-text-secondary)] block">
          Active Backend API Keys
         </label>
         <div className="space-y-2">
          {(settings.api.apiKeys || []).map((k) => (
           <div
            key={k.id}
            className="flex items-center justify-between p-3.5 rounded-xl border border-[var(--admin-border)] bg-[var(--admin-surface-card)] "
           >
            <div>
             <div className="text-sm font-semibold text-[var(--admin-text-primary)] ">{k.name}</div>
             <div className="text-xs font-mono text-[var(--admin-text-secondary)] mt-0.5">{k.key}</div>
            </div>
            <Badge className="bg-[var(--gb-green-600)]/10 text-emerald-600 text-[var(--gb-green-400)]">Active</Badge>
           </div>
          ))}
         </div>
        </div>
       </CardContent>
      </Card>
     )}
    </div>
   </div>
  </div>
 );
}
