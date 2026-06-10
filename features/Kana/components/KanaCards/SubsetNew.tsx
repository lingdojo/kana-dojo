'use client';

import clsx from 'clsx';
import { MousePointer, Circle, CircleCheck } from 'lucide-react';
import { kana } from '@/features/Kana/data/kana';
import useKanaStore from '@/features/Kana/store/useKanaStore';
import useStatsStore from '@/features/Progress/store/useStatsStore';
import { useClick } from '@/shared/hooks/generic/useAudio';
import { ActionButton } from '@/shared/ui/components/ActionButton';
import MasteryBar from '@/shared/ui/components/MasteryBar';
import { cn } from '@/shared/utils/utils';

/**
 * The number of correct answers required for a single kana character
 * to count as fully mastered (progress bar = 100% for that character).
 * Averaging across all characters in the row gives the row's overall progress.
 */
export const KANA_ROW_MASTERY_TARGET = 25;
const KANA_MAX_STARS = 3;
const KANA_ROW_MASTERY_CAP = KANA_ROW_MASTERY_TARGET * KANA_MAX_STARS;

interface SubsetProps {
  sliceRange: number[];
  group: string;
  subgroup: string;
}

const SubsetNew = ({ sliceRange, subgroup }: SubsetProps) => {
  const { playClick } = useClick();

  const kanaGroups = kana.slice(sliceRange[0], sliceRange[1]);
  const kanaGroupIndices = useKanaStore(state => state.kanaGroupIndices);
  const addKanaGroupIndex = useKanaStore(state => state.addKanaGroupIndex);
  const addKanaGroupIndices = useKanaStore(state => state.addKanaGroupIndices);

  const characterMastery = useStatsStore(
    state => state.allTimeStats.characterMastery,
  );

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

  /**
   * Returns the progress fraction [0, 1] for a single kana row.
   * Each character contributes min(correct, KANA_ROW_MASTERY_TARGET) / KANA_ROW_MASTERY_TARGET.
   * The row progress is the average of all character fractions.
   * With 0 attempts the fraction is exactly 0.
   */
  const getRowProgressAndStars = (
    rowKana: string[],
  ): { progress: number; stars: number } => {
    if (rowKana.length === 0) return { progress: 0, stars: 0 };

    const total = rowKana.reduce((sum, char) => {
      const correct = characterMastery[char]?.correct ?? 0;
      return sum + Math.min(correct, KANA_ROW_MASTERY_CAP);
    }, 0);

    const cycleTarget = rowKana.length * KANA_ROW_MASTERY_TARGET;
    const cappedTotal = Math.min(total, cycleTarget * KANA_MAX_STARS);
    const stars = Math.min(
      Math.floor(cappedTotal / cycleTarget),
      KANA_MAX_STARS,
    );
    const progress =
      stars < KANA_MAX_STARS
        ? (cappedTotal - stars * cycleTarget) / cycleTarget
        : 1;

    return { progress, stars };
  };

  const renderSeparatedText = (items: string[], separatorClassName: string) =>
    items.map((item, index) => (
      <span key={`${item}-${index}`}>
        {item}
        {index < items.length - 1 && (
          <span aria-hidden='true' className={separatorClassName}>
            ・
          </span>
        )}
      </span>
    ));

  return (
    <fieldset className='flex w-full flex-col items-stretch gap-0'>
      {kanaGroups.map((group, i) => {
        const { progress: progressFraction, stars } =
          getRowProgressAndStars(group.kana);
        const progressPercent = Math.round(progressFraction * 100);

        const selected = isChecked(i);
        const isLastInSubset = i === kanaGroups.length - 1;

        // Mirror the selection.ts label: "${firstKana}-group"
        const firstKana = group.kana[0] ?? '';
        const isChallenge = group.groupName.startsWith('challenge.');
        const rowLabel = isChallenge
          ? `${firstKana}-group (challenge)`
          : `${firstKana}-group`;

        return (
          <div
            key={group.groupName}
            className={clsx(
              'flex flex-col items-start justify-start gap-4 py-4 w-full',
              !isLastInSubset && 'border-b border-(--border-color)',
            )}
          >
            <MasteryBar
              percent={progressPercent}
              stars={stars}
              height='h-7'
              rounded='rounded-[1rem]'
            />

            {/* Select Button — mirrors LevelSetCards select button */}
            <button
              type='button'
              onClick={e => {
                e.currentTarget.blur();
                playClick();
                addKanaGroupIndex(getGlobalIndex(i));
              }}
              className={clsx(
                'group flex items-center justify-center gap-2 text-[1.5rem] w-full',
                'rounded-[1.5rem] hover:cursor-pointer',
                'transition-all duration-250 ease-in-out',
                'border-b-10 px-2 py-3',
                selected
                  ? 'border-(--secondary-color-accent) bg-(--secondary-color) text-(--background-color)'
                  : 'border-(--border-color) bg-(--background-color) hover:border-(--main-color)/70',
              )}
            >
              {selected ? (
                <CircleCheck
                  className='mt-0.5 fill-current text-(--background-color) duration-250'
                />
              ) : (
                <Circle className='mt-0.5 text-(--border-color) duration-250' />
              )}
              {rowLabel}
            </button>

            {/* Kana row (large) + Romaji row (smaller), both left-aligned */}
            <div className='flex flex-col items-start gap-2 w-full'>
              <div
                className='text-[3rem] font-normal text-(--main-color) tracking-wide'
                lang='ja'
              >
                {renderSeparatedText(group.kana, 'text-(--border-color)')}
              </div>
              <div className='text-[1.5rem] font-normal text-(--secondary-color) tracking-wide'>
                {renderSeparatedText(group.romanji, 'text-(--border-color)')}
              </div>
            </div>
          </div>
        );
      })}

      {/* Select All Button */}
      <div className='flex w-full flex-row gap-2 mt-2'>
        <ActionButton
          onClick={e => {
            e.currentTarget.blur();
            selectAllInSubset();
          }}
          borderRadius='3xl'
          borderBottomThickness={12}
          className='justify-start'
        >
          <MousePointer size={22} className={cn('fill-current')} />
          <span>select all {subgroup.slice(1).toLowerCase()}</span>
        </ActionButton>
      </div>
    </fieldset>
  );
};

export default SubsetNew;
