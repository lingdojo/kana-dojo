/**
 * Text Extractor
 *
 * Utilities for extracting clean text from Anki card HTML content.
 * Removes media tags, cleans HTML, and preserves text formatting indicators.
 *
 * @module features/AnkiConverter/lib/textExtractor
 */

/**
 * Options for text extraction
 */
export interface TextExtractorOptions {
  /** Preserve formatting markers like **bold** and *italic* (default: true) */
  preserveFormatting?: boolean;
  /** Normalize whitespace (default: true) */
  normalizeWhitespace?: boolean;
}

const DEFAULT_OPTIONS: TextExtractorOptions = {
  preserveFormatting: true,
  normalizeWhitespace: true,
};

/**
 * Anki-specific sound tag pattern: [sound:filename.mp3]
 */
const ANKI_SOUND_PATTERN = /\[sound:[^\]]*\]/gi;

/**
 * HTML media tags pattern (img, audio, video, source, track)
 */
const HTML_MEDIA_TAGS_PATTERN =
  /<(img|audio|video|source|track|object|embed|iframe)[^>]*\/?>/gi;

/**
 * Self-closing media tags that might have content
 */
const MEDIA_TAGS_WITH_CONTENT_PATTERN =
  /<(audio|video|object)[^>]*>[\s\S]*?<\/\1>/gi;

/**
 * HTML formatting tags to convert to text markers
 */
const FORMATTING_CONVERSIONS: Array<{
  pattern: RegExp;
  replacement: string | ((match: string, content: string) => string);
}> = [
  // Bold: <b>, <strong>
  { pattern: /<b[^>]*>([\s\S]*?)<\/b>/gi, replacement: '**$1**' },
  { pattern: /<strong[^>]*>([\s\S]*?)<\/strong>/gi, replacement: '**$1**' },
  // Italic: <i>, <em>
  { pattern: /<i[^>]*>([\s\S]*?)<\/i>/gi, replacement: '*$1*' },
  { pattern: /<em[^>]*>([\s\S]*?)<\/em>/gi, replacement: '*$1*' },
  // Underline: <u>
  { pattern: /<u[^>]*>([\s\S]*?)<\/u>/gi, replacement: '_$1_' },
  // Strikethrough: <s>, <strike>, <del>
  { pattern: /<s[^>]*>([\s\S]*?)<\/s>/gi, replacement: '~~$1~~' },
  { pattern: /<strike[^>]*>([\s\S]*?)<\/strike>/gi, replacement: '~~$1~~' },
  { pattern: /<del[^>]*>([\s\S]*?)<\/del>/gi, replacement: '~~$1~~' },
  // Subscript/Superscript
  { pattern: /<sub[^>]*>([\s\S]*?)<\/sub>/gi, replacement: '[$1]' },
  { pattern: /<sup[^>]*>([\s\S]*?)<\/sup>/gi, replacement: '^$1^' },
];

/**
 * Block-level tags that should add line breaks
 */
const BLOCK_TAGS_PATTERN =
  /<\/?(?:div|p|br|hr|h[1-6]|ul|ol|li|blockquote|pre|table|tr|td|th|thead|tbody|tfoot)[^>]*\/?>/gi;

/**
 * All remaining HTML tags pattern
 */
const ALL_HTML_TAGS_PATTERN = /<[^>]+>/g;

/**
 * HTML entities to decode
 */
const HTML_ENTITIES: Record<string, string> = {
  '&nbsp;': ' ',
  '&amp;': '&',
  '&lt;': '<',
  '&gt;': '>',
  '&quot;': '"',
  '&#39;': "'",
  '&apos;': "'",
  '&copy;': '\u00A9', // ©
  '&reg;': '\u00AE', // ®
  '&trade;': '\u2122', // ™
  '&mdash;': '\u2014', // —
  '&ndash;': '\u2013', // –
  '&hellip;': '\u2026', // …
  '&lsquo;': '\u2018', // '
  '&rsquo;': '\u2019', // '
  '&ldquo;': '\u201C', // "
  '&rdquo;': '\u201D', // "
  '&bull;': '\u2022', // •
  '&middot;': '\u00B7', // ·
  '&deg;': '\u00B0', // °
  '&plusmn;': '\u00B1', // ±
  '&times;': '\u00D7', // ×
  '&divide;': '\u00F7', // ÷
  '&frac12;': '\u00BD', // ½
  '&frac14;': '\u00BC', // ¼
  '&frac34;': '\u00BE', // ¾
};

/**
 * Numeric HTML entity pattern
 */
const NUMERIC_ENTITY_PATTERN = /&#(\d+);/g;
const HEX_ENTITY_PATTERN = /&#x([0-9a-fA-F]+);/g;

/**
 * Named HTML entity pattern
 */
const NAMED_ENTITY_PATTERN = /&[a-zA-Z]+;/g;

/**
 * Remove all media tags from HTML content.
 * Handles img, audio, video, source, track, object, embed, iframe tags
 * and Anki-specific [sound:...] references.
 *
 * @param html - HTML content with potential media tags
 * @returns HTML content with media tags removed
 */
