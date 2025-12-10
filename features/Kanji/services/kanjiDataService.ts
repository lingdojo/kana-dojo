import type { IKanjiObj } from '@/features/Kanji/store/useKanjiStore';

type RawKanjiEntry = {
  id: number;
  kanjiChar: string;
  onyomi: string[];
  kunyomi: string[];
  displayMeanings: string[];
  fullDisplayMeanings: string[];
  meanings: string[];
};

type KanjiLevel = 'n5' | 'n4' | 'n3' | 'n2' | 'n1';

// Module-level cache - persists across component mounts
const kanjiCache: Partial<Record<KanjiLevel, IKanjiObj[]>> = {};
const pendingRequests: Partial<Record<KanjiLevel, Promise<IKanjiObj[]>>> = {};

export const kanjiDataService = {
  /**
   * Get kanji data for a specific level. Returns cached data if available,
   * otherwise fetches and caches it.
   */
  async getKanjiByLevel(level: KanjiLevel): Promise<IKanjiObj[]> {
    // Return cached data immediately if available
    if (kanjiCache[level]) {
      return kanjiCache[level];
    }

    // If there's already a pending request for this level, wait for it
    if (pendingRequests[level]) {
      return pendingRequests[level];
    }

    // Create new request and store the promise to prevent duplicate fetches
    pendingRequests[level] = fetch(`/kanji/${level.toUpperCase()}.json`)
      .then(res => res.json() as Promise<RawKanjiEntry[]>)
      .then(data => {
        const kanji = data.map(entry => ({ ...entry })) as IKanjiObj[];
        kanjiCache[level] = kanji;
        delete pendingRequests[level];
        return kanji;
      })
      .catch(err => {
        delete pendingRequests[level];
        throw err;
      });

    return pendingRequests[level];
  },

  /**
   * Preload all kanji levels in parallel (useful for initial load)
   */
  async preloadAll(): Promise<void> {
    const levels: KanjiLevel[] = ['n5', 'n4', 'n3', 'n2', 'n1'];
    await Promise.all(levels.map(level => this.getKanjiByLevel(level)));
  },

  /**
   * Check if a level is already cached
   */
  isCached(level: KanjiLevel): boolean {
    return !!kanjiCache[level];
  },

  /**
   * Get all cached data (for components that need all levels)
   */
  getAllCached(): Partial<Record<KanjiLevel, IKanjiObj[]>> {
    return { ...kanjiCache };
  },

  /**
   * Clear cache (useful for testing or forced refresh)
   */
  clearCache(): void {
    Object.keys(kanjiCache).forEach(key => {
      delete kanjiCache[key as KanjiLevel];
    });
  }
};

export type { KanjiLevel };
