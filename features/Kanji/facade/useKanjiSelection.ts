'use client';

import { useMemo } from 'react';
import type { IKanjiObj } from '@/entities/kanji';
import useKanjiStore from '../store/useKanjiStore';

/**
 * Kanji Selection Facade - Public API for selection state
 *
 * Abstracts the internal Kanji store structure
 */

export interface KanjiSelection {
  selectedKanji: IKanjiObj[];
  selectedSets: string[];
  selectedCollection: 'n5' | 'n4' | 'n3' | 'n2' | 'n1';
  selectedSubunitByUnit: Partial<
    Record<'n5' | 'n4' | 'n3' | 'n2' | 'n1', string>
  >;
  totalSelected: number;
  isEmpty: boolean;
  gameMode: string;
}

export interface KanjiSelectionActions {
  addKanji: (kanji: IKanjiObj) => void;
  addKanjiList: (kanjis: IKanjiObj[]) => void;
  clearKanji: () => void;
  setCollection: (collection: 'n5' | 'n4' | 'n3' | 'n2' | 'n1') => void;
  setSets: (sets: string[]) => void;
  clearSets: () => void;
  setSubunitForUnit: (
    unit: 'n5' | 'n4' | 'n3' | 'n2' | 'n1',
    subunitId: string,
  ) => void;
  setGameMode: (mode: string) => void;
}

export function useKanjiSelection(): KanjiSelection & KanjiSelectionActions {
  const selectedKanji = useKanjiStore(state => state.selectedKanjiObjs);
  const selectedSets = useKanjiStore(state => state.selectedKanjiSets);
  const selectedCollection = useKanjiStore(
    state => state.selectedKanjiCollection,
  );
  const selectedSubunitByUnit = useKanjiStore(
    state => state.selectedSubunitByUnit,
  );
  const gameMode = useKanjiStore(state => state.selectedGameModeKanji);
  const addKanji = useKanjiStore(state => state.addKanjiObj);
  const addKanjiList = useKanjiStore(state => state.addKanjiObjs);
  const clearKanji = useKanjiStore(state => state.clearKanjiObjs);
  const setCollection = useKanjiStore(
    state => state.setSelectedKanjiCollection,
  );
  const setSets = useKanjiStore(state => state.setSelectedKanjiSets);
  const clearSets = useKanjiStore(state => state.clearKanjiSets);
  const setSubunitForUnit = useKanjiStore(
    state => state.setSelectedSubunitForUnit,
  );
  const setGameMode = useKanjiStore(state => state.setSelectedGameModeKanji);

  return useMemo(
    () => ({
      // State
      selectedKanji,
      selectedSets,
      selectedCollection,
      selectedSubunitByUnit,
      totalSelected: selectedKanji.length,
      isEmpty: selectedKanji.length === 0,
      gameMode,

      // Actions
      addKanji,
      addKanjiList,
      clearKanji,
      setCollection,
      setSets,
      clearSets,
      setSubunitForUnit,
      setGameMode,
    }),
    [
      selectedKanji,
      selectedSets,
      selectedCollection,
      selectedSubunitByUnit,
      gameMode,
      addKanji,
      addKanjiList,
      clearKanji,
      setCollection,
      setSets,
      clearSets,
      setSubunitForUnit,
      setGameMode,
    ],
  );
}
