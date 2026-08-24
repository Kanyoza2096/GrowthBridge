'use client';

import React, { useState, useEffect } from 'react';
import { getBackendProvider } from '@/lib/api/providers';
import type { Settings } from '@/lib/types/admin';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Badge } from '@/components/ui/Badge';
import { cn } from '@/lib/utils';

type TabId = 'branding' | 'social' | 'seo' | 'features' | 'api' | 'email';

const TABS: { id: TabId; label: string; icon: string; description: string }[] = [
  { id: 'branding', label: 'Organization & Logo', icon: '🎨', description: 'Logo, site identity, organization name, address, and contact info.' },
  { id: 'social', label: 'Social Media', icon: '🌐', description: 'Official social profiles and external platform links.' },
  { id: 'seo', label: 'SEO & Metadata', icon: '🔍', description: 'Default search titles, meta descriptions, keywords, and OpenGraph images.' },
  { id: 'features', label: 'Dynamic Features', icon: '⚡', description: 'Enable/disable platform modules and maintenance mode.' },
  { id: 'email', label: 'Email & SMTP', icon: '✉️', description: 'Sender identities, notification addresses, and SMTP configuration.' },
  { id: 'api', label: 'API & Keys', icon: '🔑', description: 'Public API settings, rate limits, and authentication keys.' },
];

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [activeTab, setActiveTab] = useState<TabId>('branding');
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [newKeyword, setNewKeyword] = useState<string>('');

  useEffect(() => {
    async function loadSettings() {
      setLoading(true);
      try {
        const provider = getBackendProvider();
        const data = provider.getSettings ? await provider.getSettings() : null;
        if (data) {
          setSettings(data);
        }
      } catch (err) {
        console.error('Failed to load settings:', err);
      } finally {
        setLoading(false);
      }
    }
    loadSettings();
  }, []);

  const handleSave = async () => {
    if (!settings) return;
    setSaving(true);
    setToastMessage(null);

    try {
      const provider = getBackendProvider();
      if (provider.updateSettings) {
        const updated = await provider.updateSettings(settings);
        setSettings(updated);
      }
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
        <div className="h-8 w-64 bg-slate-200 dark:bg-slate-800 rounded animate-pulse" />
        <div className="h-4 w-96 bg-slate-200 dark:bg-slate-800 rounded animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 pt-6">
          <div className="h-64 bg-slate-200 dark:bg-slate-800 rounded-xl animate-pulse" />
          <div className="md:col-span-3 h-96 bg-slate-200 dark:bg-slate-800 rounded-xl animate-pulse" />
        </div>
      </div>
    );
  }

  if (!settings) {
    return (
      <div className="p-8 text-center space-y-4">
        <p className="text-slate-500">Failed to load platform settings.</p>
        <Button onClick={() => window.location.reload()}>Retry</Button>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-3">
            <span className="text-2xl">⚡</span>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Platform Settings</h1>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Manage global platform configuration, branding, dynamic features, and API integrations.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {toastMessage && (
            <div
              className={cn(
                'text-xs font-semibold px-3 py-2 rounded-lg transition-all animate-fade-in',
                toastMessage.type === 'success' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20' : 'bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20'
              )}
            >
              {toastMessage.text}
            </div>
          )}
          <Button
            onClick={handleSave}
            disabled={saving}
            className="bg-[#1F8A3F] hover:bg-[#166F33] text-white shadow-md font-semibold px-6"
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
                    ? 'bg-[#0B2A5A] text-white border-[#0B2A5A] shadow-md dark:bg-emerald-600 dark:border-emerald-600'
                    : 'bg-white dark:bg-slate-900/50 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                )}
              >
                <span className="text-xl flex-shrink-0 mt-0.5">{tab.icon}</span>
                <div>
                  <div className={cn('text-sm font-semibold', active ? 'text-white' : 'text-slate-900 dark:text-white')}>
                    {tab.label}
                  </div>
                  <div className={cn('text-xs line-clamp-1 mt-0.5', active ? 'text-white/80' : 'text-slate-500 dark:text-slate-400')}>
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
                  <span className="text-xl">🎨</span>
                  <CardTitle>Organization & Branding</CardTitle>
                </div>
                <CardDescription>
                  Configure site identity, organization name, primary logo, physical location, and main contact info.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Logo Section with Live Preview */}
                <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-4">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                    Platform Logo & Branding Mark
                  </label>
                  <div className="flex flex-col sm:flex-row items-center gap-6">
                    {/* Live Preview Box */}
                    <div className="flex flex-col items-center justify-center p-4 w-44 h-28 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 shadow-sm text-center">
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
                        <div className="flex items-center gap-2 font-extrabold text-[#0B2A5A] dark:text-emerald-400 text-lg">
                          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#0B2A5A] to-[#1F8A3F] flex items-center justify-center text-white font-black text-sm">
                            GB
                          </div>
                          GROWTHBRIDGE
                        </div>
                      )}
                      <span className="text-[10px] text-slate-400 mt-2 font-medium">Live Header Preview</span>
                    </div>

                    {/* Logo Input Fields */}
                    <div className="flex-1 space-y-3 w-full">
                      <div>
                        <label className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-1 block">
                          Logo Image URL / Path
                        </label>
                        <Input
                          value={settings.organization.logo || ''}
                          onChange={(e) => updateOrgField('logo', e.target.value)}
                          placeholder="/logo.svg or https://example.com/logo.png"
                        />
                      </div>
                      <p className="text-xs text-slate-500">
                        Recommended size: 240x60px. Supports SVG, PNG, SVG with transparent background.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 block">
                      Organization Name
                    </label>
                    <Input
                      value={settings.organization.name}
                      onChange={(e) => updateOrgField('name', e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 block">
                      Slogan / Tagline
                    </label>
                    <Input
                      value={settings.organization.tagline}
                      onChange={(e) => updateOrgField('tagline', e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 block">
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
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 block">
                      Official Contact Email
                    </label>
                    <Input
                      type="email"
                      value={settings.organization.email}
                      onChange={(e) => updateOrgField('email', e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 block">
                      Official Phone Line
                    </label>
                    <Input
                      value={settings.organization.phone}
                      onChange={(e) => updateOrgField('phone', e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 block">
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
                  <span className="text-xl">🌐</span>
                  <CardTitle>Social Media Profiles</CardTitle>
                </div>
                <CardDescription>
                  Links to Growthbridge official social media handles displayed across the header and footer.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 block flex items-center gap-2">
                    <span>LinkedIn Page URL</span>
                  </label>
                  <Input
                    value={settings.social.linkedin || ''}
                    onChange={(e) => updateSocialField('linkedin', e.target.value)}
                    placeholder="https://linkedin.com/company/growthbridge"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 block flex items-center gap-2">
                    <span>Twitter / X Profile URL</span>
                  </label>
                  <Input
                    value={settings.social.twitter || ''}
                    onChange={(e) => updateSocialField('twitter', e.target.value)}
                    placeholder="https://twitter.com/growthbridge"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 block flex items-center gap-2">
                    <span>Facebook Page URL</span>
                  </label>
                  <Input
                    value={settings.social.facebook || ''}
                    onChange={(e) => updateSocialField('facebook', e.target.value)}
                    placeholder="https://facebook.com/growthbridge"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 block flex items-center gap-2">
                    <span>Instagram Profile URL</span>
                  </label>
                  <Input
                    value={settings.social.instagram || ''}
                    onChange={(e) => updateSocialField('instagram', e.target.value)}
                    placeholder="https://instagram.com/growthbridge"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 block flex items-center gap-2">
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
                  <span className="text-xl">🔍</span>
                  <CardTitle>Search Engine Optimization & Metadata</CardTitle>
                </div>
                <CardDescription>
                  Global default meta titles, descriptions, open-graph image tags, and search index keywords.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 block">
                    Default Page Title
                  </label>
                  <Input
                    value={settings.seo.defaultTitle}
                    onChange={(e) => updateSeoField('defaultTitle', e.target.value)}
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 block">
                    Default Meta Description
                  </label>
                  <Textarea
                    rows={3}
                    value={settings.seo.defaultDescription}
                    onChange={(e) => updateSeoField('defaultDescription', e.target.value)}
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 block">
                    Default OpenGraph Social Preview Image URL
                  </label>
                  <Input
                    value={settings.seo.ogImage || ''}
                    onChange={(e) => updateSeoField('ogImage', e.target.value)}
                    placeholder="/images/og-growthbridge.jpg"
                  />
                </div>

                {/* Keywords Manager */}
                <div className="space-y-3">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">
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
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
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
                  <span className="text-xl">⚡</span>
                  <CardTitle>Dynamic Feature Modules & Maintenance</CardTitle>
                </div>
                <CardDescription>
                  Toggle dynamic features on or off in real-time across the Growthbridge public application.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Feature Toggles List */}
                <div className="divide-y divide-slate-100 dark:divide-slate-800">
                  <div className="py-4 flex items-center justify-between">
                    <div>
                      <div className="text-sm font-semibold text-slate-900 dark:text-white">Youth Talent Hub</div>
                      <div className="text-xs text-slate-500 dark:text-slate-400">
                        Enable youth candidate profile registration, skill browsing, and recruiter search.
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={settings.features.enableTalentHub}
                      onChange={(e) => updateFeatureToggle('enableTalentHub', e.target.checked)}
                      className="w-5 h-5 accent-[#1F8A3F] rounded cursor-pointer"
                    />
                  </div>

                  <div className="py-4 flex items-center justify-between">
                    <div>
                      <div className="text-sm font-semibold text-slate-900 dark:text-white">Blog & News Module</div>
                      <div className="text-xs text-slate-500 dark:text-slate-400">
                        Show news, updates, impact stories, and blog posts.
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={settings.features.enableBlog}
                      onChange={(e) => updateFeatureToggle('enableBlog', e.target.checked)}
                      className="w-5 h-5 accent-[#1F8A3F] rounded cursor-pointer"
                    />
                  </div>

                  <div className="py-4 flex items-center justify-between">
                    <div>
                      <div className="text-sm font-semibold text-slate-900 dark:text-white">Partner Portal</div>
                      <div className="text-xs text-slate-500 dark:text-slate-400">
                        Enable corporate partnership inquiries and partner logo showcases.
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={settings.features.enablePartnerPortal}
                      onChange={(e) => updateFeatureToggle('enablePartnerPortal', e.target.checked)}
                      className="w-5 h-5 accent-[#1F8A3F] rounded cursor-pointer"
                    />
                  </div>

                  <div className="py-4 flex items-center justify-between">
                    <div>
                      <div className="text-sm font-semibold text-slate-900 dark:text-white">Partner Logo Carousel & Marquee Banner</div>
                      <div className="text-xs text-slate-500 dark:text-slate-400">
                        Enable interactive marquee slider featuring corporate partners, sponsors, and innovation collaborators on the public home page.
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={settings.features.enablePartnerCarousel ?? true}
                      onChange={(e) => updateFeatureToggle('enablePartnerCarousel', e.target.checked)}
                      className="w-5 h-5 accent-[#1F8A3F] rounded cursor-pointer"
                    />
                  </div>

                  <div className="py-4 flex items-center justify-between">
                    <div>
                      <div className="text-sm font-semibold text-slate-900 dark:text-white">AI Growth Assistant</div>
                      <div className="text-xs text-slate-500 dark:text-slate-400">
                        Enable intelligent conversational chat for youth talent guidance and inquiries.
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={settings.features.enableAIAssistant}
                      onChange={(e) => updateFeatureToggle('enableAIAssistant', e.target.checked)}
                      className="w-5 h-5 accent-[#1F8A3F] rounded cursor-pointer"
                    />
                  </div>

                  <div className="py-4 flex items-center justify-between">
                    <div>
                      <div className="text-sm font-semibold text-slate-900 dark:text-white">Telemetry & Analytics</div>
                      <div className="text-xs text-slate-500 dark:text-slate-400">
                        Log anonymized system activity and pageview performance statistics.
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={settings.features.enableAnalytics}
                      onChange={(e) => updateFeatureToggle('enableAnalytics', e.target.checked)}
                      className="w-5 h-5 accent-[#1F8A3F] rounded cursor-pointer"
                    />
                  </div>

                  <div className="py-4 flex items-center justify-between bg-amber-500/5 p-4 rounded-xl border border-amber-500/20">
                    <div>
                      <div className="text-sm font-bold text-amber-600 dark:text-amber-400 flex items-center gap-2">
                        <span>⚠️ System Maintenance Mode</span>
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400">
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
                  <span className="text-xl">✉️</span>
                  <CardTitle>Email Notifications & SMTP Settings</CardTitle>
                </div>
                <CardDescription>
                  Configure outbound notification addresses and mail delivery credentials.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 block">
                      Sender Name
                    </label>
                    <Input
                      value={settings.email.fromName}
                      onChange={(e) => updateEmailField('fromName', e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 block">
                      Sender Email Address
                    </label>
                    <Input
                      type="email"
                      value={settings.email.fromAddress}
                      onChange={(e) => updateEmailField('fromAddress', e.target.value)}
                    />
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-200 dark:border-slate-800 space-y-4">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                    SMTP Server Configuration
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="sm:col-span-2">
                      <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 block">
                        SMTP Host
                      </label>
                      <Input
                        value={settings.email.smtpHost || ''}
                        onChange={(e) => updateEmailField('smtpHost', e.target.value)}
                        placeholder="smtp.sendgrid.net"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 block">
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
                  <span className="text-xl">🔑</span>
                  <CardTitle>API Access & Integration Keys</CardTitle>
                </div>
                <CardDescription>
                  Manage public REST API access, rate limits, and authentication bearer keys for Kanyoza/Supabase.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                  <div>
                    <div className="text-sm font-semibold text-slate-900 dark:text-white">Public Headless API</div>
                    <div className="text-xs text-slate-500">Allow third-party mobile or web apps to consume public endpoints.</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.api.enablePublicApi}
                    onChange={(e) => updateApiField('enablePublicApi', e.target.checked)}
                    className="w-5 h-5 accent-[#1F8A3F] rounded cursor-pointer"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 block">
                    Rate Limit (Requests per Minute per IP)
                  </label>
                  <Input
                    type="number"
                    value={settings.api.rateLimitPerMinute}
                    onChange={(e) => updateApiField('rateLimitPerMinute', Number(e.target.value))}
                  />
                </div>

                <div className="space-y-3">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 block">
                    Active Backend API Keys
                  </label>
                  <div className="space-y-2">
                    {(settings.api.apiKeys || []).map((k) => (
                      <div
                        key={k.id}
                        className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950"
                      >
                        <div>
                          <div className="text-sm font-semibold text-slate-900 dark:text-white">{k.name}</div>
                          <div className="text-xs font-mono text-slate-400 mt-0.5">{k.key}</div>
                        </div>
                        <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">Active</Badge>
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
