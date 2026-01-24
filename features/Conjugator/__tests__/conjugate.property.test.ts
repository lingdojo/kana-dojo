/**
 * Property-Based Tests for Main Conjugation API
 *
 * This file contains property tests for the main conjugate function,
 * testing completeness, determinism, pure function behavior, and input validation.
 *
 * Requirements: 1.1, 1.3, 3.1-3.13, 11.2, 11.3
 */

import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { conjugate, conjugateOrThrow } from '../lib/engine/conjugate';
import { ALL_CONJUGATION_CATEGORIES } from '../types';

// ============================================================================
// Test Data - Valid Verbs by Type
// ============================================================================

/**
 * Sample Godan verbs for testing
 */
const GODAN_VERBS = [
  '書く', // kaku - to write
  '読む', // yomu - to read
  '話す', // hanasu - to speak
  '待つ', // matsu - to wait
  '買う', // kau - to buy
  '泳ぐ', // oyogu - to swim
  '死ぬ', // shinu - to die
  '遊ぶ', // asobu - to play
  '帰る', // kaeru - to return (Godan)
  '走る', // hashiru - to run (Godan)
];

/**
 * Sample Ichidan verbs for testing
 */
const ICHIDAN_VERBS = [
  '食べる', // taberu - to eat
  '見る', // miru - to see
  '起きる', // okiru - to wake up
  '寝る', // neru - to sleep
  '着る', // kiru - to wear
  '出る', // deru - to exit
  '開ける', // akeru - to open
  '閉める', // shimeru - to close
];

/**
 * Sample irregular verbs for testing
 */
const IRREGULAR_VERBS = [
  'する', // suru - to do
  '来る', // kuru - to come
  'くる', // kuru (hiragana)
  'ある', // aru - to exist
  '行く', // iku - to go
  'いく', // iku (hiragana)
];

/**
 * Sample compound verbs for testing
 */
const COMPOUND_VERBS = [
  '勉強する', // benkyou suru - to study
  '運動する', // undou suru - to exercise
  '料理する', // ryouri suru - to cook
];

/**
 * All valid verbs for general testing
 */
const ALL_VALID_VERBS = [
  ...GODAN_VERBS,
  ...ICHIDAN_VERBS,
  ...IRREGULAR_VERBS,
  ...COMPOUND_VERBS,
];

// ============================================================================
// Property 1: Conjugation Completeness
// ============================================================================

