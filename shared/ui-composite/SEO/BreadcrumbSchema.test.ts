import { afterEach, describe, expect, it } from 'vitest';
import { generateBreadcrumbSchema } from './BreadcrumbSchema';

const originalSiteUrl = process.env.NEXT_PUBLIC_SITE_URL;

afterEach(() => {
  if (originalSiteUrl === undefined) {
    delete process.env.NEXT_PUBLIC_SITE_URL;
  } else {
    process.env.NEXT_PUBLIC_SITE_URL = originalSiteUrl;
  }
});

describe('generateBreadcrumbSchema', () => {
  it('resolves relative paths against the canonical site URL', () => {
    delete process.env.NEXT_PUBLIC_SITE_URL;

    const schema = generateBreadcrumbSchema([
      { name: 'Home', url: '/' },
      { name: 'Kana', url: '/kana' },
    ]);

    expect(schema.itemListElement).toEqual([
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: 'https://kanadojo.com/',
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Kana',
        item: 'https://kanadojo.com/kana',
      },
    ]);
  });

  it('preserves absolute URLs', () => {
    const schema = generateBreadcrumbSchema([
      { name: 'Kanji', url: 'https://example.com/kanji' },
    ]);

    expect(schema.itemListElement[0].item).toBe('https://example.com/kanji');
  });

  it('uses the configured public site URL', () => {
    process.env.NEXT_PUBLIC_SITE_URL = 'https://preview.example.com';

    const schema = generateBreadcrumbSchema([
      { name: 'Academy', url: '/academy' },
    ]);

    expect(schema.itemListElement[0]).toMatchObject({
      position: 1,
      name: 'Academy',
      item: 'https://preview.example.com/academy',
    });
  });
});
