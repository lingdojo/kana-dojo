export const KANJI_SET_PROGRESS_TARGET = 200;
export const VOCAB_MEANING_PROGRESS_TARGET = 100;
export const VOCAB_READING_PROGRESS_TARGET = 100;
export const VOCAB_SET_PROGRESS_TARGET_PER_WORD =
  VOCAB_MEANING_PROGRESS_TARGET + VOCAB_READING_PROGRESS_TARGET;

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
