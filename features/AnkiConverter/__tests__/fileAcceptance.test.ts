/**
 * File Acceptance Tests
 *
 * Unit tests for file acceptance in the Anki Converter.
 * Tests that supported extensions are accepted and unsupported ones are rejected.
 *
 * **Validates: Requirements 1.5, 8.1**
 */

import { describe, it, expect } from 'vitest';
import {
  detectFormatFromExtension,
  isSupportedFormat,
  getSupportedExtensions,
  getAcceptString,
} from '../lib/formatDetection';

describe('File Acceptance', () => {
  describe('Supported Extensions', () => {
    const supportedExtensions = [
      { ext: '.apkg', format: 'apkg', description: 'Anki Package' },
      { ext: '.colpkg', format: 'colpkg', description: 'Collection Package' },
      { ext: '.anki2', format: 'anki2', description: 'Anki Database v2' },
      { ext: '.anki21', format: 'anki2', description: 'Anki Database v21' },
      { ext: '.db', format: 'sqlite', description: 'SQLite Database' },
      { ext: '.sqlite', format: 'sqlite', description: 'SQLite Database' },
      { ext: '.sqlite3', format: 'sqlite', description: 'SQLite v3 Database' },
      { ext: '.tsv', format: 'tsv', description: 'Tab-Separated Values' },
      { ext: '.txt', format: 'tsv', description: 'Text file (TSV format)' },
    ];

    it.each(supportedExtensions)(
      'should accept $ext files ($description)',
      ({ ext, format }) => {
        const filename = `test-deck${ext}`;
        const detectedFormat = detectFormatFromExtension(filename);
        expect(detectedFormat).toBe(format);
        expect(isSupportedFormat(detectedFormat)).toBe(true);
      },
    );

    it('should accept uppercase extensions', () => {
      expect(detectFormatFromExtension('deck.APKG')).toBe('apkg');
      expect(detectFormatFromExtension('deck.COLPKG')).toBe('colpkg');
      expect(detectFormatFromExtension('deck.TSV')).toBe('tsv');
    });

    it('should accept mixed case extensions', () => {
      expect(detectFormatFromExtension('deck.Apkg')).toBe('apkg');
      expect(detectFormatFromExtension('deck.AnKi2')).toBe('anki2');
    });

    it('should handle filenames with multiple dots', () => {
      expect(detectFormatFromExtension('my.deck.backup.apkg')).toBe('apkg');
      expect(detectFormatFromExtension('japanese.vocab.n5.tsv')).toBe('tsv');
    });

    it('getSupportedExtensions should return all supported extensions', () => {
      const extensions = getSupportedExtensions();
      expect(extensions).toContain('.apkg');
      expect(extensions).toContain('.colpkg');
      expect(extensions).toContain('.anki2');
      expect(extensions).toContain('.anki21');
      expect(extensions).toContain('.db');
      expect(extensions).toContain('.sqlite');
      expect(extensions).toContain('.sqlite3');
      expect(extensions).toContain('.tsv');
      expect(extensions).toContain('.txt');
    });

    it('getAcceptString should return valid accept attribute value', () => {
      const accept = getAcceptString();
      // Should be comma-separated
      expect(accept).toContain(',');
      // Should contain all supported extensions
      expect(accept).toContain('.apkg');
      expect(accept).toContain('.colpkg');
      expect(accept).toContain('.tsv');
    });
  });

  describe('Unsupported Extensions', () => {
    const unsupportedExtensions = [
      { ext: '.pdf', description: 'PDF document' },
      { ext: '.zip', description: 'Generic ZIP archive' },
      { ext: '.rar', description: 'RAR archive' },
      { ext: '.doc', description: 'Word document' },
      { ext: '.docx', description: 'Word document (new)' },
      { ext: '.xls', description: 'Excel spreadsheet' },
      { ext: '.xlsx', description: 'Excel spreadsheet (new)' },
      { ext: '.csv', description: 'Comma-separated values' },
      { ext: '.json', description: 'JSON file' },
      { ext: '.xml', description: 'XML file' },
      { ext: '.html', description: 'HTML file' },
      { ext: '.mp3', description: 'Audio file' },
      { ext: '.jpg', description: 'Image file' },
      { ext: '.png', description: 'Image file' },
      { ext: '.exe', description: 'Executable' },
      { ext: '.apk', description: 'Android package (not Anki)' },
    ];

    it.each(unsupportedExtensions)(
      'should reject $ext files ($description)',
      ({ ext }) => {
        const filename = `test-file${ext}`;
        const detectedFormat = detectFormatFromExtension(filename);
        expect(detectedFormat).toBe('unknown');
        expect(isSupportedFormat(detectedFormat)).toBe(false);
      },
    );

    it('should reject files without extension', () => {
      expect(detectFormatFromExtension('noextension')).toBe('unknown');
      expect(isSupportedFormat('unknown')).toBe(false);
    });

    it('should reject files with empty extension', () => {
      expect(detectFormatFromExtension('file.')).toBe('unknown');
    });

    it('should reject files with only dots', () => {
      expect(detectFormatFromExtension('...')).toBe('unknown');
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty filename', () => {
      expect(detectFormatFromExtension('')).toBe('unknown');
    });

    it('should handle filename with spaces', () => {
      expect(detectFormatFromExtension('my deck.apkg')).toBe('apkg');
      expect(detectFormatFromExtension('japanese vocab.tsv')).toBe('tsv');
    });

    it('should handle filename with special characters', () => {
      expect(detectFormatFromExtension('日本語デッキ.apkg')).toBe('apkg');
      expect(detectFormatFromExtension('deck-v2.0.apkg')).toBe('apkg');
      expect(detectFormatFromExtension('deck_backup.colpkg')).toBe('colpkg');
    });

    it('should handle very long filenames', () => {
      const longName = 'a'.repeat(200) + '.apkg';
      expect(detectFormatFromExtension(longName)).toBe('apkg');
    });

    it('should handle path-like filenames', () => {
      // The function should only look at the extension
      expect(detectFormatFromExtension('/path/to/deck.apkg')).toBe('apkg');
      expect(detectFormatFromExtension('C:\\Users\\deck.apkg')).toBe('apkg');
    });
  });
});
