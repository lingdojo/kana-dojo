/**
 * Text Extractor Tests
 *
 * Property-based tests for HTML cleaning and text extraction.
 *
 * @module features/AnkiConverter/__tests__/textExtractor.test.ts
 */

import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import {
  extractText,
  removeMediaTags,
  preserveFormatting,
  decodeHtmlEntities,
  stripHtmlTags,
  cleanWhitespace,
  containsMediaReferences,
  containsHtmlTags,
} from '../lib/textExtractor';

/**
 * Arbitrary for generating random media tags
 */
const mediaTagArb = fc.oneof(
  // Image tags
  fc
    .record({
      type: fc.constant('img'),
      src: fc.webUrl(),
      alt: fc.string({ minLength: 0, maxLength: 20 }),
    })
    .map(({ src, alt }) => `<img src="${src}" alt="${alt}">`),
  fc
    .record({
      type: fc.constant('img'),
      src: fc
        .string({ minLength: 1, maxLength: 30 })
        .filter(s => !s.includes('"') && !s.includes('>')),
    })
    .map(({ src }) => `<img src="${src}" />`),
  // Audio tags
  fc
    .record({
      type: fc.constant('audio'),
      src: fc
        .string({ minLength: 1, maxLength: 30 })
        .filter(s => !s.includes('"') && !s.includes('>')),
    })
    .map(({ src }) => `<audio src="${src}"></audio>`),
  fc
    .record({
      type: fc.constant('audio'),
      src: fc
        .string({ minLength: 1, maxLength: 30 })
        .filter(s => !s.includes('"') && !s.includes('>')),
    })
    .map(({ src }) => `<audio controls><source src="${src}"></audio>`),
  // Video tags
  fc
    .record({
      type: fc.constant('video'),
      src: fc
        .string({ minLength: 1, maxLength: 30 })
        .filter(s => !s.includes('"') && !s.includes('>')),
    })
    .map(({ src }) => `<video src="${src}"></video>`),
  fc
    .record({
      type: fc.constant('video'),
      src: fc
        .string({ minLength: 1, maxLength: 30 })
        .filter(s => !s.includes('"') && !s.includes('>')),
    })
    .map(({ src }) => `<video controls><source src="${src}"></video>`),
  // Anki sound tags
  fc
    .string({ minLength: 1, maxLength: 30 })
    .filter(s => !s.includes(']'))
    .map(name => `[sound:${name}.mp3]`),
  fc
    .string({ minLength: 1, maxLength: 30 })
    .filter(s => !s.includes(']'))
    .map(name => `[sound:${name}.wav]`),
  fc
    .string({ minLength: 1, maxLength: 30 })
    .filter(s => !s.includes(']'))
    .map(name => `[sound:${name}.ogg]`),
  // Object/embed tags
  fc
    .string({ minLength: 1, maxLength: 30 })
    .filter(s => !s.includes('"') && !s.includes('>'))
    .map(src => `<object data="${src}"></object>`),
  fc
    .string({ minLength: 1, maxLength: 30 })
    .filter(s => !s.includes('"') && !s.includes('>'))
    .map(src => `<embed src="${src}">`),
  fc
    .string({ minLength: 1, maxLength: 30 })
    .filter(s => !s.includes('"') && !s.includes('>'))
    .map(src => `<iframe src="${src}"></iframe>`),
);

/**
 * Arbitrary for generating safe text (no HTML-like content)
 */
const safeTextArb = fc
  .string({ minLength: 0, maxLength: 100 })
  .filter(
    s =>
      !s.includes('<') &&
      !s.includes('>') &&
      !s.includes('[sound:') &&
      !s.includes('&'),
  );

/**
 * Arbitrary for generating Unicode text (safe for HTML context - no < > & characters)
 */