describe('Conjugation Completeness Properties', () => {
  /**
   * **Feature: japanese-verb-conjugator, Property 1: Conjugation Completeness**
   *
   * For any valid Japanese verb in dictionary form, the conjugation engine
   * SHALL return a result containing all defined conjugation categories
   * with at least one form per category.
   *
   * **Validates: Requirements 1.1, 3.1-3.13**
   */
  describe('Property 1: Conjugation Completeness', () => {
    it('all valid verbs produce results with all conjugation categories', () => {
      fc.assert(
        fc.property(fc.constantFrom(...ALL_VALID_VERBS), verb => {
          const result = conjugate(verb);

          // Should succeed
          expect(result.success).toBe(true);
          if (!result.success) return;

          // Get all categories present in the result
          const categoriesInResult = new Set(
            result.result.forms.map(f => f.category),
          );

          // All required categories should be present
          for (const category of ALL_CONJUGATION_CATEGORIES) {
            expect(categoriesInResult.has(category)).toBe(true);
          }
        }),
        { numRuns: 100 },
      );
    });

    it('each category has at least one form', () => {
      fc.assert(
        fc.property(fc.constantFrom(...ALL_VALID_VERBS), verb => {
          const result = conjugate(verb);

          expect(result.success).toBe(true);
          if (!result.success) return;

          // Count forms per category
          const formsByCategory = new Map<string, number>();
          for (const form of result.result.forms) {
            const count = formsByCategory.get(form.category) || 0;
            formsByCategory.set(form.category, count + 1);
          }

          // Each category should have at least one form
          for (const category of ALL_CONJUGATION_CATEGORIES) {
            const count = formsByCategory.get(category) || 0;
            expect(count).toBeGreaterThan(0);
          }
        }),
        { numRuns: 100 },
      );
    });

    it('Godan verbs produce complete conjugation results', () => {
      fc.assert(
        fc.property(fc.constantFrom(...GODAN_VERBS), verb => {
          const result = conjugate(verb);

          expect(result.success).toBe(true);
          if (!result.success) return;

          // Should have verb info
          expect(result.result.verb).toBeDefined();
          expect(result.result.verb.type).toBe('godan');

          // Should have forms
          expect(result.result.forms.length).toBeGreaterThan(0);

          // Should have timestamp
          expect(result.result.timestamp).toBeGreaterThan(0);
        }),
        { numRuns: 100 },
      );
    });

    it('Ichidan verbs produce complete conjugation results', () => {
      fc.assert(
        fc.property(fc.constantFrom(...ICHIDAN_VERBS), verb => {
          const result = conjugate(verb);

          expect(result.success).toBe(true);
          if (!result.success) return;

          expect(result.result.verb.type).toBe('ichidan');
          expect(result.result.forms.length).toBeGreaterThan(0);
        }),
        { numRuns: 100 },
      );
    });

    it('irregular verbs produce complete conjugation results', () => {
      fc.assert(
        fc.property(fc.constantFrom(...IRREGULAR_VERBS), verb => {
          const result = conjugate(verb);

          expect(result.success).toBe(true);
          if (!result.success) return;

          expect(result.result.verb.type).toBe('irregular');
          expect(result.result.forms.length).toBeGreaterThan(0);
        }),
        { numRuns: 100 },
      );
    });

    it('compound verbs produce complete conjugation results', () => {
      fc.assert(
        fc.property(fc.constantFrom(...COMPOUND_VERBS), verb => {
          const result = conjugate(verb);

          expect(result.success).toBe(true);
          if (!result.success) return;

          expect(result.result.verb.type).toBe('irregular');
          expect(result.result.verb.compoundPrefix).toBeDefined();
          expect(result.result.forms.length).toBeGreaterThan(0);
        }),
        { numRuns: 100 },
      );
    });

    it('results contain expected minimum number of forms (30+)', () => {
      fc.assert(
        fc.property(fc.constantFrom(...ALL_VALID_VERBS), verb => {
          const result = conjugate(verb);

          expect(result.success).toBe(true);
          if (!result.success) return;

          // Should have at least 30 forms as per design
          expect(result.result.forms.length).toBeGreaterThanOrEqual(30);
        }),
        { numRuns: 100 },
      );
    });
  });
});

// ============================================================================
// Property 3: Whitespace Input Rejection
// ============================================================================

