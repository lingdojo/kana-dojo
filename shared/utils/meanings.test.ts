import { describe, expect, it } from 'vitest';
import {
  normalizeAnswerValue,
  normalizeMeaningAnswer,
  splitDefinitionList,
} from '@/shared/utils/meanings';

describe('normalizeAnswerValue', () => {
  it('trims, lowercases, and applies NFC normalization', () => {
    expect(normalizeAnswerValue('  Ｈｅｌｌｏ  ')).toBe('ｈｅｌｌｏ');
  });
});

describe('normalizeMeaningAnswer', () => {
  it('folds the ellipsis character and runs of dots to "..."', () => {
    expect(normalizeMeaningAnswer('well then…')).toBe('well then...');
    expect(normalizeMeaningAnswer('well then...')).toBe('well then...');
    expect(normalizeMeaningAnswer('well then....')).toBe('well then...');
  });

  it('strips an optional leading article or infinitive', () => {
    expect(normalizeMeaningAnswer('a matter')).toBe('matter');
    expect(normalizeMeaningAnswer('to speak')).toBe('speak');
  });

  it('preserves compound prefixes that could change meaning', () => {
    expect(normalizeMeaningAnswer('to the point')).toBe('to the point');
  });
});

describe('splitDefinitionList', () => {
  it('splits on top-level commas and semicolons', () => {
    expect(splitDefinitionList('ogre,demon; spirit')).toEqual([
      'ogre',
      'demon',
      'spirit',
    ]);
  });

  it('does not split inside parentheses', () => {
    expect(splitDefinitionList('(conj,exp,int) Thank you')).toEqual([
      '(conj,exp,int) Thank you',
    ]);
    expect(
      splitDefinitionList('ogre,demon,it (i.e., in a game of tag)'),
    ).toEqual(['ogre', 'demon', 'it (i.e., in a game of tag)']);
  });

  it('drops empty pieces and tolerates unbalanced parentheses', () => {
    expect(splitDefinitionList(' a, ,b ')).toEqual(['a', 'b']);
    expect(splitDefinitionList('a), b')).toEqual(['a)', 'b']);
  });
});
