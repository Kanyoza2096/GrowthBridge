import type { NextConfig } from 'next';

const isProd = process.env.NODE_ENV === 'production';

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: !isProd,
  },
  typescript: {
    ignoreBuildErrors: !isProd,
  },
  poweredByHeader: false,
  compress: true,
  images: {
    // Allow optimized images from Supabase Storage (Admin → Media uploads)
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
      {
        protocol: 'https',
        hostname: '*.supabase.in',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
};

export default nextConfig;
