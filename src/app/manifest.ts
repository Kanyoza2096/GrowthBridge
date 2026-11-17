import type { MetadataRoute } from 'next';
import { publicConfig } from '@/lib/config/public';

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: '/',
    name: 'GrowthBridge Virtual',
    short_name: 'GB Virtual',
    description: 'GrowthBridge Virtual — Bridging Skills. Driving Growth.',
    start_url: '/',
    scope: '/',
    display: 'standalone',
    display_override: ['standalone', 'minimal-ui'],
    orientation: 'portrait-primary',
    background_color: '#f8fafc',
    theme_color: '#123b5d',
    categories: ['business', 'education', 'productivity'],
    icons: [
      { src: '/icons/icon-192.svg', sizes: '192x192', type: 'image/svg+xml', purpose: 'any' },
      { src: '/icons/icon-512.svg', sizes: '512x512', type: 'image/svg+xml', purpose: 'any' },
      { src: '/icons/icon-maskable.svg', sizes: '512x512', type: 'image/svg+xml', purpose: 'maskable' },
    ],
  };
}
