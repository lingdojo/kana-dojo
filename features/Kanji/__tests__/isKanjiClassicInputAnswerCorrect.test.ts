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

  it('accepts Hepburn and kana forms of a stored reading', () => {
    const readings = ['nyuu ニュウ'];

    expect(
      isKanjiClassicInputAnswerCorrect({
        inputValue: 'nyū',
        target: ['milk'],
        readings,
        isReverse: false,
      }),
    ).toBe(true);
    expect(
      isKanjiClassicInputAnswerCorrect({
        inputValue: 'ニュウ',
        target: ['milk'],
        readings,
        isReverse: false,
      }),
    ).toBe(true);
    expect(
      isKanjiClassicInputAnswerCorrect({
        inputValue: 'nyuu',
        target: ['milk'],
        readings,
        isReverse: false,
      }),
    ).toBe(true);
  });

  it('accepts Nyuga for the on-yomi of 乳', () => {
    expect(
      isKanjiClassicInputAnswerCorrect({
        inputValue: 'Nyuga',
        target: ['milk', 'breasts'],
        readings: ['chichi ちち', 'chi ち', 'nyuu ニュウ'],
        isReverse: false,
      }),
    ).toBe(true);
    expect(
      isKanjiClassicInputAnswerCorrect({
        inputValue: 'nyuga',
        target: ['milk', 'breasts'],
        readings: ['chichi ちち', 'chi ち', 'nyuu ニュウ'],
        isReverse: false,
      }),
    ).toBe(true);
  });

  it('does not convert an English meaning into kana', () => {
    expect(
      isKanjiClassicInputAnswerCorrect({
        inputValue: 'の',
        target: ['no'],
        readings: ['mu む'],
        isReverse: false,
      }),
    ).toBe(false);
    expect(
      isKanjiClassicInputAnswerCorrect({
        inputValue: 'じゃぱん',
        target: ['Japan'],
        readings: ['nichi ニチ'],
        isReverse: false,
      }),
    ).toBe(false);
    expect(
      isKanjiClassicInputAnswerCorrect({
        inputValue: 'no',
        target: ['no'],
        readings: ['mu む'],
        isReverse: false,
      }),
    ).toBe(true);
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
