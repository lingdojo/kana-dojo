'use client';
import clsx from 'clsx';
import { useState } from 'react';
import { MousePointer } from 'lucide-react';
import { kana } from '@/features/Kana/data/kana';
import useKanaStore from '@/features/Kana/store/useKanaStore';
import usePreferencesStore from '@/features/Preferences/store/usePreferencesStore';
import { useClick } from '@/shared/hooks/useAudio';
import { ActionButton } from '@/shared/components/ui/ActionButton';
import { cn } from '@/shared/lib/utils';

interface SubsetProps {
  sliceRange: number[];
  group: string;
  subgroup: string;
}

const Subset = ({ sliceRange, subgroup }: SubsetProps) => {
  const { playClick } = useClick();
  const [focusedRow, setFocusedRow] = useState('');

  const kanaGroups = kana.slice(sliceRange[0], sliceRange[1]);
  const kanaGroupIndices = useKanaStore(state => state.kanaGroupIndices);
  const addKanaGroupIndex = useKanaStore(state => state.addKanaGroupIndex);
  const addKanaGroupIndices = useKanaStore(state => state.addKanaGroupIndices);
  const displayKana = usePreferencesStore(state => state.displayKana);

  const getGlobalIndex = (localIndex: number) => localIndex + sliceRange[0];

  const isChecked = (localIndex: number) =>
    kanaGroupIndices.includes(getGlobalIndex(localIndex));

  const selectAllInSubset = () => {
    playClick();
    const indices = Array.from(
      { length: sliceRange[1] - sliceRange[0] },
      (_, i) => sliceRange[0] + i,
    );
    addKanaGroupIndices(indices);
  };

  const getTextOpacity = (isFocused: boolean, isKana: boolean) => {
    const shouldShowKana = displayKana ? isKana : !isKana;

    // Desktop (hover states)
    const desktopClass = shouldShowKana
      ? 'md:opacity-100 md:group-hover:opacity-0'
      : 'md:opacity-0 md:group-hover:opacity-100';

    // Mobile (focus states)
    const mobileClass = shouldShowKana
      ? isFocused
        ? 'max-md:opacity-0'
        : 'max-md:opacity-100'
      : isFocused
        ? 'max-md:opacity-100'
        : 'max-md:opacity-0';

    return `${desktopClass} ${mobileClass}`;
  };

  return (
    <fieldset className='flex flex-col items-start gap-1'>
      {kanaGroups.map((group, i) => {
        const isFocused = focusedRow === group.groupName;
        const isLastInSubset = i === kanaGroups.length - 1;

        return (
          <div key={group.groupName} className='flex w-full flex-col gap-1'>
            <label
              className={clsx(
                'flex w-full flex-row items-center gap-2',
                'transition-all duration-200 ease-in-out',
                'text-(--secondary-color)',
              )}
              onClick={playClick}
            >
              <input
                type='checkbox'
                value={group.groupName}
                checked={isChecked(i)}
                onChange={e => {
                  e.currentTarget.blur();
                  addKanaGroupIndex(getGlobalIndex(i));
                }}
              />

              <div
                className='group relative grid min-h-auto w-full place-items-start font-normal hover:cursor-pointer'
                onTouchStart={() => setFocusedRow(group.groupName)}
              >
                {/* Kana characters */}
                <span
                  className={clsx(
                    'z-10 col-start-1 row-start-1 transition-all duration-200',
                    'flex h-full items-center justify-center pb-1 text-3xl',
                    getTextOpacity(isFocused, true),
                  )}
                >
                  {group.kana.join('・')}
                </span>

                {/* Romanji */}
                <span
                  className={clsx(
                    'col-start-1 row-start-1 transition-all duration-200',
                    'flex h-full items-center justify-center pb-1 text-2xl',
                    getTextOpacity(isFocused, false),
                  )}
                >
                  {group.romanji.join('・')}
                </span>
              </div>
            </label>

            {/* Divider (except for last character in group) */}
            {!isLastInSubset && (
              <hr className='w-full border-t-1 border-(--border-color)' />
            )}
          </div>
        );
      })}

      {/* Select All Button */}
      <div className='flex w-full flex-row gap-2'>
        <ActionButton
          onClick={e => {
            e.currentTarget.blur();
            selectAllInSubset();
          }}
          borderRadius='3xl'
          borderBottomThickness={12}
        >
          <MousePointer size={22} className={cn('fill-current')} />
          <span>select all {subgroup.slice(1).toLowerCase()}</span>
        </ActionButton>
      </div>
    </fieldset>
  );
};

export default Subset;
