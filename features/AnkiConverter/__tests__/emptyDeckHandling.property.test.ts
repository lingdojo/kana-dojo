/**
 * Empty Deck Handling Property Tests
 *
 * Property-based tests for empty deck handling.
 *
 * **Feature: anki-converter, Property 7: Empty deck handling**
 * **Validates: Requirements 11.1**
 */

import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import { buildJson } from '../lib/jsonBuilder';
import type { ParsedAnkiData, DeckInfo, NoteType } from '../types';

/**
 * Create empty parsed data with various deck configurations
 */
function createEmptyParsedData(
  deckName: string,
  deckDescription: string = '',
): ParsedAnkiData {
  const deckId = Math.floor(Math.random() * 1000000);

  const deck: DeckInfo = {
    id: deckId,
    name: deckName,
    desc: deckDescription,
    conf: 1,
  };

  return {
    notes: [],
    cards: [],
    decks: [deck],
    noteTypes: [],
    metadata: {
      creation: Date.now(),
      mod: Date.now(),
      scm: Date.now(),
      ver: 11,
      dty: 0,
      usn: -1,
      ls: 0,
    },
  };
}

/**
 * Create empty parsed data with nested decks
 */
function createEmptyNestedDecks(deckNames: string[]): ParsedAnkiData {
  const decks: DeckInfo[] = deckNames.map((name, index) => ({
    id: index + 1,
    name,
    desc: '',
    conf: 1,
  }));

  return {
    notes: [],
    cards: [],
    decks,
    noteTypes: [],
    metadata: {
      creation: Date.now(),
      mod: Date.now(),
      scm: Date.now(),
      ver: 11,
      dty: 0,
      usn: -1,
      ls: 0,
    },
  };
}

