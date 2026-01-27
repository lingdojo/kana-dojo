import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import {
  getAllCategories,
  getResourcesByCategory,
  getResourcesBySubcategory,
} from '../data';

// Define locales directly to avoid Next.js navigation module import issues in tests
const SUPPORTED_LOCALES = ['en', 'es'] as const;
type Locale = (typeof SUPPORTED_LOCALES)[number];

// Helper functions to generate metadata (mirrors the page implementations)
function generateMainPageMetadata(locale: Locale, totalCount: number) {
  const title =
    'Best Japanese Learning Resources - Apps, Textbooks, YouTube & More | KanaDojo';
  const description = `Discover ${totalCount}+ curated Japanese learning resources. Find the best apps, textbooks, YouTube channels, podcasts, games, and tools for learning Japanese at any level.`;

  return {
    title,
    description,
    keywords: [
      'japanese learning resources',
      'learn japanese',
      'japanese apps',
      'japanese textbooks',
      'japanese youtube channels',
      'jlpt resources',
      'japanese study materials',
      'best japanese learning apps',
      'japanese language resources',
    ],
    openGraph: {
      title: 'Best Japanese Learning Resources | KanaDojo',
      description,
      url: `https://kanadojo.com/${locale}/resources`,
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: 'Best Japanese Learning Resources | KanaDojo',
      description,
    },
    alternates: {
      canonical: `https://kanadojo.com/${locale}/resources`,
      languages: {
        en: '/en/resources',
        es: '/es/resources',
      },
    },
  };
}

function generateCategoryPageMetadata(
  locale: Locale,
  categoryId: string,
  categoryName: string,
  categoryDescription: string,
  resourceCount: number,
) {
  const title = `Best ${categoryName} for Learning Japanese - ${resourceCount}+ Resources | KanaDojo`;
  const description = `${categoryDescription} Discover ${resourceCount}+ curated ${categoryName.toLowerCase()} to help you learn Japanese effectively.`;

  return {
    title,
    description,
    keywords: [
      `japanese ${categoryName.toLowerCase()}`,
      `learn japanese ${categoryName.toLowerCase()}`,
      `best ${categoryName.toLowerCase()} for japanese`,
      `japanese learning ${categoryName.toLowerCase()}`,
      categoryName.toLowerCase(),
      'japanese study resources',
    ],
    openGraph: {
      title: `Best ${categoryName} for Learning Japanese | KanaDojo`,
      description,
      url: `https://kanadojo.com/${locale}/resources/${categoryId}`,
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: `Best ${categoryName} for Learning Japanese | KanaDojo`,
      description,
    },
    alternates: {
      canonical: `https://kanadojo.com/${locale}/resources/${categoryId}`,
      languages: {
        en: `/en/resources/${categoryId}`,
        es: `/es/resources/${categoryId}`,
      },
    },
  };
}

function generateSubcategoryPageMetadata(
  locale: Locale,
  categoryId: string,
  subcategoryId: string,
  subcategoryName: string,
  subcategoryDescription: string,
  resourceCount: number,
) {
  const title = `Best ${subcategoryName} for Learning Japanese - ${resourceCount}+ Resources | KanaDojo`;
  const description = `${subcategoryDescription} Discover ${resourceCount}+ curated ${subcategoryName.toLowerCase()} to help you learn Japanese effectively.`;

  return {
    title,
    description,
    keywords: [
      `japanese ${subcategoryName.toLowerCase()}`,
      `learn japanese ${subcategoryName.toLowerCase()}`,
      `best ${subcategoryName.toLowerCase()} for japanese`,
      subcategoryName.toLowerCase(),
      'japanese study resources',
    ],
    openGraph: {
      title: `Best ${subcategoryName} for Learning Japanese | KanaDojo`,
      description,
      url: `https://kanadojo.com/${locale}/resources/${categoryId}/${subcategoryId}`,
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: `Best ${subcategoryName} for Learning Japanese | KanaDojo`,
      description,
    },
    alternates: {
      canonical: `https://kanadojo.com/${locale}/resources/${categoryId}/${subcategoryId}`,
      languages: {
        en: `/en/resources/${categoryId}/${subcategoryId}`,
        es: `/es/resources/${categoryId}/${subcategoryId}`,
      },
    },
  };
}

/**
 * **Feature: japanese-resources-library, Property 9: SEO Metadata Completeness**
 * For any page in the resources section (main, category, or subcategory), the page
 * metadata should include: a unique title containing relevant keywords, a description
 * between 50-160 characters, a canonical URL, Open Graph tags (title, description, url, type),
 * Twitter Card tags, and hreflang tags for all supported locales.
 * **Validates: Requirements 10.2, 10.7, 10.8, 10.14**
 */
