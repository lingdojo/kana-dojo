export interface IVocabObj {
  word: string;
  reading: string;
  meanings: string[];
  /**
   * Every reading listed for this word's kanji form in the same level,
   * e.g. 行く → ['いく', 'ゆく']. Optional so older cached objects still work.
   */
  readings?: string[];
}

export type VocabLevel = 'n5' | 'n4' | 'n3' | 'n2' | 'n1';
