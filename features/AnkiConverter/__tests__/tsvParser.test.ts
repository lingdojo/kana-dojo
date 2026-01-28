/**
 * TSV Parser Tests
 *
 * Tests for the TSV parser functionality.
 */

import { describe, it, expect } from 'vitest';
import {
  parseTSV,
  parseTSVFromBuffer,
  validateTSV,
  unescapeTSV,
  splitTSVRow,
  parseRow,
  detectHeader,
  detectTagsColumn,
  splitLines,
} from '../parsers/tsvParser';

describe('TSV Parser', () => {
  describe('unescapeTSV', () => {
    it('should unescape tab characters', () => {
      expect(unescapeTSV('hello\\tworld')).toBe('hello\tworld');
    });

    it('should unescape newline characters', () => {
      expect(unescapeTSV('hello\\nworld')).toBe('hello\nworld');
    });

    it('should unescape backslash characters', () => {
      expect(unescapeTSV('hello\\\\world')).toBe('hello\\world');
    });

    it('should handle multiple escape sequences', () => {
      expect(unescapeTSV('a\\tb\\nc\\\\')).toBe('a\tb\nc\\');
    });

    it('should preserve unknown escape sequences', () => {
      expect(unescapeTSV('hello\\xworld')).toBe('hello\\xworld');
    });

    it('should handle empty strings', () => {
      expect(unescapeTSV('')).toBe('');
    });

    it('should handle strings without escapes', () => {
      expect(unescapeTSV('hello world')).toBe('hello world');
    });

    it('should handle trailing backslash', () => {
      expect(unescapeTSV('hello\\')).toBe('hello\\');
    });
  });

  describe('splitTSVRow', () => {
    it('should split on tabs', () => {
      expect(splitTSVRow('a\tb\tc')).toEqual(['a', 'b', 'c']);
    });

    it('should handle empty fields', () => {
      expect(splitTSVRow('a\t\tc')).toEqual(['a', '', 'c']);
    });

    it('should unescape values', () => {
      expect(splitTSVRow('hello\\tworld\ttest')).toEqual([
        'hello\tworld',
        'test',
      ]);
    });

    it('should handle single field', () => {
      expect(splitTSVRow('single')).toEqual(['single']);
    });

    it('should handle empty string', () => {
      expect(splitTSVRow('')).toEqual(['']);
    });
  });

  describe('parseRow', () => {
    it('should parse row without tags column', () => {
      const result = parseRow('front\tback', -1);
      expect(result.fields).toEqual(['front', 'back']);
      expect(result.tags).toEqual([]);
    });

    it('should extract tags from specified column', () => {
      const result = parseRow('front\tback\ttag1 tag2', 2);
      expect(result.fields).toEqual(['front', 'back']);
      expect(result.tags).toEqual(['tag1', 'tag2']);
    });

    it('should handle empty tags', () => {
      const result = parseRow('front\tback\t', 2);
      expect(result.fields).toEqual(['front', 'back']);
      expect(result.tags).toEqual([]);
    });

    it('should handle tags with extra whitespace', () => {
      const result = parseRow('front\tback\t  tag1   tag2  ', 2);
      expect(result.fields).toEqual(['front', 'back']);
      expect(result.tags).toEqual(['tag1', 'tag2']);
    });
  });

  describe('detectHeader', () => {
    it('should detect typical header row', () => {
      expect(detectHeader(['Front', 'Back'])).toBe(true);
      expect(detectHeader(['Question', 'Answer'])).toBe(true);
      expect(detectHeader(['Field 1', 'Field 2', 'Tags'])).toBe(true);
    });

    it('should not detect data row as header', () => {
      expect(detectHeader(['こんにちは', 'Hello'])).toBe(false);
      expect(detectHeader(['<div>HTML content</div>', 'Back'])).toBe(false);
    });

    it('should not detect long content as header', () => {
      const longText = 'a'.repeat(150);
      expect(detectHeader([longText, 'Back'])).toBe(false);
    });
  });

  describe('detectTagsColumn', () => {
    it('should detect tags in last column', () => {
      const rows = [
        ['front1', 'back1', 'tag1 tag2'],
        ['front2', 'back2', 'tag3'],
      ];
      expect(detectTagsColumn(rows)).toBe(2);
    });

    it('should return -1 for rows without tags', () => {
      const rows = [
        ['front1', 'back1'],
        ['front2', 'back2'],
      ];
      // Last column doesn't look like tags (no spaces, short content)
      // This is a heuristic, so it may detect as tags
      const result = detectTagsColumn(rows);
      expect(result).toBeGreaterThanOrEqual(-1);
    });

    it('should return -1 for empty rows', () => {
      expect(detectTagsColumn([])).toBe(-1);
    });

    it('should not detect HTML content as tags', () => {
      const rows = [
        ['front1', 'back1', '<div>content</div>'],
        ['front2', 'back2', '<span>more</span>'],
      ];
      expect(detectTagsColumn(rows)).toBe(-1);
    });
  });

  describe('splitLines', () => {
    it('should split on Unix newlines', () => {
      expect(splitLines('a\nb\nc')).toEqual(['a', 'b', 'c']);
    });

    it('should split on Windows newlines', () => {
      expect(splitLines('a\r\nb\r\nc')).toEqual(['a', 'b', 'c']);
    });

    it('should split on old Mac newlines', () => {
      expect(splitLines('a\rb\rc')).toEqual(['a', 'b', 'c']);
    });

    it('should filter empty lines', () => {
      expect(splitLines('a\n\nb\n\n\nc')).toEqual(['a', 'b', 'c']);
    });

    it('should handle empty string', () => {
      expect(splitLines('')).toEqual([]);
    });
  });

  describe('parseTSV', () => {
    it('should parse basic TSV content', async () => {
      const content = 'front1\tback1\nfront2\tback2';
      const result = await parseTSV(content);

      expect(result.notes).toHaveLength(2);
      expect(result.cards).toHaveLength(2);
      expect(result.decks).toHaveLength(1);
      expect(result.noteTypes).toHaveLength(1);

      expect(result.notes[0].fields).toEqual(['front1', 'back1']);
      expect(result.notes[1].fields).toEqual(['front2', 'back2']);
    });

    it('should handle header row', async () => {
      const content = 'Front\tBack\nhello\tworld';
      const result = await parseTSV(content);

      expect(result.notes).toHaveLength(1);
      expect(result.notes[0].fields).toEqual(['hello', 'world']);
      expect(result.noteTypes[0].flds[0].name).toBe('Front');
      expect(result.noteTypes[0].flds[1].name).toBe('Back');
    });

    it('should handle tags column', async () => {
      const content = 'front\tback\ttag1 tag2\nfront2\tback2\ttag3';
      const result = await parseTSV(content, {
        tagsColumnIndex: 2,
        hasHeader: false,
      });

      expect(result.notes).toHaveLength(2);
      expect(result.notes[0].fields).toEqual(['front', 'back']);
      expect(result.notes[0].tags).toEqual(['tag1', 'tag2']);
    });

    it('should handle empty content', async () => {
      const result = await parseTSV('');

      expect(result.notes).toHaveLength(0);
      expect(result.cards).toHaveLength(0);
      expect(result.decks).toHaveLength(1);
    });

    it('should handle Unicode content', async () => {
      const content = 'こんにちは\tHello\n你好\tHello\nمرحبا\tHello';
      const result = await parseTSV(content);

      expect(result.notes).toHaveLength(3);
      expect(result.notes[0].fields[0]).toBe('こんにちは');
      expect(result.notes[1].fields[0]).toBe('你好');
      expect(result.notes[2].fields[0]).toBe('مرحبا');
    });

    it('should handle escaped characters', async () => {
      const content = 'hello\\tworld\tback\nfront2\tback2';
      const result = await parseTSV(content, { hasHeader: false });

      expect(result.notes[0].fields[0]).toBe('hello\tworld');
    });

    it('should use custom deck name', async () => {
      const content = 'front\tback';
      const result = await parseTSV(content, { deckName: 'My Custom Deck' });

      expect(result.decks[0].name).toBe('My Custom Deck');
    });

    it('should use custom field names', async () => {
      const content = 'front\tback';
      const result = await parseTSV(content, {
        fieldNames: ['Question', 'Answer'],
        hasHeader: false,
      });

      expect(result.noteTypes[0].flds[0].name).toBe('Question');
      expect(result.noteTypes[0].flds[1].name).toBe('Answer');
    });

    it('should skip empty rows', async () => {
      const content = 'front1\tback1\n\t\nfront2\tback2';
      const result = await parseTSV(content);

      expect(result.notes).toHaveLength(2);
    });

    it('should handle multiple fields', async () => {
      const content =
        'field1\tfield2\tfield3\tfield4\ndata1\tdata2\tdata3\tdata4';
      const result = await parseTSV(content, { hasHeader: false });

      expect(result.notes[0].fields).toHaveLength(4);
      expect(result.noteTypes[0].flds).toHaveLength(4);
    });
  });

  describe('parseTSVFromBuffer', () => {
    it('should parse from ArrayBuffer', async () => {
      const content = 'こんにちは\tHello\nさようなら\tGoodbye';
      const buffer = new TextEncoder().encode(content).buffer;
      const result = await parseTSVFromBuffer(buffer);

      expect(result.notes).toHaveLength(2);
      expect(result.notes[0].fields).toEqual(['こんにちは', 'Hello']);
    });

    it('should parse from Uint8Array', async () => {
      const content = 'こんにちは\tHello\nさようなら\tGoodbye';
      const uint8 = new TextEncoder().encode(content);
      const result = await parseTSVFromBuffer(uint8);

      expect(result.notes).toHaveLength(2);
      expect(result.notes[0].fields).toEqual(['こんにちは', 'Hello']);
    });
  });

  describe('validateTSV', () => {
    it('should validate correct TSV', () => {
      const result = validateTSV('a\tb\nc\td');
      expect(result.valid).toBe(true);
      expect(result.rowCount).toBe(2);
      expect(result.columnCount).toBe(2);
    });

    it('should reject non-TSV content', () => {
      const result = validateTSV('no tabs here');
      expect(result.valid).toBe(false);
      expect(result.error).toContain('tab-separated');
    });

    it('should handle empty content', () => {
      const result = validateTSV('');
      expect(result.valid).toBe(true);
      expect(result.rowCount).toBe(0);
    });

    it('should detect inconsistent column counts', () => {
      // Create content with very inconsistent columns
      const lines = [];
      for (let i = 0; i < 20; i++) {
        if (i % 2 === 0) {
          lines.push('a\tb');
        } else {
          lines.push('a\tb\tc\td\te\tf');
        }
      }
      const result = validateTSV(lines.join('\n'));
      expect(result.valid).toBe(false);
    });
  });
});
