import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { generateBreadcrumbSchema } from '../lib/generateBreadcrumbSchema';
import { VALID_CATEGORIES, VALID_LOCALES } from '../types/blog';
import type { BlogPost, Category, Locale, Heading } from '../types/blog';

// Arbitraries for generating valid BlogPost
const categoryArb: fc.Arbitrary<Category> = fc.constantFrom(
  ...VALID_CATEGORIES
);
const localeArb: fc.Arbitrary<Locale> = fc.constantFrom(...VALID_LOCALES);

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

const slugArb = fc
  .array(fc.stringMatching(/^[a-z0-9]+$/), { minLength: 1, maxLength: 5 })
  .map(parts => parts.join('-'));

const tagsArb = fc.array(nonEmptyStringArb, { minLength: 1, maxLength: 5 });

const headingArb: fc.Arbitrary<Heading> = fc.record({
  id: slugArb,
  text: nonEmptyStringArb,
  level: fc.constantFrom(2, 3, 4) as fc.Arbitrary<2 | 3 | 4>
});

const blogPostArb: fc.Arbitrary<BlogPost> = fc.record({
  title: nonEmptyStringArb,
  description: nonEmptyStringArb,
  slug: slugArb,
  publishedAt: dateArb,
  updatedAt: fc.option(dateArb, { nil: undefined }),
  author: nonEmptyStringArb,
  category: categoryArb,
  tags: tagsArb,
  featuredImage: fc.option(
    fc.constantFrom('/blog/image1.jpg', '/blog/image2.png'),
    { nil: undefined }
  ),
  readingTime: fc.integer({ min: 1, max: 60 }),
  difficulty: fc.option(
    fc.constantFrom('beginner', 'intermediate', 'advanced'),
    { nil: undefined }
  ),
  relatedPosts: fc.option(fc.array(slugArb, { minLength: 0, maxLength: 3 }), {
    nil: undefined
  }),
  locale: localeArb,
  content: nonEmptyStringArb,
  headings: fc.array(headingArb, { minLength: 0, maxLength: 5 })
});

/**
 * **Feature: blog-system, Property 11: Breadcrumb Schema Correctly Structured**
 * For any BlogPost object, the generated BreadcrumbList schema should contain
 * itemListElement array with ListItem objects having sequential position values
 * starting from 1, and items for Home, Blog, and the post title.
 * **Validates: Requirements 4.3**
 */
describe('Property 11: Breadcrumb Schema Correctly Structured', () => {
  const BASE_URL = 'https://kanadojo.com';

  it('schema has @type as BreadcrumbList', () => {
    fc.assert(
      fc.property(blogPostArb, (post: BlogPost) => {
        const schema = generateBreadcrumbSchema(post, { baseUrl: BASE_URL });
        expect(schema['@type']).toBe('BreadcrumbList');
      }),
      { numRuns: 100 }
    );
  });

  it('schema has @context as schema.org', () => {
    fc.assert(
      fc.property(blogPostArb, (post: BlogPost) => {
        const schema = generateBreadcrumbSchema(post, { baseUrl: BASE_URL });
        expect(schema['@context']).toBe('https://schema.org');
      }),
      { numRuns: 100 }
    );
  });

  it('schema contains exactly 3 breadcrumb items', () => {
    fc.assert(
      fc.property(blogPostArb, (post: BlogPost) => {
        const schema = generateBreadcrumbSchema(post, { baseUrl: BASE_URL });
        expect(schema.itemListElement).toHaveLength(3);
      }),
      { numRuns: 100 }
    );
  });

  it('breadcrumb items have sequential positions starting from 1', () => {
    fc.assert(
      fc.property(blogPostArb, (post: BlogPost) => {
        const schema = generateBreadcrumbSchema(post, { baseUrl: BASE_URL });
        schema.itemListElement.forEach((item, index) => {
          expect(item.position).toBe(index + 1);
        });
      }),
      { numRuns: 100 }
    );
  });

  it('all breadcrumb items have @type ListItem', () => {
    fc.assert(
      fc.property(blogPostArb, (post: BlogPost) => {
        const schema = generateBreadcrumbSchema(post, { baseUrl: BASE_URL });
        schema.itemListElement.forEach(item => {
          expect(item['@type']).toBe('ListItem');
        });
      }),
      { numRuns: 100 }
    );
  });

  it('first breadcrumb is Home with correct URL', () => {
    fc.assert(
      fc.property(blogPostArb, (post: BlogPost) => {
        const schema = generateBreadcrumbSchema(post, { baseUrl: BASE_URL });
        const homeItem = schema.itemListElement[0];
        expect(homeItem.name).toBe('Home');
        expect(homeItem.item).toBe(`${BASE_URL}/${post.locale}`);
      }),
      { numRuns: 100 }
    );
  });

  it('second breadcrumb is Blog with correct URL', () => {
    fc.assert(
      fc.property(blogPostArb, (post: BlogPost) => {
        const schema = generateBreadcrumbSchema(post, { baseUrl: BASE_URL });
        const academyItem = schema.itemListElement[1];
        expect(academyItem.name).toBe('Academy');
        expect(academyItem.item).toBe(`${BASE_URL}/${post.locale}/academy`);
      }),
      { numRuns: 100 }
    );
  });

  it('third breadcrumb is post title with correct URL', () => {
    fc.assert(
      fc.property(blogPostArb, (post: BlogPost) => {
        const schema = generateBreadcrumbSchema(post, { baseUrl: BASE_URL });
        const postItem = schema.itemListElement[2];
        expect(postItem.name).toBe(post.title);
        expect(postItem.item).toBe(
          `${BASE_URL}/${post.locale}/academy/${post.slug}`
        );
      }),
      { numRuns: 100 }
    );
  });
});
