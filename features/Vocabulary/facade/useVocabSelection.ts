'use client';

import { useMemo } from 'react';
import type { IVocabObj } from '@/entities/vocabulary';
import useVocabStore from '../store/useVocabStore';

/**
 * Vocabulary Selection Facade - Public API for selection state
 *
 * Abstracts the internal Vocabulary store structure
 */

export interface VocabSelection {
  selectedVocab: IVocabObj[];
  selectedSets: string[];
  selectedCollection: string;
  selectedSubunitByUnit: Partial<Record<string, string>>;
  totalSelected: number;
  isEmpty: boolean;
  gameMode: string;
}

export interface VocabSelectionActions {
  addVocab: (vocab: IVocabObj) => void;
  addVocabList: (vocabs: IVocabObj[]) => void;
  clearVocab: () => void;
  setCollection: (collection: string) => void;
  setSets: (sets: string[]) => void;
  clearSets: () => void;
  setSubunitForUnit: (unit: string, subunitId: string) => void;
  setGameMode: (mode: string) => void;
}

export function useVocabSelection(): VocabSelection & VocabSelectionActions {
  const selectedVocab = useVocabStore(state => state.selectedVocabObjs);
  const selectedSets = useVocabStore(state => state.selectedVocabSets);
  const selectedCollection = useVocabStore(
    state => state.selectedVocabCollection,
  );
  const selectedSubunitByUnit = useVocabStore(
    state => state.selectedSubunitByUnit,
  );
  const gameMode = useVocabStore(state => state.selectedGameModeVocab);
  const addVocab = useVocabStore(state => state.addVocabObj);
  const addVocabList = useVocabStore(state => state.addVocabObjs);
  const clearVocab = useVocabStore(state => state.clearVocabObjs);
  const setCollection = useVocabStore(
    state => state.setSelectedVocabCollection,
  );
  const setSets = useVocabStore(state => state.setSelectedVocabSets);
  const clearSets = useVocabStore(state => state.clearVocabSets);
  const setSubunitForUnit = useVocabStore(
    state => state.setSelectedSubunitForUnit,
  );
  const setGameMode = useVocabStore(state => state.setSelectedGameModeVocab);

  return useMemo(
    () => ({
      // State
      selectedVocab,
      selectedSets,
      selectedCollection,
      selectedSubunitByUnit,
      totalSelected: selectedVocab.length,
      isEmpty: selectedVocab.length === 0,
      gameMode,

      // Actions
      addVocab,
      addVocabList,
      clearVocab,
      setCollection,
      setSets,
      clearSets,
      setSubunitForUnit,
      setGameMode,
    }),
    [
      selectedVocab,
      selectedSets,
      selectedCollection,
      selectedSubunitByUnit,
      gameMode,
      addVocab,
      addVocabList,
      clearVocab,
      setCollection,
      setSets,
      clearSets,
      setSubunitForUnit,
      setGameMode,
    ],
  );
}
