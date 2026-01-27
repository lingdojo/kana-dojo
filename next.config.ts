import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';
import bundleAnalyzer from '@next/bundle-analyzer';

const withNextIntl = createNextIntlPlugin('./core/i18n/request.ts');
const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
});

const isDev = process.env.NODE_ENV !== 'production';

const nextConfig: NextConfig = {
  // Performance optimizations
  reactStrictMode: true,
  compress: false, // Let Vercel handle compression
  poweredByHeader: false, // Remove X-Powered-By header for security
  generateEtags: true, // Generate ETags for better caching

  // Disable instrumentation in development
  // instrumentationHook: !isDev,

  // Compiler optimizations
  compiler: {
    removeConsole: !isDev ? { exclude: ['error', 'warn'] } : false,
  },

  // Experimental features for better performance
  experimental: {
    // Faster builds
    // webpackBuildWorker: true
  },

  // Turbopack configuration (moved from experimental.turbo in Next.js 15)
  turbopack: {
    // Resolve aliases for faster module resolution
    resolveAlias: {
      '@/features': './features',
      '@/shared': './shared',
      '@/core': './core',
    },
  },

  // Reduce overhead in development
  devIndicators: false,

  // Optimize images
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 31536000, // 1 year cache for optimized images
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'avatars.githubusercontent.com',
        pathname: '/u/**',
      },
    ],
  },

  // Skip type checking during dev (run separately with `npm run check`)
  typescript: {
    ignoreBuildErrors: isDev,
  },

  // Skip ESLint during dev builds
  eslint: {
    ignoreDuringBuilds: isDev,
  },

  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...(config.resolve.fallback ?? {}),
        fs: false,
        path: false,
      };
    }
    return config;
  },

  // Cache headers for static assets - reduces data transfer and edge requests
  async headers() {
    return [
      {
        // Security headers for all routes (enhances Bing trust signals)
        source: '/:path*',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'interest-cohort=()',
          },
        ],
      },
      {
        // Audio files - immutable, cache forever
        source: '/sounds/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        // Kanji JSON data files - cache for 1 week
        source: '/data-kanji/:path*.json',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=604800, stale-while-revalidate=86400',
          },
        ],
      },
      {
        // Vocab JSON data files - cache for 1 week
        source: '/data-vocab/:path*.json',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=604800, stale-while-revalidate=86400',
          },
        ],
      },
      {
        // Japan facts JSON - cache for 1 week
        source: '/japan-facts.json',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=604800, stale-while-revalidate=86400',
          },
        ],
      },
      {
        // Wallpapers and images - immutable
        source: '/wallpapers/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        // Manifest and other static files
        source: '/manifest.json',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=86400, stale-while-revalidate=3600',
          },
        ],
      },
    ];
  },
};

export default withBundleAnalyzer(withNextIntl(nextConfig));
