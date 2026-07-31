import type { IKanjiObj } from '@/entities/kanji';

const normalize = (value: string): string =>
  value.trim().normalize('NFC').toLowerCase();

const normalizeMeaning = (value: string): string =>
  normalize(value).replace(/^to\s+/, '');

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
