export interface IKanjiObj {
  id: number;
  kanjiChar: string;
  onyomi: string[];
  kunyomi: string[];
  meanings: string[];
}

export type KanjiLevel = 'n5' | 'n4' | 'n3' | 'n2' | 'n1';
