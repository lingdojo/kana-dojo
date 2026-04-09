'use client';

import clsx from 'clsx';
import type React from 'react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ChevronUp,
  Circle,
  CircleCheck,
  Loader2,
  MousePointer,
} from 'lucide-react';

import { chunkArray } from '@/shared/lib/helperFunctions';
import { cardBorderStyles } from '@/shared/lib/styles';
import useGridColumns from '@/shared/hooks/generic/useGridColumns';
import { useClick } from '@/shared/hooks/generic/useAudio';
import { ActionButton } from '@/shared/components/ui/ActionButton';
import QuickSelectModal from '@/shared/components/Modals/QuickSelectModal';
import { cn } from '@/shared/lib/utils';

export type LevelSetCardsSet = {
  name: string;
  start: number;
  end: number;
  id: string;
};

type LevelSetCardsProps<TLevel extends string, TItem> = {
  levelOrder: readonly TLevel[];
  selectedUnitName: TLevel;
  itemsPerSet: number;
  getCollectionName: (level: TLevel) => string;
  getCollectionSize: (level: TLevel) => number;
  loadItemsByLevel: (level: TLevel) => Promise<TItem[]>;

  selectedSets: string[];
  setSelectedSets: (sets: string[]) => void;
  clearSelected: () => void;
  toggleItems: (items: TItem[]) => void;

  collapsedRows: number[];
  setCollapsedRows: (
    updater: number[] | ((prev: number[]) => number[]),
  ) => void;

  renderSetDictionary: (items: TItem[]) => React.ReactNode;

  loadingText: string;
};

const INITIAL_ROWS = 5;
const ROWS_PER_LOAD = 5;
const LEVEL_SET_SELECTED_FLOAT_CLASSES =
  'motion-safe:animate-float [--float-distance:-3px] delay-1000ms';

