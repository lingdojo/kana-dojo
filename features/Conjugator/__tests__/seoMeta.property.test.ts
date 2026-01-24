/**
 * Property-Based Tests for SEO Meta Tag Generation
 *
 * **Feature: japanese-verb-conjugator, Property 18: Dynamic Meta Tag Generation**
 *
 * For any conjugated verb, the generated meta tags SHALL include the verb name
 * in the title and description, and the canonical URL SHALL match the verb parameter URL.
 *
 * **Validates: Requirements 13.3, 15.1, 15.2, 15.5**
 */

import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import {
  generateMeta,
  generateVerbMeta,
  generateCanonicalUrl,
  BASE_META,
} from '../lib/seo/generateMeta';
import type { VerbInfo } from '../types';

// ============================================================================
// Test Data - Sample Verbs
// ============================================================================

/**
 * Create a VerbInfo object for testing
 */
function createVerbInfo(
  dictionaryForm: string,
  reading: string,
  romaji: string,
  type: 'godan' | 'ichidan' | 'irregular',
  stem: string,
  ending: string,
  irregularType?: 'suru' | 'kuru' | 'aru' | 'iku' | 'honorific',
): VerbInfo {
  return {
    dictionaryForm,
    reading,
    romaji,
    type,
    stem,
    ending,
    irregularType,
  };
}

/**
 * Sample Godan verbs for testing
 */
const GODAN_VERB_INFOS: VerbInfo[] = [
  createVerbInfo('書く', 'かく', 'kaku', 'godan', 'か', 'く'),
  createVerbInfo('読む', 'よむ', 'yomu', 'godan', 'よ', 'む'),
  createVerbInfo('話す', 'はなす', 'hanasu', 'godan', 'はな', 'す'),
  createVerbInfo('待つ', 'まつ', 'matsu', 'godan', 'ま', 'つ'),
  createVerbInfo('買う', 'かう', 'kau', 'godan', 'か', 'う'),
];

/**
 * Sample Ichidan verbs for testing
 */
const ICHIDAN_VERB_INFOS: VerbInfo[] = [
  createVerbInfo('食べる', 'たべる', 'taberu', 'ichidan', 'たべ', 'る'),
  createVerbInfo('見る', 'みる', 'miru', 'ichidan', 'み', 'る'),
  createVerbInfo('起きる', 'おきる', 'okiru', 'ichidan', 'おき', 'る'),
  createVerbInfo('寝る', 'ねる', 'neru', 'ichidan', 'ね', 'る'),
];

/**
 * Sample Irregular verbs for testing
 */
const IRREGULAR_VERB_INFOS: VerbInfo[] = [
  createVerbInfo('する', 'する', 'suru', 'irregular', '', 'する', 'suru'),
  createVerbInfo('来る', 'くる', 'kuru', 'irregular', '', '来る', 'kuru'),
  createVerbInfo('ある', 'ある', 'aru', 'irregular', '', 'ある', 'aru'),
  createVerbInfo('行く', 'いく', 'iku', 'irregular', 'い', 'く', 'iku'),
];

/**
 * All sample verbs for testing
 */
const ALL_VERB_INFOS: VerbInfo[] = [
  ...GODAN_VERB_INFOS,
  ...ICHIDAN_VERB_INFOS,
  ...IRREGULAR_VERB_INFOS,
];

// ============================================================================
// Property 18: Dynamic Meta Tag Generation
// ============================================================================