const unicodeTextArb = fc.oneof(
  // Japanese Hiragana
  fc
    .array(
      fc
        .integer({ min: 0x3040, max: 0x309f })
        .map(c => String.fromCodePoint(c)),
      { minLength: 1, maxLength: 50 },
    )
    .map(arr => arr.join('')),
  // Chinese
  fc
    .array(
      fc
        .integer({ min: 0x4e00, max: 0x9fff })
        .map(c => String.fromCodePoint(c)),
      { minLength: 1, maxLength: 50 },
    )
    .map(arr => arr.join('')),
  // Korean
  fc
    .array(
      fc
        .integer({ min: 0xac00, max: 0xd7af })
        .map(c => String.fromCodePoint(c)),
      { minLength: 1, maxLength: 50 },
    )
    .map(arr => arr.join('')),
  // Arabic
  fc
    .array(
      fc
        .integer({ min: 0x0600, max: 0x06ff })
        .map(c => String.fromCodePoint(c)),
      { minLength: 1, maxLength: 50 },
    )
    .map(arr => arr.join('')),
  // Emoji
  fc
    .array(
      fc
        .integer({ min: 0x1f600, max: 0x1f64f })
        .map(c => String.fromCodePoint(c)),
      { minLength: 1, maxLength: 20 },
    )
    .map(arr => arr.join('')),
  // Cyrillic
  fc
    .array(
      fc
        .integer({ min: 0x0400, max: 0x04ff })
        .map(c => String.fromCodePoint(c)),
      { minLength: 1, maxLength: 50 },
    )
    .map(arr => arr.join('')),
);

