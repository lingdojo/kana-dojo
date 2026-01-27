/**
 * Long Content Handling Property Tests
 *
 * Property-based tests for handling extremely long card content without truncation.
 *
 * **Feature: anki-converter, Property: Long content handling**
 * **Validates: Requirements 11.3**
 */

import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import { buildJson } from '../lib/jsonBuilder';
import { extractText } from '../lib/textExtractor';
import type { ParsedAnkiData, Note, Card, DeckInfo, NoteType } from '../types';

/**
 * Create parsed data with cards containing long content
 */
function createParsedDataWithLongContent(
  contentLength: number,
  contentChar: string = 'a',
): ParsedAnkiData {
  const longContent = contentChar.repeat(contentLength);
  const htmlContent = `<div>${longContent}</div>`;

  const noteType: NoteType = {
    id: 1,
    name: 'Basic',
    type: 0,
    flds: [
      { name: 'Front', ord: 0, sticky: false, rtl: false, font: '', size: 0 },
      { name: 'Back', ord: 1, sticky: false, rtl: false, font: '', size: 0 },
    ],
    tmpls: [
      {
        name: 'Card 1',
        ord: 0,
        qfmt: '{{Front}}',
        afmt: '{{FrontSide}}<hr>{{Back}}',
      },
    ],
  };

  const note: Note = {
    id: 1,
    guid: 'test-guid-1',
    noteTypeId: 1,
    fields: [htmlContent, htmlContent],
    tags: ['test'],
    mod: Date.now(),
  };

  const card: Card = {
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
  };

  const deck: DeckInfo = {
    id: 1,
    name: 'Test Deck',
    desc: 'Test deck with long content',
    conf: 1,
  };

  return {
    notes: [note],
    cards: [card],
    decks: [deck],
    noteTypes: [noteType],
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
 * Create parsed data with multiple cards with varying long content
 */
function createMultipleCardsWithLongContent(
  cardCount: number,
  contentLengths: number[],
): ParsedAnkiData {
  const noteType: NoteType = {
    id: 1,
    name: 'Basic',
    type: 0,
    flds: [
      { name: 'Front', ord: 0, sticky: false, rtl: false, font: '', size: 0 },
      { name: 'Back', ord: 1, sticky: false, rtl: false, font: '', size: 0 },
    ],
    tmpls: [
      {
        name: 'Card 1',
        ord: 0,
        qfmt: '{{Front}}',
        afmt: '{{FrontSide}}<hr>{{Back}}',
      },
    ],
  };

  const notes: Note[] = [];
  const cards: Card[] = [];

  for (let i = 0; i < cardCount; i++) {
    const contentLength = contentLengths[i % contentLengths.length];
    const content = 'x'.repeat(contentLength);
    const htmlContent = `<p>${content}</p>`;

    notes.push({
      id: i + 1,
      guid: `test-guid-${i + 1}`,
      noteTypeId: 1,
      fields: [htmlContent, htmlContent],
      tags: [],
      mod: Date.now(),
    });

    cards.push({
      id: i + 1,
      noteId: i + 1,
      deckId: 1,
      ord: 0,
      type: 0,
      queue: 0,
      due: 0,
      ivl: 0,
      factor: 2500,
      reps: 0,
      lapses: 0,
    });
  }

  const deck: DeckInfo = {
    id: 1,
    name: 'Test Deck',
    desc: 'Test deck with multiple long cards',
    conf: 1,
  };

  return {
    notes,
    cards,
    decks: [deck],
    noteTypes: [noteType],
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

describe('Long Content Handling Property Tests', () => {
  describe('Property: Long content handling', () => {
    it('should not truncate content of any length', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 1000, max: 100000 }),
          fc.constantFrom('a', 'x', '日', '🎌'),
          (contentLength, char) => {
            // Create the actual content string
            const actualContent = char.repeat(contentLength);
            const htmlContent = `<div>${actualContent}</div>`;

            const parsedData = createParsedDataWithLongContent(
              actualContent.length,
              char,
            );

            // Override with our actual content
            parsedData.notes[0].fields[0] = htmlContent;
            parsedData.notes[0].fields[1] = htmlContent;

            const result = buildJson(parsedData);

            // Get the card
            const card = result.decks[0].cards[0];

            // Verify content is not truncated - should match the actual content
            expect(card.fields.Front).toBe(actualContent);
            expect(card.fields.Back).toBe(actualContent);
            expect(card.fields.Front.length).toBe(actualContent.length);
            expect(card.fields.Back.length).toBe(actualContent.length);

            return true;
          },
        ),
        { numRuns: 50 }, // Reduced runs for performance
      );
    });

    it('should preserve exact content for very long strings', () => {
      fc.assert(
        fc.property(fc.integer({ min: 5000, max: 50000 }), contentLength => {
          const expectedContent = 'test'.repeat(contentLength / 4);
          const htmlContent = `<div>${expectedContent}</div>`;

          const parsedData = createParsedDataWithLongContent(
            expectedContent.length,
            'test'.repeat(contentLength / 4).charAt(0),
          );

          // Manually set the content to our test string
          parsedData.notes[0].fields[0] = htmlContent;
          parsedData.notes[0].fields[1] = htmlContent;

          const result = buildJson(parsedData);
          const card = result.decks[0].cards[0];

          // Extract text should preserve content
          const extractedFront = extractText(htmlContent);
          expect(card.fields.Front).toBe(extractedFront);
          expect(card.fields.Back).toBe(extractedFront);

          // Length should match
          expect(card.fields.Front.length).toBe(expectedContent.length);

          return true;
        }),
        { numRuns: 30 },
      );
    });

    it('should handle multiple cards with varying long content', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 5, max: 20 }),
          fc.array(fc.integer({ min: 1000, max: 20000 }), {
            minLength: 1,
            maxLength: 5,
          }),
          (cardCount, contentLengths) => {
            const parsedData = createMultipleCardsWithLongContent(
              cardCount,
              contentLengths,
            );
            const result = buildJson(parsedData);

            // Verify all cards are present
            expect(result.decks[0].cards.length).toBe(cardCount);

            // Verify each card has content matching expected length
            for (let i = 0; i < cardCount; i++) {
              const card = result.decks[0].cards[i];
              const expectedLength = contentLengths[i % contentLengths.length];

              // Content should not be truncated
              expect(card.fields.Front.length).toBe(expectedLength);
              expect(card.fields.Back.length).toBe(expectedLength);
            }

            return true;
          },
        ),
        { numRuns: 30 },
      );
    });

    it('should handle extremely long content without errors', () => {
      fc.assert(
        fc.property(fc.integer({ min: 50000, max: 200000 }), contentLength => {
          // Should not throw for very long content
          const parsedData = createParsedDataWithLongContent(contentLength);
          const result = buildJson(parsedData);

          // Verify result is valid
          expect(result.decks).toBeDefined();
          expect(result.decks[0].cards.length).toBe(1);

          // Verify content length is preserved
          const card = result.decks[0].cards[0];
          expect(card.fields.Front.length).toBe(contentLength);

          return true;
        }),
        { numRuns: 20 }, // Fewer runs for very long content
      );
    });

    it('should preserve long content with HTML tags', () => {
      fc.assert(
        fc.property(fc.integer({ min: 1000, max: 10000 }), contentLength => {
          const content = 'a'.repeat(contentLength);
          const htmlContent = `<div><p><b>${content}</b></p></div>`;

          const parsedData = createParsedDataWithLongContent(contentLength);
          parsedData.notes[0].fields[0] = htmlContent;
          parsedData.notes[0].fields[1] = htmlContent;

          const result = buildJson(parsedData);
          const card = result.decks[0].cards[0];

          // Content should be extracted without truncation
          // The <b> tags are converted to ** markers, so expected content is **content**
          const expectedContent = `**${content}**`;
          expect(card.fields.Front).toBe(expectedContent);
          expect(card.fields.Back).toBe(expectedContent);
          // Length should be original content + 4 characters for the ** markers
          expect(card.fields.Front.length).toBe(contentLength + 4);
          expect(card.fields.Back.length).toBe(contentLength + 4);

          return true;
        }),
        { numRuns: 30 },
      );
    });

    it('should handle long content with special characters', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 1000, max: 10000 }),
          fc.constantFrom('日本語', '中文', 'العربية', '🎌🎎🎏'),
          (repeatCount, specialChars) => {
            const content = specialChars.repeat(repeatCount);
            const htmlContent = `<div>${content}</div>`;

            const parsedData = createParsedDataWithLongContent(content.length);
            parsedData.notes[0].fields[0] = htmlContent;
            parsedData.notes[0].fields[1] = htmlContent;

            const result = buildJson(parsedData);
            const card = result.decks[0].cards[0];

            // Content should be preserved
            expect(card.fields.Front).toBe(content);
            expect(card.fields.Back).toBe(content);

            return true;
          },
        ),
        { numRuns: 30 },
      );
    });

    it('should produce valid JSON for any content length', () => {
      fc.assert(
        fc.property(fc.integer({ min: 100, max: 50000 }), contentLength => {
          const parsedData = createParsedDataWithLongContent(contentLength);
          const result = buildJson(parsedData);

          // Should produce valid JSON
          const jsonString = JSON.stringify(result);
          const parsed = JSON.parse(jsonString);

          // Verify structure
          expect(parsed.decks).toBeDefined();
          expect(parsed.decks[0].cards.length).toBe(1);

          return true;
        }),
        { numRuns: 30 },
      );
    });

    it('should maintain content length through full conversion pipeline', () => {
      fc.assert(
        fc.property(fc.integer({ min: 5000, max: 30000 }), contentLength => {
          const originalContent = 'test'.repeat(contentLength / 4);
          const htmlContent = `<p>${originalContent}</p>`;

          const parsedData = createParsedDataWithLongContent(
            originalContent.length,
          );
          parsedData.notes[0].fields[0] = htmlContent;
          parsedData.notes[0].fields[1] = htmlContent;

          // Build JSON
          const result = buildJson(parsedData);

          // Serialize and deserialize
          const jsonString = JSON.stringify(result);
          const parsed = JSON.parse(jsonString);

          // Verify content length is preserved through serialization
          const card = parsed.decks[0].cards[0];
          expect(card.fields.Front.length).toBe(originalContent.length);
          expect(card.fields.Back.length).toBe(originalContent.length);

          return true;
        }),
        { numRuns: 30 },
      );
    });
  });
});
