'use client';

import clsx from 'clsx';
import { chunkArray } from '@/shared/lib/helperFunctions';
import { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { cardBorderStyles } from '@/shared/lib/styles';
import useGridColumns from '@/shared/hooks/useGridColumns';
import { useClick } from '@/shared/hooks/useAudio';
import {
  ChevronUp,
  CircleCheck,
  Circle,
  Filter,
  FilterX,
  Loader2
} from 'lucide-react';
import useVocabStore from '@/features/Vocabulary/store/useVocabStore';
import useStatsStore from '@/features/Progress/store/useStatsStore';
import VocabSetDictionary from '@/features/Vocabulary/components/SetDictionary';
import { IWord } from '@/shared/types/interfaces';
import {
  vocabDataService,
  VocabLevel
} from '@/features/Vocabulary/services/vocabDataService';

const levelOrder: VocabLevel[] = ['n5', 'n4', 'n3', 'n2', 'n1'];
const WORDS_PER_SET = 10;
const INITIAL_ROWS = 5;
const ROWS_PER_LOAD = 5;

const vocabCollectionNames: Record<VocabLevel, string> = {
  n5: 'N5',
  n4: 'N4',
  n3: 'N3',
  n2: 'N2',
  n1: 'N1'
};

type VocabCollectionMeta = {
  data: IWord[];
  name: string;
  prevLength: number;
};

const VocabCards = () => {
  const selectedVocabCollectionName = useVocabStore(
    state => state.selectedVocabCollection
  );

  const selectedVocabSets = useVocabStore(state => state.selectedVocabSets);
  const setSelectedVocabSets = useVocabStore(
    state => state.setSelectedVocabSets
  );
  const addWordObjs = useVocabStore(state => state.addVocabObjs);
  const collapsedRowsByUnit = useVocabStore(state => state.collapsedRowsByUnit);
  const setCollapsedRowsForUnit = useVocabStore(
    state => state.setCollapsedRowsForUnit
  );
  const allTimeStats = useStatsStore(state => state.allTimeStats);

  const { playClick } = useClick();
  const [vocabCollections, setVocabCollections] = useState<
    Partial<Record<VocabLevel, VocabCollectionMeta>>
  >({});

  // Track cumulative set counts for proper level numbering
  const [cumulativeCounts, setCumulativeCounts] = useState<Record<
    VocabLevel,
    number
  > | null>(null);

  // Load cumulative counts once (lightweight - just needs lengths)
  useEffect(() => {
    let isMounted = true;

    const loadCumulativeCounts = async () => {
      const counts: Record<VocabLevel, number> = {
        n5: 0,
        n4: 0,
        n3: 0,
        n2: 0,
        n1: 0
      };
      let cumulative = 0;

      for (const level of levelOrder) {
        counts[level] = cumulative;
        const words = await vocabDataService.getVocabByLevel(level);
        cumulative += Math.ceil(words.length / WORDS_PER_SET);
      }

      if (isMounted) {
        setCumulativeCounts(counts);
      }
    };

    void loadCumulativeCounts();
    return () => {
      isMounted = false;
    };
  }, []);

  // Only load the currently selected collection (lazy loading)
  useEffect(() => {
    let isMounted = true;
    const level = selectedVocabCollectionName as VocabLevel;

    // Skip if cumulative counts not loaded yet or collection already loaded
    if (!cumulativeCounts || vocabCollections[level]) return;

    const loadSelectedCollection = async () => {
      const words = await vocabDataService.getVocabByLevel(level);

      if (!isMounted) return;

      setVocabCollections(prev => ({
        ...prev,
        [level]: {
          data: words,
          name: vocabCollectionNames[level],
          prevLength: cumulativeCounts[level]
        }
      }));
    };

    void loadSelectedCollection();

    return () => {
      isMounted = false;
    };
  }, [selectedVocabCollectionName, cumulativeCounts, vocabCollections]);

  const selectedCollectionKey = selectedVocabCollectionName as VocabLevel;
  const selectedVocabCollection = vocabCollections[selectedCollectionKey];

  // Filter state for hiding mastered cards
  const [hideMastered, setHideMastered] = useState(false);

  // Calculate mastered characters (accuracy >= 90%, attempts >= 10)
  const masteredWords = useMemo(() => {
    const mastered = new Set<string>();
    Object.entries(allTimeStats.characterMastery).forEach(([word, stats]) => {
      const total = stats.correct + stats.incorrect;
      const accuracy = total > 0 ? stats.correct / total : 0;
      if (total >= 10 && accuracy >= 0.9) {
        mastered.add(word);
      }
    });
    return mastered;
  }, [allTimeStats.characterMastery]);

  // Get collapsed rows for current unit from store
  const collapsedRows = collapsedRowsByUnit[selectedVocabCollectionName] || [];
  const setCollapsedRows = useCallback(
    (updater: number[] | ((prev: number[]) => number[])) => {
      const newRows =
        typeof updater === 'function' ? updater(collapsedRows) : updater;
      setCollapsedRowsForUnit(selectedVocabCollectionName, newRows);
    },
    [collapsedRows, selectedVocabCollectionName, setCollapsedRowsForUnit]
  );
  const numColumns = useGridColumns();

  // Pagination state
  const [visibleRowCount, setVisibleRowCount] = useState(INITIAL_ROWS);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const loaderRef = useRef<HTMLDivElement>(null);

  // Reset visible rows when collection or filter changes
  useEffect(() => {
    setVisibleRowCount(INITIAL_ROWS);
  }, [selectedVocabCollectionName, hideMastered]);

  // Check if a set contains only mastered vocab
  const isSetMastered = useCallback(
    (setStart: number, setEnd: number) => {
      if (!selectedVocabCollection) return false;
      const wordsInSet = selectedVocabCollection.data.slice(
        setStart * WORDS_PER_SET,
        setEnd * WORDS_PER_SET
      );
      return wordsInSet.every((vocab: { word: string }) =>
        masteredWords.has(vocab.word)
      );
    },
    [selectedVocabCollection, masteredWords]
  );

  // Memoize vocab sets computation
  const {
    vocabSetsTemp,
    filteredVocabSets,
    masteredCount,
    allRows,
    totalRows
  } = useMemo(() => {
    if (!selectedVocabCollection) {
      return {
        vocabSetsTemp: [],
        filteredVocabSets: [],
        masteredCount: 0,
        allRows: [],
        totalRows: 0
      };
    }

    const sets = new Array(
      Math.ceil(selectedVocabCollection.data.length / WORDS_PER_SET)
    )
      .fill({})
      .map((_, i) => ({
        name: `Set ${selectedVocabCollection.prevLength + i + 1}`,
        start: i,
        end: i + 1,
        id: `Set ${i + 1}`,
        isMastered: isSetMastered(i, i + 1)
      }));

    const filtered = hideMastered ? sets.filter(set => !set.isMastered) : sets;

    const mastered = sets.filter(set => set.isMastered).length;
    const rows = chunkArray(filtered, numColumns);

    return {
      vocabSetsTemp: sets,
      filteredVocabSets: filtered,
      masteredCount: mastered,
      allRows: rows,
      totalRows: rows.length
    };
  }, [selectedVocabCollection, hideMastered, numColumns, isSetMastered]);

  const visibleRows = allRows.slice(0, visibleRowCount);
  const hasMoreRows = visibleRowCount < totalRows;

  // Load more rows callback
  const loadMoreRows = useCallback(() => {
    if (isLoadingMore || !hasMoreRows) return;
    setIsLoadingMore(true);
    setTimeout(() => {
      setVisibleRowCount(prev => Math.min(prev + ROWS_PER_LOAD, totalRows));
      setIsLoadingMore(false);
    }, 150);
  }, [isLoadingMore, hasMoreRows, totalRows]);

  // Intersection Observer for infinite scroll
  useEffect(() => {
    const loader = loaderRef.current;
    if (!loader) return;

    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && hasMoreRows && !isLoadingMore) {
          loadMoreRows();
        }
      },
      { rootMargin: '200px' }
    );

    observer.observe(loader);
    return () => observer.disconnect();
  }, [hasMoreRows, isLoadingMore, loadMoreRows]);

  // Check if user has any progress data
  const hasProgressData = Object.keys(allTimeStats.characterMastery).length > 0;

  if (!selectedVocabCollection) {
    return (
      <div className={clsx('flex flex-col w-full gap-4')}>
        <div className='mx-4 px-4 py-3 rounded-xl bg-[var(--card-color)] border-2 border-[var(--border-color)]'>
          <p className='text-sm text-[var(--secondary-color)]'>
            Loading vocabulary sets...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className='flex flex-col w-full gap-4'>
      {/* Info message when no progress data exists */}
      {!hasProgressData && (
        <div className='mx-4 px-4 py-3 rounded-xl bg-[var(--card-color)] border-2 border-[var(--border-color)]'>
          <p className='text-sm text-[var(--secondary-color)]'>
            💡 <strong>Tip:</strong> Complete some practice sessions to unlock
            the &apos;Hide Mastered Sets&apos; filter. Sets become mastered when
            you achieve 90%+ accuracy with 10+ attempts per word.
          </p>
        </div>
      )}

      {/* Filter Toggle Button - Only show if there are mastered sets */}
      {masteredCount > 0 && (
        <div className='flex justify-end px-4'>
          <button
            onClick={() => {
              playClick();
              setHideMastered(prev => !prev);
            }}
            className={clsx(
              'flex items-center gap-2 px-4 py-2 rounded-xl',
              'duration-250 transition-all ease-in-out',
              'border-2 border-[var(--border-color)]',
              'hover:bg-[var(--card-color)]',
              hideMastered &&
                'bg-[var(--card-color)] border-[var(--main-color)]'
            )}
          >
            {hideMastered ? (
              <>
                <FilterX size={20} className='text-[var(--main-color)]' />
                <span className='text-[var(--main-color)]'>
                  Show All Sets ({masteredCount} mastered hidden)
                </span>
              </>
            ) : (
              <>
                <Filter size={20} className='text-[var(--secondary-color)]' />
                <span className='text-[var(--secondary-color)]'>
                  Hide Mastered Sets ({masteredCount})
                </span>
              </>
            )}
          </button>
        </div>
      )}

      {visibleRows.map((rowSets, rowIndex) => {
        const firstSetNumber = rowSets[0]?.name.match(/\d+/)?.[0] || '1';
        const lastSetNumber =
          rowSets[rowSets.length - 1]?.name.match(/\d+/)?.[0] || firstSetNumber;

        return (
          <div
            key={`row-${rowIndex}`}
            className={clsx('flex flex-col py-4 gap-4', cardBorderStyles)}
          >
            <h3
              onClick={() => {
                playClick();
                setCollapsedRows(prev =>
                  prev.includes(rowIndex)
                    ? prev.filter(i => i !== rowIndex)
                    : [...prev, rowIndex]
                );
              }}
              className={clsx(
                'group text-3xl ml-4 flex flex-row items-center gap-2 rounded-xl hover:cursor-pointer',
                collapsedRows.includes(rowIndex) && 'mb-1.5'
              )}
            >
              <ChevronUp
                className={clsx(
                  'duration-250 text-[var(--border-color)]',
                  'max-md:group-active:text-[var(--secondary-color)]',
                  'md:group-hover:text-[var(--secondary-color)]',
                  collapsedRows.includes(rowIndex) && 'rotate-180'
                )}
                size={28}
              />
              <span className='max-lg:hidden'>
                Levels {firstSetNumber}
                {firstSetNumber !== lastSetNumber ? `-${lastSetNumber}` : ''}
              </span>
              <span className='lg:hidden'>Level {firstSetNumber}</span>
            </h3>

            {!collapsedRows.includes(rowIndex) && (
              <div
                className={clsx(
                  'flex flex-col w-full',
                  'md:items-start md:grid lg:grid-cols-2 2xl:grid-cols-3'
                )}
              >
                {rowSets.map((vocabSetTemp, i) => {
                  const setWords = selectedVocabCollection.data.slice(
                    vocabSetTemp.start * WORDS_PER_SET,
                    vocabSetTemp.end * WORDS_PER_SET
                  );
                  const isSelected = selectedVocabSets.includes(
                    vocabSetTemp.name
                  );

                  return (
                    <div
                      key={vocabSetTemp.id + vocabSetTemp.name}
                      className={clsx(
                        'flex flex-col md:px-4 h-full',
                        'border-[var(--border-color)]',
                        i < rowSets.length - 1 && 'md:border-r-1'
                      )}
                    >
                      <button
                        className={clsx(
                          'text-2xl flex justify-center items-center gap-2 group',
                          'rounded-2xl  hover:cursor-pointer',
                          'duration-250 transition-all ease-in-out',
                          'px-2 py-3 max-md:mx-4 border-b-6',
                          isSelected
                            ? 'bg-[var(--secondary-color)] text-[var(--background-color)] border-[var(--secondary-color-accent)]'
                            : 'bg-[var(--background-color)] border-[var(--border-color)] hover:border-[var(--main-color)]/80'
                        )}
                        onClick={e => {
                          e.currentTarget.blur();
                          playClick();
                          if (isSelected) {
                            setSelectedVocabSets(
                              selectedVocabSets.filter(
                                set => set !== vocabSetTemp.name
                              )
                            );
                            addWordObjs(setWords);
                          } else {
                            setSelectedVocabSets([
                              ...new Set(
                                selectedVocabSets.concat(vocabSetTemp.name)
                              )
                            ]);
                            addWordObjs(setWords);
                          }
                        }}
                      >
                        {isSelected ? (
                          <CircleCheck className='mt-0.5 text-[var(--background-color)] duration-250' />
                        ) : (
                          <Circle className='mt-0.5 text-[var(--border-color)] duration-250' />
                        )}
                        {vocabSetTemp.name.replace('Set ', 'Level ')}
                      </button>
                      <VocabSetDictionary words={setWords} />
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}

      {/* Infinite scroll loader */}
      <div ref={loaderRef} className='flex justify-center py-4'>
        {isLoadingMore && (
          <Loader2
            className='animate-spin text-[var(--secondary-color)]'
            size={24}
          />
        )}
        {hasMoreRows && !isLoadingMore && (
          <span className='text-sm text-[var(--secondary-color)]'>
            Scroll for more ({totalRows - visibleRowCount} rows remaining)
          </span>
        )}
      </div>
    </div>
  );
};

export default VocabCards;
