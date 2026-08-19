import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Security: hide the X-Powered-By header to avoid leaking stack info
  poweredByHeader: false,

  // Enables React's Strict Mode in development (double-renders to surface bugs)
  reactStrictMode: true,

  // Enable gzip/brotli compression for all responses
  compress: true,

  // Generate ETags for cache validation
  generateEtags: true,

  // Source maps in production — enabled so error tracking tools (Sentry, etc.)
  // can resolve minified stack traces to original source lines.
  // If bundle size is a concern, use hidden-source-map and upload to your
  // error tracking service instead of serving publicly.
  productionBrowserSourceMaps: false,

  // ESLint MUST run during builds. Shipping with lint errors is how
  // undefined variables, unused imports, and React hooks violations
  // reach production. Fix the lint errors, don't ignore them.
  // eslint: { ignoreDuringBuilds: true }, // ← REMOVED

  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'res.cloudinary.com' },
      // cdn.growthbridge.org — REMOVED. This domain doesn't exist yet.
      // When the CDN is provisioned, add it back:
      // { protocol: 'https', hostname: 'cdn.growthbridge.org' },
    ],
    formats: ['image/webp', 'image/avif'],
    // Reduced from 1 year to 1 week. Images can still be cached aggressively
    // via CDN headers, but this prevents Next.js from serving year-old stale
    // images when the source changes. If you have truly immutable assets,
    // set a longer TTL on those specific images via their source headers.
    minimumCacheTTL: 604800, // 7 days in seconds
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
