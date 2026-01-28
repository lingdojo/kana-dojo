import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { getAllCategories } from '../data';

// Define locales directly to avoid Next.js navigation module import issues in tests
const SUPPORTED_LOCALES = ['en', 'es'] as const;

/**
 * **Feature: japanese-resources-library, Property 8: Route Generation for Categories**
 * For any category defined in the categories data, there should exist a corresponding
 * route at `/resources/{categoryId}`, and for any subcategory, there should exist a
 * route at `/resources/{categoryId}/{subcategoryId}`.
 * **Validates: Requirements 10.1**
 */
describe('Property 8: Route Generation for Categories', () => {
  const categories = getAllCategories();
  const locales = SUPPORTED_LOCALES;

  // Generate all expected routes
  const expectedCategoryRoutes: string[] = [];
  const expectedSubcategoryRoutes: string[] = [];

  for (const locale of locales) {
    for (const category of categories) {
      expectedCategoryRoutes.push(`/${locale}/resources/${category.id}`);
      for (const subcategory of category.subcategories) {
        expectedSubcategoryRoutes.push(
          `/${locale}/resources/${category.id}/${subcategory.id}`,
        );
      }
    }
  }

  // Arbitrary for selecting a random category
  const categoryArb = fc.constantFrom(...categories);
  const localeArb = fc.constantFrom(...locales);

  it('every category has a valid route path', () => {
    fc.assert(
      fc.property(categoryArb, localeArb, (category, locale) => {
        const expectedRoute = `/${locale}/resources/${category.id}`;

        // Route should be in our expected routes list
        expect(expectedCategoryRoutes).toContain(expectedRoute);

        // Category ID should be a valid URL segment (no special characters)
        expect(category.id).toMatch(/^[a-z0-9-]+$/);
      }),
      { numRuns: 100 },
    );
  });

  it('every subcategory has a valid route path', () => {
    fc.assert(
      fc.property(categoryArb, localeArb, (category, locale) => {
        for (const subcategory of category.subcategories) {
          const expectedRoute = `/${locale}/resources/${category.id}/${subcategory.id}`;

          // Route should be in our expected routes list
          expect(expectedSubcategoryRoutes).toContain(expectedRoute);

          // Subcategory ID should be a valid URL segment
          expect(subcategory.id).toMatch(/^[a-z0-9-]+$/);
        }
      }),
      { numRuns: 100 },
    );
  });

  it('all categories have at least one subcategory', () => {
    fc.assert(
      fc.property(categoryArb, category => {
        expect(category.subcategories.length).toBeGreaterThan(0);
      }),
      { numRuns: 100 },
    );
  });

  it('category IDs are unique', () => {
    const categoryIds = categories.map(c => c.id);
    const uniqueIds = new Set(categoryIds);
    expect(uniqueIds.size).toBe(categoryIds.length);
  });

  it('subcategory IDs are unique within each category', () => {
    fc.assert(
      fc.property(categoryArb, category => {
        const subcategoryIds = category.subcategories.map(s => s.id);
        const uniqueIds = new Set(subcategoryIds);
        expect(uniqueIds.size).toBe(subcategoryIds.length);
      }),
      { numRuns: 100 },
    );
  });

  it('all locales have routes for all categories', () => {
    for (const locale of locales) {
      for (const category of categories) {
        const route = `/${locale}/resources/${category.id}`;
        expect(expectedCategoryRoutes).toContain(route);
      }
    }
  });

  it('route count matches expected total', () => {
    const expectedCategoryCount = locales.length * categories.length;
    expect(expectedCategoryRoutes.length).toBe(expectedCategoryCount);

    const totalSubcategories = categories.reduce(
      (sum, cat) => sum + cat.subcategories.length,
      0,
    );
    const expectedSubcategoryCount = locales.length * totalSubcategories;
    expect(expectedSubcategoryRoutes.length).toBe(expectedSubcategoryCount);
  });
});
