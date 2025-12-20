import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { extractHeadings, generateHeadingId } from '../lib/extractHeadings';

// Arbitrary for generating valid heading text (non-empty, no newlines)
const headingTextArb = fc
  .string({ minLength: 1, maxLength: 100 })
  .filter(s => s.trim().length > 0 && !s.includes('\n'));

// Arbitrary for heading levels (2, 3, or 4)
const headingLevelArb = fc.constantFrom(2, 3, 4) as fc.Arbitrary<2 | 3 | 4>;

// Arbitrary for generating a single heading line
const headingLineArb = fc
  .record({
    level: headingLevelArb,
    text: headingTextArb
  })
  .map(({ level, text }) => ({
    markdown: `${'#'.repeat(level)} ${text}`,
    level,
    text: text.trim()
  }));

// Arbitrary for generating MDX content with headings
const mdxContentWithHeadingsArb = fc
  .array(headingLineArb, { minLength: 1, maxLength: 20 })
  .map(headings => ({
    content: headings.map(h => h.markdown).join('\n\n'),
    expectedHeadings: headings.map(h => ({
      level: h.level,
      text: h.text
    }))
  }));

/**
 * **Feature: blog-system, Property 7: Table of Contents Extraction from Headings**
 * For any MDX content string containing heading elements (h2, h3, h4), the extracted
 * headings array should contain an entry for each heading with correct id, text, and level values.
 * **Validates: Requirements 3.2**
 */
describe('Property 7: Table of Contents Extraction from Headings', () => {
  it('extracts correct number of headings from content', () => {
    fc.assert(
      fc.property(
        mdxContentWithHeadingsArb,
        ({ content, expectedHeadings }) => {
          const extracted = extractHeadings(content);

          expect(extracted.length).toBe(expectedHeadings.length);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('extracts headings with correct text and level', () => {
    fc.assert(
      fc.property(
        mdxContentWithHeadingsArb,
        ({ content, expectedHeadings }) => {
          const extracted = extractHeadings(content);

          for (let i = 0; i < expectedHeadings.length; i++) {
            expect(extracted[i].text).toBe(expectedHeadings[i].text);
            expect(extracted[i].level).toBe(expectedHeadings[i].level);
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  it('generates valid IDs for all headings', () => {
    fc.assert(
      fc.property(mdxContentWithHeadingsArb, ({ content }) => {
        const extracted = extractHeadings(content);

        for (const heading of extracted) {
          // ID should be non-empty (fallback to 'heading' if all special chars)
          expect(heading.id.length).toBeGreaterThan(0);

          // ID should be URL-friendly (lowercase, no special chars except hyphens and numbers)
          expect(heading.id).toMatch(
            /^[a-z0-9][a-z0-9-]*[a-z0-9]$|^[a-z0-9]+$/
          );
        }
      }),
      { numRuns: 100 }
    );
  });

  it('generates unique IDs for duplicate heading texts', () => {
    fc.assert(
      fc.property(
        headingTextArb,
        fc.integer({ min: 2, max: 5 }),
        (text, count) => {
          // Create content with duplicate headings
          const content = Array(count).fill(`## ${text}`).join('\n\n');

          const extracted = extractHeadings(content);

          // All IDs should be unique
          const ids = extracted.map(h => h.id);
          const uniqueIds = new Set(ids);
          expect(uniqueIds.size).toBe(ids.length);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('ignores h1 headings (only extracts h2, h3, h4)', () => {
    fc.assert(
      fc.property(headingTextArb, text => {
        const content = `# ${text}\n\n## Another heading`;

        const extracted = extractHeadings(content);

        // Should only extract the h2, not the h1
        expect(extracted.length).toBe(1);
        expect(extracted[0].level).toBe(2);
      }),
      { numRuns: 100 }
    );
  });

  it('ignores h5 and h6 headings', () => {
    fc.assert(
      fc.property(headingTextArb, text => {
        const content = `##### ${text}\n\n###### ${text}\n\n## Valid heading`;

        const extracted = extractHeadings(content);

        // Should only extract the h2
        expect(extracted.length).toBe(1);
        expect(extracted[0].level).toBe(2);
      }),
      { numRuns: 100 }
    );
  });

  it('returns empty array for content without headings', () => {
    fc.assert(
      fc.property(
        fc.string().filter(s => !s.match(/^#{2,4}\s+.+$/m)),
        content => {
          const extracted = extractHeadings(content);
          expect(extracted).toEqual([]);
        }
      ),
      { numRuns: 100 }
    );
  });
});

describe('generateHeadingId', () => {
  it('converts text to lowercase', () => {
    fc.assert(
      fc.property(headingTextArb, text => {
        const id = generateHeadingId(text);
        expect(id).toBe(id.toLowerCase());
      }),
      { numRuns: 100 }
    );
  });

  it('replaces spaces with hyphens', () => {
    fc.assert(
      fc.property(
        fc.array(
          fc.string({ minLength: 1 }).filter(s => /^[a-zA-Z]+$/.test(s)),
          {
            minLength: 2,
            maxLength: 5
          }
        ),
        words => {
          const text = words.join(' ');
          const id = generateHeadingId(text);

          // Should not contain spaces
          expect(id).not.toContain(' ');
        }
      ),
      { numRuns: 100 }
    );
  });

  it('removes special characters', () => {
    fc.assert(
      fc.property(headingTextArb, text => {
        const id = generateHeadingId(text);

        // ID should only contain alphanumeric and hyphens
        // Note: empty results fallback to 'heading'
        expect(id).toMatch(/^[a-z0-9][a-z0-9-]*[a-z0-9]$|^[a-z0-9]+$/);
      }),
      { numRuns: 100 }
    );
  });
});
