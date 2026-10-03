import { describe, expect, it } from 'vitest';
import { getKanaTileDistractorPool } from '@/features/Kana/lib/getKanaTileDistractorPool';

// The しゃ and シャ groups carry the same three readings, which is what makes
// a romaji prompt ambiguous once both are selected.
const kanaToRomaji: Record<string, string> = {
  しゃ: 'sha',
  しゅ: 'shu',
  しょ: 'sho',
  シャ: 'sha',
  シュ: 'shu',
  ショ: 'sho',
};
const allKana = Object.keys(kanaToRomaji);

describe('getKanaTileDistractorPool', () => {
  it('drops the other script for the prompted reading', () => {
    expect(getKanaTileDistractorPool(allKana, ['shu'], kanaToRomaji)).toEqual([
      'しゃ',
      'しょ',
      'シャ',
      'ショ',
    ]);
  });

  it('drops every reading in a multi-character prompt', () => {
    expect(
      getKanaTileDistractorPool(allKana, ['shu', 'sho'], kanaToRomaji),
    ).toEqual(['しゃ', 'シャ']);
  });

  it('leaves a single-script selection untouched', () => {
    const hiraganaOnly = ['しゃ', 'しゅ', 'しょ'];
    expect(
      getKanaTileDistractorPool(hiraganaOnly, ['sha'], kanaToRomaji),
    ).toEqual(['しゅ', 'しょ']);
  });

  it('keeps candidates with no known reading rather than silently dropping them', () => {
    expect(getKanaTileDistractorPool(['ヷ'], ['shu'], kanaToRomaji)).toEqual([
      'ヷ',
    ]);
  });
});
