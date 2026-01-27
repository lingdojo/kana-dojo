/**
 * Format Detection Tests
 *
 * Property-based tests for file format detection accuracy.
 *
 * **Feature: anki-converter, Property 1: File format detection accuracy**
 * **Validates: Requirements 3.1, 3.2, 3.3, 3.4, 3.5**
 */

import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import {
  detectFormat,
  detectFormatFromContent,
  detectFormatFromExtension,
  getFileExtension,
  isSupportedFormat,
  getSupportedExtensions,
  getAcceptString,
} from '../lib/formatDetection';
import type { SupportedFormat } from '../types';

// Magic bytes for test data generation
const ZIP_MAGIC = new Uint8Array([0x50, 0x4b, 0x03, 0x04]);
const SQLITE_MAGIC = new Uint8Array([
  0x53, 0x51, 0x4c, 0x69, 0x74, 0x65, 0x20, 0x66, 0x6f, 0x72, 0x6d, 0x61, 0x74,
  0x20, 0x33, 0x00,
]);

/**
 * Create a buffer with magic bytes followed by random content
 */
function createFileWithMagic(
  magic: Uint8Array,
  extraBytes: Uint8Array,
): Uint8Array {
  const result = new Uint8Array(magic.length + extraBytes.length);
  result.set(magic, 0);
  result.set(extraBytes, magic.length);
  return result;
}

/**
 * Create TSV content
 */
function createTsvContent(rows: string[][]): Uint8Array {
  const text = rows.map(row => row.join('\t')).join('\n');
  return new TextEncoder().encode(text);
}

