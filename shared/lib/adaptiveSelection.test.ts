/**
 * Tests for Adaptive Weighted Selection System
 * Tests the algorithm that prioritizes characters users struggle with
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import * as fc from 'fast-check';
import { createAdaptiveSelector, type CharacterWeight } from './adaptiveSelection';

// Mock localforage to avoid actual storage operations
vi.mock('localforage', () => ({
  default: {
    getItem: vi.fn().mockResolvedValue(null),
    setItem: vi.fn().mockResolvedValue(undefined),
    removeItem: vi.fn().mockResolvedValue(undefined),
  },
}));

describe('Adaptive Selection', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('createAdaptiveSelector', () => {
    it('creates a new selector instance', () => {
      const selector = createAdaptiveSelector('test');
      expect(selector).toBeDefined();
      expect(selector.selectWeightedCharacter).toBeTypeOf('function');
      expect(selector.updateCharacterWeight).toBeTypeOf('function');
      expect(selector.getCharacterWeight).toBeTypeOf('function');
      expect(selector.getStats).toBeTypeOf('function');
      expect(selector.reset).toBeTypeOf('function');
    });

    it('creates independent selector instances', () => {
      const selector1 = createAdaptiveSelector('test1');
      const selector2 = createAdaptiveSelector('test2');

      selector1.updateCharacterWeight('あ', true);
      selector2.updateCharacterWeight('い', false);

      expect(selector1.getCharacterWeight('あ')).toBeDefined();
      expect(selector1.getCharacterWeight('い')).toBeUndefined();
      expect(selector2.getCharacterWeight('い')).toBeDefined();
      expect(selector2.getCharacterWeight('あ')).toBeUndefined();
    });
  });

  describe('selectWeightedCharacter', () => {
    it('selects from available characters', () => {
      const selector = createAdaptiveSelector('test');
      const chars = ['あ', 'い', 'う', 'え', 'お'];
      
      const selected = selector.selectWeightedCharacter(chars);
      expect(chars).toContain(selected);
    });

    it('handles single character array', () => {
      const selector = createAdaptiveSelector('test');
      const selected = selector.selectWeightedCharacter(['あ']);
      expect(selected).toBe('あ');
    });

    it('handles empty array gracefully', () => {
      const selector = createAdaptiveSelector('test');
      // With empty array, the fallback should still return something
      const selected = selector.selectWeightedCharacter([]);
      // The function returns the first element when filtered list is empty
      expect(selected).toBeUndefined();
    });

    it('excludes specified character', () => {
      const selector = createAdaptiveSelector('test');
      const chars = ['あ', 'い', 'う'];
      
      // Run multiple times to ensure exclusion is consistent
      for (let i = 0; i < 20; i++) {
        const selected = selector.selectWeightedCharacter(chars, 'あ');
        expect(selected).not.toBe('あ');
        expect(chars).toContain(selected);
      }
    });

    it('does not repeat the same character consecutively', () => {
      const selector = createAdaptiveSelector('test');
      const chars = ['あ', 'い', 'う', 'え', 'お'];
      
      // Select multiple times and verify no consecutive repeats
      const selections: string[] = [];
      for (let i = 0; i < 20; i++) {
        const selected = selector.selectWeightedCharacter(chars);
        selections.push(selected);
      }
      
      // Check no consecutive duplicates
      for (let i = 1; i < selections.length; i++) {
        expect(selections[i]).not.toBe(selections[i - 1]);
      }
    });

    it('excludes both specified character and last selected', () => {
      const selector = createAdaptiveSelector('test');
      const chars = ['あ', 'い', 'う', 'え', 'お'];
      
      // First selection
      const first = selector.selectWeightedCharacter(chars);
      
      // Second selection with explicit exclude
      const second = selector.selectWeightedCharacter(chars, 'い');
      
      // Should not be 'い' (explicit exclude) or first (last selected)
      expect(second).not.toBe('い');
      if (chars.filter(c => c !== 'い').length > 1) {
        expect(second).not.toBe(first);
      }
    });
  });

  describe('updateCharacterWeight', () => {
    it('creates new weight entry for unseen character', () => {
      const selector = createAdaptiveSelector('test');
      selector.updateCharacterWeight('あ', true);
      
      const weight = selector.getCharacterWeight('あ');
      expect(weight).toBeDefined();
      expect(weight?.correct).toBe(1);
      expect(weight?.wrong).toBe(0);
    });

    it('increments correct count for correct answer', () => {
      const selector = createAdaptiveSelector('test');
      selector.updateCharacterWeight('あ', true);
      selector.updateCharacterWeight('あ', true);
      selector.updateCharacterWeight('あ', true);
      
      const weight = selector.getCharacterWeight('あ');
      expect(weight?.correct).toBe(3);
      expect(weight?.wrong).toBe(0);
      expect(weight?.consecutiveCorrect).toBe(3);
      expect(weight?.consecutiveWrong).toBe(0);
    });

    it('increments wrong count for wrong answer', () => {
      const selector = createAdaptiveSelector('test');
      selector.updateCharacterWeight('あ', false);
      selector.updateCharacterWeight('あ', false);
      
      const weight = selector.getCharacterWeight('あ');
      expect(weight?.correct).toBe(0);
      expect(weight?.wrong).toBe(2);
      expect(weight?.consecutiveCorrect).toBe(0);
      expect(weight?.consecutiveWrong).toBe(2);
    });

    it('resets consecutive counters when switching from correct to wrong', () => {
      const selector = createAdaptiveSelector('test');
      selector.updateCharacterWeight('あ', true);
      selector.updateCharacterWeight('あ', true);
      selector.updateCharacterWeight('あ', false);
      
      const weight = selector.getCharacterWeight('あ');
      expect(weight?.correct).toBe(2);
      expect(weight?.wrong).toBe(1);
      expect(weight?.consecutiveCorrect).toBe(0);
      expect(weight?.consecutiveWrong).toBe(1);
    });

    it('resets consecutive counters when switching from wrong to correct', () => {
      const selector = createAdaptiveSelector('test');
      selector.updateCharacterWeight('あ', false);
      selector.updateCharacterWeight('あ', false);
      selector.updateCharacterWeight('あ', true);
      
      const weight = selector.getCharacterWeight('あ');
      expect(weight?.correct).toBe(1);
      expect(weight?.wrong).toBe(2);
      expect(weight?.consecutiveCorrect).toBe(1);
      expect(weight?.consecutiveWrong).toBe(0);
    });

    it('tracks recent misses for wrong answers', () => {
      const selector = createAdaptiveSelector('test');
      selector.updateCharacterWeight('あ', false);
      
      const weight = selector.getCharacterWeight('あ');
      expect(weight?.recentMisses).toHaveLength(1);
    });

    it('updates lastSeen timestamp', async () => {
      const selector = createAdaptiveSelector('test');
      const before = Date.now();
      selector.updateCharacterWeight('あ', true);
      const after = Date.now();
      
      const weight = selector.getCharacterWeight('あ');
      expect(weight?.lastSeen).toBeGreaterThanOrEqual(before);
      expect(weight?.lastSeen).toBeLessThanOrEqual(after);
    });
  });

  describe('markCharacterSeen', () => {
    it('creates weight entry for unseen character', () => {
      const selector = createAdaptiveSelector('test');
      selector.markCharacterSeen('あ');
      
      const weight = selector.getCharacterWeight('あ');
      expect(weight).toBeDefined();
      expect(weight?.correct).toBe(0);
      expect(weight?.wrong).toBe(0);
      expect(weight?.lastSeen).toBeGreaterThan(0);
    });

    it('updates lastSeen for existing character', async () => {
      const selector = createAdaptiveSelector('test');
      selector.updateCharacterWeight('あ', true);
      
      // Wait a bit to ensure timestamp difference
      await new Promise(resolve => setTimeout(resolve, 10));
      
      const beforeUpdate = selector.getCharacterWeight('あ')?.lastSeen;
      selector.markCharacterSeen('あ');
      const afterUpdate = selector.getCharacterWeight('あ')?.lastSeen;
      
      expect(afterUpdate).toBeGreaterThanOrEqual(beforeUpdate ?? 0);
    });
  });

  describe('getStats', () => {
    it('returns correct stats for empty selector', () => {
      const selector = createAdaptiveSelector('test');
      const stats = selector.getStats();
      
      expect(stats.totalCharacters).toBe(0);
      expect(stats.totalCorrect).toBe(0);
      expect(stats.totalWrong).toBe(0);
      expect(stats.accuracy).toBe(0);
    });

    it('aggregates stats across multiple characters', () => {
      const selector = createAdaptiveSelector('test');
      
      selector.updateCharacterWeight('あ', true);
      selector.updateCharacterWeight('あ', true);
      selector.updateCharacterWeight('い', false);
      selector.updateCharacterWeight('う', true);
      
      const stats = selector.getStats();
      expect(stats.totalCharacters).toBe(3);
      expect(stats.totalCorrect).toBe(3);
      expect(stats.totalWrong).toBe(1);
      expect(stats.accuracy).toBeCloseTo(0.75, 2);
    });

    it('calculates accuracy correctly', () => {
      const selector = createAdaptiveSelector('test');
      
      // 3 correct, 1 wrong = 75%
      selector.updateCharacterWeight('あ', true);
      selector.updateCharacterWeight('あ', true);
      selector.updateCharacterWeight('あ', false);
      selector.updateCharacterWeight('あ', true);
      
      const stats = selector.getStats();
      expect(stats.accuracy).toBeCloseTo(0.75, 2);
    });
  });

  describe('reset', () => {
    it('clears all weights', async () => {
      const selector = createAdaptiveSelector('test');
      
      selector.updateCharacterWeight('あ', true);
      selector.updateCharacterWeight('い', false);
      
      await selector.reset();
      
      expect(selector.getCharacterWeight('あ')).toBeUndefined();
      expect(selector.getCharacterWeight('い')).toBeUndefined();
      expect(selector.getStats().totalCharacters).toBe(0);
    });
  });

  describe('Weighted selection behavior', () => {
    it('prioritizes characters with more wrong answers', () => {
      const selector = createAdaptiveSelector('test');
      const chars = ['あ', 'い', 'う', 'え', 'お'];
      
      // Make 'あ' a problem character (many wrong answers)
      for (let i = 0; i < 10; i++) {
        selector.updateCharacterWeight('あ', false);
      }
      
      // Make 'い' a mastered character (many correct answers)
      for (let i = 0; i < 10; i++) {
        selector.updateCharacterWeight('い', true);
      }
      
      // Collect selection statistics
      const selections: Record<string, number> = {};
      chars.forEach(c => selections[c] = 0);
      
      // Run many selections (resetting the "last selected" constraint by selecting other chars)
      for (let i = 0; i < 200; i++) {
        const selected = selector.selectWeightedCharacter(chars);
        selections[selected] = (selections[selected] ?? 0) + 1;
      }
      
      // 'あ' (problem character) should be selected more often than 'い' (mastered)
      expect(selections['あ']).toBeGreaterThan(selections['い']);
    });

    it('handles alternating correct/wrong answers', () => {
      const selector = createAdaptiveSelector('test');
      
      // Alternate between correct and wrong
      for (let i = 0; i < 10; i++) {
        selector.updateCharacterWeight('あ', i % 2 === 0);
      }
      
      const weight = selector.getCharacterWeight('あ');
      expect(weight?.correct).toBe(5);
      expect(weight?.wrong).toBe(5);
    });
  });

  describe('Property-based tests', () => {
    it('selection always returns a character from the input array', () => {
      const selector = createAdaptiveSelector('test');
      
      fc.assert(
        fc.property(
          fc.array(fc.string({ minLength: 1, maxLength: 3 }), { minLength: 1, maxLength: 20 }),
          chars => {
            const selected = selector.selectWeightedCharacter(chars);
            expect(chars).toContain(selected);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('stats are consistent with individual weights', () => {
      fc.assert(
        fc.property(
          fc.array(
            fc.record({
              char: fc.string({ minLength: 1, maxLength: 2 }),
              correct: fc.boolean(),
            }),
            { minLength: 1, maxLength: 20 }
          ),
          updates => {
            const selector = createAdaptiveSelector('test');
            
            updates.forEach(({ char, correct }) => {
              selector.updateCharacterWeight(char, correct);
            });
            
            const stats = selector.getStats();
            const allCorrect = updates.filter(u => u.correct).length;
            const allWrong = updates.filter(u => !u.correct).length;
            const uniqueChars = new Set(updates.map(u => u.char)).size;
            
            expect(stats.totalCorrect).toBe(allCorrect);
            expect(stats.totalWrong).toBe(allWrong);
            expect(stats.totalCharacters).toBe(uniqueChars);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('weight updates maintain consistency', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 1, maxLength: 2 }),
          fc.array(fc.boolean(), { minLength: 1, maxLength: 20 }),
          (char, answers) => {
            const selector = createAdaptiveSelector('test');
            
            answers.forEach(isCorrect => {
              selector.updateCharacterWeight(char, isCorrect);
            });
            
            const weight = selector.getCharacterWeight(char);
            expect(weight).toBeDefined();
            expect(weight?.correct).toBe(answers.filter(a => a).length);
            expect(weight?.wrong).toBe(answers.filter(a => !a).length);
            expect(weight?.correct + weight?.wrong).toBe(answers.length);
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('Edge cases', () => {
    it('handles characters with Unicode', () => {
      const selector = createAdaptiveSelector('test');
      const unicodeChars = ['🦊', '🌸', '🍣', '🎮'];
      
      unicodeChars.forEach(char => {
        selector.updateCharacterWeight(char, true);
      });
      
      const selected = selector.selectWeightedCharacter(unicodeChars);
      expect(unicodeChars).toContain(selected);
    });

    it('handles rapid successive updates', () => {
      const selector = createAdaptiveSelector('test');
      
      // Rapidly update the same character
      for (let i = 0; i < 100; i++) {
        selector.updateCharacterWeight('あ', i % 3 === 0);
      }
      
      const weight = selector.getCharacterWeight('あ');
      expect(weight?.correct + weight?.wrong).toBe(100);
    });

    it('handles very large character pools', () => {
      const selector = createAdaptiveSelector('test');
      // Generate a large pool of characters
      const largePool = Array.from({ length: 500 }, (_, i) => `char${i}`);
      
      const selected = selector.selectWeightedCharacter(largePool);
      expect(largePool).toContain(selected);
    });
  });
});