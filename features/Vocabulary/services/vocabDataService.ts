import { IWord } from '@/shared/types/interfaces';
import {
  useVocabCacheStore,
  type VocabLevel,
} from '@/features/Vocabulary/store/useVocabCacheStore';

type RawVocabEntry = {
  jmdict_seq: string;
  kana: string;
  kanji: string;
  waller_definition: string;
};

const toWordObj = (entry: RawVocabEntry): IWord => {
  const definitionPieces = entry.waller_definition
    .split(/[;,]/)
    .map(piece => piece.trim())
    .filter(Boolean);

  return {
    word: entry.kanji?.trim() || entry.kana,
    reading: `${entry.kana}`.trim(),
    meanings: definitionPieces,
  };
};

// Module-level cache - persists across component mounts
const vocabCache: Partial<Record<VocabLevel, IWord[]>> = {};
const pendingRequests: Partial<Record<VocabLevel, Promise<IWord[]>>> = {};

const getCachedLevel = (level: VocabLevel) => {
  const sessionCache = useVocabCacheStore.getState().cachedByLevel[level];
  if (sessionCache) return sessionCache;
  return vocabCache[level];
};

const setCachedLevel = (level: VocabLevel, items: IWord[]) => {
  vocabCache[level] = items;
  useVocabCacheStore.getState().setCachedLevel(level, items);
};

export const vocabDataService = {
  /**
   * Get vocab data for a specific level. Returns cached data if available,
   * otherwise fetches and caches it.
   */
  async getVocabByLevel(level: VocabLevel): Promise<IWord[]> {
    // Return cached data immediately if available
    const cached = getCachedLevel(level);
    if (cached) return cached;

    // If there's already a pending request for this level, wait for it
    if (pendingRequests[level]) {
      return pendingRequests[level];
    }

    // Create new request and store the promise to prevent duplicate fetches
    pendingRequests[level] = fetch(`/data-vocab/${level}.json`)
      .then(res => res.json() as Promise<RawVocabEntry[]>)
      .then(data => {
        const words = data.map(toWordObj);
        setCachedLevel(level, words);
        delete pendingRequests[level];
        return words;
      })
      .catch(err => {
        delete pendingRequests[level];
        throw err;
      });

    return pendingRequests[level];
  },

  /**
   * Preload all vocab levels in parallel (useful for initial load)
   */
  async preloadAll(): Promise<void> {
    const levels: VocabLevel[] = ['n5', 'n4', 'n3', 'n2', 'n1'];
    await Promise.all(levels.map(level => this.getVocabByLevel(level)));
  },

  /**
   * Check if a level is already cached
   */
  isCached(level: VocabLevel): boolean {
    return !!getCachedLevel(level);
  },

  /**
   * Get all cached data (for components that need all levels)
   */
  getAllCached(): Partial<Record<VocabLevel, IWord[]>> {
    return { ...useVocabCacheStore.getState().cachedByLevel, ...vocabCache };
  },

  /**
   * Clear cache (useful for testing or forced refresh)
   */
  clearCache(): void {
    Object.keys(vocabCache).forEach(key => {
      delete vocabCache[key as VocabLevel];
    });
    useVocabCacheStore.getState().clearCache();
  },
};

export type { VocabLevel };
