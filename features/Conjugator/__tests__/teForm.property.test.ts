/**
 * Property-Based Tests for Te-form Sound Changes
 *
 * **Feature: japanese-verb-conjugator, Property 8: Te-form Sound Changes**
 * For any Godan verb, the te-form SHALL apply the correct sound change based on
 * the verb's final character (う/つ/る→って, む/ぶ/ぬ→んで, く→いて, ぐ→いで, す→して).
 *
 * **Validates: Requirements 4.1-4.6**
 */

import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { classifyVerb } from '../lib/engine/classifyVerb';
import { getGodanTeForm, getGodanTaForm } from '../lib/engine/conjugateGodan';

// ============================================================================
// Test Data - Godan Verbs by Ending Type
// ============================================================================

/**
 * Godan verbs ending in う (Requirements: 4.1)
 * Te-form: う → って
 */
const U_ENDING_VERBS = [
  { verb: '買う', teForm: '買って', taForm: '買った' },
  { verb: '会う', teForm: '会って', taForm: '会った' },
  { verb: '歌う', teForm: '歌って', taForm: '歌った' },
  { verb: '使う', teForm: '使って', taForm: '使った' },
  { verb: '洗う', teForm: '洗って', taForm: '洗った' },
];

/**
 * Godan verbs ending in つ (Requirements: 4.2)
 * Te-form: つ → って
 */
const TSU_ENDING_VERBS = [
  { verb: '待つ', teForm: '待って', taForm: '待った' },
  { verb: '持つ', teForm: '持って', taForm: '持った' },
  { verb: '立つ', teForm: '立って', taForm: '立った' },
  { verb: '勝つ', teForm: '勝って', taForm: '勝った' },
];

/**
 * Godan verbs ending in る (Requirements: 4.2)
 * Te-form: る → って
 */
const RU_GODAN_ENDING_VERBS = [
  { verb: '帰る', teForm: '帰って', taForm: '帰った' },
  { verb: '走る', teForm: '走って', taForm: '走った' },
  { verb: '知る', teForm: '知って', taForm: '知った' },
  { verb: '切る', teForm: '切って', taForm: '切った' },
  { verb: '入る', teForm: '入って', taForm: '入った' },
];

/**
 * Godan verbs ending in む (Requirements: 4.3)
 * Te-form: む → んで
 */
const MU_ENDING_VERBS = [
  { verb: '読む', teForm: '読んで', taForm: '読んだ' },
  { verb: '飲む', teForm: '飲んで', taForm: '飲んだ' },
  { verb: '休む', teForm: '休んで', taForm: '休んだ' },
  { verb: '住む', teForm: '住んで', taForm: '住んだ' },
];

/**
 * Godan verbs ending in ぶ (Requirements: 4.3)
 * Te-form: ぶ → んで
 */
const BU_ENDING_VERBS = [
  { verb: '遊ぶ', teForm: '遊んで', taForm: '遊んだ' },
  { verb: '飛ぶ', teForm: '飛んで', taForm: '飛んだ' },
  { verb: '呼ぶ', teForm: '呼んで', taForm: '呼んだ' },
  { verb: '選ぶ', teForm: '選んで', taForm: '選んだ' },
];

/**
 * Godan verbs ending in ぬ (Requirements: 4.3)
 * Te-form: ぬ → んで
 */
const NU_ENDING_VERBS = [{ verb: '死ぬ', teForm: '死んで', taForm: '死んだ' }];

/**
 * Godan verbs ending in く (Requirements: 4.4)
 * Te-form: く → いて (except 行く)
 */
const KU_ENDING_VERBS = [
  { verb: '書く', teForm: '書いて', taForm: '書いた' },
  { verb: '聞く', teForm: '聞いて', taForm: '聞いた' },
  { verb: '歩く', teForm: '歩いて', taForm: '歩いた' },
  { verb: '置く', teForm: '置いて', taForm: '置いた' },
  { verb: '開く', teForm: '開いて', taForm: '開いた' },
];

