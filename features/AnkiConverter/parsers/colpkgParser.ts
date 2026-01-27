/**
 * COLPKG Parser
 *
 * Parses Anki Collection Package (.colpkg) files by extracting and reading the SQLite database.
 * COLPKG files are ZIP archives containing:
 * - collection.anki21 or collection.anki2 (SQLite database)
 * - media21 file (JSON mapping of media files, newer format)
 * - media file (JSON mapping of media files, older format)
 * - numbered media files (0, 1, 2, etc.)
 *
 * COLPKG files are similar to APKG files but are used for full collection backups
 * and may contain multiple decks.
 *
 * @module features/AnkiConverter/parsers/colpkgParser
 */

import JSZip from 'jszip';
import type { ParsedAnkiData } from '../types';
import { ConversionError, ErrorCode } from '../types';
import { parseSQLite } from './sqliteParser';

/**
 * Database file names to look for in COLPKG archives
 * Priority order: anki21 (newer) > anki2 (older)
 */
const DATABASE_FILES = ['collection.anki21', 'collection.anki2'] as const;

/**
 * Media manifest file names to look for
 * Priority order: media21 (newer) > media (older)
 */
const MEDIA_MANIFEST_FILES = ['media21', 'media'] as const;

/**
 * Result of extracting the database from a COLPKG file
 */
export interface COLPKGExtractionResult {
  /** The SQLite database as an ArrayBuffer */
  database: ArrayBuffer;
  /** The database filename that was found */
  databaseName: string;
  /** Media manifest if present (maps numbers to filenames) */
  mediaManifest?: Record<string, string>;
  /** The media manifest filename that was found */
  mediaManifestName?: string;
}

/**
 * Extract the SQLite database from a COLPKG ZIP archive
 *
 * @param zipData - The COLPKG file content as ArrayBuffer or Uint8Array
 * @returns The extracted database and metadata
 * @throws ConversionError if the ZIP is corrupted or missing required files
 */
export async function extractDatabaseFromCOLPKG(
  zipData: ArrayBuffer | Uint8Array,
): Promise<COLPKGExtractionResult> {
  let zip: JSZip;

  // Get compressed size for zip bomb detection
  const compressedSize =
    zipData instanceof ArrayBuffer ? zipData.byteLength : zipData.length;

  // Try to load the ZIP file
  try {
    zip = await JSZip.loadAsync(zipData);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    throw new ConversionError(
      ErrorCode.CORRUPTED_FILE,
      `The COLPKG file appears to be corrupted. Unable to read ZIP archive: ${message}`,
      { originalError: message },
      false,
    );
  }

  // Check if ZIP is empty
  const fileCount = Object.keys(zip.files).length;
  if (fileCount === 0) {
    throw new ConversionError(
      ErrorCode.CORRUPTED_FILE,
      'The COLPKG file is empty. No files found in the archive.',
      { fileCount: 0 },
      false,
    );
  }

  // Calculate total uncompressed size for zip bomb detection
  let totalUncompressedSize = 0;
  for (const filename of Object.keys(zip.files)) {
    const file = zip.files[filename];
    if (!file.dir) {
      // Use _data.uncompressedSize if available, otherwise estimate
      const uncompressedSize =
        (file as any)._data?.uncompressedSize || compressedSize;
      totalUncompressedSize += uncompressedSize;
    }
  }

  // Zip bomb protection: check compression ratio (max 10x)
  const compressionRatio = totalUncompressedSize / compressedSize;
  if (compressionRatio > 10) {
    throw new ConversionError(
      ErrorCode.CORRUPTED_FILE,
      `The COLPKG file has an unusually high compression ratio (${compressionRatio.toFixed(1)}x). This may indicate a zip bomb or corrupted file.`,
      {
        compressedSize,
        uncompressedSize: totalUncompressedSize,
        compressionRatio: compressionRatio.toFixed(1),
      },
      false,
    );
  }

  // Find the database file
  let databaseFile: JSZip.JSZipObject | null = null;
  let databaseName = '';

  for (const dbName of DATABASE_FILES) {
    const file = zip.file(dbName);
    if (file) {
      databaseFile = file;
      databaseName = dbName;
      break;
    }
  }

  if (!databaseFile) {
    // List available files for debugging
    const availableFiles = Object.keys(zip.files).filter(
      name => !zip.files[name].dir,
    );
    throw new ConversionError(
      ErrorCode.CORRUPTED_FILE,
      `The COLPKG file is missing the Anki database. Expected one of: ${DATABASE_FILES.join(', ')}`,
      {
        expectedFiles: DATABASE_FILES,
        availableFiles: availableFiles.slice(0, 10), // Limit for readability
        totalFiles: availableFiles.length,
      },
      false,
    );
  }

  // Extract the database
  let database: ArrayBuffer;
  try {
    database = await databaseFile.async('arraybuffer');
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    throw new ConversionError(
      ErrorCode.EXTRACTION_ERROR,
      `Failed to extract database from COLPKG: ${message}`,
      { databaseName, originalError: message },
      false,
    );
  }

  // Validate database has content
  if (database.byteLength === 0) {
    throw new ConversionError(
      ErrorCode.CORRUPTED_FILE,
      'The Anki database file is empty.',
      { databaseName, size: 0 },
      false,
    );
  }

  // Try to extract media manifest (optional)
  // COLPKG files may use media21 (newer) or media (older) format
  let mediaManifest: Record<string, string> | undefined;
  let mediaManifestName: string | undefined;

  for (const manifestName of MEDIA_MANIFEST_FILES) {
    const mediaFile = zip.file(manifestName);
    if (mediaFile) {
      try {
        const mediaContent = await mediaFile.async('string');
        mediaManifest = JSON.parse(mediaContent) as Record<string, string>;
        mediaManifestName = manifestName;
        break;
      } catch {
        // Media manifest is optional, try next format or ignore errors
        continue;
      }
    }
  }

  return {
    database,
    databaseName,
    mediaManifest,
    mediaManifestName,
  };
}

