import { toHiragana } from 'wanakana';
import type { IVocabObj } from '@/entities/vocabulary';

const normalize = (value: string): string =>
  value.trim().normalize('NFC').toLowerCase();

export const isVocabularyMeaningAnswerCorrect = (
  vocabulary: IVocabObj,
  answer: string,
  isReverse: boolean,
): boolean => {
  const normalizedAnswer = normalize(answer);
  if (!normalizedAnswer) return false;

  if (!isReverse) {
    return vocabulary.meanings.some(
      meaning => normalize(meaning) === normalizedAnswer,
    );
  }

  return (
    normalize(vocabulary.word) === normalizedAnswer ||
    toHiragana(normalizedAnswer) ===
      toHiragana(normalize(vocabulary.reading))
  );
};
