/**
 * Conversion Pipeline
 *
 * Orchestrates the conversion process from Anki files to JSON.
 * Manages stage progression, progress events, and error handling.
 *
 * @module features/AnkiConverter/lib/conversionPipeline
 */

import type {
  ConversionOptions,
  ConversionResult,
  ProgressEvent,
  ConversionStage,
  SupportedFormat,
  ParsedAnkiData,
} from '../types';
import { ConversionError, ErrorCode } from '../types';
import { detectFormat, isSupportedFormat } from './formatDetection';
import { buildJson } from './jsonBuilder';
import { parseAPKG } from '../parsers/apkgParser';
import { parseCOLPKG } from '../parsers/colpkgParser';
import { parseSQLite } from '../parsers/sqliteParser';
import { parseTSVFromBuffer } from '../parsers/tsvParser';

/**
 * Stage weights for progress calculation (must sum to 100)
 */
const STAGE_WEIGHTS: Record<ConversionStage, number> = {
  detecting: 5,
  parsing: 40,
  extracting: 20,
  transforming: 20,
  building: 15,
};

/**
 * Stage order for progression
 */
const STAGE_ORDER: ConversionStage[] = [
  'detecting',
  'parsing',
  'extracting',
  'transforming',
  'building',
];

/**
 * Calculate cumulative progress up to a stage
 */
function getStageStartProgress(stage: ConversionStage): number {
  let progress = 0;
  for (const s of STAGE_ORDER) {
    if (s === stage) break;
    progress += STAGE_WEIGHTS[s];
  }
  return progress;
}

/**
 * Calculate progress within a stage
 */
function calculateProgress(
  stage: ConversionStage,
  stageProgress: number,
): number {
  const stageStart = getStageStartProgress(stage);
  const stageWeight = STAGE_WEIGHTS[stage];
  const progress = stageStart + (stageProgress / 100) * stageWeight;
  return Math.min(100, Math.max(0, Math.round(progress)));
}

/**
 * Stage descriptions for progress messages
 */
const STAGE_MESSAGES: Record<ConversionStage, string> = {
  detecting: 'Detecting file format...',
  parsing: 'Parsing Anki data...',
  extracting: 'Extracting card content...',
  transforming: 'Transforming data...',
  building: 'Building JSON output...',
};

/**
 * Conversion pipeline interface
 */
export interface ConversionPipeline {
  convert(
    file: File | ArrayBuffer,
    options: ConversionOptions,
  ): Promise<ConversionResult>;
  on(event: 'progress', callback: (progress: ProgressEvent) => void): void;
  on(event: 'error', callback: (error: ConversionError) => void): void;
  off(event: 'progress', callback: (progress: ProgressEvent) => void): void;
  off(event: 'error', callback: (error: ConversionError) => void): void;
}

/**
 * Event listeners storage
 */
interface PipelineListeners {
  progress: Set<(progress: ProgressEvent) => void>;
  error: Set<(error: ConversionError) => void>;
}

/**
 * Create a new conversion pipeline
 *
 * The pipeline orchestrates the conversion process through stages:
 * 1. Detection - Identify file format
 * 2. Parsing - Parse the file using appropriate parser
 * 3. Extracting - Extract card content from parsed data
 * 4. Transforming - Clean and transform text content
 * 5. Building - Build final JSON structure
 */
