import { describe, expect, it } from 'vitest';

import {
  calculateKanjiSetProgress,
  calculateKanaSetProgressAndStars,
  calculateVocabularySetProgress,
  getCappedKanjiProgress,
  getCappedVocabularyMeaningProgress,
  getCappedVocabularyReadingProgress,
  KANJI_SET_PROGRESS_TARGET,
  VOCAB_MEANING_PROGRESS_TARGET,
  VOCAB_READING_PROGRESS_TARGET,
} from './setProgress';

describe('setProgress', () => {
  it('caps kanji progress at the configured target', () => {
    expect(getCappedKanjiProgress(KANJI_SET_PROGRESS_TARGET + 250)).toBe(
      KANJI_SET_PROGRESS_TARGET,
    );
  });

  it('caps vocabulary meaning progress at the configured target', () => {
    expect(
      getCappedVocabularyMeaningProgress(VOCAB_MEANING_PROGRESS_TARGET + 150),
    ).toBe(VOCAB_MEANING_PROGRESS_TARGET);
  });

  it('caps vocabulary reading progress at the configured target', () => {
    expect(
      getCappedVocabularyReadingProgress(VOCAB_READING_PROGRESS_TARGET + 175),
    ).toBe(VOCAB_READING_PROGRESS_TARGET);
  });

  it('calculates partial kanji set progress from capped totals', () => {
    const halfTarget = KANJI_SET_PROGRESS_TARGET / 2;

    expect(
      calculateKanjiSetProgress([
        { correct: halfTarget },
        { correct: halfTarget },
      ]),
    ).toBe(0.5);
  });

  it('caps over-target kanji answers before calculating progress', () => {
    expect(
      calculateKanjiSetProgress([
        { correct: KANJI_SET_PROGRESS_TARGET * 10 },
        { correct: 0 },
      ]),
    ).toBe(0.5);
  });

  it('calculates partial vocabulary set progress from separate meaning and reading targets', () => {
    expect(
      calculateVocabularySetProgress([
        {
          meaningCorrect: VOCAB_MEANING_PROGRESS_TARGET / 2,
          readingCorrect: VOCAB_READING_PROGRESS_TARGET,
        },
        {
          meaningCorrect: VOCAB_MEANING_PROGRESS_TARGET,
          readingCorrect: VOCAB_READING_PROGRESS_TARGET / 2,
        },
      ]),
    ).toBe(0.75);
  });

  it('returns 1 for a fully capped final short set', () => {
    expect(
      calculateVocabularySetProgress([
        {
          meaningCorrect: VOCAB_MEANING_PROGRESS_TARGET,
          readingCorrect: VOCAB_READING_PROGRESS_TARGET,
        },
      ]),
    ).toBe(1);
  });

  it('calculates Kana progress across three mastery cycles', () => {
    expect(
      calculateKanaSetProgressAndStars([{ correct: 75 }, { correct: 75 }]),
    ).toEqual({ progress: 0.5, stars: 1 });
    expect(
      calculateKanaSetProgressAndStars([{ correct: 150 }, { correct: 150 }]),
    ).toEqual({ progress: 1, stars: 3 });
  });
});
