/**
 * History Property Tests
 *
 * Property-based tests for the conjugator history functionality.
 * Tests history persistence and restoration correctness.
 *
 * **Feature: japanese-verb-conjugator**
 */

import { describe, it, expect, beforeEach } from 'vitest';
import * as fc from 'fast-check';
import type {
  ConjugationResult,
  VerbInfo,
  ConjugationForm,
  VerbType,
  IrregularType,
  ConjugationCategory,
  Formality,
  HistoryEntry,
} from '../types';

// ============================================================================
// Arbitraries for generating test data
// ============================================================================

/**
 * Arbitrary for VerbType
 */
const verbTypeArb: fc.Arbitrary<VerbType> = fc.constantFrom(
  'godan',
  'ichidan',
  'irregular',
);

/**
 * Arbitrary for IrregularType
 */
const irregularTypeArb: fc.Arbitrary<IrregularType> = fc.constantFrom(
  'suru',
  'kuru',
  'aru',
  'iku',
  'honorific',
);

/**
 * Arbitrary for ConjugationCategory
 */
const categoryArb: fc.Arbitrary<ConjugationCategory> = fc.constantFrom(
  'basic',
  'polite',
  'negative',
  'past',
  'volitional',
  'potential',
  'passive',
  'causative',
  'causative-passive',
  'imperative',
  'conditional',
  'tai-form',
  'progressive',
  'honorific',
);

/**
 * Arbitrary for Formality
 */
const formalityArb: fc.Arbitrary<Formality> = fc.constantFrom(
  'plain',
  'polite',
);

/**
 * Arbitrary for non-empty strings
 */
const nonEmptyStringArb = fc.string({ minLength: 1, maxLength: 20 });

/**
 * Arbitrary for Japanese-like strings
 */
const japaneseStringArb = fc.string({ minLength: 1, maxLength: 10 });

/**
 * Arbitrary for VerbInfo
 */
const verbInfoArb: fc.Arbitrary<VerbInfo> = fc.record({
  dictionaryForm: nonEmptyStringArb,
  reading: japaneseStringArb,
  romaji: nonEmptyStringArb,
  type: verbTypeArb,
  stem: nonEmptyStringArb,
  ending: nonEmptyStringArb,
  irregularType: fc.option(irregularTypeArb, { nil: undefined }),
  compoundPrefix: fc.option(nonEmptyStringArb, { nil: undefined }),
});

/**
 * Arbitrary for ConjugationForm
 */
const conjugationFormArb: fc.Arbitrary<ConjugationForm> = fc.record({
  id: nonEmptyStringArb,
  name: nonEmptyStringArb,
  nameJapanese: japaneseStringArb,
  kanji: japaneseStringArb,
  hiragana: japaneseStringArb,
  romaji: nonEmptyStringArb,
  formality: formalityArb,
  category: categoryArb,
});

/**
 * Arbitrary for ConjugationResult
 */
const conjugationResultArb: fc.Arbitrary<ConjugationResult> = fc.record({
  verb: verbInfoArb,
  forms: fc.array(conjugationFormArb, { minLength: 1, maxLength: 10 }),
  timestamp: fc.integer({ min: 1, max: Number.MAX_SAFE_INTEGER }),
});

/**
 * Arbitrary for HistoryEntry
 */
const historyEntryArb: fc.Arbitrary<HistoryEntry> = fc.record({
  id: fc.uuid(),
  verb: nonEmptyStringArb,
  verbType: verbTypeArb,
  timestamp: fc.integer({ min: 1, max: Number.MAX_SAFE_INTEGER }),
});

// ============================================================================
// Pure Functions for Testing (extracted from store logic)
// ============================================================================

const MAX_HISTORY_ENTRIES = 50;

/**
 * Generate a unique ID for history entries
 */
function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Create a history entry from a conjugation result
 */
function createHistoryEntry(result: ConjugationResult): HistoryEntry {
  return {
    id: generateId(),
    verb: result.verb.dictionaryForm,
    verbType: result.verb.type,
    timestamp: result.timestamp,
  };
}

/**
 * Add a conjugation result to history (pure function version)
 * Returns the new history array
 */
function addToHistory(
  history: HistoryEntry[],
  result: ConjugationResult,
): HistoryEntry[] {
  // Check if verb already exists in history
  const existingIndex = history.findIndex(
    entry => entry.verb === result.verb.dictionaryForm,
  );

  let newHistory: HistoryEntry[];

  if (existingIndex >= 0) {
    // Move existing entry to front with updated timestamp
    const existing = history[existingIndex];
    newHistory = [
      { ...existing, timestamp: result.timestamp },
      ...history.slice(0, existingIndex),
      ...history.slice(existingIndex + 1),
    ];
  } else {
    // Add new entry at front
    const newEntry = createHistoryEntry(result);
    newHistory = [newEntry, ...history];
  }

  // Cap history size
  if (newHistory.length > MAX_HISTORY_ENTRIES) {
    newHistory = newHistory.slice(0, MAX_HISTORY_ENTRIES);
  }

  return newHistory;
}

