import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Security: hide the X-Powered-By header
  poweredByHeader: false,

  // React Strict Mode in development
  reactStrictMode: true,

  // Enable gzip/brotli compression
  compress: true,

  // Generate ETags for cache validation
  generateEtags: true,

  // Source maps in production (disabled — enable + upload to Sentry if needed)
  productionBrowserSourceMaps: false,

  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'res.cloudinary.com' },
      // Supabase Storage — replace YOUR_PROJECT_REF with your actual project ref
      { protocol: 'https', hostname: '*.supabase.co' },
      { protocol: 'https', hostname: '*.supabase.in' },
    ],
    formats: ['image/webp', 'image/avif'],
    minimumCacheTTL: 604800, // 7 days
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },

  experimental: {
    optimizePackageImports: [
      'lucide-react',
      'motion',
      '@tanstack/react-query',
    ],
  },
};

export default nextConfig;