/**
 * Validate that an ArrayBuffer contains SQLite data
 *
 * @param buffer - The buffer to validate
 * @returns true if the buffer starts with SQLite magic bytes
 */
export function isValidSqliteDatabase(buffer: ArrayBuffer): boolean {
  if (buffer.byteLength < 16) {
    return false;
  }

  const bytes = new Uint8Array(buffer, 0, 16);
  const sqliteMagic = [
    0x53, 0x51, 0x4c, 0x69, 0x74, 0x65, 0x20, 0x66, 0x6f, 0x72, 0x6d, 0x61,
    0x74, 0x20, 0x33, 0x00,
  ]; // "SQLite format 3\0"

  for (let i = 0; i < sqliteMagic.length; i++) {
    if (bytes[i] !== sqliteMagic[i]) {
      return false;
    }
  }

  return true;
}

/**
 * Parse a COLPKG file and extract all Anki data
 *
 * This is the main entry point for COLPKG parsing. It:
 * 1. Extracts the SQLite database from the ZIP archive
 * 2. Validates the database format
 * 3. Delegates to the SQLite parser for data extraction
 *
 * COLPKG files are collection packages that may contain multiple decks.
 * The SQLite parser handles extracting all decks from the collection.
 *
 * @param fileData - The COLPKG file content
 * @returns Parsed Anki data ready for conversion
 * @throws ConversionError if parsing fails
 */
export async function parseCOLPKG(
  fileData: ArrayBuffer | Uint8Array,
): Promise<ParsedAnkiData> {
  // Extract database from ZIP
  const extraction = await extractDatabaseFromCOLPKG(fileData);

  // Validate it's a SQLite database
  if (!isValidSqliteDatabase(extraction.database)) {
    throw new ConversionError(
      ErrorCode.CORRUPTED_FILE,
      `The file "${extraction.databaseName}" in the COLPKG is not a valid SQLite database.`,
      { databaseName: extraction.databaseName },
      false,
    );
  }

  // Parse the SQLite database
  // The SQLite parser handles all decks in the collection
  return parseSQLite(extraction.database);
}

/**
 * Check if a file is likely a COLPKG file based on content
 *
 * Note: COLPKG and APKG files both use ZIP format, so this only checks
 * for ZIP magic bytes. Use file extension to distinguish between them.
 *
 * @param data - File content to check
 * @returns true if the file appears to be a ZIP archive (potential COLPKG)
 */
export function isCOLPKGFile(data: ArrayBuffer | Uint8Array): boolean {
  const bytes = data instanceof Uint8Array ? data : new Uint8Array(data);

  // Check for ZIP magic bytes (PK..)
  if (bytes.length < 4) {
    return false;
  }

  return (
    bytes[0] === 0x50 && // P
    bytes[1] === 0x4b && // K
    bytes[2] === 0x03 &&
    bytes[3] === 0x04
  );
}

/**
 * Get information about a COLPKG file without full parsing
 *
 * Useful for validation and displaying file info before conversion.
 *
 * @param fileData - The COLPKG file content
 * @returns Information about the COLPKG file
 */
export async function getCOLPKGInfo(
  fileData: ArrayBuffer | Uint8Array,
): Promise<{
  databaseName: string;
  mediaManifestName?: string;
  mediaFileCount: number;
  isValid: boolean;
}> {
  try {
    const extraction = await extractDatabaseFromCOLPKG(fileData);
    const mediaFileCount = extraction.mediaManifest
      ? Object.keys(extraction.mediaManifest).length
      : 0;

    return {
      databaseName: extraction.databaseName,
      mediaManifestName: extraction.mediaManifestName,
      mediaFileCount,
      isValid: isValidSqliteDatabase(extraction.database),
    };
  } catch {
    return {
      databaseName: '',
      mediaFileCount: 0,
      isValid: false,
    };
  }
}
