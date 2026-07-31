export interface KanjiItem {
  id: number;
  kanjiChar: string;
  onyomi: string[];
  kunyomi: string[];
  meanings: string[];
}

export interface VocabItem {
  jmdict_seq: string;
  kana: string;
  kanji: string;
  waller_definition: string;
}

export interface SearchResult<T> {
  item: T;
  score: number;
}
