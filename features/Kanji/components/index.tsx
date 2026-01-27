'use client';

import { useCallback, useMemo } from 'react';
import useKanjiStore from '@/features/Kanji/store/useKanjiStore';
import { useStatsStore } from '@/features/Progress';
import KanjiSetDictionary from '@/features/Kanji/components/SetDictionary';

import type { IKanjiObj } from '@/features/Kanji/store/useKanjiStore';
import {
  kanjiDataService,
  KanjiLevel,
} from '@/features/Kanji/services/kanjiDataService';
import LevelSetCards from '@/shared/components/Menu/LevelSetCards';
import {
  N1KanjiLength,
  N2KanjiLength,
  N3KanjiLength,
  N4KanjiLength,
  N5KanjiLength,
} from '@/shared/lib/unitSets';

const levelOrder: KanjiLevel[] = ['n5', 'n4', 'n3', 'n2', 'n1'];
const KANJI_PER_SET = 10;
const KANJI_LENGTHS: Record<KanjiLevel, number> = {
  n5: N5KanjiLength,
  n4: N4KanjiLength,
  n3: N3KanjiLength,
  n2: N2KanjiLength,
  n1: N1KanjiLength,
};

const KanjiCards = () => {
  const selectedKanjiCollectionName = useKanjiStore(
    state => state.selectedKanjiCollection,
  );

  const selectedKanjiSets = useKanjiStore(state => state.selectedKanjiSets);
  const setSelectedKanjiSets = useKanjiStore(
    state => state.setSelectedKanjiSets,
  );
  const { clearKanjiObjs, clearKanjiSets } = useKanjiStore();
  const addKanjiObjs = useKanjiStore(state => state.addKanjiObjs);
  const collapsedRowsByUnit = useKanjiStore(state => state.collapsedRowsByUnit);
  const setCollapsedRowsForUnit = useKanjiStore(
    state => state.setCollapsedRowsForUnit,
  );
  const allTimeStats = useStatsStore(state => state.allTimeStats);

  // Get collapsed rows for current unit from store
  const collapsedRows = useMemo(
    () => collapsedRowsByUnit[selectedKanjiCollectionName] || [],
    [collapsedRowsByUnit, selectedKanjiCollectionName],
  );
  const setCollapsedRows = useCallback(
    (updater: number[] | ((prev: number[]) => number[])) => {
      const newRows =
        typeof updater === 'function' ? updater(collapsedRows) : updater;
      setCollapsedRowsForUnit(selectedKanjiCollectionName, newRows);
    },
    [collapsedRows, selectedKanjiCollectionName, setCollapsedRowsForUnit],
  );

  const getCollectionName = useCallback(
    (level: KanjiLevel) => level.toUpperCase(),
    [],
  );
  const loadItemsByLevel = useCallback(
    (level: KanjiLevel) => kanjiDataService.getKanjiByLevel(level),
    [],
  );
  const getCollectionSize = useCallback(
    (level: KanjiLevel) => KANJI_LENGTHS[level],
    [],
  );

  return (
    <LevelSetCards<KanjiLevel, IKanjiObj>
      levelOrder={levelOrder}
      selectedUnitName={selectedKanjiCollectionName as KanjiLevel}
      itemsPerSet={KANJI_PER_SET}
      getCollectionName={getCollectionName}
      getCollectionSize={getCollectionSize}
      loadItemsByLevel={loadItemsByLevel}
      selectedSets={selectedKanjiSets}
      setSelectedSets={setSelectedKanjiSets}
      clearSelected={() => {
        clearKanjiSets();
        clearKanjiObjs();
      }}
      toggleItems={items => addKanjiObjs(items)}
      collapsedRows={collapsedRows}
      setCollapsedRows={setCollapsedRows}
      masteryByKey={allTimeStats.characterMastery}
      getMasteryKey={item => item.kanjiChar}
      renderSetDictionary={items => <KanjiSetDictionary words={items} />}
      loadingText='Loading kanji sets...'
      tipText={
        <>
          💡 <strong>Tip:</strong> Complete some practice sessions to unlock the
          &ldquo;Hide Mastered Sets&rdquo; filter. Sets become mastered when you
          achieve 90%+ accuracy with 10+ attempts per character.
        </>
      }
    />
  );
};

export default KanjiCards;
