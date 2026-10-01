import { describe, expect, it } from 'vitest';
import type { IVocabObj } from '@/entities/vocabulary';
import { isVocabularyMeaningAnswerCorrect } from '@/features/Vocabulary/lib/isVocabularyMeaningAnswerCorrect';

const vocabulary = {
  word: 'アメリカ',
  reading: 'アメリカ',
  meanings: ['America', 'United States'],
} as IVocabObj;

describe('isVocabularyMeaningAnswerCorrect', () => {
  it('normalizes meaning case and whitespace', () => {
    expect(isVocabularyMeaningAnswerCorrect(vocabulary, ' america ', false)).toBe(
      true,
    );
  });

  it.each([' アメリカ ', 'amerika', 'あめりか'])(
    'accepts reverse answer %s without requiring an IME',
    answer => {
      expect(isVocabularyMeaningAnswerCorrect(vocabulary, answer, true)).toBe(
        true,
      );
    },
  );

  it.each(['', 'China', 'ameriko'])('rejects invalid answer %s', answer => {
    expect(isVocabularyMeaningAnswerCorrect(vocabulary, answer, true)).toBe(
      false,
    );
  });

  // Regression tests for issue #30972 — duplicate / alternate meanings in vocab quiz
  describe('alternate meanings (issue #30972)', () => {
    const coldWord = {
      word: '寒い',
      reading: 'さむい',
      meanings: ['cold', 'chilly'],
    } as IVocabObj;

    it.each(['cold', 'Cold', '  cold  ', 'chilly', 'Chilly'])(
      'accepts alternate meaning "%s" for 寒い',
      answer => {
        expect(
          isVocabularyMeaningAnswerCorrect(coldWord, answer, false),
        ).toBe(true);
      },
    );

    it('rejects wrong meaning for 寒い', () => {
      expect(
        isVocabularyMeaningAnswerCorrect(coldWord, 'hot', false),
      ).toBe(false);
    });

    // Two words that share an identical first meaning
    const word1 = {
      word: '好き',
      reading: 'すき',
      meanings: ['like', 'favourite'],
    } as IVocabObj;

    const word2 = {
      word: '好む',
      reading: 'このむ',
      meanings: ['like', 'prefer'],
    } as IVocabObj;

    it('accepts "like" for 好き even though 好む shares the same meaning', () => {
      expect(isVocabularyMeaningAnswerCorrect(word1, 'like', false)).toBe(true);
    });

    it('accepts "like" for 好む even though 好き shares the same meaning', () => {
      expect(isVocabularyMeaningAnswerCorrect(word2, 'like', false)).toBe(true);
    });
  });
});
