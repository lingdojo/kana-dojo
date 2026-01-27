/**
 * File Format Detection
 *
 * Detects Anki file formats from magic bytes and file extensions.
 * Supports: APKG, TSV, SQLite, COLPKG, ANKI2
 *
 * @module features/AnkiConverter/lib/formatDetection
 */

import type { SupportedFormat } from '../types';

/**
 * Magic bytes for file format detection
 */
const MAGIC_BYTES = {
  // ZIP files (APKG, COLPKG are ZIP archives)
  ZIP: [0x50, 0x4b, 0x03, 0x04], // PK..
  ZIP_EMPTY: [0x50, 0x4b, 0x05, 0x06], // Empty ZIP
  ZIP_SPANNED: [0x50, 0x4b, 0x07, 0x08], // Spanned ZIP

  // SQLite database
  SQLITE: [
    0x53, 0x51, 0x4c, 0x69, 0x74, 0x65, 0x20, 0x66, 0x6f, 0x72, 0x6d, 0x61,
    0x74, 0x20, 0x33, 0x00,
  ], // "SQLite format 3\0"
} as const;

/**
 * File extension to format mapping
 */
const EXTENSION_MAP: Record<string, SupportedFormat> = {
  '.apkg': 'apkg',
  '.colpkg': 'colpkg',
  '.anki2': 'anki2',
  '.anki21': 'anki2',
  '.db': 'sqlite',
  '.sqlite': 'sqlite',
  '.sqlite3': 'sqlite',
  '.tsv': 'tsv',
  '.txt': 'tsv', // Anki can export as .txt with TSV format
};

/**
 * Check if bytes match a magic signature
 */
function matchesMagic(bytes: Uint8Array, magic: readonly number[]): boolean {
  if (bytes.length < magic.length) {
    return false;
  }
  for (let i = 0; i < magic.length; i++) {
    if (bytes[i] !== magic[i]) {
      return false;
    }
  }
  return true;
}

/**
 * Check if the file is a ZIP archive
 */
function isZipFile(bytes: Uint8Array): boolean {
  return (
    matchesMagic(bytes, MAGIC_BYTES.ZIP) ||
    matchesMagic(bytes, MAGIC_BYTES.ZIP_EMPTY) ||
    matchesMagic(bytes, MAGIC_BYTES.ZIP_SPANNED)
  );
}

/**
 * Check if the file is a SQLite database
 */
function isSqliteFile(bytes: Uint8Array): boolean {
  return matchesMagic(bytes, MAGIC_BYTES.SQLITE);
}

/**
 * Check if content looks like TSV (tab-separated values)
 */
function isTsvContent(bytes: Uint8Array): boolean {
  // Check first 1KB for TSV characteristics
  const checkLength = Math.min(bytes.length, 1024);
  const text = new TextDecoder('utf-8', { fatal: false }).decode(
    bytes.slice(0, checkLength),
  );

  // TSV should have tabs and newlines
  const hasTab = text.includes('\t');
  const hasNewline = text.includes('\n') || text.includes('\r');

  // Should not start with binary signatures
  const firstByte = bytes[0];
  const isBinary =
    firstByte === 0x50 || // P (ZIP)
    firstByte === 0x53 || // S (SQLite)
    firstByte === 0x00; // Null byte

  return hasTab && hasNewline && !isBinary;
}

/**
 * Extract file extension from filename (lowercase, with dot)
 */
export function getFileExtension(filename: string): string {
  const lastDot = filename.lastIndexOf('.');
  if (lastDot === -1 || lastDot === filename.length - 1) {
    return '';
  }
  return filename.slice(lastDot).toLowerCase();
}

/**
 * Detect format from file extension only
 */
export function detectFormatFromExtension(filename: string): SupportedFormat {
  const ext = getFileExtension(filename);
  return EXTENSION_MAP[ext] || 'unknown';
}

/**
 * Detect format from file content (magic bytes)
 */
export function detectFormatFromContent(
  content: ArrayBuffer | Uint8Array,
): SupportedFormat {
  const bytes =
    content instanceof Uint8Array ? content : new Uint8Array(content);

  if (bytes.length === 0) {
    return 'unknown';
  }

  // Check for SQLite first (more specific signature)
  if (isSqliteFile(bytes)) {
    return 'sqlite';
  }

  // Check for ZIP (APKG/COLPKG are ZIP files)
  if (isZipFile(bytes)) {
    // Can't distinguish APKG from COLPKG by magic bytes alone
    // Return 'apkg' as default for ZIP files
    return 'apkg';
  }

  // Check for TSV content
  if (isTsvContent(bytes)) {
    return 'tsv';
  }

  return 'unknown';
}

/**
 * Result of format detection
 */
export interface FormatDetectionResult {
  /** Detected format */
  format: SupportedFormat;
  /** Confidence level of detection */
  confidence: 'high' | 'medium' | 'low';
  /** Detection method used */
  method: 'magic' | 'extension' | 'both' | 'none';
}

/**
 * Detect file format using both magic bytes and extension
 *
 * Priority:
 * 1. If magic bytes match, use that (high confidence)
 * 2. If extension matches, use that (medium confidence)
 * 3. If both match and agree, high confidence
 * 4. If both match but disagree, prefer magic bytes
 *
 * @param content - File content as ArrayBuffer or Uint8Array
 * @param filename - Optional filename for extension-based detection
 * @returns Detection result with format, confidence, and method
 */
export function detectFormat(
  content: ArrayBuffer | Uint8Array,
  filename?: string,
): FormatDetectionResult {
  const magicFormat = detectFormatFromContent(content);
  const extFormat = filename ? detectFormatFromExtension(filename) : 'unknown';

  // Both methods detected a format
  if (magicFormat !== 'unknown' && extFormat !== 'unknown') {
    // Special case: ZIP-based formats need extension to distinguish
    if (magicFormat === 'apkg' && extFormat === 'colpkg') {
      return { format: 'colpkg', confidence: 'high', method: 'both' };
    }
    if (magicFormat === 'apkg' && extFormat === 'apkg') {
      return { format: 'apkg', confidence: 'high', method: 'both' };
    }

    // SQLite-based formats: use extension to distinguish anki2 from generic sqlite
    if (magicFormat === 'sqlite' && extFormat === 'anki2') {
      return { format: 'anki2', confidence: 'high', method: 'both' };
    }
    if (magicFormat === 'sqlite' && extFormat === 'sqlite') {
      return { format: 'sqlite', confidence: 'high', method: 'both' };
    }

    // Both agree
    if (magicFormat === extFormat) {
      return { format: magicFormat, confidence: 'high', method: 'both' };
    }

    // Disagree - prefer magic bytes
    return { format: magicFormat, confidence: 'medium', method: 'magic' };
  }

  // Only magic bytes detected
  if (magicFormat !== 'unknown') {
    return { format: magicFormat, confidence: 'medium', method: 'magic' };
  }

  // Only extension detected
  if (extFormat !== 'unknown') {
    return { format: extFormat, confidence: 'low', method: 'extension' };
  }

  // Nothing detected
  return { format: 'unknown', confidence: 'low', method: 'none' };
}

/**
 * Check if a format is supported
 */
export function isSupportedFormat(format: SupportedFormat): boolean {
  return format !== 'unknown';
}

/**
 * Get list of supported file extensions
 */
export function getSupportedExtensions(): string[] {
  return Object.keys(EXTENSION_MAP);
}

/**
 * Get accept string for file input elements
 */
export function getAcceptString(): string {
  return getSupportedExtensions().join(',');
}