describe('SEO Meta Tag Generation Properties', () => {
  /**
   * **Feature: japanese-verb-conjugator, Property 18: Dynamic Meta Tag Generation**
   *
   * For any conjugated verb, the generated meta tags SHALL include the verb name
   * in the title and description, and the canonical URL SHALL match the verb parameter URL.
   *
   * **Validates: Requirements 13.3, 15.1, 15.2, 15.5**
   */
  describe('Property 18: Dynamic Meta Tag Generation', () => {
    it('verb name appears in title for all verbs', () => {
      fc.assert(
        fc.property(fc.constantFrom(...ALL_VERB_INFOS), verb => {
          const meta = generateVerbMeta(verb);

          // Title should contain the dictionary form
          expect(meta.title).toContain(verb.dictionaryForm);

          // Title should also contain the romaji
          expect(meta.title).toContain(verb.romaji);
        }),
        { numRuns: 100 },
      );
    });

    it('verb name appears in description for all verbs', () => {
      fc.assert(
        fc.property(fc.constantFrom(...ALL_VERB_INFOS), verb => {
          const meta = generateVerbMeta(verb);

          // Description should contain the dictionary form
          expect(meta.description).toContain(verb.dictionaryForm);

          // Description should also contain the romaji
          expect(meta.description).toContain(verb.romaji);
        }),
        { numRuns: 100 },
      );
    });

    it('canonical URL contains verb parameter for all verbs', () => {
      fc.assert(
        fc.property(fc.constantFrom(...ALL_VERB_INFOS), verb => {
          const meta = generateVerbMeta(verb);

          // Canonical URL should contain the verb parameter
          expect(meta.canonicalUrl).toContain('verb=');

          // The verb should be URL-encoded in the canonical URL
          expect(meta.canonicalUrl).toContain(
            encodeURIComponent(verb.dictionaryForm),
          );
        }),
        { numRuns: 100 },
      );
    });

    it('canonical URL matches expected format', () => {
      fc.assert(
        fc.property(fc.constantFrom(...ALL_VERB_INFOS), verb => {
          const meta = generateVerbMeta(verb);
          const expectedUrl = `https://kanadojo.com/conjugate?verb=${encodeURIComponent(verb.dictionaryForm)}`;

          expect(meta.canonicalUrl).toBe(expectedUrl);
        }),
        { numRuns: 100 },
      );
    });

    it('title follows SEO best practices format', () => {
      fc.assert(
        fc.property(fc.constantFrom(...ALL_VERB_INFOS), verb => {
          const meta = generateVerbMeta(verb);

          // Title should follow format: "食べる (taberu) Conjugation - All Japanese Verb Forms | KanaDojo"
          expect(meta.title).toContain('Conjugation');
          expect(meta.title).toContain('KanaDojo');
          expect(meta.title).toContain('(');
          expect(meta.title).toContain(')');
        }),
        { numRuns: 100 },
      );
    });

    it('description mentions verb type for all verbs', () => {
      fc.assert(
        fc.property(fc.constantFrom(...ALL_VERB_INFOS), verb => {
          const meta = generateVerbMeta(verb);

          // Description should mention the verb type
          const hasVerbType =
            meta.description.includes('Godan') ||
            meta.description.includes('Ichidan') ||
            meta.description.includes('Irregular') ||
            meta.description.includes('する') ||
            meta.description.includes('来る');

          expect(hasVerbType).toBe(true);
        }),
        { numRuns: 100 },
      );
    });

    it('keywords include verb-specific terms', () => {
      fc.assert(
        fc.property(fc.constantFrom(...ALL_VERB_INFOS), verb => {
          const meta = generateVerbMeta(verb);

          // Keywords should include verb-specific terms
          const hasVerbKeyword = meta.keywords.some(
            kw => kw.includes(verb.dictionaryForm) || kw.includes(verb.romaji),
          );

          expect(hasVerbKeyword).toBe(true);
        }),
        { numRuns: 100 },
      );
    });

    it('OG image URL is valid for all verbs', () => {
      fc.assert(
        fc.property(fc.constantFrom(...ALL_VERB_INFOS), verb => {
          const meta = generateVerbMeta(verb);

          // OG image should be a valid URL
          expect(meta.ogImage).toMatch(/^https:\/\//);
          expect(meta.ogImage).toContain('/api/og');
        }),
        { numRuns: 100 },
      );
    });

    it('titleShort is shorter than full title', () => {
      fc.assert(
        fc.property(fc.constantFrom(...ALL_VERB_INFOS), verb => {
          const meta = generateVerbMeta(verb);

          expect(meta.titleShort.length).toBeLessThan(meta.title.length);
        }),
        { numRuns: 100 },
      );
    });
  });

  describe('Base Meta Tags', () => {
    it('base meta has all required fields', () => {
      expect(BASE_META.title).toBeDefined();
      expect(BASE_META.title.length).toBeGreaterThan(0);

      expect(BASE_META.description).toBeDefined();
      expect(BASE_META.description.length).toBeGreaterThan(0);

      expect(BASE_META.keywords).toBeDefined();
      expect(BASE_META.keywords.length).toBeGreaterThan(0);

      expect(BASE_META.canonicalUrl).toBeDefined();
      expect(BASE_META.canonicalUrl).toContain('kanadojo.com');

      expect(BASE_META.ogImage).toBeDefined();
      expect(BASE_META.ogImage).toMatch(/^https:\/\//);
    });

    it('base meta title includes key SEO terms', () => {
      expect(BASE_META.title.toLowerCase()).toContain('japanese');
      expect(BASE_META.title.toLowerCase()).toContain('verb');
      expect(BASE_META.title.toLowerCase()).toContain('conjugator');
    });

    it('base meta description includes key SEO terms', () => {
      const desc = BASE_META.description.toLowerCase();
      expect(desc).toContain('japanese');
      expect(desc).toContain('verb');
      expect(desc).toContain('conjugat');
    });
  });

  describe('generateCanonicalUrl', () => {
    it('generates correct URL without verb', () => {
      const url = generateCanonicalUrl();
      expect(url).toBe('https://kanadojo.com/conjugate');
    });

    it('generates correct URL with verb', () => {
      fc.assert(
        fc.property(fc.constantFrom(...ALL_VERB_INFOS), verb => {
          const url = generateCanonicalUrl(verb.dictionaryForm);
          expect(url).toContain('verb=');
          expect(url).toContain(encodeURIComponent(verb.dictionaryForm));
        }),
        { numRuns: 100 },
      );
    });

    it('generates correct URL with locale', () => {
      fc.assert(
        fc.property(
          fc.constantFrom('en', 'es', 'ja'),
          fc.constantFrom(...ALL_VERB_INFOS),
          (locale, verb) => {
            const url = generateCanonicalUrl(verb.dictionaryForm, { locale });
            expect(url).toContain(`/${locale}/`);
            expect(url).toContain('verb=');
          },
        ),
        { numRuns: 100 },
      );
    });

    it('handles custom base URL', () => {
      const customBase = 'https://test.example.com';
      const url = generateCanonicalUrl('食べる', { baseUrl: customBase });
      expect(url).toContain(customBase);
      expect(url).not.toContain('kanadojo.com');
    });
  });

  describe('generateMeta', () => {
    it('returns base meta when no verb provided', () => {
      const meta = generateMeta();
      expect(meta.title).toBe(BASE_META.title);
      expect(meta.description).toBe(BASE_META.description);
    });

    it('returns verb-specific meta when verb provided', () => {
      fc.assert(
        fc.property(fc.constantFrom(...ALL_VERB_INFOS), verb => {
          const meta = generateMeta(verb);

          // Should be different from base meta
          expect(meta.title).not.toBe(BASE_META.title);
          expect(meta.description).not.toBe(BASE_META.description);

          // Should contain verb info
          expect(meta.title).toContain(verb.dictionaryForm);
          expect(meta.description).toContain(verb.dictionaryForm);
        }),
        { numRuns: 100 },
      );
    });
  });
});
