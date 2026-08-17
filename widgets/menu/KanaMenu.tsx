'use client';

import { useEffect, useMemo, useState } from 'react';
import Info from '@/shared/ui-composite/Menu/Info';
import TrainingActionBar from '@/shared/ui-composite/Menu/TrainingActionBar';
import SelectionStatusBar from '@/shared/ui-composite/Menu/SelectionStatusBar';
import { ActionButton } from '@/shared/ui/components/ActionButton';
import { LayoutGrid, List, MousePointer } from 'lucide-react';
import { cn } from '@/shared/utils/utils';
import { useClick } from '@/shared/hooks/generic/useAudio';
import { KanaCards, useKanaContent, useKanaSelection } from '@/features/Kana';
import KanaUnitSelector, {
  type KanaType,
} from '@/features/Kana/components/KanaCards/KanaUnitSelector';
import { useMenuSelectorStore } from '@/shared/ui-composite/Menu/store/useMenuSelectorStore';
import AutoLearningButton from '@/shared/ui-composite/Menu/AutoLearningButton';
import { AUTO_LEARNING_GAME_MODE } from '@/shared/ui-composite/Menu/lib/autoLearningConfig';
import {
  calculateKanaSetProgressAndStars,
  selectAutoLearningSets,
  useAutoLearningStore,
  useStatsStore,
  writeAutoLearningHandoff,
} from '@/features/Progress';
import { useRouter } from '@/core/i18n/routing';

type KanaMenuFilter = 'all' | 'hiragana' | 'katakana';

const SUBSET_SLICE_RANGES: Record<string, [number, number]> = {
  'hiragana-base': [0, 10],
  'hiragana-dakuon': [10, 15],
  'hiragana-yoon': [15, 26],
  'katakana-base': [26, 36],
  'katakana-dakuon': [36, 41],
  'katakana-yoon': [41, 52],
  'katakana-foreign': [52, 60],
};

const KANA_TYPE_LABELS: Record<KanaType, string> = {
  hiragana: 'Hiragana',
  katakana: 'Katakana',
};

const SUBSET_LABELS: Record<KanaType, Record<string, string>> = {
  hiragana: { base: 'Base', dakuon: 'Dakuon', yoon: 'Yoon' },
  katakana: {
    base: 'Base',
    dakuon: 'Dakuon',
    yoon: 'Yoon',
    foreign: 'Foreign',
  },
};

