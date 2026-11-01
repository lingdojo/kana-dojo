'use client';

import clsx from 'clsx';
import { Circle, CircleCheck } from 'lucide-react';
import { type KanaGroup } from '@/features/Kana/data/kana';
import useKanaStore from '@/features/Kana/store/useKanaStore';
import { useStatsStore } from '@/features/Progress';
import { useClick } from '@/shared/hooks/generic/useAudio';
import {
  calculateKanaSetProgressAndStars,
  useAutoLearningStore,
} from '@/features/Progress';
import MasteryBar from '@/shared/ui/components/MasteryBar';

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
  const hasAutoLearningSelection = useAutoLearningStore(
    state => state.activeSelections.kana,
  );
  const characterMastery = useStatsStore(
    state => state.allTimeStats.characterMastery,
  );

  const selected =
    !hasAutoLearningSelection && kanaGroupIndices.includes(globalIndex);

  const { progress, stars } = calculateKanaSetProgressAndStars(
    kanaGroup.kana.map(char => ({
      correct: characterMastery[char]?.correct ?? 0,
    })),
  );
  const progressPercent = Math.round(progress * 100);

  const firstKana = kanaGroup.kana[0] ?? '';
  const rowLabel = `${firstKana}-group`;

  return (
    <div
      className={clsx(
        'transition-250 flex flex-col gap-4 rounded-3xl border-0 border-(--border-color) bg-(--card-color) p-4',
        // selected && 'outline-4 outline-(--secondary-color)/80',
      )}
    >
      {/* Progress Bar */}
      <MasteryBar
        percent={progressPercent}
        stars={stars}
        height='h-7'
        rounded='rounded-[1rem]'
      />

      {/* Select Button */}
      <button
        type='button'
        onClick={e => {
          e.currentTarget.blur();
          playClick();
          addKanaGroupIndex(globalIndex);
        }}
        className={clsx(
          'group flex w-full items-center justify-center gap-2 text-[1.5rem]',
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
      <div className='flex w-full flex-col items-start gap-1'>
        <div
          className='text-[2.1rem] font-normal tracking-wide text-(--main-color) sm:text-[2.5rem]'
          lang='ja'
        >
          {renderSeparatedText(kanaGroup.kana, 'text-(--border-color)')}
        </div>
        <div className='text-[1.6rem] font-normal tracking-wide text-(--secondary-color)'>
          {renderSeparatedText(kanaGroup.romanji, 'text-(--border-color)')}
        </div>
      </div>
    </div>
  );
};

export default KanaRowCard;
