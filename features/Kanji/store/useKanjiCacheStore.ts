import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import type { IKanjiObj, KanjiLevel } from '@/entities/kanji';

export type { KanjiLevel } from '@/entities/kanji';

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
      storage:
        typeof window !== 'undefined'
          ? createJSONStorage(() => sessionStorage)
          : undefined,
    },
  ),
);
