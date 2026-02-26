import { describe, expect, it } from 'vitest';
import { isKanaInputAnswerCorrect } from '@/features/Kana/lib/isKanaInputAnswerCorrect';

const altRomanjiMap = new Map<string, string[]>([
  ['し', ['si']],
  ['ち', ['ti']],
  ['つ', ['tu']],
  ['ふ', ['hu']],
  ['ん', ['nn']],
  ['シ', ['si']],
  ['チ', ['ti']],
  ['ツ', ['tu']],
  ['フ', ['hu']],
  ['ン', ['nn']],
]);

describe('isKanaInputAnswerCorrect', () => {
  it('accepts primary romaji in normal mode', () => {
    expect(
      isKanaInputAnswerCorrect({
        inputValue: 'shi',
        correctChar: 'し',
        targetChar: 'shi',
        isReverse: false,
        altRomanjiMap,
      }),
    ).toBe(true);
  });

  it('accepts alternative romaji in normal mode', () => {
    expect(
      isKanaInputAnswerCorrect({
        inputValue: 'si',
        correctChar: 'し',
        targetChar: 'shi',
        isReverse: false,
        altRomanjiMap,
      }),
    ).toBe(true);
  });

  it('accepts nn for both hiragana and katakana n', () => {
    expect(
      isKanaInputAnswerCorrect({
        inputValue: 'nn',
        correctChar: 'ん',
        targetChar: 'n',
        isReverse: false,
        altRomanjiMap,
      }),
    ).toBe(true);

    expect(
      isKanaInputAnswerCorrect({
        inputValue: 'nn',
        correctChar: 'ン',
        targetChar: 'n',
        isReverse: false,
        altRomanjiMap,
      }),
    ).toBe(true);
  });

  it('rejects incorrect answers in normal mode', () => {
    expect(
      isKanaInputAnswerCorrect({
        inputValue: 'su',
        correctChar: 'し',
        targetChar: 'shi',
        isReverse: false,
        altRomanjiMap,
      }),
    ).toBe(false);
  });

  it('accepts only exact kana in reverse mode', () => {
    expect(
      isKanaInputAnswerCorrect({
        inputValue: 'し',
        correctChar: 'shi',
        targetChar: 'し',
        isReverse: true,
        altRomanjiMap,
      }),
    ).toBe(true);

    expect(
      isKanaInputAnswerCorrect({
        inputValue: ' シ ',
        correctChar: 'shi',
        targetChar: 'し',
        isReverse: true,
        altRomanjiMap,
      }),
    ).toBe(false);
  });
});
