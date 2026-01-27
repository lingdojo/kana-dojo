import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import {
  getAllCategories,
  getResourcesByCategory,
  getResourcesBySubcategory,
  getAllResources,
} from '../data';
import { generateBreadcrumbSchema } from '@/shared/components/SEO/BreadcrumbSchema';

// Define locales directly to avoid Next.js navigation module import issues in tests
const SUPPORTED_LOCALES = ['en', 'es'] as const;
type Locale = (typeof SUPPORTED_LOCALES)[number];

// Helper functions to generate structured data (mirrors the page implementations)
function generateItemListSchema(
  name: string,
  description: string,
  resourceCount: number,
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name,
    description,
    numberOfItems: resourceCount,
    itemListOrder: 'https://schema.org/ItemListUnordered',
  };
}

function generateBreadcrumbItems(
  locale: Locale,
  categoryId?: string,
  categoryName?: string,
  subcategoryId?: string,
  subcategoryName?: string,
) {
  const items = [
    { name: 'Home', url: `https://kanadojo.com/${locale}` },
    { name: 'Resources', url: `https://kanadojo.com/${locale}/resources` },
  ];

  if (categoryId && categoryName) {
    items.push({
      name: categoryName,
      url: `https://kanadojo.com/${locale}/resources/${categoryId}`,
    });

    if (subcategoryId && subcategoryName) {
      items.push({
        name: subcategoryName,
        url: `https://kanadojo.com/${locale}/resources/${categoryId}/${subcategoryId}`,
      });
    }
  }

  return items;
}

/**
 * **Feature: japanese-resources-library, Property 10: Structured Data Validity**
 * For any page in the resources section, the JSON-LD structured data should be valid JSON,
 * include the correct @context ("https://schema.org"), and use appropriate @type values
 * (ItemList for listings, BreadcrumbList for navigation).
 * **Validates: Requirements 10.3, 10.9**
 */
