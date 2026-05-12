import { describe, expect, it } from 'vitest';
import { evaluateKanaAdaptivePositions } from './evaluateKanaAdaptivePositions';

describe('evaluateKanaAdaptivePositions', () => {
  it('marks non-reverse positions with partial correctness and ignores extra suffix', () => {
    const result = evaluateKanaAdaptivePositions({
      promptChars: ['し', 'ん', 'ぶ'],
      answerParts: ['shi', 'n', 'bu'],
      inputValue: 'shinxxextra',
      isReverse: false,
      altRomanjiMap: new Map([['し', ['si']]]),
    });

    expect(result).toEqual([true, true, false]);
  });

  it('accepts alternate romanization for the matched position', () => {
    const result = evaluateKanaAdaptivePositions({
      promptChars: ['し', 'ぶ'],
      answerParts: ['shi', 'bu'],
      inputValue: 'sibu',
      isReverse: false,
      altRomanjiMap: new Map([['し', ['si']]]),
    });

    expect(result).toEqual([true, true]);
  });

  it('scores reverse mode per character overlap with missing positions as wrong', () => {
    const result = evaluateKanaAdaptivePositions({
      promptChars: ['ka', 'ki', 'ku'],
      answerParts: ['か', 'き', 'く'],
      inputValue: 'かx',
      isReverse: true,
      altRomanjiMap: new Map(),
    });

    expect(result).toEqual([true, false, false]);
  });
});
