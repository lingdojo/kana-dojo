// Re-export the canonical Kanji type from entities to avoid duplication
export type { IKanjiObj as KanjiItem } from '@/entities/kanji/types';

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
