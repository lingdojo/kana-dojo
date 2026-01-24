/**
 * Property-Based Tests for Copy-All Format Completeness
 *
 * This file contains property tests for the copy-all functionality,
 * ensuring that all conjugation forms are included in the formatted output.
 *
 * **Feature: japanese-verb-conjugator, Property 10: Copy-All Format Completeness**
 * **Validates: Requirements 6.2**
 */

import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { conjugate } from '../lib/engine/conjugate';
import { ALL_CONJUGATION_CATEGORIES } from '../types';
import type {
  ConjugationResult,
  ConjugationCategory,
  ConjugationForm,
} from '../types';

// ============================================================================
// Test Data - Valid Verbs
// ============================================================================

const GODAN_VERBS = [
  '書く', // kaku - to write
  '読む', // yomu - to read
  '話す', // hanasu - to speak
  '待つ', // matsu - to wait
  '買う', // kau - to buy
];

const ICHIDAN_VERBS = [
  '食べる', // taberu - to eat
  '見る', // miru - to see
  '起きる', // okiru - to wake up
];

const IRREGULAR_VERBS = [
  'する', // suru - to do
  '来る', // kuru - to come
  'ある', // aru - to exist
  '行く', // iku - to go
];

const COMPOUND_VERBS = [
  '勉強する', // benkyou suru - to study
  '運動する', // undou suru - to exercise
];

const ALL_VALID_VERBS = [
  ...GODAN_VERBS,
  ...ICHIDAN_VERBS,
  ...IRREGULAR_VERBS,
  ...COMPOUND_VERBS,
];

// ============================================================================
// Helper Function - Format Forms for Clipboard
// (Duplicated from store for testing purposes)
// ============================================================================

/**
 * Format all conjugation forms for clipboard
 * This is the same logic used in the store's copyAllForms action
 */
function formatFormsForClipboard(result: ConjugationResult): string {
  const lines: string[] = [];

  // Header with verb info
  lines.push(`${result.verb.dictionaryForm} (${result.verb.romaji})`);
  lines.push(`Type: ${result.verb.type}`);
  lines.push(`Stem: ${result.verb.stem}`);
  lines.push('');

  // Group forms by category
  const formsByCategory = new Map<ConjugationCategory, ConjugationForm[]>();
  for (const form of result.forms) {
    const existing = formsByCategory.get(form.category) || [];
    existing.push(form);
    formsByCategory.set(form.category, existing);
  }

  // Output each category
  for (const category of ALL_CONJUGATION_CATEGORIES) {
    const forms = formsByCategory.get(category);
    if (forms && forms.length > 0) {
      lines.push(`=== ${category.toUpperCase()} ===`);
      for (const form of forms) {
        lines.push(
          `${form.name}: ${form.kanji} (${form.hiragana}) [${form.romaji}]`,
        );
      }
      lines.push('');
    }
  }

  return lines.join('\n');
}

// ============================================================================
// Property 10: Copy-All Format Completeness
// ============================================================================