/**
 * 行く is irregular: te-form is 行って (not 行いて)
 * Requirements: 4.4
 */
const IKU_VERB = { verb: '行く', teForm: '行って', taForm: '行った' };

/**
 * Godan verbs ending in ぐ (Requirements: 4.5)
 * Te-form: ぐ → いで
 */
const GU_ENDING_VERBS = [
  { verb: '泳ぐ', teForm: '泳いで', taForm: '泳いだ' },
  { verb: '急ぐ', teForm: '急いで', taForm: '急いだ' },
  { verb: '脱ぐ', teForm: '脱いで', taForm: '脱いだ' },
];

/**
 * Godan verbs ending in す (Requirements: 4.6)
 * Te-form: す → して
 */
const SU_ENDING_VERBS = [
  { verb: '話す', teForm: '話して', taForm: '話した' },
  { verb: '出す', teForm: '出して', taForm: '出した' },
  { verb: '消す', teForm: '消して', taForm: '消した' },
  { verb: '押す', teForm: '押して', taForm: '押した' },
  { verb: '返す', teForm: '返して', taForm: '返した' },
];

/**
 * All Godan verbs for general testing
 */
const ALL_GODAN_VERBS = [
  ...U_ENDING_VERBS,
  ...TSU_ENDING_VERBS,
  ...RU_GODAN_ENDING_VERBS,
  ...MU_ENDING_VERBS,
  ...BU_ENDING_VERBS,
  ...NU_ENDING_VERBS,
  ...KU_ENDING_VERBS,
  ...GU_ENDING_VERBS,
  ...SU_ENDING_VERBS,
  IKU_VERB,
];

// ============================================================================
// Property Tests
// ============================================================================

