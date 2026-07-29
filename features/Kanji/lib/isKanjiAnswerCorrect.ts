import type { IKanjiObj } from '@/entities/kanji';

const normalize = (value: string): string =>
  value.trim().normalize('NFC').toLowerCase();

const normalizeReading = (value: string): string =>
  normalize(value.split(' ')[0] ?? '');

export const isKanjiAnswerCorrect = (
  kanji: IKanjiObj,
  answer: string,
  isReverse: boolean | undefined,
): boolean => {
  const normalizedAnswer = normalize(answer);
  if (!normalizedAnswer) return false;

  if (!isReverse) {
    return kanji.meanings.some(
      meaning => normalize(meaning) === normalizedAnswer,
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
