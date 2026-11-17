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
  alternatives?: IVocabObj[],
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

  const answerMatchesVocabulary = (candidate: IVocabObj): boolean =>
    normalizeAnswerValue(candidate.word) === normalizedAnswer ||
    toHiragana(normalizedAnswer) ===
      toHiragana(normalizeAnswerValue(candidate.reading));

  if (answerMatchesVocabulary(vocabulary)) return true;

  const primaryMeaning = vocabulary.meanings[0];
  if (!primaryMeaning || !alternatives) return false;

  const normalizedPrimaryMeaning = normalizeMeaningAnswer(primaryMeaning);
  return alternatives.some(
    candidate =>
      candidate !== vocabulary &&
      normalizeMeaningAnswer(candidate.meanings[0] ?? '') ===
        normalizedPrimaryMeaning &&
      answerMatchesVocabulary(candidate),
  );
};
