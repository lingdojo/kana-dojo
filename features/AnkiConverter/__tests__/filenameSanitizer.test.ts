/**
 * Filename Sanitizer Tests
 *
 * Property-based tests for filename sanitization.
 *
 * @module features/AnkiConverter/__tests__/filenameSanitizer.test.ts
 */

import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import {
  sanitizeFilename,
  generateCollectionFilename,
  isValidFilename,
} from '../lib/filenameSanitizer';

/**
 * Characters that are invalid in filenames across all major operating systems
 */
const INVALID_CHARS = ['/', '\\', ':', '*', '?', '"', '<', '>', '|'];

/**
 * Windows reserved filenames
 */
const WINDOWS_RESERVED = [
  'CON',
  'PRN',
  'AUX',
  'NUL',
  'COM1',
  'COM2',
  'COM3',
  'COM4',
  'COM5',
  'COM6',
  'COM7',
  'COM8',
  'COM9',
  'LPT1',
  'LPT2',
  'LPT3',
  'LPT4',
  'LPT5',
  'LPT6',
  'LPT7',
  'LPT8',
  'LPT9',
];

/**
 * Arbitrary for generating deck names with special characters
 */
const deckNameWithSpecialCharsArb = fc.oneof(
  // Names with invalid filesystem characters
  fc
    .tuple(
      fc.string({ minLength: 1, maxLength: 20 }),
      fc.constantFrom(...INVALID_CHARS),
      fc.string({ minLength: 1, maxLength: 20 }),
    )
    .map(([before, char, after]) => `${before}${char}${after}`),
  // Names with Anki deck separators
  fc
    .tuple(
      fc.string({ minLength: 1, maxLength: 20 }),
      fc.string({ minLength: 1, maxLength: 20 }),
    )
    .map(([parent, child]) => `${parent}::${child}`),
  // Names with multiple invalid characters
  fc
    .tuple(
      fc.string({ minLength: 1, maxLength: 10 }),
      fc.array(fc.constantFrom(...INVALID_CHARS), {
        minLength: 1,
        maxLength: 3,
      }),
      fc.string({ minLength: 1, maxLength: 10 }),
    )
    .map(([before, chars, after]) => `${before}${chars.join('')}${after}`),
);

/**
 * Arbitrary for generating Unicode deck names
 */
const unicodeDeckNameArb = fc.oneof(
  // Japanese
  fc
    .array(
      fc
        .integer({ min: 0x3040, max: 0x309f })
        .map(c => String.fromCodePoint(c)),
      { minLength: 1, maxLength: 30 },
    )
    .map(arr => arr.join('')),
  // Chinese
  fc
    .array(
      fc
        .integer({ min: 0x4e00, max: 0x9fff })
        .map(c => String.fromCodePoint(c)),
      { minLength: 1, maxLength: 30 },
    )
    .map(arr => arr.join('')),
  // Korean
  fc
    .array(
      fc
        .integer({ min: 0xac00, max: 0xd7af })
        .map(c => String.fromCodePoint(c)),
      { minLength: 1, maxLength: 30 },
    )
    .map(arr => arr.join('')),
  // Mixed Unicode with ASCII
  fc
    .tuple(
      fc.string({ minLength: 1, maxLength: 10 }),
      fc
        .array(
          fc
            .integer({ min: 0x3040, max: 0x309f })
            .map(c => String.fromCodePoint(c)),
          { minLength: 1, maxLength: 10 },
        )
        .map(arr => arr.join('')),
    )
    .map(([ascii, unicode]) => `${ascii} ${unicode}`),
);

/**
 * Arbitrary for generating very long deck names
 */
const longDeckNameArb = fc.string({ minLength: 250, maxLength: 500 });

