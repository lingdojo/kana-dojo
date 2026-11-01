'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import useVocabStore from '@/features/Vocabulary/store/useVocabStore';
import VocabSetDictionary from '@/features/Vocabulary/components/SetDictionary';
import { useMenuSelectorStore } from '@/shared/ui-composite/Menu/store/useMenuSelectorStore';
import {
  vocabDataService,
  VocabLevel,
} from '@/features/Vocabulary/services/vocabDataService';
import LevelSetCards from '@/shared/ui-composite/Menu/LevelSetCards';
import useSetProgressHydration from '@/features/Progress/hooks/useSetProgress';
import {
  calculateVocabularySetProgressAndStars,
  selectAutoLearningSets,
  useAutoLearningStore,
  useSetProgressStore,
  writeAutoLearningHandoff,
} from '@/features/Progress';
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
import AutoLearningButton from '@/shared/ui-composite/Menu/AutoLearningButton';
import { AUTO_LEARNING_GAME_MODE } from '@/shared/ui-composite/Menu/lib/autoLearningConfig';
import { useRouter } from '@/core/i18n/routing';

import type { IWord } from '@/shared/types/interfaces';

const levelOrder: VocabLevel[] = ['n5', 'n4', 'n3', 'n2', 'n1'];
const WORDS_PER_SET = 10;
const VOCAB_COLLAPSED_ROWS_SESSION_KEY = 'vocab-collapsed-rows-by-unit';
const VOCAB_EIGHT_SUBUNIT_UNITS: VocabLevel[] = ['n3', 'n2', 'n1'];
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

interface VocabCardsProps {
  showAutoLearning?: boolean;
}

