import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import * as fc from 'fast-check';
import fs from 'fs';
import path from 'path';
import {
  getBlogPost,
  extractHeadings,
  generateHeadingId,
  postExists
} from '../lib/getBlogPost';
import type { Locale, Heading } from '../types/blog';
import { VALID_LOCALES } from '../types/blog';

// Test fixtures directory
const TEST_FIXTURES_DIR = path.join(
  process.cwd(),
  'features/Blog/content/posts'
);

// Sample frontmatter for test posts
const createTestPost = (locale: Locale, slug: string, title: string) => `---
title: "${title}"
description: "Test description for ${slug}"
publishedAt: "2024-01-15"
author: "Test Author"
category: "hiragana"
tags: ["test", "property-test"]
---

## Introduction

This is test content for ${slug} in ${locale}.

### Subsection One

Some content here.

#### Deep Subsection

More content.

## Conclusion

Final thoughts.
`;

// Setup test fixtures
const testPosts = [
  { locale: 'en' as Locale, slug: 'test-post-en', title: 'English Test Post' },
  { locale: 'es' as Locale, slug: 'test-post-es', title: 'Spanish Test Post' },
  {
    locale: 'en' as Locale,
    slug: 'english-only-post',
    title: 'English Only Post'
  }
];

beforeAll(() => {
  // Create test directories and files
  for (const locale of VALID_LOCALES) {
    const localeDir = path.join(TEST_FIXTURES_DIR, locale);
    if (!fs.existsSync(localeDir)) {
      fs.mkdirSync(localeDir, { recursive: true });
    }
  }

  // Create test posts
  for (const post of testPosts) {
    const filePath = path.join(
      TEST_FIXTURES_DIR,
      post.locale,
      `${post.slug}.mdx`
    );
    fs.writeFileSync(
      filePath,
      createTestPost(post.locale, post.slug, post.title)
    );
  }
});

afterAll(() => {
  // Clean up test posts
  for (const post of testPosts) {
    const filePath = path.join(
      TEST_FIXTURES_DIR,
      post.locale,
      `${post.slug}.mdx`
    );
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  }
});

/**
 * **Feature: blog-system, Property 13: Locale-Based Content Retrieval**
 * For any locale and post slug where the post exists in that locale,
 * getBlogPost should return the post from the locale-specific directory
 * with the locale field matching the requested locale.
 * **Validates: Requirements 5.1, 5.2**
 */
describe('Property 13: Locale-Based Content Retrieval', () => {
  it('returns post with correct locale when post exists in requested locale', () => {
    // Test with the English post
    const post = getBlogPost('test-post-en', 'en');
    expect(post).not.toBeNull();
    expect(post?.locale).toBe('en');
    expect(post?.slug).toBe('test-post-en');
    expect(post?.title).toBe('English Test Post');
  });

  it('returns post with correct locale for Spanish post', () => {
    const post = getBlogPost('test-post-es', 'es');
    expect(post).not.toBeNull();
    expect(post?.locale).toBe('es');
    expect(post?.slug).toBe('test-post-es');
    expect(post?.title).toBe('Spanish Test Post');
  });

  it('postExists returns true for existing posts', () => {
    expect(postExists('en', 'test-post-en')).toBe(true);
    expect(postExists('es', 'test-post-es')).toBe(true);
    expect(postExists('en', 'english-only-post')).toBe(true);
  });

  it('postExists returns false for non-existing posts', () => {
    expect(postExists('ja', 'test-post-en')).toBe(false);
    expect(postExists('en', 'non-existent-post')).toBe(false);
  });

  it('returns null for non-existent post in any locale', () => {
    const post = getBlogPost('completely-non-existent', 'en');
    expect(post).toBeNull();
  });
});

/**
 * **Feature: blog-system, Property 14: English Fallback When Locale Missing**
 * For any locale and post slug where the post does not exist in that locale
 * but exists in English, getBlogPost should return the English version of the post.
 * **Validates: Requirements 5.3**
 */
