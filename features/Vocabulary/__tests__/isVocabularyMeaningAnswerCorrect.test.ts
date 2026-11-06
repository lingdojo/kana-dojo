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

      expect(isVocabularyMeaningAnswerCorrect(phrase, answer, false)).toBe(
        true,
      );
    },
  );

  it('accepts a typed ellipsis character when the stored meaning uses dots', () => {
    const phrase = { ...vocabulary, meanings: ['well then...'] };

    expect(isVocabularyMeaningAnswerCorrect(phrase, 'well then…', false)).toBe(
      true,
    );
  });

  it('normalizes meaning case and whitespace', () => {
    expect(
      isVocabularyMeaningAnswerCorrect(vocabulary, ' america ', false),
    ).toBe(true);
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

    expect(
      isVocabularyMeaningAnswerCorrect(phrase, 'to the point', false),
    ).toBe(true);
    expect(isVocabularyMeaningAnswerCorrect(phrase, 'point', false)).toBe(
      false,
    );

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

    expect(isVocabularyMeaningAnswerCorrect(prefixedWord, 'speak', true)).toBe(
      false,
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

  describe('reverse answers shared by several entries', () => {
    const overThere: IVocabObj[] = [
      { word: 'あそこ', reading: 'あそこ', meanings: ['over there'] },
      { word: 'あっち', reading: 'あっち', meanings: ['over there'] },
      { word: 'そちら', reading: 'そちら', meanings: ['over there'] },
      { word: 'そっち', reading: 'そっち', meanings: ['over there'] },
      { word: '向こう', reading: 'むこう', meanings: ['over there'] },
    ] as IVocabObj[];

    const [asoko] = overThere;

    it.each(['あそこ', 'あっち', 'そちら', 'そっち', '向こう', 'むこう'])(
      'accepts %s when the question displays a meaning they all share',
      answer => {
        expect(
          isVocabularyMeaningAnswerCorrect(asoko, answer, true, overThere),
        ).toBe(true);
      },
    );

    it('still rejects an entry that does not carry the displayed meaning', () => {
      const session = [...overThere, vocabulary];

      expect(
        isVocabularyMeaningAnswerCorrect(asoko, 'アメリカ', true, session),
      ).toBe(false);
    });

    it('accepts the displayed entry when no session pool is supplied', () => {
      expect(isVocabularyMeaningAnswerCorrect(asoko, 'あそこ', true)).toBe(
        true,
      );
    });

    it('rejects a synonym when no session pool is supplied', () => {
      expect(isVocabularyMeaningAnswerCorrect(asoko, 'あっち', true)).toBe(
        false,
      );
    });

    it('matches a shared meaning that is not the first meaning of the candidate', () => {
      const thatWay = {
        word: 'あちら',
        reading: 'あちら',
        meanings: ['that way', 'over there'],
      } as IVocabObj;

      expect(
        isVocabularyMeaningAnswerCorrect(asoko, 'あちら', true, [thatWay]),
      ).toBe(true);
    });

    it('does not widen normal mode, where only the shown entry counts', () => {
      expect(
        isVocabularyMeaningAnswerCorrect(asoko, 'over there', false, overThere),
      ).toBe(true);
      expect(
        isVocabularyMeaningAnswerCorrect(asoko, 'America', false, overThere),
      ).toBe(false);
    });
  });
});
