'use client';

import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export type AutoLearningDojo = 'kana' | 'kanji' | 'vocabulary';

interface AutoLearningState {
  reviewCursors: Record<AutoLearningDojo, number>;
  activeSelections: Record<AutoLearningDojo, boolean>;
  setReviewCursor: (dojo: AutoLearningDojo, cursor: number) => void;
  setAutoSelectionActive: (dojo: AutoLearningDojo, active: boolean) => void;
  resetReviewCursors: () => void;
}

const DEFAULT_REVIEW_CURSORS: Record<AutoLearningDojo, number> = {
  kana: 0,
  kanji: 0,
  vocabulary: 0,
};

const useAutoLearningStore = create<AutoLearningState>()(
  persist(
    set => ({
      reviewCursors: { ...DEFAULT_REVIEW_CURSORS },
      activeSelections: {
        kana: false,
        kanji: false,
        vocabulary: false,
      },
      setReviewCursor: (dojo, cursor) =>
        set(state => ({
          reviewCursors: {
            ...state.reviewCursors,
            [dojo]: Math.max(0, cursor),
          },
        })),
      resetReviewCursors: () =>
        set({ reviewCursors: { ...DEFAULT_REVIEW_CURSORS } }),
      setAutoSelectionActive: (dojo, active) =>
        set(state => ({
          activeSelections: {
            ...state.activeSelections,
            [dojo]: active,
          },
        })),
    }),
    {
      name: 'kanadojo-auto-learning',
      storage:
        typeof window !== 'undefined'
          ? createJSONStorage(() => localStorage)
          : undefined,
      partialize: state => ({ reviewCursors: state.reviewCursors }),
    },
  ),
);

export default useAutoLearningStore;
