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

  it.each(['speak', 'Speak', 'to speak', '  TO   SPEAK  '])(
    'accepts optional infinitive prefix in meaning answer %s',
    answer => {
      const verb = { ...vocabulary, meanings: ['to speak'] };

      expect(isVocabularyMeaningAnswerCorrect(verb, answer, false)).toBe(true);
    },
  );

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
});