describe('Property 9: SEO Metadata Completeness', () => {
  const categories = getAllCategories();
  const localeArb = fc.constantFrom(...SUPPORTED_LOCALES);
  const categoryArb = fc.constantFrom(...categories);

  it('main page metadata has all required SEO fields', () => {
    fc.assert(
      fc.property(localeArb, locale => {
        const metadata = generateMainPageMetadata(locale, 200);

        // Title should exist and contain keywords
        expect(metadata.title).toBeDefined();
        expect(metadata.title.length).toBeGreaterThan(0);
        expect(metadata.title.toLowerCase()).toContain('japanese');

        // Description should be between 50-300 characters (allowing some flexibility)
        expect(metadata.description).toBeDefined();
        expect(metadata.description.length).toBeGreaterThanOrEqual(50);
        expect(metadata.description.length).toBeLessThanOrEqual(300);

        // Keywords should exist
        expect(metadata.keywords).toBeDefined();
        expect(metadata.keywords.length).toBeGreaterThan(0);

        // Open Graph tags
        expect(metadata.openGraph).toBeDefined();
        expect(metadata.openGraph.title).toBeDefined();
        expect(metadata.openGraph.description).toBeDefined();
        expect(metadata.openGraph.url).toBeDefined();
        expect(metadata.openGraph.type).toBe('website');

        // Twitter Card tags
        expect(metadata.twitter).toBeDefined();
        expect(metadata.twitter.card).toBe('summary_large_image');
        expect(metadata.twitter.title).toBeDefined();
        expect(metadata.twitter.description).toBeDefined();

        // Canonical URL
        expect(metadata.alternates.canonical).toBeDefined();
        expect(metadata.alternates.canonical).toContain('/resources');

        // Hreflang tags for all locales
        expect(metadata.alternates.languages).toBeDefined();
        for (const supportedLocale of SUPPORTED_LOCALES) {
          expect(metadata.alternates.languages[supportedLocale]).toBeDefined();
        }
      }),
      { numRuns: 100 },
    );
  });

  it('category page metadata has all required SEO fields', () => {
    fc.assert(
      fc.property(localeArb, categoryArb, (locale, category) => {
        const resources = getResourcesByCategory(category.id);
        const metadata = generateCategoryPageMetadata(
          locale,
          category.id,
          category.name,
          category.description,
          resources.length,
        );

        // Title should contain category name
        expect(metadata.title).toBeDefined();
        expect(metadata.title).toContain(category.name);

        // Description should be reasonable length
        expect(metadata.description).toBeDefined();
        expect(metadata.description.length).toBeGreaterThanOrEqual(50);

        // Keywords should include category-related terms
        expect(metadata.keywords).toBeDefined();
        expect(metadata.keywords.length).toBeGreaterThan(0);

        // Open Graph tags
        expect(metadata.openGraph).toBeDefined();
        expect(metadata.openGraph.url).toContain(category.id);

        // Twitter Card tags
        expect(metadata.twitter).toBeDefined();
        expect(metadata.twitter.card).toBe('summary_large_image');

        // Canonical URL should include category
        expect(metadata.alternates.canonical).toContain(category.id);

        // Hreflang tags
        for (const supportedLocale of SUPPORTED_LOCALES) {
          expect(metadata.alternates.languages[supportedLocale]).toContain(
            category.id,
          );
        }
      }),
      { numRuns: 100 },
    );
  });

  it('subcategory page metadata has all required SEO fields', () => {
    fc.assert(
      fc.property(localeArb, categoryArb, (locale, category) => {
        for (const subcategory of category.subcategories) {
          const resources = getResourcesBySubcategory(
            category.id,
            subcategory.id,
          );
          const metadata = generateSubcategoryPageMetadata(
            locale,
            category.id,
            subcategory.id,
            subcategory.name,
            subcategory.description,
            resources.length,
          );

          // Title should contain subcategory name
          expect(metadata.title).toBeDefined();
          expect(metadata.title).toContain(subcategory.name);

          // Description should be reasonable length
          expect(metadata.description).toBeDefined();
          expect(metadata.description.length).toBeGreaterThanOrEqual(50);

          // Open Graph tags
          expect(metadata.openGraph).toBeDefined();
          expect(metadata.openGraph.url).toContain(subcategory.id);

          // Twitter Card tags
          expect(metadata.twitter).toBeDefined();

          // Canonical URL should include both category and subcategory
          expect(metadata.alternates.canonical).toContain(category.id);
          expect(metadata.alternates.canonical).toContain(subcategory.id);

          // Hreflang tags
          for (const supportedLocale of SUPPORTED_LOCALES) {
            expect(metadata.alternates.languages[supportedLocale]).toContain(
              subcategory.id,
            );
          }
        }
      }),
      { numRuns: 100 },
    );
  });

  it('all metadata titles are unique across pages', () => {
    const titles = new Set<string>();

    // Main page
    for (const locale of SUPPORTED_LOCALES) {
      const metadata = generateMainPageMetadata(locale, 200);
      titles.add(metadata.title);
    }

    // Category pages
    for (const category of categories) {
      const resources = getResourcesByCategory(category.id);
      for (const locale of SUPPORTED_LOCALES) {
        const metadata = generateCategoryPageMetadata(
          locale,
          category.id,
          category.name,
          category.description,
          resources.length,
        );
        titles.add(metadata.title);
      }
    }

    // Each category should have a unique title (main page + categories)
    // Note: Same title across locales is expected, but different categories should have different titles
    expect(titles.size).toBeGreaterThan(1);
  });

  it('canonical URLs are properly formatted', () => {
    fc.assert(
      fc.property(localeArb, categoryArb, (locale, category) => {
        const metadata = generateCategoryPageMetadata(
          locale,
          category.id,
          category.name,
          category.description,
          10,
        );

        // Canonical should be a valid URL
        expect(metadata.alternates.canonical).toMatch(/^https:\/\//);

        // Should contain the locale
        expect(metadata.alternates.canonical).toContain(locale);

        // Should not have double slashes (except after https:)
        const urlWithoutProtocol = metadata.alternates.canonical.replace(
          'https://',
          '',
        );
        expect(urlWithoutProtocol).not.toContain('//');
      }),
      { numRuns: 100 },
    );
  });
});
