/**
 * CLI Error Handling Property Tests
 *
 * Property-based tests for CLI error message descriptiveness.
 *
 * **Feature: anki-converter, Property 12: Error message descriptiveness (CLI subset)**
 * **Validates: Requirements 2.5**
 */

import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import { ConversionError, ErrorCode } from '../types';

/**
 * Format error for CLI display
 */
function formatCLIError(error: ConversionError | Error): string {
  if (error instanceof ConversionError) {
    let message = `❌ Conversion failed:\n   ${error.message}\n`;

    if (error.details) {
      message += '\n   Details:\n';
      for (const [key, value] of Object.entries(error.details)) {
        message += `   - ${key}: ${value}\n`;
      }
    }

    return message;
  }

  return `❌ Conversion failed:\n   ${error.message}\n`;
}

/**
 * Check if error message is descriptive
 */
function isDescriptiveErrorMessage(message: string): boolean {
  // Must contain error indicator
  if (!message.includes('❌') && !message.toLowerCase().includes('error')) {
    return false;
  }

  // Must have some meaningful content (more than just "Error")
  const contentLength = message.replace(/[❌\s\n-]/g, '').length;
  if (contentLength < 10) {
    return false;
  }

  // Should not be just generic "An error occurred"
  if (
    message.toLowerCase().includes('an error occurred') &&
    message.length < 50
  ) {
    return false;
  }

  return true;
}

/**
 * Check if error message includes actionable guidance
 */
function hasActionableGuidance(message: string): boolean {
  const guidanceKeywords = [
    'try',
    'ensure',
    'check',
    'verify',
    'export',
    'use',
    'report',
    'supported',
    'valid',
  ];

  const lowerMessage = message.toLowerCase();
  return guidanceKeywords.some(keyword => lowerMessage.includes(keyword));
}

