import { describe, expect, it } from 'vitest';
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

  it('keeps reverse answers exact', () => {
    expect(
      isKanjiClassicInputAnswerCorrect({
        inputValue: 'emperor',
        target: 'the emperor',
        isReverse: true,
      }),
    ).toBe(false);
  });
});
