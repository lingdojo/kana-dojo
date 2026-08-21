import type { IKanjiObj } from '@/entities/kanji';

const normalize = (value: string): string =>
  value.trim().normalize('NFC').toLowerCase();

/**
 * A lone English infinitive marker or article is optional. Compound prefixes
 * such as "to the" are preserved because removing both can change meaning
 * (for example, "to the point" is not equivalent to "point").
 */
const OPTIONAL_MEANING_PREFIX =
  /^(?:to(?!\s+(?:the|an|a)\s+)\s+|(?:the|an|a)\s+)/;

const normalizeMeaning = (value: string): string =>
  normalize(value).replace(OPTIONAL_MEANING_PREFIX, '');

const normalizeReading = (value: string): string =>
  normalize(value.split(' ')[0] ?? '');

export const isKanjiAnswerCorrect = (
  kanji: IKanjiObj,
  answer: string,
  isReverse: boolean | undefined,
): boolean => {
  const normalizedAnswer = isReverse
    ? normalize(answer)
    : normalizeMeaning(answer);
  if (!normalizedAnswer) return false;

  if (!isReverse) {
    return kanji.meanings.some(
      meaning => normalizeMeaning(meaning) === normalizedAnswer,
    );
  }

  return (
    normalize(kanji.kanjiChar) === normalizedAnswer ||
    kanji.kunyomi.some(
      reading => normalizeReading(reading) === normalizedAnswer,
    ) ||
    kanji.onyomi.some(
      reading => normalizeReading(reading) === normalizedAnswer,
    )
  );
};
