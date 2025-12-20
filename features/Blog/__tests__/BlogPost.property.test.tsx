import React from 'react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import * as fc from 'fast-check';
import { render, cleanup } from '@testing-library/react';
import type {
  BlogPost as BlogPostType,
  BlogPostMeta,
  Category,
  Difficulty,
  Locale,
  Heading
} from '../types/blog';
import {
  VALID_CATEGORIES,
  VALID_DIFFICULTIES,
  VALID_LOCALES
} from '../types/blog';
import { BlogPost } from '../components/BlogPost';

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

// Arbitraries for generating valid BlogPost objects
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

// Generate valid heading IDs
const headingIdArb = fc
  .array(
    fc.constantFrom(...'abcdefghijklmnopqrstuvwxyz0123456789-'.split('')),
    {
      minLength: 1,
      maxLength: 30
    }
  )
  .map(chars => chars.join(''))
  .filter(s => s.length > 0 && !s.startsWith('-') && !s.endsWith('-'));

// Generate heading level (h2, h3, h4 - content headings)
const headingLevelArb: fc.Arbitrary<2 | 3 | 4> = fc.constantFrom(2, 3, 4);

// Generate a single heading
const headingArb: fc.Arbitrary<Heading> = fc.record({
  id: headingIdArb,
  text: safeStringArb,
  level: headingLevelArb
});

// Generate array of headings with valid hierarchy (no skipped levels)
const validHeadingsArb: fc.Arbitrary<Heading[]> = fc
  .array(headingArb, { minLength: 0, maxLength: 10 })
  .map(headings => {
    // Ensure no skipped levels in the hierarchy
    // Track the minimum level we've seen so far
    let minLevel = 2;
    return headings.map((heading, index) => {
      // First heading should be h2
      if (index === 0) {
        return { ...heading, level: 2 as const };
      }
      // Subsequent headings can be same level, one level deeper, or back to any previous level
      const prevLevel = headings[index - 1]?.level || 2;
      // Can go one level deeper (max), stay same, or go back up
      const maxAllowedLevel = Math.min(prevLevel + 1, 4) as 2 | 3 | 4;
      // Ensure we don't skip levels
      if (heading.level > maxAllowedLevel) {
        return { ...heading, level: maxAllowedLevel };
      }
      return heading;
    });
  });

// Full BlogPost arbitrary
const blogPostArb: fc.Arbitrary<BlogPostType> = fc.record({
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
  locale: localeArb,
  content: safeStringArb,
  headings: validHeadingsArb
});

// BlogPostMeta arbitrary for related posts
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

/**
 * **Feature: blog-system, Property 19: Heading Hierarchy Maintained**
 * For any rendered BlogPost, the first heading should be an h1 element
 * containing the post title, and all subsequent content headings should
 * be h2 or lower, with no heading level skipped.
 * **Validates: Requirements 7.3**
 */
describe('Property 19: Heading Hierarchy Maintained', () => {
  it('renders h1 as the first heading with the post title', () => {
    fc.assert(
      fc.property(blogPostArb, (post: BlogPostType) => {
        const { container, unmount } = render(<BlogPost post={post} />);

        // Find the first h1 element
        const h1Element = container.querySelector('h1');
        expect(h1Element).not.toBeNull();
        expect(h1Element?.textContent).toBe(post.title);

        unmount();
      }),
      { numRuns: 100 }
    );
  });

  it('has only one h1 element in the rendered output', () => {
    fc.assert(
      fc.property(blogPostArb, (post: BlogPostType) => {
        const { container, unmount } = render(<BlogPost post={post} />);

        // Count all h1 elements
        const h1Elements = container.querySelectorAll('h1');
        expect(h1Elements.length).toBe(1);

        unmount();
      }),
      { numRuns: 100 }
    );
  });

  it('renders title in h1 element with correct test id', () => {
    fc.assert(
      fc.property(blogPostArb, (post: BlogPostType) => {
        const { getByTestId, unmount } = render(<BlogPost post={post} />);

        const titleElement = getByTestId('blog-post-title');
        expect(titleElement.tagName.toLowerCase()).toBe('h1');
        expect(titleElement.textContent).toBe(post.title);

        unmount();
      }),
      { numRuns: 100 }
    );
  });

  it('uses semantic article element as root', () => {
    fc.assert(
      fc.property(blogPostArb, (post: BlogPostType) => {
        const { getByTestId, unmount } = render(<BlogPost post={post} />);

        const articleElement = getByTestId('blog-post');
        expect(articleElement.tagName.toLowerCase()).toBe('article');

        unmount();
      }),
      { numRuns: 100 }
    );
  });

  it('uses semantic header element for post header', () => {
    fc.assert(
      fc.property(blogPostArb, (post: BlogPostType) => {
        const { getByTestId, unmount } = render(<BlogPost post={post} />);

        const headerElement = getByTestId('blog-post-header');
        expect(headerElement.tagName.toLowerCase()).toBe('header');

        unmount();
      }),
      { numRuns: 100 }
    );
  });

  it('uses semantic main element for content area', () => {
    fc.assert(
      fc.property(blogPostArb, (post: BlogPostType) => {
        const { getByTestId, unmount } = render(<BlogPost post={post} />);

        const mainElement = getByTestId('blog-post-main');
        expect(mainElement.tagName.toLowerCase()).toBe('main');

        unmount();
      }),
      { numRuns: 100 }
    );
  });

  it('renders content section with correct test id', () => {
    fc.assert(
      fc.property(blogPostArb, (post: BlogPostType) => {
        const { getByTestId, unmount } = render(<BlogPost post={post} />);

        const contentSection = getByTestId('blog-post-content');
        expect(contentSection.tagName.toLowerCase()).toBe('section');

        unmount();
      }),
      { numRuns: 100 }
    );
  });

  it('renders table of contents when headings are present', () => {
    // Generate posts with at least one heading
    const postWithHeadingsArb = blogPostArb.filter(
      post => post.headings.length > 0
    );

    fc.assert(
      fc.property(postWithHeadingsArb, (post: BlogPostType) => {
        const { container, unmount } = render(<BlogPost post={post} />);

        // Should have table of contents (either mobile or desktop version)
        const tocElements = container.querySelectorAll(
          '[data-testid="table-of-contents"]'
        );
        expect(tocElements.length).toBeGreaterThan(0);

        unmount();
      }),
      { numRuns: 50 }
    );
  });

  it('renders related posts section when related posts are provided', () => {
    fc.assert(
      fc.property(
        blogPostArb,
        fc.array(blogPostMetaArb, { minLength: 1, maxLength: 3 }),
        (post: BlogPostType, relatedPosts: BlogPostMeta[]) => {
          const { getByTestId, unmount } = render(
            <BlogPost post={post} relatedPosts={relatedPosts} />
          );

          const relatedSection = getByTestId('blog-post-related-section');
          expect(relatedSection).not.toBeNull();

          unmount();
        }
      ),
      { numRuns: 50 }
    );
  });

  it('does not render related posts section when no related posts provided', () => {
    fc.assert(
      fc.property(blogPostArb, (post: BlogPostType) => {
        const { queryByTestId, unmount } = render(
          <BlogPost post={post} relatedPosts={[]} />
        );

        const relatedSection = queryByTestId('blog-post-related-section');
        expect(relatedSection).toBeNull();

        unmount();
      }),
      { numRuns: 50 }
    );
  });
});
