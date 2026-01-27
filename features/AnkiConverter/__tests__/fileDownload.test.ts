/**
 * File Download Utility Tests
 *
 * Tests for the file download mechanism.
 *
 * @module features/AnkiConverter/__tests__/fileDownload.test.ts
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  generateDownloadFilename,
  resultToJsonString,
  createJsonBlob,
  triggerBlobDownload,
  downloadConversionResult,
  isDownloadSupported,
} from '../lib/fileDownload';
import type { ConversionResult } from '../types';

/**
 * Create a mock conversion result for testing
 */
function createMockResult(
  overrides: Partial<ConversionResult> = {},
): ConversionResult {
  return {
    decks: [
      {
        name: 'Test Deck',
        description: 'A test deck',
        cards: [
          {
            id: '1',
            type: 'basic',
            fields: { Front: 'Hello', Back: 'World' },
            tags: ['test'],
          },
        ],
      },
    ],
    metadata: {
      convertedAt: '2025-01-26T10:00:00Z',
      sourceFormat: 'apkg',
      totalDecks: 1,
      totalCards: 1,
      noteTypes: ['Basic'],
      processingTime: 100,
    },
    ...overrides,
  };
}

describe('File Download Utility', () => {
  describe('generateDownloadFilename', () => {
    it('should use custom filename when provided', () => {
      const result = createMockResult();
      const filename = generateDownloadFilename(result, {
        customFilename: 'my-custom-name',
      });
      expect(filename).toBe('my-custom-name.json');
    });

    it('should use single deck name when only one deck', () => {
      const result = createMockResult({
        decks: [
          {
            name: 'Japanese Vocabulary',
            description: '',
            cards: [],
          },
        ],
      });
      const filename = generateDownloadFilename(result);
      expect(filename).toBe('Japanese Vocabulary.json');
    });

    it('should use source filename for multiple decks', () => {
      const result = createMockResult({
        decks: [
          { name: 'Deck 1', description: '', cards: [] },
          { name: 'Deck 2', description: '', cards: [] },
        ],
      });
      const filename = generateDownloadFilename(result, {
        sourceFilename: 'my-collection.apkg',
      });
      expect(filename).toBe('my-collection.json');
    });

    it('should generate timestamp-based filename as fallback', () => {
      const result = createMockResult({
        decks: [
          { name: '', description: '', cards: [] },
          { name: '', description: '', cards: [] },
        ],
      });
      const filename = generateDownloadFilename(result);
      expect(filename).toMatch(
        /^anki_collection_\d{4}-\d{2}-\d{2}T\d{2}-\d{2}-\d{2}_2decks\.json$/,
      );
    });

    it('should sanitize deck names with special characters', () => {
      const result = createMockResult({
        decks: [
          {
            name: 'Japanese::Vocabulary/N5',
            description: '',
            cards: [],
          },
        ],
      });
      const filename = generateDownloadFilename(result);
      expect(filename).toBe('Japanese - Vocabulary_N5.json');
    });
  });

  describe('resultToJsonString', () => {
    it('should produce valid JSON', () => {
      const result = createMockResult();
      const jsonString = resultToJsonString(result);
      expect(() => JSON.parse(jsonString)).not.toThrow();
    });

    it('should pretty print by default', () => {
      const result = createMockResult();
      const jsonString = resultToJsonString(result);
      expect(jsonString).toContain('\n');
      expect(jsonString).toContain('  '); // 2-space indent
    });

    it('should not pretty print when disabled', () => {
      const result = createMockResult();
      const jsonString = resultToJsonString(result, { prettyPrint: false });
      expect(jsonString).not.toContain('\n');
    });

    it('should use custom indent spaces', () => {
      const result = createMockResult();
      const jsonString = resultToJsonString(result, { indentSpaces: 4 });
      expect(jsonString).toContain('    '); // 4-space indent
    });

    it('should preserve all data in round-trip', () => {
      const result = createMockResult();
      const jsonString = resultToJsonString(result);
      const parsed = JSON.parse(jsonString);
      expect(parsed).toEqual(result);
    });
  });

  describe('createJsonBlob', () => {
    it('should create a Blob with correct MIME type', () => {
      const jsonString = '{"test": true}';
      const blob = createJsonBlob(jsonString);
      expect(blob).toBeInstanceOf(Blob);
      expect(blob.type).toBe('application/json');
    });

    it('should have correct size', () => {
      const jsonString = '{"test": true}';
      const blob = createJsonBlob(jsonString);
      expect(blob.size).toBe(jsonString.length);
    });
  });

  describe('triggerBlobDownload', () => {
    let mockCreateObjectURL: ReturnType<typeof vi.fn>;
    let mockRevokeObjectURL: ReturnType<typeof vi.fn>;
    let mockClick: ReturnType<typeof vi.fn>;
    let mockAnchor: HTMLAnchorElement;

    beforeEach(() => {
      // Mock URL methods
      mockCreateObjectURL = vi.fn().mockReturnValue('blob:test-url');
      mockRevokeObjectURL = vi.fn();
      global.URL.createObjectURL = mockCreateObjectURL;
      global.URL.revokeObjectURL = mockRevokeObjectURL;

      // Mock document methods
      mockClick = vi.fn();
      mockAnchor = {
        href: '',
        download: '',
        click: mockClick,
      } as unknown as HTMLAnchorElement;

      vi.spyOn(document, 'createElement').mockReturnValue(mockAnchor);
      vi.spyOn(document.body, 'appendChild').mockImplementation(
        () => mockAnchor,
      );
      vi.spyOn(document.body, 'removeChild').mockImplementation(
        () => mockAnchor,
      );
    });

    afterEach(() => {
      vi.restoreAllMocks();
    });

    it('should create object URL from blob', () => {
      const blob = new Blob(['test'], { type: 'application/json' });
      triggerBlobDownload(blob, 'test.json');
      expect(mockCreateObjectURL).toHaveBeenCalledWith(blob);
    });

    it('should set anchor href and download attributes', () => {
      const blob = new Blob(['test'], { type: 'application/json' });
      triggerBlobDownload(blob, 'test.json');
      expect(mockAnchor.href).toBe('blob:test-url');
      expect(mockAnchor.download).toBe('test.json');
    });

    it('should append anchor to body and click', () => {
      const blob = new Blob(['test'], { type: 'application/json' });
      const appendSpy = vi.spyOn(document.body, 'appendChild');
      triggerBlobDownload(blob, 'test.json');
      expect(appendSpy).toHaveBeenCalled();
      expect(mockClick).toHaveBeenCalled();
    });

    it('should clean up after download', () => {
      const blob = new Blob(['test'], { type: 'application/json' });
      const removeSpy = vi.spyOn(document.body, 'removeChild');
      triggerBlobDownload(blob, 'test.json');
      expect(removeSpy).toHaveBeenCalled();
      expect(mockRevokeObjectURL).toHaveBeenCalledWith('blob:test-url');
    });

    it('should return true on success', () => {
      const blob = new Blob(['test'], { type: 'application/json' });
      const result = triggerBlobDownload(blob, 'test.json');
      expect(result).toBe(true);
    });
  });

  describe('downloadConversionResult', () => {
    let mockCreateObjectURL: ReturnType<typeof vi.fn>;
    let mockRevokeObjectURL: ReturnType<typeof vi.fn>;

    beforeEach(() => {
      mockCreateObjectURL = vi.fn().mockReturnValue('blob:test-url');
      mockRevokeObjectURL = vi.fn();
      global.URL.createObjectURL = mockCreateObjectURL;
      global.URL.revokeObjectURL = mockRevokeObjectURL;

      const mockAnchor = {
        href: '',
        download: '',
        click: vi.fn(),
      } as unknown as HTMLAnchorElement;

      vi.spyOn(document, 'createElement').mockReturnValue(mockAnchor);
      vi.spyOn(document.body, 'appendChild').mockImplementation(
        () => mockAnchor,
      );
      vi.spyOn(document.body, 'removeChild').mockImplementation(
        () => mockAnchor,
      );
    });

    afterEach(() => {
      vi.restoreAllMocks();
    });

    it('should return success result with filename and size', () => {
      const result = createMockResult();
      const downloadResult = downloadConversionResult(result);

      expect(downloadResult.success).toBe(true);
      expect(downloadResult.filename).toBe('Test Deck.json');
      expect(downloadResult.fileSize).toBeGreaterThan(0);
      expect(downloadResult.error).toBeUndefined();
    });

    it('should use source filename when provided', () => {
      const result = createMockResult({
        decks: [
          { name: 'Deck 1', description: '', cards: [] },
          { name: 'Deck 2', description: '', cards: [] },
        ],
      });
      const downloadResult = downloadConversionResult(result, {
        sourceFilename: 'my-file.apkg',
      });

      expect(downloadResult.filename).toBe('my-file.json');
    });

    it('should use custom filename when provided', () => {
      const result = createMockResult();
      const downloadResult = downloadConversionResult(result, {
        customFilename: 'custom-name',
      });

      expect(downloadResult.filename).toBe('custom-name.json');
    });
  });

  describe('isDownloadSupported', () => {
    it('should return true in browser environment', () => {
      // In jsdom test environment, this should return true
      expect(isDownloadSupported()).toBe(true);
    });
  });
});
