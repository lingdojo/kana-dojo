import { toHiragana } from 'wanakana';
import type { IVocabObj } from '@/entities/vocabulary';
import { normalizeAnswerValue } from '@/shared/utils/meanings';

/**
 * Some words appear more than once in the vocab data with the same kanji form
 * but a different reading (行く → いく / ゆく, 私 → わたし / わたくし).
 * The game only shows the kanji form, so any of those readings is a valid
 * answer. This attaches the full list of readings to every word object that
 * shares a displayed form.
 */
export const attachAlternateReadings = (words: IVocabObj[]): IVocabObj[] => {
  const readingsByWord = new Map<string, string[]>();

  for (const { word, reading } of words) {
    const readings = readingsByWord.get(word) ?? [];
    if (!readings.includes(reading)) readings.push(reading);
    readingsByWord.set(word, readings);
  }

  return words.map(wordObj => {
    const readings = readingsByWord.get(wordObj.word);
    return readings && readings.length > 1 ? { ...wordObj, readings } : wordObj;
  });
};

/**
 * Returns every reading accepted for a word: its own reading, any readings
 * attached by `attachAlternateReadings`, and readings of other entries in
 * `pool` with the same displayed form (covers objects cached before
 * `readings` existed).
 */
export const getAcceptedVocabularyReadings = (
  vocabulary: IVocabObj,
  pool: IVocabObj[] = [],
): string[] => {
  // Attached readings first so they keep the data order (行く → いく / ゆく).
  const accepted = new Set<string>(vocabulary.readings ?? []);
  accepted.add(vocabulary.reading);

  for (const other of pool) {
    if (other.word === vocabulary.word) accepted.add(other.reading);
  }

  return [...accepted].filter(Boolean);
};

export const isVocabularyReadingAnswerCorrect = (
  vocabulary: IVocabObj,
  answer: string,
  pool: IVocabObj[] = [],
): boolean => {
  const normalizedAnswer = normalizeAnswerValue(answer);
  if (!normalizedAnswer) return false;

  const answerAsHiragana = toHiragana(normalizedAnswer);

  return getAcceptedVocabularyReadings(vocabulary, pool).some(reading => {
    const normalizedReading = normalizeAnswerValue(reading);
    return (
      normalizedReading === normalizedAnswer ||
      toHiragana(normalizedReading) === answerAsHiragana
    );
  });
};
