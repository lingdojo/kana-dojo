// @vitest-environment node
import { describe, it, expect, afterEach, beforeEach, vi } from 'vitest';
import { renderToString } from 'react-dom/server';

vi.mock('next/navigation', () => ({
  useSearchParams: () => new URLSearchParams(),
}));

// next-intl's navigation helpers can't be loaded outside Next.js, so stub the
// app's routing module (same approach as other component tests).
vi.mock('@/core/i18n/routing', () => ({
  routing: { locales: ['en'], defaultLocale: 'en', localePrefix: 'never' },
  Link: ({
    children,
    prefetch: _prefetch,
    ...props
  }: React.AnchorHTMLAttributes<HTMLAnchorElement> & {
    prefetch?: boolean;
  }) => <a {...props}>{children}</a>,
  usePathname: () => '/translate',
  useRouter: () => ({ push: () => {}, replace: () => {}, prefetch: () => {} }),
  redirect: () => {},
  getPathname: () => '/translate',
}));

describe('Translator server rendering', () => {
  beforeEach(() => {
    // Node.js 21+ defines a global navigator without onLine. Set it before the
    // translator modules load, because the store used to read it at import time.
    vi.stubGlobal('navigator', {
      userAgent: 'Node.js/24',
      hardwareConcurrency: 8,
    });
    vi.resetModules();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('renders the page as online when navigator has no onLine', async () => {
    expect(typeof window).toBe('undefined');
    expect('onLine' in globalThis.navigator).toBe(false);

    const { default: TranslatorPage } =
      await import('../components/TranslatorPage');
    const html = renderToString(<TranslatorPage />);

    const textarea = html.match(/<textarea\b[^>]*>/)?.[0];
    expect(textarea).toBeDefined();
    expect(textarea).not.toMatch(/\sdisabled(=|\s|>)/);

    expect(html).not.toContain('lucide-wifi-off');
    expect(html).not.toContain('You are offline');
    // Importing the full page module graph is slow on a cold transform cache.
  }, 30_000);
});
