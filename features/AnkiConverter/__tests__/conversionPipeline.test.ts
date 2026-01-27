/**
 * Conversion Pipeline Tests
 *
 * Property-based tests for the conversion pipeline orchestrator.
 *
 * @module features/AnkiConverter/__tests__/conversionPipeline.test.ts
 */

import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import {
  createConversionPipeline,
  createErrorMessage,
  getErrorRecoveryGuidance,
  validateFileSize,
} from '../lib/conversionPipeline';
import { ConversionError, ErrorCode } from '../types';
import type { ProgressEvent } from '../types';

/**
 * Create TSV content for testing
 */
function createTsvContent(rows: string[][]): ArrayBuffer {
  const text = rows.map(row => row.join('\t')).join('\n');
  return new TextEncoder().encode(text).buffer;
}

describe('Conversion Pipeline', () => {
  describe('createConversionPipeline', () => {
    it('should create a pipeline with convert, on, and off methods', () => {
      const pipeline = createConversionPipeline();
      expect(typeof pipeline.convert).toBe('function');
      expect(typeof pipeline.on).toBe('function');
      expect(typeof pipeline.off).toBe('function');
    });
  });

  describe('Event handling', () => {
    it('should register and call progress listeners', async () => {
      const pipeline = createConversionPipeline();
      const progressEvents: ProgressEvent[] = [];

      pipeline.on('progress', event => {
        progressEvents.push(event);
      });

      // Create valid TSV content - use ArrayBuffer directly
      const content = createTsvContent([
        ['front', 'back'],
        ['hello', 'world'],
      ]);

      await pipeline.convert(content, { format: 'tsv' });

      expect(progressEvents.length).toBeGreaterThan(0);
    });

    it('should unregister listeners with off', async () => {
      const pipeline = createConversionPipeline();
      const progressEvents: ProgressEvent[] = [];

      const listener = (event: ProgressEvent) => {
        progressEvents.push(event);
      };

      pipeline.on('progress', listener);
      pipeline.off('progress', listener);

      const content = createTsvContent([
        ['front', 'back'],
        ['hello', 'world'],
      ]);

      await pipeline.convert(content, { format: 'tsv' });

      expect(progressEvents.length).toBe(0);
    });

    it('should call error listeners on conversion failure', async () => {
      const pipeline = createConversionPipeline();
      const errors: ConversionError[] = [];

      pipeline.on('error', error => {
        errors.push(error);
      });

      // Create invalid content with forced invalid format detection
      const content = new ArrayBuffer(10);

      await expect(pipeline.convert(content, {})).rejects.toThrow(
        ConversionError,
      );
      expect(errors.length).toBe(1);
    });
  });

  describe('Format detection and parsing', () => {
    it('should successfully convert valid TSV files', async () => {
      const pipeline = createConversionPipeline();
      const content = createTsvContent([
        ['front', 'back'],
        ['hello', 'world'],
        ['foo', 'bar'],
      ]);

      const result = await pipeline.convert(content, { format: 'tsv' });

      expect(result.decks).toBeDefined();
      expect(result.metadata).toBeDefined();
      expect(result.metadata.totalCards).toBeGreaterThan(0);
    });

    it('should reject unsupported file formats', async () => {
      const pipeline = createConversionPipeline();
      // Random binary content that doesn't match any format
      const content = new Uint8Array([0xff, 0xfe, 0x00, 0x01, 0x02, 0x03])
        .buffer;

      await expect(pipeline.convert(content, {})).rejects.toThrow(
        ConversionError,
      );
    });

    it('should use forced format when specified', async () => {
      const pipeline = createConversionPipeline();
      const content = createTsvContent([
        ['front', 'back'],
        ['hello', 'world'],
      ]);

      const result = await pipeline.convert(content, { format: 'tsv' });

      expect(result.decks).toBeDefined();
    });
  });

  /**
   * Property-based tests
   *
   * **Feature: anki-converter, Property 13: Progress event monotonicity**
   * **Validates: Requirements 7.2**
   */
  describe('Property 13: Progress event monotonicity', () => {
    it('progress events should never decrease (monotonically increasing from 0 to 100)', async () => {
      await fc.assert(
        fc.asyncProperty(
          // Generate random TSV data with 1-20 rows and 2-4 columns
          // Filter out whitespace-only strings to ensure valid content
          fc.array(
            fc.array(
              fc
                .string({ minLength: 1, maxLength: 50 })
                .filter(
                  s =>
                    !s.includes('\t') &&
                    !s.includes('\n') &&
                    !s.includes('\r') &&
                    s.trim().length > 0,
                ),
              { minLength: 2, maxLength: 4 },
            ),
            { minLength: 1, maxLength: 20 },
          ),
          async rows => {
            const pipeline = createConversionPipeline();
            const progressValues: number[] = [];

            pipeline.on('progress', event => {
              progressValues.push(event.progress);
            });

            const content = createTsvContent(rows);

            try {
              await pipeline.convert(content, { format: 'tsv' });
            } catch {
              // Ignore conversion errors for this test
              // We're only testing progress monotonicity
            }

            // Check monotonicity: each value should be >= previous
            for (let i = 1; i < progressValues.length; i++) {
              if (progressValues[i] < progressValues[i - 1]) {
                return false;
              }
            }

            // Progress should be within valid range
            for (const progress of progressValues) {
              if (progress < 0 || progress > 100) {
                return false;
              }
            }

            return true;
          },
        ),
        { numRuns: 100 },
      );
    });

    it('progress should start at or near 0 and end at or near 100 for successful conversions', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.array(
            fc.array(
              fc
                .string({ minLength: 1, maxLength: 30 })
                .filter(
                  s =>
                    !s.includes('\t') &&
                    !s.includes('\n') &&
                    !s.includes('\r') &&
                    s.trim().length > 0,
                ),
              { minLength: 2, maxLength: 3 },
            ),
            { minLength: 2, maxLength: 10 },
          ),
          async rows => {
            const pipeline = createConversionPipeline();
            const progressValues: number[] = [];

            pipeline.on('progress', event => {
              progressValues.push(event.progress);
            });

            const content = createTsvContent(rows);

            await pipeline.convert(content, { format: 'tsv' });

            if (progressValues.length === 0) {
              return false;
            }

            // First progress should be low (within first stage)
            const firstProgress = progressValues[0];
            if (firstProgress > 20) {
              return false;
            }

            // Last progress should be 100
            const lastProgress = progressValues[progressValues.length - 1];
            if (lastProgress !== 100) {
              return false;
            }

            return true;
          },
        ),
        { numRuns: 100 },
      );
    });

    it('progress events should include valid stage names', async () => {
      const validStages = [
        'detecting',
        'parsing',
        'extracting',
        'transforming',
        'building',
      ];

      await fc.assert(
        fc.asyncProperty(
          fc.array(
            fc.array(
              fc
                .string({ minLength: 1, maxLength: 20 })
                .filter(
                  s =>
                    !s.includes('\t') &&
                    !s.includes('\n') &&
                    !s.includes('\r') &&
                    s.trim().length > 0,
                ),
              { minLength: 2, maxLength: 3 },
            ),
            { minLength: 2, maxLength: 5 },
          ),
          async rows => {
            const pipeline = createConversionPipeline();
            const stages: string[] = [];

            pipeline.on('progress', event => {
              stages.push(event.stage);
            });

            const content = createTsvContent(rows);

            await pipeline.convert(content, { format: 'tsv' });

            // All stages should be valid
            for (const stage of stages) {
              if (!validStages.includes(stage)) {
                return false;
              }
            }

            return true;
          },
        ),
        { numRuns: 100 },
      );
    });
  });

  /**
   * Property-based tests
   *
   * **Feature: anki-converter, Property 12: Error message descriptiveness**
   * **Validates: Requirements 8.1, 8.2, 8.3, 8.4, 8.5**
   */
  describe('Property 12: Error message descriptiveness', () => {
    it('error messages should include error type, filename, and guidance', () => {
      const errorCodes = Object.values(ErrorCode);

      fc.assert(
        fc.property(
          fc.constantFrom(...errorCodes),
          fc
            .string({ minLength: 1, maxLength: 50 })
            .filter(s => s.trim().length > 0 && !s.includes("'")),
          (code, filename) => {
            const message = createErrorMessage(code, filename);
            const guidance = getErrorRecoveryGuidance(code);

            // Message should not be empty
            if (!message || message.length === 0) {
              return false;
            }

            // Message should reference the file
            if (!message.includes(filename) && !message.includes('The file')) {
              return false;
            }

            // Guidance should not be empty
            if (!guidance || guidance.length === 0) {
              return false;
            }

            // Guidance should be actionable (contain action words)
            const actionWords = [
              'try',
              'ensure',
              'verify',
              'use',
              'check',
              'split',
              'report',
              'refresh',
            ];
            const hasActionWord = actionWords.some(word =>
              guidance.toLowerCase().includes(word),
            );
            if (!hasActionWord) {
              return false;
            }

            return true;
          },
        ),
        { numRuns: 100 },
      );
    });

    it('ConversionError should contain code, message, and details', () => {
      const errorCodes = Object.values(ErrorCode);

      fc.assert(
        fc.property(
          fc.constantFrom(...errorCodes),
          fc.string({ minLength: 1, maxLength: 100 }),
          fc.boolean(),
          (code, message, recoverable) => {
            const error = new ConversionError(
              code,
              message,
              { testDetail: 'value' },
              recoverable,
            );

            // Error should have correct properties
            if (error.code !== code) return false;
            if (error.message !== message) return false;
            if (error.recoverable !== recoverable) return false;
            if (!error.details || error.details.testDetail !== 'value')
              return false;
            if (error.name !== 'ConversionError') return false;

            return true;
          },
        ),
        { numRuns: 100 },
      );
    });

    it('invalid format errors should list supported formats', async () => {
      // Test with specific unsupported extensions
      const unsupportedExtensions = ['pdf', 'doc', 'jpg', 'png', 'mp3', 'zip'];

      await fc.assert(
        fc.asyncProperty(
          fc.constantFrom(...unsupportedExtensions),
          async ext => {
            const pipeline = createConversionPipeline();
            // Random binary content that doesn't match any format
            const content = new Uint8Array([0xff, 0xfe, 0x00, 0x01, 0x02, 0x03])
              .buffer;

            try {
              await pipeline.convert(content, {});
              return false; // Should have thrown
            } catch (error) {
              if (!(error instanceof ConversionError)) {
                return false;
              }

              // Error should mention supported formats
              const message = error.message.toLowerCase();
              const mentionsFormats =
                message.includes('apkg') ||
                message.includes('supported') ||
                message.includes('format');

              return mentionsFormats;
            }
          },
        ),
        { numRuns: 50 },
      );
    });
  });

  describe('validateFileSize', () => {
    it('should not throw for files under the limit', () => {
      expect(() => validateFileSize(100)).not.toThrow();
      expect(() => validateFileSize(500 * 1024 * 1024 - 1)).not.toThrow();
    });

    it('should throw for files over the limit', () => {
      expect(() => validateFileSize(500 * 1024 * 1024 + 1)).toThrow(
        ConversionError,
      );
      expect(() => validateFileSize(1024 * 1024 * 1024)).toThrow(
        ConversionError,
      );
    });

    it('should respect custom max size', () => {
      expect(() => validateFileSize(100, 50)).toThrow(ConversionError);
      expect(() => validateFileSize(100, 200)).not.toThrow();
    });
  });
});
