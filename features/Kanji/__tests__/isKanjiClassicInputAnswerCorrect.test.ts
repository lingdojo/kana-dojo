import { describe, expect, it } from 'vitest';
import n5Kanji from '@/public/data-kanji/N5.json';
import { getKanjiClassicInputTargets } from '@/features/Kanji/lib/getReadingAnswerForms';
import { isKanjiClassicInputAnswerCorrect } from '@/features/Kanji/lib/isKanjiClassicInputAnswerCorrect';

describe('isKanjiClassicInputAnswerCorrect', () => {
  it.each(['present', 'the present', '  PRESENT  '])(
    'accepts an optional article in a meaning answer: %s',
    inputValue => {
      expect(
        isKanjiClassicInputAnswerCorrect({
          inputValue,
          target: ['the present', 'いま'],
          isReverse: false,
        }),
      ).toBe(true);
    },
  );

  it('accepts typed dots for a meaning with an ellipsis', () => {
    expect(
      isKanjiClassicInputAnswerCorrect({
        inputValue: 'well then...',
        target: ['well then…'],
        isReverse: false,
      }),
    ).toBe(true);
  });

  it('preserves Classic Input reading answers', () => {
    expect(
      isKanjiClassicInputAnswerCorrect({
        inputValue: 'いま',
        target: ['the present', 'いま'],
        isReverse: false,
      }),
    ).toBe(true);
  });

  it('preserves compound meaning prefixes', () => {
    expect(
      isKanjiClassicInputAnswerCorrect({
        inputValue: 'point',
        target: ['to the point'],
        isReverse: false,
      }),
    ).toBe(false);
  });

  it('rejects an answer that normalizes to empty', () => {
    expect(
      isKanjiClassicInputAnswerCorrect({
        inputValue: '   ',
        target: [''],
        isReverse: false,
      }),
    ).toBe(false);
  });

  it('keeps reverse answers exact', () => {
    expect(
      isKanjiClassicInputAnswerCorrect({
        inputValue: 'emperor',
        target: 'the emperor',
        isReverse: true,
      }),
    ).toBe(false);
  });

  it.each(['manabu', 'まなぶ', 'gaku', 'ガク', 'study'])(
    'accepts %s for 学 with the targets built from the kanji data',
    inputValue => {
      const target = getKanjiClassicInputTargets(
        n5Kanji.find(kanji => kanji.kanjiChar === '学'),
      );

      expect(
        isKanjiClassicInputAnswerCorrect({
          inputValue,
          target,
          isReverse: false,
        }),
      ).toBe(true);
    },
  );
});
