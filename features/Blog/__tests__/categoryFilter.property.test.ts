import { describe, it, expect, vi } from 'vitest';
import * as fc from 'fast-check';
import type { BlogPostMeta, Category, Difficulty, Locale } from '../types/blog';
import {
  VALID_CATEGORIES,
  VALID_DIFFICULTIES,
  VALID_LOCALES
} from '../types/blog';

// Mock next-intl Link component before importing BlogList
vi.mock('@/shared/components/navigation/Link', () => ({
  Link: ({ children }: { children: React.ReactNode }) => children,
  default: ({ children }: { children: React.ReactNode }) => children
}));

import { filterPostsByCategory } from '../components/BlogList';

// Arbitraries for generating valid BlogPostMeta objects
const categoryArb: fc.Arbitrary<Category> = fc.constantFrom(
  ...VALID_CATEGORIES
);
const difficultyArb: fc.Arbitrary<Difficulty> = fc.constantFrom(
  ...VALID_DIFFICULTIES
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
  .array(fc.constantFrom(...'abcdefghijklmnopqrstuvwxyz0123456789'.split('')), {
    minLength: 1,
    maxLength: 30
  })
  .map(chars => chars.join(''))
  .filter(s => s.length > 0);

// Safe characters for strings
const safeChars =
  'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789 ';

// Generate safe strings
const safeStringArb = fc
  .array(fc.constantFrom(...safeChars.split('')), {
    minLength: 1,
    maxLength: 50
  })
  .map(chars => chars.join('').trim())
  .filter(s => s.length > 0);

// Generate tag arrays
const tagsArb = fc.array(
  fc
    .array(
      fc.constantFrom(...'abcdefghijklmnopqrstuvwxyz0123456789'.split('')),
      {
        minLength: 1,
        maxLength: 15
      }
    )
    .map(chars => chars.join('')),
  { minLength: 1, maxLength: 5 }
);

// Full BlogPostMeta arbitrary
const blogPostMetaArb: fc.Arbitrary<BlogPostMeta> = fc.record({
  title: safeStringArb,
  description: safeStringArb,
  slug: slugArb,
  publishedAt: dateArb,
  updatedAt: fc.option(dateArb, { nil: undefined }),
  author: safeStringArb,
  category: categoryArb,
  tags: tagsArb,
  featuredImage: fc.option(fc.constant('/blog/image.jpg'), { nil: undefined }),
  readingTime: fc.integer({ min: 1, max: 60 }),
  difficulty: fc.option(difficultyArb, { nil: undefined }),
  relatedPosts: fc.option(fc.array(slugArb, { minLength: 0, maxLength: 3 }), {
    nil: undefined
  }),
  locale: localeArb
});

// Generate array of posts with unique slugs
const postsArrayArb = fc
  .array(blogPostMetaArb, { minLength: 0, maxLength: 20 })
  .map(posts => {
    // Ensure unique slugs
    const seen = new Set<string>();
    return posts.filter(post => {
      if (seen.has(post.slug)) return false;
      seen.add(post.slug);
      return true;
    });
  });

/**
 * **Feature: blog-system, Property 6: Category Filter Returns Only Matching Posts**
 * For any array of BlogPostMeta objects and any selected category, the filtered result
 * should contain only posts where post.category equals the selected category,
 * and should contain all such posts from the original array.
 * **Validates: Requirements 2.3**
 */
describe('Property 6: Category Filter Returns Only Matching Posts', () => {
  it('returns all posts when category is null', () => {
    fc.assert(
      fc.property(postsArrayArb, (posts: BlogPostMeta[]) => {
        const filtered = filterPostsByCategory(posts, null);
        expect(filtered).toEqual(posts);
        expect(filtered.length).toBe(posts.length);
      }),
      { numRuns: 100 }
    );
  });

  it('returns only posts matching the selected category', () => {
    fc.assert(
      fc.property(
        postsArrayArb,
        categoryArb,
        (posts: BlogPostMeta[], category: Category) => {
          const filtered = filterPostsByCategory(posts, category);

          // All filtered posts should have the selected category
          for (const post of filtered) {
            expect(post.category).toBe(category);
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  it('returns all posts that match the selected category', () => {
    fc.assert(
      fc.property(
        postsArrayArb,
        categoryArb,
        (posts: BlogPostMeta[], category: Category) => {
          const filtered = filterPostsByCategory(posts, category);
          const expectedCount = posts.filter(
            p => p.category === category
          ).length;

          // Should contain all posts with the selected category
          expect(filtered.length).toBe(expectedCount);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('preserves post order after filtering', () => {
    fc.assert(
      fc.property(
        postsArrayArb,
        categoryArb,
        (posts: BlogPostMeta[], category: Category) => {
          const filtered = filterPostsByCategory(posts, category);
          const expectedPosts = posts.filter(p => p.category === category);

          // Order should be preserved
          expect(filtered.map(p => p.slug)).toEqual(
            expectedPosts.map(p => p.slug)
          );
        }
      ),
      { numRuns: 100 }
    );
  });

  it('returns empty array when no posts match the category', () => {
    fc.assert(
      fc.property(categoryArb, (category: Category) => {
        // Create posts with different categories
        const otherCategories = VALID_CATEGORIES.filter(c => c !== category);
        const posts: BlogPostMeta[] = otherCategories.map((cat, i) => ({
          title: `Post ${i}`,
          description: `Description ${i}`,
          slug: `post-${i}`,
          publishedAt: '2024-01-01',
          author: 'Author',
          category: cat,
          tags: ['tag'],
          readingTime: 5,
          locale: 'en' as Locale
        }));

        const filtered = filterPostsByCategory(posts, category);
        expect(filtered).toEqual([]);
      }),
      { numRuns: 100 }
    );
  });

  it('filtered posts are a subset of original posts', () => {
    fc.assert(
      fc.property(
        postsArrayArb,
        categoryArb,
        (posts: BlogPostMeta[], category: Category) => {
          const filtered = filterPostsByCategory(posts, category);
          const originalSlugs = new Set(posts.map(p => p.slug));

          // All filtered posts should exist in original
          for (const post of filtered) {
            expect(originalSlugs.has(post.slug)).toBe(true);
          }
        }
      ),
      { numRuns: 100 }
    );
  });
});