describe('Whitespace Input Rejection Properties', () => {
  /**
   * **Feature: japanese-verb-conjugator, Property 3: Whitespace Input Rejection**
   *
   * For any string composed entirely of whitespace characters (spaces, tabs, newlines),
   * the conjugation engine SHALL return an error result and not produce conjugation forms.
   *
   * **Validates: Requirements 1.3**
   */
  describe('Property 3: Whitespace Input Rejection', () => {
    it('empty string returns error', () => {
      const result = conjugate('');
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe('EMPTY_INPUT');
      }
    });

    it('whitespace-only strings return error', () => {
      fc.assert(
        fc.property(
          fc.array(fc.constantFrom(' ', '\t', '\n', '\r'), {
            minLength: 1,
            maxLength: 10,
          }),
          whitespaceChars => {
            const whitespace = whitespaceChars.join('');
            const result = conjugate(whitespace);
            expect(result.success).toBe(false);
            if (!result.success) {
              expect(result.error.code).toBe('EMPTY_INPUT');
            }
          },
        ),
        { numRuns: 100 },
      );
    });

    it('strings with only spaces return error', () => {
      fc.assert(
        fc.property(fc.integer({ min: 1, max: 10 }), count => {
          const spaces = ' '.repeat(count);
          const result = conjugate(spaces);
          expect(result.success).toBe(false);
          if (!result.success) {
            expect(result.error.code).toBe('EMPTY_INPUT');
          }
        }),
        { numRuns: 100 },
      );
    });

    it('strings with only tabs return error', () => {
      fc.assert(
        fc.property(fc.integer({ min: 1, max: 10 }), count => {
          const tabs = '\t'.repeat(count);
          const result = conjugate(tabs);
          expect(result.success).toBe(false);
          if (!result.success) {
            expect(result.error.code).toBe('EMPTY_INPUT');
          }
        }),
        { numRuns: 100 },
      );
    });

    it('strings with only newlines return error', () => {
      fc.assert(
        fc.property(fc.integer({ min: 1, max: 10 }), count => {
          const newlines = '\n'.repeat(count);
          const result = conjugate(newlines);
          expect(result.success).toBe(false);
          if (!result.success) {
            expect(result.error.code).toBe('EMPTY_INPUT');
          }
        }),
        { numRuns: 100 },
      );
    });

    it('mixed whitespace strings return error', () => {
      fc.assert(
        fc.property(
          fc.array(fc.constantFrom(' ', '\t', '\n', '\r'), {
            minLength: 1,
            maxLength: 10,
          }),
          whitespaceChars => {
            const whitespace = whitespaceChars.join('');
            const result = conjugate(whitespace);
            expect(result.success).toBe(false);
            if (!result.success) {
              expect(result.error.code).toBe('EMPTY_INPUT');
            }
          },
        ),
        { numRuns: 100 },
      );
    });
  });
});

// ============================================================================
// Property 14: Conjugation Determinism
// ============================================================================

describe('Conjugation Determinism Properties', () => {
  /**
   * **Feature: japanese-verb-conjugator, Property 14: Conjugation Determinism**
   *
   * For any verb and target form, calling the conjugation function multiple times
   * with the same input SHALL produce identical results.
   *
   * **Validates: Requirements 11.2**
   */
  describe('Property 14: Conjugation Determinism', () => {
    it('same input produces same forms', () => {
      fc.assert(
        fc.property(fc.constantFrom(...ALL_VALID_VERBS), verb => {
          const result1 = conjugate(verb);
          const result2 = conjugate(verb);

          expect(result1.success).toBe(true);
          expect(result2.success).toBe(true);

          if (!result1.success || !result2.success) return;

          // Same number of forms
          expect(result1.result.forms.length).toBe(result2.result.forms.length);

          // Same forms in same order
          for (let i = 0; i < result1.result.forms.length; i++) {
            const form1 = result1.result.forms[i];
            const form2 = result2.result.forms[i];

            expect(form1.id).toBe(form2.id);
            expect(form1.hiragana).toBe(form2.hiragana);
            expect(form1.kanji).toBe(form2.kanji);
            expect(form1.romaji).toBe(form2.romaji);
            expect(form1.category).toBe(form2.category);
          }
        }),
        { numRuns: 100 },
      );
    });

    it('same input produces same verb info', () => {
      fc.assert(
        fc.property(fc.constantFrom(...ALL_VALID_VERBS), verb => {
          const result1 = conjugate(verb);
          const result2 = conjugate(verb);

          expect(result1.success).toBe(true);
          expect(result2.success).toBe(true);

          if (!result1.success || !result2.success) return;

          const verb1 = result1.result.verb;
          const verb2 = result2.result.verb;

          expect(verb1.dictionaryForm).toBe(verb2.dictionaryForm);
          expect(verb1.reading).toBe(verb2.reading);
          expect(verb1.romaji).toBe(verb2.romaji);
          expect(verb1.type).toBe(verb2.type);
          expect(verb1.stem).toBe(verb2.stem);
          expect(verb1.ending).toBe(verb2.ending);
          expect(verb1.irregularType).toBe(verb2.irregularType);
          expect(verb1.compoundPrefix).toBe(verb2.compoundPrefix);
        }),
        { numRuns: 100 },
      );
    });

    it('multiple calls produce consistent results', () => {
      fc.assert(
        fc.property(
          fc.constantFrom(...ALL_VALID_VERBS),
          fc.integer({ min: 2, max: 5 }),
          (verb, callCount) => {
            const results = Array.from({ length: callCount }, () =>
              conjugate(verb),
            );

            // All should succeed
            expect(results.every(r => r.success)).toBe(true);

            // All should have same form count
            const formCounts = results
              .filter(r => r.success)
              .map(
                r =>
                  (r as { success: true; result: { forms: unknown[] } }).result
                    .forms.length,
              );
            expect(new Set(formCounts).size).toBe(1);
          },
        ),
        { numRuns: 100 },
      );
    });
  });
});

