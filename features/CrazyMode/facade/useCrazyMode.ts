'use client';

import { useMemo } from 'react';
import useCrazyModeStore, { KYOKI_THEME_ID } from '../store/useCrazyModeStore';
import { usePreferencesStore } from '@/features/Preferences';

export { KYOKI_THEME_ID };

export interface CrazyModeState {
  isCrazyMode: boolean;
  activeThemeId: string | null;
  activeFontName: string | null;
}

export interface CrazyModeActions {
  randomize: () => void;
}

export function useCrazyMode(): CrazyModeState & CrazyModeActions {
  // Crazy mode is now derived from whether the kyoki theme is selected
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
