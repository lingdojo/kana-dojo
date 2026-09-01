/**
 * Tests for cryptographically secure shuffle utilities
 * Tests Fisher-Yates shuffle algorithm with secure random number generation
 */

import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { shuffle, shuffleInPlace, pickRandom, pickOne } from './shuffle';

describe('shuffle', () => {
  describe('shuffle function', () => {
    it('returns a new array (does not mutate original)', () => {
      const original = [1, 2, 3, 4, 5];
      const shuffled = shuffle(original);
      expect(original).toEqual([1, 2, 3, 4, 5]);
      expect(shuffled).not.toBe(original);
    });

    it('preserves all elements', () => {
      fc.assert(
        fc.property(fc.array(fc.integer(), { minLength: 0, maxLength: 100 }), arr => {
          const shuffled = shuffle(arr);
          expect([...shuffled].sort()).toEqual([...arr].sort());
        }),
        { numRuns: 100 },
      );
    });

    it('preserves element counts', () => {
      fc.assert(
        fc.property(fc.array(fc.integer(), { minLength: 0, maxLength: 50 }), arr => {
          const shuffled = shuffle(arr);
          const originalCounts = new Map<number, number>();
          const shuffledCounts = new Map<number, number>();
          
          arr.forEach(x => originalCounts.set(x, (originalCounts.get(x) ?? 0) + 1));
          shuffled.forEach(x => shuffledCounts.set(x, (shuffledCounts.get(x) ?? 0) + 1));
          
          expect(shuffledCounts).toEqual(originalCounts);
        }),
        { numRuns: 100 },
      );
    });

    it('returns empty array unchanged', () => {
      expect(shuffle([])).toEqual([]);
    });

    it('returns single-element array unchanged', () => {
      expect(shuffle([42])).toEqual([42]);
    });

    it('produces different orderings over multiple calls (probabilistic)', () => {
      const arr = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
      const results = new Set<string>();
      
      // Run multiple shuffles and collect unique orderings
      for (let i = 0; i < 50; i++) {
        results.add(shuffle(arr).join(','));
      }
      
      // With 10 elements and 50 shuffles, we should see multiple different orderings
      expect(results.size).toBeGreaterThan(5);
    });
  });

  describe('shuffleInPlace function', () => {
    it('mutates the original array', () => {
      const arr = [1, 2, 3, 4, 5];
      const result = shuffleInPlace(arr);
      expect(result).toBe(arr); // Same reference
    });

    it('preserves all elements', () => {
      fc.assert(
        fc.property(fc.array(fc.string(), { minLength: 0, maxLength: 50 }), arr => {
          const originalElements = [...arr];
          shuffleInPlace(arr);
          expect([...arr].sort()).toEqual(originalElements.sort());
        }),
        { numRuns: 100 },
      );
    });

    it('handles empty array', () => {
      const arr: number[] = [];
      expect(shuffleInPlace(arr)).toEqual([]);
    });

    it('handles single-element array', () => {
      const arr = ['only'];
      expect(shuffleInPlace(arr)).toEqual(['only']);
    });
  });

  describe('pickRandom function', () => {
    it('returns n random elements', () => {
      const arr = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
      const picked = pickRandom(arr, 3);
      expect(picked.length).toBe(3);
    });

    it('returns all elements when n >= array length', () => {
      const arr = [1, 2, 3];
      const picked = pickRandom(arr, 5);
      expect([...picked].sort()).toEqual(arr);
    });

    it('returns all elements when n equals array length', () => {
      const arr = [1, 2, 3];
      const picked = pickRandom(arr, 3);
      expect([...picked].sort()).toEqual(arr);
    });

    it('returns empty array for n = 0', () => {
      const arr = [1, 2, 3];
      expect(pickRandom(arr, 0)).toEqual([]);
    });

    it('returns elements from the original array', () => {
      const arr = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
      const picked = pickRandom(arr, 5);
      picked.forEach(el => {
        expect(arr).toContain(el);
      });
    });

    it('does not duplicate elements', () => {
      const arr = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
      const picked = pickRandom(arr, 5);
      expect(new Set(picked).size).toBe(picked.length);
    });

    it('handles empty array', () => {
      expect(pickRandom([], 3)).toEqual([]);
    });

    it('preserves unique elements with duplicates in source', () => {
      const arr = [1, 1, 2, 2, 3, 3];
      const picked = pickRandom(arr, 4);
      // Should still pick without error
      expect(picked.length).toBe(4);
    });

    it('produces different results over multiple calls (probabilistic)', () => {
      const arr = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
      const results = new Set<string>();
      
      for (let i = 0; i < 30; i++) {
        results.add(pickRandom(arr, 3).join(','));
      }
      
      // Should see variety in picks
      expect(results.size).toBeGreaterThan(1);
    });
  });

  describe('pickOne function', () => {
    it('returns an element from the array', () => {
      const arr = [1, 2, 3, 4, 5];
      const picked = pickOne(arr);
      expect(arr).toContain(picked);
    });

    it('returns undefined for empty array', () => {
      expect(pickOne([])).toBeUndefined();
    });

    it('returns the only element for single-element array', () => {
      expect(pickOne(['only'])).toBe('only');
    });

    it('returns different elements over multiple calls (probabilistic)', () => {
      const arr = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
      const results = new Set<number>();
      
      for (let i = 0; i < 50; i++) {
        const picked = pickOne(arr);
        if (picked !== undefined) results.add(picked);
      }
      
      // Should see variety
      expect(results.size).toBeGreaterThan(1);
    });

    it('works with strings', () => {
      const arr = ['apple', 'banana', 'cherry'];
      const picked = pickOne(arr);
      expect(arr).toContain(picked);
    });

    it('works with objects', () => {
      const arr = [{ id: 1 }, { id: 2 }, { id: 3 }];
      const picked = pickOne(arr);
      expect(arr).toContain(picked);
    });
  });

  describe('Property-based tests', () => {
    it('shuffle maintains multiset equality', () => {
      fc.assert(
        fc.property(
          fc.array(fc.integer({ min: -100, max: 100 }), { minLength: 0, maxLength: 50 }),
          arr => {
            const shuffled = shuffle(arr);
            // Same elements (multiset equality)
            expect([...shuffled].sort((a, b) => a - b)).toEqual(
              [...arr].sort((a, b) => a - b)
            );
          }
        ),
        { numRuns: 200 }
      );
    });

    it('pickRandom maintains subset property', () => {
      fc.assert(
        fc.property(
          // Use unique elements to avoid the edge case where duplicate elements
          // in the source array could result in duplicate picks
          fc.uniqueArray(fc.string({ minLength: 1, maxLength: 5 }), { minLength: 1, maxLength: 20 }),
          fc.integer({ min: 0, max: 20 }),
          (arr, n) => {
            const picked = pickRandom(arr, n);
            // All picked elements are from original
            picked.forEach(el => expect(arr).toContain(el));
            // No duplicates (since source array has unique elements)
            expect(new Set(picked).size).toBe(picked.length);
            // Correct count (or all elements if n >= length)
            expect(picked.length).toBe(Math.min(n, arr.length));
          }
        ),
        { numRuns: 100 }
      );
    });
  });
});