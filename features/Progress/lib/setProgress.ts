export const MAX_STARS_PER_SET = 3;

export const KANJI_SET_PROGRESS_TARGET = 10;
export const VOCAB_MEANING_PROGRESS_TARGET = 10;
export const VOCAB_READING_PROGRESS_TARGET = 10;
export const VOCAB_SET_PROGRESS_TARGET_PER_WORD =
  VOCAB_MEANING_PROGRESS_TARGET + VOCAB_READING_PROGRESS_TARGET;

export const KANJI_SET_PROGRESS_CAP =
  KANJI_SET_PROGRESS_TARGET * MAX_STARS_PER_SET;
export const VOCAB_MEANING_PROGRESS_CAP =
  VOCAB_MEANING_PROGRESS_TARGET * MAX_STARS_PER_SET;
export const VOCAB_READING_PROGRESS_CAP =
  VOCAB_READING_PROGRESS_TARGET * MAX_STARS_PER_SET;

export interface KanjiSetProgressEntry {
  correct: number;
}

export interface VocabularySetProgressEntry {
  meaningCorrect: number;
  readingCorrect: number;
}

export function getCappedKanjiProgress(correct: number): number {
  return Math.min(Math.max(0, correct), KANJI_SET_PROGRESS_TARGET);
}

export function getCappedVocabularyMeaningProgress(correct: number): number {
  return Math.min(Math.max(0, correct), VOCAB_MEANING_PROGRESS_TARGET);
}

export function getCappedVocabularyReadingProgress(correct: number): number {
  return Math.min(Math.max(0, correct), VOCAB_READING_PROGRESS_TARGET);
}

export function calculateKanjiSetProgress(
  entries: KanjiSetProgressEntry[],
): number {
  if (entries.length === 0) return 0;

  const earned = entries.reduce(
    (sum, entry) => sum + getCappedKanjiProgress(entry.correct),
    0,
  );

  return earned / (entries.length * KANJI_SET_PROGRESS_TARGET);
}

export function calculateVocabularySetProgress(
  entries: VocabularySetProgressEntry[],
): number {
  if (entries.length === 0) return 0;

  const earned = entries.reduce(
    (sum, entry) =>
      sum +
      getCappedVocabularyMeaningProgress(entry.meaningCorrect) +
      getCappedVocabularyReadingProgress(entry.readingCorrect),
    0,
  );

  return earned / (entries.length * VOCAB_SET_PROGRESS_TARGET_PER_WORD);
}

export function calculateKanjiSetProgressAndStars(
  entries: KanjiSetProgressEntry[],
): { progress: number; stars: number } {
  if (entries.length === 0) return { progress: 0, stars: 0 };

  const earned = entries.reduce(
    (sum, entry) =>
      sum + Math.min(Math.max(0, entry.correct), KANJI_SET_PROGRESS_CAP),
    0,
  );

  const cycleTarget = entries.length * KANJI_SET_PROGRESS_TARGET;
  const cappedEarned = Math.min(earned, cycleTarget * MAX_STARS_PER_SET);
  const stars = Math.min(
    Math.floor(cappedEarned / cycleTarget),
    MAX_STARS_PER_SET,
  );
  const progress =
    stars < MAX_STARS_PER_SET
      ? (cappedEarned - stars * cycleTarget) / cycleTarget
      : 1;

  return { progress, stars };
}

export function calculateVocabularySetProgressAndStars(
  entries: VocabularySetProgressEntry[],
): { progress: number; stars: number } {
  if (entries.length === 0) return { progress: 0, stars: 0 };

  const earned = entries.reduce(
    (sum, entry) =>
      sum +
      Math.min(Math.max(0, entry.meaningCorrect), VOCAB_MEANING_PROGRESS_CAP) +
      Math.min(Math.max(0, entry.readingCorrect), VOCAB_READING_PROGRESS_CAP),
    0,
  );

  const cycleTarget = entries.length * VOCAB_SET_PROGRESS_TARGET_PER_WORD;
  const cappedEarned = Math.min(earned, cycleTarget * MAX_STARS_PER_SET);
  const stars = Math.min(
    Math.floor(cappedEarned / cycleTarget),
    MAX_STARS_PER_SET,
  );
  const progress =
    stars < MAX_STARS_PER_SET
      ? (cappedEarned - stars * cycleTarget) / cycleTarget
      : 1;

  return { progress, stars };
}

