'use client';

import { useCallback, useEffect, useMemo } from 'react';
import useVocabStore from '@/features/Vocabulary/store/useVocabStore';
import VocabSetDictionary from '@/features/Vocabulary/components/SetDictionary';
import {
  vocabDataService,
  VocabLevel,
} from '@/features/Vocabulary/services/vocabDataService';
import LevelSetCards from '@/shared/ui-composite/Menu/LevelSetCards';
import useSetProgressHydration from '@/features/Progress/hooks/useSetProgress';
import useSetProgressStore from '@/features/Progress/store/useSetProgressStore';
import { calculateVocabularySetProgress } from '@/features/Progress/lib/setProgress';
import {
  N1VocabLength,
  N2VocabLength,
  N3VocabLength,
  N4VocabLength,
  N5VocabLength,
} from '@/shared/utils/unitSets';
import {
  buildSubunitsForUnit,
  buildUnitSummaries,
} from '@/shared/ui-composite/Menu/lib/unitSubunits';

import type { IWord } from '@/shared/types/interfaces';

const levelOrder: VocabLevel[] = ['n5', 'n4', 'n3', 'n2', 'n1'];
const WORDS_PER_SET = 10;
const VOCAB_COLLAPSED_ROWS_SESSION_KEY = 'vocab-collapsed-rows-by-unit';
const VOCAB_LENGTHS: Record<VocabLevel, number> = {
  n5: N5VocabLength,
  n4: N4VocabLength,
  n3: N3VocabLength,
  n2: N2VocabLength,
  n1: N1VocabLength,
};
const VOCAB_SET_COUNTS: Record<VocabLevel, number> = {
  n5: Math.ceil(N5VocabLength / WORDS_PER_SET),
  n4: Math.ceil(N4VocabLength / WORDS_PER_SET),
  n3: Math.ceil(N3VocabLength / WORDS_PER_SET),
  n2: Math.ceil(N2VocabLength / WORDS_PER_SET),
  n1: Math.ceil(N1VocabLength / WORDS_PER_SET),
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
  const selectedSubunitByUnit = useVocabStore(
    state => state.selectedSubunitByUnit,
  );
  const setSelectedSubunitForUnit = useVocabStore(
    state => state.setSelectedSubunitForUnit,
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

  const unitSummaries = useMemo(
    () => buildUnitSummaries(levelOrder, level => VOCAB_SET_COUNTS[level]),
    [],
  );
  const activeUnitSummary = useMemo(
    () =>
      unitSummaries.find(unit => unit.name === selectedVocabCollectionName) ??
      unitSummaries[0],
    [selectedVocabCollectionName, unitSummaries],
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
    selectedSubunitByUnit[selectedVocabCollectionName] ?? subunits[0]?.id;
  const activeSubunitRange = useMemo(
    () =>
      subunits.find(subunit => subunit.id === selectedSubunitId) ?? subunits[0],
    [selectedSubunitId, subunits],
  );
  const collapsedRowsKey = `${selectedVocabCollectionName}:${activeSubunitRange.id}`;

  useEffect(() => {
    if (!selectedSubunitId && subunits[0]) {
      setSelectedSubunitForUnit(selectedVocabCollectionName, subunits[0].id);
    }
  }, [
    selectedSubunitId,
    selectedVocabCollectionName,
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
    const stored = sessionStorage.getItem(VOCAB_COLLAPSED_ROWS_SESSION_KEY);
    if (!stored) return;
    try {
      const parsed = JSON.parse(stored) as Record<string, number[]>;
      setCollapsedRowsForUnit(collapsedRowsKey, parsed[collapsedRowsKey] ?? []);
    } catch {
      setCollapsedRowsForUnit(collapsedRowsKey, []);
    }
  }, [collapsedRowsKey, setCollapsedRowsForUnit]);

  useEffect(() => {
    const stored = sessionStorage.getItem(VOCAB_COLLAPSED_ROWS_SESSION_KEY);
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
      VOCAB_COLLAPSED_ROWS_SESSION_KEY,
      JSON.stringify(parsed),
    );
  }, [collapsedRows, collapsedRowsKey]);

  useSetProgressHydration();
  const vocabularyProgress = useSetProgressStore(
    state => state.data.vocabulary,
  );
  const getSetProgress = useCallback(
    (items: IWord[]) =>
      calculateVocabularySetProgress(
        items.map(item => ({
          meaningCorrect: vocabularyProgress[item.word]?.meaningCorrect ?? 0,
          readingCorrect: vocabularyProgress[item.word]?.readingCorrect ?? 0,
        })),
      ),
    [vocabularyProgress],
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
      renderSetDictionary={items => <VocabSetDictionary words={items} />}
      getSetProgress={getSetProgress}
      loadingText='Loading vocabulary sets...'
      activeSubunitRange={activeSubunitRange}
      collapseScopeKey={collapsedRowsKey}
    />
  );
};

export default VocabCards;
