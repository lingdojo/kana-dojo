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

  it.each([' 漢 ', ' から ', ' カン '])(
    'normalizes reverse answer %s',
    answer => {
      expect(isKanjiAnswerCorrect(kanji, answer, true)).toBe(true);
    },
  );

  it.each(['', 'China', 'かん'])('rejects invalid reverse answer %s', answer => {
    expect(isKanjiAnswerCorrect(kanji, answer, true)).toBe(false);
  });

  // Regression tests for issue #27873 — alternate acceptable answers in type mode
  describe('alternate meanings (issue #27873)', () => {
    const akiKanji = {
      kanjiChar: '秋',
      meanings: ['autumn', 'fall'],
      kunyomi: ['aki あき'],
      onyomi: ['shuu シュウ'],
    } as IKanjiObj;

    it.each(['autumn', 'fall', 'Autumn', 'Fall', '  fall  '])(
      'accepts alternate meaning "%s" for 秋',
      answer => {
        expect(isKanjiAnswerCorrect(akiKanji, answer, false)).toBe(true);
      },
    );

    it('rejects wrong answers for 秋', () => {
      expect(isKanjiAnswerCorrect(akiKanji, 'spring', false)).toBe(false);
      expect(isKanjiAnswerCorrect(akiKanji, '', false)).toBe(false);
    });
  });

  // "to " prefix normalization — ensures "to enter" and "enter" are treated identically
  describe('"to " prefix stripping', () => {
    const enterKanji = {
      kanjiChar: '入',
      meanings: ['enter', 'to enter', 'insert', 'to insert'],
      kunyomi: ['hairu はいる'],
      onyomi: ['nyuu ニュウ'],
    } as IKanjiObj;

    it.each(['enter', 'to enter', 'Enter', 'To Enter'])(
      'accepts "%s" for 入',
      answer => {
        expect(isKanjiAnswerCorrect(enterKanji, answer, false)).toBe(true);
      },
    );
  });
});

