import { describe, expect, it } from 'vitest';
import type { IVocabObj } from '@/entities/vocabulary';
import { isVocabularyMeaningAnswerCorrect } from '@/features/Vocabulary/lib/isVocabularyMeaningAnswerCorrect';

const vocabulary = {
  word: 'アメリカ',
  reading: 'アメリカ',
  meanings: ['America', 'United States'],
} as IVocabObj;

describe('isVocabularyMeaningAnswerCorrect', () => {
  it.each(['well then...', 'well then…', 'Well then...', 'well then....'])(
    'accepts %s when the stored meaning uses an ellipsis',
    answer => {
      const phrase = { ...vocabulary, meanings: ['well then…'] };

      expect(isVocabularyMeaningAnswerCorrect(phrase, answer, false)).toBe(true);
    },
  );

  it('accepts a typed ellipsis character when the stored meaning uses dots', () => {
    const phrase = { ...vocabulary, meanings: ['well then...'] };

    expect(isVocabularyMeaningAnswerCorrect(phrase, 'well then…', false)).toBe(
      true,
    );
  });

  it('normalizes meaning case and whitespace', () => {
    expect(isVocabularyMeaningAnswerCorrect(vocabulary, ' america ', false)).toBe(
      true,
    );
  });

  it.each(['speak', 'Speak', 'to speak', '  TO   SPEAK  '])(
    'accepts optional infinitive prefix in meaning answer %s',
    answer => {
      const verb = { ...vocabulary, meanings: ['to speak'] };

      expect(isVocabularyMeaningAnswerCorrect(verb, answer, false)).toBe(true);
    },
  );

  it.each(['matter', 'Matter', 'a matter', '  A   MATTER  '])(
    'accepts optional leading article in meaning answer %s',
    answer => {
      const noun = { ...vocabulary, meanings: ['a matter'] };

      expect(isVocabularyMeaningAnswerCorrect(noun, answer, false)).toBe(true);
    },
  );

  it.each([
    ['an apple', 'apple'],
    ['the dead', 'dead'],
    ['a light', 'a light'],
  ])('accepts the bare form %s answered as %s', (meaning, answer) => {
    const noun = { ...vocabulary, meanings: [meaning] };

    expect(isVocabularyMeaningAnswerCorrect(noun, answer, false)).toBe(true);
  });

  it('preserves compound prefixes whose removal could change meaning', () => {
    const phrase = { ...vocabulary, meanings: ['to the point'] };

    expect(isVocabularyMeaningAnswerCorrect(phrase, 'to the point', false)).toBe(
      true,
    );
    expect(isVocabularyMeaningAnswerCorrect(phrase, 'point', false)).toBe(false);

    const spacedPhrase = { ...vocabulary, meanings: ['to   the point'] };
    expect(isVocabularyMeaningAnswerCorrect(spacedPhrase, 'point', false)).toBe(
      false,
    );
  });

  it('does not strip a bare word that merely starts with an article', () => {
    const noun = { ...vocabulary, meanings: ['another place'] };

    expect(isVocabularyMeaningAnswerCorrect(noun, 'other place', false)).toBe(
      false,
    );
  });

  it('does not remove a leading article from reverse answers', () => {
    const articleWord = {
      ...vocabulary,
      word: 'the emperor',
      reading: 'the emperor',
    };

    expect(isVocabularyMeaningAnswerCorrect(articleWord, 'emperor', true)).toBe(
      false,
    );
  });

  it('does not remove an infinitive prefix from reverse answers', () => {
    const prefixedWord = {
      ...vocabulary,
      word: 'to speak',
      reading: 'to speak',
    };

    expect(
      isVocabularyMeaningAnswerCorrect(prefixedWord, 'speak', true),
    ).toBe(false);
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
