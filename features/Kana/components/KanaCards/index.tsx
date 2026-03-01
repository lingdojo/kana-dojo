'use client';
import { Fragment, useState } from 'react';
import clsx from 'clsx';
import Subset from './Subset';
import { useClick } from '@/shared/hooks/useAudio';
import { cardBorderStyles } from '@/shared/lib/styles';
import { ChevronUp } from 'lucide-react';

const STORAGE_KEY = 'kana-hidden-subsets';

type KanaCardsFilter = 'all' | 'hiragana' | 'katakana';

const DEFAULT_SHOWN_SUBSETS: Record<KanaCardsFilter, string[]> = {
  all: ['hiragana ひらがな', 'hbase', 'katakana カタカナ', 'kbase'],
  hiragana: ['hiragana ひらがな', 'hbase'],
  katakana: ['katakana カタカナ', 'kbase'],
};

const kanaGroups = [
  {
    name: 'Hiragana ひらがな',
    subsets: [
      { name: 'HBase', sliceRange: [0, 10] },
      { name: 'HDakuon', sliceRange: [10, 15] },
      { name: 'HYoon', sliceRange: [15, 26] },
    ],
  },
  {
    name: 'Katakana カタカナ',
    subsets: [
      { name: 'KBase', sliceRange: [26, 36] },
      { name: 'KDakuon', sliceRange: [36, 41] },
      { name: 'KYoon', sliceRange: [41, 52] },
      { name: 'KForeign Sounds', sliceRange: [52, 60] },
    ],
  },
  // TEMPORARILY COMMENTED OUT - Challenge section
  // {
  //   name: 'Challenge チャレンジ',
  //   subsets: [
  //     { name: 'CSimilar Hiragana', sliceRange: [60, 65] },
  //     { name: 'CConfusing Katakana', sliceRange: [65, 69] }
  //   ]
  // }
];

const getDefaultHiddenSubsets = (
  groups: typeof kanaGroups,
  filter: KanaCardsFilter,
) => {
  const allToggleKeys = groups.flatMap(group => [
    group.name.toLowerCase(),
    ...group.subsets.map(subset => subset.name.toLowerCase()),
  ]);

  const shown = new Set(
    DEFAULT_SHOWN_SUBSETS[filter].map(name => name.toLowerCase()),
  );
  return allToggleKeys.filter(key => !shown.has(key));
};

const getInitialState = (
  storageKey: string,
  groups: typeof kanaGroups,
  filter: KanaCardsFilter,
): string[] => {
  if (typeof window === 'undefined')
    return getDefaultHiddenSubsets(groups, filter);

  try {
    const stored = sessionStorage.getItem(storageKey);
    return stored
      ? JSON.parse(stored)
      : getDefaultHiddenSubsets(groups, filter);
  } catch (error) {
    console.error('Failed to load from session storage:', error);
    return getDefaultHiddenSubsets(groups, filter);
  }
};

const saveToSessionStorage = (storageKey: string, hiddenSubsets: string[]) => {
  try {
    sessionStorage.setItem(storageKey, JSON.stringify(hiddenSubsets));
  } catch (error) {
    console.error('Failed to save to session storage:', error);
  }
};

const KanaCards = ({ filter = 'all' }: { filter?: KanaCardsFilter }) => {
  const { playClick } = useClick();

  const filteredGroups = kanaGroups.filter(group => {
    if (filter === 'hiragana') {
      return group.name.toLowerCase().startsWith('hiragana');
    }
    if (filter === 'katakana') {
      return group.name.toLowerCase().startsWith('katakana');
    }
    return true;
  });

  const isSingleGroup = filteredGroups.length === 1;

  const storageKey =
    filter === 'all' ? STORAGE_KEY : `${STORAGE_KEY}-${filter}`;

  const [hiddenSubsets, setHiddenSubsets] = useState<string[]>(() =>
    getInitialState(storageKey, filteredGroups, filter),
  );

  const toggleVisibility = (name: string) => {
    playClick();
    const lowerName = name.toLowerCase();

    setHiddenSubsets(prev => {
      const updated = prev.includes(lowerName)
        ? prev.filter(item => item !== lowerName)
        : [...prev, lowerName];

      saveToSessionStorage(storageKey, updated);
      return updated;
    });
  };

  const isHidden = (name: string) => hiddenSubsets.includes(name.toLowerCase());

  const chevronClasses = (hidden: boolean) =>
    clsx(
      'duration-300 text-(--border-color)',
      'max-md:group-active:text-(--secondary-color)',
      'md:group-hover:text-(--secondary-color)',
      hidden && 'rotate-180',
    );

  return (
    <div className='flex w-full flex-col gap-2 sm:flex-row sm:items-start'>
      {filteredGroups.map(group => {
        const groupHidden = isHidden(group.name);
        const [mainTitle, japaneseTitle] = group.name.split(' ');

        return (
          <Fragment key={group.name}>
            <form
              className={clsx(
                'flex w-full flex-col gap-2 p-4',
                isSingleGroup ? 'sm:w-full' : 'sm:w-1/2',
                cardBorderStyles,
              )}
            >
              {/* Group Header */}
              <legend
                className='group flex flex-row items-center gap-1 text-2xl hover:cursor-pointer'
                onClick={() => toggleVisibility(group.name)}
              >
                <ChevronUp className={chevronClasses(groupHidden)} />
                <h3 className='flex items-center gap-2'>
                  <span>{mainTitle}</span>
                  <span className='text-(--secondary-color)'>
                    {japaneseTitle}
                  </span>
                </h3>
              </legend>

              {/* Subsets */}
              {!groupHidden &&
                group.subsets.map((subset, index) => {
                  const subsetHidden = isHidden(subset.name);
                  const isLastSubset = index === group.subsets.length - 1;

                  return (
                    <div
                      key={subset.name}
                      className='flex w-full flex-col gap-2'
                    >
                      <div>
                        {/* Subset Header */}
                        <h4
                          className='group flex flex-row items-center gap-1 text-xl hover:cursor-pointer'
                          onClick={() => toggleVisibility(subset.name)}
                        >
                          <ChevronUp
                            className={chevronClasses(subsetHidden)}
                            size={24}
                          />
                          <span>{subset.name.slice(1)}</span>
                        </h4>

                        {/* Subset Content */}
                        {!subsetHidden && (
                          <Subset
                            sliceRange={subset.sliceRange}
                            group={group.name}
                            subgroup={subset.name}
                          />
                        )}
                      </div>

                      {/* Divider (except after last subset) */}
                      {!isLastSubset && (
                        <hr className='w-full border-t border-(--border-color)' />
                      )}
                    </div>
                  );
                })}
            </form>
          </Fragment>
        );
      })}
    </div>
  );
};

export default KanaCards;
