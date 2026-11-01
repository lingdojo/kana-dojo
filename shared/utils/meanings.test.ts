import { describe, expect, it } from 'vitest';
import {
  normalizeAnswerValue,
  normalizeMeaningAnswer,
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
