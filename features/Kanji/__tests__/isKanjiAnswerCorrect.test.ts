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
