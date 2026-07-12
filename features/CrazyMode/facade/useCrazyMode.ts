'use client';

import { useMemo } from 'react';
import useCrazyModeStore, { KYOKI_THEME_ID } from '../store/useCrazyModeStore';
import useCrazyModeStreakStore from '../store/useCrazyModeStreakStore';
import usePreferencesStore from '@/features/Preferences/store/usePreferencesStore';

export { KYOKI_THEME_ID };

export interface CrazyModeState {
  isCrazyMode: boolean;
  activeThemeId: string | null;
  activeFontName: string | null;
}

export interface CrazyModeActions {
  randomize: () => void;
}

export interface CrazyModeStreakState {
  currentStreak: number;
  bestStreak: number;
}

export interface CrazyModeStreakActions {
  recordCorrect: () => void;
  recordWrong: () => void;
  reset: () => void;
}

export function useCrazyMode(): CrazyModeState & CrazyModeActions {
  const selectedTheme = usePreferencesStore(state => state.theme);
  const isCrazyMode = selectedTheme === KYOKI_THEME_ID;

  const activeThemeId = useCrazyModeStore(state => state.activeThemeId);
  const activeFontName = useCrazyModeStore(state => state.activeFontName);
  const randomize = useCrazyModeStore(state => state.randomize);

  return useMemo(
    () => ({
      isCrazyMode,
      activeThemeId,
      activeFontName,
      randomize,
    }),
    [isCrazyMode, activeThemeId, activeFontName, randomize],
  );
}

export function useCrazyModeStreak(): CrazyModeStreakState &
  CrazyModeStreakActions {
  const currentStreak = useCrazyModeStreakStore(s => s.currentStreak);
  const bestStreak = useCrazyModeStreakStore(s => s.bestStreak);
  const recordCorrect = useCrazyModeStreakStore(s => s.recordCorrect);
  const recordWrong = useCrazyModeStreakStore(s => s.recordWrong);
  const reset = useCrazyModeStreakStore(s => s.reset);

  return useMemo(
    () => ({
      currentStreak,
      bestStreak,
      recordCorrect,
      recordWrong,
      reset,
    }),
    [currentStreak, bestStreak, recordCorrect, recordWrong, reset],
  );
}
