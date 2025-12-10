'use client';
import clsx from 'clsx';
import { useState } from 'react';
import { MousePointer } from 'lucide-react';
import { kana } from '@/features/Kana/data/kana';
import useKanaStore from '@/features/Kana/store/useKanaStore';
import usePreferencesStore from '@/features/Preferences/store/usePreferencesStore';
import { useClick } from '@/shared/hooks/useAudio';
import { ActionButton } from '@/shared/components/ui/ActionButton';

const FINAL_CHARACTERS = [
  'h.b.w',
  'h.d.p',
  'h.y.py',
  'k.b.w',
  'k.d.p',
  'k.y.py',
  'k.f.ts',
  'challenge.similar.haho',
  'challenge.katakana.kuwaura'
];

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

  const isLastInGroup = (groupName: string) =>
    FINAL_CHARACTERS.includes(groupName);

  const selectAllInSubset = () => {
    playClick();
    const indices = Array.from(
      { length: sliceRange[1] - sliceRange[0] },
      (_, i) => sliceRange[0] + i
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
    <fieldset className=' flex flex-col items-start gap-1'>
      {kanaGroups.map((group, i) => {
        const isFocused = focusedRow === group.groupName;

        return (
          <div key={group.groupName} className='w-full flex flex-col gap-1'>
            <label
              className={clsx(
                'w-full flex flex-row items-center gap-2',
                'duration-200 transition-all ease-in-out',
                'text-[var(--secondary-color)]'
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
                className='group relative grid w-full font-normal min-h-auto place-items-start hover:cursor-pointer'
                onTouchStart={() => setFocusedRow(group.groupName)}
              >
                {/* Kana characters */}
                <span
                  className={clsx(
                    'row-start-1 col-start-1 transition-all duration-200 z-10',
                    'flex items-center justify-center h-full text-3xl pb-1',
                    getTextOpacity(isFocused, true)
                  )}
                >
                  {group.kana.join('・')}
                </span>

                {/* Romanji */}
                <span
                  className={clsx(
                    'row-start-1 col-start-1 transition-all duration-200',
                    'flex items-center justify-center h-full text-2xl pb-1',
                    getTextOpacity(isFocused, false)
                  )}
                >
                  {group.romanji.join('・')}
                </span>
              </div>
            </label>

            {/* Divider (except for last character in group) */}
            {!isLastInGroup(group.groupName) && (
              <hr className='border-t-1 w-full border-[var(--border-color)]' />
            )}
          </div>
        );
      })}

      {/* Select All Button */}
      <div className='flex flex-row gap-2 w-full'>
        <ActionButton
          onClick={e => {
            e.currentTarget.blur();
            selectAllInSubset();
          }}
        >
          <span>select all {subgroup.slice(1).toLowerCase()}</span>
          <MousePointer size={22} />
        </ActionButton>
      </div>
    </fieldset>
  );
};

export default Subset;