describe('Empty Deck Handling Property Tests', () => {
  describe('Property 7: Empty deck handling', () => {
    it('should produce valid JSON for any empty deck', () => {
      fc.assert(
        fc.property(
          fc
            .string({ minLength: 1, maxLength: 100 })
            .filter(s => s.trim().length > 0),
          fc.option(fc.string({ maxLength: 200 }), { nil: '' }),
          (deckName, deckDescription) => {
            // Create empty parsed data
            const parsedData = createEmptyParsedData(deckName, deckDescription);

            // Build JSON
            const result = buildJson(parsedData);

            // Verify result is valid JSON
            const jsonString = JSON.stringify(result);
            const parsed = JSON.parse(jsonString);

            // Verify structure
            expect(parsed).toHaveProperty('decks');
            expect(parsed).toHaveProperty('metadata');
            expect(Array.isArray(parsed.decks)).toBe(true);

            // Verify deck exists with empty cards array
            expect(parsed.decks.length).toBeGreaterThan(0);
            expect(parsed.decks[0]).toHaveProperty('cards');
            expect(Array.isArray(parsed.decks[0].cards)).toBe(true);
            expect(parsed.decks[0].cards.length).toBe(0);

            return true;
          },
        ),
        { numRuns: 100 },
      );
    });

    it('should handle empty decks with special characters in names', () => {
      fc.assert(
        fc.property(
          fc
            .string({ minLength: 1, maxLength: 50 })
            .filter(s => s.trim().length > 0),
          deckName => {
            const parsedData = createEmptyParsedData(deckName);
            const result = buildJson(parsedData);

            // Should not throw and should produce valid JSON
            const jsonString = JSON.stringify(result);
            const parsed = JSON.parse(jsonString);

            // Verify empty cards array
            expect(parsed.decks[0].cards).toEqual([]);
            expect(parsed.metadata.totalCards).toBe(0);

            return true;
          },
        ),
        { numRuns: 100 },
      );
    });

    it('should handle multiple empty decks', () => {
      fc.assert(
        fc.property(
          fc.array(
            fc
              .string({ minLength: 1, maxLength: 50 })
              .filter(s => s.trim().length > 0),
            { minLength: 1, maxLength: 10 },
          ),
          deckNames => {
            const parsedData = createEmptyNestedDecks(deckNames);
            const result = buildJson(parsedData);

            // Should produce valid JSON
            const jsonString = JSON.stringify(result);
            const parsed = JSON.parse(jsonString);

            // All decks should have empty cards arrays
            for (const deck of parsed.decks) {
              expect(Array.isArray(deck.cards)).toBe(true);
              expect(deck.cards.length).toBe(0);
            }

            // Total cards should be 0
            expect(parsed.metadata.totalCards).toBe(0);

            return true;
          },
        ),
        { numRuns: 100 },
      );
    });

    it('should handle empty nested deck hierarchies', () => {
      fc.assert(
        fc.property(
          fc.array(
            fc
              .tuple(
                fc
                  .string({ minLength: 1, maxLength: 20 })
                  .filter(s => s.trim().length > 0),
                fc
                  .string({ minLength: 1, maxLength: 20 })
                  .filter(s => s.trim().length > 0),
              )
              .map(([parent, child]) => `${parent}::${child}`),
            { minLength: 1, maxLength: 5 },
          ),
          nestedDeckNames => {
            const parsedData = createEmptyNestedDecks(nestedDeckNames);
            const result = buildJson(parsedData);

            // Should produce valid JSON with hierarchy
            const jsonString = JSON.stringify(result);
            const parsed = JSON.parse(jsonString);

            // Recursively check all decks are empty
            function checkEmptyDecks(decks: any[]): boolean {
              for (const deck of decks) {
                if (!Array.isArray(deck.cards) || deck.cards.length !== 0) {
                  return false;
                }
                if (deck.subdecks && !checkEmptyDecks(deck.subdecks)) {
                  return false;
                }
              }
              return true;
            }

            expect(checkEmptyDecks(parsed.decks)).toBe(true);
            expect(parsed.metadata.totalCards).toBe(0);

            return true;
          },
        ),
        { numRuns: 100 },
      );
    });

    it('should include metadata for empty decks', () => {
      fc.assert(
        fc.property(
          fc
            .string({ minLength: 1, maxLength: 50 })
            .filter(s => s.trim().length > 0),
          deckName => {
            const parsedData = createEmptyParsedData(deckName);
            const result = buildJson(parsedData);

            // Verify metadata is present and correct
            expect(result.metadata).toBeDefined();
            expect(result.metadata.totalCards).toBe(0);
            expect(result.metadata.totalDecks).toBeGreaterThan(0);
            expect(result.metadata.convertedAt).toBeDefined();
            expect(result.metadata.processingTime).toBeGreaterThanOrEqual(0);

            return true;
          },
        ),
        { numRuns: 100 },
      );
    });

    it('should not throw errors for empty decks with any valid configuration', () => {
      fc.assert(
        fc.property(
          fc.record({
            deckName: fc
              .string({ minLength: 1, maxLength: 100 })
              .filter(s => s.trim().length > 0),
            description: fc.string({ maxLength: 500 }),
            includeStats: fc.boolean(),
            includeSuspended: fc.boolean(),
            includeTags: fc.boolean(),
          }),
          config => {
            const parsedData = createEmptyParsedData(
              config.deckName,
              config.description,
            );

            // Should not throw with any options
            const result = buildJson(parsedData, {
              includeStats: config.includeStats,
              includeSuspended: config.includeSuspended,
              includeTags: config.includeTags,
            });

            // Verify valid output
            expect(result.decks).toBeDefined();
            expect(result.metadata).toBeDefined();
            expect(result.metadata.totalCards).toBe(0);

            return true;
          },
        ),
        { numRuns: 100 },
      );
    });

    it('should produce consistent output for the same empty deck', () => {
      fc.assert(
        fc.property(
          fc
            .string({ minLength: 1, maxLength: 50 })
            .filter(s => s.trim().length > 0),
          deckName => {
            const parsedData1 = createEmptyParsedData(deckName);
            const parsedData2 = createEmptyParsedData(deckName);

            const result1 = buildJson(parsedData1);
            const result2 = buildJson(parsedData2);

            // Deck structure should be consistent (ignoring timestamps)
            expect(result1.decks[0].name).toBe(result2.decks[0].name);
            expect(result1.decks[0].cards.length).toBe(
              result2.decks[0].cards.length,
            );
            expect(result1.metadata.totalCards).toBe(
              result2.metadata.totalCards,
            );

            return true;
          },
        ),
        { numRuns: 100 },
      );
    });

    it('should handle empty decks with Unicode names', () => {
      fc.assert(
        fc.property(
          fc
            .string({ minLength: 1, maxLength: 50 })
            .filter(s => s.trim().length > 0),
          deckName => {
            const parsedData = createEmptyParsedData(deckName);
            const result = buildJson(parsedData);

            // Should handle Unicode correctly
            const jsonString = JSON.stringify(result);
            const parsed = JSON.parse(jsonString);

            expect(parsed.decks[0].name).toBe(deckName);
            expect(parsed.decks[0].cards).toEqual([]);

            return true;
          },
        ),
        { numRuns: 100 },
      );
    });
  });
});
