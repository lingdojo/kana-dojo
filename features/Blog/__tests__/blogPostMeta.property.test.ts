import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import type { BlogPostMeta, Category, Difficulty, Locale } from '../types/blog';
import {
  VALID_CATEGORIES,
  VALID_DIFFICULTIES,
  VALID_LOCALES
} from '../types/blog';

/**
 * Serialize BlogPostMeta to YAML frontmatter format
 */
function serializeToFrontmatter(meta: BlogPostMeta): string {
  const lines: string[] = ['---'];

  lines.push(`title: "${meta.title.replace(/"/g, '\\"')}"`);
  lines.push(`description: "${meta.description.replace(/"/g, '\\"')}"`);
  lines.push(`slug: "${meta.slug}"`);
  lines.push(`publishedAt: "${meta.publishedAt}"`);
  if (meta.updatedAt) {
    lines.push(`updatedAt: "${meta.updatedAt}"`);
  }
  lines.push(`author: "${meta.author.replace(/"/g, '\\"')}"`);
  lines.push(`category: "${meta.category}"`);
  lines.push(
    `tags: [${meta.tags.map(t => `"${t.replace(/"/g, '\\"')}"`).join(', ')}]`
  );
  if (meta.featuredImage) {
    lines.push(`featuredImage: "${meta.featuredImage}"`);
  }
  lines.push(`readingTime: ${meta.readingTime}`);
  if (meta.difficulty) {
    lines.push(`difficulty: "${meta.difficulty}"`);
  }
  if (meta.relatedPosts && meta.relatedPosts.length > 0) {
    lines.push(
      `relatedPosts: [${meta.relatedPosts.map(p => `"${p}"`).join(', ')}]`
    );
  }
  lines.push(`locale: "${meta.locale}"`);

  lines.push('---');
  return lines.join('\n');
}

/**
 * Parse YAML frontmatter back to BlogPostMeta
 */