describe('Filename Sanitizer', () => {
  describe('Unit Tests', () => {
    describe('sanitizeFilename', () => {
      it('should handle simple deck names', () => {
        expect(sanitizeFilename('Japanese Vocabulary')).toBe(
          'Japanese Vocabulary.json',
        );
      });

      it('should replace invalid characters', () => {
        expect(sanitizeFilename('Deck/SubDeck')).toBe('Deck_SubDeck.json');
        expect(sanitizeFilename('Test:Name')).toBe('Test_Name.json');
        expect(sanitizeFilename('What?')).toBe('What.json'); // trailing _ is trimmed
        expect(sanitizeFilename('Wh?at')).toBe('Wh_at.json'); // middle _ is preserved
      });

      it('should handle Anki deck separators', () => {
        expect(sanitizeFilename('Parent::Child')).toBe('Parent - Child.json');
        expect(sanitizeFilename('A::B::C')).toBe('A - B - C.json');
      });

      it('should handle empty input', () => {
        expect(sanitizeFilename('')).toBe('deck.json');
        expect(sanitizeFilename('   ')).toBe('deck.json');
      });

      it('should handle Windows reserved names', () => {
        expect(sanitizeFilename('CON')).toBe('CON_file.json');
        expect(sanitizeFilename('nul')).toBe('nul_file.json');
        expect(sanitizeFilename('COM1')).toBe('COM1_file.json');
      });

      it('should preserve Unicode characters', () => {
        expect(sanitizeFilename('日本語')).toBe('日本語.json');
        expect(sanitizeFilename('한국어')).toBe('한국어.json');
        expect(sanitizeFilename('中文')).toBe('中文.json');
      });

      it('should enforce length limits', () => {
        const longName = 'A'.repeat(300);
        const result = sanitizeFilename(longName);
        expect(result.length).toBeLessThanOrEqual(205); // 200 + .json
      });

      it('should allow custom options', () => {
        expect(sanitizeFilename('Test/Name', { replacement: '-' })).toBe(
          'Test-Name.json',
        );
        expect(sanitizeFilename('Test', { addExtension: false })).toBe('Test');
        expect(sanitizeFilename('Test', { extension: '.txt' })).toBe(
          'Test.txt',
        );
      });

      it('should collapse multiple replacement characters', () => {
        expect(sanitizeFilename('A///B')).toBe('A_B.json');
        expect(sanitizeFilename('A***B')).toBe('A_B.json');
      });

      it('should trim replacement characters from ends', () => {
        expect(sanitizeFilename('/Test/')).toBe('Test.json');
        expect(sanitizeFilename('*Name*')).toBe('Name.json');
      });
    });

    describe('generateCollectionFilename', () => {
      it('should use collection name when provided', () => {
        expect(generateCollectionFilename('My Collection')).toBe(
          'My Collection.json',
        );
      });

      it('should generate timestamp-based name when no collection name', () => {
        const result = generateCollectionFilename();
        expect(result).toMatch(
          /^anki_collection_\d{4}-\d{2}-\d{2}T\d{2}-\d{2}-\d{2}\.json$/,
        );
      });

      it('should include deck count when provided', () => {
        const result = generateCollectionFilename(undefined, 5);
        expect(result).toContain('5decks');
      });

      it('should sanitize collection name', () => {
        expect(generateCollectionFilename('My/Collection')).toBe(
          'My_Collection.json',
        );
      });
    });

    describe('isValidFilename', () => {
      it('should return true for valid filenames', () => {
        expect(isValidFilename('test.json')).toBe(true);
        expect(isValidFilename('Japanese Vocabulary.json')).toBe(true);
        expect(isValidFilename('日本語.json')).toBe(true);
      });

      it('should return false for invalid filenames', () => {
        expect(isValidFilename('')).toBe(false);
        expect(isValidFilename('test/file.json')).toBe(false);
        expect(isValidFilename('test:file.json')).toBe(false);
        expect(isValidFilename('CON.json')).toBe(false);
      });

      it('should return false for filenames exceeding length limit', () => {
        const longName = 'A'.repeat(300);
        expect(isValidFilename(longName)).toBe(false);
      });

      it('should return false for filenames with leading/trailing spaces', () => {
        expect(isValidFilename(' test.json')).toBe(false);
        expect(isValidFilename('test.json ')).toBe(false);
      });
    });
  });

  /**
   * Property-based tests
   *
   * **Feature: anki-converter, Property 14: File name sanitization safety**
   * **Validates: Requirements 11.2**
   */
  describe('Property 14: File name sanitization safety', () => {
    it('should always produce valid filenames from any input', () => {
      fc.assert(
        fc.property(fc.string({ minLength: 0, maxLength: 500 }), deckName => {
          const result = sanitizeFilename(deckName);
          return isValidFilename(result);
        }),
        { numRuns: 100 },
      );
    });

    it('should never contain invalid filesystem characters', () => {
      fc.assert(
        fc.property(deckNameWithSpecialCharsArb, deckName => {
          const result = sanitizeFilename(deckName);

          // Check that no invalid characters remain
          for (const char of INVALID_CHARS) {
            if (result.includes(char)) {
              return false;
            }
          }
          return true;
        }),
        { numRuns: 100 },
      );
    });

    it('should preserve Unicode characters', () => {
      fc.assert(
        fc.property(unicodeDeckNameArb, deckName => {
          const result = sanitizeFilename(deckName, { addExtension: false });

          // All Unicode characters from the original should be present
          // (only ASCII special chars should be replaced)
          for (const char of deckName) {
            const codePoint = char.codePointAt(0) ?? 0;
            // Skip ASCII special characters that might be replaced
            if (codePoint < 128 && INVALID_CHARS.includes(char)) {
              continue;
            }
            // Skip whitespace that might be normalized
            if (char === ' ' || char === '\t' || char === '\n') {
              continue;
            }
            // Unicode characters should be preserved
            if (codePoint >= 128 && !result.includes(char)) {
              return false;
            }
          }
          return true;
        }),
        { numRuns: 100 },
      );
    });

    it('should enforce filename length limits', () => {
      fc.assert(
        fc.property(longDeckNameArb, deckName => {
          const result = sanitizeFilename(deckName);
          // Result should be at most 205 characters (200 base + 5 for .json)
          return result.length <= 205;
        }),
        { numRuns: 100 },
      );
    });

    it('should handle Windows reserved names safely', () => {
      fc.assert(
        fc.property(
          fc.constantFrom(...WINDOWS_RESERVED),
          fc.constantFrom('', '.txt', '.json', '.doc'),
          (reserved, ext) => {
            const input = ext ? `${reserved}${ext}` : reserved;
            const result = sanitizeFilename(input, { addExtension: false });

            // The base name (without extension) should not be a reserved name
            const baseName = result.replace(/\.[^.]*$/, '').toUpperCase();
            return !WINDOWS_RESERVED.includes(baseName);
          },
        ),
        { numRuns: 100 },
      );
    });

    it('should never produce empty filenames', () => {
      fc.assert(
        fc.property(
          fc.oneof(
            fc.constant(''),
            fc.constant('   '),
            fc
              .string({ minLength: 0, maxLength: 10 })
              .map(s => s.replace(/[a-zA-Z0-9]/g, '')),
            fc
              .array(fc.constantFrom(...INVALID_CHARS), {
                minLength: 1,
                maxLength: 10,
              })
              .map(arr => arr.join('')),
          ),
          input => {
            const result = sanitizeFilename(input);
            return result.length > 0;
          },
        ),
        { numRuns: 100 },
      );
    });

    it('should always end with the correct extension when addExtension is true', () => {
      fc.assert(
        fc.property(fc.string({ minLength: 0, maxLength: 100 }), deckName => {
          const result = sanitizeFilename(deckName, { addExtension: true });
          return result.endsWith('.json');
        }),
        { numRuns: 100 },
      );
    });

    it('should not have leading or trailing whitespace', () => {
      fc.assert(
        fc.property(fc.string({ minLength: 0, maxLength: 100 }), deckName => {
          const result = sanitizeFilename(deckName);
          return result === result.trim();
        }),
        { numRuns: 100 },
      );
    });

    it('should not contain control characters', () => {
      fc.assert(
        fc.property(
          // Generate strings with potential control characters
          fc.string({ minLength: 1, maxLength: 50 }).chain(s =>
            fc
              .tuple(
                fc.constant(s),
                fc.array(
                  fc
                    .integer({ min: 0, max: 31 })
                    .map(n => String.fromCharCode(n)),
                  { minLength: 0, maxLength: 3 },
                ),
              )
              .map(([str, controls]) => str + controls.join('')),
          ),
          input => {
            const result = sanitizeFilename(input);
            // Check for control characters (0x00-0x1F and 0x7F)
            for (let i = 0; i < result.length; i++) {
              const code = result.charCodeAt(i);
              if ((code >= 0 && code <= 31) || code === 127) {
                return false;
              }
            }
            return true;
          },
        ),
        { numRuns: 100 },
      );
    });

    it('should be idempotent - sanitizing twice produces same result', () => {
      fc.assert(
        fc.property(fc.string({ minLength: 0, maxLength: 100 }), deckName => {
          const firstPass = sanitizeFilename(deckName, { addExtension: false });
          const secondPass = sanitizeFilename(firstPass, {
            addExtension: false,
          });
          return firstPass === secondPass;
        }),
        { numRuns: 100 },
      );
    });
  });
});
