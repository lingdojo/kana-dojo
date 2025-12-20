'use client';

import clsx from 'clsx';
import type React from 'react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ChevronUp,
  Circle,
  CircleCheck,
  Filter,
  FilterX,
  Loader2,
  MousePointer
} from 'lucide-react';

import { chunkArray } from '@/shared/lib/helperFunctions';
import { cardBorderStyles } from '@/shared/lib/styles';
import useGridColumns from '@/shared/hooks/useGridColumns';
import { useClick } from '@/shared/hooks/useAudio';
import { ActionButton } from '@/shared/components/ui/ActionButton';
import QuickSelectModal from '@/shared/components/Modals/QuickSelectModal';

type MasteryStats = {
  correct: number;
  incorrect: number;
};

export type LevelSetCardsSet = {
  name: string;
  start: number;
  end: number;
  id: string;
  isMastered: boolean;
};

type LevelSetCardsProps<TLevel extends string, TItem> = {
  levelOrder: readonly TLevel[];
  selectedUnitName: TLevel;
  itemsPerSet: number;
  getCollectionName: (level: TLevel) => string;
  loadItemsByLevel: (level: TLevel) => Promise<TItem[]>;

  selectedSets: string[];
  setSelectedSets: (sets: string[]) => void;
  clearSelected: () => void;
  toggleItems: (items: TItem[]) => void;

  collapsedRows: number[];
  setCollapsedRows: (
    updater: number[] | ((prev: number[]) => number[])
  ) => void;

  masteryByKey: Record<string, MasteryStats>;
  getMasteryKey: (item: TItem) => string;

  renderSetDictionary: (items: TItem[]) => React.ReactNode;

  loadingText: string;
  tipText: React.ReactNode;
};

const INITIAL_ROWS = 5;
const ROWS_PER_LOAD = 5;