function parseFrontmatter(frontmatter: string): BlogPostMeta {
  const content = frontmatter.replace(/^---\n/, '').replace(/\n---$/, '');
  const lines = content.split('\n');
  const result: Record<string, unknown> = {};

  for (const line of lines) {
    const colonIndex = line.indexOf(':');
    if (colonIndex === -1) continue;

    const key = line.substring(0, colonIndex).trim();
    const value = line.substring(colonIndex + 1).trim();

    // Handle arrays
    if (value.startsWith('[') && value.endsWith(']')) {
      const arrayContent = value.slice(1, -1);
      if (arrayContent.trim() === '') {
        result[key] = [];
      } else {
        // Parse array items, handling quoted strings
        const items: string[] = [];
        let current = '';
        let inQuote = false;
        for (let i = 0; i < arrayContent.length; i++) {
          const char = arrayContent[i];
          if (char === '"' && arrayContent[i - 1] !== '\\') {
            inQuote = !inQuote;
          } else if (char === ',' && !inQuote) {
            items.push(
              current.trim().replace(/^"|"$/g, '').replace(/\\"/g, '"')
            );
            current = '';
          } else {
            current += char;
          }
        }
        if (current.trim()) {
          items.push(current.trim().replace(/^"|"$/g, '').replace(/\\"/g, '"'));
        }
        result[key] = items;
      }
    }
    // Handle numbers
    else if (/^\d+$/.test(value)) {
      result[key] = parseInt(value, 10);
    }
    // Handle quoted strings
    else if (value.startsWith('"') && value.endsWith('"')) {
      result[key] = value.slice(1, -1).replace(/\\"/g, '"');
    }
    // Handle unquoted strings
    else {
      result[key] = value;
    }
  }

  return result as unknown as BlogPostMeta;
}

// Arbitraries for generating valid BlogPostMeta objects
const categoryArb: fc.Arbitrary<Category> = fc.constantFrom(
  ...VALID_CATEGORIES
);
const difficultyArb: fc.Arbitrary<Difficulty> = fc.constantFrom(
  ...VALID_DIFFICULTIES
);
const localeArb: fc.Arbitrary<Locale> = fc.constantFrom(...VALID_LOCALES);

// Generate valid ISO date strings (YYYY-MM-DD format) using integer components
// to avoid invalid date issues
const dateArb = fc
  .record({
    year: fc.integer({ min: 2020, max: 2030 }),
    month: fc.integer({ min: 1, max: 12 }),
    day: fc.integer({ min: 1, max: 28 }) // Use 28 to avoid invalid dates
  })
  .map(
    ({ year, month, day }) =>
      `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
  );

// Generate valid slugs (lowercase, alphanumeric with hyphens)
const slugArb = fc
  .array(
    fc.constantFrom(...'abcdefghijklmnopqrstuvwxyz0123456789-'.split('')),
    {
      minLength: 1,
      maxLength: 50
    }
  )
  .map(chars => chars.join(''))
  .filter(
    s =>
      s.length > 0 &&
      !s.startsWith('-') &&
      !s.endsWith('-') &&
      !s.includes('--')
  );

// Safe characters for YAML strings (alphanumeric, spaces, basic punctuation)
const safeChars =
  'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789 .-_!?';

// Generate safe strings (no newlines or problematic characters for YAML)
const safeStringArb = fc
  .array(fc.constantFrom(...safeChars.split('')), {
    minLength: 1,
    maxLength: 50
  })
  .map(chars => chars.join('').trim())
  .filter(s => s.length > 0);

// Safe characters for tags (no special YAML characters)
const tagChars = 'abcdefghijklmnopqrstuvwxyz0123456789-';

// Generate tag arrays with safe characters only
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
  featuredImage: fc.option(
    fc
      .string({ minLength: 1, maxLength: 50 })
      .filter(s => !s.includes('\n') && !s.includes('"'))
      .map(s => `/blog/${s.replace(/[^a-zA-Z0-9-_.]/g, '')}.jpg`),
    { nil: undefined }
  ),
  readingTime: fc.integer({ min: 1, max: 60 }),
  difficulty: fc.option(difficultyArb, { nil: undefined }),
  relatedPosts: fc.option(fc.array(slugArb, { minLength: 0, maxLength: 3 }), {
    nil: undefined
  }),
  locale: localeArb
});

/**
 * **Feature: blog-system, Property 1: Frontmatter Round-Trip Consistency**
 * For any valid BlogPostMeta object, serializing it to YAML frontmatter and then
 * parsing it back should produce an equivalent BlogPostMeta object with all fields preserved.
 * **Validates: Requirements 1.1, 1.5**
 */
describe('Property 1: Frontmatter Round-Trip Consistency', () => {
  it('serializing and parsing BlogPostMeta preserves all required fields', () => {
    fc.assert(
      fc.property(blogPostMetaArb, (meta: BlogPostMeta) => {
        const serialized = serializeToFrontmatter(meta);
        const parsed = parseFrontmatter(serialized);

        // Required fields must match exactly
        expect(parsed.title).toBe(meta.title);
        expect(parsed.description).toBe(meta.description);
        expect(parsed.slug).toBe(meta.slug);
        expect(parsed.publishedAt).toBe(meta.publishedAt);
        expect(parsed.author).toBe(meta.author);
        expect(parsed.category).toBe(meta.category);
        expect(parsed.tags).toEqual(meta.tags);
        expect(parsed.readingTime).toBe(meta.readingTime);
        expect(parsed.locale).toBe(meta.locale);
      }),
      { numRuns: 100 }
    );
  });

  it('serializing and parsing BlogPostMeta preserves optional fields when present', () => {
    fc.assert(
      fc.property(blogPostMetaArb, (meta: BlogPostMeta) => {
        const serialized = serializeToFrontmatter(meta);
        const parsed = parseFrontmatter(serialized);

        // Optional fields should match when present
        if (meta.updatedAt !== undefined) {
          expect(parsed.updatedAt).toBe(meta.updatedAt);
        }
        if (meta.featuredImage !== undefined) {
          expect(parsed.featuredImage).toBe(meta.featuredImage);
        }
        if (meta.difficulty !== undefined) {
          expect(parsed.difficulty).toBe(meta.difficulty);
        }
        if (meta.relatedPosts !== undefined && meta.relatedPosts.length > 0) {
          expect(parsed.relatedPosts).toEqual(meta.relatedPosts);
        }
      }),
      { numRuns: 100 }
    );
  });

  it('round-trip is idempotent (serialize -> parse -> serialize produces same output)', () => {
    fc.assert(
      fc.property(blogPostMetaArb, (meta: BlogPostMeta) => {
        const serialized1 = serializeToFrontmatter(meta);
        const parsed = parseFrontmatter(serialized1);
        const serialized2 = serializeToFrontmatter(parsed as BlogPostMeta);

        expect(serialized2).toBe(serialized1);
      }),
      { numRuns: 100 }
    );
  });
});