const VocabCards = ({ showAutoLearning = false }: VocabCardsProps) => {
  const router = useRouter();
  const persistedVocabSelector = useMenuSelectorStore(
    state => state.collections.vocabulary,
  );
  const selectedVocabCollectionName = persistedVocabSelector.selectedCollection;
  const selectedSubunitByUnit = persistedVocabSelector.selectedSubunitByUnit;
  const selectedVocabSets = useVocabStore(state => state.selectedVocabSets);
  const setSelectedVocabSets = useVocabStore(
    state => state.setSelectedVocabSets,
  );
  const reviewCursor = useAutoLearningStore(
    state => state.reviewCursors.vocabulary,
  );
  const hasAutoLearningSelection = useAutoLearningStore(
    state => state.activeSelections.vocabulary,
  );
  const setReviewCursor = useAutoLearningStore(state => state.setReviewCursor);
  const [isAutoLearning, setIsAutoLearning] = useState(false);
  const [autoLearningError, setAutoLearningError] = useState<string | null>(
    null,
  );
  const addWordObjs = useVocabStore(state => state.addVocabObjs);
  const { clearVocabObjs, clearVocabSets } = useVocabStore();
  const collapsedRowsByUnit = useVocabStore(state => state.collapsedRowsByUnit);
  const setCollapsedRowsForUnit = useVocabStore(
    state => state.setCollapsedRowsForUnit,
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
  const subunits = useMemo(() => {
    const defaultSubunits = buildSubunitsForUnit(
      activeUnitSummary.startLevel,
      activeUnitSummary.levelCount,
    );
    if (
      !VOCAB_EIGHT_SUBUNIT_UNITS.includes(activeUnitSummary.name) ||
      defaultSubunits.length <= 1
    ) {
      return defaultSubunits;
    }

    return buildSubunitsForUnit(
      activeUnitSummary.startLevel,
      activeUnitSummary.levelCount,
      {
        desiredSubunitCount: 8,
      },
    );
  }, [
    activeUnitSummary.levelCount,
    activeUnitSummary.name,
    activeUnitSummary.startLevel,
  ]);
  const selectedSubunitId =
    selectedSubunitByUnit[selectedVocabCollectionName] ?? subunits[0]?.id;
  const activeSubunitRange = useMemo(
    () =>
      subunits.find(subunit => subunit.id === selectedSubunitId) ?? subunits[0],
    [selectedSubunitId, subunits],
  );
  const collapsedRowsKey = `${selectedVocabCollectionName}:${activeSubunitRange.id}`;

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

  const isProgressHydrated = useSetProgressHydration();
  const vocabularyProgress = useSetProgressStore(
    state => state.data.vocabulary,
  );
  const getSetProgressSummary = useCallback(
    (items: IWord[]) =>
      calculateVocabularySetProgressAndStars(
        items.map(item => ({
          meaningCorrect: vocabularyProgress[item.word]?.meaningCorrect ?? 0,
          readingCorrect: vocabularyProgress[item.word]?.readingCorrect ?? 0,
        })),
      ),
    [vocabularyProgress],
  );
  const hasProgress = useMemo(
    () =>
      Object.values(vocabularyProgress).some(
        entry => entry.meaningCorrect > 0 || entry.readingCorrect > 0,
      ),
    [vocabularyProgress],
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
          level: VocabLevel;
          setName: string;
          startIndex: number;
          endIndex: number;
        };
        mastered: boolean;
      }> = [];

      for (const level of levelOrder) {
        const items = await vocabDataService.getVocabByLevel(level);
        const levelSets = Array.from(
          { length: Math.ceil(items.length / WORDS_PER_SET) },
          (_, index) => {
            const startIndex = index * WORDS_PER_SET;
            const endIndex = Math.min(
              (index + 1) * WORDS_PER_SET,
              items.length,
            );
            const setItems = items.slice(startIndex, endIndex);
            const setNumber = globalSetNumber;
            globalSetNumber += 1;
            return {
              id: `vocabulary:${level}:${index + 1}`,
              payload: {
                level,
                setName: `Set ${setNumber}`,
                startIndex,
                endIndex,
              },
              mastered:
                calculateVocabularySetProgressAndStars(
                  setItems.map(item => ({
                    meaningCorrect:
                      vocabularyProgress[item.word]?.meaningCorrect ?? 0,
                    readingCorrect:
                      vocabularyProgress[item.word]?.readingCorrect ?? 0,
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
        throw new Error('No Vocabulary sets are available for training.');
      }

      writeAutoLearningHandoff({
        dojo: 'vocabulary',
        gameMode: AUTO_LEARNING_GAME_MODE,
        sets: selection.selected.map(set => ({
          setName: set.payload.setName,
          level: set.payload.level,
          startIndex: set.payload.startIndex,
          endIndex: set.payload.endIndex,
        })),
      });
      setReviewCursor('vocabulary', selection.nextReviewCursor);
      router.push('/vocabulary/learn');
    } catch {
      setAutoLearningError('Could not load Vocabulary sets. Try again.');
      setIsAutoLearning(false);
    }
  };
  const initialCollections = useMemo(() => {
    const cached = vocabDataService.getAllCached();

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
      Record<VocabLevel, { data: IWord[]; name: string; prevLength: number }>
    >;
  }, [getCollectionName, unitSummaries]);

  return (
    <LevelSetCards<VocabLevel, IWord>
      levelOrder={levelOrder}
      selectedUnitName={selectedVocabCollectionName as VocabLevel}
      itemsPerSet={WORDS_PER_SET}
      getCollectionName={getCollectionName}
      getCollectionSize={getCollectionSize}
      loadItemsByLevel={loadItemsByLevel}
      selectedSets={hasAutoLearningSelection ? [] : selectedVocabSets}
      setSelectedSets={setSelectedVocabSets}
      clearSelected={() => {
        clearVocabObjs();
        clearVocabSets();
      }}
      toggleItems={items => addWordObjs(items)}
      collapsedRows={collapsedRows}
      setCollapsedRows={setCollapsedRows}
      renderSetDictionary={items => <VocabSetDictionary words={items} />}
      getSetProgressSummary={getSetProgressSummary}
      loadingText='Loading vocabulary sets...'
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

export default VocabCards;
