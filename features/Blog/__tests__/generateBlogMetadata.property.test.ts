import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { generateBlogMetadata } from '../lib/generateBlogMetadata';
import { VALID_CATEGORIES, VALID_LOCALES } from '../types/blog';
import type { BlogPostMeta, Category, Locale } from '../types/blog';

// Arbitraries for generating valid BlogPostMeta
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

const blogPostMetaArb: fc.Arbitrary<BlogPostMeta> = fc.record({
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
  locale: localeArb
});

/**
 * **Feature: blog-system, Property 9: Metadata Contains Required Fields**
 * For any BlogPostMeta object, the generated metadata object should contain
 * title, description, canonical URL with the post slug, and openGraph properties
 * with title, description, and url.
 * **Validates: Requirements 4.1**
 */
describe('Property 9: Metadata Contains Required Fields', () => {
  const BASE_URL = 'https://kanadojo.com';

  it('generated metadata contains title from post', () => {
    fc.assert(
      fc.property(blogPostMetaArb, (post: BlogPostMeta) => {
        const metadata = generateBlogMetadata(post, { baseUrl: BASE_URL });
        expect(metadata.title).toBe(post.title);
      }),
      { numRuns: 100 }
    );
  });

  it('generated metadata contains description from post', () => {
    fc.assert(
      fc.property(blogPostMetaArb, (post: BlogPostMeta) => {
        const metadata = generateBlogMetadata(post, { baseUrl: BASE_URL });
        expect(metadata.description).toBe(post.description);
      }),
      { numRuns: 100 }
    );
  });

  it('generated metadata contains canonical URL with post slug', () => {
    fc.assert(
      fc.property(blogPostMetaArb, (post: BlogPostMeta) => {
        const metadata = generateBlogMetadata(post, { baseUrl: BASE_URL });
        const expectedUrl = `${BASE_URL}/${post.locale}/academy/${post.slug}`;
        expect(metadata.alternates?.canonical).toBe(expectedUrl);
      }),
      { numRuns: 100 }
    );
  });

  it('generated metadata contains openGraph with title, description, and url', () => {
    fc.assert(
      fc.property(blogPostMetaArb, (post: BlogPostMeta) => {
        const metadata = generateBlogMetadata(post, { baseUrl: BASE_URL });
        const expectedUrl = `${BASE_URL}/${post.locale}/academy/${post.slug}`;

        expect(metadata.openGraph).toBeDefined();
        expect(metadata.openGraph?.title).toBe(post.title);
        expect(metadata.openGraph?.description).toBe(post.description);
        expect(metadata.openGraph?.url).toBe(expectedUrl);
      }),
      { numRuns: 100 }
    );
  });

  it('generated metadata includes openGraph type as article', () => {
    fc.assert(
      fc.property(blogPostMetaArb, (post: BlogPostMeta) => {
        const metadata = generateBlogMetadata(post, { baseUrl: BASE_URL });
        // Type assertion needed because OpenGraph is a union type
        // At runtime, we know this is OpenGraphArticle with type: 'article'
        expect((metadata.openGraph as { type?: string })?.type).toBe('article');
      }),
      { numRuns: 100 }
    );
  });
});
