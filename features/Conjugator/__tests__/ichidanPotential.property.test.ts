/**
 * Property-Based Tests for Ichidan Potential Dual Forms
 *
 * **Feature: japanese-verb-conjugator, Property 9: Ichidan Potential Dual Forms**
 * For any Ichidan verb, the potential form output SHALL include both the traditional
 * (-られる) and colloquial (-れる) variants.
 *
 * **Validates: Requirements 4.9**
 */

import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { classifyVerb } from '../lib/engine/classifyVerb';
import {
  conjugateIchidan,
  getIchidanTraditionalPotential,
  getIchidanColloquialPotential,
} from '../lib/engine/conjugateIchidan';

// ============================================================================
// Test Data - Ichidan Verbs
// ============================================================================

/**
 * Common Ichidan verbs for testing
 * These are verbs ending in -iru or -eru that conjugate as Ichidan
 */
const ICHIDAN_VERBS = [
  // -eru verbs
  {
    verb: '食べる',
    stem: '食べ',
    traditional: '食べられる',
    colloquial: '食べれる',
  },
  { verb: '見る', stem: '見', traditional: '見られる', colloquial: '見れる' },
  { verb: '寝る', stem: '寝', traditional: '寝られる', colloquial: '寝れる' },
  {
    verb: '起きる',
    stem: '起き',
    traditional: '起きられる',
    colloquial: '起きれる',
  },
  { verb: '着る', stem: '着', traditional: '着られる', colloquial: '着れる' },
  { verb: '出る', stem: '出', traditional: '出られる', colloquial: '出れる' },
  {
    verb: '開ける',
    stem: '開け',
    traditional: '開けられる',
    colloquial: '開けれる',
  },
  {
    verb: '閉める',
    stem: '閉め',
    traditional: '閉められる',
    colloquial: '閉めれる',
  },
  {
    verb: '教える',
    stem: '教え',
    traditional: '教えられる',
    colloquial: '教えれる',
  },
  {
    verb: '覚える',
    stem: '覚え',
    traditional: '覚えられる',
    colloquial: '覚えれる',
  },
  {
    verb: '忘れる',
    stem: '忘れ',
    traditional: '忘れられる',
    colloquial: '忘れれる',
  },
  {
    verb: '答える',
    stem: '答え',
    traditional: '答えられる',
    colloquial: '答えれる',
  },
  {
    verb: '考える',
    stem: '考え',
    traditional: '考えられる',
    colloquial: '考えれる',
  },
  {
    verb: '変える',
    stem: '変え',
    traditional: '変えられる',
    colloquial: '変えれる',
  },
  {
    verb: '決める',
    stem: '決め',
    traditional: '決められる',
    colloquial: '決めれる',
  },
];

// ============================================================================
// Property Tests
// ============================================================================

describe('Ichidan Potential Dual Forms Properties', () => {
  /**
   * **Feature: japanese-verb-conjugator, Property 9: Ichidan Potential Dual Forms**
   * **Validates: Requirements 4.9**
   */
  describe('Property 9: Ichidan Potential Dual Forms', () => {
    it('traditional potential form ends with られる', () => {
      fc.assert(
        fc.property(fc.constantFrom(...ICHIDAN_VERBS), verbData => {
          const verbInfo = classifyVerb(verbData.verb);
          const traditionalForm = getIchidanTraditionalPotential(verbInfo);

          expect(traditionalForm).toBe(verbData.traditional);
          expect(traditionalForm.endsWith('られる')).toBe(true);
        }),
        { numRuns: 100 },
      );
    });

    it('colloquial potential form ends with れる (not られる)', () => {
      fc.assert(
        fc.property(fc.constantFrom(...ICHIDAN_VERBS), verbData => {
          const verbInfo = classifyVerb(verbData.verb);
          const colloquialForm = getIchidanColloquialPotential(verbInfo);

          expect(colloquialForm).toBe(verbData.colloquial);
          expect(colloquialForm.endsWith('れる')).toBe(true);
          // Ensure it's NOT the traditional form
          expect(colloquialForm.endsWith('られる')).toBe(false);
        }),
        { numRuns: 100 },
      );
    });

    it('traditional form is stem + られる', () => {
      fc.assert(
        fc.property(fc.constantFrom(...ICHIDAN_VERBS), verbData => {
          const verbInfo = classifyVerb(verbData.verb);
          const traditionalForm = getIchidanTraditionalPotential(verbInfo);

          expect(traditionalForm).toBe(verbInfo.stem + 'られる');
        }),
        { numRuns: 100 },
      );
    });

    it('colloquial form is stem + れる', () => {
      fc.assert(
        fc.property(fc.constantFrom(...ICHIDAN_VERBS), verbData => {
          const verbInfo = classifyVerb(verbData.verb);
          const colloquialForm = getIchidanColloquialPotential(verbInfo);

          expect(colloquialForm).toBe(verbInfo.stem + 'れる');
        }),
        { numRuns: 100 },
      );
    });

    it('conjugateIchidan includes traditional potential in forms', () => {
      fc.assert(
        fc.property(fc.constantFrom(...ICHIDAN_VERBS), verbData => {
          const verbInfo = classifyVerb(verbData.verb);
          const forms = conjugateIchidan(verbInfo);

          // Find the potential-plain form
          const potentialForm = forms.find(f => f.id === 'potential-plain');
          expect(potentialForm).toBeDefined();

          // The main potential form should be the traditional -られる form
          expect(potentialForm!.hiragana).toBe(verbData.traditional);
        }),
        { numRuns: 100 },
      );
    });

    it('both potential forms preserve the verb stem', () => {
      fc.assert(
        fc.property(fc.constantFrom(...ICHIDAN_VERBS), verbData => {
          const verbInfo = classifyVerb(verbData.verb);
          const traditionalForm = getIchidanTraditionalPotential(verbInfo);
          const colloquialForm = getIchidanColloquialPotential(verbInfo);

          // Both forms should start with the stem
          expect(traditionalForm.startsWith(verbInfo.stem)).toBe(true);
          expect(colloquialForm.startsWith(verbInfo.stem)).toBe(true);
        }),
        { numRuns: 100 },
      );
    });

    it('colloquial form is shorter than traditional form by one character', () => {
      fc.assert(
        fc.property(fc.constantFrom(...ICHIDAN_VERBS), verbData => {
          const verbInfo = classifyVerb(verbData.verb);
          const traditionalForm = getIchidanTraditionalPotential(verbInfo);
          const colloquialForm = getIchidanColloquialPotential(verbInfo);

          // られる (3 chars) vs れる (2 chars) = 1 char difference
          expect(traditionalForm.length - colloquialForm.length).toBe(1);
        }),
        { numRuns: 100 },
      );
    });
  });
});
