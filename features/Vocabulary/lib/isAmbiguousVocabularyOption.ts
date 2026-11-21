import type { IVocabObj } from '@/entities/vocabulary';
import { isVocabularyMeaningAnswerCorrect } from '@/features/Vocabulary/lib/isVocabularyMeaningAnswerCorrect';

/**
 * Whether `option` would also be a correct answer to a meaning question about
 * `question`, e.g. because both words share the same English meaning. Such
 * words must not be offered as wrong options.
 */
export const isAmbiguousVocabularyOption = (
  question: IVocabObj,
  option: IVocabObj,
  isReverse: boolean | undefined,
): boolean =>
  isReverse
    ? // Reverse: the prompt is the question's first meaning, options are words.
      isVocabularyMeaningAnswerCorrect(option, question.meanings[0], false)
    : // Normal: the prompt is the word, options are first meanings.
      isVocabularyMeaningAnswerCorrect(question, option.meanings[0], false);
