/**
 * File Download Utility
 *
 * Utilities for triggering browser downloads of converted JSON files.
 * Handles filename generation, Blob creation, and cleanup.
 *
 * @module features/AnkiConverter/lib/fileDownload
 */

import type { ConversionResult } from '../types';
import {
  sanitizeFilename,
  generateCollectionFilename,
} from './filenameSanitizer';

/**
 * Options for downloading a conversion result
 */
export interface DownloadOptions {
  /** Custom filename (without extension) */
  customFilename?: string;
  /** Original source filename for fallback naming */
  sourceFilename?: string;
  /** Pretty print JSON with indentation (default: true) */
  prettyPrint?: boolean;
  /** Indentation spaces for pretty print (default: 2) */
  indentSpaces?: number;
}

/**
 * Result of a download operation
 */
export interface DownloadResult {
  /** Whether the download was triggered successfully */
  success: boolean;
  /** The filename that was used for download */
  filename: string;
  /** Size of the downloaded file in bytes */
  fileSize: number;
  /** Error message if download failed */
  error?: string;
}

/**
 * Generate a filename for the conversion result.
 *
 * Priority:
 * 1. Custom filename if provided
 * 2. Single deck name if only one deck
 * 3. Collection filename based on source or timestamp
 *
 * @param result - The conversion result
 * @param options - Download options
 * @returns A sanitized filename with .json extension
 */
export function generateDownloadFilename(
  result: ConversionResult,
  options: DownloadOptions = {},
): string {
  const { customFilename, sourceFilename } = options;

  // Priority 1: Custom filename
  if (customFilename && customFilename.trim().length > 0) {
    return sanitizeFilename(customFilename, { addExtension: true });
  }

  // Priority 2: Single deck name
  if (result.decks.length === 1 && result.decks[0].name) {
    return sanitizeFilename(result.decks[0].name, { addExtension: true });
  }

  // Priority 3: Source filename (without original extension)
  if (sourceFilename && sourceFilename.trim().length > 0) {
    const baseName = sourceFilename.replace(/\.[^.]+$/, '');
    return sanitizeFilename(baseName, { addExtension: true });
  }

  // Priority 4: Collection filename with timestamp
  return generateCollectionFilename(undefined, result.decks.length);
}

/**
 * Convert a conversion result to a JSON string.
 *
 * @param result - The conversion result to serialize
 * @param options - Download options
 * @returns JSON string representation
 */
export function resultToJsonString(
  result: ConversionResult,
  options: DownloadOptions = {},
): string {
  const { prettyPrint = true, indentSpaces = 2 } = options;

  if (prettyPrint) {
    return JSON.stringify(result, null, indentSpaces);
  }

  return JSON.stringify(result);
}

/**
 * Create a Blob from a JSON string.
 *
 * @param jsonString - The JSON string to convert
 * @returns A Blob with application/json MIME type
 */
export function createJsonBlob(jsonString: string): Blob {
  return new Blob([jsonString], { type: 'application/json' });
}

/**
 * Trigger a browser download for a Blob.
 *
 * Creates a temporary anchor element, triggers the download,
 * and cleans up the object URL afterwards.
 *
 * @param blob - The Blob to download
 * @param filename - The filename for the download
 * @returns True if download was triggered successfully
 */
export function triggerBlobDownload(blob: Blob, filename: string): boolean {
  try {
    // Create object URL
    const url = URL.createObjectURL(blob);

    // Create temporary anchor element
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = filename;

    // Append to body (required for Firefox)
    document.body.appendChild(anchor);

    // Trigger download
    anchor.click();

    // Clean up
    document.body.removeChild(anchor);
    URL.revokeObjectURL(url);

    return true;
  } catch {
    return false;
  }
}

/**
 * Download a conversion result as a JSON file.
 *
 * This is the main entry point for downloading conversion results.
 * It handles filename generation, JSON serialization, Blob creation,
 * and triggers the browser download.
 *
 * @param result - The conversion result to download
 * @param options - Download options
 * @returns Download result with success status and metadata
 *
 * @example
 * ```typescript
 * const result = await convert(file);
 * const downloadResult = downloadConversionResult(result, {
 *   sourceFilename: file.name,
 * });
 *
 * if (downloadResult.success) {
 *   console.log(`Downloaded ${downloadResult.filename}`);
 * }
 * ```
 */
export function downloadConversionResult(
  result: ConversionResult,
  options: DownloadOptions = {},
): DownloadResult {
  try {
    // Generate filename
    const filename = generateDownloadFilename(result, options);

    // Convert to JSON string
    const jsonString = resultToJsonString(result, options);

    // Create Blob
    const blob = createJsonBlob(jsonString);

    // Trigger download
    const success = triggerBlobDownload(blob, filename);

    if (!success) {
      return {
        success: false,
        filename,
        fileSize: 0,
        error: 'Failed to trigger browser download',
      };
    }

    return {
      success: true,
      filename,
      fileSize: blob.size,
    };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';
    return {
      success: false,
      filename: '',
      fileSize: 0,
      error: `Download failed: ${errorMessage}`,
    };
  }
}

/**
 * Check if the browser supports file downloads.
 *
 * @returns True if downloads are supported
 */
export function isDownloadSupported(): boolean {
  // Check for required APIs
  if (typeof document === 'undefined') {
    return false;
  }

  if (typeof URL === 'undefined' || typeof URL.createObjectURL !== 'function') {
    return false;
  }

  if (typeof Blob === 'undefined') {
    return false;
  }

  // Check if we can create anchor elements
  try {
    const anchor = document.createElement('a');
    return 'download' in anchor;
  } catch {
    return false;
  }
}
