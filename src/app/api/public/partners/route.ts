import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { SettingsRepository } from '@/repositories/settings.repository';

/**
 * Public partner logos for homepage marquee.
 * Only active partners; no emails/phones/notes.
 */
export async function GET() {
  try {
    const settings = await new SettingsRepository().getSettings(true);
    const enabled = settings.features.enablePartnerCarousel ?? true;
    if (!enabled) {
      return NextResponse.json({ success: true, data: [] });
    }

    const supabase = await createServerClient();
    const { data, error } = await supabase
      .from('partners')
      .select('id, organization_name, logo, website, industry, partnership_type, description, status')
      .eq('status', 'active')
      .order('organization_name', { ascending: true });

    if (error) throw error;

    const partners = (data || []).map((row) => {
      const name = row.organization_name || 'Partner';
      const initials = name
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .map((w: string) => w[0]?.toUpperCase() || '')
        .join('') || 'GB';
      return {
        id: row.id,
        name,
        category: row.partnership_type || row.industry || 'Partner',
        logoUrl: row.logo || undefined,
        initials,
        tagline: (row.description || row.industry || 'Ecosystem partner').slice(0, 120),
        website: row.website || '#',
        color: 'var(--gb-brand-navy)',
      };
    });

    return NextResponse.json(
      { success: true, data: partners },
      { headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300' } }
    );
  } catch (e) {
    return NextResponse.json(
      { success: true, data: [], error: e instanceof Error ? e.message : 'Unavailable' },
      { status: 200 }
    );
  }
}
