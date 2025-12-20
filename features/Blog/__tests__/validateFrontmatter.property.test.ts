import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { validateFrontmatter } from '../lib/validateFrontmatter';
import {
  REQUIRED_FRONTMATTER_FIELDS,
  VALID_CATEGORIES,
  type Category
} from '../types/blog';

// Arbitraries for generating valid frontmatter values
const categoryArb: fc.Arbitrary<Category> = fc.constantFrom(
  ...VALID_CATEGORIES
);

const dateArb = fc
  .record({
    year: fc.integer({ min: 2020, max: 2030 }),
    month: fc.integer({ min: 1, max: 12 }),
    day: fc.integer({ min: 1, max: 28 })
  })
  .map(
    ({ year, month, day }) =>
      `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
  );

const nonEmptyStringArb = fc
  .string({ minLength: 1, maxLength: 100 })
  .filter(s => s.trim().length > 0);

const tagsArb = fc.array(nonEmptyStringArb, { minLength: 1, maxLength: 5 });

// Generate a complete valid frontmatter object
const validFrontmatterArb = fc.record({
  title: nonEmptyStringArb,
  description: nonEmptyStringArb,
  publishedAt: dateArb,
  author: nonEmptyStringArb,
  category: categoryArb,
  tags: tagsArb
});

/**
 * **Feature: blog-system, Property 3: Frontmatter Validation Identifies Missing Fields**
 * For any frontmatter object with one or more required fields removed, the validation
 * function should return an error result that includes the names of all missing required fields.
 * **Validates: Requirements 1.4**
 */
describe('Property 3: Frontmatter Validation Identifies Missing Fields', () => {
  it('valid frontmatter passes validation', () => {
    fc.assert(
      fc.property(validFrontmatterArb, frontmatter => {
        const result = validateFrontmatter(frontmatter);
        expect(result.success).toBe(true);
      }),
      { numRuns: 100 }
    );
  });

  it('missing required fields are identified', () => {
    // Generate a subset of required fields to remove
    const fieldsToRemoveArb = fc.subarray([...REQUIRED_FRONTMATTER_FIELDS], {
      minLength: 1
    });

    fc.assert(
      fc.property(
        validFrontmatterArb,
        fieldsToRemoveArb,
        (frontmatter, fieldsToRemove) => {
          // Create a copy with some fields removed
          const incomplete = { ...frontmatter };
          for (const field of fieldsToRemove) {
            delete incomplete[field];
          }

          const result = validateFrontmatter(incomplete);

          // Validation should fail
          expect(result.success).toBe(false);

          if (!result.success) {
            // All removed fields should be in the missing fields list
            for (const field of fieldsToRemove) {
              expect(result.missingFields).toContain(field);
            }

            // Missing fields should only contain the removed fields
            expect(result.missingFields.length).toBe(fieldsToRemove.length);
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  it('empty strings are treated as missing', () => {
    fc.assert(
      fc.property(
        validFrontmatterArb,
        fc.constantFrom('title', 'description', 'publishedAt', 'author'),
        (frontmatter, fieldToEmpty) => {
          // Create a copy with one field set to empty string
          const withEmpty = { ...frontmatter, [fieldToEmpty]: '' };

          const result = validateFrontmatter(withEmpty);

          expect(result.success).toBe(false);
          if (!result.success) {
            expect(result.missingFields).toContain(fieldToEmpty);
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  it('empty tags array is treated as missing', () => {
    fc.assert(
      fc.property(validFrontmatterArb, frontmatter => {
        const withEmptyTags = { ...frontmatter, tags: [] };

        const result = validateFrontmatter(withEmptyTags);

        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.missingFields).toContain('tags');
        }
      }),
      { numRuns: 100 }
    );
  });

  it('invalid category is treated as missing', () => {
    fc.assert(
      fc.property(
        validFrontmatterArb,
        fc
          .string({ minLength: 1 })
          .filter(s => !VALID_CATEGORIES.includes(s as Category)),
        (frontmatter, invalidCategory) => {
          const withInvalidCategory = {
            ...frontmatter,
            category: invalidCategory
          };

          const result = validateFrontmatter(withInvalidCategory);

          expect(result.success).toBe(false);
          if (!result.success) {
            expect(result.missingFields).toContain('category');
          }
        }
      ),
      { numRuns: 100 }
    );
  });
});