describe('Format Detection', () => {
  describe('getFileExtension', () => {
    it('should extract extension correctly', () => {
      expect(getFileExtension('test.apkg')).toBe('.apkg');
      expect(getFileExtension('test.APKG')).toBe('.apkg');
      expect(getFileExtension('my.deck.apkg')).toBe('.apkg');
      expect(getFileExtension('noextension')).toBe('');
      expect(getFileExtension('file.')).toBe('');
    });
  });

  describe('detectFormatFromExtension', () => {
    it('should detect APKG from extension', () => {
      expect(detectFormatFromExtension('deck.apkg')).toBe('apkg');
      expect(detectFormatFromExtension('deck.APKG')).toBe('apkg');
    });

    it('should detect COLPKG from extension', () => {
      expect(detectFormatFromExtension('collection.colpkg')).toBe('colpkg');
    });

    it('should detect ANKI2 from extension', () => {
      expect(detectFormatFromExtension('collection.anki2')).toBe('anki2');
      expect(detectFormatFromExtension('collection.anki21')).toBe('anki2');
    });

    it('should detect SQLite from extension', () => {
      expect(detectFormatFromExtension('data.db')).toBe('sqlite');
      expect(detectFormatFromExtension('data.sqlite')).toBe('sqlite');
      expect(detectFormatFromExtension('data.sqlite3')).toBe('sqlite');
    });

    it('should detect TSV from extension', () => {
      expect(detectFormatFromExtension('cards.tsv')).toBe('tsv');
      expect(detectFormatFromExtension('cards.txt')).toBe('tsv');
    });

    it('should return unknown for unsupported extensions', () => {
      expect(detectFormatFromExtension('file.pdf')).toBe('unknown');
      expect(detectFormatFromExtension('file.zip')).toBe('unknown');
    });
  });

  describe('detectFormatFromContent', () => {
    it('should detect ZIP files (APKG)', () => {
      const content = createFileWithMagic(
        ZIP_MAGIC,
        new Uint8Array([0, 1, 2, 3]),
      );
      expect(detectFormatFromContent(content)).toBe('apkg');
    });

    it('should detect SQLite files', () => {
      const content = createFileWithMagic(
        SQLITE_MAGIC,
        new Uint8Array([0, 1, 2, 3]),
      );
      expect(detectFormatFromContent(content)).toBe('sqlite');
    });

    it('should detect TSV content', () => {
      const content = createTsvContent([
        ['front', 'back'],
        ['hello', 'world'],
      ]);
      expect(detectFormatFromContent(content)).toBe('tsv');
    });

    it('should return unknown for empty content', () => {
      expect(detectFormatFromContent(new Uint8Array(0))).toBe('unknown');
    });

    it('should return unknown for unrecognized content', () => {
      const content = new Uint8Array([0xff, 0xfe, 0x00, 0x01]);
      expect(detectFormatFromContent(content)).toBe('unknown');
    });
  });

  describe('detectFormat (combined)', () => {
    it('should use both magic and extension for high confidence', () => {
      const content = createFileWithMagic(
        ZIP_MAGIC,
        new Uint8Array([0, 1, 2, 3]),
      );
      const result = detectFormat(content, 'deck.apkg');
      expect(result.format).toBe('apkg');
      expect(result.confidence).toBe('high');
      expect(result.method).toBe('both');
    });

    it('should distinguish COLPKG from APKG using extension', () => {
      const content = createFileWithMagic(
        ZIP_MAGIC,
        new Uint8Array([0, 1, 2, 3]),
      );
      const result = detectFormat(content, 'collection.colpkg');
      expect(result.format).toBe('colpkg');
      expect(result.confidence).toBe('high');
    });

    it('should distinguish ANKI2 from SQLite using extension', () => {
      const content = createFileWithMagic(
        SQLITE_MAGIC,
        new Uint8Array([0, 1, 2, 3]),
      );
      const result = detectFormat(content, 'collection.anki2');
      expect(result.format).toBe('anki2');
      expect(result.confidence).toBe('high');
    });

    it('should prefer magic bytes when extension is missing', () => {
      const content = createFileWithMagic(
        ZIP_MAGIC,
        new Uint8Array([0, 1, 2, 3]),
      );
      const result = detectFormat(content);
      expect(result.format).toBe('apkg');
      expect(result.confidence).toBe('medium');
      expect(result.method).toBe('magic');
    });

    it('should use extension when content is ambiguous', () => {
      const content = new Uint8Array([0xff, 0xfe, 0x00, 0x01]);
      const result = detectFormat(content, 'deck.apkg');
      expect(result.format).toBe('apkg');
      expect(result.confidence).toBe('low');
      expect(result.method).toBe('extension');
    });
  });

  describe('utility functions', () => {
    it('isSupportedFormat should return true for valid formats', () => {
      expect(isSupportedFormat('apkg')).toBe(true);
      expect(isSupportedFormat('colpkg')).toBe(true);
      expect(isSupportedFormat('anki2')).toBe(true);
      expect(isSupportedFormat('sqlite')).toBe(true);
      expect(isSupportedFormat('tsv')).toBe(true);
    });

    it('isSupportedFormat should return false for unknown', () => {
      expect(isSupportedFormat('unknown')).toBe(false);
    });

    it('getSupportedExtensions should return all extensions', () => {
      const extensions = getSupportedExtensions();
      expect(extensions).toContain('.apkg');
      expect(extensions).toContain('.colpkg');
      expect(extensions).toContain('.anki2');
      expect(extensions).toContain('.tsv');
      expect(extensions).toContain('.db');
    });

    it('getAcceptString should return comma-separated extensions', () => {
      const accept = getAcceptString();
      expect(accept).toContain('.apkg');
      expect(accept).toContain(',');
    });
  });

  /**
   * Property-based tests
   *
   * **Feature: anki-converter, Property 1: File format detection accuracy**
   * **Validates: Requirements 3.1, 3.2, 3.3, 3.4, 3.5**
   */
  describe('Property 1: File format detection accuracy', () => {
    it('should correctly identify ZIP-based formats (APKG/COLPKG) from magic bytes', () => {
      fc.assert(
        fc.property(
          fc.uint8Array({ minLength: 0, maxLength: 1000 }),
          extraBytes => {
            const content = createFileWithMagic(ZIP_MAGIC, extraBytes);
            const format = detectFormatFromContent(content);
            // ZIP magic should always be detected as apkg (default for ZIP)
            return format === 'apkg';
          },
        ),
        { numRuns: 100 },
      );
    });

    it('should correctly identify SQLite format from magic bytes', () => {
      fc.assert(
        fc.property(
          fc.uint8Array({ minLength: 0, maxLength: 1000 }),
          extraBytes => {
            const content = createFileWithMagic(SQLITE_MAGIC, extraBytes);
            const format = detectFormatFromContent(content);
            return format === 'sqlite';
          },
        ),
        { numRuns: 100 },
      );
    });

    it('should correctly identify TSV format from content structure', () => {
      // Characters that could be confused with binary file signatures
      const binaryPrefixChars = ['P', 'S', '\x00']; // P=ZIP, S=SQLite, \x00=null

      fc.assert(
        fc.property(
          // Generate 2-10 rows with 2-5 columns of non-empty strings
          fc
            .array(
              fc.array(
                fc
                  .string({ minLength: 1, maxLength: 50 })
                  .filter(
                    s =>
                      !s.includes('\t') &&
                      !s.includes('\n') &&
                      !s.includes('\r'),
                  ),
                { minLength: 2, maxLength: 5 },
              ),
              { minLength: 2, maxLength: 10 },
            )
            .filter(rows => {
              // Ensure first cell doesn't start with binary signature characters
              if (rows.length === 0 || rows[0].length === 0) return false;
              const firstChar = rows[0][0][0];
              return !binaryPrefixChars.includes(firstChar);
            }),
          rows => {
            const content = createTsvContent(rows);
            const format = detectFormatFromContent(content);
            return format === 'tsv';
          },
        ),
        { numRuns: 100 },
      );
    });

    it('should distinguish APKG from COLPKG using file extension', () => {
      fc.assert(
        fc.property(
          fc.uint8Array({ minLength: 0, maxLength: 100 }),
          fc.constantFrom('apkg', 'colpkg') as fc.Arbitrary<'apkg' | 'colpkg'>,
          (extraBytes, expectedFormat) => {
            const content = createFileWithMagic(ZIP_MAGIC, extraBytes);
            const filename = `test.${expectedFormat}`;
            const result = detectFormat(content, filename);
            return result.format === expectedFormat;
          },
        ),
        { numRuns: 100 },
      );
    });

    it('should distinguish ANKI2 from generic SQLite using file extension', () => {
      fc.assert(
        fc.property(
          fc.uint8Array({ minLength: 0, maxLength: 100 }),
          fc.constantFrom(
            '.anki2',
            '.anki21',
            '.db',
            '.sqlite',
          ) as fc.Arbitrary<string>,
          (extraBytes, extension) => {
            const content = createFileWithMagic(SQLITE_MAGIC, extraBytes);
            const filename = `test${extension}`;
            const result = detectFormat(content, filename);

            const expectedFormat: SupportedFormat =
              extension === '.anki2' || extension === '.anki21'
                ? 'anki2'
                : 'sqlite';

            return result.format === expectedFormat;
          },
        ),
        { numRuns: 100 },
      );
    });

    it('should return unknown for random binary data without valid signatures', () => {
      fc.assert(
        fc.property(
          fc.uint8Array({ minLength: 20, maxLength: 1000 }).filter(bytes => {
            // Filter out arrays that accidentally start with valid magic bytes
            const startsWithZip = bytes[0] === 0x50 && bytes[1] === 0x4b;
            const startsWithSqlite = bytes[0] === 0x53 && bytes[1] === 0x51;
            // Also filter out text-like content that could be TSV
            const hasTab = bytes.includes(0x09); // Tab character
            const hasNewline = bytes.includes(0x0a) || bytes.includes(0x0d);
            return (
              !startsWithZip && !startsWithSqlite && !(hasTab && hasNewline)
            );
          }),
          randomBytes => {
            const format = detectFormatFromContent(randomBytes);
            return format === 'unknown';
          },
        ),
        { numRuns: 100 },
      );
    });

    it('should handle extension detection for all supported formats', () => {
      const supportedFormats: Array<{ ext: string; format: SupportedFormat }> =
        [
          { ext: '.apkg', format: 'apkg' },
          { ext: '.colpkg', format: 'colpkg' },
          { ext: '.anki2', format: 'anki2' },
          { ext: '.anki21', format: 'anki2' },
          { ext: '.db', format: 'sqlite' },
          { ext: '.sqlite', format: 'sqlite' },
          { ext: '.sqlite3', format: 'sqlite' },
          { ext: '.tsv', format: 'tsv' },
          { ext: '.txt', format: 'tsv' },
        ];

      fc.assert(
        fc.property(
          fc.constantFrom(...supportedFormats),
          fc
            .string({ minLength: 1, maxLength: 50 })
            .filter(
              s => !s.includes('.') && !s.includes('/') && !s.includes('\\'),
            ),
          ({ ext, format }, basename) => {
            const filename = `${basename}${ext}`;
            const detected = detectFormatFromExtension(filename);
            return detected === format;
          },
        ),
        { numRuns: 100 },
      );
    });

    it('should provide high confidence when magic bytes and extension agree', () => {
      fc.assert(
        fc.property(
          fc.uint8Array({ minLength: 0, maxLength: 100 }),
          extraBytes => {
            // Test with ZIP + .apkg
            const zipContent = createFileWithMagic(ZIP_MAGIC, extraBytes);
            const zipResult = detectFormat(zipContent, 'test.apkg');

            // Test with SQLite + .db
            const sqliteContent = createFileWithMagic(SQLITE_MAGIC, extraBytes);
            const sqliteResult = detectFormat(sqliteContent, 'test.db');

            return (
              zipResult.confidence === 'high' &&
              sqliteResult.confidence === 'high'
            );
          },
        ),
        { numRuns: 100 },
      );
    });
  });
});
