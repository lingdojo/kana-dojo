'use client';

import React, { useMemo, useState, useEffect, useRef } from 'react';
import { AnimatePresence, motion, type Variants } from 'framer-motion';
import clsx from 'clsx';
import { ActionButton } from '@/shared/components/ui/ActionButton';
import { GameBottomBar } from '@/shared/components/Game/GameBottomBar';

interface GauntletWordBuildingAnswerProps {
  dojoType: 'kana' | 'kanji' | 'vocabulary';
  options: string[];
  disabledOptions: string[];
  onSubmit: (option: string) => void;
  renderOption?: (option: string) => React.ReactNode;
  isDisabled?: boolean;
}

const tileVariants = {
  hidden: { opacity: 0, y: 12, scale: 0.98 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: 'spring' as const, stiffness: 220, damping: 18 },
  },
  exit: { opacity: 0, y: -8, scale: 0.98, transition: { duration: 0.12 } },
} satisfies Variants;

function TileButton({
  children,
  onClick,
  disabled,
  isSelected,
}: {
  children: React.ReactNode;
  onClick: () => void;
  disabled: boolean;
  isSelected: boolean;
}) {
  return (
    <ActionButton
      borderBottomThickness={10}
      borderRadius='3xl'
      onClick={onClick}
      className={clsx(
        'w-full px-4 py-4 text-center font-semibold select-none',
        'transition-transform duration-150 active:scale-[0.98]',
        disabled && 'cursor-not-allowed opacity-60',
        isSelected && 'ring-2 ring-(--main-color)',
      )}
      disabled={disabled}
    >
      {children}
    </ActionButton>
  );
}

export default function GauntletWordBuildingAnswer({
  dojoType: _dojoType,
  options,
  disabledOptions,
  onSubmit,
  renderOption,
  isDisabled = false,
}: GauntletWordBuildingAnswerProps) {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const optionsKey = useMemo(() => options.join('\n'), [options]);

  useEffect(() => {
    setSelectedOption(null);
  }, [optionsKey]);

  const canSubmit = !isDisabled && !!selectedOption;

  const availableOptions = useMemo(() => {
    return options;
  }, [options]);

  return (
    <div className='relative flex w-full max-w-2xl flex-col items-center gap-6'>
      {/* Answer row */}
      <div className='flex w-full justify-center'>
        <div className='w-full max-w-lg'>
          <AnimatePresence mode='popLayout'>
            {selectedOption ? (
              <motion.div
                key={selectedOption}
                variants={tileVariants}
                initial='hidden'
                animate='visible'
                exit='exit'
                className='w-full'
              >
                <TileButton
                  disabled={isDisabled}
                  isSelected={true}
                  onClick={() => setSelectedOption(null)}
                >
                  <span className='block text-3xl lg:text-4xl'>
                    {renderOption
                      ? renderOption(selectedOption)
                      : selectedOption}
                  </span>
                </TileButton>
              </motion.div>
            ) : (
              <motion.div
                key='blank'
                variants={tileVariants}
                initial='hidden'
                animate='visible'
                exit='exit'
                className='w-full rounded-3xl border-2 border-dashed border-(--border-color) bg-(--card-color) px-4 py-6 text-center text-lg text-(--secondary-color)/50'
              >
                Select an option
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Available tiles grid */}
      <div className='grid w-full max-w-2xl grid-cols-2 gap-3 sm:grid-cols-3'>
        {availableOptions.map(option => {
          const isOptionDisabled =
            isDisabled || disabledOptions.includes(option) || false;
          const isSelected = selectedOption === option;

          return (
            <motion.div
              key={option}
              variants={tileVariants}
              initial='hidden'
              animate='visible'
            >
              <TileButton
                disabled={isOptionDisabled}
                isSelected={isSelected}
                onClick={() => {
                  setSelectedOption(prev => (prev === option ? null : option));
                }}
              >
                <span className='block text-2xl lg:text-3xl'>
                  {renderOption ? renderOption(option) : option}
                </span>
              </TileButton>
            </motion.div>
          );
        })}
      </div>

      <GameBottomBar
        state='check'
        onAction={() => {
          if (canSubmit && selectedOption) onSubmit(selectedOption);
        }}
        canCheck={canSubmit}
        actionLabel='submit'
        feedbackTitle=''
        feedbackContent={null}
        hideRetry
        buttonRef={buttonRef}
      />

      <div className='h-32' />
    </div>
  );
}
