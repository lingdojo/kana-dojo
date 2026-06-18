'use client';
import clsx from 'clsx';
import { LayoutGroup, motion } from 'framer-motion';
import useKanjiStore from '@/features/Kanji/store/useKanjiStore';
import useVocabStore from '@/features/Vocabulary/store/useVocabStore';
import { usePathname } from 'next/navigation';
import { removeLocaleFromPath } from '@/shared/utils/pathUtils';
import {
  N5KanjiLength,
  N4KanjiLength,
  N3KanjiLength,
  N2KanjiLength,
  N1KanjiLength,
  N5VocabLength,
  N4VocabLength,
  N3VocabLength,
  N2VocabLength,
  N1VocabLength,
} from '@/shared/utils/unitSets';
import { useClick } from '@/shared/hooks/generic/useAudio';
import { ActionButton } from '@/shared/ui/components/ActionButton';
import { useEffect, useMemo, useState } from 'react';
import SelectionStatusBar from '@/shared/ui-composite/Menu/SelectionStatusBar';
import {
  buildSubunitsForUnit,
  buildUnitSummaries,
  shouldShowSubunitSelector,
  type SubunitSummary,
} from '@/shared/ui-composite/Menu/lib/unitSubunits';
import { useMenuSelectorStore } from '@/shared/ui-composite/Menu/store/useMenuSelectorStore';

type CollectionLevel = 'n5' | 'n4' | 'n3' | 'n2' | 'n1';
type ContentType = 'kanji' | 'vocabulary';
const VOCAB_UNIT_WITH_FEWER_SUBUNITS: CollectionLevel = 'n2';

// Calculate number of sets (10 items per set)
const calculateSets = (length: number) => Math.ceil(length / 10);

const KANJI_SETS = {
  n5: calculateSets(N5KanjiLength),
  n4: calculateSets(N4KanjiLength),
  n3: calculateSets(N3KanjiLength),
  n2: calculateSets(N2KanjiLength),
  n1: calculateSets(N1KanjiLength),
};

const VOCAB_SETS = {
  n5: calculateSets(N5VocabLength),
  n4: calculateSets(N4VocabLength),
  n3: calculateSets(N3VocabLength),
  n2: calculateSets(N2VocabLength),
  n1: calculateSets(N1VocabLength),
};

const getCollectionSubunits = (
  collection: {
    name: CollectionLevel;
    startLevel: number;
    levelCount: number;
  },
  isKanji: boolean,
) => {
  const defaultSubunits = buildSubunitsForUnit(
    collection.startLevel,
    collection.levelCount,
  );

  if (
    isKanji ||
    collection.name !== VOCAB_UNIT_WITH_FEWER_SUBUNITS ||
    defaultSubunits.length <= 1
  ) {
    return defaultSubunits;
  }

  return buildSubunitsForUnit(collection.startLevel, collection.levelCount, {
    desiredSubunitCount: defaultSubunits.length - 1,
  });
};

type SubunitSelectorProps = {
  subunits: SubunitSummary[];
  selectedSubunitId: string;
  onSelect: (subunitId: string) => void;
};

const SubunitSelector = ({
  subunits,
  selectedSubunitId,
  onSelect,
}: SubunitSelectorProps) => {
  if (subunits.length <= 1) {
    return null;
  }

  return (
    <div className='grid grid-cols-2 gap-2 sm:grid-cols-[repeat(auto-fit,minmax(120px,1fr))]'>
      {subunits.map(subunit => {
        const isSelected = subunit.id === selectedSubunitId;
        const shortLabel = subunit.label.replace('Levels ', '');

        return (
          <div key={subunit.id} className='relative flex'>
            {isSelected && (
              <motion.div
                layoutId='subunit-selector-indicator'
                className='absolute inset-0 rounded-2xl'
                transition={{
                  type: 'spring',
                  stiffness: 300,
                  damping: 30,
                }}
              >
                <div className='h-full w-full rounded-2xl border-b-6 border-(--secondary-color-accent) bg-(--secondary-color)' />
              </motion.div>
            )}
            <ActionButton
              onClick={() => onSelect(subunit.id)}
              borderBottomThickness={0}
              borderRadius='2xl'
              className={clsx(
                'relative z-10 flex h-full w-full items-center justify-center px-4 pt-3 pb-4 text-center text-sm',
                isSelected
                  ? 'bg-transparent text-(--background-color)'
                  : 'bg-transparent text-(--main-color) hover:bg-(--border-color)/50',
              )}
            >
              <span className='hidden sm:inline'>
                Levels <span className='whitespace-nowrap'>{shortLabel}</span>
              </span>
              <span className='inline sm:hidden'>{shortLabel}</span>
            </ActionButton>
          </div>
        );
      })}
    </div>
  );
};

