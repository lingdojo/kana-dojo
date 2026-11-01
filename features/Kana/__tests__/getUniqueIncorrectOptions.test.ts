import { describe, expect, it } from 'vitest';
import { getUniqueIncorrectOptions } from '@/features/Kana/lib/getUniqueIncorrectOptions';

describe('getUniqueIncorrectOptions', () => {
  it('excludes every distractor that renders like the correct answer', () => {
    expect(
      getUniqueIncorrectOptions('ji', ['ji', 'ka', 'ji', 'zu'], 3),
    ).toEqual(['ka', 'zu']);
  });

  it('deduplicates shared ji and zu distractors', () => {
    expect(
      getUniqueIncorrectOptions(
        'ka',
        ['ji', 'ji', 'zu', 'zu', 'shi', 'chi'],
        4,
      ),
    ).toEqual(['ji', 'zu', 'shi', 'chi']);
  });

  it('preserves candidate order and respects the requested count', () => {
    expect(
      getUniqueIncorrectOptions('あ', ['い', 'う', 'え', 'お'], 3),
    ).toEqual(['い', 'う', 'え']);
  });

  it('returns fewer options when the pool lacks enough unique labels', () => {
    expect(getUniqueIncorrectOptions('zu', ['ji', 'ji', 'zu'], 4)).toEqual([
      'ji',
    ]);
  });
});
