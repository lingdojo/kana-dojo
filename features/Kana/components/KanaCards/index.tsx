'use client';
import { Fragment, useState } from 'react';
import clsx from 'clsx';
import Subset from './Subset';
import { useClick } from '@/shared/hooks/useAudio';
import { cardBorderStyles } from '@/shared/lib/styles';
import { ChevronUp } from 'lucide-react';

const STORAGE_KEY = 'kana-hidden-subsets';

const DEFAULT_HIDDEN_SUBSETS = [
  'hdakuon',
  'hyoon',
  'kdakuon',
  'kyoon',
  'kforeign sounds',
  'csimilar hiragana',
  'cconfusing katakana'
];

const getInitialState = (): string[] => {
  if (typeof window === 'undefined') return DEFAULT_HIDDEN_SUBSETS;

  try {
    const stored = sessionStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : DEFAULT_HIDDEN_SUBSETS;
  } catch (error) {
    console.error('Failed to load from session storage:', error);
    return DEFAULT_HIDDEN_SUBSETS;
  }
};

const saveToSessionStorage = (hiddenSubsets: string[]) => {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(hiddenSubsets));
  } catch (error) {
    console.error('Failed to save to session storage:', error);
  }
};

const KanaCards = () => {
  const { playClick } = useClick();

  const kanaGroups = [
    {
      name: 'Hiragana ひらがな',
      subsets: [
        { name: 'HBase', sliceRange: [0, 10] },
        { name: 'HDakuon', sliceRange: [10, 15] },
        { name: 'HYoon', sliceRange: [15, 26] }
      ]
    },
    {
      name: 'Katakana カタカナ',
      subsets: [
        { name: 'KBase', sliceRange: [26, 36] },
        { name: 'KDakuon', sliceRange: [36, 41] },
        { name: 'KYoon', sliceRange: [41, 52] },
        { name: 'KForeign Sounds', sliceRange: [52, 60] }
      ]
    },
    {
      name: 'Challenge チャレンジ',
      subsets: [
        { name: 'CSimilar Hiragana', sliceRange: [60, 65] },
        { name: 'CConfusing Katakana', sliceRange: [65, 69] }
      ]
    }
  ];

  const [hiddenSubsets, setHiddenSubsets] = useState<string[]>(getInitialState);

  const toggleVisibility = (name: string) => {
    playClick();
    const lowerName = name.toLowerCase();

    setHiddenSubsets(prev => {
      const updated = prev.includes(lowerName)
        ? prev.filter(item => item !== lowerName)
        : [...prev, lowerName];

      saveToSessionStorage(updated);
      return updated;
    });
  };

  const isHidden = (name: string) => hiddenSubsets.includes(name.toLowerCase());

  const chevronClasses = (hidden: boolean) =>
    clsx(
      'duration-300 text-[var(--border-color)]',
      'max-md:group-active:text-[var(--secondary-color)]',
      'md:group-hover:text-[var(--secondary-color)]',
      hidden && 'rotate-180'
    );

  return (
    <div className='flex flex-col gap-2 sm:flex-row w-full sm:items-start'>
      {kanaGroups.map(group => {
        const groupHidden = isHidden(group.name);
        const [mainTitle, japaneseTitle] = group.name.split(' ');

        return (
          <Fragment key={group.name}>
            <form
              className={clsx(
                'flex flex-col w-full gap-2 sm:w-1/2 p-4',
                cardBorderStyles
              )}
            >
              {/* Group Header */}
              <legend
                className='group text-2xl hover:cursor-pointer flex flex-row items-center gap-1'
                onClick={() => toggleVisibility(group.name)}
              >
                <ChevronUp className={chevronClasses(groupHidden)} />
                <h3 className='flex items-center gap-2'>
                  <span>{mainTitle}</span>
                  <span className='text-[var(--secondary-color)]'>
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
                      className='flex flex-col w-full gap-2'
                    >
                      <div>
                        {/* Subset Header */}
                        <h4
                          className='group text-xl hover:cursor-pointer flex flex-row items-center gap-1'
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
                        <hr className='border-t-1 border-[var(--border-color)]' />
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
