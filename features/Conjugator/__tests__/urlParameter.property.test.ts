/**
 * Property-Based Tests for URL Parameter Conjugation
 *
 * **Feature: japanese-verb-conjugator, Property 17: URL Parameter Conjugation**
 *
 * For any valid verb parameter in a URL, visiting that URL SHALL trigger
 * conjugation and display results for that verb.
 *
 * **Validates: Requirements 12.2**
 */

import { describe, it, expect, beforeEach } from 'vitest';
import * as fc from 'fast-check';
import useConjugatorStore from '../store/useConjugatorStore';
import { isValidVerb, getVerbInfo } from '../lib/engine';
import type { VerbInfo } from '../types';

// ============================================================================
// Test Data - Sample Verbs
// ============================================================================

/**
 * Sample valid Japanese verbs for testing URL parameters
 */
const VALID_VERBS = [
  // Godan verbs
  '書く',
  '読む',
  '話す',
  '待つ',
  '買う',
  '泳ぐ',
  '死ぬ',
  '遊ぶ',
  '帰る',
  '歩く',
  '飲む',
  '聞く',
  '作る',
  '使う',
  '思う',
  // Ichidan verbs
  '食べる',
  '見る',
  '起きる',
  '寝る',
  '着る',
  '出る',
  '開ける',
  '閉める',
  '教える',
  '覚える',
  // Irregular verbs
  'する',
  '来る',
  'ある',
  '行く',
  // Compound verbs
  '勉強する',
  '運動する',
  '料理する',
];

/**
 * Sample invalid inputs that should not trigger conjugation
 */
const INVALID_INPUTS = [
  '', // Empty string
  '   ', // Whitespace only
  'hello', // English text
  '123', // Numbers
  'abc123', // Mixed
];

// ============================================================================
// Property 17: URL Parameter Conjugation
// ============================================================================

