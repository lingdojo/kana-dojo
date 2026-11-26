import type { IKanjiObj } from '@/entities/kanji';
import { readingsMatch } from '@/shared/utils/japaneseReading';
import {
  normalizeAnswerValue,
  normalizeMeaningAnswer,
} from '@/shared/utils/meanings';

const matchesReading = (answer: string, readings: string[]): boolean =>
  readings.some(reading => readingsMatch(answer, reading));

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
    matchesReading(answer, [...kanji.kunyomi, ...kanji.onyomi])
  );
};
