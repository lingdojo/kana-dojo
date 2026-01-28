/**
 * COLPKG Parser Tests
 *
 * Tests for COLPKG file parsing.
 *
 * **Feature: anki-converter, Property 1: File format detection accuracy (COLPKG subset)**
 * **Validates: Requirements 3.4**
 */

import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import JSZip from 'jszip';
import {
  extractDatabaseFromCOLPKG,
  isValidSqliteDatabase,
  isCOLPKGFile,
  parseCOLPKG,
  getCOLPKGInfo,
} from '../parsers/colpkgParser';
import { ConversionError, ErrorCode } from '../types';

// SQLite magic bytes: "SQLite format 3\0"
const SQLITE_MAGIC = new Uint8Array([
  0x53, 0x51, 0x4c, 0x69, 0x74, 0x65, 0x20, 0x66, 0x6f, 0x72, 0x6d, 0x61, 0x74,
  0x20, 0x33, 0x00,
]);

// ZIP magic bytes
const ZIP_MAGIC = new Uint8Array([0x50, 0x4b, 0x03, 0x04]);

/**
 * Create a minimal valid SQLite database header
 */
function createSqliteHeader(
  extraBytes: Uint8Array = new Uint8Array(0),
): Uint8Array {
  const result = new Uint8Array(SQLITE_MAGIC.length + extraBytes.length);
  result.set(SQLITE_MAGIC, 0);
  result.set(extraBytes, SQLITE_MAGIC.length);
  return result;
}

/**
 * Create a valid COLPKG file (ZIP with collection.anki2 or collection.anki21)
 */
async function createValidCOLPKG(
  databaseContent: Uint8Array,
  databaseName: string = 'collection.anki2',
  mediaManifest?: Record<string, string>,
  mediaManifestName: string = 'media',
): Promise<ArrayBuffer> {
  const zip = new JSZip();
  zip.file(databaseName, databaseContent);

  if (mediaManifest) {
    zip.file(mediaManifestName, JSON.stringify(mediaManifest));
  }

  return zip.generateAsync({ type: 'arraybuffer' });
}

/**
 * Create an empty ZIP file
 */
async function createEmptyZip(): Promise<ArrayBuffer> {
  const zip = new JSZip();
  return zip.generateAsync({ type: 'arraybuffer' });
}

/**
 * Create a ZIP file without the required database
 */
async function createZipWithoutDatabase(): Promise<ArrayBuffer> {
  const zip = new JSZip();
  zip.file('media', '{}');
  zip.file('some-other-file.txt', 'content');
  return zip.generateAsync({ type: 'arraybuffer' });
}

