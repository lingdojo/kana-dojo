import { describe, expect, it } from 'vitest';
import type { IKanjiObj } from '@/entities/kanji';
import { isKanjiAnswerCorrect } from '@/features/Kanji/lib/isKanjiAnswerCorrect';

const kanji = {
  kanjiChar: '漢',
  meanings: ['China', 'Sino-'],
  kunyomi: ['から'],
  onyomi: ['カン kan'],
} as IKanjiObj;

describe('isKanjiAnswerCorrect', () => {
  it('normalizes meaning case and whitespace', () => {
    expect(isKanjiAnswerCorrect(kanji, ' china ', false)).toBe(true);
  });

  it.each(['speak', 'Speak', 'to speak', '  TO   SPEAK  '])(
    'accepts optional infinitive prefix in meaning answer %s',
    answer => {
      const verb = { ...kanji, meanings: ['to speak'] };

      expect(isKanjiAnswerCorrect(verb, answer, false)).toBe(true);
    },
  );

  it.each(['emperor', 'Emperor', 'the emperor', '  THE   EMPEROR  '])(
    'accepts optional leading article in meaning answer %s',
    answer => {
      const noun = { ...kanji, meanings: ['the emperor'] };

      expect(isKanjiAnswerCorrect(noun, answer, false)).toBe(true);
    },
  );

  it.each([
    ['a koto', 'koto'],
    ['an official rank', 'official rank'],
    ['the present', 'present'],
    ['a while', 'a while'],
  ])('accepts the bare form %s answered as %s', (meaning, answer) => {
    const noun = { ...kanji, meanings: [meaning] };

    expect(isKanjiAnswerCorrect(noun, answer, false)).toBe(true);
  });

  it('preserves compound prefixes whose removal could change meaning', () => {
    const verb = { ...kanji, meanings: ['to the point'] };

    expect(isKanjiAnswerCorrect(verb, 'to the point', false)).toBe(true);
    expect(isKanjiAnswerCorrect(verb, 'point', false)).toBe(false);

    const spacedVerb = { ...kanji, meanings: ['to   the point'] };
    expect(isKanjiAnswerCorrect(spacedVerb, 'point', false)).toBe(false);
  });

  it.each(['another place', 'antique'])(
    'does not strip a bare word that merely starts with an article: %s',
    meaning => {
      const noun = { ...kanji, meanings: [meaning] };

      expect(isKanjiAnswerCorrect(noun, meaning.slice(2), false)).toBe(false);
    },
  );

  it('does not remove a leading article from reverse answers', () => {
    const articleReading = {
      ...kanji,
      kanjiChar: 'the emperor',
      kunyomi: [],
      onyomi: [],
    };

    expect(isKanjiAnswerCorrect(articleReading, 'emperor', true)).toBe(false);
  });

  it('does not remove an infinitive prefix from reverse answers', () => {
    const prefixedReading = {
      ...kanji,
      kanjiChar: 'to speak',
      kunyomi: [],
      onyomi: [],
    };

    expect(isKanjiAnswerCorrect(prefixedReading, 'speak', true)).toBe(false);
  });

  it.each([' 漢 ', ' から ', ' カン '])(
    'normalizes reverse answer %s',
    answer => {
      expect(isKanjiAnswerCorrect(kanji, answer, true)).toBe(true);
    },
  );

  it.each(['', 'China', 'かん'])('rejects invalid reverse answer %s', answer => {
    expect(isKanjiAnswerCorrect(kanji, answer, true)).toBe(false);
  });
});
