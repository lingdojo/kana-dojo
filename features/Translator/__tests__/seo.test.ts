import { describe, expect, it } from 'vitest';
import { buildTranslatorMetadata, buildTranslatorSchema } from '../lib/seo';

describe('translator SEO helpers', () => {
  it('builds canonical metadata without locale prefixes', () => {
    const metadata = buildTranslatorMetadata({
      pathname: '/translate/english-to-japanese',
      title: 'English to Japanese Translator Online',
      description: 'Translate English to Japanese online.',
      keywords: ['english to japanese translator'],
    });

    expect(metadata.alternates?.canonical).toBe(
      'https://kanadojo.com/translate/english-to-japanese',
    );
    expect(metadata.title).toBe('English to Japanese Translator Online');
    expect(String(metadata.alternates?.canonical)).not.toContain('/en/');
    expect(String(metadata.alternates?.canonical)).not.toContain('/es/');
  });

  it('builds schema graph with only no-prefix translator urls', () => {
    const schema = buildTranslatorSchema({
      pathname: '/translate',
      title: 'Japanese Translator with Romaji',
      description: 'Translate Japanese text online.',
      keywords: ['japanese translator'],
      includeSoftwareApplication: true,
      faq: [
        {
          question: 'Is this free?',
          answer: 'Yes.',
        },
      ],
    });

    const serialized = JSON.stringify(schema);
    expect(serialized).toContain('https://kanadojo.com/translate');
    expect(serialized).not.toContain('/en/translate');
    expect(serialized).not.toContain('/es/translate');
  });
});
