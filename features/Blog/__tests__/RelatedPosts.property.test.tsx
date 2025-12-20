import React from 'react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import * as fc from 'fast-check';
import { render, cleanup } from '@testing-library/react';
import type { BlogPostMeta, Category, Difficulty, Locale } from '../types/blog';
import {
  VALID_CATEGORIES,
  VALID_DIFFICULTIES,
  VALID_LOCALES
} from '../types/blog';
import { RelatedPosts } from '../components/RelatedPosts';

// Mock next-intl Link component
vi.mock('@/shared/components/navigation/Link', () => ({
  Link: ({
    children,
    href,
    ...props
  }: {
    children: React.ReactNode;
    href: string;
  }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
  default: ({
    children,
    href,
    ...props
  }: {
    children: React.ReactNode;
    href: string;
  }) => (
    <a href={href} {...props}>
      {children}
    </a>
  )
}));

// Cleanup after each test
afterEach(() => {
  cleanup();
});

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

// Generate array of posts with unique slugs (non-empty)
const nonEmptyPostsArrayArb = fc
  .array(blogPostMetaArb, { minLength: 1, maxLength: 5 })
  .map(posts => {
    // Ensure unique slugs
    const seen = new Set<string>();
    return posts.filter(post => {
      if (seen.has(post.slug)) return false;
      seen.add(post.slug);
      return true;
    });
  })
  .filter(posts => posts.length > 0);

/**
 * **Feature: blog-system, Property 8: Related Posts Rendered When Present**
 * For any BlogPost with a non-empty relatedPosts array, the rendered RelatedPosts
 * component output should contain links to each related post slug.
 * **Validates: Requirements 3.3**
 */
describe('Property 8: Related Posts Rendered When Present', () => {
  it('renders nothing when posts array is empty', () => {
    const { container, unmount } = render(<RelatedPosts posts={[]} />);
    expect(container.innerHTML).toBe('');
    unmount();
  });

  it('renders related posts section when posts are provided', () => {
    fc.assert(
      fc.property(nonEmptyPostsArrayArb, (posts: BlogPostMeta[]) => {
        const { getByTestId, unmount } = render(<RelatedPosts posts={posts} />);
        const section = getByTestId('related-posts');
        expect(section).toBeDefined();
        unmount();
      }),
      { numRuns: 100 }
    );
  });

  it('renders a link for each related post', () => {
    fc.assert(
      fc.property(nonEmptyPostsArrayArb, (posts: BlogPostMeta[]) => {
        const { container, unmount } = render(<RelatedPosts posts={posts} />);

        for (const post of posts) {
          const link = container.querySelector(`a[href="/blog/${post.slug}"]`);
          expect(link).not.toBeNull();
        }
        unmount();
      }),
      { numRuns: 100 }
    );
  });

  it('renders the correct number of related posts', () => {
    fc.assert(
      fc.property(nonEmptyPostsArrayArb, (posts: BlogPostMeta[]) => {
        const { getByTestId, unmount } = render(<RelatedPosts posts={posts} />);
        const list = getByTestId('related-posts-list');
        const items = list.querySelectorAll('li');
        expect(items.length).toBe(posts.length);
        unmount();
      }),
      { numRuns: 100 }
    );
  });

  it('displays post titles in the links', () => {
    fc.assert(
      fc.property(nonEmptyPostsArrayArb, (posts: BlogPostMeta[]) => {
        const { container, unmount } = render(<RelatedPosts posts={posts} />);

        for (const post of posts) {
          const link = container.querySelector(`a[href="/blog/${post.slug}"]`);
          expect(link?.textContent).toContain(post.title);
        }
        unmount();
      }),
      { numRuns: 100 }
    );
  });

  it('displays reading time for each post', () => {
    fc.assert(
      fc.property(nonEmptyPostsArrayArb, (posts: BlogPostMeta[]) => {
        const { container, unmount } = render(<RelatedPosts posts={posts} />);

        for (const post of posts) {
          const link = container.querySelector(`a[href="/blog/${post.slug}"]`);
          expect(link?.textContent).toContain(`${post.readingTime} min read`);
        }
        unmount();
      }),
      { numRuns: 100 }
    );
  });
});
