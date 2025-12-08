import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin'

const withNextIntl = createNextIntlPlugin('./i18n/request.ts');

const nextConfig: NextConfig = {
  // allow next/image to load avatars from GitHub and related hosts
  images: {
    domains: ['avatars.githubusercontent.com', 'user-images.githubusercontent.com', 'github.com'],
    // alternatively, use remotePatterns for more control
    // remotePatterns: [
    //   { protocol: 'https', hostname: 'avatars.githubusercontent.com' },
    // ],
  },
};

export default withNextIntl(nextConfig);
