/**
 * APKG Parser
 *
 * Parses Anki Package (.apkg) files by extracting and reading the SQLite database.
 * APKG files are ZIP archives containing:
 * - collection.anki2 or collection.anki21 (SQLite database)
 * - media file (JSON mapping of media files)
 * - numbered media files (0, 1, 2, etc.)
 *
 * @module features/AnkiConverter/parsers/apkgParser
 */

import JSZip from 'jszip';
import type { ParsedAnkiData } from '../types';
import { ConversionError, ErrorCode } from '../types';
import { parseSQLite } from './sqliteParser';

/**
 * Database file names to look for in APKG archives
 * Priority order: anki21 (newer) > anki2 (older)
 */
const DATABASE_FILES = ['collection.anki21', 'collection.anki2'] as const;

/**
 * Result of extracting the database from an APKG file
 */
export interface APKGExtractionResult {
  /** The SQLite database as an ArrayBuffer */
  database: ArrayBuffer;
  /** The database filename that was found */
  databaseName: string;
  /** Media manifest if present (maps numbers to filenames) */
  mediaManifest?: Record<string, string>;
}

/**
 * Extract the SQLite database from an APKG ZIP archive
 *
 * @param zipData - The APKG file content as ArrayBuffer or Uint8Array
 * @returns The extracted database and metadata
 * @throws ConversionError if the ZIP is corrupted or missing required files
 */
export async function extractDatabaseFromAPKG(
  zipData: ArrayBuffer | Uint8Array,
): Promise<APKGExtractionResult> {
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
      `The APKG file appears to be corrupted. Unable to read ZIP archive: ${message}`,
      { originalError: message },
      false,
    );
  }

  // Check if ZIP is empty
  const fileCount = Object.keys(zip.files).length;
  if (fileCount === 0) {
    throw new ConversionError(
      ErrorCode.CORRUPTED_FILE,
      'The APKG file is empty. No files found in the archive.',
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
      `The APKG file has an unusually high compression ratio (${compressionRatio.toFixed(1)}x). This may indicate a zip bomb or corrupted file.`,
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
      `The APKG file is missing the Anki database. Expected one of: ${DATABASE_FILES.join(', ')}`,
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
      `Failed to extract database from APKG: ${message}`,
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
  let mediaManifest: Record<string, string> | undefined;
  const mediaFile = zip.file('media');
  if (mediaFile) {
    try {
      const mediaContent = await mediaFile.async('string');
      mediaManifest = JSON.parse(mediaContent) as Record<string, string>;
    } catch {
      // Media manifest is optional, ignore errors
    }
  }

  return {
    database,
    databaseName,
    mediaManifest,
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
 * Parse an APKG file and extract all Anki data
 *
 * This is the main entry point for APKG parsing. It:
 * 1. Extracts the SQLite database from the ZIP archive
 * 2. Validates the database format
 * 3. Delegates to the SQLite parser for data extraction
 *
 * @param fileData - The APKG file content
 * @returns Parsed Anki data ready for conversion
 * @throws ConversionError if parsing fails
 */
export async function parseAPKG(
  fileData: ArrayBuffer | Uint8Array,
): Promise<ParsedAnkiData> {
  // Extract database from ZIP
  const extraction = await extractDatabaseFromAPKG(fileData);

  // Validate it's a SQLite database
  if (!isValidSqliteDatabase(extraction.database)) {
    throw new ConversionError(
      ErrorCode.CORRUPTED_FILE,
      `The file "${extraction.databaseName}" in the APKG is not a valid SQLite database.`,
      { databaseName: extraction.databaseName },
      false,
    );
  }

  // Parse the SQLite database
  return parseSQLite(extraction.database);
}

/**
 * Check if a file is likely an APKG file based on content
 *
 * @param data - File content to check
 * @returns true if the file appears to be an APKG
 */
export function isAPKGFile(data: ArrayBuffer | Uint8Array): boolean {
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
