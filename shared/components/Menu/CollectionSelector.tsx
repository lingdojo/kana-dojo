'use client';
import clsx from 'clsx';
import useKanjiStore from '@/features/Kanji/store/useKanjiStore';
import useVocabStore from '@/features/Vocabulary/store/useVocabStore';
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
  N1VocabLength
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
  n1: calculateSets(N1KanjiLength)
};

const VOCAB_SETS = {
  n5: calculateSets(N5VocabLength),
  n4: calculateSets(N4VocabLength),
  n3: calculateSets(N3VocabLength),
  n2: calculateSets(N2VocabLength),
  n1: calculateSets(N1VocabLength)
};

const CollectionSelector = () => {
  const { playClick } = useClick();
  const pathname = usePathname();
  const pathWithoutLocale = removeLocaleFromPath(pathname);
  const contentType = pathWithoutLocale.slice(1) as ContentType;

  const isKanji = contentType === 'kanji';

  // Kanji store
  const {
    selectedKanjiCollection,
    setSelectedKanjiCollection,
    clearKanjiObjs,
    clearKanjiSets
  } = useKanjiStore();

  // Vocab store
  const {
    selectedVocabCollection,
    setSelectedVocabCollection,
    clearVocabObjs,
    clearVocabSets
  } = useVocabStore();

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
      clearKanjiObjs();
      clearKanjiSets();
    } else {
      clearVocabObjs();
      clearVocabSets();
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
        jlpt: level.toUpperCase()
      };
    });
  }, [sets]);

  return (
    <div className='flex flex-col'>
      {/* Modern Toggle-Style Unit Selector */}
      <div className='flex rounded-2xl bg-[var(--card-color)] p-4 gap-4 flex-col md:flex-row'>
        {collections.map(collection => {
          const isSelected = collection.name === selectedCollection;

          return (
            <ActionButton
              key={collection.name}
              onClick={() => handleCollectionSelect(collection.name)}
              colorScheme={isSelected ? 'main' : undefined}
              borderColorScheme={isSelected ? 'main' : undefined}
              borderBottomThickness={isSelected ? 6 : 0}
              className={clsx(
                'flex-1 px-4 py-3 flex-col gap-1',
                isSelected
                  ? 'bg-[var(--main-color)]/80'
                  : 'bg-transparent text-[var(--main-color)] hover:bg-[var(--border-color)]/50'
              )}
            >
              <div className='flex items-center gap-2'>
                <span className='text-xl'>{collection.displayName}</span>
                <span
                  className={clsx(
                    'text-xs px-1.5 py-0.5 rounded',
                    'bg-[var(--border-color)] text-[var(--secondary-color)]'
                  )}
                >
                  {collection.jlpt}
                </span>
              </div>
              <span
                className={clsx(
                  'text-xs',
                  isSelected
                    ? 'text-[var(--background-color)]/80'
                    : 'text-[var(--secondary-color)]/80'
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
};

export default CollectionSelector;
