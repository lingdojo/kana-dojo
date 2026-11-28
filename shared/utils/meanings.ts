export function removeVerbDuplicates(meanings: string[]): string[] {
  const set = new Set(meanings);
  return meanings.filter(m => {
    const match = m.match(/^to\s+(.+)/i);
    return !match || !set.has(match[1]);
  });
}

/**
 * Case/whitespace-insensitive baseline used for reverse (Japanese) answers
 * and as the starting point for meaning answers.
 */
export const normalizeAnswerValue = (value: string): string =>
  value.trim().normalize('NFC').toLowerCase();

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

/**
 * Splits a dictionary definition such as "ogre,demon,it (i.e., in a game of
 * tag)" into its meanings. Commas and semicolons inside parentheses belong to
 * the annotation, so only top-level separators split the list.
 */
export const splitDefinitionList = (definition: string): string[] => {
  const pieces: string[] = [];
  let depth = 0;
  let current = '';

  for (const char of definition) {
    if (char === '(') depth += 1;
    else if (char === ')') depth = Math.max(0, depth - 1);

    if ((char === ',' || char === ';') && depth === 0) {
      pieces.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  pieces.push(current);

  return pieces.map(piece => piece.trim()).filter(Boolean);
};
