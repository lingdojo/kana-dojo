import { toHiragana } from 'wanakana';
import type { IVocabObj } from '@/entities/vocabulary';
import {
  normalizeAnswerValue,
  normalizeMeaningAnswer,
  stripTrailingNote,
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
    return vocabulary.meanings.some(meaning => {
      const normalizedMeaning = normalizeMeaningAnswer(meaning);
      return (
        normalizedMeaning === normalizedAnswer ||
        stripTrailingNote(normalizedMeaning) === normalizedAnswer
      );
    });
  }

  return (
    normalizeAnswerValue(vocabulary.word) === normalizedAnswer ||
    toHiragana(normalizedAnswer) ===
      toHiragana(normalizeAnswerValue(vocabulary.reading))
  );
};
