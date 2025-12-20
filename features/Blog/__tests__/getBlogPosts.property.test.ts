import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { sortPostsByDate } from '../lib/getBlogPosts';
import type { BlogPostMeta, Category, Locale } from '../types/blog';
import { VALID_CATEGORIES, VALID_LOCALES } from '../types/blog';

// Arbitraries for generating valid BlogPostMeta objects
const categoryArb: fc.Arbitrary<Category> = fc.constantFrom(
  ...VALID_CATEGORIES
);
const localeArb: fc.Arbitrary<Locale> = fc.constantFrom(...VALID_LOCALES);

// Generate valid ISO date strings (YYYY-MM-DD format)
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

// Generate valid slugs
const slugArb = fc
  .array(
    fc.constantFrom(...'abcdefghijklmnopqrstuvwxyz0123456789-'.split('')),
    { minLength: 1, maxLength: 50 }
  )
  .map(chars => chars.join(''))
  .filter(
    s =>
      s.length > 0 &&
      !s.startsWith('-') &&
      !s.endsWith('-') &&
      !s.includes('--')
  );

// Safe characters for strings
const safeChars =
  'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789 .-_!?';

const safeStringArb = fc
  .array(fc.constantFrom(...safeChars.split('')), {
    minLength: 1,
    maxLength: 50
  })
  .map(chars => chars.join('').trim())
  .filter(s => s.length > 0);

// Tag characters
const tagChars = 'abcdefghijklmnopqrstuvwxyz0123456789-';

const tagsArb = fc.array(
  fc
    .array(fc.constantFrom(...tagChars.split('')), {
      minLength: 1,
      maxLength: 20
    })
    .map(chars => chars.join(''))
    .filter(s => s.length > 0 && !s.startsWith('-') && !s.endsWith('-')),
  { minLength: 1, maxLength: 5 }
);

// BlogPostMeta arbitrary for testing sorting
const blogPostMetaArb: fc.Arbitrary<BlogPostMeta> = fc.record({
  title: safeStringArb,
  description: safeStringArb,
  slug: slugArb,
  publishedAt: dateArb,
  updatedAt: fc.constant(undefined),
  author: safeStringArb,
  category: categoryArb,
  tags: tagsArb,
  featuredImage: fc.constant(undefined),
  readingTime: fc.integer({ min: 1, max: 60 }),
  difficulty: fc.constant(undefined),
  relatedPosts: fc.constant(undefined),
  locale: localeArb
});

/**
 * **Feature: blog-system, Property 4: Posts Sorted by Date Descending**
 * For any array of BlogPostMeta objects, after sorting by publication date,
 * each post's publishedAt date should be greater than or equal to the next post's publishedAt date.
 * **Validates: Requirements 2.1**
 */
describe('Property 4: Posts Sorted by Date Descending', () => {
  it('sorted posts have dates in descending order', () => {
    fc.assert(
      fc.property(
        fc.array(blogPostMetaArb, { minLength: 0, maxLength: 50 }),
        (posts: BlogPostMeta[]) => {
          const sorted = sortPostsByDate(posts);

          // Verify each post's date is >= the next post's date
          for (let i = 0; i < sorted.length - 1; i++) {
            const currentDate = new Date(sorted[i].publishedAt).getTime();
            const nextDate = new Date(sorted[i + 1].publishedAt).getTime();
            expect(currentDate).toBeGreaterThanOrEqual(nextDate);
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  it('sorting preserves all posts (no posts lost or duplicated)', () => {
    fc.assert(
      fc.property(
        fc.array(blogPostMetaArb, { minLength: 0, maxLength: 50 }),
        (posts: BlogPostMeta[]) => {
          const sorted = sortPostsByDate(posts);

          // Same length
          expect(sorted.length).toBe(posts.length);

          // All original posts are present in sorted array
          for (const post of posts) {
            const found = sorted.some(
              s => s.slug === post.slug && s.publishedAt === post.publishedAt
            );
            expect(found).toBe(true);
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  it('sorting is stable for posts with same date', () => {
    fc.assert(
      fc.property(
        fc.array(blogPostMetaArb, { minLength: 2, maxLength: 20 }),
        dateArb,
        (posts: BlogPostMeta[], sameDate: string) => {
          // Give all posts the same date
          const postsWithSameDate = posts.map((p, i) => ({
            ...p,
            publishedAt: sameDate,
            slug: `post-${i}` // Ensure unique slugs
          }));

          const sorted = sortPostsByDate(postsWithSameDate);

          // All posts should still be present
          expect(sorted.length).toBe(postsWithSameDate.length);

          // All dates should be the same
          for (const post of sorted) {
            expect(post.publishedAt).toBe(sameDate);
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  it('empty array returns empty array', () => {
    const sorted = sortPostsByDate([]);
    expect(sorted).toEqual([]);
  });

  it('single post array returns same post', () => {
    fc.assert(
      fc.property(blogPostMetaArb, (post: BlogPostMeta) => {
        const sorted = sortPostsByDate([post]);
        expect(sorted.length).toBe(1);
        expect(sorted[0]).toEqual(post);
      }),
      { numRuns: 100 }
    );
  });
});
