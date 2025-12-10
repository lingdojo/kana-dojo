import { kana } from '../data/kana';

export type KanaCharacter = {
  kana: string;
  romaji: string;
  group: string;
};

export function flattenKanaGroups(indices: number[]): KanaCharacter[] {
  return indices.flatMap(i => {
    const group = kana[i];
    if (!group) return [];
    return group.kana.map((char, idx) => ({
      kana: char,
      romaji: group.romanji[idx],
      group: group.groupName
    }));
  });
}
