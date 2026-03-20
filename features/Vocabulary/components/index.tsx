'use client';

import { useCallback, useMemo } from 'react';
import useVocabStore from '@/features/Vocabulary/store/useVocabStore';
import { useStatsStore } from '@/features/Progress';
import VocabSetDictionary from '@/features/Vocabulary/components/SetDictionary';
import {
  vocabDataService,
  VocabLevel,
} from '@/features/Vocabulary/services/vocabDataService';
import LevelSetCards from '@/shared/components/Menu/LevelSetCards';
import {
  N1VocabLength,
  N2VocabLength,
  N3VocabLength,
  N4VocabLength,
  N5VocabLength,
} from '@/shared/lib/unitSets';

import type { IWord } from '@/shared/types/interfaces';

const levelOrder: VocabLevel[] = ['n5', 'n4', 'n3', 'n2', 'n1'];
const WORDS_PER_SET = 10;
const VOCAB_LENGTHS: Record<VocabLevel, number> = {
  n5: N5VocabLength,
  n4: N4VocabLength,
  n3: N3VocabLength,
  n2: N2VocabLength,
  n1: N1VocabLength,
};

const vocabCollectionNames: Record<VocabLevel, string> = {
  n5: 'N5',
  n4: 'N4',
  n3: 'N3',
  n2: 'N2',
  n1: 'N1',
};

const VocabCards = () => {
  const selectedVocabCollectionName = useVocabStore(
    state => state.selectedVocabCollection,
  );

  const selectedVocabSets = useVocabStore(state => state.selectedVocabSets);
  const setSelectedVocabSets = useVocabStore(
    state => state.setSelectedVocabSets,
  );
  const addWordObjs = useVocabStore(state => state.addVocabObjs);
  const { clearVocabObjs, clearVocabSets } = useVocabStore();
  const collapsedRowsByUnit = useVocabStore(state => state.collapsedRowsByUnit);
  const setCollapsedRowsForUnit = useVocabStore(
    state => state.setCollapsedRowsForUnit,
  );
  const allTimeStats = useStatsStore(state => state.allTimeStats);

  // Get collapsed rows for current unit from store
  const collapsedRows = useMemo(
    () => collapsedRowsByUnit[selectedVocabCollectionName] || [],
    [collapsedRowsByUnit, selectedVocabCollectionName],
  );
  const setCollapsedRows = useCallback(
    (updater: number[] | ((prev: number[]) => number[])) => {
      const newRows =
        typeof updater === 'function' ? updater(collapsedRows) : updater;
      setCollapsedRowsForUnit(selectedVocabCollectionName, newRows);
    },
    [collapsedRows, selectedVocabCollectionName, setCollapsedRowsForUnit],
  );

  const getCollectionName = useCallback(
    (level: VocabLevel) => vocabCollectionNames[level],
    [],
  );
  const loadItemsByLevel = useCallback(
    (level: VocabLevel) => vocabDataService.getVocabByLevel(level),
    [],
  );
  const getCollectionSize = useCallback(
    (level: VocabLevel) => VOCAB_LENGTHS[level],
    [],
  );

  return (
    <LevelSetCards<VocabLevel, IWord>
      levelOrder={levelOrder}
      selectedUnitName={selectedVocabCollectionName as VocabLevel}
      itemsPerSet={WORDS_PER_SET}
      getCollectionName={getCollectionName}
      getCollectionSize={getCollectionSize}
      loadItemsByLevel={loadItemsByLevel}
      selectedSets={selectedVocabSets}
      setSelectedSets={setSelectedVocabSets}
      clearSelected={() => {
        clearVocabObjs();
        clearVocabSets();
      }}
      toggleItems={items => addWordObjs(items)}
      collapsedRows={collapsedRows}
      setCollapsedRows={setCollapsedRows}
      masteryByKey={allTimeStats.characterMastery}
      getMasteryKey={item => item.word}
      renderSetDictionary={items => <VocabSetDictionary words={items} />}
      loadingText='Loading vocabulary sets...'
      tipText={
        <>
          💡 <strong>Tip:</strong> Complete some practice sessions to unlock the
          &apos;Hide Mastered Sets&apos; filter. Sets become mastered when you
          achieve 90%+ accuracy with 10+ attempts per word.
        </>
      }
    />
  );
};

export default VocabCards;