describe('Te-form Sound Changes Properties', () => {
  /**
   * **Feature: japanese-verb-conjugator, Property 8: Te-form Sound Changes**
   * **Validates: Requirements 4.1-4.6**
   */
  describe('Property 8: Te-form Sound Changes', () => {
    it('う-ending verbs produce って te-form (Requirements: 4.1)', () => {
      fc.assert(
        fc.property(fc.constantFrom(...U_ENDING_VERBS), verbData => {
          const verbInfo = classifyVerb(verbData.verb);
          const teForm = getGodanTeForm(verbInfo);
          expect(teForm).toBe(verbData.teForm);
          expect(teForm.endsWith('って')).toBe(true);
        }),
        { numRuns: 100 },
      );
    });

    it('つ-ending verbs produce って te-form (Requirements: 4.2)', () => {
      fc.assert(
        fc.property(fc.constantFrom(...TSU_ENDING_VERBS), verbData => {
          const verbInfo = classifyVerb(verbData.verb);
          const teForm = getGodanTeForm(verbInfo);
          expect(teForm).toBe(verbData.teForm);
          expect(teForm.endsWith('って')).toBe(true);
        }),
        { numRuns: 100 },
      );
    });

    it('る-ending Godan verbs produce って te-form (Requirements: 4.2)', () => {
      fc.assert(
        fc.property(fc.constantFrom(...RU_GODAN_ENDING_VERBS), verbData => {
          const verbInfo = classifyVerb(verbData.verb);
          const teForm = getGodanTeForm(verbInfo);
          expect(teForm).toBe(verbData.teForm);
          expect(teForm.endsWith('って')).toBe(true);
        }),
        { numRuns: 100 },
      );
    });

    it('む-ending verbs produce んで te-form (Requirements: 4.3)', () => {
      fc.assert(
        fc.property(fc.constantFrom(...MU_ENDING_VERBS), verbData => {
          const verbInfo = classifyVerb(verbData.verb);
          const teForm = getGodanTeForm(verbInfo);
          expect(teForm).toBe(verbData.teForm);
          expect(teForm.endsWith('んで')).toBe(true);
        }),
        { numRuns: 100 },
      );
    });

    it('ぶ-ending verbs produce んで te-form (Requirements: 4.3)', () => {
      fc.assert(
        fc.property(fc.constantFrom(...BU_ENDING_VERBS), verbData => {
          const verbInfo = classifyVerb(verbData.verb);
          const teForm = getGodanTeForm(verbInfo);
          expect(teForm).toBe(verbData.teForm);
          expect(teForm.endsWith('んで')).toBe(true);
        }),
        { numRuns: 100 },
      );
    });

    it('ぬ-ending verbs produce んで te-form (Requirements: 4.3)', () => {
      fc.assert(
        fc.property(fc.constantFrom(...NU_ENDING_VERBS), verbData => {
          const verbInfo = classifyVerb(verbData.verb);
          const teForm = getGodanTeForm(verbInfo);
          expect(teForm).toBe(verbData.teForm);
          expect(teForm.endsWith('んで')).toBe(true);
        }),
        { numRuns: 100 },
      );
    });

    it('く-ending verbs produce いて te-form (Requirements: 4.4)', () => {
      fc.assert(
        fc.property(fc.constantFrom(...KU_ENDING_VERBS), verbData => {
          const verbInfo = classifyVerb(verbData.verb);
          const teForm = getGodanTeForm(verbInfo);
          expect(teForm).toBe(verbData.teForm);
          expect(teForm.endsWith('いて')).toBe(true);
        }),
        { numRuns: 100 },
      );
    });

    it('行く produces irregular って te-form (Requirements: 4.4)', () => {
      const verbInfo = classifyVerb(IKU_VERB.verb);
      const teForm = getGodanTeForm(verbInfo);
      expect(teForm).toBe(IKU_VERB.teForm);
      expect(teForm).toBe('行って');
      // Verify it's NOT いて (the regular く ending)
      expect(teForm.endsWith('いて')).toBe(false);
    });

    it('ぐ-ending verbs produce いで te-form (Requirements: 4.5)', () => {
      fc.assert(
        fc.property(fc.constantFrom(...GU_ENDING_VERBS), verbData => {
          const verbInfo = classifyVerb(verbData.verb);
          const teForm = getGodanTeForm(verbInfo);
          expect(teForm).toBe(verbData.teForm);
          expect(teForm.endsWith('いで')).toBe(true);
        }),
        { numRuns: 100 },
      );
    });

    it('す-ending verbs produce して te-form (Requirements: 4.6)', () => {
      fc.assert(
        fc.property(fc.constantFrom(...SU_ENDING_VERBS), verbData => {
          const verbInfo = classifyVerb(verbData.verb);
          const teForm = getGodanTeForm(verbInfo);
          expect(teForm).toBe(verbData.teForm);
          expect(teForm.endsWith('して')).toBe(true);
        }),
        { numRuns: 100 },
      );
    });

    it('ta-form follows same sound change pattern as te-form', () => {
      fc.assert(
        fc.property(fc.constantFrom(...ALL_GODAN_VERBS), verbData => {
          const verbInfo = classifyVerb(verbData.verb);
          const taForm = getGodanTaForm(verbInfo);
          expect(taForm).toBe(verbData.taForm);
        }),
        { numRuns: 100 },
      );
    });

    it('te-form preserves verb stem', () => {
      fc.assert(
        fc.property(fc.constantFrom(...ALL_GODAN_VERBS), verbData => {
          const verbInfo = classifyVerb(verbData.verb);
          const teForm = getGodanTeForm(verbInfo);
          // Te-form should start with the stem
          expect(teForm.startsWith(verbInfo.stem)).toBe(true);
        }),
        { numRuns: 100 },
      );
    });

    it('all Godan verbs produce valid te-forms', () => {
      fc.assert(
        fc.property(fc.constantFrom(...ALL_GODAN_VERBS), verbData => {
          const verbInfo = classifyVerb(verbData.verb);
          const teForm = getGodanTeForm(verbInfo);

          // Te-form should end with て or で
          const validEndings = ['って', 'んで', 'いて', 'いで', 'して'];
          const hasValidEnding = validEndings.some(ending =>
            teForm.endsWith(ending),
          );
          expect(hasValidEnding).toBe(true);
        }),
        { numRuns: 100 },
      );
    });
  });
});
