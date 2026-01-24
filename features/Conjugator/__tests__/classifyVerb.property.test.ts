/**
 * Property-Based Tests for Verb Classification
 *
 * **Feature: japanese-verb-conjugator, Property 13: Verb Analysis Correctness**
 * For any valid verb, the detected verb type (Godan/Ichidan/Irregular) and
 * extracted stem SHALL be consistent with the verb's actual classification.
 *
 * **Validates: Requirements 9.1, 9.2**
 */

import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { classifyVerb } from '../lib/engine/classifyVerb';
import {
  GODAN_ENDINGS,
  IRREGULAR_VERBS,
  KNOWN_ICHIDAN_VERBS,
  FALSE_ICHIDAN_VERBS,
} from '../data/verbData';

// ============================================================================
// Test Data - Known Verbs with Expected Classifications
// ============================================================================

/**
 * Known Godan verbs with their expected stems and endings
 */
const KNOWN_GODAN_VERBS = [
  { verb: '書く', stem: '書', ending: 'く', type: 'godan' as const },
  { verb: '読む', stem: '読', ending: 'む', type: 'godan' as const },
  { verb: '話す', stem: '話', ending: 'す', type: 'godan' as const },
  { verb: '待つ', stem: '待', ending: 'つ', type: 'godan' as const },
  { verb: '買う', stem: '買', ending: 'う', type: 'godan' as const },
  { verb: '泳ぐ', stem: '泳', ending: 'ぐ', type: 'godan' as const },
  { verb: '死ぬ', stem: '死', ending: 'ぬ', type: 'godan' as const },
  { verb: '遊ぶ', stem: '遊', ending: 'ぶ', type: 'godan' as const },
  { verb: '帰る', stem: '帰', ending: 'る', type: 'godan' as const }, // False Ichidan
  { verb: '走る', stem: '走', ending: 'る', type: 'godan' as const }, // False Ichidan
  { verb: '知る', stem: '知', ending: 'る', type: 'godan' as const }, // False Ichidan
  { verb: '切る', stem: '切', ending: 'る', type: 'godan' as const }, // False Ichidan
];

/**
 * Known Ichidan verbs with their expected stems
 */
const KNOWN_ICHIDAN_TEST_VERBS = [
  { verb: '食べる', stem: '食べ', ending: 'る', type: 'ichidan' as const },
  { verb: '見る', stem: '見', ending: 'る', type: 'ichidan' as const },
  { verb: '起きる', stem: '起き', ending: 'る', type: 'ichidan' as const },
  { verb: '寝る', stem: '寝', ending: 'る', type: 'ichidan' as const },
  { verb: '出る', stem: '出', ending: 'る', type: 'ichidan' as const },
  { verb: '開ける', stem: '開け', ending: 'る', type: 'ichidan' as const },
  { verb: '閉める', stem: '閉め', ending: 'る', type: 'ichidan' as const },
  { verb: '教える', stem: '教え', ending: 'る', type: 'ichidan' as const },
];

/**
 * Known irregular verbs
 */
const KNOWN_IRREGULAR_TEST_VERBS = [
  { verb: 'する', type: 'irregular' as const, irregularType: 'suru' as const },
  { verb: '来る', type: 'irregular' as const, irregularType: 'kuru' as const },
  { verb: 'くる', type: 'irregular' as const, irregularType: 'kuru' as const },
  { verb: 'ある', type: 'irregular' as const, irregularType: 'aru' as const },
  { verb: '行く', type: 'irregular' as const, irregularType: 'iku' as const },
  { verb: 'いく', type: 'irregular' as const, irregularType: 'iku' as const },
];

/**
 * Known compound verbs
 */
const KNOWN_COMPOUND_VERBS = [
  {
    verb: '勉強する',
    type: 'irregular' as const,
    irregularType: 'suru' as const,
    prefix: '勉強',
  },
  {
    verb: '運動する',
    type: 'irregular' as const,
    irregularType: 'suru' as const,
    prefix: '運動',
  },
  {
    verb: '持ってくる',
    type: 'irregular' as const,
    irregularType: 'kuru' as const,
    prefix: '持って',
  },
];

// ============================================================================
// Arbitraries for Property-Based Testing
// ============================================================================

/**
 * Arbitrary for known Godan verbs
 */
const godanVerbArb = fc.constantFrom(...KNOWN_GODAN_VERBS.map(v => v.verb));

/**
 * Arbitrary for known Ichidan verbs
 */
const ichidanVerbArb = fc.constantFrom(
  ...KNOWN_ICHIDAN_TEST_VERBS.map(v => v.verb),
);

/**
 * Arbitrary for known irregular verbs
 */
const irregularVerbArb = fc.constantFrom(
  ...KNOWN_IRREGULAR_TEST_VERBS.map(v => v.verb),
);

/**
 * Arbitrary for all known valid verbs
 */
const validVerbArb = fc.oneof(godanVerbArb, ichidanVerbArb, irregularVerbArb);

// ============================================================================
// Property Tests
// ============================================================================

