/**
 * Property-Based Tests for Compound Verb Prefix Preservation
 *
 * **Feature: japanese-verb-conjugator, Property 7: Compound Verb Prefix Preservation**
 * For any compound verb (する-compound or 来る-compound), all conjugated forms
 * SHALL preserve the original prefix while only conjugating the する or 来る portion.
 *
 * **Validates: Requirements 2.7, 2.8**
 */

import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { classifyVerb } from '../lib/engine/classifyVerb';
import { conjugateIrregular } from '../lib/engine/conjugateIrregular';
import {
  isSuruCompound,
  isKuruCompound,
  getSuruCompoundPrefix,
  getKuruCompoundPrefix,
  COMMON_SURU_COMPOUNDS,
  COMMON_KURU_COMPOUNDS,
} from '../lib/engine/conjugateCompound';

// ============================================================================
// Test Data
// ============================================================================

/**
 * する-compound verbs with their prefixes
 */
const SURU_COMPOUND_TEST_DATA = [
  { verb: '勉強する', prefix: '勉強' },
  { verb: '運動する', prefix: '運動' },
  { verb: '料理する', prefix: '料理' },
  { verb: '掃除する', prefix: '掃除' },
  { verb: '洗濯する', prefix: '洗濯' },
  { verb: '買い物する', prefix: '買い物' },
  { verb: '散歩する', prefix: '散歩' },
  { verb: '旅行する', prefix: '旅行' },
  { verb: '結婚する', prefix: '結婚' },
  { verb: '卒業する', prefix: '卒業' },
];

/**
 * 来る-compound verbs with their prefixes
 */
const KURU_COMPOUND_TEST_DATA = [
  { verb: '持ってくる', prefix: '持って' },
  { verb: '帰ってくる', prefix: '帰って' },
  { verb: '戻ってくる', prefix: '戻って' },
  { verb: '連れてくる', prefix: '連れて' },
  { verb: '送ってくる', prefix: '送って' },
];

// ============================================================================
// Property Tests
// ============================================================================

