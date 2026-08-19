// SEO metadata defaults

import { publicConfig } from '@/lib/config/public';

export const defaultSeo = {
  title: {
    default: publicConfig.NEXT_PUBLIC_SITE_NAME,
    template: `%s | ${publicConfig.NEXT_PUBLIC_SITE_NAME}`,
  },
  description: 'Youth Skills. Digital Solutions. Stronger Communities. Growthbridge empowers young talent through digital solutions and community-driven initiatives.',
  keywords: [
    'Growthbridge',
    'youth empowerment',
    'digital solutions',
    'community development',
    'talent hub',
    'web development',
    'South Africa',
    'skills development',
    'technology',
    'innovation',
  ],
  openGraph: {
    type: 'website' as const,
    locale: 'en_US',
    url: publicConfig.NEXT_PUBLIC_SITE_URL,
    siteName: publicConfig.NEXT_PUBLIC_SITE_NAME,
    title: publicConfig.NEXT_PUBLIC_SITE_NAME,
    description: 'Youth Skills. Digital Solutions. Stronger Communities. Growthbridge empowers young talent through digital solutions and community-driven initiatives.',
  },
  twitter: {
    card: 'summary_large_image' as const,
    title: publicConfig.NEXT_PUBLIC_SITE_NAME,
    description: 'Youth Skills. Digital Solutions. Stronger Communities. Growthbridge empowers young talent through digital solutions and community-driven initiatives.',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large' as const,
      'max-snippet': -1,
    },
  },
};

export const pageSeo = {
  home: {
    title: 'Bridging Skills. Driving Growth.',
    description:
      'Growthbridge Virtual Organization empowers youth through digital solutions, skills development, and community-driven initiatives. Build your future with us.',
  },
  about: {
    title: 'About Us',
    description:
      'Learn about Growthbridge Virtual Organization — our vision, mission, core values, and the team driving youth empowerment and digital innovation.',
  },
  services: {
    title: 'Our Services',
    description:
      'Explore Growthbridge services: Digital Solutions, Business Consulting, People & Talent, Community Impact, and Events & Training.',
  },
  projects: {
    title: 'Our Projects',
    description:
      'View our portfolio of impactful projects — from web applications and mobile apps to community programs and training initiatives.',
  },
  talentHub: {
    title: 'Talent Hub',
    description:
      'Discover skilled young professionals ready to contribute. Browse our talent marketplace for developers, designers, marketers, and more.',
  },
  blog: {
    title: 'Blog & Knowledge Hub',
    description:
      'Insights on technology, community development, entrepreneurship, and skills building from the Growthbridge team.',
  },
  contact: {
    title: 'Contact Us',
    description:
      'Get in touch with Growthbridge. Whether you need digital solutions, want to partner, or are looking to join our team — we\'d love to hear from you.',
  },
};
