import { toHiragana } from 'wanakana';
import type { IVocabObj } from '@/entities/vocabulary';

const normalize = (value: string): string =>
  value.trim().normalize('NFC').toLowerCase();

const normalizeMeaning = (value: string): string =>
  normalize(value).replace(/^to\s+/, '');

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
    toHiragana(normalizedAnswer) ===
      toHiragana(normalize(vocabulary.reading))
  );
};
