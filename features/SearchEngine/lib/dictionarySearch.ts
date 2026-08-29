import { KanjiItem, VocabItem, SearchResult } from '../types';
import { calculateStringMatchScore } from './searchAlgorithm';

export function searchKanji(
  query: string,
  data: KanjiItem[],
): SearchResult<KanjiItem>[] {
  const normalizedQuery = query.toLowerCase().trim();
  if (!normalizedQuery) return [];

  const results: SearchResult<KanjiItem>[] = [];

  for (const item of data) {
    let bestScore = 0;

    // 1. Exact Kanji Match (Highest weight)
    if (item.kanjiChar === normalizedQuery) {
      bestScore = Math.max(bestScore, 100);
    }

    // 2. Meanings Match
    for (const meaning of item.meanings) {
      const score = calculateStringMatchScore(normalizedQuery, meaning);
      bestScore = Math.max(bestScore, score * 0.9);
    }

    // 3. Onyomi / Kunyomi Match
    // Note: The data format is like "nichi ニチ", so we check both parts
    const allYomi = [...item.onyomi, ...item.kunyomi];
    for (const yomi of allYomi) {
      const parts = yomi.split(' ');
      for (const part of parts) {
        const score = calculateStringMatchScore(normalizedQuery, part);
        bestScore = Math.max(bestScore, score * 0.8);
      }
    }

    if (bestScore > 0) {
      results.push({ item, score: bestScore });
    }
  }

  return results.sort((a, b) => b.score - a.score);
}

/**
 * @param toRomaji - Optional converter (e.g. wanakana.toRomaji) injected by the
 *   caller. Keeping this injectable makes the core module dependency-free.
 */
export function searchVocab(
  query: string,
  data: VocabItem[],
  toRomaji?: (kana: string) => string,
): SearchResult<VocabItem>[] {
  const normalizedQuery = query.toLowerCase().trim();
  if (!normalizedQuery) return [];

  const results: SearchResult<VocabItem>[] = [];

  for (const item of data) {
    let bestScore = 0;

    // 1. Exact Kanji Match
    if (item.kanji === normalizedQuery) {
      bestScore = Math.max(bestScore, 100);
    }

    // 2. Exact Kana Match
    if (item.kana === normalizedQuery) {
      bestScore = Math.max(bestScore, 90);
    } else if (item.kana.startsWith(normalizedQuery)) {
      bestScore = Math.max(bestScore, 70);
    } else if (item.kana.includes(normalizedQuery)) {
      bestScore = Math.max(bestScore, 40);
    }

    // 3. Meaning Match
    const meaningScore = calculateStringMatchScore(
      normalizedQuery,
      item.waller_definition,
    );
    bestScore = Math.max(bestScore, meaningScore * 0.9);

    // 4. Romaji Match — only if a converter is provided by the caller
    if (toRomaji) {
      const romaji = toRomaji(item.kana);
      const romajiScore = calculateStringMatchScore(normalizedQuery, romaji);
      bestScore = Math.max(bestScore, romajiScore * 0.8);
    }

    if (bestScore > 0) {
      results.push({ item, score: bestScore });
    }
  }

  return results.sort((a, b) => b.score - a.score);
}
