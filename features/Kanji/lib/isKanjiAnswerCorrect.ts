import type { IKanjiObj } from '@/entities/kanji';
import {
  normalizeAnswerValue,
  normalizeMeaningAnswer,
} from '@/shared/utils/meanings';

const normalizeReading = (value: string): string =>
  normalizeAnswerValue(value.split(' ')[0] ?? '');

export const isKanjiAnswerCorrect = (
  kanji: IKanjiObj,
  answer: string,
  isReverse: boolean | undefined,
): boolean => {
  const normalizedAnswer = isReverse
    ? normalizeAnswerValue(answer)
    : normalizeMeaningAnswer(answer);
  if (!normalizedAnswer) return false;

  if (!isReverse) {
    return kanji.meanings.some(
      meaning => normalizeMeaningAnswer(meaning) === normalizedAnswer,
    );
  }

  return (
    normalizeAnswerValue(kanji.kanjiChar) === normalizedAnswer ||
    kanji.kunyomi.some(
      reading => normalizeReading(reading) === normalizedAnswer,
    ) ||
    kanji.onyomi.some(
      reading => normalizeReading(reading) === normalizedAnswer,
    )
  );
};