const LevelSetCards = <TLevel extends string, TItem>({
  levelOrder,
  selectedUnitName,
  itemsPerSet,
  getCollectionName,
  loadItemsByLevel,
  selectedSets,
  setSelectedSets,
  clearSelected,
  toggleItems,
  collapsedRows,
  setCollapsedRows,
  masteryByKey,
  getMasteryKey,
  renderSetDictionary,
  loadingText,
  tipText
}: LevelSetCardsProps<TLevel, TItem>) => {
  const { playClick } = useClick();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [hideMastered, setHideMastered] = useState(false);

  const [collections, setCollections] = useState<
    Partial<Record<TLevel, { data: TItem[]; name: string; prevLength: number }>>
  >({});

  const [cumulativeCounts, setCumulativeCounts] = useState<Record<
    TLevel,
    number
  > | null>(null);

  useEffect(() => {
    let isMounted = true;

    const loadCumulativeCounts = async () => {
      const counts = {} as Record<TLevel, number>;
      let cumulative = 0;

      for (const level of levelOrder) {
        counts[level] = cumulative;
        const items = await loadItemsByLevel(level);
        cumulative += Math.ceil(items.length / itemsPerSet);
      }

      if (isMounted) setCumulativeCounts(counts);
    };

    void loadCumulativeCounts();

    return () => {
      isMounted = false;
    };
  }, [itemsPerSet, levelOrder, loadItemsByLevel]);

  useEffect(() => {
    let isMounted = true;

    if (!cumulativeCounts || collections[selectedUnitName]) return;

    const loadSelectedCollection = async () => {
      const items = await loadItemsByLevel(selectedUnitName);

      if (!isMounted) return;

      setCollections(prev => ({
        ...prev,
        [selectedUnitName]: {
          data: items,
          name: getCollectionName(selectedUnitName),
          prevLength: cumulativeCounts[selectedUnitName]
        }
      }));
    };

    void loadSelectedCollection();

    return () => {
      isMounted = false;
    };
  }, [
    collections,
    cumulativeCounts,
    getCollectionName,
    loadItemsByLevel,
    selectedUnitName
  ]);

  const selectedCollection = collections[selectedUnitName];

  const masteredKeys = useMemo(() => {
    const mastered = new Set<string>();
    Object.entries(masteryByKey).forEach(([key, stats]) => {
      const total = stats.correct + stats.incorrect;
      const accuracy = total > 0 ? stats.correct / total : 0;
      if (total >= 10 && accuracy >= 0.9) mastered.add(key);
    });
    return mastered;
  }, [masteryByKey]);

  const isSetMastered = useCallback(
    (setStart: number, setEnd: number) => {
      if (!selectedCollection) return false;
      const itemsInSet = selectedCollection.data.slice(
        setStart * itemsPerSet,
        setEnd * itemsPerSet
      );
      return itemsInSet.every(item => masteredKeys.has(getMasteryKey(item)));
    },
    [getMasteryKey, itemsPerSet, masteredKeys, selectedCollection]
  );

  const numColumns = useGridColumns();

  const { setsTemp, filteredSets, masteredCount, allRows, totalRows } =
    useMemo(() => {
      if (!selectedCollection) {
        return {
          setsTemp: [] as LevelSetCardsSet[],
          filteredSets: [] as LevelSetCardsSet[],
          masteredCount: 0,
          allRows: [] as LevelSetCardsSet[][],
          totalRows: 0
        };
      }

      const sets: LevelSetCardsSet[] = new Array(
        Math.ceil(selectedCollection.data.length / itemsPerSet)
      )
        .fill({})
        .map((_, i) => ({
          name: `Set ${selectedCollection.prevLength + i + 1}`,
          start: i,
          end: i + 1,
          id: `Set ${i + 1}`,
          isMastered: isSetMastered(i, i + 1)
        }));

      const filtered = hideMastered
        ? sets.filter(set => !set.isMastered)
        : sets;

      const rows = chunkArray(filtered, numColumns);

      return {
        setsTemp: sets,
        filteredSets: filtered,
        masteredCount: sets.filter(set => set.isMastered).length,
        allRows: rows,
        totalRows: rows.length
      };
    }, [
      hideMastered,
      isSetMastered,
      itemsPerSet,
      numColumns,
      selectedCollection
    ]);

  const [visibleRowCount, setVisibleRowCount] = useState(INITIAL_ROWS);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const loaderRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setVisibleRowCount(INITIAL_ROWS);
  }, [hideMastered, selectedUnitName]);

  const visibleRows = allRows.slice(0, visibleRowCount);
  const hasMoreRows = visibleRowCount < totalRows;

  const loadMoreRows = useCallback(() => {
    if (isLoadingMore || !hasMoreRows) return;
    setIsLoadingMore(true);
    setTimeout(() => {
      setVisibleRowCount(prev => Math.min(prev + ROWS_PER_LOAD, totalRows));
      setIsLoadingMore(false);
    }, 150);
  }, [hasMoreRows, isLoadingMore, totalRows]);

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

  const hasProgressData = Object.keys(masteryByKey).length > 0;

  const handleToggleSet = (setName: string) => {
    const set = setsTemp.find(s => s.name === setName);
    if (!set || !selectedCollection) return;

    const setItems = selectedCollection.data.slice(
      set.start * itemsPerSet,
      set.end * itemsPerSet
    );

    if (selectedSets.includes(setName)) {
      setSelectedSets(selectedSets.filter(s => s !== setName));
    } else {
      setSelectedSets([...new Set(selectedSets.concat(setName))]);
    }

    toggleItems(setItems);
  };

  const handleSelectAll = () => {
    const allSetNames = filteredSets.map(set => set.name);
    setSelectedSets(allSetNames);
    if (selectedCollection) toggleItems(selectedCollection.data);
  };

  const handleClearAll = () => {
    clearSelected();
  };

  const handleSelectRandom = (count: number) => {
    const shuffled = [...filteredSets].sort(() => Math.random() - 0.5);
    const randomSets = shuffled.slice(0, Math.min(count, shuffled.length));
    const randomSetNames = randomSets.map(set => set.name);

    setSelectedSets(randomSetNames);

    if (selectedCollection) {
      const randomItems = randomSets.flatMap(set =>
        selectedCollection.data.slice(
          set.start * itemsPerSet,
          set.end * itemsPerSet
        )
      );
      toggleItems(randomItems);
    }
  };

  if (!selectedCollection) {
    return (
      <div className={clsx('flex flex-col w-full gap-4')}>
        <div className='mx-4 px-4 py-3 rounded-xl bg-[var(--card-color)] border-2 border-[var(--border-color)]'>
          <p className='text-sm text-[var(--secondary-color)]'>{loadingText}</p>
        </div>
      </div>
    );
  }

  return (
    <div className='flex flex-col w-full gap-4'>
      {!hasProgressData && (
        <div className='mx-4 px-4 py-3 rounded-xl bg-[var(--card-color)] border-2 border-[var(--border-color)]'>
          <p className='text-sm text-[var(--secondary-color)]'>{tipText}</p>
        </div>
      )}

      <ActionButton
        onClick={() => {
          playClick();
          setIsModalOpen(true);
        }}
        className='px-2 py-3 opacity-90'
        // borderRadius='3xl'
        borderBottomThickness={8}
      >
        <MousePointer />
        Quick Select
      </ActionButton>

      <QuickSelectModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        sets={filteredSets}
        selectedSets={selectedSets}
        onToggleSet={handleToggleSet}
        onSelectAll={handleSelectAll}
        onClearAll={handleClearAll}
        onSelectRandom={handleSelectRandom}
        unitName={selectedUnitName}
      />

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
                {rowSets.map((setTemp, i) => {
                  const setItems = selectedCollection.data.slice(
                    setTemp.start * itemsPerSet,
                    setTemp.end * itemsPerSet
                  );
                  const isSelected = selectedSets.includes(setTemp.name);

                  return (
                    <div
                      key={setTemp.id + setTemp.name}
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
                            setSelectedSets(
                              selectedSets.filter(set => set !== setTemp.name)
                            );
                          } else {
                            setSelectedSets([
                              ...new Set(selectedSets.concat(setTemp.name))
                            ]);
                          }
                          toggleItems(setItems);
                        }}
                      >
                        {isSelected ? (
                          <CircleCheck className='mt-0.5 text-[var(--background-color)] duration-250' />
                        ) : (
                          <Circle className='mt-0.5 text-[var(--border-color)] duration-250' />
                        )}
                        {setTemp.name.replace('Set ', 'Level ')}
                      </button>

                      {renderSetDictionary(setItems)}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}

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

export default LevelSetCards;
