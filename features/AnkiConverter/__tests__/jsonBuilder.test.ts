/**
 * JSON Builder Tests
 *
 * Property-based tests for JSON building and output structure.
 *
 * @module features/AnkiConverter/__tests__/jsonBuilder.test.ts
 */

import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import {
  buildJson,
  extractClozeVariations,
  isValidJsonOutput,
  countTotalCards,
  flattenDeckNames,
} from '../lib/jsonBuilder';
import type {
  ParsedAnkiData,
  Note,
  Card,
  DeckInfo,
  NoteType,
  Field,
  AnkiMetadata,
  Deck,
  OutputCard,
} from '../types';

/**
 * Arbitrary for generating valid field definitions
 */
const fieldArb = (ord: number): fc.Arbitrary<Field> =>
  fc
    .record({
      name: fc
        .string({ minLength: 1, maxLength: 20 })
        .filter(s => /^[a-zA-Z][a-zA-Z0-9_]*$/.test(s)),
      sticky: fc.boolean(),
      rtl: fc.boolean(),
      font: fc.constant('Arial'),
      size: fc.integer({ min: 10, max: 24 }),
    })
    .map(f => ({ ...f, ord }));

/**
 * Arbitrary for generating unique field names
 */
const uniqueFieldsArb = (count: number): fc.Arbitrary<Field[]> =>
  fc
    .array(
      fc
        .string({ minLength: 1, maxLength: 15 })
        .filter(s => /^[a-zA-Z][a-zA-Z0-9]*$/.test(s)),
      { minLength: count, maxLength: count },
    )
    .filter(names => new Set(names).size === names.length)
    .map(names =>
      names.map((name, ord) => ({
        name,
        ord,
        sticky: false,
        rtl: false,
        font: 'Arial',
        size: 14,
      })),
    );

/**
 * Arbitrary for generating basic note type (Front/Back)
 */
const basicNoteTypeArb: fc.Arbitrary<NoteType> = fc
  .integer({ min: 1, max: 1000000 })
  .map(id => ({
    id,
    name: 'Basic',
    type: 0,
    flds: [
      {
        name: 'Front',
        ord: 0,
        sticky: false,
        rtl: false,
        font: 'Arial',
        size: 14,
      },
      {
        name: 'Back',
        ord: 1,
        sticky: false,
        rtl: false,
        font: 'Arial',
        size: 14,
      },
    ],
    tmpls: [{ name: 'Card 1', ord: 0, qfmt: '{{Front}}', afmt: '{{Back}}' }],
  }));

/**
 * Arbitrary for generating cloze note type
 */
const clozeNoteTypeArb: fc.Arbitrary<NoteType> = fc
  .integer({ min: 1, max: 1000000 })
  .map(id => ({
    id,
    name: 'Cloze',
    type: 1,
    flds: [
      {
        name: 'Text',
        ord: 0,
        sticky: false,
        rtl: false,
        font: 'Arial',
        size: 14,
      },
      {
        name: 'Extra',
        ord: 1,
        sticky: false,
        rtl: false,
        font: 'Arial',
        size: 14,
      },
    ],
    tmpls: [
      { name: 'Cloze', ord: 0, qfmt: '{{cloze:Text}}', afmt: '{{cloze:Text}}' },
    ],
  }));

/**
 * Arbitrary for generating custom note type with multiple fields
 */
const customNoteTypeArb: fc.Arbitrary<NoteType> = fc
  .tuple(fc.integer({ min: 1, max: 1000000 }), fc.integer({ min: 3, max: 6 }))
  .chain(([id, fieldCount]) =>
    uniqueFieldsArb(fieldCount).map(flds => ({
      id,
      name: `Custom${id}`,
      type: 0,
      flds,
      tmpls: [{ name: 'Card 1', ord: 0, qfmt: '', afmt: '' }],
    })),
  );

/**
 * Arbitrary for generating safe text content (no HTML-like characters)
 */
const safeTextArb = fc
  .string({ minLength: 1, maxLength: 50 })
  .filter(
    s =>
      !s.includes('<') &&
      !s.includes('>') &&
      !s.includes('&') &&
      s.trim().length > 0,
  );

