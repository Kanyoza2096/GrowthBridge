// src/repositories/settings.repository.ts
import 'server-only';
import { createServerClient, createAdminClient } from '@/lib/supabase/server';
import type { Settings } from '@/lib/types/admin';

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
};

export class SettingsRepository {
  async getSettings(): Promise<Settings> {
    const supabase = await createServerClient();
    const { data, error } = await supabase
      .from('site_settings')
      .select('value')
      .eq('key', 'general')
      .single();

    if (error || !data) {
      return defaultSettings;
    }
    return { ...defaultSettings, ...(data.value as object) };
  }

  async updateSettings(patch: Partial<Settings>): Promise<Settings> {
    const current = await this.getSettings();
    const merged = { ...current, ...patch };

    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from('site_settings')
      .upsert({
        key: 'general',
        value: merged as any,
        updated_at: new Date().toISOString(),
      })
      .select('value')
      .single();

    if (error) throw error;
    return (data?.value as Settings) || merged;
  }
}