describe('COLPKG Parser', () => {
  describe('isCOLPKGFile', () => {
    it('should return true for valid ZIP magic bytes', () => {
      const data = new Uint8Array([0x50, 0x4b, 0x03, 0x04, 0x00, 0x00]);
      expect(isCOLPKGFile(data)).toBe(true);
    });

    it('should return false for non-ZIP data', () => {
      const data = new Uint8Array([0x00, 0x01, 0x02, 0x03]);
      expect(isCOLPKGFile(data)).toBe(false);
    });

    it('should return false for data too short', () => {
      const data = new Uint8Array([0x50, 0x4b]);
      expect(isCOLPKGFile(data)).toBe(false);
    });

    it('should return false for SQLite data', () => {
      expect(isCOLPKGFile(SQLITE_MAGIC)).toBe(false);
    });
  });

  describe('isValidSqliteDatabase', () => {
    it('should return true for valid SQLite header', () => {
      const db = createSqliteHeader(new Uint8Array(100));
      expect(isValidSqliteDatabase(db.buffer as ArrayBuffer)).toBe(true);
    });

    it('should return false for non-SQLite data', () => {
      const data = new Uint8Array([0x00, 0x01, 0x02, 0x03, 0x04, 0x05]);
      expect(isValidSqliteDatabase(data.buffer)).toBe(false);
    });

    it('should return false for data too short', () => {
      const data = new Uint8Array([0x53, 0x51, 0x4c]);
      expect(isValidSqliteDatabase(data.buffer)).toBe(false);
    });
  });

  describe('extractDatabaseFromCOLPKG', () => {
    it('should extract collection.anki2 from valid COLPKG', async () => {
      const dbContent = createSqliteHeader(new Uint8Array(100));
      const colpkg = await createValidCOLPKG(dbContent, 'collection.anki2');

      const result = await extractDatabaseFromCOLPKG(colpkg);

      expect(result.databaseName).toBe('collection.anki2');
      expect(result.database.byteLength).toBeGreaterThan(0);
    });

    it('should extract collection.anki21 from valid COLPKG', async () => {
      const dbContent = createSqliteHeader(new Uint8Array(100));
      const colpkg = await createValidCOLPKG(dbContent, 'collection.anki21');

      const result = await extractDatabaseFromCOLPKG(colpkg);

      expect(result.databaseName).toBe('collection.anki21');
    });

    it('should prefer collection.anki21 over collection.anki2', async () => {
      const dbContent = createSqliteHeader(new Uint8Array(100));
      const zip = new JSZip();
      zip.file('collection.anki21', dbContent);
      zip.file('collection.anki2', dbContent);
      const colpkg = await zip.generateAsync({ type: 'arraybuffer' });

      const result = await extractDatabaseFromCOLPKG(colpkg);

      expect(result.databaseName).toBe('collection.anki21');
    });

    it('should extract media manifest if present (older format)', async () => {
      const dbContent = createSqliteHeader(new Uint8Array(100));
      const mediaManifest = { '0': 'image.jpg', '1': 'audio.mp3' };
      const colpkg = await createValidCOLPKG(
        dbContent,
        'collection.anki2',
        mediaManifest,
        'media',
      );

      const result = await extractDatabaseFromCOLPKG(colpkg);

      expect(result.mediaManifest).toEqual(mediaManifest);
      expect(result.mediaManifestName).toBe('media');
    });

    it('should extract media21 manifest if present (newer format)', async () => {
      const dbContent = createSqliteHeader(new Uint8Array(100));
      const mediaManifest = { '0': 'image.jpg', '1': 'audio.mp3' };
      const colpkg = await createValidCOLPKG(
        dbContent,
        'collection.anki21',
        mediaManifest,
        'media21',
      );

      const result = await extractDatabaseFromCOLPKG(colpkg);

      expect(result.mediaManifest).toEqual(mediaManifest);
      expect(result.mediaManifestName).toBe('media21');
    });

    it('should prefer media21 over media manifest', async () => {
      const dbContent = createSqliteHeader(new Uint8Array(100));
      const media21Manifest = { '0': 'new-image.jpg' };
      const mediaManifest = { '0': 'old-image.jpg' };

      const zip = new JSZip();
      zip.file('collection.anki21', dbContent);
      zip.file('media21', JSON.stringify(media21Manifest));
      zip.file('media', JSON.stringify(mediaManifest));
      const colpkg = await zip.generateAsync({ type: 'arraybuffer' });

      const result = await extractDatabaseFromCOLPKG(colpkg);

      expect(result.mediaManifest).toEqual(media21Manifest);
      expect(result.mediaManifestName).toBe('media21');
    });

    it('should throw CORRUPTED_FILE for empty ZIP', async () => {
      const emptyZip = await createEmptyZip();

      await expect(extractDatabaseFromCOLPKG(emptyZip)).rejects.toThrow(
        ConversionError,
      );

      try {
        await extractDatabaseFromCOLPKG(emptyZip);
      } catch (error) {
        expect(error).toBeInstanceOf(ConversionError);
        expect((error as ConversionError).code).toBe(ErrorCode.CORRUPTED_FILE);
      }
    });

    it('should throw CORRUPTED_FILE for ZIP without database', async () => {
      const zipWithoutDb = await createZipWithoutDatabase();

      await expect(extractDatabaseFromCOLPKG(zipWithoutDb)).rejects.toThrow(
        ConversionError,
      );

      try {
        await extractDatabaseFromCOLPKG(zipWithoutDb);
      } catch (error) {
        expect(error).toBeInstanceOf(ConversionError);
        expect((error as ConversionError).code).toBe(ErrorCode.CORRUPTED_FILE);
        expect((error as ConversionError).message).toContain(
          'missing the Anki database',
        );
      }
    });

    it('should throw CORRUPTED_FILE for invalid ZIP data', async () => {
      const invalidData = new Uint8Array([0x00, 0x01, 0x02, 0x03]);

      await expect(extractDatabaseFromCOLPKG(invalidData)).rejects.toThrow(
        ConversionError,
      );

      try {
        await extractDatabaseFromCOLPKG(invalidData);
      } catch (error) {
        expect(error).toBeInstanceOf(ConversionError);
        expect((error as ConversionError).code).toBe(ErrorCode.CORRUPTED_FILE);
      }
    });
  });

  describe('parseCOLPKG', () => {
    it('should throw CORRUPTED_FILE when database is not valid SQLite', async () => {
      const invalidDb = new Uint8Array([0x00, 0x01, 0x02, 0x03, 0x04, 0x05]);
      const colpkg = await createValidCOLPKG(invalidDb);

      await expect(parseCOLPKG(colpkg)).rejects.toThrow(ConversionError);

      try {
        await parseCOLPKG(colpkg);
      } catch (error) {
        expect(error).toBeInstanceOf(ConversionError);
        expect((error as ConversionError).code).toBe(ErrorCode.CORRUPTED_FILE);
        expect((error as ConversionError).message).toContain(
          'not a valid SQLite database',
        );
      }
    });
  });

  describe('getCOLPKGInfo', () => {
    it('should return info for valid COLPKG with media manifest', async () => {
      const dbContent = createSqliteHeader(new Uint8Array(100));
      const mediaManifest = { '0': 'image.jpg', '1': 'audio.mp3' };
      const colpkg = await createValidCOLPKG(
        dbContent,
        'collection.anki21',
        mediaManifest,
        'media21',
      );

      const info = await getCOLPKGInfo(colpkg);

      expect(info.databaseName).toBe('collection.anki21');
      expect(info.mediaManifestName).toBe('media21');
      expect(info.mediaFileCount).toBe(2);
      expect(info.isValid).toBe(true);
    });

    it('should return isValid false for invalid COLPKG', async () => {
      const invalidData = new Uint8Array([0x00, 0x01, 0x02, 0x03]);

      const info = await getCOLPKGInfo(invalidData);

      expect(info.isValid).toBe(false);
      expect(info.databaseName).toBe('');
    });
  });

  /**
   * Property-based tests
   *
   * **Feature: anki-converter, Property 1: File format detection accuracy (COLPKG subset)**
   * **Validates: Requirements 3.4**
   */
  describe('Property 1: File format detection accuracy (COLPKG subset)', () => {
    it('should correctly identify ZIP files as potential COLPKG files', () => {
      fc.assert(
        fc.property(
          fc.uint8Array({ minLength: 0, maxLength: 500 }),
          extraBytes => {
            // Create data with ZIP magic bytes
            const zipData = new Uint8Array(
              ZIP_MAGIC.length + extraBytes.length,
            );
            zipData.set(ZIP_MAGIC, 0);
            zipData.set(extraBytes, ZIP_MAGIC.length);

            return isCOLPKGFile(zipData) === true;
          },
        ),
        { numRuns: 100 },
      );
    });

    it('should correctly identify SQLite headers in extracted databases', () => {
      fc.assert(
        fc.property(
          fc.uint8Array({ minLength: 0, maxLength: 500 }),
          extraBytes => {
            const sqliteData = createSqliteHeader(extraBytes);
            return (
              isValidSqliteDatabase(sqliteData.buffer as ArrayBuffer) === true
            );
          },
        ),
        { numRuns: 100 },
      );
    });

    it('should reject non-ZIP data as COLPKG files', () => {
      fc.assert(
        fc.property(
          fc.uint8Array({ minLength: 4, maxLength: 500 }).filter(bytes => {
            // Filter out data that accidentally starts with ZIP magic
            return !(
              bytes[0] === 0x50 &&
              bytes[1] === 0x4b &&
              bytes[2] === 0x03 &&
              bytes[3] === 0x04
            );
          }),
          randomBytes => {
            return isCOLPKGFile(randomBytes) === false;
          },
        ),
        { numRuns: 100 },
      );
    });

    it('should reject non-SQLite data as valid databases', () => {
      fc.assert(
        fc.property(
          fc.uint8Array({ minLength: 16, maxLength: 500 }).filter(bytes => {
            // Filter out data that accidentally starts with SQLite magic
            const sqliteMagicStr = 'SQLite format 3';
            const bytesStr = String.fromCharCode(...bytes.slice(0, 15));
            return bytesStr !== sqliteMagicStr;
          }),
          randomBytes => {
            return isValidSqliteDatabase(randomBytes.buffer) === false;
          },
        ),
        { numRuns: 100 },
      );
    });

    it('should successfully extract database from any valid COLPKG structure', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.uint8Array({ minLength: 16, maxLength: 200 }),
          fc.constantFrom('collection.anki2', 'collection.anki21'),
          async (extraDbContent, dbName) => {
            // Create a valid SQLite header with extra content
            const dbContent = createSqliteHeader(extraDbContent);
            const colpkg = await createValidCOLPKG(dbContent, dbName);

            const result = await extractDatabaseFromCOLPKG(colpkg);

            return (
              result.databaseName === dbName &&
              result.database.byteLength === dbContent.length
            );
          },
        ),
        { numRuns: 50 }, // Fewer runs due to async nature
      );
    });

    it('should always throw ConversionError for corrupted ZIP data', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.uint8Array({ minLength: 4, maxLength: 100 }).filter(bytes => {
            // Ensure it's not accidentally valid ZIP
            return !(
              bytes[0] === 0x50 &&
              bytes[1] === 0x4b &&
              bytes[2] === 0x03 &&
              bytes[3] === 0x04
            );
          }),
          async invalidData => {
            try {
              await extractDatabaseFromCOLPKG(invalidData);
              return false; // Should have thrown
            } catch (error) {
              return (
                error instanceof ConversionError &&
                error.code === ErrorCode.CORRUPTED_FILE
              );
            }
          },
        ),
        { numRuns: 50 },
      );
    });

    it('should preserve database content integrity during extraction', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.uint8Array({ minLength: 0, maxLength: 200 }),
          async extraContent => {
            const originalDb = createSqliteHeader(extraContent);
            const colpkg = await createValidCOLPKG(originalDb);

            const result = await extractDatabaseFromCOLPKG(colpkg);
            const extractedDb = new Uint8Array(result.database);

            // Verify the extracted database matches the original
            if (extractedDb.length !== originalDb.length) {
              return false;
            }

            for (let i = 0; i < originalDb.length; i++) {
              if (extractedDb[i] !== originalDb[i]) {
                return false;
              }
            }

            return true;
          },
        ),
        { numRuns: 50 },
      );
    });

    it('should handle both media and media21 manifest formats', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.constantFrom('media', 'media21'),
          fc.dictionary(
            fc.integer({ min: 0, max: 999 }).map(n => n.toString()),
            fc.string({ minLength: 1, maxLength: 20 }),
            { minKeys: 0, maxKeys: 5 },
          ),
          async (manifestName, manifest) => {
            const dbContent = createSqliteHeader(new Uint8Array(100));
            const colpkg = await createValidCOLPKG(
              dbContent,
              'collection.anki21',
              manifest,
              manifestName,
            );

            const result = await extractDatabaseFromCOLPKG(colpkg);

            // If manifest was provided and not empty, it should be extracted
            if (Object.keys(manifest).length > 0) {
              return (
                result.mediaManifestName === manifestName &&
                JSON.stringify(result.mediaManifest) ===
                  JSON.stringify(manifest)
              );
            }
            return true;
          },
        ),
        { numRuns: 50 },
      );
    });
  });
});
