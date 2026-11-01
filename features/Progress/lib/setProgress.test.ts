import { describe, expect, it } from 'vitest';

import {
  calculateKanjiSetProgress,
  calculateKanaSetProgressAndStars,
  calculateVocabularySetProgress,
  getCappedKanjiProgress,
  getCappedVocabularyMeaningProgress,
  getCappedVocabularyReadingProgress,
} from './setProgress';

describe('setProgress', () => {
  it('caps kanji progress at 10', () => {
    expect(getCappedKanjiProgress(250)).toBe(10);
  });

  it('caps vocabulary meaning progress at 5', () => {
    expect(getCappedVocabularyMeaningProgress(150)).toBe(5);
  });

  it('caps vocabulary reading progress at 5', () => {
    expect(getCappedVocabularyReadingProgress(175)).toBe(5);
  });

  it('calculates partial kanji set progress from capped totals', () => {
    expect(calculateKanjiSetProgress([{ correct: 3 }, { correct: 5 }])).toBe(
      0.4,
    );
  });

  it('calculates partial vocabulary set progress from separate meaning and reading caps', () => {
    expect(
      calculateVocabularySetProgress([
        { meaningCorrect: 3, readingCorrect: 5 },
        { meaningCorrect: 5, readingCorrect: 2 },
      ]),
    ).toBe(0.75);
  });

  it('returns 1 for a fully capped final short set', () => {
    expect(
      calculateVocabularySetProgress([
        { meaningCorrect: 5, readingCorrect: 5 },
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
