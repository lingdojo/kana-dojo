/**
 * Filename Sanitizer
 *
 * Utilities for sanitizing deck names into valid filenames.
 * Handles special characters, Unicode, and length limits.
 *
 * @module features/AnkiConverter/lib/filenameSanitizer
 */

/**
 * Characters that are invalid in filenames across Windows, macOS, and Linux
 * Windows: / \ : * ? " < > |
 * macOS/Linux: / and null character
 */
const INVALID_FILENAME_CHARS = /[/\\:*?"<>|]/g;

/**
 * Control characters (0x00-0x1F and 0x7F)
 */
const CONTROL_CHARS = /[\x00-\x1F\x7F]/g;

/**
 * Reserved Windows filenames (case-insensitive)
 */
const WINDOWS_RESERVED_NAMES = [
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
 * Maximum filename length (excluding extension)
 * Most filesystems support 255 bytes, but we use 200 to leave room for extension
 * and potential encoding expansion
 */
const MAX_FILENAME_LENGTH = 200;

/**
 * Default replacement character for invalid characters
 */
const DEFAULT_REPLACEMENT = '_';

/**
 * Options for filename sanitization
 */
export interface SanitizeFilenameOptions {
  /** Replacement character for invalid characters (default: '_') */
  replacement?: string;
  /** Maximum filename length excluding extension (default: 200) */
  maxLength?: number;
  /** Whether to add .json extension (default: true) */
  addExtension?: boolean;
  /** Custom extension to add (default: '.json') */
  extension?: string;
}

const DEFAULT_OPTIONS: Required<SanitizeFilenameOptions> = {
  replacement: DEFAULT_REPLACEMENT,
  maxLength: MAX_FILENAME_LENGTH,
  addExtension: true,
  extension: '.json',
};

/**
 * Sanitize a deck name into a valid filename.
 *
 * - Removes or replaces invalid filesystem characters
 * - Handles Unicode characters appropriately (preserves them)
 * - Enforces filename length limits
 * - Handles Windows reserved names
 * - Optionally adds .json extension
 *
 * @param deckName - The deck name to sanitize
 * @param options - Sanitization options
 * @returns A valid filename
 */
export function sanitizeFilename(
  deckName: string,
  options: SanitizeFilenameOptions = {},
): string {
  const opts = { ...DEFAULT_OPTIONS, ...options };

  if (!deckName || deckName.trim().length === 0) {
    return opts.addExtension ? `deck${opts.extension}` : 'deck';
  }

  let result = deckName;

  // Step 1: Remove control characters
  result = result.replace(CONTROL_CHARS, '');

  // Step 2: Replace Anki deck separator (::) with a safe alternative BEFORE replacing individual colons
  result = result.replace(/::/g, ' - ');

  // Step 3: Replace invalid filename characters
  result = result.replace(INVALID_FILENAME_CHARS, opts.replacement);

  // Step 4: Collapse multiple replacement characters
  const escapedReplacement = escapeRegExp(opts.replacement);
  const multipleReplacementPattern = new RegExp(
    `${escapedReplacement}{2,}`,
    'g',
  );
  result = result.replace(multipleReplacementPattern, opts.replacement);

  // Step 5: Trim whitespace and replacement characters from ends (repeat until stable)
  let prevResult = '';
  while (prevResult !== result) {
    prevResult = result;
    result = result.trim();
    result = trimChar(result, opts.replacement);
  }

  // Step 6: Handle Windows reserved names
  const upperResult = result.toUpperCase();
  if (WINDOWS_RESERVED_NAMES.includes(upperResult)) {
    result = `${result}_file`;
  }

  // Also check for reserved names with extensions (e.g., "CON.txt")
  const dotIndex = result.indexOf('.');
  if (dotIndex > 0) {
    const baseName = result.substring(0, dotIndex).toUpperCase();
    if (WINDOWS_RESERVED_NAMES.includes(baseName)) {
      result = `${result.substring(0, dotIndex)}_file${result.substring(dotIndex)}`;
    }
  }

  // Step 7: Handle empty result after sanitization
  if (result.length === 0) {
    result = 'deck';
  }

  // Step 8: Enforce length limit (accounting for extension)
  const extensionLength = opts.addExtension ? opts.extension.length : 0;
  const maxBaseLength = opts.maxLength - extensionLength;

  if (result.length > maxBaseLength) {
    result = truncateToLength(result, maxBaseLength);
  }

  // Step 9: Add extension if requested
  if (opts.addExtension) {
    result = `${result}${opts.extension}`;
  }

  return result;
}

/**
 * Generate a filename for a collection with multiple decks.
 *
 * @param collectionName - Optional collection name
 * @param deckCount - Number of decks in the collection
 * @param options - Sanitization options
 * @returns A valid filename for the collection
 */
export function generateCollectionFilename(
  collectionName?: string,
  deckCount?: number,
  options: SanitizeFilenameOptions = {},
): string {
  const opts = { ...DEFAULT_OPTIONS, ...options };

  if (collectionName && collectionName.trim().length > 0) {
    return sanitizeFilename(collectionName, opts);
  }

  // Generate timestamp-based filename
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  const deckInfo = deckCount ? `_${deckCount}decks` : '';

  return sanitizeFilename(`anki_collection_${timestamp}${deckInfo}`, opts);
}

/**
 * Check if a filename is valid for all major operating systems.
 *
 * @param filename - The filename to validate
 * @returns True if the filename is valid
 */
export function isValidFilename(filename: string): boolean {
  if (!filename || filename.length === 0) {
    return false;
  }

  // Check for invalid characters (create new regex to avoid lastIndex issues)
  const invalidCharsPattern = /[/\\:*?"<>|]/;
  if (invalidCharsPattern.test(filename)) {
    return false;
  }

  // Check for control characters
  const controlCharsPattern = /[\x00-\x1F\x7F]/;
  if (controlCharsPattern.test(filename)) {
    return false;
  }

  // Check length (255 is the common limit)
  if (filename.length > 255) {
    return false;
  }

  // Check for Windows reserved names
  const baseName = filename.replace(/\.[^.]*$/, '').toUpperCase();
  if (WINDOWS_RESERVED_NAMES.includes(baseName)) {
    return false;
  }

  // Check for leading/trailing spaces or dots (problematic on Windows)
  if (filename !== filename.trim()) {
    return false;
  }

  if (filename.endsWith('.')) {
    return false;
  }

  return true;
}

/**
 * Escape special regex characters in a string.
 *
 * @param str - String to escape
 * @returns Escaped string safe for use in RegExp
 */
function escapeRegExp(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Trim a specific character from both ends of a string.
 *
 * @param str - String to trim
 * @param char - Character to trim
 * @returns Trimmed string
 */
function trimChar(str: string, char: string): string {
  let start = 0;
  let end = str.length;

  while (start < end && str[start] === char) {
    start++;
  }

  while (end > start && str[end - 1] === char) {
    end--;
  }

  return str.substring(start, end);
}

/**
 * Truncate a string to a maximum length, trying to break at word boundaries.
 *
 * @param str - String to truncate
 * @param maxLength - Maximum length
 * @returns Truncated string
 */
function truncateToLength(str: string, maxLength: number): string {
  if (str.length <= maxLength) {
    return str;
  }

  // Try to break at a space or underscore
  let truncated = str.substring(0, maxLength);
  const lastSpace = truncated.lastIndexOf(' ');
  const lastUnderscore = truncated.lastIndexOf('_');
  const lastDash = truncated.lastIndexOf('-');

  const breakPoint = Math.max(lastSpace, lastUnderscore, lastDash);

  // Only use break point if it's reasonably close to the end
  if (breakPoint > maxLength * 0.7) {
    truncated = truncated.substring(0, breakPoint);
  }

  // Trim any trailing spaces or underscores
  return truncated.trim().replace(/[_-]+$/, '');
}
