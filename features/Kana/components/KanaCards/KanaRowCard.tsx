'use client';

import clsx from 'clsx';
import { Circle, CircleCheck } from 'lucide-react';
import { type KanaGroup } from '@/features/Kana/data/kana';
import useKanaStore from '@/features/Kana/store/useKanaStore';
import { useStatsStore } from '@/features/Progress';
import { useClick } from '@/shared/hooks/generic/useAudio';
import { KANA_ROW_MASTERY_TARGET } from '@/features/Progress/lib/setProgress';
import { cardBorderStyles } from '@/shared/utils/styles';

interface KanaRowCardProps {
  kanaGroup: KanaGroup;
  globalIndex: number;
}

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

const KanaRowCard = ({ kanaGroup, globalIndex }: KanaRowCardProps) => {
  const { playClick } = useClick();
  const addKanaGroupIndex = useKanaStore(state => state.addKanaGroupIndex);
  const kanaGroupIndices = useKanaStore(state => state.kanaGroupIndices);
  const characterMastery = useStatsStore(
    state => state.allTimeStats.characterMastery,
  );

  const selected = kanaGroupIndices.includes(globalIndex);

  const progressFraction = (() => {
    const { kana } = kanaGroup;
    if (kana.length === 0) return 0;
    const total = kana.reduce((sum, char) => {
      const correct = characterMastery[char]?.correct ?? 0;
      return sum + Math.min(correct, KANA_ROW_MASTERY_TARGET) / KANA_ROW_MASTERY_TARGET;
    }, 0);
    return total / kana.length;
  })();

  const progressPercent = Math.round(progressFraction * 100);

  const firstKana = kanaGroup.kana[0] ?? '';
  const rowLabel = `${firstKana}-group`;

  return (
    <div className={clsx(
      'flex flex-col gap-4 p-4 border-0 border-(--border-color) rounded-3xl bg-(--card-color) transition-250 ',
      // selected && 'outline-4 outline-(--secondary-color)/80',
    )}>
      {/* Progress Bar */}
      <div className='w-full'>
        <div className='h-7 w-full overflow-hidden rounded-[1rem] bg-(--background-color)'>
          <div
            className='h-full rounded-[1rem] transition-all duration-500'
            style={{
              width: `${progressPercent}%`,
              background:
                'linear-gradient(to right, var(--secondary-color), var(--main-color))',
            }}
          />
        </div>
      </div>

      {/* Select Button */}
      <button
        type='button'
        onClick={e => {
          e.currentTarget.blur();
          playClick();
          addKanaGroupIndex(globalIndex);
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
          <CircleCheck className='mt-0.5 fill-current text-(--background-color) duration-250' />
        ) : (
          <Circle className='mt-0.5 text-(--border-color) duration-250' />
        )}
        {rowLabel}
      </button>

      {/* Kana row (large) + Romaji row (smaller) */}
      <div className='flex flex-col items-start gap-1 w-full'>
        <div
          className='text-[2.1rem] sm:text-[2.5rem] font-normal text-(--main-color) tracking-wide'
          lang='ja'
        >
          {renderSeparatedText(kanaGroup.kana, 'text-(--border-color)')}
        </div>
        <div className='text-[1.6rem] font-normal text-(--secondary-color) tracking-wide'>
          {renderSeparatedText(kanaGroup.romanji, 'text-(--border-color)')}
        </div>
      </div>
    </div>
  );
};

export default KanaRowCard;