describe('URL Parameter Conjugation Properties', () => {
  /**
   * Reset store state before each test
   */
  beforeEach(() => {
    useConjugatorStore.getState().reset();
  });

  /**
   * **Feature: japanese-verb-conjugator, Property 17: URL Parameter Conjugation**
   *
   * For any valid verb parameter in a URL, visiting that URL SHALL trigger
   * conjugation and display results for that verb.
   *
   * **Validates: Requirements 12.2**
   */
  describe('Property 17: URL Parameter Conjugation', () => {
    it('initFromUrlParams triggers conjugation for valid verbs', () => {
      fc.assert(
        fc.property(fc.constantFrom(...VALID_VERBS), verb => {
          // Reset store state
          useConjugatorStore.getState().reset();

          // Simulate URL parameter initialization
          const result = useConjugatorStore
            .getState()
            .initFromUrlParams({ verb });

          // Should return true indicating params were processed
          expect(result).toBe(true);

          // Get current state
          const state = useConjugatorStore.getState();

          // Input text should be set to the verb
          expect(state.inputText).toBe(verb);

          // Result should be populated (conjugation was triggered)
          expect(state.result).not.toBeNull();

          // Result should contain the correct verb
          if (state.result) {
            expect(state.result.verb.dictionaryForm).toBe(verb);
          }
        }),
        { numRuns: 100 },
      );
    });

    it('initFromUrlParams returns false for empty verb parameter', () => {
      // Reset store state
      useConjugatorStore.getState().reset();

      // Simulate URL parameter initialization with no verb
      const result = useConjugatorStore.getState().initFromUrlParams({});

      // Should return false indicating no params were processed
      expect(result).toBe(false);

      // State should remain unchanged
      const state = useConjugatorStore.getState();
      expect(state.inputText).toBe('');
      expect(state.result).toBeNull();
    });

    it('initFromUrlParams returns false for undefined verb parameter', () => {
      // Reset store state
      useConjugatorStore.getState().reset();

      // Simulate URL parameter initialization with undefined verb
      const result = useConjugatorStore
        .getState()
        .initFromUrlParams({ verb: undefined });

      // Should return false indicating no params were processed
      expect(result).toBe(false);
    });

    it('conjugation result matches getVerbInfo for valid verbs', () => {
      fc.assert(
        fc.property(fc.constantFrom(...VALID_VERBS), verb => {
          // Reset store state
          useConjugatorStore.getState().reset();

          // Get expected verb info
          const expectedVerbInfo = getVerbInfo(verb);

          // Simulate URL parameter initialization
          useConjugatorStore.getState().initFromUrlParams({ verb });

          // Get current state
          const state = useConjugatorStore.getState();

          // Result should match expected verb info
          if (state.result && expectedVerbInfo) {
            expect(state.result.verb.type).toBe(expectedVerbInfo.type);
            expect(state.result.verb.stem).toBe(expectedVerbInfo.stem);
            expect(state.result.verb.ending).toBe(expectedVerbInfo.ending);
            expect(state.result.verb.romaji).toBe(expectedVerbInfo.romaji);
          }
        }),
        { numRuns: 100 },
      );
    });

    it('conjugation produces forms for all valid verbs', () => {
      fc.assert(
        fc.property(fc.constantFrom(...VALID_VERBS), verb => {
          // Reset store state
          useConjugatorStore.getState().reset();

          // Simulate URL parameter initialization
          useConjugatorStore.getState().initFromUrlParams({ verb });

          // Get current state
          const state = useConjugatorStore.getState();

          // Result should have forms
          expect(state.result).not.toBeNull();
          if (state.result) {
            expect(state.result.forms.length).toBeGreaterThan(0);
          }
        }),
        { numRuns: 100 },
      );
    });

    it('invalid verb parameters set error state', () => {
      fc.assert(
        fc.property(fc.constantFrom(...INVALID_INPUTS), input => {
          // Skip empty string as it returns false early
          if (input === '') return;

          // Reset store state
          useConjugatorStore.getState().reset();

          // Simulate URL parameter initialization with invalid input
          const result = useConjugatorStore
            .getState()
            .initFromUrlParams({ verb: input });

          // Get current state
          const state = useConjugatorStore.getState();

          // For whitespace-only inputs, should have error
          if (input.trim() === '') {
            expect(state.error).not.toBeNull();
            expect(state.result).toBeNull();
          }
        }),
        { numRuns: 50 },
      );
    });

    it('URL parameter conjugation is deterministic', () => {
      fc.assert(
        fc.property(fc.constantFrom(...VALID_VERBS), verb => {
          // First conjugation
          useConjugatorStore.getState().reset();
          useConjugatorStore.getState().initFromUrlParams({ verb });
          const result1 = useConjugatorStore.getState().result;

          // Second conjugation
          useConjugatorStore.getState().reset();
          useConjugatorStore.getState().initFromUrlParams({ verb });
          const result2 = useConjugatorStore.getState().result;

          // Results should be equivalent (except timestamp)
          expect(result1).not.toBeNull();
          expect(result2).not.toBeNull();

          if (result1 && result2) {
            expect(result1.verb.dictionaryForm).toBe(
              result2.verb.dictionaryForm,
            );
            expect(result1.verb.type).toBe(result2.verb.type);
            expect(result1.verb.stem).toBe(result2.verb.stem);
            expect(result1.forms.length).toBe(result2.forms.length);

            // Compare each form
            for (let i = 0; i < result1.forms.length; i++) {
              expect(result1.forms[i].id).toBe(result2.forms[i].id);
              expect(result1.forms[i].kanji).toBe(result2.forms[i].kanji);
              expect(result1.forms[i].hiragana).toBe(result2.forms[i].hiragana);
              expect(result1.forms[i].romaji).toBe(result2.forms[i].romaji);
            }
          }
        }),
        { numRuns: 100 },
      );
    });

    it('history is updated after URL parameter conjugation', () => {
      fc.assert(
        fc.property(fc.constantFrom(...VALID_VERBS), verb => {
          // Reset store state and clear history
          useConjugatorStore.getState().reset();
          useConjugatorStore.getState().clearHistory();

          // Simulate URL parameter initialization
          useConjugatorStore.getState().initFromUrlParams({ verb });

          // Get current state
          const state = useConjugatorStore.getState();

          // History should contain the conjugated verb
          expect(state.history.length).toBeGreaterThan(0);
          expect(state.history[0].verb).toBe(verb);
        }),
        { numRuns: 100 },
      );
    });
  });

  describe('Edge Cases', () => {
    it('handles URL-encoded verb parameters', () => {
      // Test with a verb that would be URL-encoded
      const verb = '食べる';
      const encoded = encodeURIComponent(verb);
      const decoded = decodeURIComponent(encoded);

      // Reset store state
      useConjugatorStore.getState().reset();

      // Simulate URL parameter initialization with decoded verb
      useConjugatorStore.getState().initFromUrlParams({ verb: decoded });

      // Get current state
      const state = useConjugatorStore.getState();

      // Should successfully conjugate
      expect(state.result).not.toBeNull();
      if (state.result) {
        expect(state.result.verb.dictionaryForm).toBe(verb);
      }
    });

    it('handles compound verbs in URL parameters', () => {
      const compoundVerbs = ['勉強する', '運動する', '料理する'];

      for (const verb of compoundVerbs) {
        // Reset store state
        useConjugatorStore.getState().reset();

        // Simulate URL parameter initialization
        useConjugatorStore.getState().initFromUrlParams({ verb });

        // Get current state
        const state = useConjugatorStore.getState();

        // Should successfully conjugate compound verbs
        expect(state.result).not.toBeNull();
        if (state.result) {
          expect(state.result.verb.dictionaryForm).toBe(verb);
        }
      }
    });
  });
});
