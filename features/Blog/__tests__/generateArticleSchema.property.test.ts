import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { generateArticleSchema } from '../lib/generateArticleSchema';
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
 * **Feature: blog-system, Property 10: Article Schema Contains Required Fields**
 * For any BlogPost object, the generated Article structured data should contain
 * @type as "Article", headline matching title, datePublished, author object with name,
 * publisher object with name "KanaDojo", and description.
 * **Validates: Requirements 4.2**
 */
describe('Property 10: Article Schema Contains Required Fields', () => {
  const BASE_URL = 'https://kanadojo.com';

  it('schema has @type as Article', () => {
    fc.assert(
      fc.property(blogPostArb, (post: BlogPost) => {
        const schema = generateArticleSchema(post, { baseUrl: BASE_URL });
        expect(schema['@type']).toBe('Article');
      }),
      { numRuns: 100 }
    );
  });

  it('schema has @context as schema.org', () => {
    fc.assert(
      fc.property(blogPostArb, (post: BlogPost) => {
        const schema = generateArticleSchema(post, { baseUrl: BASE_URL });
        expect(schema['@context']).toBe('https://schema.org');
      }),
      { numRuns: 100 }
    );
  });

  it('schema headline matches post title', () => {
    fc.assert(
      fc.property(blogPostArb, (post: BlogPost) => {
        const schema = generateArticleSchema(post, { baseUrl: BASE_URL });
        expect(schema.headline).toBe(post.title);
      }),
      { numRuns: 100 }
    );
  });

  it('schema contains datePublished from post', () => {
    fc.assert(
      fc.property(blogPostArb, (post: BlogPost) => {
        const schema = generateArticleSchema(post, { baseUrl: BASE_URL });
        expect(schema.datePublished).toBe(post.publishedAt);
      }),
      { numRuns: 100 }
    );
  });

  it('schema contains author object with name', () => {
    fc.assert(
      fc.property(blogPostArb, (post: BlogPost) => {
        const schema = generateArticleSchema(post, { baseUrl: BASE_URL });
        expect(schema.author).toBeDefined();
        expect(schema.author['@type']).toBe('Person');
        expect(schema.author.name).toBe(post.author);
      }),
      { numRuns: 100 }
    );
  });

  it('schema contains publisher object with name KanaDojo', () => {
    fc.assert(
      fc.property(blogPostArb, (post: BlogPost) => {
        const schema = generateArticleSchema(post, { baseUrl: BASE_URL });
        expect(schema.publisher).toBeDefined();
        expect(schema.publisher['@type']).toBe('Organization');
        expect(schema.publisher.name).toBe('KanaDojo');
      }),
      { numRuns: 100 }
    );
  });

  it('schema contains description from post', () => {
    fc.assert(
      fc.property(blogPostArb, (post: BlogPost) => {
        const schema = generateArticleSchema(post, { baseUrl: BASE_URL });
        expect(schema.description).toBe(post.description);
      }),
      { numRuns: 100 }
    );
  });

  it('schema contains mainEntityOfPage with correct URL', () => {
    fc.assert(
      fc.property(blogPostArb, (post: BlogPost) => {
        const schema = generateArticleSchema(post, { baseUrl: BASE_URL });
        const expectedUrl = `${BASE_URL}/${post.locale}/academy/${post.slug}`;
        expect(schema.mainEntityOfPage).toBe(expectedUrl);
      }),
      { numRuns: 100 }
    );
  });
});