const LevelSetCards = <TLevel extends string, TItem>({
  levelOrder,
  selectedUnitName,
  itemsPerSet,
  getCollectionName,
  getCollectionSize,
  loadItemsByLevel,
  selectedSets,
  setSelectedSets,
  clearSelected,
  toggleItems,
  collapsedRows,
  setCollapsedRows,
  renderSetDictionary,
  loadingText,
}: LevelSetCardsProps<TLevel, TItem>) => {
  const { playClick } = useClick();

  const [isModalOpen, setIsModalOpen] = useState(false);

  const [collections, setCollections] = useState<
    Partial<Record<TLevel, { data: TItem[]; name: string; prevLength: number }>>
  >({});

  const cumulativeCounts = useMemo(() => {
    const counts = {} as Record<TLevel, number>;
    let cumulative = 0;

    for (const level of levelOrder) {
      counts[level] = cumulative;
      const size = getCollectionSize(level);
      cumulative += Math.ceil(size / itemsPerSet);
    }

    return counts;
  }, [getCollectionSize, itemsPerSet, levelOrder]);

  useEffect(() => {
    let isMounted = true;

    if (collections[selectedUnitName]) return;

    const loadSelectedCollection = async () => {
      const items = await loadItemsByLevel(selectedUnitName);

      if (!isMounted) return;

      setCollections(prev => ({
        ...prev,
        [selectedUnitName]: {
          data: items,
          name: getCollectionName(selectedUnitName),
          prevLength: cumulativeCounts[selectedUnitName],
        },
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
    selectedUnitName,
  ]);

  const selectedCollection = collections[selectedUnitName];

  const numColumns = useGridColumns();

  const { setsTemp, allRows, totalRows } = useMemo(() => {
    if (!selectedCollection) {
      return {
        setsTemp: [] as LevelSetCardsSet[],
        allRows: [] as LevelSetCardsSet[][],
        totalRows: 0,
      };
    }

    const sets: LevelSetCardsSet[] = new Array(
      Math.ceil(selectedCollection.data.length / itemsPerSet),
    )
      .fill({})
      .map((_, i) => ({
        name: `Set ${selectedCollection.prevLength + i + 1}`,
        start: i,
        end: i + 1,
        id: `Set ${i + 1}`,
      }));

    const rows = chunkArray(sets, numColumns);

    return {
      setsTemp: sets,
      allRows: rows,
      totalRows: rows.length,
    };
  }, [itemsPerSet, numColumns, selectedCollection]);

  const [visibleRowCount, setVisibleRowCount] = useState(INITIAL_ROWS);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const loaderRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setVisibleRowCount(INITIAL_ROWS);
  }, [selectedUnitName]);

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
      { rootMargin: '200px' },
    );

    observer.observe(loader);
    return () => observer.disconnect();
  }, [hasMoreRows, isLoadingMore, loadMoreRows]);

  const handleToggleSet = (setName: string) => {
    const set = setsTemp.find(s => s.name === setName);
    if (!set || !selectedCollection) return;

    const setItems = selectedCollection.data.slice(
      set.start * itemsPerSet,
      set.end * itemsPerSet,
    );

    if (selectedSets.includes(setName)) {
      setSelectedSets(selectedSets.filter(s => s !== setName));
    } else {
      setSelectedSets([...new Set(selectedSets.concat(setName))]);
    }

    toggleItems(setItems);
  };

  const handleSelectAll = () => {
    const allSetNames = setsTemp.map(set => set.name);
    setSelectedSets(allSetNames);
    if (selectedCollection) toggleItems(selectedCollection.data);
  };

  const handleClearAll = () => {
    clearSelected();
  };

  const handleSelectRandom = (count: number) => {
    const shuffled = [...setsTemp].sort(() => Math.random() - 0.5);
    const randomSets = shuffled.slice(0, Math.min(count, shuffled.length));
    const randomSetNames = randomSets.map(set => set.name);

    setSelectedSets(randomSetNames);

    if (selectedCollection) {
      const randomItems = randomSets.flatMap(set =>
        selectedCollection.data.slice(
          set.start * itemsPerSet,
          set.end * itemsPerSet,
        ),
      );
      toggleItems(randomItems);
    }
  };

  if (!selectedCollection) {
    return (
      <div className={clsx('flex w-full flex-col gap-4')}>
        <div className='mx-4 rounded-xl border-2 border-(--border-color) bg-(--card-color) px-4 py-3'>
          <p className='text-sm text-(--secondary-color)'>{loadingText}</p>
        </div>
      </div>
    );
  }

  return (
    <div className='flex w-full flex-col gap-4'>
      <ActionButton
        onClick={() => {
          playClick();
          setIsModalOpen(true);
        }}
        className='px-2 py-3 opacity-90'
        borderRadius='3xl'
        borderBottomThickness={14}
        colorScheme='secondary'
        borderColorScheme='secondary'
      >
        <MousePointer className={cn('fill-current')} />
        Quick Select
      </ActionButton>

      <QuickSelectModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        sets={setsTemp}
        selectedSets={selectedSets}
        onToggleSet={handleToggleSet}
        onSelectAll={handleSelectAll}
        onClearAll={handleClearAll}
        onSelectRandom={handleSelectRandom}
        unitName={selectedUnitName}
      />

      {visibleRows.map((rowSets, rowIndex) => {
        const firstSetNumber = rowSets[0]?.name.match(/\d+/)?.[0] || '1';
        const lastSetNumber =
          rowSets[rowSets.length - 1]?.name.match(/\d+/)?.[0] || firstSetNumber;

        return (
          <div
            key={`row-${rowIndex}`}
            className={clsx('flex flex-col gap-4 py-4', cardBorderStyles)}
          >
            <h3 className='w-full'>
              <button
                type='button'
                onClick={() => {
                  playClick();
                  setCollapsedRows(prev =>
                    prev.includes(rowIndex)
                      ? prev.filter(i => i !== rowIndex)
                      : [...prev, rowIndex],
                  );
                }}
                className={clsx(
                  'group ml-4 flex w-full flex-row items-center gap-2 rounded-xl text-3xl hover:cursor-pointer',
                  collapsedRows.includes(rowIndex) && 'mb-1.5',
                )}
                aria-expanded={!collapsedRows.includes(rowIndex)}
              >
                <ChevronUp
                  className={clsx(
                    'text-(--border-color) duration-250',
                    'max-md:group-active:text-(--secondary-color)',
                    'md:group-hover:text-(--secondary-color)',
                    collapsedRows.includes(rowIndex) && 'rotate-180',
                  )}
                  size={28}
                />
                <span className='max-lg:hidden'>
                  Levels {firstSetNumber}
                  {firstSetNumber !== lastSetNumber ? `-${lastSetNumber}` : ''}
                </span>
                <span className='lg:hidden'>Level {firstSetNumber}</span>
              </button>
            </h3>

            {!collapsedRows.includes(rowIndex) && (
              <div
                className={clsx(
                  'flex w-full flex-col',
                  'md:grid md:items-start lg:grid-cols-2 2xl:grid-cols-3',
                )}
              >
                {rowSets.map((setTemp, i) => {
                  const setItems = selectedCollection.data.slice(
                    setTemp.start * itemsPerSet,
                    setTemp.end * itemsPerSet,
                  );
                  const isSelected = selectedSets.includes(setTemp.name);

                  return (
                    <div
                      key={setTemp.id + setTemp.name}
                      className={clsx(
                        'flex h-full flex-col md:px-4',
                        'border-(--border-color)',
                        i < rowSets.length - 1 && 'md:border-r-1',
                      )}
                    >
                      <button
                      className={clsx(
                        'group flex items-center justify-center gap-2 text-2xl',
                        'rounded-3xl hover:cursor-pointer',
                        'transition-all duration-250 ease-in-out',
                        'border-b-10 px-2 py-3 max-md:mx-4',
                        isSelected && LEVEL_SET_SELECTED_FLOAT_CLASSES,
                        isSelected
                          ? 'border-(--secondary-color-accent) bg-(--secondary-color) text-(--background-color)'
                          : 'border-(--border-color) bg-(--background-color) hover:border-(--main-color)/70',
                        )}
                        onClick={e => {
                          e.currentTarget.blur();
                          playClick();
                          if (isSelected) {
                            setSelectedSets(
                              selectedSets.filter(set => set !== setTemp.name),
                            );
                          } else {
                            setSelectedSets([
                              ...new Set(selectedSets.concat(setTemp.name)),
                            ]);
                          }
                          toggleItems(setItems);
                        }}
                      >
                        {isSelected ? (
                          <CircleCheck className='mt-0.5 fill-current text-(--background-color) duration-250' />
                        ) : (
                          <Circle className='mt-0.5 text-(--border-color) duration-250' />
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
            className='animate-spin text-(--secondary-color)'
            size={24}
          />
        )}
        {hasMoreRows && !isLoadingMore && (
          <span className='text-sm text-(--secondary-color)'>
            Scroll for more ({totalRows - visibleRowCount} rows remaining)
          </span>
        )}
      </div>
    </div>
  );
};

export default LevelSetCards;
