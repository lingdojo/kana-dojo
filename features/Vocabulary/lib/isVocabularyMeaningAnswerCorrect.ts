import { toHiragana } from 'wanakana';
import type { IVocabObj } from '@/entities/vocabulary';
import {
  normalizeAnswerValue,
  normalizeMeaningAnswer,
} from '@/shared/utils/meanings';

/**
 * Matches a typed Japanese answer against a single entry, by word or by
 * reading. Readings are compared in hiragana so katakana and romaji input
 * reach the same canonical form.
 */
const matchesVocabularyEntry = (
  vocabulary: IVocabObj,
  normalizedAnswer: string,
): boolean =>
  normalizeAnswerValue(vocabulary.word) === normalizedAnswer ||
  toHiragana(normalizedAnswer) ===
    toHiragana(normalizeAnswerValue(vocabulary.reading));

/**
 * True when an entry carries the meaning the question is displaying, so it is
 * an answer the learner could reasonably have given.
 */
const carriesMeaning = (
  vocabulary: IVocabObj,
  normalizedMeaning: string,
): boolean =>
  vocabulary.meanings.some(
    meaning => normalizeMeaningAnswer(meaning) === normalizedMeaning,
  );

/**
 * Checks a vocabulary answer.
 *
 * Normal mode shows the Japanese word and expects an English meaning, so any
 * of that entry's own meanings is accepted.
 *
 * Reverse mode shows an English meaning (`meanings[0]`) and expects the
 * Japanese. Several entries can share one meaning, so the entry the question
 * happened to pick is not the only correct answer. `sessionVocabulary` is the
 * pool the question was drawn from; any entry in it carrying the displayed
 * meaning is accepted too. In the N5 set あそこ, あっち, そちら, そっち and
 * むこう all mean "over there", so without the pool four of those five correct
 * answers are marked wrong.
 *
 * The pool is optional and defaults to empty, which preserves the previous
 * single-entry behaviour for callers that do not have it to hand.
 */
export const isVocabularyMeaningAnswerCorrect = (
  vocabulary: IVocabObj,
  answer: string,
  isReverse: boolean | undefined,
  sessionVocabulary: readonly IVocabObj[] = [],
): boolean => {
  const normalizedAnswer = isReverse
    ? normalizeAnswerValue(answer)
    : normalizeMeaningAnswer(answer);
  if (!normalizedAnswer) return false;

  if (!isReverse) {
    return carriesMeaning(vocabulary, normalizedAnswer);
  }

  if (matchesVocabularyEntry(vocabulary, normalizedAnswer)) return true;

  const displayedMeaning = normalizeMeaningAnswer(vocabulary.meanings[0] ?? '');
  if (!displayedMeaning) return false;

  return sessionVocabulary.some(
    candidate =>
      carriesMeaning(candidate, displayedMeaning) &&
      matchesVocabularyEntry(candidate, normalizedAnswer),
  );
};