describe('Property 14: English Fallback When Locale Missing', () => {
  it('falls back to English when post not found in requested locale', () => {
    // Request Japanese version of English-only post
    const post = getBlogPost('english-only-post', 'ja');
    expect(post).not.toBeNull();
    expect(post?.locale).toBe('en'); // Should be English locale
    expect(post?.slug).toBe('english-only-post');
    expect(post?.title).toBe('English Only Post');
  });

  it('falls back to English when Spanish version not available', () => {
    // Request Spanish version of English-only post
    const post = getBlogPost('english-only-post', 'es');
    expect(post).not.toBeNull();
    expect(post?.locale).toBe('en');
  });

  it('returns null when post not found in English either', () => {
    const post = getBlogPost('non-existent-anywhere', 'ja');
    expect(post).toBeNull();
  });

  it('does not fall back when requesting English and post does not exist', () => {
    const post = getBlogPost('non-existent-post', 'en');
    expect(post).toBeNull();
  });
});

/**
 * Property tests for heading extraction
 */
describe('extractHeadings', () => {
  it('extracts all heading levels correctly', () => {
    const content = `
## Heading 2
Some content
### Heading 3
More content
#### Heading 4
Even more content
## Another H2
`;
    const headings = extractHeadings(content);

    expect(headings.length).toBe(4);
    expect(headings[0]).toEqual({
      id: 'heading-2',
      text: 'Heading 2',
      level: 2
    });
    expect(headings[1]).toEqual({
      id: 'heading-3',
      text: 'Heading 3',
      level: 3
    });
    expect(headings[2]).toEqual({
      id: 'heading-4',
      text: 'Heading 4',
      level: 4
    });
    expect(headings[3]).toEqual({
      id: 'another-h2',
      text: 'Another H2',
      level: 2
    });
  });

  it('generates unique IDs from heading text', () => {
    fc.assert(
      fc.property(
        fc.array(
          fc
            .string({ minLength: 1, maxLength: 50 })
            .filter(s => /[a-zA-Z0-9]/.test(s)), // Must have at least one alphanumeric
          { minLength: 1, maxLength: 10 }
        ),
        (headingTexts: string[]) => {
          const content = headingTexts.map(text => `## ${text}`).join('\n\n');
          const headings = extractHeadings(content);

          // Each heading should have an id
          for (const heading of headings) {
            expect(heading.id).toBeDefined();
            expect(typeof heading.id).toBe('string');
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  it('does not extract h1 headings (reserved for title)', () => {
    const content = `
# H1 Title
## H2 Heading
### H3 Heading
`;
    const headings = extractHeadings(content);

    expect(headings.length).toBe(2);
    expect(headings.every(h => h.level >= 2)).toBe(true);
  });

  it('does not extract h5 or h6 headings', () => {
    const content = `
## H2 Heading
##### H5 Heading
###### H6 Heading
`;
    const headings = extractHeadings(content);

    expect(headings.length).toBe(1);
    expect(headings[0].level).toBe(2);
  });

  it('returns empty array for content without headings', () => {
    const content = 'Just some plain text without any headings.';
    const headings = extractHeadings(content);
    expect(headings).toEqual([]);
  });
});

describe('generateHeadingId', () => {
  it('converts text to lowercase slug format', () => {
    fc.assert(
      fc.property(
        fc
          .string({ minLength: 1, maxLength: 100 })
          .filter(s => /[a-zA-Z0-9]/.test(s)),
        (text: string) => {
          const id = generateHeadingId(text);

          // ID should be lowercase
          expect(id).toBe(id.toLowerCase());

          // ID should not have leading/trailing hyphens
          expect(id.startsWith('-')).toBe(false);
          expect(id.endsWith('-')).toBe(false);

          // ID should not have consecutive hyphens
          expect(id.includes('--')).toBe(false);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('handles special characters correctly', () => {
    expect(generateHeadingId('Hello World!')).toBe('hello-world');
    expect(generateHeadingId('Test & Example')).toBe('test-example');
    expect(generateHeadingId('日本語 Test')).toBe('test');
  });
});
