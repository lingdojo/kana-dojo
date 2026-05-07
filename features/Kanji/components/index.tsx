'use client';

import { useCallback, useEffect, useMemo } from 'react';
import useKanjiStore from '@/features/Kanji/store/useKanjiStore';
import KanjiSetDictionary from '@/features/Kanji/components/SetDictionary';

import type { IKanjiObj } from '@/features/Kanji/store/useKanjiStore';
import {
  kanjiDataService,
  KanjiLevel,
} from '@/features/Kanji/services/kanjiDataService';
import LevelSetCards from '@/shared/ui-composite/Menu/LevelSetCards';
import useSetProgressHydration from '@/features/Progress/hooks/useSetProgress';
import useSetProgressStore from '@/features/Progress/store/useSetProgressStore';
import { calculateKanjiSetProgress } from '@/features/Progress/lib/setProgress';
import {
  N1KanjiLength,
  N2KanjiLength,
  N3KanjiLength,
  N4KanjiLength,
  N5KanjiLength,
} from '@/shared/utils/unitSets';
import {
  buildSubunitsForUnit,
  buildUnitSummaries,
} from '@/shared/ui-composite/Menu/lib/unitSubunits';

const levelOrder: KanjiLevel[] = ['n5', 'n4', 'n3', 'n2', 'n1'];
const KANJI_PER_SET = 10;
const KANJI_COLLAPSED_ROWS_SESSION_KEY = 'kanji-collapsed-rows-by-unit';
const KANJI_LENGTHS: Record<KanjiLevel, number> = {
  n5: N5KanjiLength,
  n4: N4KanjiLength,
  n3: N3KanjiLength,
  n2: N2KanjiLength,
  n1: N1KanjiLength,
};
const KANJI_SET_COUNTS: Record<KanjiLevel, number> = {
  n5: Math.ceil(N5KanjiLength / KANJI_PER_SET),
  n4: Math.ceil(N4KanjiLength / KANJI_PER_SET),
  n3: Math.ceil(N3KanjiLength / KANJI_PER_SET),
  n2: Math.ceil(N2KanjiLength / KANJI_PER_SET),
  n1: Math.ceil(N1KanjiLength / KANJI_PER_SET),
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
  const selectedSubunitByUnit = useKanjiStore(
    state => state.selectedSubunitByUnit,
  );
  const setSelectedSubunitForUnit = useKanjiStore(
    state => state.setSelectedSubunitForUnit,
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

  const unitSummaries = useMemo(
    () => buildUnitSummaries(levelOrder, level => KANJI_SET_COUNTS[level]),
    [],
  );
  const activeUnitSummary = useMemo(
    () =>
      unitSummaries.find(unit => unit.name === selectedKanjiCollectionName) ??
      unitSummaries[0],
    [selectedKanjiCollectionName, unitSummaries],
  );
  const subunits = useMemo(
    () =>
      buildSubunitsForUnit(
        activeUnitSummary.startLevel,
        activeUnitSummary.levelCount,
      ),
    [activeUnitSummary.levelCount, activeUnitSummary.startLevel],
  );
  const selectedSubunitId =
    selectedSubunitByUnit[selectedKanjiCollectionName] ?? subunits[0]?.id;
  const activeSubunitRange = useMemo(
    () =>
      subunits.find(subunit => subunit.id === selectedSubunitId) ?? subunits[0],
    [selectedSubunitId, subunits],
  );
  const collapsedRowsKey = `${selectedKanjiCollectionName}:${activeSubunitRange.id}`;

  useEffect(() => {
    if (!selectedSubunitId && subunits[0]) {
      setSelectedSubunitForUnit(selectedKanjiCollectionName, subunits[0].id);
    }
  }, [
    selectedKanjiCollectionName,
    selectedSubunitId,
    setSelectedSubunitForUnit,
    subunits,
  ]);

  const collapsedRows = useMemo(
    () => collapsedRowsByUnit[collapsedRowsKey] || [],
    [collapsedRowsByUnit, collapsedRowsKey],
  );
  const setCollapsedRows = useCallback(
    (updater: number[] | ((prev: number[]) => number[])) => {
      const newRows =
        typeof updater === 'function' ? updater(collapsedRows) : updater;
      setCollapsedRowsForUnit(collapsedRowsKey, newRows);
    },
    [collapsedRows, collapsedRowsKey, setCollapsedRowsForUnit],
  );

  useEffect(() => {
    const stored = sessionStorage.getItem(KANJI_COLLAPSED_ROWS_SESSION_KEY);
    if (!stored) return;
    try {
      const parsed = JSON.parse(stored) as Record<string, number[]>;
      setCollapsedRowsForUnit(collapsedRowsKey, parsed[collapsedRowsKey] ?? []);
    } catch {
      setCollapsedRowsForUnit(collapsedRowsKey, []);
    }
  }, [collapsedRowsKey, setCollapsedRowsForUnit]);

  useEffect(() => {
    const stored = sessionStorage.getItem(KANJI_COLLAPSED_ROWS_SESSION_KEY);
    let parsed: Record<string, number[]> = {};

    if (stored) {
      try {
        parsed = JSON.parse(stored) as Record<string, number[]>;
      } catch {
        parsed = {};
      }
    }

    parsed[collapsedRowsKey] = collapsedRows;
    sessionStorage.setItem(
      KANJI_COLLAPSED_ROWS_SESSION_KEY,
      JSON.stringify(parsed),
    );
  }, [collapsedRows, collapsedRowsKey]);

  useSetProgressHydration();
  const kanjiProgress = useSetProgressStore(state => state.data.kanji);
  const getSetProgress = useCallback(
    (items: IKanjiObj[]) =>
      calculateKanjiSetProgress(
        items.map(item => ({
          correct: kanjiProgress[item.kanjiChar]?.correct ?? 0,
        })),
      ),
    [kanjiProgress],
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
      renderSetDictionary={items => <KanjiSetDictionary words={items} />}
      getSetProgress={getSetProgress}
      loadingText='Loading kanji sets...'
      activeSubunitRange={activeSubunitRange}
      collapseScopeKey={collapsedRowsKey}
    />
  );
};

export default KanjiCards;