describe('Copy-All Format Completeness Properties', () => {
  /**
   * **Feature: japanese-verb-conjugator, Property 10: Copy-All Format Completeness**
   *
   * For any conjugation result, the copy-all formatted output SHALL contain
   * all conjugation forms organized by category.
   *
   * **Validates: Requirements 6.2**
   */
  describe('Property 10: Copy-All Format Completeness', () => {
    it('formatted output contains all forms from the result', () => {
      fc.assert(
        fc.property(fc.constantFrom(...ALL_VALID_VERBS), verb => {
          const result = conjugate(verb);

          expect(result.success).toBe(true);
          if (!result.success) return;

          const formatted = formatFormsForClipboard(result.result);

          // Every form should appear in the formatted output
          for (const form of result.result.forms) {
            // Check that the form's kanji appears
            expect(formatted).toContain(form.kanji);
            // Check that the form's hiragana appears
            expect(formatted).toContain(form.hiragana);
            // Check that the form's romaji appears
            expect(formatted).toContain(form.romaji);
            // Check that the form's name appears
            expect(formatted).toContain(form.name);
          }
        }),
        { numRuns: 100 },
      );
    });

    it('formatted output contains verb info header', () => {
      fc.assert(
        fc.property(fc.constantFrom(...ALL_VALID_VERBS), verb => {
          const result = conjugate(verb);

          expect(result.success).toBe(true);
          if (!result.success) return;

          const formatted = formatFormsForClipboard(result.result);

          // Should contain verb dictionary form
          expect(formatted).toContain(result.result.verb.dictionaryForm);
          // Should contain verb romaji
          expect(formatted).toContain(result.result.verb.romaji);
          // Should contain verb type
          expect(formatted).toContain(result.result.verb.type);
          // Should contain verb stem
          expect(formatted).toContain(result.result.verb.stem);
        }),
        { numRuns: 100 },
      );
    });

    it('formatted output contains all categories with forms', () => {
      fc.assert(
        fc.property(fc.constantFrom(...ALL_VALID_VERBS), verb => {
          const result = conjugate(verb);

          expect(result.success).toBe(true);
          if (!result.success) return;

          const formatted = formatFormsForClipboard(result.result);

          // Get categories that have forms
          const categoriesWithForms = new Set(
            result.result.forms.map(f => f.category),
          );

          // Each category with forms should appear as a header
          for (const category of categoriesWithForms) {
            expect(formatted).toContain(`=== ${category.toUpperCase()} ===`);
          }
        }),
        { numRuns: 100 },
      );
    });

    it('formatted output is organized by category', () => {
      fc.assert(
        fc.property(fc.constantFrom(...ALL_VALID_VERBS), verb => {
          const result = conjugate(verb);

          expect(result.success).toBe(true);
          if (!result.success) return;

          const formatted = formatFormsForClipboard(result.result);

          // Categories should appear in the defined order
          let lastIndex = -1;
          for (const category of ALL_CONJUGATION_CATEGORIES) {
            const categoryHeader = `=== ${category.toUpperCase()} ===`;
            const index = formatted.indexOf(categoryHeader);

            // If category exists, it should come after the previous one
            if (index !== -1) {
              expect(index).toBeGreaterThan(lastIndex);
              lastIndex = index;
            }
          }
        }),
        { numRuns: 100 },
      );
    });

    it('formatted output includes form details in correct format', () => {
      fc.assert(
        fc.property(fc.constantFrom(...ALL_VALID_VERBS), verb => {
          const result = conjugate(verb);

          expect(result.success).toBe(true);
          if (!result.success) return;

          const formatted = formatFormsForClipboard(result.result);

          // Check that at least some forms follow the expected format
          // Format: "Form Name: kanji (hiragana) [romaji]"
          for (const form of result.result.forms) {
            const expectedLine = `${form.name}: ${form.kanji} (${form.hiragana}) [${form.romaji}]`;
            expect(formatted).toContain(expectedLine);
          }
        }),
        { numRuns: 100 },
      );
    });

    it('formatted output is non-empty for valid verbs', () => {
      fc.assert(
        fc.property(fc.constantFrom(...ALL_VALID_VERBS), verb => {
          const result = conjugate(verb);

          expect(result.success).toBe(true);
          if (!result.success) return;

          const formatted = formatFormsForClipboard(result.result);

          // Should have substantial content
          expect(formatted.length).toBeGreaterThan(100);
          // Should have multiple lines
          expect(formatted.split('\n').length).toBeGreaterThan(10);
        }),
        { numRuns: 100 },
      );
    });

    it('formatted output contains all 14 categories for complete verbs', () => {
      fc.assert(
        fc.property(fc.constantFrom(...ALL_VALID_VERBS), verb => {
          const result = conjugate(verb);

          expect(result.success).toBe(true);
          if (!result.success) return;

          const formatted = formatFormsForClipboard(result.result);

          // Count category headers in output
          let categoryCount = 0;
          for (const category of ALL_CONJUGATION_CATEGORIES) {
            if (formatted.includes(`=== ${category.toUpperCase()} ===`)) {
              categoryCount++;
            }
          }

          // Should have all 14 categories
          expect(categoryCount).toBe(ALL_CONJUGATION_CATEGORIES.length);
        }),
        { numRuns: 100 },
      );
    });
  });
});
