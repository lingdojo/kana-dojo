'use client';

import { useCallback, useMemo } from 'react';
import useKanaStore from '@/features/Kana/store/useKanaStore';

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

  const clearSelection = useCallback(() => {
    replaceGroups([]);
  }, [replaceGroups]);

  const selectAll = useCallback(() => {
    const allIndices = Array.from({ length: 60 }, (_, i) => i);
    replaceGroups(allIndices);
  }, [replaceGroups]);

  const isGroupSelected = useCallback(
    (index: number) => selectedGroupIndices.includes(index),
    [selectedGroupIndices],
  );

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
      clearSelection,
      selectAll,
      isGroupSelected,
      setGameMode,
    }),
    [
      selectedGroupIndices,
      gameMode,
      addGroup,
      addGroups,
      replaceGroups,
      clearSelection,
      selectAll,
      isGroupSelected,
      setGameMode,
    ],
  );
}
