import { toHiragana } from 'wanakana';
import type { IVocabObj } from '@/entities/vocabulary';
import {
  normalizeAnswerValue,
  normalizeMeaningAnswer,
} from '@/shared/utils/meanings';

/**
 * wanakana romanizes a bare "n" before a vowel as the na/nu/no series (and
 * before "y" as にゃ/にゅ/にょ), so a ん mora that precedes a vowel-initial
 * syllable can only be typed with an apostrophe ("kinyoubi" → "kin'youbi").
 * Learners typing romaji without an IME don't add those apostrophes, which
 * silently changes ん into に/にょ. Inserting the apostrophe in exactly the
 * ambiguous position (vowel + "n" + vowel) makes the spelling compare equal
 * to the reading, matching what an IME would produce.
 */
export const insertAmbiguousMoraNApostrophe = (value: string): string =>
  value.replace(/([aeiou])n(?=[aeiouy])/gi, "$1n'");

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

  const readingInHiragana = toHiragana(
    normalizeAnswerValue(vocabulary.reading),
  );

  return (
    normalizeAnswerValue(vocabulary.word) === normalizedAnswer ||
    toHiragana(normalizedAnswer) === readingInHiragana ||
    toHiragana(insertAmbiguousMoraNApostrophe(normalizedAnswer)) ===
      readingInHiragana
  );
};
