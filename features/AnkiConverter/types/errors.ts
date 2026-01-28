/**
 * Error Types for Anki Converter
 *
 * Custom error types for conversion failures.
 */

/**
 * Error codes for conversion failures
 */
export enum ErrorCode {
  INVALID_FORMAT = 'INVALID_FORMAT',
  CORRUPTED_FILE = 'CORRUPTED_FILE',
  UNSUPPORTED_VERSION = 'UNSUPPORTED_VERSION',
  PARSE_ERROR = 'PARSE_ERROR',
  EXTRACTION_ERROR = 'EXTRACTION_ERROR',
  OUT_OF_MEMORY = 'OUT_OF_MEMORY',
  FILE_TOO_LARGE = 'FILE_TOO_LARGE',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
}

/**
 * Custom error class for conversion failures
 */
export class ConversionError extends Error {
  public readonly code: ErrorCode;
  public readonly details?: Record<string, unknown>;
  public readonly recoverable: boolean;

  constructor(
    code: ErrorCode,
    message: string,
    details?: Record<string, unknown>,
    recoverable: boolean = false,
  ) {
    super(message);
    this.name = 'ConversionError';
    this.code = code;
    this.details = details;
    this.recoverable = recoverable;
  }
}

/**
 * Error recovery strategy
 */
export interface ErrorRecovery {
  retry?: () => Promise<void>;
  fallback?: () => Promise<unknown>;
  guidance: string;
}
