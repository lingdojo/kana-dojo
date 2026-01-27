import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import type { IKanjiObj } from '@/features/Kanji/store/useKanjiStore';

export type KanjiLevel = 'n5' | 'n4' | 'n3' | 'n2' | 'n1';

type KanjiCacheState = {
  cachedByLevel: Partial<Record<KanjiLevel, IKanjiObj[]>>;
  setCachedLevel: (level: KanjiLevel, items: IKanjiObj[]) => void;
  setCachedLevels: (levels: Partial<Record<KanjiLevel, IKanjiObj[]>>) => void;
  clearCache: () => void;
};

export const useKanjiCacheStore = create<KanjiCacheState>()(
  persist(
    set => ({
      cachedByLevel: {},
      setCachedLevel: (level, items) =>
        set(state => ({
          cachedByLevel: {
            ...state.cachedByLevel,
            [level]: items,
          },
        })),
      setCachedLevels: levels =>
        set(state => ({
          cachedByLevel: {
            ...state.cachedByLevel,
            ...levels,
          },
        })),
      clearCache: () => set({ cachedByLevel: {} }),
    }),
    {
      name: 'kanji-cache',
      storage: createJSONStorage(() =>
        typeof window === 'undefined'
          ? (undefined as unknown as Storage)
          : sessionStorage,
      ),
    },
  ),
);
