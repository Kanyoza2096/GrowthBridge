import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: '/',
    name: 'Growthbridge Virtual Organization',
    short_name: 'Growthbridge',
    description:
      'Youth skills, digital solutions, and stronger communities. Growthbridge connects talent with opportunities and drives community impact.',
    start_url: '/',
    scope: '/',
    display: 'standalone',
    display_override: ['standalone', 'minimal-ui'],
    orientation: 'any',
    background_color: '#ffffff',
    theme_color: '#123b35',
    lang: 'en',
    categories: ['business', 'education', 'productivity'],
    icons: [
      {
        src: '/icons/growthbridge-icon.svg',
        sizes: 'any',
        type: 'image/svg+xml',
        purpose: 'any',
      },
      {
        src: '/icons/growthbridge-icon-maskable.svg',
        sizes: 'any',
        type: 'image/svg+xml',
        purpose: 'maskable',
      },
    ],
  };
}
