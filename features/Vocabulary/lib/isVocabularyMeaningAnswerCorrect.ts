import { toHiragana } from 'wanakana';
import type { IVocabObj } from '@/entities/vocabulary';

const normalize = (value: string): string =>
  value.trim().normalize('NFC').toLowerCase();

/**
 * Optional English infinitive prefix ("to speak") followed by an optional
 * leading article ("the emperor", "a koto"). Both are stripped so the bare
 * and the prefixed form of a meaning compare equal in either direction.
 */
const MEANING_PREFIX = /^(?:to\s+)?(?:(?:the|an|a)\s+)?/;

const normalizeMeaning = (value: string): string =>
  normalize(value).replace(MEANING_PREFIX, '');

export const isVocabularyMeaningAnswerCorrect = (
  vocabulary: IVocabObj,
  answer: string,
  isReverse: boolean | undefined,
): boolean => {
  const normalizedAnswer = isReverse
    ? normalize(answer)
    : normalizeMeaning(answer);
  if (!normalizedAnswer) return false;

  if (!isReverse) {
    return vocabulary.meanings.some(
      meaning => normalizeMeaning(meaning) === normalizedAnswer,
    );
  }

  return (
    normalize(vocabulary.word) === normalizedAnswer ||
    toHiragana(normalizedAnswer) === toHiragana(normalize(vocabulary.reading))
  );
};
