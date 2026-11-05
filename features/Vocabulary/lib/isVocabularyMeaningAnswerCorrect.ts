import { toHiragana } from 'wanakana';
import type { IVocabObj } from '@/entities/vocabulary';
import {
  normalizeAnswerValue,
  normalizeMeaningAnswer,
} from '@/shared/utils/meanings';

export const isVocabularyMeaningAnswerCorrect = (
  vocabulary: IVocabObj,
  answer: string,
  isReverse: boolean | undefined,
  alternativeVocabularies: IVocabObj[] = [],
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

  const questionMeaning = normalizeMeaningAnswer(vocabulary.meanings[0] ?? '');

  const vocabularies = [vocabulary, ...alternativeVocabularies];

  return vocabularies.some(candidate => {
    const sharesQuestionMeaning = candidate.meanings.some(
      meaning => normalizeMeaningAnswer(meaning) === questionMeaning,
    );

    if (!sharesQuestionMeaning) return false;

    return (
      normalizeAnswerValue(candidate.word) === normalizedAnswer ||
      toHiragana(normalizedAnswer) ===
        toHiragana(normalizeAnswerValue(candidate.reading))
    );
  });
};
