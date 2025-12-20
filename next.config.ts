import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';
import bundleAnalyzer from '@next/bundle-analyzer';

const withNextIntl = createNextIntlPlugin('./core/i18n/request.ts');
const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === 'true'
});

const isDev = process.env.NODE_ENV !== 'production';

const nextConfig: NextConfig = {
  // Performance optimizations
  reactStrictMode: false, // Disable in dev for faster startup (enable in production)
  // swcMinify removed - enabled by default in Next.js 13+
  compress: true, // Enable gzip/brotli compression
  poweredByHeader: false, // Remove X-Powered-By header for security
  generateEtags: true, // Generate ETags for better caching

  // Disable instrumentation in development
  // instrumentationHook: !isDev,

  // Compiler optimizations
  compiler: {
    removeConsole: !isDev ? { exclude: ['error', 'warn'] } : false
  },

  // Experimental features for better performance
  experimental: {
    // Use optimized package imports
    optimizePackageImports: [
      'framer-motion',
      'lucide-react',
      '@fortawesome/react-fontawesome',
      '@fortawesome/free-solid-svg-icons',
      '@fortawesome/free-regular-svg-icons',
      '@fortawesome/free-brands-svg-icons',
      '@radix-ui/react-select',
      'zustand',
      'clsx',
      'class-variance-authority',
      'wanakana'
    ],
    // Faster builds
    webpackBuildWorker: true
  },

  // Turbopack configuration (moved from experimental.turbo in Next.js 15)
  turbopack: {
    // Resolve aliases for faster module resolution
    resolveAlias: {
      '@/features': './features',
      '@/shared': './shared',
      '@/core': './core'
    }
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
        pathname: '/u/**'
      }
    ]
  },

  // Skip type checking during dev (run separately with `npm run check`)
  typescript: {
    ignoreBuildErrors: isDev
  },

  // Skip ESLint during dev builds
  eslint: {
    ignoreDuringBuilds: isDev
  },

  // Cache headers for static assets - reduces data transfer and edge requests
  async headers() {
    return [
      {
        // Audio files - immutable, cache forever
        source: '/sounds/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable'
          }
        ]
      },
      {
        // JSON data files (kanji, vocab, facts) - cache for 1 week
        source: '/:path*.json',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=604800, stale-while-revalidate=86400'
          }
        ]
      },
      {
        // Wallpapers and images - immutable
        source: '/wallpapers/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable'
          }
        ]
      },
      {
        // Manifest and other static files
        source: '/manifest.json',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=86400, stale-while-revalidate=3600'
          }
        ]
      }
    ];
  }
};

export default withBundleAnalyzer(withNextIntl(nextConfig));
