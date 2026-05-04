'use client';

import { useMemo } from 'react';
import usePreferencesStore from '../store/usePreferencesStore';

export interface InputPreferences {
  hotkeysOn: boolean;
  setHotkeys: (hotkeys: boolean) => void;
  displayKana: boolean;
  setDisplayKana: (displayKana: boolean) => void;
}

/**
 * Input Preferences Facade
 *
 * Provides access to input-related preferences (hotkeys, etc.)
 */
export function useInputPreferences(): InputPreferences {
  const hotkeysOn = usePreferencesStore(state => state.hotkeysOn);
  const setHotkeys = usePreferencesStore(state => state.setHotkeys);
  const displayKana = usePreferencesStore(state => state.displayKana);
  const setDisplayKana = usePreferencesStore(state => state.setDisplayKana);

  return useMemo<InputPreferences>(
    () => ({
      hotkeysOn,
      setHotkeys,
      displayKana,
      setDisplayKana,
    }),
    [displayKana, hotkeysOn, setDisplayKana, setHotkeys],
  );
}