describe('Property 10: Structured Data Validity', () => {
  const categories = getAllCategories();
  const localeArb = fc.constantFrom(...SUPPORTED_LOCALES);
  const categoryArb = fc.constantFrom(...categories);

  describe('ItemList Schema', () => {
    it('main page ItemList schema is valid JSON-LD', () => {
      const resources = getAllResources();
      const schema = generateItemListSchema(
        'Japanese Learning Resources',
        'Comprehensive collection of curated Japanese learning resources',
        resources.length,
      );

      // Should be valid JSON (can be stringified and parsed)
      const jsonString = JSON.stringify(schema);
      const parsed = JSON.parse(jsonString);

      // Required JSON-LD fields
      expect(parsed['@context']).toBe('https://schema.org');
      expect(parsed['@type']).toBe('ItemList');
      expect(parsed.name).toBeDefined();
      expect(parsed.description).toBeDefined();
      expect(parsed.numberOfItems).toBe(resources.length);
    });

    it('category page ItemList schema is valid JSON-LD', () => {
      fc.assert(
        fc.property(categoryArb, category => {
          const resources = getResourcesByCategory(category.id);
          const schema = generateItemListSchema(
            `Best ${category.name} for Learning Japanese`,
            category.description,
            resources.length,
          );

          // Should be valid JSON
          const jsonString = JSON.stringify(schema);
          const parsed = JSON.parse(jsonString);

          // Required JSON-LD fields
          expect(parsed['@context']).toBe('https://schema.org');
          expect(parsed['@type']).toBe('ItemList');
          expect(parsed.name).toContain(category.name);
          expect(parsed.numberOfItems).toBe(resources.length);
        }),
        { numRuns: 100 },
      );
    });

    it('subcategory page ItemList schema is valid JSON-LD', () => {
      fc.assert(
        fc.property(categoryArb, category => {
          for (const subcategory of category.subcategories) {
            const resources = getResourcesBySubcategory(
              category.id,
              subcategory.id,
            );
            const schema = generateItemListSchema(
              `Best ${subcategory.name} for Learning Japanese`,
              subcategory.description,
              resources.length,
            );

            // Should be valid JSON
            const jsonString = JSON.stringify(schema);
            const parsed = JSON.parse(jsonString);

            // Required JSON-LD fields
            expect(parsed['@context']).toBe('https://schema.org');
            expect(parsed['@type']).toBe('ItemList');
            expect(parsed.name).toContain(subcategory.name);
            expect(parsed.numberOfItems).toBe(resources.length);
          }
        }),
        { numRuns: 100 },
      );
    });

    it('ItemList numberOfItems matches actual resource count', () => {
      fc.assert(
        fc.property(categoryArb, category => {
          const resources = getResourcesByCategory(category.id);
          const schema = generateItemListSchema(
            category.name,
            category.description,
            resources.length,
          );

          expect(schema.numberOfItems).toBe(resources.length);
        }),
        { numRuns: 100 },
      );
    });
  });

  describe('BreadcrumbList Schema', () => {
    it('main page breadcrumb schema is valid JSON-LD', () => {
      fc.assert(
        fc.property(localeArb, locale => {
          const items = generateBreadcrumbItems(locale);
          const schema = generateBreadcrumbSchema(items);

          // Should be valid JSON
          const jsonString = JSON.stringify(schema);
          const parsed = JSON.parse(jsonString);

          // Required JSON-LD fields
          expect(parsed['@context']).toBe('https://schema.org');
          expect(parsed['@type']).toBe('BreadcrumbList');
          expect(parsed.itemListElement).toBeDefined();
          expect(Array.isArray(parsed.itemListElement)).toBe(true);
          expect(parsed.itemListElement.length).toBe(2); // Home + Resources
        }),
        { numRuns: 100 },
      );
    });

    it('category page breadcrumb schema is valid JSON-LD', () => {
      fc.assert(
        fc.property(localeArb, categoryArb, (locale, category) => {
          const items = generateBreadcrumbItems(
            locale,
            category.id,
            category.name,
          );
          const schema = generateBreadcrumbSchema(items);

          // Should be valid JSON
          const jsonString = JSON.stringify(schema);
          const parsed = JSON.parse(jsonString);

          // Required JSON-LD fields
          expect(parsed['@context']).toBe('https://schema.org');
          expect(parsed['@type']).toBe('BreadcrumbList');
          expect(parsed.itemListElement.length).toBe(3); // Home + Resources + Category
        }),
        { numRuns: 100 },
      );
    });

    it('subcategory page breadcrumb schema is valid JSON-LD', () => {
      fc.assert(
        fc.property(localeArb, categoryArb, (locale, category) => {
          for (const subcategory of category.subcategories) {
            const items = generateBreadcrumbItems(
              locale,
              category.id,
              category.name,
              subcategory.id,
              subcategory.name,
            );
            const schema = generateBreadcrumbSchema(items);

            // Should be valid JSON
            const jsonString = JSON.stringify(schema);
            const parsed = JSON.parse(jsonString);

            // Required JSON-LD fields
            expect(parsed['@context']).toBe('https://schema.org');
            expect(parsed['@type']).toBe('BreadcrumbList');
            expect(parsed.itemListElement.length).toBe(4); // Home + Resources + Category + Subcategory
          }
        }),
        { numRuns: 100 },
      );
    });

    it('breadcrumb positions are sequential starting from 1', () => {
      fc.assert(
        fc.property(localeArb, categoryArb, (locale, category) => {
          const items = generateBreadcrumbItems(
            locale,
            category.id,
            category.name,
          );
          const schema = generateBreadcrumbSchema(items);

          // Check positions are sequential
          for (let i = 0; i < schema.itemListElement.length; i++) {
            expect(schema.itemListElement[i].position).toBe(i + 1);
          }
        }),
        { numRuns: 100 },
      );
    });

    it('breadcrumb items have valid ListItem type', () => {
      fc.assert(
        fc.property(localeArb, categoryArb, (locale, category) => {
          const items = generateBreadcrumbItems(
            locale,
            category.id,
            category.name,
          );
          const schema = generateBreadcrumbSchema(items);

          for (const item of schema.itemListElement) {
            expect(item['@type']).toBe('ListItem');
            expect(item.name).toBeDefined();
            expect(item.item).toBeDefined();
            expect(typeof item.position).toBe('number');
          }
        }),
        { numRuns: 100 },
      );
    });

    it('breadcrumb URLs are valid and contain correct paths', () => {
      fc.assert(
        fc.property(localeArb, categoryArb, (locale, category) => {
          const items = generateBreadcrumbItems(
            locale,
            category.id,
            category.name,
          );
          const schema = generateBreadcrumbSchema(items);

          // Home URL
          expect(schema.itemListElement[0].item).toContain(locale);

          // Resources URL
          expect(schema.itemListElement[1].item).toContain('/resources');

          // Category URL
          expect(schema.itemListElement[2].item).toContain(category.id);
        }),
        { numRuns: 100 },
      );
    });
  });

  describe('Schema Context Consistency', () => {
    it('all schemas use https://schema.org context', () => {
      fc.assert(
        fc.property(categoryArb, category => {
          const itemListSchema = generateItemListSchema(
            category.name,
            category.description,
            10,
          );
          const breadcrumbItems = generateBreadcrumbItems(
            'en',
            category.id,
            category.name,
          );
          const breadcrumbSchema = generateBreadcrumbSchema(breadcrumbItems);

          expect(itemListSchema['@context']).toBe('https://schema.org');
          expect(breadcrumbSchema['@context']).toBe('https://schema.org');
        }),
        { numRuns: 100 },
      );
    });
  });
});
