import { describe, expect, it } from 'vitest';

import { kana } from '../data/kana';
import {
  getKanaAutoLearningGroups,
  normalizeKanaReviewCursor,
} from './getKanaAutoLearningGroups';

describe('getKanaAutoLearningGroups', () => {
  it('filters katakana groups and preserves their original indices', () => {
    const katakana = getKanaAutoLearningGroups(kana.slice(0, 60), 'katakana');

    expect(katakana.length).toBeGreaterThan(0);
    expect(
      katakana.every(({ group }) => group.groupName.startsWith('k.')),
    ).toBe(true);
    expect(katakana[0].group.groupName).toBe('k.b.a');
    expect(katakana[0].index).toBe(26);
    expect(katakana[0].index).not.toBe(0);
    expect(
      katakana.every(({ group, index }) => kana.slice(0, 60)[index] === group),
    ).toBe(true);
  });

  it('filters hiragana groups and preserves their original indices', () => {
    const hiragana = getKanaAutoLearningGroups(kana.slice(0, 60), 'hiragana');

    expect(hiragana.length).toBeGreaterThan(0);
    expect(
      hiragana.every(({ group }) => group.groupName.startsWith('h.')),
    ).toBe(true);
    expect(hiragana[0].group.groupName).toBe('h.b.a');
    expect(hiragana[0].index).toBe(0);
    expect(
      hiragana.every(({ group, index }) => kana.slice(0, 60)[index] === group),
    ).toBe(true);
  });

  it('normalizes review cursor to the filtered list length', () => {
    expect(normalizeKanaReviewCursor(99, 10)).toBe(9);
    expect(normalizeKanaReviewCursor(5, 0)).toBe(0);
  });
});
