'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import useKanjiStore from '@/features/Kanji/store/useKanjiStore';
import KanjiSetDictionary from '@/features/Kanji/components/SetDictionary';
import { useMenuSelectorStore } from '@/shared/ui-composite/Menu/store/useMenuSelectorStore';

import type { IKanjiObj } from '@/features/Kanji/store/useKanjiStore';
import {
  kanjiDataService,
  KanjiLevel,
} from '@/features/Kanji/services/kanjiDataService';
import LevelSetCards from '@/shared/ui-composite/Menu/LevelSetCards';
import useSetProgressHydration from '@/features/Progress/hooks/useSetProgress';
import {
  calculateKanjiSetProgressAndStars,
  selectAutoLearningSets,
  useAutoLearningStore,
  useSetProgressStore,
  writeAutoLearningHandoff,
} from '@/features/Progress';
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
import AutoLearningButton from '@/shared/ui-composite/Menu/AutoLearningButton';
import { AUTO_LEARNING_GAME_MODE } from '@/shared/ui-composite/Menu/lib/autoLearningConfig';
import { useRouter } from '@/core/i18n/routing';

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

interface KanjiCardsProps {
  showAutoLearning?: boolean;
}

const KanjiCards = ({ showAutoLearning = false }: KanjiCardsProps) => {
  const router = useRouter();
  const persistedKanjiSelector = useMenuSelectorStore(
    state => state.collections.kanji,
  );
  const selectedKanjiCollectionName = persistedKanjiSelector.selectedCollection;
  const selectedSubunitByUnit = persistedKanjiSelector.selectedSubunitByUnit;
  const selectedKanjiSets = useKanjiStore(state => state.selectedKanjiSets);
  const setSelectedKanjiSets = useKanjiStore(
    state => state.setSelectedKanjiSets,
  );
  const reviewCursor = useAutoLearningStore(state => state.reviewCursors.kanji);
  const hasAutoLearningSelection = useAutoLearningStore(
    state => state.activeSelections.kanji,
  );
  const setReviewCursor = useAutoLearningStore(state => state.setReviewCursor);
  const [isAutoLearning, setIsAutoLearning] = useState(false);
  const [autoLearningError, setAutoLearningError] = useState<string | null>(
    null,
  );
  const { clearKanjiObjs, clearKanjiSets } = useKanjiStore();
  const addKanjiObjs = useKanjiStore(state => state.addKanjiObjs);
  const collapsedRowsByUnit = useKanjiStore(state => state.collapsedRowsByUnit);
  const setCollapsedRowsForUnit = useKanjiStore(
    state => state.setCollapsedRowsForUnit,
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

  const isProgressHydrated = useSetProgressHydration();
  const kanjiProgress = useSetProgressStore(state => state.data.kanji);
  const getSetProgressSummary = useCallback(
    (items: IKanjiObj[]) =>
      calculateKanjiSetProgressAndStars(
        items.map(item => ({
          correct: kanjiProgress[item.kanjiChar]?.correct ?? 0,
        })),
      ),
    [kanjiProgress],
  );
  const hasProgress = useMemo(
    () => Object.values(kanjiProgress).some(entry => entry.correct > 0),
    [kanjiProgress],
  );

  const handleAutoLearning = async () => {
    if (isAutoLearning || !isProgressHydrated) return;
    setIsAutoLearning(true);
    setAutoLearningError(null);

    try {
      let globalSetNumber = 1;
      const orderedSets: Array<{
        id: string;
        payload: {
          level: KanjiLevel;
          setName: string;
          startIndex: number;
          endIndex: number;
        };
        mastered: boolean;
      }> = [];

      for (const level of levelOrder) {
        const items = await kanjiDataService.getKanjiByLevel(level);
        const levelSets = Array.from(
          { length: Math.ceil(items.length / KANJI_PER_SET) },
          (_, index) => {
            const startIndex = index * KANJI_PER_SET;
            const endIndex = Math.min(
              (index + 1) * KANJI_PER_SET,
              items.length,
            );
            const setItems = items.slice(startIndex, endIndex);
            const setNumber = globalSetNumber;
            globalSetNumber += 1;
            return {
              id: `kanji:${level}:${index + 1}`,
              payload: {
                level,
                setName: `Set ${setNumber}`,
                startIndex,
                endIndex,
              },
              mastered:
                calculateKanjiSetProgressAndStars(
                  setItems.map(item => ({
                    correct: kanjiProgress[item.kanjiChar]?.correct ?? 0,
                  })),
                ).stars === 3,
            };
          },
        );
        orderedSets.push(...levelSets);
        if (orderedSets.filter(set => !set.mastered).length >= 2) break;
      }
      const selection = selectAutoLearningSets(orderedSets, reviewCursor);
      if (selection.selected.length === 0) {
        throw new Error('No Kanji sets are available for training.');
      }

      writeAutoLearningHandoff({
        dojo: 'kanji',
        gameMode: AUTO_LEARNING_GAME_MODE,
        sets: selection.selected.map(set => ({
          setName: set.payload.setName,
          level: set.payload.level,
          startIndex: set.payload.startIndex,
          endIndex: set.payload.endIndex,
        })),
      });
      setReviewCursor('kanji', selection.nextReviewCursor);
      router.push('/kanji/learn');
    } catch {
      setAutoLearningError('Could not load Kanji sets. Try again.');
      setIsAutoLearning(false);
    }
  };
  const initialCollections = useMemo(() => {
    const cached = kanjiDataService.getAllCached();

    return Object.fromEntries(
      unitSummaries
        .map(unit => {
          const data = cached[unit.name];
          if (!data) return null;

          return [
            unit.name,
            {
              data,
              name: getCollectionName(unit.name),
              prevLength: unit.startLevel - 1,
            },
          ] as const;
        })
        .filter(entry => entry !== null),
    ) as Partial<
      Record<
        KanjiLevel,
        { data: IKanjiObj[]; name: string; prevLength: number }
      >
    >;
  }, [getCollectionName, unitSummaries]);

  return (
    <LevelSetCards<KanjiLevel, IKanjiObj>
      levelOrder={levelOrder}
      selectedUnitName={selectedKanjiCollectionName as KanjiLevel}
      itemsPerSet={KANJI_PER_SET}
      getCollectionName={getCollectionName}
      getCollectionSize={getCollectionSize}
      loadItemsByLevel={loadItemsByLevel}
      selectedSets={hasAutoLearningSelection ? [] : selectedKanjiSets}
      setSelectedSets={setSelectedKanjiSets}
      clearSelected={() => {
        clearKanjiSets();
        clearKanjiObjs();
      }}
      toggleItems={items => addKanjiObjs(items)}
      collapsedRows={collapsedRows}
      setCollapsedRows={setCollapsedRows}
      renderSetDictionary={items => <KanjiSetDictionary words={items} />}
      getSetProgressSummary={getSetProgressSummary}
      loadingText='Loading kanji sets...'
      activeSubunitRange={activeSubunitRange}
      collapseScopeKey={collapsedRowsKey}
      initialCollections={initialCollections}
      learningAction={
        showAutoLearning ? (
          <AutoLearningButton
            hasProgress={hasProgress}
            isLoading={!isProgressHydrated || isAutoLearning}
            error={autoLearningError}
            onClick={() => void handleAutoLearning()}
          />
        ) : undefined
      }
    />
  );
};

export default KanjiCards;