describe('Compound Verb Prefix Preservation Properties', () => {
  /**
   * **Feature: japanese-verb-conjugator, Property 7: Compound Verb Prefix Preservation**
   * **Validates: Requirements 2.7, 2.8**
   */
  describe('Property 7: Compound Verb Prefix Preservation', () => {
    describe('する-compound verbs (Requirements: 2.7)', () => {
      it('all conjugated forms contain the original prefix', () => {
        fc.assert(
          fc.property(fc.constantFrom(...SURU_COMPOUND_TEST_DATA), data => {
            const verbInfo = classifyVerb(data.verb);
            const forms = conjugateIrregular(verbInfo);

            // Every form should contain the prefix
            forms.forEach(form => {
              // Check if the hiragana form contains the prefix
              // Note: honorific forms may have お prefix before the compound prefix
              const containsPrefix =
                form.hiragana.includes(data.prefix) ||
                form.hiragana.startsWith('お' + data.prefix);
              expect(containsPrefix).toBe(true);
            });
          }),
          { numRuns: 100 },
        );
      });

      it('compound prefix is correctly identified', () => {
        fc.assert(
          fc.property(fc.constantFrom(...SURU_COMPOUND_TEST_DATA), data => {
            expect(isSuruCompound(data.verb)).toBe(true);
            expect(getSuruCompoundPrefix(data.verb)).toBe(data.prefix);
          }),
          { numRuns: 100 },
        );
      });

      it('verb is classified as irregular suru type', () => {
        fc.assert(
          fc.property(fc.constantFrom(...SURU_COMPOUND_TEST_DATA), data => {
            const verbInfo = classifyVerb(data.verb);
            expect(verbInfo.type).toBe('irregular');
            expect(verbInfo.irregularType).toBe('suru');
            expect(verbInfo.compoundPrefix).toBe(data.prefix);
          }),
          { numRuns: 100 },
        );
      });

      it('dictionary form preserves prefix + する', () => {
        fc.assert(
          fc.property(fc.constantFrom(...SURU_COMPOUND_TEST_DATA), data => {
            const verbInfo = classifyVerb(data.verb);
            const forms = conjugateIrregular(verbInfo);
            const dictForm = forms.find(f => f.id === 'dictionary');

            expect(dictForm?.hiragana).toBe(data.prefix + 'する');
          }),
          { numRuns: 100 },
        );
      });

      it('te-form preserves prefix + して', () => {
        fc.assert(
          fc.property(fc.constantFrom(...SURU_COMPOUND_TEST_DATA), data => {
            const verbInfo = classifyVerb(data.verb);
            const forms = conjugateIrregular(verbInfo);
            const teForm = forms.find(f => f.id === 'te');

            expect(teForm?.hiragana).toBe(data.prefix + 'して');
          }),
          { numRuns: 100 },
        );
      });

      it('masu-form preserves prefix + します', () => {
        fc.assert(
          fc.property(fc.constantFrom(...SURU_COMPOUND_TEST_DATA), data => {
            const verbInfo = classifyVerb(data.verb);
            const forms = conjugateIrregular(verbInfo);
            const masuForm = forms.find(f => f.id === 'masu');

            expect(masuForm?.hiragana).toBe(data.prefix + 'します');
          }),
          { numRuns: 100 },
        );
      });

      it('potential form preserves prefix + できる', () => {
        fc.assert(
          fc.property(fc.constantFrom(...SURU_COMPOUND_TEST_DATA), data => {
            const verbInfo = classifyVerb(data.verb);
            const forms = conjugateIrregular(verbInfo);
            const potentialForm = forms.find(f => f.id === 'potential-plain');

            expect(potentialForm?.hiragana).toBe(data.prefix + 'できる');
          }),
          { numRuns: 100 },
        );
      });
    });

    describe('来る-compound verbs (Requirements: 2.8)', () => {
      it('all conjugated forms contain the original prefix', () => {
        fc.assert(
          fc.property(fc.constantFrom(...KURU_COMPOUND_TEST_DATA), data => {
            const verbInfo = classifyVerb(data.verb);
            const forms = conjugateIrregular(verbInfo);

            // Every form should contain the prefix
            forms.forEach(form => {
              // Check if the hiragana form contains the prefix
              // Note: honorific forms may have お prefix before the compound prefix
              const containsPrefix =
                form.hiragana.includes(data.prefix) ||
                form.hiragana.startsWith('お' + data.prefix);
              expect(containsPrefix).toBe(true);
            });
          }),
          { numRuns: 100 },
        );
      });

      it('compound prefix is correctly identified', () => {
        fc.assert(
          fc.property(fc.constantFrom(...KURU_COMPOUND_TEST_DATA), data => {
            expect(isKuruCompound(data.verb)).toBe(true);
            expect(getKuruCompoundPrefix(data.verb)).toBe(data.prefix);
          }),
          { numRuns: 100 },
        );
      });

      it('verb is classified as irregular kuru type', () => {
        fc.assert(
          fc.property(fc.constantFrom(...KURU_COMPOUND_TEST_DATA), data => {
            const verbInfo = classifyVerb(data.verb);
            expect(verbInfo.type).toBe('irregular');
            expect(verbInfo.irregularType).toBe('kuru');
            expect(verbInfo.compoundPrefix).toBe(data.prefix);
          }),
          { numRuns: 100 },
        );
      });

      it('dictionary form preserves prefix + くる', () => {
        fc.assert(
          fc.property(fc.constantFrom(...KURU_COMPOUND_TEST_DATA), data => {
            const verbInfo = classifyVerb(data.verb);
            const forms = conjugateIrregular(verbInfo);
            const dictForm = forms.find(f => f.id === 'dictionary');

            expect(dictForm?.hiragana).toBe(data.prefix + 'くる');
          }),
          { numRuns: 100 },
        );
      });

      it('te-form preserves prefix + きて', () => {
        fc.assert(
          fc.property(fc.constantFrom(...KURU_COMPOUND_TEST_DATA), data => {
            const verbInfo = classifyVerb(data.verb);
            const forms = conjugateIrregular(verbInfo);
            const teForm = forms.find(f => f.id === 'te');

            expect(teForm?.hiragana).toBe(data.prefix + 'きて');
          }),
          { numRuns: 100 },
        );
      });

      it('masu-form preserves prefix + きます', () => {
        fc.assert(
          fc.property(fc.constantFrom(...KURU_COMPOUND_TEST_DATA), data => {
            const verbInfo = classifyVerb(data.verb);
            const forms = conjugateIrregular(verbInfo);
            const masuForm = forms.find(f => f.id === 'masu');

            expect(masuForm?.hiragana).toBe(data.prefix + 'きます');
          }),
          { numRuns: 100 },
        );
      });

      it('negative form preserves prefix + こない', () => {
        fc.assert(
          fc.property(fc.constantFrom(...KURU_COMPOUND_TEST_DATA), data => {
            const verbInfo = classifyVerb(data.verb);
            const forms = conjugateIrregular(verbInfo);
            const naiForm = forms.find(f => f.id === 'nai');

            expect(naiForm?.hiragana).toBe(data.prefix + 'こない');
          }),
          { numRuns: 100 },
        );
      });
    });

    describe('General compound verb properties', () => {
      it('base する is not a compound verb', () => {
        expect(isSuruCompound('する')).toBe(false);
      });

      it('base 来る is not a compound verb', () => {
        expect(isKuruCompound('来る')).toBe(false);
        expect(isKuruCompound('くる')).toBe(false);
      });

      it('all common する-compounds are recognized', () => {
        fc.assert(
          fc.property(fc.constantFrom(...COMMON_SURU_COMPOUNDS), verb => {
            expect(isSuruCompound(verb)).toBe(true);
          }),
          { numRuns: 100 },
        );
      });

      it('all common 来る-compounds are recognized', () => {
        fc.assert(
          fc.property(fc.constantFrom(...COMMON_KURU_COMPOUNDS), verb => {
            expect(isKuruCompound(verb)).toBe(true);
          }),
          { numRuns: 100 },
        );
      });
    });
  });
});
