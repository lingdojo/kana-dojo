import { describe, expect, it } from 'vitest';
import { flattenKanaGroups } from '@/features/Kana/lib/flattenKanaGroup';
import { getUniqueIncorrectOptions } from '@/features/Kana/lib/getUniqueIncorrectOptions';
import { kana } from '@/features/Kana/data/kana';

describe('Kana Quiz Option Generation Fixes (#28102)', () => {
  it('correctly maps KanaCharacter items without script overwriting when both Hiragana and Katakana are selected', () => {
    // Hiragana basic 'a' group is index 0 ('あ', 'い', 'う', 'え', 'お')
    // Katakana basic 'a' group is index 26 ('ア', 'イ', 'ウ', 'エ', 'オ')
    const items = flattenKanaGroups([0, 26]);
    expect(items.length).toBe(10);

    const hiraganaA = items.find(item => item.kana === 'あ');
    const katakanaA = items.find(item => item.kana === 'ア');

    expect(hiraganaA?.romaji).toBe('a');
    expect(katakanaA?.romaji).toBe('a');
    expect(hiraganaA?.kana).toBe('あ');
    expect(katakanaA?.kana).toBe('ア');
  });

  it('provides distractor fallback when the user selects a small Kana subset', () => {
    // Select group with 3 items: 'や', 'ゆ', 'よ' (group index 7)
    const selectedItems = flattenKanaGroups([7]);
    expect(selectedItems.length).toBe(3);

    const correctKanaChar = 'や';
    const primaryCandidates = selectedItems
      .filter(item => item.kana !== correctKanaChar)
      .map(item => item.kana);

    // Primary options only yield 2 candidates ('ゆ', 'よ')
    const primaryOptions = getUniqueIncorrectOptions(
      correctKanaChar,
      primaryCandidates,
      5,
    );
    expect(primaryOptions.length).toBe(2);

    // Fallback to all Kana items to achieve requested 5 distractors
    const allItems = flattenKanaGroups(kana.map((_, i) => i));
    const fallbackCandidates = allItems
      .filter(item => item.kana !== correctKanaChar)
      .map(item => item.kana);

    const fullOptions = getUniqueIncorrectOptions(
      correctKanaChar,
      [...primaryOptions, ...fallbackCandidates],
      5,
    );

    expect(fullOptions.length).toBe(5);
    expect(fullOptions).toContain('ゆ');
    expect(fullOptions).toContain('よ');
  });
});