export function createConversionPipeline(): ConversionPipeline {
  const listeners: PipelineListeners = {
    progress: new Set(),
    error: new Set(),
  };

  let lastProgress = -1;

  /**
   * Emit a progress event
   */
  function emitProgress(
    stage: ConversionStage,
    stageProgress: number,
    message?: string,
  ): void {
    const progress = calculateProgress(stage, stageProgress);

    // Ensure monotonicity - never emit a lower progress value
    if (progress <= lastProgress) {
      return;
    }
    lastProgress = progress;

    const event: ProgressEvent = {
      stage,
      progress,
      message: message || STAGE_MESSAGES[stage],
    };

    for (const callback of listeners.progress) {
      try {
        callback(event);
      } catch {
        // Ignore callback errors
      }
    }
  }

  /**
   * Emit an error event
   */
  function emitError(error: ConversionError): void {
    for (const callback of listeners.error) {
      try {
        callback(error);
      } catch {
        // Ignore callback errors
      }
    }
  }

  /**
   * Check if value is an ArrayBuffer
   */
  function isArrayBuffer(value: unknown): value is ArrayBuffer {
    return (
      value instanceof ArrayBuffer ||
      (typeof value === 'object' &&
        value !== null &&
        value.constructor?.name === 'ArrayBuffer')
    );
  }

  /**
   * Check if value is a File
   */
  function isFile(value: unknown): value is File {
    return typeof File !== 'undefined' && value instanceof File;
  }

  /**
   * Get file content as ArrayBuffer
   */
  async function getFileBuffer(file: File | ArrayBuffer): Promise<ArrayBuffer> {
    if (isArrayBuffer(file)) {
      return file;
    }
    if (isFile(file)) {
      return file.arrayBuffer();
    }
    // Fallback: try to treat as ArrayBuffer-like
    if (typeof file === 'object' && file !== null && 'byteLength' in file) {
      return file as ArrayBuffer;
    }
    throw new ConversionError(
      ErrorCode.INVALID_FORMAT,
      'Invalid input: expected File or ArrayBuffer',
      { inputType: typeof file },
      false,
    );
  }

  /**
   * Get filename from File object
   */
  function getFilename(file: File | ArrayBuffer): string | undefined {
    if (isFile(file)) {
      return file.name;
    }
    return undefined;
  }

  /**
   * Detect file format
   */
  function detectFileFormat(
    buffer: ArrayBuffer,
    filename?: string,
    forcedFormat?: ConversionOptions['format'],
  ): SupportedFormat {
    // Use forced format if specified and not 'auto'
    if (forcedFormat && forcedFormat !== 'auto') {
      return forcedFormat;
    }

    const result = detectFormat(buffer, filename);

    if (!isSupportedFormat(result.format)) {
      const supportedFormats = '.apkg, .tsv, .db, .sqlite, .anki2, .colpkg';
      throw new ConversionError(
        ErrorCode.INVALID_FORMAT,
        `The file '${filename || 'unknown'}' is not a recognized Anki format. Supported formats: ${supportedFormats}`,
        {
          filename,
          detectedFormat: result.format,
          confidence: result.confidence,
          method: result.method,
          supportedFormats,
        },
        false,
      );
    }

    return result.format;
  }

  /**
   * Parse file based on detected format
   */
  async function parseFile(
    buffer: ArrayBuffer,
    format: SupportedFormat,
    filename?: string,
  ): Promise<ParsedAnkiData> {
    try {
      switch (format) {
        case 'apkg':
          return await parseAPKG(buffer);

        case 'colpkg':
          return await parseCOLPKG(buffer);

        case 'sqlite':
        case 'anki2':
          return await parseSQLite(buffer);

        case 'tsv':
          return await parseTSVFromBuffer(buffer, {
            deckName: filename
              ? filename.replace(/\.[^.]+$/, '')
              : 'Imported Deck',
          });

        default:
          throw new ConversionError(
            ErrorCode.INVALID_FORMAT,
            `Unsupported format: ${format}`,
            { format },
            false,
          );
      }
    } catch (error) {
      if (error instanceof ConversionError) {
        throw error;
      }

      const message = error instanceof Error ? error.message : 'Unknown error';
      throw new ConversionError(
        ErrorCode.PARSE_ERROR,
        `Failed to parse ${format.toUpperCase()} file: ${message}. ${getRecoveryGuidance(format)}`,
        {
          format,
          filename,
          originalError: message,
        },
        false,
      );
    }
  }

  /**
   * Get recovery guidance for a format
   */
  function getRecoveryGuidance(format: SupportedFormat): string {
    switch (format) {
      case 'apkg':
      case 'colpkg':
        return 'Try exporting the deck again from Anki.';
      case 'sqlite':
      case 'anki2':
        return 'Ensure the database file is not corrupted.';
      case 'tsv':
        return 'Verify the file is properly tab-separated.';
      default:
        return 'Please check the file format.';
    }
  }

  /**
   * Main conversion function
   */
  async function convert(
    file: File | ArrayBuffer,
    options: ConversionOptions = {},
  ): Promise<ConversionResult> {
    const startTime = Date.now();
    lastProgress = -1;

    try {
      // Stage 1: Detection
      emitProgress('detecting', 0, 'Reading file...');
      const buffer = await getFileBuffer(file);
      const filename = getFilename(file);

      // Validate file size (500MB for browser, 2GB for CLI)
      const maxSize =
        typeof window !== 'undefined'
          ? 500 * 1024 * 1024
          : 2 * 1024 * 1024 * 1024;
      validateFileSize(buffer.byteLength, maxSize);

      emitProgress('detecting', 50, 'Analyzing file format...');
      const format = detectFileFormat(buffer, filename, options.format);
      emitProgress(
        'detecting',
        100,
        `Detected format: ${format.toUpperCase()}`,
      );

      // Stage 2: Parsing
      emitProgress('parsing', 0, `Parsing ${format.toUpperCase()} file...`);
      const parsedData = await parseFile(buffer, format, filename);
      emitProgress('parsing', 100, 'Parsing complete');

      // Stage 3: Extracting
      emitProgress('extracting', 0, 'Extracting card data...');
      // Extraction is handled within parsing, but we emit progress for UI
      const cardCount = parsedData.cards.length;
      const noteCount = parsedData.notes.length;
      emitProgress(
        'extracting',
        100,
        `Extracted ${cardCount} cards from ${noteCount} notes`,
      );

      // Stage 4: Transforming
      emitProgress('transforming', 0, 'Cleaning text content...');
      // Transformation happens in buildJson via textExtractor
      emitProgress('transforming', 100, 'Text transformation complete');

      // Stage 5: Building
      emitProgress('building', 0, 'Building JSON structure...');
      const result = buildJson(parsedData, options, startTime);
      emitProgress('building', 100, 'Conversion complete');

      return result;
    } catch (error) {
      // Wrap non-ConversionError errors
      const conversionError =
        error instanceof ConversionError
          ? error
          : new ConversionError(
              ErrorCode.UNKNOWN_ERROR,
              error instanceof Error
                ? error.message
                : 'An unexpected error occurred during conversion',
              {
                originalError:
                  error instanceof Error ? error.message : String(error),
              },
              false,
            );

      emitError(conversionError);
      throw conversionError;
    }
  }

  return {
    convert,

    on(
      event: 'progress' | 'error',
      callback: ((progress: ProgressEvent) => void) &
        ((error: ConversionError) => void),
    ): void {
      if (event === 'progress') {
        listeners.progress.add(callback as (progress: ProgressEvent) => void);
      } else {
        listeners.error.add(callback as (error: ConversionError) => void);
      }
    },

    off(
      event: 'progress' | 'error',
      callback: ((progress: ProgressEvent) => void) &
        ((error: ConversionError) => void),
    ): void {
      if (event === 'progress') {
        listeners.progress.delete(
          callback as (progress: ProgressEvent) => void,
        );
      } else {
        listeners.error.delete(callback as (error: ConversionError) => void);
      }
    },
  };
}