export function removeMediaTags(html: string): string {
  if (!html) return '';

  let result = html;

  // Remove Anki-specific sound tags first
  result = result.replace(ANKI_SOUND_PATTERN, '');

  // Remove media tags with content (audio, video, object)
  result = result.replace(MEDIA_TAGS_WITH_CONTENT_PATTERN, '');

  // Remove self-closing media tags
  result = result.replace(HTML_MEDIA_TAGS_PATTERN, '');

  return result;
}

/**
 * Convert HTML formatting tags to text markers.
 * <b>text</b> -> **text**
 * <i>text</i> -> *text*
 * <u>text</u> -> _text_
 *
 * @param html - HTML content with formatting tags
 * @returns Content with formatting converted to text markers
 */
export function preserveFormatting(html: string): string {
  if (!html) return '';

  let result = html;

  for (const { pattern, replacement } of FORMATTING_CONVERSIONS) {
    if (typeof replacement === 'string') {
      result = result.replace(pattern, replacement);
    } else {
      result = result.replace(pattern, replacement);
    }
  }

  return result;
}

/**
 * Decode HTML entities to their character equivalents.
 *
 * @param text - Text with HTML entities
 * @returns Text with entities decoded
 */
export function decodeHtmlEntities(text: string): string {
  if (!text) return '';

  let result = text;

  // Decode numeric entities (decimal)
  result = result.replace(NUMERIC_ENTITY_PATTERN, (_, code) => {
    const num = parseInt(code, 10);
    return isNaN(num) ? '' : String.fromCodePoint(num);
  });

  // Decode numeric entities (hex)
  result = result.replace(HEX_ENTITY_PATTERN, (_, code) => {
    const num = parseInt(code, 16);
    return isNaN(num) ? '' : String.fromCodePoint(num);
  });

  // Decode named entities
  result = result.replace(NAMED_ENTITY_PATTERN, entity => {
    return HTML_ENTITIES[entity] ?? entity;
  });

  return result;
}

/**
 * Remove all HTML tags from content.
 * Block-level tags are replaced with newlines.
 *
 * @param html - HTML content
 * @returns Plain text without HTML tags
 */
export function stripHtmlTags(html: string): string {
  if (!html) return '';

  let result = html;

  // Replace block-level tags with newlines
  result = result.replace(BLOCK_TAGS_PATTERN, '\n');

  // Remove all remaining HTML tags
  result = result.replace(ALL_HTML_TAGS_PATTERN, '');

  return result;
}

/**
 * Clean and normalize whitespace in text.
 * - Collapses multiple spaces to single space
 * - Collapses multiple newlines to double newline (paragraph break)
 * - Trims leading/trailing whitespace
 *
 * @param text - Text with potentially messy whitespace
 * @returns Text with normalized whitespace
 */
export function cleanWhitespace(text: string): string {
  if (!text) return '';

  let result = text;

  // Replace tabs with spaces
  result = result.replace(/\t/g, ' ');

  // Collapse multiple spaces to single space
  result = result.replace(/ {2,}/g, ' ');

  // Normalize line endings
  result = result.replace(/\r\n/g, '\n');
  result = result.replace(/\r/g, '\n');

  // Collapse multiple newlines to double newline
  result = result.replace(/\n{3,}/g, '\n\n');

  // Remove spaces at start/end of lines
  result = result.replace(/^ +/gm, '');
  result = result.replace(/ +$/gm, '');

  // Trim overall
  result = result.trim();

  return result;
}

/**
 * Extract clean text from HTML content.
 * This is the main entry point for text extraction.
 *
 * Pipeline:
 * 1. Remove media tags (img, audio, video, [sound:...])
 * 2. Convert formatting tags to text markers (optional)
 * 3. Decode HTML entities
 * 4. Strip remaining HTML tags
 * 5. Clean and normalize whitespace (optional)
 *
 * @param html - HTML content from Anki card
 * @param options - Extraction options
 * @returns Clean text content
 */
export function extractText(
  html: string,
  options: TextExtractorOptions = {},
): string {
  if (!html) return '';

  const opts = { ...DEFAULT_OPTIONS, ...options };

  let result = html;

  // Step 1: Remove media tags
  result = removeMediaTags(result);

  // Step 2: Convert formatting tags to text markers (if enabled)
  if (opts.preserveFormatting) {
    result = preserveFormatting(result);
  }

  // Step 3: Decode HTML entities
  result = decodeHtmlEntities(result);

  // Step 4: Strip remaining HTML tags
  result = stripHtmlTags(result);

  // Step 5: Clean whitespace (if enabled)
  if (opts.normalizeWhitespace) {
    result = cleanWhitespace(result);
  }

  return result;
}

/**
 * Check if text contains any media references.
 * Useful for validation and filtering.
 *
 * @param text - Text to check
 * @returns True if text contains media references
 */
export function containsMediaReferences(text: string): boolean {
  if (!text) return false;

  return (
    ANKI_SOUND_PATTERN.test(text) ||
    HTML_MEDIA_TAGS_PATTERN.test(text) ||
    MEDIA_TAGS_WITH_CONTENT_PATTERN.test(text)
  );
}

/**
 * Check if text contains HTML tags.
 *
 * @param text - Text to check
 * @returns True if text contains HTML tags
 */
export function containsHtmlTags(text: string): boolean {
  if (!text) return false;
  return ALL_HTML_TAGS_PATTERN.test(text);
}
