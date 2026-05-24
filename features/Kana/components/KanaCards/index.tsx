'use client';
import { Fragment, useMemo, useState } from 'react';
import clsx from 'clsx';
import Subset from './Subset';
import KanaRowCard from './KanaRowCard';
import KanaUnitSelector, { type KanaType } from './KanaUnitSelector';
import { kana } from '@/features/Kana/data/kana';
import { useClick } from '@/shared/hooks/generic/useAudio';
import { cardBorderStyles } from '@/shared/utils/styles';
import { ChevronUp } from 'lucide-react';

const STORAGE_KEY = 'kana-hidden-subsets';
const USE_NEW_KANA_BADGE_DESIGN = true;
export const USE_NEW_KANA_ROW_DESIGN = true;

type KanaCardsFilter = 'all' | 'hiragana' | 'katakana';

const DEFAULT_SHOWN_SUBSETS: Record<KanaCardsFilter, string[]> = {
  all: ['hiragana ひらがな', 'hbase', 'katakana カタカナ', 'kbase'],
  hiragana: ['hiragana ひらがな', 'hbase'],
  katakana: ['katakana カタカナ', 'kbase'],
};

const groupKanaBadgeByName: Record<string, string> = {
  'Hiragana ひらがな': 'あ',
  'Katakana カタカナ': 'ア',
};

const subsetKanaBadgeByName: Record<string, string> = {
  HBase: 'か',
  HDakuon: 'が',
  HYoon: 'ゃ',
  KBase: 'カ',
  KDakuon: 'ガ',
  KYoon: 'ャ',
  'KForeign Sounds': 'フ',
};

const headingBadgeClasses = {
  group:
    'flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border-b-4 border-(--secondary-color-accent) bg-(--secondary-color) text-base leading-none text-(--background-color) transition-colors duration-300 group-hover:border-(--main-color) group-hover:border-b-(--main-color-accent) group-hover:bg-(--main-color)',
  subset:
    'flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border-b-4 border-(--secondary-color-accent) bg-(--secondary-color) text-sm leading-none text-(--background-color) transition-colors duration-300 group-hover:border-(--main-color) group-hover:border-b-(--main-color-accent) group-hover:bg-(--main-color)',
} as const;

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

interface KanaCardsProps {
  filter?: KanaCardsFilter;
  viewMode: 'full' | 'compact';
}

const KanaCards = ({ filter = 'all', viewMode }: KanaCardsProps) => {
  const { playClick } = useClick();
  const [filterOverride, setFilterOverride] = useState<KanaType>('hiragana');
  const [selectedSubset, setSelectedSubset] = useState<string>('base');

  const effectiveFilter: KanaCardsFilter =
    USE_NEW_KANA_ROW_DESIGN && filter === 'all'
      ? filterOverride
      : filter;

  const filteredGroups = kanaGroups.filter(group => {
    if (effectiveFilter === 'hiragana') {
      return group.name.toLowerCase().startsWith('hiragana');
    }
    if (effectiveFilter === 'katakana') {
      return group.name.toLowerCase().startsWith('katakana');
    }
    return true;
  });

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
      'max-md:group-active:text-(--main-color)',
      'md:group-hover:text-(--main-color)',
      hidden && 'rotate-180',
    );

  const allSubsets = useMemo(
    () =>
      kanaGroups.flatMap(group =>
        group.subsets.map(subset => ({
          ...subset,
          groupName: group.name,
        })),
      ),
    [],
  );

  const filteredSubsets = allSubsets
    .filter(subset => {
      if (effectiveFilter === 'hiragana')
        return subset.groupName.toLowerCase().startsWith('hiragana');
      if (effectiveFilter === 'katakana')
        return subset.groupName.toLowerCase().startsWith('katakana');
      return true;
    })
    .filter(subset => {
      const subsetId = subset.name.slice(1).toLowerCase().split(' ')[0];
      return subsetId === selectedSubset;
    });

  const allKanaRowCards = useMemo(() => {
    const cards: { globalIndex: number; kanaGroup: (typeof kana)[number] }[] = [];
    for (const subset of filteredSubsets) {
      for (let i = subset.sliceRange[0]; i < subset.sliceRange[1]; i++) {
        cards.push({ globalIndex: i, kanaGroup: kana[i] });
      }
    }
    return cards;
  }, [filteredSubsets]);

  if (USE_NEW_KANA_ROW_DESIGN) {
    if (viewMode === 'full') {
      return (
        <div className='flex w-full flex-col gap-4'>
          <KanaUnitSelector
            selected={filterOverride}
            onSelect={(type) => {
              setFilterOverride(type);
              setSelectedSubset('base');
            }}
            selectedSubset={selectedSubset}
            onSubsetSelect={setSelectedSubset}
          />
          <div className='grid w-full grid-cols-1 gap-4 md:grid-cols-2 2xl:grid-cols-3 items-start'>
            {allKanaRowCards.map(card => (
              <KanaRowCard
                key={`${card.globalIndex}-${card.kanaGroup.groupName}`}
                kanaGroup={card.kanaGroup}
                globalIndex={card.globalIndex}
              />
            ))}
          </div>
        </div>
      );
    }
  }

  return (
    <div className='flex w-full flex-col gap-2 sm:flex-row sm:items-start'>
      {(() => {
        const compactGroups = kanaGroups.filter(g => {
          if (filter === 'hiragana') return g.name.toLowerCase().startsWith('hiragana');
          if (filter === 'katakana') return g.name.toLowerCase().startsWith('katakana');
          return true;
        });
        const isSingleCompact = compactGroups.length === 1;
        return compactGroups.map(group => {
          const groupHidden = isHidden(group.name);
          const [mainTitle, japaneseTitle] = group.name.split(' ');

          return (
            <Fragment key={group.name}>
              <form
                className={clsx(
                  'flex w-full flex-col gap-2 p-4',
                  isSingleCompact ? 'sm:w-full' : 'sm:w-1/2',
                  cardBorderStyles,
                )}
              >
              {/* Group Header */}
              <legend
                className={clsx(
                  'group flex flex-row items-center hover:cursor-pointer',
                  USE_NEW_KANA_BADGE_DESIGN ? 'gap-2 text-[1.9rem]' : 'gap-1 text-2xl',
                )}
                onClick={() => toggleVisibility(group.name)}
              >
                <ChevronUp className={chevronClasses(groupHidden)} />
                {USE_NEW_KANA_BADGE_DESIGN && (
                  <span className={headingBadgeClasses.group}>
                    {groupKanaBadgeByName[group.name] ?? 'あ'}
                  </span>
                )}
                <h3 className='flex items-center gap-2'>
                  <span>{mainTitle}</span>
                  <span className='hidden text-(--secondary-color) xl:inline'>
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
                          className={clsx(
                            'group flex flex-row items-center hover:cursor-pointer',
                            USE_NEW_KANA_BADGE_DESIGN
                              ? 'gap-2 text-[1.5rem]'
                              : 'gap-1 text-xl',
                          )}
                          onClick={() => toggleVisibility(subset.name)}
                        >
                          <ChevronUp
                            className={chevronClasses(subsetHidden)}
                            size={24}
                          />
                          {USE_NEW_KANA_BADGE_DESIGN && (
                            <span className={headingBadgeClasses.subset}>
                              {subsetKanaBadgeByName[subset.name] ?? 'あ'}
                            </span>
                          )}
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
      });
    })()}
    </div>
  );
};

export default KanaCards;