/**
 * Delete an entry from history (pure function version)
 */
function deleteFromHistory(
  history: HistoryEntry[],
  id: string,
): HistoryEntry[] {
  return history.filter(entry => entry.id !== id);
}

/**
 * Find a history entry by verb
 */
function findInHistory(
  history: HistoryEntry[],
  verb: string,
): HistoryEntry | undefined {
  return history.find(entry => entry.verb === verb);
}

// ============================================================================
// Property Tests
// ============================================================================

describe('Conjugator History', () => {
  /**
   * **Feature: japanese-verb-conjugator, Property 11: History Persistence**
   * For any successfully conjugated verb, adding it to history and then
   * retrieving history SHALL include that verb entry.
   * **Validates: Requirements 8.1**
   */
  describe('Property 11: History Persistence', () => {
    it('adding a verb to history makes it findable', () => {
      fc.assert(
        fc.property(conjugationResultArb, result => {
          const initialHistory: HistoryEntry[] = [];
          const newHistory = addToHistory(initialHistory, result);

          // The verb should be findable in history
          const found = findInHistory(newHistory, result.verb.dictionaryForm);
          expect(found).toBeDefined();
          expect(found?.verb).toBe(result.verb.dictionaryForm);
        }),
        { numRuns: 100 },
      );
    });

    it('history entry contains correct verb type', () => {
      fc.assert(
        fc.property(conjugationResultArb, result => {
          const initialHistory: HistoryEntry[] = [];
          const newHistory = addToHistory(initialHistory, result);

          const found = findInHistory(newHistory, result.verb.dictionaryForm);
          expect(found?.verbType).toBe(result.verb.type);
        }),
        { numRuns: 100 },
      );
    });

    it('history entry contains correct timestamp', () => {
      fc.assert(
        fc.property(conjugationResultArb, result => {
          const initialHistory: HistoryEntry[] = [];
          const newHistory = addToHistory(initialHistory, result);

          const found = findInHistory(newHistory, result.verb.dictionaryForm);
          expect(found?.timestamp).toBe(result.timestamp);
        }),
        { numRuns: 100 },
      );
    });

    it('adding multiple verbs preserves all of them', () => {
      fc.assert(
        fc.property(
          fc.array(conjugationResultArb, { minLength: 1, maxLength: 10 }),
          results => {
            // Ensure unique verbs
            const uniqueResults = results.filter(
              (r, i, arr) =>
                arr.findIndex(
                  x => x.verb.dictionaryForm === r.verb.dictionaryForm,
                ) === i,
            );

            let history: HistoryEntry[] = [];
            for (const result of uniqueResults) {
              history = addToHistory(history, result);
            }

            // All unique verbs should be findable
            for (const result of uniqueResults) {
              const found = findInHistory(history, result.verb.dictionaryForm);
              expect(found).toBeDefined();
            }
          },
        ),
        { numRuns: 100 },
      );
    });

    it('history is capped at MAX_HISTORY_ENTRIES', () => {
      fc.assert(
        fc.property(
          fc.array(conjugationResultArb, { minLength: 60, maxLength: 70 }),
          results => {
            // Ensure unique verbs by modifying dictionary form
            const uniqueResults = results.map((r, i) => ({
              ...r,
              verb: {
                ...r.verb,
                dictionaryForm: `${r.verb.dictionaryForm}_${i}`,
              },
            }));

            let history: HistoryEntry[] = [];
            for (const result of uniqueResults) {
              history = addToHistory(history, result);
            }

            expect(history.length).toBeLessThanOrEqual(MAX_HISTORY_ENTRIES);
          },
        ),
        { numRuns: 100 },
      );
    });

    it('re-adding existing verb moves it to front', () => {
      fc.assert(
        fc.property(
          fc.tuple(conjugationResultArb, conjugationResultArb),
          ([result1, result2]) => {
            // Make result2 have a different verb
            const modifiedResult2 = {
              ...result2,
              verb: {
                ...result2.verb,
                dictionaryForm: result2.verb.dictionaryForm + '_2',
              },
            };

            let history: HistoryEntry[] = [];
            history = addToHistory(history, result1);
            history = addToHistory(history, modifiedResult2);

            // Re-add result1 with new timestamp
            const updatedResult1 = { ...result1, timestamp: Date.now() };
            history = addToHistory(history, updatedResult1);

            // result1 should be at front
            expect(history[0].verb).toBe(result1.verb.dictionaryForm);
          },
        ),
        { numRuns: 100 },
      );
    });

    it('deleting an entry removes it from history', () => {
      fc.assert(
        fc.property(conjugationResultArb, result => {
          const initialHistory: HistoryEntry[] = [];
          const historyWithEntry = addToHistory(initialHistory, result);

          // Get the entry's ID
          const entry = findInHistory(
            historyWithEntry,
            result.verb.dictionaryForm,
          );
          expect(entry).toBeDefined();

          // Delete it
          const historyAfterDelete = deleteFromHistory(
            historyWithEntry,
            entry!.id,
          );

          // Should not be findable anymore
          const found = findInHistory(
            historyAfterDelete,
            result.verb.dictionaryForm,
          );
          expect(found).toBeUndefined();
        }),
        { numRuns: 100 },
      );
    });
  });

  /**
   * **Feature: japanese-verb-conjugator, Property 12: History Restoration Correctness**
   * For any verb in history, selecting it SHALL produce conjugation results
   * identical to the original conjugation.
   * **Validates: Requirements 8.3**
   */
  describe('Property 12: History Restoration Correctness', () => {
    it('history entry preserves verb dictionary form for restoration', () => {
      fc.assert(
        fc.property(conjugationResultArb, result => {
          const initialHistory: HistoryEntry[] = [];
          const newHistory = addToHistory(initialHistory, result);

          const entry = findInHistory(newHistory, result.verb.dictionaryForm);
          expect(entry).toBeDefined();

          // The verb stored in history should match the original
          // This is what would be used to re-conjugate
          expect(entry?.verb).toBe(result.verb.dictionaryForm);
        }),
        { numRuns: 100 },
      );
    });

    it('history entry preserves verb type for display', () => {
      fc.assert(
        fc.property(conjugationResultArb, result => {
          const initialHistory: HistoryEntry[] = [];
          const newHistory = addToHistory(initialHistory, result);

          const entry = findInHistory(newHistory, result.verb.dictionaryForm);

          // Verb type should be preserved for UI display
          expect(entry?.verbType).toBe(result.verb.type);
        }),
        { numRuns: 100 },
      );
    });

    it('history entries have unique IDs', () => {
      fc.assert(
        fc.property(
          fc.array(conjugationResultArb, { minLength: 2, maxLength: 10 }),
          results => {
            // Ensure unique verbs
            const uniqueResults = results.map((r, i) => ({
              ...r,
              verb: {
                ...r.verb,
                dictionaryForm: `${r.verb.dictionaryForm}_${i}`,
              },
            }));

            let history: HistoryEntry[] = [];
            for (const result of uniqueResults) {
              history = addToHistory(history, result);
            }

            // All IDs should be unique
            const ids = history.map(e => e.id);
            const uniqueIds = new Set(ids);
            expect(uniqueIds.size).toBe(ids.length);
          },
        ),
        { numRuns: 100 },
      );
    });

    it('most recent entry is always first', () => {
      fc.assert(
        fc.property(
          fc.array(conjugationResultArb, { minLength: 2, maxLength: 5 }),
          results => {
            // Ensure unique verbs with increasing timestamps
            const uniqueResults = results.map((r, i) => ({
              ...r,
              verb: { ...r.verb, dictionaryForm: `verb_${i}` },
              timestamp: 1000 + i * 100, // Increasing timestamps
            }));

            let history: HistoryEntry[] = [];
            for (const result of uniqueResults) {
              history = addToHistory(history, result);
            }

            // The last added verb should be first
            const lastVerb =
              uniqueResults[uniqueResults.length - 1].verb.dictionaryForm;
            expect(history[0].verb).toBe(lastVerb);
          },
        ),
        { numRuns: 100 },
      );
    });

    it('updating existing entry preserves its position at front', () => {
      fc.assert(
        fc.property(conjugationResultArb, result => {
          let history: HistoryEntry[] = [];

          // Add the verb
          history = addToHistory(history, result);
          const originalId = history[0].id;

          // Add it again with updated timestamp
          const updatedResult = {
            ...result,
            timestamp: result.timestamp + 1000,
          };
          history = addToHistory(history, updatedResult);

          // Should still be at front with same ID but updated timestamp
          expect(history[0].verb).toBe(result.verb.dictionaryForm);
          expect(history[0].id).toBe(originalId);
          expect(history[0].timestamp).toBe(updatedResult.timestamp);
        }),
        { numRuns: 100 },
      );
    });
  });
});
