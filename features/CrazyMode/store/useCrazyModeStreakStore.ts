import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CrazyModeStreakState {
  currentStreak: number;
  bestStreak: number;
}

export interface CrazyModeStreakActions {
  recordCorrect: () => void;
  recordWrong: () => void;
  reset: () => void;
}

const useCrazyModeStreakStore = create<
  CrazyModeStreakState & CrazyModeStreakActions
>()(
  persist(
    set => ({
      currentStreak: 0,
      bestStreak: 0,

      recordCorrect: () =>
        set(s => {
          const newStreak = s.currentStreak + 1;
          return {
            currentStreak: newStreak,
            bestStreak: Math.max(s.bestStreak, newStreak),
          };
        }),

      recordWrong: () => set({ currentStreak: 0 }),

      reset: () => set({ currentStreak: 0, bestStreak: 0 }),
    }),
    {
      name: 'kanadojo-crazy-streak',
    },
  ),
);

export default useCrazyModeStreakStore;