describe('Verb Classification Properties', () => {
  /**
   * **Feature: japanese-verb-conjugator, Property 13: Verb Analysis Correctness**
   * **Validates: Requirements 9.1, 9.2**
   */
  describe('Property 13: Verb Analysis Correctness', () => {
    it('correctly classifies known Godan verbs', () => {
      fc.assert(
        fc.property(fc.constantFrom(...KNOWN_GODAN_VERBS), verbData => {
          const result = classifyVerb(verbData.verb);

          // Verify verb type is Godan
          expect(result.type).toBe('godan');

          // Verify stem is correct
          expect(result.stem).toBe(verbData.stem);

          // Verify ending is correct
          expect(result.ending).toBe(verbData.ending);

          // Verify ending is a valid Godan ending
          expect(Object.keys(GODAN_ENDINGS)).toContain(result.ending);
        }),
        { numRuns: 100 },
      );
    });

    it('correctly classifies known Ichidan verbs', () => {
      fc.assert(
        fc.property(fc.constantFrom(...KNOWN_ICHIDAN_TEST_VERBS), verbData => {
          const result = classifyVerb(verbData.verb);

          // Verify verb type is Ichidan
          expect(result.type).toBe('ichidan');

          // Verify stem is correct
          expect(result.stem).toBe(verbData.stem);

          // Verify ending is る
          expect(result.ending).toBe('る');
        }),
        { numRuns: 100 },
      );
    });

    it('correctly classifies known irregular verbs', () => {
      fc.assert(
        fc.property(
          fc.constantFrom(...KNOWN_IRREGULAR_TEST_VERBS),
          verbData => {
            const result = classifyVerb(verbData.verb);

            // Verify verb type is irregular
            expect(result.type).toBe('irregular');

            // Verify irregular type is correct
            expect(result.irregularType).toBe(verbData.irregularType);
          },
        ),
        { numRuns: 100 },
      );
    });

    it('correctly identifies compound verbs and preserves prefix', () => {
      fc.assert(
        fc.property(fc.constantFrom(...KNOWN_COMPOUND_VERBS), verbData => {
          const result = classifyVerb(verbData.verb);

          // Verify verb type is irregular
          expect(result.type).toBe('irregular');

          // Verify irregular type is correct
          expect(result.irregularType).toBe(verbData.irregularType);

          // Verify compound prefix is preserved
          expect(result.compoundPrefix).toBe(verbData.prefix);
        }),
        { numRuns: 100 },
      );
    });

    it('stem + ending reconstructs the original verb for non-compound verbs', () => {
      fc.assert(
        fc.property(validVerbArb, verb => {
          const result = classifyVerb(verb);

          // For non-compound verbs, stem + ending should equal the original
          if (!result.compoundPrefix) {
            expect(result.stem + result.ending).toBe(verb);
          }
        }),
        { numRuns: 100 },
      );
    });

    it('dictionaryForm always matches the input', () => {
      fc.assert(
        fc.property(validVerbArb, verb => {
          const result = classifyVerb(verb);
          expect(result.dictionaryForm).toBe(verb);
        }),
        { numRuns: 100 },
      );
    });

    it('type is always one of godan, ichidan, or irregular', () => {
      fc.assert(
        fc.property(validVerbArb, verb => {
          const result = classifyVerb(verb);
          expect(['godan', 'ichidan', 'irregular']).toContain(result.type);
        }),
        { numRuns: 100 },
      );
    });

    it('irregular verbs always have an irregularType', () => {
      fc.assert(
        fc.property(irregularVerbArb, verb => {
          const result = classifyVerb(verb);
          if (result.type === 'irregular') {
            expect(result.irregularType).toBeDefined();
            expect(['suru', 'kuru', 'aru', 'iku', 'honorific']).toContain(
              result.irregularType,
            );
          }
        }),
        { numRuns: 100 },
      );
    });

    it('non-irregular verbs do not have irregularType', () => {
      fc.assert(
        fc.property(fc.oneof(godanVerbArb, ichidanVerbArb), verb => {
          const result = classifyVerb(verb);
          if (result.type !== 'irregular') {
            expect(result.irregularType).toBeUndefined();
          }
        }),
        { numRuns: 100 },
      );
    });

    it('romaji output is non-empty for valid verbs', () => {
      fc.assert(
        fc.property(validVerbArb, verb => {
          const result = classifyVerb(verb);
          expect(result.romaji.length).toBeGreaterThan(0);
        }),
        { numRuns: 100 },
      );
    });

    it('false Ichidan verbs are classified as Godan', () => {
      // Filter to only verbs that are in our test data
      const falseIchidanInTestData = FALSE_ICHIDAN_VERBS.filter(v =>
        KNOWN_GODAN_VERBS.some(g => g.verb === v),
      );

      if (falseIchidanInTestData.length > 0) {
        fc.assert(
          fc.property(fc.constantFrom(...falseIchidanInTestData), verb => {
            const result = classifyVerb(verb);
            expect(result.type).toBe('godan');
          }),
          { numRuns: 100 },
        );
      }
    });
  });
});
