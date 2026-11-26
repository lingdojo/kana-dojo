import type { IVocabObj } from '@/entities/vocabulary';
import { readingsMatch } from '@/shared/utils/japaneseReading';
import {
  normalizeAnswerValue,
  normalizeMeaningAnswer,
} from '@/shared/utils/meanings';

export const isVocabularyMeaningAnswerCorrect = (
  vocabulary: IVocabObj,
  answer: string,
  isReverse: boolean | undefined,
): boolean => {
  const normalizedAnswer = isReverse
    ? normalizeAnswerValue(answer)
    : normalizeMeaningAnswer(answer);
  if (!normalizedAnswer) return false;

  if (!isReverse) {
    return vocabulary.meanings.some(
      meaning => normalizeMeaningAnswer(meaning) === normalizedAnswer,
    );
  }

  return (
    normalizeAnswerValue(vocabulary.word) === normalizedAnswer ||
    readingsMatch(normalizedAnswer, vocabulary.reading)
  );
};
