'use client';
import clsx from 'clsx';
import { motion } from 'framer-motion';
import { useKanjiSelection } from '@/features/Kanji';
import { useVocabSelection } from '@/features/Vocabulary';
import { usePathname } from 'next/navigation';
import { removeLocaleFromPath } from '@/shared/lib/pathUtils';
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
} from '@/shared/lib/unitSets';
import { useClick } from '@/shared/hooks/useAudio';
import { ActionButton } from '@/shared/components/ui/ActionButton';
import { useMemo } from 'react';
import SelectionStatusBar from '@/shared/components/Menu/SelectionStatusBar';

type CollectionLevel = 'n5' | 'n4' | 'n3' | 'n2' | 'n1';
type ContentType = 'kanji' | 'vocabulary';

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

const UnitSelector = () => {
  const { playClick } = useClick();
  const pathname = usePathname();
  const pathWithoutLocale = removeLocaleFromPath(pathname);
  const contentType = pathWithoutLocale.slice(1) as ContentType;

  const isKanji = contentType === 'kanji';

  // Toggle between old (sliding indicator) and new (action buttons) design
  const useNewUnitSelectorDesign = false;

  // Kanji store
  const kanjiSelection = useKanjiSelection();
  const selectedKanjiCollection = kanjiSelection.selectedCollection;
  const setSelectedKanjiCollection = kanjiSelection.setCollection;

  // Vocab store
  const vocabSelection = useVocabSelection();
  const selectedVocabCollection = vocabSelection.selectedCollection;
  const setSelectedVocabCollection = vocabSelection.setCollection;

  // Current content type values
  const selectedCollection = isKanji
    ? selectedKanjiCollection
    : selectedVocabCollection;
  const setSelectedCollection = isKanji
    ? setSelectedKanjiCollection
    : setSelectedVocabCollection;
  const sets = isKanji ? KANJI_SETS : VOCAB_SETS;

  const handleCollectionSelect = (level: CollectionLevel) => {
    playClick();
    setSelectedCollection(level);
    if (isKanji) {
      kanjiSelection.clearKanji();
      kanjiSelection.clearSets();
    } else {
      vocabSelection.clearVocab();
      vocabSelection.clearSets();
    }
  };

  // Generate collection data with cumulative set ranges
  const collections = useMemo(() => {
    const levels: CollectionLevel[] = ['n5', 'n4', 'n3', 'n2', 'n1'];
    let cumulativeSets = 0;

    return levels.map((level, index) => {
      const setCount = sets[level];
      const startSet = cumulativeSets + 1;
      const endSet = cumulativeSets + setCount;
      cumulativeSets = endSet;

      return {
        name: level,
        displayName: `Unit ${index + 1}`,
        subtitle: `Levels ${startSet}-${endSet}`,
        jlpt: level.toUpperCase(),
      };
    });
  }, [sets]);

  if (useNewUnitSelectorDesign) {
    // New design: All units as equal ActionButtons (matching PreGameScreen)
    return (
      <div className='flex flex-col'>
        {/* Unit Selector - ActionButton style matching PreGameScreen */}
        <div className='flex flex-col gap-4 md:flex-row'>
          {collections.map(collection => {
            const isSelected = collection.name === selectedCollection;

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
      <div className='flex flex-col gap-2 rounded-[2rem] bg-(--card-color) p-2 md:flex-row'>
        {collections.map(collection => {
          const isSelected = collection.name === selectedCollection;

          return (
            <div key={collection.name} className='relative flex-1'>
              {/* Sliding indicator - smooth animation matching Stats page */}
              {isSelected && (
                <motion.div
                  layoutId='collection-selector-indicator'
                  className='absolute inset-0 rounded-3xl border-b-10 border-(--main-color-accent) bg-(--main-color)'
                  transition={{
                    type: 'spring',
                    stiffness: 300,
                    damping: 30,
                  }}
                />
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

      {/* Selection Status Bar - Fixed at top */}
      <SelectionStatusBar />
    </div>
  );
};

export default UnitSelector;
