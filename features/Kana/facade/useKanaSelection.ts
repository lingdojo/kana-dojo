'use client';

import { useMemo } from 'react';
import useKanaStore from '../store/useKanaStore';

/**
 * Kana Selection Facade - Public API for selection state
 *
 * Abstracts the internal Kana store structure
 */

export interface KanaSelection {
  selectedGroupIndices: number[];
  totalSelected: number;
  isEmpty: boolean;
  gameMode: string;
}

export interface KanaSelectionActions {
  addGroup: (index: number) => void;
  addGroups: (indices: number[]) => void;
  replaceGroups: (indices: number[]) => void;
  clearSelection: () => void;
  selectAll: () => void;
  isGroupSelected: (index: number) => boolean;
  setGameMode: (mode: string) => void;
}

export function useKanaSelection(): KanaSelection & KanaSelectionActions {
  const selectedGroupIndices = useKanaStore(state => state.kanaGroupIndices);
  const gameMode = useKanaStore(state => state.selectedGameModeKana);
  const addGroup = useKanaStore(state => state.addKanaGroupIndex);
  const addGroups = useKanaStore(state => state.addKanaGroupIndices);
  const setGameMode = useKanaStore(state => state.setSelectedGameModeKana);
  const replaceGroups = useKanaStore(state => state.setKanaGroupIndices);

  return useMemo(
    () => ({
      // State
      selectedGroupIndices,
      totalSelected: selectedGroupIndices.length,
      isEmpty: selectedGroupIndices.length === 0,
      gameMode,

      // Actions
      addGroup,
      addGroups,
      replaceGroups,
      clearSelection: () => {
        // Toggle all currently selected groups to clear them
        addGroups(selectedGroupIndices);
      },
      selectAll: () => {
        // Select all 69 kana groups (based on kana.ts data)
        const allIndices = Array.from({ length: 69 }, (_, i) => i);
        addGroups(allIndices);
      },
      isGroupSelected: (index: number) => selectedGroupIndices.includes(index),
      setGameMode,
    }),
    [
      selectedGroupIndices,
      gameMode,
      addGroup,
      addGroups,
      replaceGroups,
      setGameMode,
    ],
  );
}
