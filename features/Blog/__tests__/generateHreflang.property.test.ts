import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { generateHreflang } from '../lib/generateHreflang';
import { VALID_LOCALES } from '../types/blog';
import type { Locale } from '../types/blog';

// Arbitraries for generating test data
const localeArb: fc.Arbitrary<Locale> = fc.constantFrom(...VALID_LOCALES);

const slugArb = fc
  .array(fc.stringMatching(/^[a-z0-9]+$/), { minLength: 1, maxLength: 5 })
  .map(parts => parts.join('-'));

// Generate a non-empty subset of locales
const localesSubsetArb = fc
  .subarray([...VALID_LOCALES] as Locale[], { minLength: 1 })
  .filter(arr => arr.length > 0);

/**
 * **Feature: blog-system, Property 12: Hreflang Tags for Multi-Locale Posts**
 * For any post slug that exists in multiple locales, the generated hreflang tags
 * should include an entry for each locale where the post exists, with correct
 * locale codes and URLs.
 * **Validates: Requirements 4.5**
 */
describe('Property 12: Hreflang Tags for Multi-Locale Posts', () => {
  const BASE_URL = 'https://kanadojo.com';

  it('generates one hreflang tag per available locale', () => {
    fc.assert(
      fc.property(slugArb, localesSubsetArb, (slug, locales) => {
        const tags = generateHreflang(slug, locales, { baseUrl: BASE_URL });

        // Count locale tags (excluding x-default)
        const localeTags = tags.filter(t => t.hreflang !== 'x-default');
        expect(localeTags).toHaveLength(locales.length);
      }),
      { numRuns: 100 }
    );
  });

  it('each locale has correct hreflang code', () => {
    fc.assert(
      fc.property(slugArb, localesSubsetArb, (slug, locales) => {
        const tags = generateHreflang(slug, locales, { baseUrl: BASE_URL });

        for (const locale of locales) {
          const tag = tags.find(t => t.hreflang === locale);
          expect(tag).toBeDefined();
        }
      }),
      { numRuns: 100 }
    );
  });

  it('each locale has correct URL format', () => {
    fc.assert(
      fc.property(slugArb, localesSubsetArb, (slug, locales) => {
        const tags = generateHreflang(slug, locales, { baseUrl: BASE_URL });

        for (const locale of locales) {
          const tag = tags.find(t => t.hreflang === locale);
          expect(tag?.href).toBe(`${BASE_URL}/${locale}/academy/${slug}`);
        }
      }),
      { numRuns: 100 }
    );
  });

  it('includes x-default tag when English is available', () => {
    fc.assert(
      fc.property(
        slugArb,
        localesSubsetArb.filter(locales => locales.includes('en')),
        (slug, locales) => {
          const tags = generateHreflang(slug, locales, { baseUrl: BASE_URL });

          const xDefaultTag = tags.find(t => t.hreflang === 'x-default');
          expect(xDefaultTag).toBeDefined();
          expect(xDefaultTag?.href).toBe(`${BASE_URL}/en/academy/${slug}`);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('does not include x-default when English is not available', () => {
    fc.assert(
      fc.property(
        slugArb,
        localesSubsetArb.filter(locales => !locales.includes('en')),
        (slug, locales) => {
          const tags = generateHreflang(slug, locales, { baseUrl: BASE_URL });

          const xDefaultTag = tags.find(t => t.hreflang === 'x-default');
          expect(xDefaultTag).toBeUndefined();
        }
      ),
      { numRuns: 100 }
    );
  });

  it('all tags have valid href URLs', () => {
    fc.assert(
      fc.property(slugArb, localesSubsetArb, (slug, locales) => {
        const tags = generateHreflang(slug, locales, { baseUrl: BASE_URL });

        for (const tag of tags) {
          expect(tag.href).toMatch(
            /^https:\/\/kanadojo\.com\/(en|es|ja)\/academy\/.+$/
          );
        }
      }),
      { numRuns: 100 }
    );
  });

  it('all tags have non-empty hreflang values', () => {
    fc.assert(
      fc.property(slugArb, localesSubsetArb, (slug, locales) => {
        const tags = generateHreflang(slug, locales, { baseUrl: BASE_URL });

        for (const tag of tags) {
          expect(tag.hreflang).toBeTruthy();
          expect(tag.hreflang.length).toBeGreaterThan(0);
        }
      }),
      { numRuns: 100 }
    );
  });
});
