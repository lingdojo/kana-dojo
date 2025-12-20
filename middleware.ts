import createMiddleware from 'next-intl/middleware';
import { NextRequest, NextResponse } from 'next/server';
import { routing } from './core/i18n/routing';

const isDev = process.env.NODE_ENV !== 'production';

// In production, use full next-intl middleware
// In dev with single locale, use minimal custom middleware for performance
const intlMiddleware = !isDev ? createMiddleware(routing) : null;

export default function middleware(request: NextRequest) {
  if (isDev) {
    // Minimal dev middleware - only handles URL rewriting for single locale
    // This avoids the overhead of createMiddleware() while maintaining functionality
    const { pathname } = request.nextUrl;

    // Skip special paths that don't need locale handling
    if (
      pathname.startsWith('/_next') ||
      pathname.startsWith('/api') ||
      pathname.startsWith('/_vercel') ||
      pathname.startsWith('/monitoring') ||
      pathname.startsWith('/healthcheck') ||
      pathname.includes('.')
    ) {
      return NextResponse.next();
    }

    // For all other requests, rewrite to include the default locale
    // This matches app/[locale] structure with locale='en'
    const url = request.nextUrl.clone();
    url.pathname = `/en${pathname}`;

    // Use rewrite (not redirect) to keep URL clean
    return NextResponse.rewrite(url);
  }

  // Production: use full next-intl middleware with all features
  return intlMiddleware!(request);
}

export const config = {
  // More restrictive matcher - only match actual page routes
  // Excludes: api, _next, _vercel, static files, and common bot endpoints
  matcher: ['/((?!api|_next|_vercel|monitoring|healthcheck|.*\\..*).*)']
};