/**
 * Arbitrary for generating tags
 */
const tagsArb = fc.array(
  fc
    .string({ minLength: 1, maxLength: 20 })
    .filter(s => /^[a-zA-Z0-9_-]+$/.test(s)),
  { minLength: 0, maxLength: 5 },
);

/**
 * Arbitrary for generating a note
 */
const noteArb = (noteTypeId: number, fieldCount: number): fc.Arbitrary<Note> =>
  fc
    .tuple(
      fc.integer({ min: 1, max: 1000000 }),
      fc.string({ minLength: 10, maxLength: 10 }),
      fc.array(safeTextArb, { minLength: fieldCount, maxLength: fieldCount }),
      tagsArb,
      fc.integer({ min: 1000000000, max: 2000000000 }),
    )
    .map(([id, guid, fields, tags, mod]) => ({
      id,
      guid,
      noteTypeId,
      fields,
      tags,
      mod,
    }));

/**
 * Arbitrary for generating a card
 */
const cardArb = (noteId: number, deckId: number): fc.Arbitrary<Card> =>
  fc
    .record({
      id: fc.integer({ min: 1, max: 1000000 }),
      ord: fc.integer({ min: 0, max: 3 }),
      type: fc.integer({ min: 0, max: 2 }),
      queue: fc.integer({ min: -1, max: 3 }),
      due: fc.integer({ min: 0, max: 1000000 }),
      ivl: fc.integer({ min: 0, max: 365 }),
      factor: fc.integer({ min: 1300, max: 3000 }),
      reps: fc.integer({ min: 0, max: 100 }),
      lapses: fc.integer({ min: 0, max: 50 }),
    })
    .map(c => ({ ...c, noteId, deckId }));

/**
 * Arbitrary for generating a deck
 */
const deckArb = (id: number, name: string): fc.Arbitrary<DeckInfo> =>
  fc.record({
    id: fc.constant(id),
    name: fc.constant(name),
    desc: fc.string({ minLength: 0, maxLength: 100 }),
    conf: fc.integer({ min: 1, max: 10 }),
  });

/**
 * Arbitrary for generating Anki metadata
 */
const metadataArb: fc.Arbitrary<AnkiMetadata> = fc.record({
  creation: fc.integer({ min: 1000000000, max: 2000000000 }),
  mod: fc.integer({ min: 1000000000, max: 2000000000 }),
  scm: fc.integer({ min: 1000000000, max: 2000000000 }),
  ver: fc.integer({ min: 2, max: 21 }),
  dty: fc.integer({ min: 0, max: 1 }),
  usn: fc.integer({ min: -1, max: 1000 }),
  ls: fc.integer({ min: 0, max: 1000000000 }),
});

/**
 * Generate a complete ParsedAnkiData with basic cards
 */
const basicAnkiDataArb: fc.Arbitrary<ParsedAnkiData> = fc
  .tuple(basicNoteTypeArb, fc.integer({ min: 1, max: 10 }), metadataArb)
  .chain(([noteType, cardCount, metadata]) => {
    const deckId = 1;
    const deckName = 'TestDeck';

    return fc
      .tuple(
        fc.array(noteArb(noteType.id, 2), {
          minLength: cardCount,
          maxLength: cardCount,
        }),
        deckArb(deckId, deckName),
      )
      .map(([notes, deck]) => {
        const cards = notes.map((note, i) => ({
          id: i + 1,
          noteId: note.id,
          deckId,
          ord: 0,
          type: 0,
          queue: 0,
          due: 0,
          ivl: 0,
          factor: 2500,
          reps: 0,
          lapses: 0,
        }));

        return {
          notes,
          cards,
          decks: [deck],
          noteTypes: [noteType],
          metadata,
        };
      });
  });

/**
 * Generate ParsedAnkiData with nested decks
 */
