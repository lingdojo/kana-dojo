import createMiddleware from 'next-intl/middleware';
import { NextRequest, NextResponse } from 'next/server';
import { routing } from './core/i18n/routing';

// Create intl middleware once at module level (more efficient)
const intlMiddleware = createMiddleware(routing);

export default function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Fast path - skip for paths that don't need locale handling
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

  // Extract locale from pathname (URLs have /en/ or /es/ prefixes)
  const localeMatch = pathname.match(/^\/(en|es)/);
  const locale = localeMatch ? localeMatch[1] : 'en';

  // Use next-intl middleware for locale handling
  const response = intlMiddleware(request);
  response.headers.set('x-locale', locale);

  return response;
}

export const config = {
  // More restrictive matcher - only match actual page routes
  // Excludes: api, _next, _vercel, static files, and common bot endpoints
  matcher: ['/((?!api|_next|_vercel|monitoring|healthcheck|.*\\..*).*)'],
};