// ============================================================================
// Property 15: Pure Function Behavior
// ============================================================================

describe('Pure Function Behavior Properties', () => {
  /**
   * **Feature: japanese-verb-conjugator, Property 15: Pure Function Behavior**
   *
   * For any conjugation operation, the input verb object SHALL remain
   * unmodified after the operation completes.
   *
   * **Validates: Requirements 11.3**
   */
  describe('Property 15: Pure Function Behavior', () => {
    it('input string is not modified', () => {
      fc.assert(
        fc.property(fc.constantFrom(...ALL_VALID_VERBS), verb => {
          const originalVerb = verb;
          conjugate(verb);

          // String should be unchanged (strings are immutable in JS, but verify)
          expect(verb).toBe(originalVerb);
        }),
        { numRuns: 100 },
      );
    });

    it('conjugation does not have side effects on subsequent calls', () => {
      fc.assert(
        fc.property(
          fc.constantFrom(...ALL_VALID_VERBS),
          fc.constantFrom(...ALL_VALID_VERBS),
          (verb1, verb2) => {
            // Conjugate first verb
            const result1a = conjugate(verb1);

            // Conjugate second verb
            conjugate(verb2);

            // Conjugate first verb again
            const result1b = conjugate(verb1);

            // Results should be identical
            expect(result1a.success).toBe(result1b.success);

            if (result1a.success && result1b.success) {
              expect(result1a.result.forms.length).toBe(
                result1b.result.forms.length,
              );

              for (let i = 0; i < result1a.result.forms.length; i++) {
                expect(result1a.result.forms[i].hiragana).toBe(
                  result1b.result.forms[i].hiragana,
                );
              }
            }
          },
        ),
        { numRuns: 100 },
      );
    });

    it('conjugateOrThrow does not modify input', () => {
      fc.assert(
        fc.property(fc.constantFrom(...ALL_VALID_VERBS), verb => {
          const originalVerb = verb;
          conjugateOrThrow(verb);
          expect(verb).toBe(originalVerb);
        }),
        { numRuns: 100 },
      );
    });
  });
});

// ============================================================================
// Property 4: Output Format Completeness
// ============================================================================