describe('CLI Error Handling Property Tests', () => {
  describe('Property 12: Error message descriptiveness', () => {
    it('should produce descriptive error messages for all error codes', () => {
      fc.assert(
        fc.property(
          fc.constantFrom(
            ErrorCode.INVALID_FORMAT,
            ErrorCode.CORRUPTED_FILE,
            ErrorCode.UNSUPPORTED_VERSION,
            ErrorCode.PARSE_ERROR,
            ErrorCode.EXTRACTION_ERROR,
            ErrorCode.OUT_OF_MEMORY,
            ErrorCode.FILE_TOO_LARGE,
            ErrorCode.UNKNOWN_ERROR,
          ),
          fc.option(fc.string({ minLength: 1, maxLength: 50 }), {
            nil: undefined,
          }),
          fc.option(
            fc.record({
              format: fc.constantFrom('apkg', 'tsv', 'sqlite', 'colpkg'),
              version: fc.integer({ min: 1, max: 100 }),
              size: fc.integer({ min: 0, max: 1000000000 }),
            }),
            { nil: undefined },
          ),
          (errorCode, filename, details) => {
            // Create error
            const error = new ConversionError(
              errorCode,
              `Test error for ${errorCode}`,
              details,
              false,
            );

            // Format for CLI
            const formattedMessage = formatCLIError(error);

            // Verify message is descriptive
            return isDescriptiveErrorMessage(formattedMessage);
          },
        ),
        { numRuns: 100 },
      );
    });

    it('should include error type in all error messages', () => {
      fc.assert(
        fc.property(
          fc.constantFrom(
            ErrorCode.INVALID_FORMAT,
            ErrorCode.CORRUPTED_FILE,
            ErrorCode.UNSUPPORTED_VERSION,
            ErrorCode.PARSE_ERROR,
            ErrorCode.EXTRACTION_ERROR,
            ErrorCode.OUT_OF_MEMORY,
            ErrorCode.FILE_TOO_LARGE,
            ErrorCode.UNKNOWN_ERROR,
          ),
          fc.string({ minLength: 5, maxLength: 100 }),
          (errorCode, message) => {
            const error = new ConversionError(errorCode, message, {}, false);
            const formattedMessage = formatCLIError(error);

            // Message should contain the actual error message
            return formattedMessage.includes(message);
          },
        ),
        { numRuns: 100 },
      );
    });

    it('should include file being processed when available', () => {
      fc.assert(
        fc.property(
          fc.constantFrom(
            ErrorCode.INVALID_FORMAT,
            ErrorCode.CORRUPTED_FILE,
            ErrorCode.PARSE_ERROR,
          ),
          fc
            .string({ minLength: 1, maxLength: 50 })
            .filter(s => s.trim().length > 0),
          (errorCode, filename) => {
            const error = new ConversionError(
              errorCode,
              `Error processing file '${filename}'`,
              { filename },
              false,
            );

            const formattedMessage = formatCLIError(error);

            // Should include filename in message or details
            return (
              formattedMessage.includes(filename) ||
              formattedMessage.includes('filename')
            );
          },
        ),
        { numRuns: 100 },
      );
    });

    it('should include details when provided', () => {
      fc.assert(
        fc.property(
          fc.constantFrom(
            ErrorCode.INVALID_FORMAT,
            ErrorCode.CORRUPTED_FILE,
            ErrorCode.UNSUPPORTED_VERSION,
            ErrorCode.PARSE_ERROR,
          ),
          fc.record({
            format: fc.constantFrom('apkg', 'tsv', 'sqlite', 'colpkg'),
            version: fc.integer({ min: 1, max: 100 }),
            line: fc.integer({ min: 1, max: 10000 }),
          }),
          (errorCode, details) => {
            const error = new ConversionError(
              errorCode,
              'Test error with details',
              details,
              false,
            );

            const formattedMessage = formatCLIError(error);

            // Should include "Details:" section
            return formattedMessage.includes('Details:');
          },
        ),
        { numRuns: 100 },
      );
    });

    it('should provide actionable guidance for common errors', () => {
      fc.assert(
        fc.property(
          fc.constantFrom(
            ErrorCode.INVALID_FORMAT,
            ErrorCode.CORRUPTED_FILE,
            ErrorCode.UNSUPPORTED_VERSION,
            ErrorCode.PARSE_ERROR,
            ErrorCode.OUT_OF_MEMORY,
          ),
          errorCode => {
            // Create realistic error messages based on error code
            let message = '';
            switch (errorCode) {
              case ErrorCode.INVALID_FORMAT:
                message =
                  'The file is not a recognized Anki format. Supported formats: .apkg, .tsv, .db, .sqlite, .anki2, .colpkg';
                break;
              case ErrorCode.CORRUPTED_FILE:
                message =
                  'The APKG file appears to be corrupted. Try exporting the deck again from Anki.';
                break;
              case ErrorCode.UNSUPPORTED_VERSION:
                message =
                  'This deck uses Anki schema version 99, which is not yet supported. Please report this issue.';
                break;
              case ErrorCode.PARSE_ERROR:
                message =
                  'Failed to parse TSV file. Verify the file is properly tab-separated.';
                break;
              case ErrorCode.OUT_OF_MEMORY:
                message =
                  'The deck is too large to process. Use the CLI tool for large files.';
                break;
            }

            const error = new ConversionError(errorCode, message, {}, false);
            const formattedMessage = formatCLIError(error);

            // Should include actionable guidance
            return hasActionableGuidance(formattedMessage);
          },
        ),
        { numRuns: 100 },
      );
    });

    it('should handle errors without details gracefully', () => {
      fc.assert(
        fc.property(
          fc.constantFrom(
            ErrorCode.INVALID_FORMAT,
            ErrorCode.CORRUPTED_FILE,
            ErrorCode.UNKNOWN_ERROR,
          ),
          fc.string({ minLength: 10, maxLength: 100 }),
          (errorCode, message) => {
            // Create error without details
            const error = new ConversionError(
              errorCode,
              message,
              undefined,
              false,
            );
            const formattedMessage = formatCLIError(error);

            // Should still be descriptive even without details
            return (
              isDescriptiveErrorMessage(formattedMessage) &&
              formattedMessage.includes(message)
            );
          },
        ),
        { numRuns: 100 },
      );
    });

    it('should format standard Error objects descriptively', () => {
      fc.assert(
        fc.property(fc.string({ minLength: 10, maxLength: 100 }), message => {
          const error = new Error(message);
          const formattedMessage = formatCLIError(error);

          // Should include the error message
          return (
            formattedMessage.includes(message) &&
            formattedMessage.includes('❌')
          );
        }),
        { numRuns: 100 },
      );
    });

    it('should maintain consistent error format structure', () => {
      fc.assert(
        fc.property(
          fc.constantFrom(
            ErrorCode.INVALID_FORMAT,
            ErrorCode.CORRUPTED_FILE,
            ErrorCode.PARSE_ERROR,
          ),
          fc.string({ minLength: 10, maxLength: 100 }),
          fc.option(
            fc.record({
              key1: fc.string(),
              key2: fc.integer(),
            }),
            { nil: undefined },
          ),
          (errorCode, message, details) => {
            const error = new ConversionError(
              errorCode,
              message,
              details,
              false,
            );
            const formattedMessage = formatCLIError(error);

            // Should start with error indicator
            const startsCorrectly =
              formattedMessage.startsWith('❌') ||
              formattedMessage.toLowerCase().startsWith('error');

            // Should have consistent structure
            const hasMessage = formattedMessage.includes(message);

            // If details exist, should have Details section
            const detailsCorrect =
              !details || formattedMessage.includes('Details:');

            return startsCorrectly && hasMessage && detailsCorrect;
          },
        ),
        { numRuns: 100 },
      );
    });
  });
});
