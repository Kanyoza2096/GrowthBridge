// src/repositories/settings.repository.ts
import { createServerClient, createAdminClient } from '@/lib/supabase/server';
import type { Settings } from '@/lib/types/admin';
import type { Json } from '@/lib/supabase/database.types';

const defaultSettings: Settings = {
  organization: {
    name: 'Growthbridge Virtual Organization',
    tagline: 'Bridging Opportunities, Empowering Growth',
    description: 'Catalyzing innovation and community development across Africa and beyond.',
    logo: '/images/logo.png',
    address: 'Virtual HQ',
    phone: '+250 788 000 000',
    email: 'hello@growthbridge.org',
  },
  social: {
    linkedin: 'https://linkedin.com/company/growthbridge',
    twitter: 'https://twitter.com/growthbridge',
    facebook: 'https://facebook.com/growthbridge',
    instagram: 'https://instagram.com/growthbridge',
  },
  seo: {
    defaultTitle: 'Growthbridge | Bridging Opportunities',
    defaultDescription: 'Catalyzing innovation, youth empowerment, and technological advancement.',
    defaultKeywords: ['Growthbridge', 'Africa', 'Tech', 'Talent', 'Innovation'],
  },
  email: {
    fromAddress: 'hello@growthbridge.org',
    fromName: 'Growthbridge',
  },
  api: {
    enablePublicApi: true,
    rateLimitPerMinute: 60,
    apiKeys: [],
  },
  features: {
    enableTalentHub: true,
    enableBlog: true,
    enablePartnerPortal: true,
    enableAIAssistant: false,
    enableAnalytics: true,
    maintenanceMode: false,
  },
  homepage: {
    heroImage: '',
    heroHeadline: "Bridging Skills. Driving Growth.",
    heroSubheadline:
      'Growthbridge connects young talent with real projects that grow businesses and communities across Africa.',
  },
};

export class SettingsRepository {
  async getSettings(useAdminClient = false): Promise<Settings> {
    let storedValue: Json | null = null;
    if (useAdminClient) {
      const { data, error } = await createAdminClient()
        .from('site_settings').select('value').eq('key', 'general').maybeSingle();
      if (error) throw error;
      storedValue = data?.value ?? null;
    } else {
      const supabase = await createServerClient();
      const { data, error } = await supabase
        .from('site_settings').select('value').eq('key', 'general').maybeSingle();
      if (error) throw error;
      storedValue = data?.value ?? null;
    }

    if (!storedValue) return defaultSettings;
    const stored = storedValue as unknown as Partial<Settings> & { api?: Partial<Settings['api']> };
    return {
      ...defaultSettings,
      ...stored,
      organization: { ...defaultSettings.organization, ...(stored.organization || {}) },
      social: { ...defaultSettings.social, ...(stored.social || {}) },
      seo: { ...defaultSettings.seo, ...(stored.seo || {}) },
      email: { ...defaultSettings.email, ...(stored.email || {}) },
      api: { ...defaultSettings.api, ...(stored.api || {}), apiKeys: [] },
      features: { ...defaultSettings.features, ...(stored.features || {}) },
      homepage: { ...defaultSettings.homepage, ...(stored.homepage || {}) },
    };
  }

  async updateSettings(patch: Partial<Settings>, updatedBy?: string): Promise<Settings> {
    const current = await this.getSettings();
    const merged: Settings = {
      ...current,
      ...patch,
      organization: { ...current.organization, ...(patch.organization || {}) },
      social: { ...current.social, ...(patch.social || {}) },
      seo: { ...current.seo, ...(patch.seo || {}) },
      email: { ...current.email, ...(patch.email || {}) },
      api: {
        ...current.api,
        ...(patch.api || {}),
        // Keys are intentionally excluded from site settings.
        apiKeys: [],
      },
      features: { ...current.features, ...(patch.features || {}) },
      homepage: { ...current.homepage, ...(patch.homepage || {}) },
    };

    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from('site_settings')
      .upsert({
        key: 'general',
        value: merged as unknown as Json,
        updated_by: updatedBy,
        updated_at: new Date().toISOString(),
      })
      .select('value')
      .single();

    if (error) throw error;
    return (data?.value as unknown as Settings) || merged;
  }
}