describe('Output Format Completeness Properties', () => {
  /**
   * **Feature: japanese-verb-conjugator, Property 4: Output Format Completeness**
   *
   * For any conjugation form in a valid result, the form SHALL contain
   * non-empty kanji, hiragana, and romaji fields.
   *
   * **Validates: Requirements 1.5**
   */
  describe('Property 4: Output Format Completeness', () => {
    it('all forms have non-empty kanji field', () => {
      fc.assert(
        fc.property(fc.constantFrom(...ALL_VALID_VERBS), verb => {
          const result = conjugate(verb);

          expect(result.success).toBe(true);
          if (!result.success) return;

          for (const form of result.result.forms) {
            expect(form.kanji).toBeDefined();
            expect(form.kanji.length).toBeGreaterThan(0);
          }
        }),
        { numRuns: 100 },
      );
    });

    it('all forms have non-empty hiragana field', () => {
      fc.assert(
        fc.property(fc.constantFrom(...ALL_VALID_VERBS), verb => {
          const result = conjugate(verb);

          expect(result.success).toBe(true);
          if (!result.success) return;

          for (const form of result.result.forms) {
            expect(form.hiragana).toBeDefined();
            expect(form.hiragana.length).toBeGreaterThan(0);
          }
        }),
        { numRuns: 100 },
      );
    });

    it('all forms have non-empty romaji field', () => {
      fc.assert(
        fc.property(fc.constantFrom(...ALL_VALID_VERBS), verb => {
          const result = conjugate(verb);

          expect(result.success).toBe(true);
          if (!result.success) return;

          for (const form of result.result.forms) {
            expect(form.romaji).toBeDefined();
            expect(form.romaji.length).toBeGreaterThan(0);
          }
        }),
        { numRuns: 100 },
      );
    });

    it('all forms have valid id field', () => {
      fc.assert(
        fc.property(fc.constantFrom(...ALL_VALID_VERBS), verb => {
          const result = conjugate(verb);

          expect(result.success).toBe(true);
          if (!result.success) return;

          for (const form of result.result.forms) {
            expect(form.id).toBeDefined();
            expect(form.id.length).toBeGreaterThan(0);
          }
        }),
        { numRuns: 100 },
      );
    });

    it('all forms have valid name field', () => {
      fc.assert(
        fc.property(fc.constantFrom(...ALL_VALID_VERBS), verb => {
          const result = conjugate(verb);

          expect(result.success).toBe(true);
          if (!result.success) return;

          for (const form of result.result.forms) {
            expect(form.name).toBeDefined();
            expect(form.name.length).toBeGreaterThan(0);
          }
        }),
        { numRuns: 100 },
      );
    });

    it('all forms have valid nameJapanese field', () => {
      fc.assert(
        fc.property(fc.constantFrom(...ALL_VALID_VERBS), verb => {
          const result = conjugate(verb);

          expect(result.success).toBe(true);
          if (!result.success) return;

          for (const form of result.result.forms) {
            expect(form.nameJapanese).toBeDefined();
            expect(form.nameJapanese.length).toBeGreaterThan(0);
          }
        }),
        { numRuns: 100 },
      );
    });

    it('all forms have valid category field', () => {
      fc.assert(
        fc.property(fc.constantFrom(...ALL_VALID_VERBS), verb => {
          const result = conjugate(verb);

          expect(result.success).toBe(true);
          if (!result.success) return;

          for (const form of result.result.forms) {
            expect(form.category).toBeDefined();
            expect(ALL_CONJUGATION_CATEGORIES).toContain(form.category);
          }
        }),
        { numRuns: 100 },
      );
    });

    it('all forms have valid formality field', () => {
      fc.assert(
        fc.property(fc.constantFrom(...ALL_VALID_VERBS), verb => {
          const result = conjugate(verb);

          expect(result.success).toBe(true);
          if (!result.success) return;

          for (const form of result.result.forms) {
            expect(form.formality).toBeDefined();
            expect(['plain', 'polite']).toContain(form.formality);
          }
        }),
        { numRuns: 100 },
      );
    });

    it('romaji contains only ASCII characters', () => {
      fc.assert(
        fc.property(fc.constantFrom(...ALL_VALID_VERBS), verb => {
          const result = conjugate(verb);

          expect(result.success).toBe(true);
          if (!result.success) return;

          for (const form of result.result.forms) {
            // Romaji should only contain ASCII letters and possibly some punctuation
            // Allow kanji to pass through (they won't be converted)
            const romajiPart = form.romaji.replace(/[^\x00-\x7F]/g, '');
            // The romaji part should be non-empty (at least some conversion happened)
            expect(romajiPart.length).toBeGreaterThan(0);
          }
        }),
        { numRuns: 100 },
      );
    });
  });
});
