'use client';
import clsx from 'clsx';
import { motion } from 'framer-motion';
import { useKanjiSelection } from '@/features/Kanji';
import { useVocabSelection } from '@/features/Vocabulary';
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
import {
  Accordion,
  AccordionContent,
  AccordionItem,
} from '@/shared/ui/components/accordion';
import { useMemo } from 'react';
import SelectionStatusBar from '@/shared/ui-composite/Menu/SelectionStatusBar';
import SubunitSelector from '@/shared/ui-composite/Menu/SubunitSelector';
import {
  buildSubunitsForUnit,
  buildUnitSummaries,
  shouldShowSubunitSelector,
} from '@/shared/ui-composite/Menu/lib/unitSubunits';

type CollectionLevel = 'n5' | 'n4' | 'n3' | 'n2' | 'n1';
type ContentType = 'kanji' | 'vocabulary';

const UNIT_SELECTOR_ACTIVE_FLOAT_CLASSES =
  'motion-safe:animate-float [--float-distance:-3px] delay-500ms';

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
  const contentType = pathWithoutLocale.split('/')[1] as ContentType;

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

  const collections = useMemo(() => {
    const levels: CollectionLevel[] = ['n5', 'n4', 'n3', 'n2', 'n1'];
    const sizes = isKanji ? KANJI_SETS : VOCAB_SETS;

    return buildUnitSummaries(levels, level => sizes[level]);
  }, [isKanji]);

  const handleCollectionSelect = (level: CollectionLevel) => {
    playClick();
    const selectedUnit = collections.find(
      collection => collection.name === level,
    );
    const firstSubunitId = selectedUnit
      ? buildSubunitsForUnit(
          selectedUnit.startLevel,
          selectedUnit.levelCount,
        )[0]?.id
      : undefined;

    if (isKanji) {
      setSelectedKanjiCollection(level as CollectionLevel);
      kanjiSelection.clearKanji();
      kanjiSelection.clearSets();
      if (firstSubunitId) {
        kanjiSelection.setSubunitForUnit(level, firstSubunitId);
      }
      return;
    }

    setSelectedVocabCollection(level);
    vocabSelection.clearVocab();
    vocabSelection.clearSets();
    if (firstSubunitId) {
      vocabSelection.setSubunitForUnit(level, firstSubunitId);
    }
  };

  const activeCollection = collections.find(
    collection => collection.name === selectedCollection,
  );
  const activeSubunits = activeCollection
    ? buildSubunitsForUnit(
        activeCollection.startLevel,
        activeCollection.levelCount,
      )
    : [];
  const selectedSubunitId = isKanji
    ? kanjiSelection.selectedSubunitByUnit[
        selectedCollection as CollectionLevel
      ]
    : vocabSelection.selectedSubunitByUnit[selectedCollection];
  const resolvedSelectedSubunitId =
    selectedSubunitId || activeSubunits[0]?.id || '';
  const showSubunitSelector = Boolean(
    activeCollection && shouldShowSubunitSelector(activeCollection.levelCount),
  );

  const handleSubunitSelect = (subunitId: string) => {
    playClick();
    if (isKanji) {
      kanjiSelection.clearKanji();
      kanjiSelection.clearSets();
      kanjiSelection.setSubunitForUnit(
        selectedCollection as CollectionLevel,
        subunitId,
      );
      return;
    }

    vocabSelection.clearVocab();
    vocabSelection.clearSets();
    vocabSelection.setSubunitForUnit(selectedCollection, subunitId);
  };

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
      <motion.div className='flex flex-col rounded-4xl border-1 border-(--border-color) bg-(--background-color) p-1 shadow-[0_12px_40px_rgba(0,0,0,0.12)] backdrop-blur-xl'>
        <div className='flex w-full flex-col rounded-[28px] bg-(--card-color) p-2'>
          <div className='flex flex-col gap-2 md:flex-row'>
            {collections.map(collection => {
              const isSelected = collection.name === selectedCollection;

              return (
                <div key={collection.name} className='relative flex-1'>
                  {/* Sliding indicator - smooth animation matching Stats page */}
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
                      <div
                        className={clsx(
                          'h-full w-full rounded-3xl border-b-10 border-(--main-color-accent) bg-(--main-color)',
                          UNIT_SELECTOR_ACTIVE_FLOAT_CLASSES,
                        )}
                      />
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
                      isSelected && UNIT_SELECTOR_ACTIVE_FLOAT_CLASSES,
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

          <Accordion
            className='-mx-2'
            type='single'
            collapsible
            value={showSubunitSelector ? 'subunits' : undefined}
          >
            <AccordionItem value='subunits' className='border-none'>
              <AccordionContent className='pb-1'>
                <div className='px-2'>
                  <div className='-mx-2 my-3 h-0.5 bg-(--border-color)' />
                  <SubunitSelector
                    subunits={activeSubunits}
                    selectedSubunitId={resolvedSelectedSubunitId}
                    onSelect={handleSubunitSelect}
                  />
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </motion.div>

      {/* Selection Status Bar - Fixed at top */}
      <SelectionStatusBar />
    </div>
  );
};

export default UnitSelector;
