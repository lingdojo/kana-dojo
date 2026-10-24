import { toHiragana } from 'wanakana';

/**
 * Normalizes a kana string for comparison by converting Katakana to Hiragana,
 * applying Unicode NFC normalization, and stripping whitespace.
 *
 * This ensures phonetically equivalent answers using different scripts
 * (e.g., 'り' vs 'リ') are treated as identical.
 */
export const normalizeKanaForComparison = (str: string): string =>
  toHiragana(str.trim().normalize('NFC'));

/**
 * Finds all valid answers from a list of options that match the correct answer
 * when normalized. This is useful for showing all equivalent kana when revealing
 * the answer (e.g., showing both 'れ' and 'レ' for romaji 're').
 */
export const findAllValidAnswers = (
  correctAnswer: string,
  options: readonly string[],
): string[] => {
  const normalizedCorrect = normalizeKanaForComparison(correctAnswer);
  return options.filter(
    option => normalizeKanaForComparison(option) === normalizedCorrect,
  );
};
