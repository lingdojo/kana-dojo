import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { calculateReadingTime } from '../lib/calculateReadingTime';

/**
 * **Feature: blog-system, Property 2: Reading Time Calculation Accuracy**
 * For any string content, the calculated reading time should equal the ceiling of
 * (word count / 200), where word count is determined by splitting on whitespace,
 * with a minimum of 1 minute.
 * **Validates: Requirements 1.2**
 */
describe('Property 2: Reading Time Calculation Accuracy', () => {
  it('reading time equals ceiling of (word count / 200) with minimum 1', () => {
    fc.assert(
      fc.property(fc.string(), (content: string) => {
        const wordCount = content.split(/\s+/).filter(w => w.length > 0).length;
        const expectedTime = Math.max(Math.ceil(wordCount / 200), 1);
        const actualTime = calculateReadingTime(content);

        expect(actualTime).toBe(expectedTime);
      }),
      { numRuns: 100 }
    );
  });

  it('empty content returns minimum reading time of 1 minute', () => {
    fc.assert(
      fc.property(
        fc.constantFrom('', '   ', '\n\n', '\t\t', '  \n  \t  '),
        (emptyContent: string) => {
          const actualTime = calculateReadingTime(emptyContent);
          expect(actualTime).toBe(1);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('reading time increases with word count', () => {
    fc.assert(
      fc.property(
        fc.array(
          fc.string({ minLength: 1 }).filter(s => !/\s/.test(s)),
          {
            minLength: 1,
            maxLength: 1000
          }
        ),
        (words: string[]) => {
          const content = words.join(' ');
          const actualTime = calculateReadingTime(content);

          // Reading time should be at least 1
          expect(actualTime).toBeGreaterThanOrEqual(1);

          // Reading time should be proportional to word count
          const wordCount = words.length;
          const expectedTime = Math.max(Math.ceil(wordCount / 200), 1);
          expect(actualTime).toBe(expectedTime);
        }
      ),
      { numRuns: 100 }
    );
  });
});