describe('Text Extractor', () => {
  describe('Unit Tests', () => {
    describe('removeMediaTags', () => {
      it('should remove img tags', () => {
        expect(removeMediaTags('Hello <img src="test.jpg"> World')).toBe(
          'Hello  World',
        );
        expect(removeMediaTags('<img src="a.png" alt="test"/>')).toBe('');
      });

      it('should remove audio tags', () => {
        expect(removeMediaTags('Listen: <audio src="test.mp3"></audio>')).toBe(
          'Listen: ',
        );
        expect(
          removeMediaTags('<audio controls><source src="a.mp3"></audio>'),
        ).toBe('');
      });

      it('should remove video tags', () => {
        expect(removeMediaTags('Watch: <video src="test.mp4"></video>')).toBe(
          'Watch: ',
        );
      });

      it('should remove Anki sound tags', () => {
        expect(removeMediaTags('Word [sound:pronunciation.mp3] meaning')).toBe(
          'Word  meaning',
        );
        expect(removeMediaTags('[sound:test.wav]')).toBe('');
      });

      it('should remove embed and object tags', () => {
        expect(removeMediaTags('<embed src="flash.swf">')).toBe('');
        expect(removeMediaTags('<object data="app.swf"></object>')).toBe('');
      });

      it('should handle empty input', () => {
        expect(removeMediaTags('')).toBe('');
      });
    });

    describe('preserveFormatting', () => {
      it('should convert bold tags', () => {
        expect(preserveFormatting('<b>bold</b>')).toBe('**bold**');
        expect(preserveFormatting('<strong>strong</strong>')).toBe(
          '**strong**',
        );
      });

      it('should convert italic tags', () => {
        expect(preserveFormatting('<i>italic</i>')).toBe('*italic*');
        expect(preserveFormatting('<em>emphasis</em>')).toBe('*emphasis*');
      });

      it('should convert underline tags', () => {
        expect(preserveFormatting('<u>underline</u>')).toBe('_underline_');
      });

      it('should convert strikethrough tags', () => {
        expect(preserveFormatting('<s>strike</s>')).toBe('~~strike~~');
        expect(preserveFormatting('<del>deleted</del>')).toBe('~~deleted~~');
      });

      it('should handle nested formatting', () => {
        expect(preserveFormatting('<b><i>bold italic</i></b>')).toBe(
          '***bold italic***',
        );
      });
    });

    describe('decodeHtmlEntities', () => {
      it('should decode common entities', () => {
        expect(decodeHtmlEntities('&amp;')).toBe('&');
        expect(decodeHtmlEntities('&lt;')).toBe('<');
        expect(decodeHtmlEntities('&gt;')).toBe('>');
        expect(decodeHtmlEntities('&quot;')).toBe('"');
        expect(decodeHtmlEntities('&nbsp;')).toBe(' ');
      });

      it('should decode numeric entities', () => {
        expect(decodeHtmlEntities('&#65;')).toBe('A');
        expect(decodeHtmlEntities('&#12354;')).toBe('あ');
      });

      it('should decode hex entities', () => {
        expect(decodeHtmlEntities('&#x41;')).toBe('A');
        expect(decodeHtmlEntities('&#x3042;')).toBe('あ');
      });
    });

    describe('stripHtmlTags', () => {
      it('should remove all HTML tags', () => {
        expect(stripHtmlTags('<div>content</div>')).toContain('content');
        expect(stripHtmlTags('<span class="test">text</span>')).toContain(
          'text',
        );
      });

      it('should add newlines for block elements', () => {
        const result = stripHtmlTags('<p>para1</p><p>para2</p>');
        expect(result).toContain('\n');
      });
    });

    describe('cleanWhitespace', () => {
      it('should collapse multiple spaces', () => {
        expect(cleanWhitespace('hello    world')).toBe('hello world');
      });

      it('should collapse multiple newlines', () => {
        expect(cleanWhitespace('hello\n\n\n\nworld')).toBe('hello\n\nworld');
      });

      it('should trim whitespace', () => {
        expect(cleanWhitespace('  hello  ')).toBe('hello');
      });
    });

    describe('extractText', () => {
      it('should extract clean text from complex HTML', () => {
        const html =
          '<div><b>Hello</b> <img src="test.jpg"> <i>World</i> [sound:test.mp3]</div>';
        const result = extractText(html);
        expect(result).toBe('**Hello** *World*');
      });

      it('should preserve Unicode characters', () => {
        const html = '<div>こんにちは 世界</div>';
        expect(extractText(html)).toBe('こんにちは 世界');
      });

      it('should handle empty input', () => {
        expect(extractText('')).toBe('');
      });
    });
  });

  /**
   * Property-based tests
   *
   * **Feature: anki-converter, Property 2: Media tag removal completeness**
   * **Validates: Requirements 4.1, 4.2, 4.3, 4.4**
   */
  describe('Property 2: Media tag removal completeness', () => {
    it('should remove all media tags while preserving surrounding text', () => {
      fc.assert(
        fc.property(
          safeTextArb,
          mediaTagArb,
          safeTextArb,
          (before, mediaTag, after) => {
            const html = `${before}${mediaTag}${after}`;
            const result = removeMediaTags(html);

            // Result should not contain any media references
            const hasImg = /<img[^>]*>/i.test(result);
            const hasAudio = /<audio[^>]*>/i.test(result);
            const hasVideo = /<video[^>]*>/i.test(result);
            const hasSound = /\[sound:[^\]]*\]/i.test(result);
            const hasEmbed = /<embed[^>]*>/i.test(result);
            const hasObject = /<object[^>]*>/i.test(result);
            const hasIframe = /<iframe[^>]*>/i.test(result);

            return (
              !hasImg &&
              !hasAudio &&
              !hasVideo &&
              !hasSound &&
              !hasEmbed &&
              !hasObject &&
              !hasIframe
            );
          },
        ),
        { numRuns: 100 },
      );
    });

    it('should preserve all surrounding text content', () => {
      fc.assert(
        fc.property(
          safeTextArb.filter(s => s.length > 0),
          mediaTagArb,
          safeTextArb.filter(s => s.length > 0),
          (before, mediaTag, after) => {
            const html = `${before}${mediaTag}${after}`;
            const result = removeMediaTags(html);

            // Both before and after text should be present
            return result.includes(before) && result.includes(after);
          },
        ),
        { numRuns: 100 },
      );
    });

    it('should handle multiple media tags', () => {
      fc.assert(
        fc.property(
          fc.array(mediaTagArb, { minLength: 1, maxLength: 5 }),
          safeTextArb,
          (mediaTags, text) => {
            const html = mediaTags.join(text);
            const result = removeMediaTags(html);

            // No media references should remain
            return !containsMediaReferences(result);
          },
        ),
        { numRuns: 100 },
      );
    });

    it('should not introduce new content when removing media', () => {
      fc.assert(
        fc.property(
          safeTextArb,
          mediaTagArb,
          safeTextArb,
          (before, mediaTag, after) => {
            const html = `${before}${mediaTag}${after}`;
            const result = removeMediaTags(html);

            // Result length should be <= original length
            // (we're only removing, never adding)
            return result.length <= html.length;
          },
        ),
        { numRuns: 100 },
      );
    });
  });

  /**
   * **Feature: anki-converter, Property 11: HTML to text conversion idempotence**
   * **Validates: Requirements 4.5**
   */
  describe('Property 11: HTML to text conversion idempotence', () => {
    it('should produce identical output when applied twice', () => {
      fc.assert(
        fc.property(
          // Generate text that's already been cleaned (no HTML)
          safeTextArb,
          text => {
            const firstPass = extractText(text);
            const secondPass = extractText(firstPass);

            return firstPass === secondPass;
          },
        ),
        { numRuns: 100 },
      );
    });

    it('should be idempotent for any HTML input', () => {
      fc.assert(
        fc.property(
          fc.oneof(
            // Simple HTML
            safeTextArb.map(t => `<div>${t}</div>`),
            // HTML with formatting
            safeTextArb.map(t => `<b>${t}</b>`),
            // HTML with media
            fc.tuple(safeTextArb, mediaTagArb).map(([t, m]) => `${t}${m}`),
            // Complex HTML
            fc
              .tuple(safeTextArb, safeTextArb)
              .map(([a, b]) => `<div><p>${a}</p><span>${b}</span></div>`),
          ),
          html => {
            const firstPass = extractText(html);
            const secondPass = extractText(firstPass);

            return firstPass === secondPass;
          },
        ),
        { numRuns: 100 },
      );
    });

    it('should stabilize whitespace after first pass', () => {
      fc.assert(
        fc.property(
          fc.array(
            safeTextArb.filter(s => s.trim().length > 0),
            { minLength: 1, maxLength: 5 },
          ),
          parts => {
            // Create HTML with various whitespace patterns
            const html = parts.map(p => `<div>  ${p}  </div>`).join('\n\n\n');

            const firstPass = extractText(html);
            const secondPass = extractText(firstPass);

            return firstPass === secondPass;
          },
        ),
        { numRuns: 100 },
      );
    });
  });

  /**
   * **Feature: anki-converter, Property 6: Unicode character preservation**
   * **Validates: Requirements 11.4**
   */
  describe('Property 6: Unicode character preservation', () => {
    it('should preserve all Unicode characters in plain text', () => {
      fc.assert(
        fc.property(unicodeTextArb, text => {
          // Wrap in simple HTML
          const html = `<div>${text}</div>`;
          const result = extractText(html);

          // All original characters should be present
          // (after trimming whitespace that extractText normalizes)
          const trimmedResult = result.trim();
          const trimmedText = text.trim();

          return trimmedResult === trimmedText;
        }),
        { numRuns: 100 },
      );
    });

    it('should preserve Japanese characters', () => {
      fc.assert(
        fc.property(
          fc
            .array(
              fc
                .integer({ min: 0x3040, max: 0x309f })
                .map(c => String.fromCodePoint(c)),
              { minLength: 1, maxLength: 50 },
            )
            .map(arr => arr.join('')),
          japanese => {
            const html = `<span>${japanese}</span>`;
            const result = extractText(html);
            return result === japanese;
          },
        ),
        { numRuns: 100 },
      );
    });

    it('should preserve Chinese characters', () => {
      fc.assert(
        fc.property(
          fc
            .array(
              fc
                .integer({ min: 0x4e00, max: 0x9fff })
                .map(c => String.fromCodePoint(c)),
              { minLength: 1, maxLength: 50 },
            )
            .map(arr => arr.join('')),
          chinese => {
            const html = `<p>${chinese}</p>`;
            const result = extractText(html);
            return result === chinese;
          },
        ),
        { numRuns: 100 },
      );
    });

    it('should preserve emoji characters', () => {
      fc.assert(
        fc.property(
          fc
            .array(
              fc
                .integer({ min: 0x1f600, max: 0x1f64f })
                .map(c => String.fromCodePoint(c)),
              { minLength: 1, maxLength: 10 },
            )
            .map(arr => arr.join('')),
          emoji => {
            const html = `<div>${emoji}</div>`;
            const result = extractText(html);
            return result === emoji;
          },
        ),
        { numRuns: 100 },
      );
    });

    it('should preserve mixed Unicode with media tags removed', () => {
      fc.assert(
        fc.property(
          unicodeTextArb.filter(t => t.trim().length > 0),
          mediaTagArb,
          unicodeTextArb.filter(t => t.trim().length > 0),
          (before, media, after) => {
            const html = `${before}${media}${after}`;
            const result = extractText(html);

            // Both Unicode parts should be preserved
            const beforeTrimmed = before.trim();
            const afterTrimmed = after.trim();

            return (
              result.includes(beforeTrimmed) && result.includes(afterTrimmed)
            );
          },
        ),
        { numRuns: 100 },
      );
    });

    it('should handle Unicode in HTML entities', () => {
      fc.assert(
        fc.property(fc.integer({ min: 0x3040, max: 0x309f }), codePoint => {
          const char = String.fromCodePoint(codePoint);
          const htmlDecimal = `&#${codePoint};`;
          const htmlHex = `&#x${codePoint.toString(16)};`;

          const resultDecimal = decodeHtmlEntities(htmlDecimal);
          const resultHex = decodeHtmlEntities(htmlHex);

          return resultDecimal === char && resultHex === char;
        }),
        { numRuns: 100 },
      );
    });
  });
});
