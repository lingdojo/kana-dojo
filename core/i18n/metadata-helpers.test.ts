import { describe, expect, it, vi } from 'vitest';

vi.mock('@/core/i18n/routing', () => ({
  routing: {
    locales: ['en', 'es'],
    defaultLocale: 'en',
    localePrefix: 'never',
  },
}));

vi.mock('next-intl/server', () => ({
  getTranslations: vi.fn(async () =>
    ((key: string) => {
      if (key.endsWith('.title')) return 'Sample Title';
      if (key.endsWith('.titleShort')) return 'Sample Title Short';
      if (key.endsWith('.description')) return 'Sample description for metadata';
      if (key.endsWith('.keywords')) return 'kana, kanji, vocabulary';
      return key;
    }) as (key: string) => string,
  ),
}));

import { generatePageMetadata } from '@/core/i18n/metadata-helpers';

describe('generatePageMetadata canonical + hreflang', () => {
  it('uses no locale prefix in canonical for localePrefix=never', async () => {
    const metadata = await generatePageMetadata('kana', {
      locale: 'es',
      pathname: '/kana',
      baseUrl: 'https://kanadojo.com/',
    });

    expect(metadata.alternates?.canonical).toBe('https://kanadojo.com/kana');
  });

  it('keeps locale alternates reciprocal and stable in no-prefix routing', async () => {
    const metadata = await generatePageMetadata('kanjiJlptN5', {
      locale: 'en',
      pathname: '/kanji/jlpt-n5',
      baseUrl: 'https://kanadojo.com',
    });

    expect(metadata.alternates?.languages).toEqual({
      en: 'https://kanadojo.com/kanji/jlpt-n5',
      es: 'https://kanadojo.com/kanji/jlpt-n5',
      'x-default': 'https://kanadojo.com/kanji/jlpt-n5',
    });
  });

  it('normalizes unknown locale to canonical no-prefix URL', async () => {
    const metadata = await generatePageMetadata('vocabulary', {
      locale: 'fr',
      pathname: '/vocabulary',
      baseUrl: 'https://kanadojo.com',
    });

    expect(metadata.alternates?.canonical).toBe('https://kanadojo.com/vocabulary');
    expect(metadata.openGraph?.url).toBe('https://kanadojo.com/vocabulary');
  });
});
