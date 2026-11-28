export function removeVerbDuplicates(meanings: string[]): string[] {
  const set = new Set(meanings);
  return meanings.filter(m => {
    const match = m.match(/^to\s+(.+)/i);
    return !match || !set.has(match[1]);
  });
}

/**
 * Zero-width and other invisible characters (soft hyphen, ZWSP/ZWNJ/ZWJ,
 * bidi marks, word joiner, BOM) that come along when an answer is pasted
 * from a web page or another app. They render as nothing, so the answer
 * looks correct but never compares equal.
 */
const INVISIBLE_CHARACTERS = /[\u00AD\u200B-\u200F\u2060-\u2064\uFEFF]/g;

/**
 * Case/whitespace-insensitive baseline used for reverse (Japanese) answers
 * and as the starting point for meaning answers.
 *
 * NFKC folds compatibility forms onto their standard spelling, so full-width
 * Latin ("ＯＫ"), half-width katakana ("ｱﾒﾘｶ") and non-breaking or
 * ideographic spaces match what the user can actually type.
 * Strip invisible characters first so they cannot interrupt combining marks.
 */
export const normalizeAnswerValue = (value: string): string =>
  value
    .replace(INVISIBLE_CHARACTERS, '')
    .normalize('NFKC')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();

/**
 * A lone English infinitive marker or article is optional. Compound prefixes
 * such as "to the" are preserved because removing both can change meaning
 * (for example, "to the point" is not equivalent to "point").
 */
const OPTIONAL_MEANING_PREFIX =
  /^(?:to(?!\s+(?:the|an|a)\s+)\s+|(?:the|an|a)\s+)/;

/**
 * Meanings in the data use the single ellipsis character ("well then…"),
 * but people type three dots (or more), so every ellipsis spelling is
 * folded to a canonical "..." before comparing.
 */
const ELLIPSIS_VARIANTS = /…|\.{2,}/g;

/**
 * Normalizes an English meaning answer so that optional articles/infinitives
 * and ellipsis spellings are treated as equivalent.
 */
export const normalizeMeaningAnswer = (value: string): string =>
  normalizeAnswerValue(value)
    .replace(ELLIPSIS_VARIANTS, '...')
    .replace(OPTIONAL_MEANING_PREFIX, '');