const nestedDeckDataArb: fc.Arbitrary<ParsedAnkiData> = fc
  .tuple(basicNoteTypeArb, metadataArb)
  .chain(([noteType, metadata]) => {
    // Create nested deck structure: Parent, Parent::Child, Parent::Child::Grandchild
    const decks: DeckInfo[] = [
      { id: 1, name: 'Parent', desc: 'Parent deck', conf: 1 },
      { id: 2, name: 'Parent::Child', desc: 'Child deck', conf: 1 },
      {
        id: 3,
        name: 'Parent::Child::Grandchild',
        desc: 'Grandchild deck',
        conf: 1,
      },
      { id: 4, name: 'Sibling', desc: 'Sibling deck', conf: 1 },
    ];

    return fc
      .tuple(
        noteArb(noteType.id, 2),
        noteArb(noteType.id, 2),
        noteArb(noteType.id, 2),
        noteArb(noteType.id, 2),
      )
      .map(([note1, note2, note3, note4]) => {
        const notes = [note1, note2, note3, note4];
        const cards: Card[] = [
          {
            id: 1,
            noteId: note1.id,
            deckId: 1,
            ord: 0,
            type: 0,
            queue: 0,
            due: 0,
            ivl: 0,
            factor: 2500,
            reps: 0,
            lapses: 0,
          },
          {
            id: 2,
            noteId: note2.id,
            deckId: 2,
            ord: 0,
            type: 0,
            queue: 0,
            due: 0,
            ivl: 0,
            factor: 2500,
            reps: 0,
            lapses: 0,
          },
          {
            id: 3,
            noteId: note3.id,
            deckId: 3,
            ord: 0,
            type: 0,
            queue: 0,
            due: 0,
            ivl: 0,
            factor: 2500,
            reps: 0,
            lapses: 0,
          },
          {
            id: 4,
            noteId: note4.id,
            deckId: 4,
            ord: 0,
            type: 0,
            queue: 0,
            due: 0,
            ivl: 0,
            factor: 2500,
            reps: 0,
            lapses: 0,
          },
        ];

        return {
          notes,
          cards,
          decks,
          noteTypes: [noteType],
          metadata,
        };
      });
  });

/**
 * Generate ParsedAnkiData with cloze cards
 */
const clozeAnkiDataArb: fc.Arbitrary<ParsedAnkiData> = fc
  .tuple(clozeNoteTypeArb, fc.integer({ min: 1, max: 5 }), metadataArb)
  .chain(([noteType, cardCount, metadata]) => {
    const deckId = 1;

    // Generate cloze text patterns
    const clozeTextArb = fc.oneof(
      fc.constant('{{c1::answer1}} is the answer'),
      fc.constant('The {{c1::first}} and {{c2::second}} items'),
      fc.constant('{{c1::私}}は{{c2::学生}}です'),
      safeTextArb.map(t => `{{c1::${t}}} is important`),
      fc
        .tuple(safeTextArb, safeTextArb)
        .map(([a, b]) => `{{c1::${a}}} and {{c2::${b}}}`),
    );

    return fc
      .array(
        fc.tuple(
          fc.integer({ min: 1, max: 1000000 }),
          fc.string({ minLength: 10, maxLength: 10 }),
          clozeTextArb,
          safeTextArb,
          tagsArb,
        ),
        { minLength: cardCount, maxLength: cardCount },
      )
      .map(noteData => {
        const notes: Note[] = noteData.map(
          ([id, guid, clozeText, extra, tags]) => ({
            id,
            guid,
            noteTypeId: noteType.id,
            fields: [clozeText, extra],
            tags,
            mod: Date.now(),
          }),
        );

        const cards: Card[] = notes.map((note, i) => ({
          id: i + 1,
          noteId: note.id,
          deckId,
          ord: 0,
          type: 0,
          queue: 0,
          due: 0,
          ivl: 0,
          factor: 2500,
          reps: 0,
          lapses: 0,
        }));

        return {
          notes,
          cards,
          decks: [{ id: deckId, name: 'ClozeDeck', desc: '', conf: 1 }],
          noteTypes: [noteType],
          metadata,
        };
      });
  });

/**
 * Generate ParsedAnkiData with custom note types
 */