/**
 * Create a descriptive error message with guidance
 */
export function createErrorMessage(
  code: ErrorCode,
  filename?: string,
  details?: Record<string, unknown>,
): string {
  const fileRef = filename ? `'${filename}'` : 'The file';

  switch (code) {
    case ErrorCode.INVALID_FORMAT:
      return `${fileRef} is not a recognized Anki format. Supported formats: .apkg, .tsv, .db, .sqlite, .anki2, .colpkg`;

    case ErrorCode.CORRUPTED_FILE:
      return `${fileRef} appears to be corrupted. Try exporting the deck again from Anki.`;

    case ErrorCode.UNSUPPORTED_VERSION:
      const version = details?.version || 'unknown';
      return `${fileRef} uses Anki schema version ${version}, which is not yet supported. Please report this issue.`;

    case ErrorCode.PARSE_ERROR:
      const parseDetails = details?.originalError || 'Unknown parsing error';
      return `Failed to parse ${fileRef}: ${parseDetails}`;

    case ErrorCode.EXTRACTION_ERROR:
      return `Failed to extract data from ${fileRef}. The file may be corrupted.`;

    case ErrorCode.OUT_OF_MEMORY:
      return `${fileRef} is too large to process in the browser. Try using the CLI tool instead.`;

    case ErrorCode.FILE_TOO_LARGE:
      const maxSize = details?.maxSize || '500MB';
      return `${fileRef} exceeds the maximum file size of ${maxSize}.`;

    case ErrorCode.UNKNOWN_ERROR:
    default:
      return `An unexpected error occurred while processing ${fileRef}. Please try again.`;
  }
}

/**
 * Get recovery guidance for an error
 */
export function getErrorRecoveryGuidance(code: ErrorCode): string {
  switch (code) {
    case ErrorCode.INVALID_FORMAT:
      return 'Ensure you are uploading a valid Anki export file (.apkg, .colpkg) or a TSV file exported from Anki.';

    case ErrorCode.CORRUPTED_FILE:
      return 'Try exporting the deck again from Anki. If the problem persists, the deck may be damaged.';

    case ErrorCode.UNSUPPORTED_VERSION:
      return 'Try exporting the deck using a different Anki version, or report this issue for support.';

    case ErrorCode.PARSE_ERROR:
      return 'Verify the file is a valid Anki export. If using TSV, ensure it is properly tab-separated.';

    case ErrorCode.EXTRACTION_ERROR:
      return 'The file structure may be damaged. Try exporting the deck again from Anki.';

    case ErrorCode.OUT_OF_MEMORY:
      return 'Use the command-line tool for large files: npm run anki:convert -- --input file.apkg --output output.json';

    case ErrorCode.FILE_TOO_LARGE:
      return 'Split the deck into smaller parts in Anki, or use the CLI tool which supports larger files.';

    case ErrorCode.UNKNOWN_ERROR:
    default:
      return 'Try refreshing the page and uploading the file again. If the problem persists, please report this issue.';
  }
}

/**
 * Check if an error is recoverable
 */
export function isRecoverableError(error: ConversionError): boolean {
  return error.recoverable;
}

/**
 * Validate file size before processing
 */
export function validateFileSize(
  size: number,
  maxSize: number = 500 * 1024 * 1024, // 500MB default
): void {
  if (size > maxSize) {
    throw new ConversionError(
      ErrorCode.FILE_TOO_LARGE,
      `File size (${formatFileSize(size)}) exceeds maximum allowed size (${formatFileSize(maxSize)})`,
      { size, maxSize },
      false,
    );
  }
}

/**
 * Format file size for display
 */
function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024)
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
}
