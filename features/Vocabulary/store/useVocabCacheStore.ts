import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import type { IVocabObj, VocabLevel } from '@/entities/vocabulary';

export type { VocabLevel } from '@/entities/vocabulary';

type VocabCacheState = {
  cachedByLevel: Partial<Record<VocabLevel, IVocabObj[]>>;
  setCachedLevel: (level: VocabLevel, items: IVocabObj[]) => void;
  setCachedLevels: (levels: Partial<Record<VocabLevel, IVocabObj[]>>) => void;
  clearCache: () => void;
};

export const useVocabCacheStore = create<VocabCacheState>()(
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
      name: 'vocab-cache',
      storage:
        typeof window !== 'undefined'
          ? createJSONStorage(() => sessionStorage)
          : undefined,
    },
  ),
);