const customAnkiDataArb: fc.Arbitrary<ParsedAnkiData> = fc
  .tuple(customNoteTypeArb, fc.integer({ min: 1, max: 5 }), metadataArb)
  .chain(([noteType, cardCount, metadata]) => {
    const deckId = 1;
    const fieldCount = noteType.flds.length;

    return fc
      .array(noteArb(noteType.id, fieldCount), {
        minLength: cardCount,
        maxLength: cardCount,
      })
      .map(notes => {
        const cards: Card[] = notes.map((note, i) => ({
          id: i + 1,
          noteId: note.id,
          deckId,
          ord: 0,
          type: 0,
          queue: 0,
          due: 0,
          ivl: 0,
          factor: 2500,
          reps: 0,
          lapses: 0,
        }));

        return {
          notes,
          cards,
          decks: [{ id: deckId, name: 'CustomDeck', desc: '', conf: 1 }],
          noteTypes: [noteType],
          metadata,
        };
      });
  });

describe('JSON Builder', () => {
  describe('Unit Tests', () => {
    it('should build JSON from basic Anki data', () => {
      const data: ParsedAnkiData = {
        notes: [
          {
            id: 1,
            guid: 'abc123',
            noteTypeId: 1,
            fields: ['Front text', 'Back text'],
            tags: ['tag1'],
            mod: Date.now(),
          },
        ],
        cards: [
          {
            id: 1,
            noteId: 1,
            deckId: 1,
            ord: 0,
            type: 0,
            queue: 0,
            due: 0,
            ivl: 0,
            factor: 2500,
            reps: 0,
            lapses: 0,
          },
        ],
        decks: [{ id: 1, name: 'TestDeck', desc: 'Test description', conf: 1 }],
        noteTypes: [
          {
            id: 1,
            name: 'Basic',
            type: 0,
            flds: [
              {
                name: 'Front',
                ord: 0,
                sticky: false,
                rtl: false,
                font: 'Arial',
                size: 14,
              },
              {
                name: 'Back',
                ord: 1,
                sticky: false,
                rtl: false,
                font: 'Arial',
                size: 14,
              },
            ],
            tmpls: [],
          },
        ],
        metadata: {
          creation: 0,
          mod: 0,
          scm: 0,
          ver: 11,
          dty: 0,
          usn: 0,
          ls: 0,
        },
      };

      const result = buildJson(data);

      expect(result.decks).toHaveLength(1);
      expect(result.decks[0].name).toBe('TestDeck');
      expect(result.decks[0].cards).toHaveLength(1);
      expect(result.decks[0].cards[0].type).toBe('basic');
      expect(result.metadata.totalCards).toBe(1);
    });

    it('should extract cloze variations correctly', () => {
      const text = '{{c1::answer1}} is the {{c2::answer2}}';
      const variations = extractClozeVariations(text);

      expect(variations).toHaveLength(2);
      expect(variations[0].index).toBe(1);
      expect(variations[0].answer).toBe('answer1');
      expect(variations[1].index).toBe(2);
      expect(variations[1].answer).toBe('answer2');
    });

    it('should handle cloze with hints', () => {
      const text = '{{c1::Tokyo::capital}} is in Japan';
      const variations = extractClozeVariations(text);

      expect(variations).toHaveLength(1);
      expect(variations[0].answer).toBe('Tokyo');
      expect(variations[0].text).toContain('[capital]');
    });

    it('should build nested deck hierarchy', () => {
      const data: ParsedAnkiData = {
        notes: [
          {
            id: 1,
            guid: 'a',
            noteTypeId: 1,
            fields: ['F1', 'B1'],
            tags: [],
            mod: 0,
          },
          {
            id: 2,
            guid: 'b',
            noteTypeId: 1,
            fields: ['F2', 'B2'],
            tags: [],
            mod: 0,
          },
        ],
        cards: [
          {
            id: 1,
            noteId: 1,
            deckId: 1,
            ord: 0,
            type: 0,
            queue: 0,
            due: 0,
            ivl: 0,
            factor: 2500,
            reps: 0,
            lapses: 0,
          },
          {
            id: 2,
            noteId: 2,
            deckId: 2,
            ord: 0,
            type: 0,
            queue: 0,
            due: 0,
            ivl: 0,
            factor: 2500,
            reps: 0,
            lapses: 0,
          },
        ],
        decks: [
          { id: 1, name: 'Parent', desc: '', conf: 1 },
          { id: 2, name: 'Parent::Child', desc: '', conf: 1 },
        ],
        noteTypes: [
          {
            id: 1,
            name: 'Basic',
            type: 0,
            flds: [
              {
                name: 'Front',
                ord: 0,
                sticky: false,
                rtl: false,
                font: 'Arial',
                size: 14,
              },
              {
                name: 'Back',
                ord: 1,
                sticky: false,
                rtl: false,
                font: 'Arial',
                size: 14,
              },
            ],
            tmpls: [],
          },
        ],
        metadata: {
          creation: 0,
          mod: 0,
          scm: 0,
          ver: 11,
          dty: 0,
          usn: 0,
          ls: 0,
        },
      };

      const result = buildJson(data);

      expect(result.decks).toHaveLength(1);
      expect(result.decks[0].name).toBe('Parent');
      expect(result.decks[0].subdecks).toBeDefined();
      expect(result.decks[0].subdecks).toHaveLength(1);
      expect(result.decks[0].subdecks![0].name).toBe('Child');
    });

    it('should filter suspended cards when includeSuspended is false', () => {
      const data: ParsedAnkiData = {
        notes: [
          {
            id: 1,
            guid: 'a',
            noteTypeId: 1,
            fields: ['F1', 'B1'],
            tags: [],
            mod: 0,
          },
          {
            id: 2,
            guid: 'b',
            noteTypeId: 1,
            fields: ['F2', 'B2'],
            tags: [],
            mod: 0,
          },
        ],
        cards: [
          {
            id: 1,
            noteId: 1,
            deckId: 1,
            ord: 0,
            type: 0,
            queue: 0,
            due: 0,
            ivl: 0,
            factor: 2500,
            reps: 0,
            lapses: 0,
          },
          {
            id: 2,
            noteId: 2,
            deckId: 1,
            ord: 0,
            type: 0,
            queue: -1,
            due: 0,
            ivl: 0,
            factor: 2500,
            reps: 0,
            lapses: 0,
          }, // Suspended
        ],
        decks: [{ id: 1, name: 'Deck', desc: '', conf: 1 }],
        noteTypes: [
          {
            id: 1,
            name: 'Basic',
            type: 0,
            flds: [
              {
                name: 'Front',
                ord: 0,
                sticky: false,
                rtl: false,
                font: 'Arial',
                size: 14,
              },
              {
                name: 'Back',
                ord: 1,
                sticky: false,
                rtl: false,
                font: 'Arial',
                size: 14,
              },
            ],
            tmpls: [],
          },
        ],
        metadata: {
          creation: 0,
          mod: 0,
          scm: 0,
          ver: 11,
          dty: 0,
          usn: 0,
          ls: 0,
        },
      };

      const result = buildJson(data, { includeSuspended: false });
      expect(result.decks[0].cards).toHaveLength(1);

      const resultWithSuspended = buildJson(data, { includeSuspended: true });
      expect(resultWithSuspended.decks[0].cards).toHaveLength(2);
    });
  });

  /**
   * Property-based tests
   *
   * **Feature: anki-converter, Property 3: JSON output validity**
   * **Validates: Requirements 5.1, 5.2, 5.3, 5.4, 5.5**
   */
  describe('Property 3: JSON output validity', () => {
    it('should produce valid JSON for any basic Anki data', () => {
      fc.assert(
        fc.property(basicAnkiDataArb, data => {
          const result = buildJson(data);

          // Result should be valid JSON
          return isValidJsonOutput(result);
        }),
        { numRuns: 100 },
      );
    });

    it('should produce valid JSON for cloze data', () => {
      fc.assert(
        fc.property(clozeAnkiDataArb, data => {
          const result = buildJson(data);
          return isValidJsonOutput(result);
        }),
        { numRuns: 100 },
      );
    });

    it('should produce valid JSON for custom note types', () => {
      fc.assert(
        fc.property(customAnkiDataArb, data => {
          const result = buildJson(data);
          return isValidJsonOutput(result);
        }),
        { numRuns: 100 },
      );
    });

    it('should produce valid JSON for nested deck structures', () => {
      fc.assert(
        fc.property(nestedDeckDataArb, data => {
          const result = buildJson(data);
          return isValidJsonOutput(result);
        }),
        { numRuns: 100 },
      );
    });

    it('should always have required metadata fields', () => {
      fc.assert(
        fc.property(basicAnkiDataArb, data => {
          const result = buildJson(data);

          return (
            typeof result.metadata.convertedAt === 'string' &&
            typeof result.metadata.sourceFormat === 'string' &&
            typeof result.metadata.totalDecks === 'number' &&
            typeof result.metadata.totalCards === 'number' &&
            Array.isArray(result.metadata.noteTypes) &&
            typeof result.metadata.processingTime === 'number'
          );
        }),
        { numRuns: 100 },
      );
    });
  });

  /**
   * **Feature: anki-converter, Property 5: Deck hierarchy preservation**
   * **Validates: Requirements 10.1**
   */
  describe('Property 5: Deck hierarchy preservation', () => {
    it('should preserve parent-child relationships in nested decks', () => {
      fc.assert(
        fc.property(nestedDeckDataArb, data => {
          const result = buildJson(data);

          // Find the Parent deck
          const parentDeck = result.decks.find(d => d.name === 'Parent');
          if (!parentDeck) return false;

          // Should have Child subdeck
          if (!parentDeck.subdecks || parentDeck.subdecks.length === 0)
            return false;

          const childDeck = parentDeck.subdecks.find(d => d.name === 'Child');
          if (!childDeck) return false;

          // Should have Grandchild subdeck
          if (!childDeck.subdecks || childDeck.subdecks.length === 0)
            return false;

          const grandchildDeck = childDeck.subdecks.find(
            d => d.name === 'Grandchild',
          );
          return grandchildDeck !== undefined;
        }),
        { numRuns: 100 },
      );
    });

    it('should preserve all deck names from source', () => {
      fc.assert(
        fc.property(nestedDeckDataArb, data => {
          const result = buildJson(data);

          // Get all deck names from result (flattened)
          const resultNames = flattenDeckNames(result.decks);

          // All source deck names should be represented
          for (const sourceDeck of data.decks) {
            if (!resultNames.includes(sourceDeck.name)) {
              return false;
            }
          }

          return true;
        }),
        { numRuns: 100 },
      );
    });

    it('should place cards in correct deck level', () => {
      fc.assert(
        fc.property(nestedDeckDataArb, data => {
          const result = buildJson(data);

          // Total cards should match
          const totalCards = countTotalCards(result.decks);
          return totalCards === data.cards.length;
        }),
        { numRuns: 100 },
      );
    });
  });

  /**
   * **Feature: anki-converter, Property 10: Cloze deletion extraction**
   * **Validates: Requirements 5.2**
   */
  describe('Property 10: Cloze deletion extraction', () => {
    // Arbitrary for cloze-safe text (no characters that break cloze syntax)
    const clozeSafeTextArb = fc.string({ minLength: 1, maxLength: 30 }).filter(
      s =>
        !s.includes('{') &&
        !s.includes('}') &&
        !s.includes(':') &&
        !s.includes('<') &&
        !s.includes('>') &&
        !s.includes('&') &&
        s.trim().length > 0 &&
        s.trim() === s, // No leading/trailing whitespace
    );

    it('should extract correct number of cloze variations', () => {
      fc.assert(
        fc.property(
          fc.oneof(
            // Single cloze
            clozeSafeTextArb.map(t => ({
              text: `{{c1::${t}}}`,
              expectedCount: 1,
            })),
            // Two clozes
            fc.tuple(clozeSafeTextArb, clozeSafeTextArb).map(([a, b]) => ({
              text: `{{c1::${a}}} and {{c2::${b}}}`,
              expectedCount: 2,
            })),
            // Three clozes
            fc
              .tuple(clozeSafeTextArb, clozeSafeTextArb, clozeSafeTextArb)
              .map(([a, b, c]) => ({
                text: `{{c1::${a}}} {{c2::${b}}} {{c3::${c}}}`,
                expectedCount: 3,
              })),
            // Same index multiple times (should count as 1)
            fc.tuple(clozeSafeTextArb, clozeSafeTextArb).map(([a, b]) => ({
              text: `{{c1::${a}}} and {{c1::${b}}}`,
              expectedCount: 1,
            })),
          ),
          ({ text, expectedCount }) => {
            const variations = extractClozeVariations(text);
            return variations.length === expectedCount;
          },
        ),
        { numRuns: 100 },
      );
    });

    it('should extract correct answers from cloze deletions', () => {
      fc.assert(
        fc.property(clozeSafeTextArb, answer => {
          const text = `The answer is {{c1::${answer}}}`;
          const variations = extractClozeVariations(text);

          return variations.length === 1 && variations[0].answer === answer;
        }),
        { numRuns: 100 },
      );
    });

    it('should generate variation text with hidden cloze', () => {
      fc.assert(
        fc.property(clozeSafeTextArb, answer => {
          const text = `The answer is {{c1::${answer}}}`;
          const variations = extractClozeVariations(text);

          // Variation text should contain [...] placeholder
          return (
            variations.length === 1 && variations[0].text.includes('[...]')
          );
        }),
        { numRuns: 100 },
      );
    });

    it('should handle cloze with hints correctly', () => {
      fc.assert(
        fc.property(
          fc.tuple(clozeSafeTextArb, clozeSafeTextArb),
          ([answer, hint]) => {
            const text = `{{c1::${answer}::${hint}}}`;
            const variations = extractClozeVariations(text);

            // Should use hint as placeholder
            return (
              variations.length === 1 &&
              variations[0].answer === answer &&
              variations[0].text.includes(`[${hint}]`)
            );
          },
        ),
        { numRuns: 100 },
      );
    });

    it('should preserve indices in order', () => {
      fc.assert(
        fc.property(
          fc
            .tuple(clozeSafeTextArb, clozeSafeTextArb, clozeSafeTextArb)
            .map(([a, b, c]) => ({
              text: `{{c3::${c}}} {{c1::${a}}} {{c2::${b}}}`,
            })),
          ({ text }) => {
            const variations = extractClozeVariations(text);

            // Indices should be sorted
            for (let i = 1; i < variations.length; i++) {
              if (variations[i].index < variations[i - 1].index) {
                return false;
              }
            }
            return true;
          },
        ),
        { numRuns: 100 },
      );
    });
  });

  /**
   * **Feature: anki-converter, Property 8: Field name preservation**
   * **Validates: Requirements 5.3, 10.4**
   */
  describe('Property 8: Field name preservation', () => {
    it('should preserve all field names from note type', () => {
      fc.assert(
        fc.property(customAnkiDataArb, data => {
          const result = buildJson(data);

          // Get the note type field names
          const noteType = data.noteTypes[0];
          const expectedFieldNames = noteType.flds.map(f => f.name);

          // Check each card has all field names
          for (const deck of result.decks) {
            for (const card of deck.cards) {
              const cardFieldNames = Object.keys(card.fields);
              for (const expectedName of expectedFieldNames) {
                if (!cardFieldNames.includes(expectedName)) {
                  return false;
                }
              }
            }
          }

          return true;
        }),
        { numRuns: 100 },
      );
    });

    it('should preserve field names exactly as defined', () => {
      fc.assert(
        fc.property(customAnkiDataArb, data => {
          const result = buildJson(data);

          const noteType = data.noteTypes[0];
          const expectedFieldNames = new Set(noteType.flds.map(f => f.name));

          for (const deck of result.decks) {
            for (const card of deck.cards) {
              for (const fieldName of Object.keys(card.fields)) {
                if (!expectedFieldNames.has(fieldName)) {
                  return false;
                }
              }
            }
          }

          return true;
        }),
        { numRuns: 100 },
      );
    });

    it('should include all fields even if empty', () => {
      fc.assert(
        fc.property(customAnkiDataArb, data => {
          const result = buildJson(data);

          const noteType = data.noteTypes[0];
          const expectedFieldCount = noteType.flds.length;

          for (const deck of result.decks) {
            for (const card of deck.cards) {
              if (Object.keys(card.fields).length !== expectedFieldCount) {
                return false;
              }
            }
          }

          return true;
        }),
        { numRuns: 100 },
      );
    });
  });

  /**
   * **Feature: anki-converter, Property 9: Tag array consistency**
   * **Validates: Requirements 5.5**
   */
  describe('Property 9: Tag array consistency', () => {
    it('should always include tags as an array', () => {
      fc.assert(
        fc.property(basicAnkiDataArb, data => {
          const result = buildJson(data);

          for (const deck of result.decks) {
            for (const card of deck.cards) {
              if (!Array.isArray(card.tags)) {
                return false;
              }
            }
          }

          return true;
        }),
        { numRuns: 100 },
      );
    });

    it('should preserve all tags from source notes', () => {
      fc.assert(
        fc.property(basicAnkiDataArb, data => {
          const result = buildJson(data);

          // Build a map of note tags
          const noteTagsMap = new Map<number, string[]>();
          for (const note of data.notes) {
            noteTagsMap.set(note.id, note.tags);
          }

          // Build a map of card to note
          const cardNoteMap = new Map<number, number>();
          for (const card of data.cards) {
            cardNoteMap.set(card.id, card.noteId);
          }

          // Check each output card has correct tags
          for (const deck of result.decks) {
            for (const card of deck.cards) {
              const cardId = parseInt(card.id, 10);
              const noteId = cardNoteMap.get(cardId);
              if (noteId === undefined) continue;

              const expectedTags = noteTagsMap.get(noteId) || [];
              const actualTags = card.tags;

              // All expected tags should be present
              for (const tag of expectedTags) {
                if (!actualTags.includes(tag)) {
                  return false;
                }
              }
            }
          }

          return true;
        }),
        { numRuns: 100 },
      );
    });

    it('should have empty array for cards without tags', () => {
      // Create data with no tags
      const dataWithNoTags: ParsedAnkiData = {
        notes: [
          {
            id: 1,
            guid: 'a',
            noteTypeId: 1,
            fields: ['F', 'B'],
            tags: [],
            mod: 0,
          },
        ],
        cards: [
          {
            id: 1,
            noteId: 1,
            deckId: 1,
            ord: 0,
            type: 0,
            queue: 0,
            due: 0,
            ivl: 0,
            factor: 2500,
            reps: 0,
            lapses: 0,
          },
        ],
        decks: [{ id: 1, name: 'Deck', desc: '', conf: 1 }],
        noteTypes: [
          {
            id: 1,
            name: 'Basic',
            type: 0,
            flds: [
              {
                name: 'Front',
                ord: 0,
                sticky: false,
                rtl: false,
                font: 'Arial',
                size: 14,
              },
              {
                name: 'Back',
                ord: 1,
                sticky: false,
                rtl: false,
                font: 'Arial',
                size: 14,
              },
            ],
            tmpls: [],
          },
        ],
        metadata: {
          creation: 0,
          mod: 0,
          scm: 0,
          ver: 11,
          dty: 0,
          usn: 0,
          ls: 0,
        },
      };

      const result = buildJson(dataWithNoTags);
      const card = result.decks[0].cards[0];

      expect(Array.isArray(card.tags)).toBe(true);
      expect(card.tags).toHaveLength(0);
    });

    it('should not have null or undefined tags', () => {
      fc.assert(
        fc.property(basicAnkiDataArb, data => {
          const result = buildJson(data);

          for (const deck of result.decks) {
            for (const card of deck.cards) {
              if (card.tags === null || card.tags === undefined) {
                return false;
              }
            }
          }

          return true;
        }),
        { numRuns: 100 },
      );
    });
  });
});
