'use client';

import clsx from 'clsx';
import { motion } from 'framer-motion';
import { ActionButton } from '@/shared/ui/components/ActionButton';
import { useClick } from '@/shared/hooks/generic/useAudio';

export type KanaType = 'hiragana' | 'katakana';

interface KanaUnitSelectorProps {
  selected: KanaType;
  onSelect: (type: KanaType) => void;
  selectedSubset: string;
  onSubsetSelect: (subset: string) => void;
}

const SUBSET_OPTIONS: Record<KanaType, { id: string; label: string }[]> = {
  hiragana: [
    { id: 'base', label: 'Base' },
    { id: 'dakuon', label: 'Dakuon' },
    { id: 'yoon', label: 'Yoon' },
  ],
  katakana: [
    { id: 'base', label: 'Base' },
    { id: 'dakuon', label: 'Dakuon' },
    { id: 'yoon', label: 'Yoon' },
    { id: 'foreign', label: 'Foreign' },
  ],
};

const KanaUnitSelector = ({ selected, onSelect, selectedSubset, onSubsetSelect }: KanaUnitSelectorProps) => {
  const { playClick } = useClick();

  const options: { type: KanaType; label: string; jpLabel: string }[] = [
    { type: 'hiragana', label: 'Hiragana', jpLabel: 'ひらがな' },
    { type: 'katakana', label: 'Katakana', jpLabel: 'カタカナ' },
  ];

  const subsetOptions = SUBSET_OPTIONS[selected];

  return (
    <motion.div className='flex flex-col rounded-[1.5rem] border-1 border-(--border-color) bg-(--background-color) p-1 shadow-[0_12px_40px_rgba(0,0,0,0.12)] backdrop-blur-xl'>
      <div className='flex w-full flex-col rounded-[1.25rem] bg-(--card-color) p-2'>
        {/* Main Hiragana/Katakana Selector */}
        <div className='flex flex-col gap-2 md:flex-row'>
          {options.map(option => {
            const isSelected = option.type === selected;

            return (
              <div key={option.type} className='relative flex-1'>
                {isSelected && (
                  <motion.div
                    layoutId='kana-unit-selector-indicator'
                    className='absolute inset-0 rounded-[1.25rem]'
                    transition={{
                      type: 'spring',
                      stiffness: 300,
                      damping: 30,
                    }}
                  >
                    <div className='h-full w-full rounded-[1.25rem] border-b-8 border-(--main-color-accent) bg-(--main-color)' />
                  </motion.div>
                )}
                <ActionButton
                  onClick={() => {
                    playClick();
                    onSelect(option.type);
                  }}
                  borderBottomThickness={0}
                  borderRadius='3xl'
                  className={clsx(
                    'relative z-10 w-full flex-row items-center justify-center gap-2 px-4 pt-3 pb-5',
                    isSelected
                      ? 'bg-transparent text-(--background-color)'
                      : 'bg-transparent text-(--secondary-color) hover:bg-(--border-color)/50',
                  )}
                >
                  <span>{option.label}</span>
                  <span>{option.jpLabel}</span>
                </ActionButton>
              </div>
            );
          })}
        </div>

        {/* Subset Selector (Base/Dakuon/Yoon/Foreign) */}
        <div className='-mx-2 my-3 h-0.5 bg-(--border-color)' />
        <div className='grid grid-cols-2 gap-2 sm:grid-cols-[repeat(auto-fit,minmax(120px,1fr))]'>
          {subsetOptions.map(subset => {
            const isSelected = subset.id === selectedSubset;

            return (
              <div key={subset.id} className='relative flex'>
                {isSelected && (
                  <motion.div
                    layoutId='kana-subset-selector-indicator'
                    className='absolute inset-0 rounded-2xl'
                    transition={{
                      type: 'spring',
                      stiffness: 300,
                      damping: 30,
                    }}
                  >
                    <div className='h-full w-full rounded-2xl border-b-6 border-(--secondary-color-accent) bg-(--secondary-color)' />
                  </motion.div>
                )}
                <ActionButton
                  onClick={() => {
                    playClick();
                    onSubsetSelect(subset.id);
                  }}
                  borderBottomThickness={0}
                  borderRadius='2xl'
                  className={clsx(
                    'relative z-10 flex h-full w-full items-center justify-center px-4 pt-3 pb-4 text-center text-sm',
                    isSelected
                      ? 'bg-transparent text-(--background-color)'
                      : 'bg-transparent text-(--main-color) hover:bg-(--border-color)/50',
                  )}
                >
                  {subset.label}
                </ActionButton>
              </div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
};

export default KanaUnitSelector;