const KanaMenu = ({ filter = 'all' }: { filter?: KanaMenuFilter }) => {
  const { playClick } = useClick();
  const { addGroups: addKanaGroupIndices, replaceGroups } = useKanaSelection();
  const { allGroups: kana } = useKanaContent();
  const router = useRouter();
  const characterMastery = useStatsStore(
    state => state.allTimeStats.characterMastery,
  );
  const reviewCursor = useAutoLearningStore(state => state.reviewCursors.kana);
  const setReviewCursor = useAutoLearningStore(state => state.setReviewCursor);
  const isAutoSelectionActive = useAutoLearningStore(
    state => state.activeSelections.kana,
  );
  const setAutoSelectionActive = useAutoLearningStore(
    state => state.setAutoSelectionActive,
  );
  const [isAutoLearning, setIsAutoLearning] = useState(false);
  const [autoLearningError, setAutoLearningError] = useState<string | null>(
    null,
  );
  const [viewMode, setViewMode] = useState<'full' | 'compact'>('full');

  useEffect(() => {
    if (!isAutoSelectionActive) return;
    replaceGroups([]);
    setAutoSelectionActive('kana', false);
  }, [isAutoSelectionActive, replaceGroups, setAutoSelectionActive]);

  const persistedKanaSelection = useMenuSelectorStore(state => state.kana);
  const setPersistedKanaSelection = useMenuSelectorStore(
    state => state.setKanaSelection,
  );
  const [fallbackFilterOverride, setFallbackFilterOverride] =
    useState<KanaType>('hiragana');
  const [fallbackSelectedSubset, setFallbackSelectedSubset] =
    useState<string>('base');
  const shouldUsePersistedSelection = filter === 'all' && viewMode === 'full';
  const filterOverride = shouldUsePersistedSelection
    ? persistedKanaSelection.selected
    : fallbackFilterOverride;
  const selectedSubset = shouldUsePersistedSelection
    ? persistedKanaSelection.selectedSubset
    : fallbackSelectedSubset;

  const kanaTypeLabel = KANA_TYPE_LABELS[filterOverride];
  const subsetLabel = SUBSET_LABELS[filterOverride]?.[selectedSubset];
  const selectAllLabel = `Select  ${kanaTypeLabel} ${subsetLabel}`;

  const hasKanaProgress = useMemo(
    () =>
      kana
        .slice(0, 60)
        .some(group =>
          group.kana.some(char => (characterMastery[char]?.correct ?? 0) > 0),
        ),
    [characterMastery, kana],
  );

  const handleAutoLearning = async () => {
    if (isAutoLearning) return;
    setIsAutoLearning(true);
    setAutoLearningError(null);

    try {
      const orderedSets = kana.slice(0, 60).map((group, index) => ({
        id: group.groupName,
        payload: { group, index },
        mastered:
          calculateKanaSetProgressAndStars(
            group.kana.map(char => ({
              correct: characterMastery[char]?.correct ?? 0,
            })),
          ).stars === 3,
      }));
      const selection = selectAutoLearningSets(orderedSets, reviewCursor);

      if (selection.selected.length === 0) {
        throw new Error('No Kana groups are available for training.');
      }

      playClick();
      writeAutoLearningHandoff({
        dojo: 'kana',
        gameMode: AUTO_LEARNING_GAME_MODE,
        sets: selection.selected.map(set => ({
          startIndex: set.payload.index,
          endIndex: set.payload.index + 1,
        })),
      });
      setReviewCursor('kana', selection.nextReviewCursor);
      router.push('/kana/learn');
    } catch {
      setAutoLearningError(
        'Could not prepare your learning session. Try again.',
      );
      setIsAutoLearning(false);
    }
  };

  return (
    <>
      <div className='flex flex-col gap-3'>
        <Info />
        {viewMode === 'full' && (
          <KanaUnitSelector
            selected={filterOverride}
            onSelect={type => {
              if (shouldUsePersistedSelection) {
                const savedSubset =
                  persistedKanaSelection.selectedSubsetByUnit[type];
                setPersistedKanaSelection({
                  selected: type,
                  selectedSubset: savedSubset ?? 'base',
                });
                return;
              }

              setFallbackFilterOverride(type);
              setFallbackSelectedSubset('base');
            }}
            selectedSubset={selectedSubset}
            onSubsetSelect={subset => {
              if (shouldUsePersistedSelection) {
                setPersistedKanaSelection({
                  selected: filterOverride,
                  selectedSubset: subset,
                });
                return;
              }

              setFallbackSelectedSubset(subset);
            }}
          />
        )}
        <div className='flex w-full flex-row items-center gap-2'>
          {filter === 'all' ? (
            <AutoLearningButton
              hasProgress={hasKanaProgress}
              isLoading={isAutoLearning}
              error={autoLearningError}
              onClick={() => void handleAutoLearning()}
              className='flex-1'
            />
          ) : (
            <ActionButton
              onClick={e => {
                e.currentTarget.blur();
                playClick();
                if (viewMode === 'full') {
                  const key = `${filterOverride}-${selectedSubset}`;
                  const sliceRange = SUBSET_SLICE_RANGES[key];
                  if (sliceRange) {
                    const indices = Array.from(
                      { length: sliceRange[1] - sliceRange[0] },
                      (_, i) => sliceRange[0] + i,
                    );
                    addKanaGroupIndices(indices);
                  }
                } else {
                  const indices = kana
                    .map((k, i) => ({ k, i }))
                    .filter(({ k }) => {
                      if (k.groupName.startsWith('challenge.')) return false;
                      if (filter === 'hiragana')
                        return k.groupName.startsWith('h.');
                      if (filter === 'katakana')
                        return k.groupName.startsWith('k.');
                      return true;
                    })
                    .map(({ i }) => i);
                  addKanaGroupIndices(indices);
                }
              }}
              className='flex-1 px-2 py-2 sm:py-3'
              borderBottomThickness={14}
              borderRadius='3xl'
            >
              <MousePointer className={cn('fill-current')} />
              {viewMode === 'full' ? selectAllLabel : 'Select All Kana'}
            </ActionButton>
          )}
          {/*
            Previous root Kana selection button retained for easy restoration:
            <ActionButton
              onClick={e => {
                e.currentTarget.blur();
                playClick();
                if (viewMode === 'full') {
                  const key = `${filterOverride}-${selectedSubset}`;
                  const sliceRange = SUBSET_SLICE_RANGES[key];
                  if (sliceRange) {
                    const indices = Array.from(
                      { length: sliceRange[1] - sliceRange[0] },
                      (_, i) => sliceRange[0] + i,
                    );
                    addKanaGroupIndices(indices);
                  }
                } else {
                  const indices = kana
                    .map((k, i) => ({ k, i }))
                    .filter(({ k }) => {
                      if (k.groupName.startsWith('challenge.')) return false;
                      if (filter === 'hiragana') return k.groupName.startsWith('h.');
                      if (filter === 'katakana') return k.groupName.startsWith('k.');
                      return true;
                    })
                    .map(({ i }) => i);
                  addKanaGroupIndices(indices);
                }
              }}
              className='flex-1 px-2 py-2 sm:py-3'
              borderBottomThickness={14}
              borderRadius='3xl'
            >
              <MousePointer className={cn('fill-current')} />
              {viewMode === 'full' ? selectAllLabel : 'Select All Kana'}
            </ActionButton>
          */}
          <ActionButton
            onClick={() => {
              playClick();
              setViewMode(v => (v === 'full' ? 'compact' : 'full'));
            }}
            className='w-auto self-stretch px-4 py-2 sm:px-8 sm:py-3'
            borderBottomThickness={14}
            borderRadius='3xl'
            colorScheme='secondary'
            borderColorScheme='secondary'
          >
            {viewMode === 'full' ? (
              <LayoutGrid size={22} fill='currentColor' />
            ) : (
              <List size={22} />
            )}
          </ActionButton>
        </div>
        <KanaCards
          filter={filter}
          viewMode={viewMode}
          selectedKanaType={filterOverride}
          selectedSubset={selectedSubset}
        />
        <SelectionStatusBar />
      </div>
      <TrainingActionBar currentDojo='kana' />
    </>
  );
};

export default KanaMenu;
