import { describe, it, expect } from 'vitest';
import { searchKanji, searchVocab } from '../lib/dictionarySearch';
import { KanjiItem, VocabItem } from '../types';

describe('dictionarySearch', () => {
  describe('searchKanji', () => {
    const mockKanjiData: KanjiItem[] = [
      {
        id: 1,
        kanjiChar: '日',
        onyomi: ['nichi ニチ', 'jitsu ジツ'],
        kunyomi: ['hi ひ', '-bi -び'],
        meanings: ['day', 'sun', 'Japan'],
      },
      {
        id: 2,
        kanjiChar: '月',
        onyomi: ['getsu ゲツ', 'gatsu ガツ'],
        kunyomi: ['tsuki つき'],
        meanings: ['moon', 'month'],
      },
    ];

    it('finds exact kanji match with highest score', () => {
      const results = searchKanji('日', mockKanjiData);
      expect(results).toHaveLength(1);
      expect(results[0].item.kanjiChar).toBe('日');
      expect(results[0].score).toBe(100);
    });

    it('finds match by english meaning', () => {
      const results = searchKanji('moon', mockKanjiData);
      expect(results).toHaveLength(1);
      expect(results[0].item.kanjiChar).toBe('月');
      // Meaning match is score 100 * 0.9 = 90
      expect(results[0].score).toBe(90);
    });

    it('finds match by romaji reading', () => {
      const results = searchKanji('nichi', mockKanjiData);
      expect(results).toHaveLength(1);
      expect(results[0].item.kanjiChar).toBe('日');
      // Romaji exact match inside the reading parts: score 100 * 0.8 = 80
      expect(results[0].score).toBe(80);
    });

    it('returns empty array for no match', () => {
      const results = searchKanji('xyz', mockKanjiData);
      expect(results).toHaveLength(0);
    });
  });

  describe('searchVocab', () => {
    const mockVocabData: VocabItem[] = [
      {
        jmdict_seq: '1',
        kana: 'あう',
        kanji: '会う',
        waller_definition: 'to meet',
      },
      {
        jmdict_seq: '2',
        kana: 'あお',
        kanji: '青',
        waller_definition: 'blue (noun)',
      },
    ];

    it('finds exact kanji match with highest score', () => {
      const results = searchVocab('会う', mockVocabData);
      expect(results).toHaveLength(1);
      expect(results[0].item.kanji).toBe('会う');
      expect(results[0].score).toBe(100);
    });

    it('finds exact kana match', () => {
      const results = searchVocab('あお', mockVocabData);
      expect(results).toHaveLength(1);
      expect(results[0].item.kanji).toBe('青');
      // Exact kana match = 90
      expect(results[0].score).toBe(90);
    });

    it('finds match by english meaning word', () => {
      const results = searchVocab('meet', mockVocabData);
      expect(results).toHaveLength(1);
      expect(results[0].item.kanji).toBe('会う');
      // Word match inside definition: 70 * 0.9 = 63
      expect(results[0].score).toBe(63);
    });

    it('finds match by romaji', () => {
      const results = searchVocab('ao', mockVocabData);
      expect(results).toHaveLength(1);
      expect(results[0].item.kanji).toBe('青');
      // Romaji match: 100 * 0.8 = 80
      expect(results[0].score).toBe(80);
    });
  });
});
