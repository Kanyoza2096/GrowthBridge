import { NextResponse } from 'next/server';
import { SettingsRepository } from '@/repositories/settings.repository';

/**
 * Safe, public subset of site settings for marketing pages.
 * Never exposes SMTP, API keys, or other secrets.
 */
export async function GET() {
  try {
    const settings = await new SettingsRepository().getSettings(true);
    return NextResponse.json(
      {
        success: true,
        data: {
          organization: {
            name: settings.organization.name,
            tagline: settings.organization.tagline,
            description: settings.organization.description,
            logo: settings.organization.logo || '',
          },
          homepage: {
            heroImage: settings.homepage?.heroImage || '',
            heroHeadline: settings.homepage?.heroHeadline || settings.organization.tagline,
            heroSubheadline:
              settings.homepage?.heroSubheadline || settings.organization.description,
            heroBadge: settings.homepage?.heroBadge || 'Youth talent · Digital execution · Community impact',
            primaryCtaLabel: settings.homepage?.primaryCtaLabel || 'Start a conversation',
            primaryCtaUrl: settings.homepage?.primaryCtaUrl || '/contact',
            secondaryCtaLabel: settings.homepage?.secondaryCtaLabel || 'See our work',
            secondaryCtaUrl: settings.homepage?.secondaryCtaUrl || '/projects',
            trustItems: settings.homepage?.trustItems || [],
            bridgeSlides: settings.homepage?.bridgeSlides || [],
            bridgeAutoplayMs: settings.homepage?.bridgeAutoplayMs || 6000,
            chatTitle: settings.homepage?.chatTitle || 'Growthbridge Assistant',
            chatWelcome: settings.homepage?.chatWelcome || 'Hello! Welcome to Growthbridge. How can we help?',
            chatContactEmail: settings.homepage?.chatContactEmail || settings.organization.email,
          },
          seo: {
            ogImage: settings.seo.ogImage || '',
          },
          features: {
            enablePartnerCarousel: settings.features.enablePartnerCarousel ?? true,
            enableBlog: settings.features.enableBlog,
            enableTalentHub: settings.features.enableTalentHub,
          },
        },
      },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
        },
      }
    );
  } catch (e) {
    return NextResponse.json(
      {
        success: false,
        data: {
          organization: {
            name: 'Growthbridge',
            tagline: 'Bridging Skills. Driving Growth.',
            description: '',
            logo: '',
          },
          homepage: { heroImage: '', heroHeadline: '', heroSubheadline: '' },
          seo: { ogImage: '' },
        },
        error: e instanceof Error ? e.message : 'Unavailable',
      },
      { status: 200 }
    );
  }
}
