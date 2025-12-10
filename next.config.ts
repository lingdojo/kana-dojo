import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./core/i18n/request.ts');

const isDev = process.env.NODE_ENV !== 'production';

const nextConfig: NextConfig = {
  // Performance optimizations
  reactStrictMode: false, // Disable in dev for faster startup (enable in production)

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
      'class-variance-authority'
    ],
    // Faster builds
    webpackBuildWorker: true,
    // Turbo-specific optimizations
    turbo: {
      // Resolve aliases for faster module resolution
      resolveAlias: {
        '@/features': './features',
        '@/shared': './shared',
        '@/core': './core'
      }
    }
  },

  // Reduce overhead in development
  devIndicators: false,

  // Optimize images
  images: {
    formats: ['image/avif', 'image/webp']
  },

  // Skip type checking during dev (run separately with `npm run check`)
  typescript: {
    ignoreBuildErrors: isDev
  },

  // Skip ESLint during dev builds
  eslint: {
    ignoreDuringBuilds: isDev
  },

  // Cache headers for static assets
  async headers() {
    return [
      {
        source: '/sounds/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable'
          }
        ]
      }
    ];
  }
};

export default withNextIntl(nextConfig);
