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
});