const UnitSelector = () => {
  const { playClick } = useClick();
  const pathname = usePathname();
  const pathWithoutLocale = removeLocaleFromPath(pathname);
  const contentType = pathWithoutLocale.split('/')[1] as ContentType;

  const isKanji = contentType === 'kanji';
  const storageContentType = isKanji ? 'kanji' : 'vocabulary';
  const persistedCollectionSelection = useMenuSelectorStore(
    state => state.collections[storageContentType],
  );
  const setPersistedCollectionSelection = useMenuSelectorStore(
    state => state.setCollectionSelection,
  );
  const setPersistedCollectionSubunit = useMenuSelectorStore(
    state => state.setCollectionSubunit,
  );

  // Toggle between old (sliding indicator) and new (action buttons) design
  const useNewUnitSelectorDesign = false;

  const clearKanji = useKanjiStore(state => state.clearKanjiObjs);
  const clearKanjiSets = useKanjiStore(state => state.clearKanjiSets);
  const clearVocab = useVocabStore(state => state.clearVocabObjs);
  const clearVocabSets = useVocabStore(state => state.clearVocabSets);

  const collections = useMemo(() => {
    const levels: CollectionLevel[] = ['n5', 'n4', 'n3', 'n2', 'n1'];
    const sizes = isKanji ? KANJI_SETS : VOCAB_SETS;

    return buildUnitSummaries(levels, level => sizes[level]);
  }, [isKanji]);

  const persistedCollectionExists = collections.some(
    collection =>
      collection.name === persistedCollectionSelection.selectedCollection,
  );
  const selectedCollection = persistedCollectionExists
    ? persistedCollectionSelection.selectedCollection
    : 'n5';
  const [visualCollection, setVisualCollection] =
    useState<CollectionLevel>(selectedCollection);
  const [visualSubunitByUnit, setVisualSubunitByUnit] = useState<
    Partial<Record<CollectionLevel, string>>
  >(persistedCollectionSelection.selectedSubunitByUnit);

  useEffect(() => {
    const syncFrameId = window.requestAnimationFrame(() => {
      setVisualCollection(selectedCollection);
      setVisualSubunitByUnit(persistedCollectionSelection.selectedSubunitByUnit);
    });

    return () => {
      window.cancelAnimationFrame(syncFrameId);
    };
  }, [
    persistedCollectionSelection.selectedSubunitByUnit,
    selectedCollection,
  ]);

  const handleCollectionSelect = (level: CollectionLevel) => {
    playClick();
    const selectedUnit = collections.find(
      collection => collection.name === level,
    );
    const subunitsForLevel = selectedUnit
      ? getCollectionSubunits(selectedUnit, isKanji)
      : [];
    const firstSubunitId = subunitsForLevel[0]?.id;
    const savedSubunitForLevel = visualSubunitByUnit[level];
    const savedSubunitExists = subunitsForLevel.some(
      s => s.id === savedSubunitForLevel,
    );
    const subunitToRestore =
      savedSubunitExists && savedSubunitForLevel
        ? savedSubunitForLevel
        : firstSubunitId;
    const nextSubunitByUnit = {
      ...visualSubunitByUnit,
      ...(subunitToRestore ? { [level]: subunitToRestore } : {}),
    };

    setVisualCollection(level);
    setVisualSubunitByUnit(nextSubunitByUnit);

    if (isKanji) {
      clearKanji();
      clearKanjiSets();
      setPersistedCollectionSelection('kanji', {
        selectedCollection: level,
        selectedSubunitByUnit: nextSubunitByUnit,
      });
      return;
    }

    clearVocab();
    clearVocabSets();
    setPersistedCollectionSelection('vocabulary', {
      selectedCollection: level,
      selectedSubunitByUnit: nextSubunitByUnit,
    });
  };

  const activeCollection = collections.find(
    collection => collection.name === visualCollection,
  );
  const activeSubunits = activeCollection
    ? getCollectionSubunits(activeCollection, isKanji)
    : [];
  const selectedSubunitId =
    visualSubunitByUnit[visualCollection];
  const selectedSubunitExists = activeSubunits.some(
    subunit => subunit.id === selectedSubunitId,
  );
  const resolvedSelectedSubunitId =
    selectedSubunitExists && selectedSubunitId
      ? selectedSubunitId
      : activeSubunits[0]?.id || '';
  const showSubunitSelector = Boolean(
    activeCollection && shouldShowSubunitSelector(activeCollection.levelCount),
  );

  const handleSubunitSelect = (subunitId: string) => {
    playClick();
    const nextSubunitByUnit = {
      ...visualSubunitByUnit,
      [visualCollection]: subunitId,
    };
    setVisualSubunitByUnit(nextSubunitByUnit);

    if (isKanji) {
      clearKanji();
      clearKanjiSets();
      setPersistedCollectionSubunit('kanji', visualCollection, subunitId);
      return;
    }

    clearVocab();
    clearVocabSets();
    setPersistedCollectionSubunit('vocabulary', visualCollection, subunitId);
  };

  if (useNewUnitSelectorDesign) {
    // New design: All units as equal ActionButtons (matching PreGameScreen)
    return (
      <div className='flex flex-col'>
        {/* Unit Selector - ActionButton style matching PreGameScreen */}
        <div className='flex flex-col gap-4 md:flex-row'>
          {collections.map(collection => {
            const isSelected = collection.name === visualCollection;

            return (
              <ActionButton
                key={collection.name}
                onClick={() => handleCollectionSelect(collection.name)}
                colorScheme={isSelected ? 'main' : 'secondary'}
                borderColorScheme={isSelected ? 'main' : 'secondary'}
                borderBottomThickness={14}
                borderRadius='4xl'
                className={clsx(
                  'flex-1 flex-col gap-1 px-4 pt-4 pb-6',
                  !isSelected && 'opacity-60',
                )}
              >
                <div className='flex items-center gap-2'>
                  <span className='text-xl'>{collection.displayName}</span>
                  <span
                    className={clsx(
                      'rounded px-1.5 py-0.5 text-xs',
                      isSelected
                        ? 'bg-(--background-color)/20 text-(--background-color)'
                        : 'bg-(--background-color)/20 text-(--background-color)',
                    )}
                  >
                    {collection.jlpt}
                  </span>
                </div>
                <span
                  className={clsx(
                    'text-xs',
                    isSelected
                      ? 'text-(--background-color)/80'
                      : 'text-(--background-color)/80',
                  )}
                >
                  {collection.subtitle}
                </span>
              </ActionButton>
            );
          })}
        </div>

        {/* Selection Status Bar - Fixed at top */}
        <SelectionStatusBar />
      </div>
    );
  }

  // Old design: Card background with sliding indicator animation
  return (
    <div className='flex flex-col'>
      {/* Modern Toggle-Style Unit Selector */}
      <LayoutGroup id={`${storageContentType}-unit-selector`}>
        <motion.div className='flex flex-col rounded-4xl border-1 border-(--border-color) bg-(--background-color) p-1 shadow-[0_12px_40px_rgba(0,0,0,0.12)] backdrop-blur-xl'>
          <div className='flex w-full flex-col rounded-[28px] bg-(--card-color) p-2'>
            <div className='flex flex-col gap-2 md:flex-row'>
              {collections.map(collection => {
                const isSelected = collection.name === visualCollection;

                return (
                  <div key={collection.name} className='relative flex-1'>
                    {/* Sliding indicator - smooth animation matching Kana selector */}
                    {isSelected && (
                      <motion.div
                        layoutId='collection-selector-indicator'
                        className='absolute inset-0 rounded-3xl'
                        transition={{
                          type: 'spring',
                          stiffness: 300,
                          damping: 30,
                        }}
                      >
                        <div className='h-full w-full rounded-3xl border-b-10 border-(--main-color-accent) bg-(--main-color)' />
                      </motion.div>
                    )}
                    <ActionButton
                      onClick={() => handleCollectionSelect(collection.name)}
                      colorScheme={isSelected ? undefined : undefined}
                      borderColorScheme={isSelected ? undefined : undefined}
                      borderBottomThickness={0}
                      borderRadius='3xl'
                      className={clsx(
                        'relative z-10 w-full flex-col gap-1 px-4 pt-4 pb-6',
                        isSelected
                          ? 'bg-transparent text-(--background-color)'
                          : 'bg-transparent text-(--main-color) hover:bg-(--border-color)/50',
                      )}
                    >
                      <div className='flex items-center gap-2'>
                        <span className='text-xl'>{collection.displayName}</span>
                        <span
                          className={clsx(
                            'rounded px-1.5 py-0.5 text-xs',
                            'bg-(--border-color) text-(--secondary-color)',
                          )}
                        >
                          {collection.jlpt}
                        </span>
                      </div>
                      <span
                        className={clsx(
                          'text-xs',
                          isSelected
                            ? 'text-(--background-color)/80'
                            : 'text-(--secondary-color)/80',
                        )}
                      >
                        {collection.subtitle}
                      </span>
                    </ActionButton>
                  </div>
                );
              })}
            </div>

            {showSubunitSelector && (
              <>
                <div className='-mx-2 my-3 h-0.5 bg-(--border-color)' />
                <div className='px-2 pb-1'>
                  <SubunitSelector
                    subunits={activeSubunits}
                    selectedSubunitId={resolvedSelectedSubunitId}
                    onSelect={handleSubunitSelect}
                  />
                </div>
              </>
            )}
          </div>
        </motion.div>
      </LayoutGroup>

      {/* Selection Status Bar - Fixed at top */}
      <SelectionStatusBar />
    </div>
  );
};

export default UnitSelector;
