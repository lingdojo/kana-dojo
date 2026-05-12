import { describe, expect, it } from 'vitest';

import {
  calculateKanjiSetProgress,
  calculateVocabularySetProgress,
  getCappedKanjiProgress,
  getCappedVocabularyMeaningProgress,
  getCappedVocabularyReadingProgress,
} from './setProgress';

describe('setProgress', () => {
  it('caps kanji progress at 200', () => {
    expect(getCappedKanjiProgress(250)).toBe(200);
  });

  it('caps vocabulary meaning progress at 100', () => {
    expect(getCappedVocabularyMeaningProgress(150)).toBe(100);
  });

  it('caps vocabulary reading progress at 100', () => {
    expect(getCappedVocabularyReadingProgress(175)).toBe(100);
  });

  it('calculates partial kanji set progress from capped totals', () => {
    expect(
      calculateKanjiSetProgress([{ correct: 50 }, { correct: 210 }]),
    ).toBe(0.625);
  });

  it('calculates partial vocabulary set progress from separate meaning and reading caps', () => {
    expect(
      calculateVocabularySetProgress([
        { meaningCorrect: 40, readingCorrect: 90 },
        { meaningCorrect: 120, readingCorrect: 30 },
      ]),
    ).toBe(0.65);
  });

  it('returns 1 for a fully capped final short set', () => {
    expect(
      calculateVocabularySetProgress([
        { meaningCorrect: 100, readingCorrect: 100 },
      ]),
    ).toBe(1);
  });
});
