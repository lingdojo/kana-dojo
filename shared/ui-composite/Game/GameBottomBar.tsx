'use client';
import React, { ReactNode, useEffect, useRef, useState } from 'react';
import { CircleCheck, RotateCcw, Flag } from 'lucide-react';
import clsx from 'clsx';
import { ActionButton } from '@/shared/ui/components/ActionButton';
import { useClick } from '@/shared/hooks/generic/useAudio';

// Toggle between new SVG check icon (true) and old CircleCheck icon (false)
const USE_NEW_CHECK_ICON = true;

export type BottomBarState = 'check' | 'correct' | 'wrong';

interface GameBottomBarProps {
  state: BottomBarState;
  onAction: () => void;
  canCheck: boolean;
  feedbackTitle?: string;
  feedbackContent: ReactNode;
  actionLabel?: string;
  secondaryAction?: ReactNode;
  buttonRef?: React.RefObject<HTMLButtonElement | null>;
  className?: string;
  /** When true, shows "Check" button instead of "Try Again" on wrong answers (for Input/Type mode) */
  hideRetry?: boolean;
  /** Increment this value to hide wrong-answer feedback until the next check */
  clearWrongFeedbackSignal?: number;
  /** Increment this value on each wrong submission to show wrong-answer feedback again */
  wrongFeedbackSignal?: number;
}

export const GameBottomBar = ({
  state,
  onAction,
  canCheck,
  feedbackTitle,
  feedbackContent,
  actionLabel,
  secondaryAction,
  buttonRef,
  className,
  hideRetry = false,
  clearWrongFeedbackSignal,
  wrongFeedbackSignal,
}: GameBottomBarProps) => {
  const { playClick } = useClick();

  const isCorrect = state === 'correct';
  const isWrong = state === 'wrong';
  const [hideWrongFeedback, setHideWrongFeedback] = useState(false);
  const lastClearSignalRef = useRef<number | undefined>(clearWrongFeedbackSignal);
  const showFeedback = state !== 'check' && !(isWrong && hideWrongFeedback);
  const showContinue = isCorrect;
  // When hideRetry is true, treat wrong state like check state for button display
  const showRetryButton = isWrong && !hideRetry;
  const showNextButton =
    actionLabel === 'next' || showContinue || (isWrong && hideRetry);

  // Default titles if not provided
  const defaultTitle = isCorrect
    ? 'Nicely done!'
    : isWrong
      ? 'Wrong! Correct answer:'
      : '';
  const displayTitle = feedbackTitle || defaultTitle;

  // Keep feedback tied to the most recently checked question.
  // This prevents the next question's answer from flashing during transition.
  const [frozenTitle, setFrozenTitle] = useState(displayTitle);
  const [frozenFeedbackContent, setFrozenFeedbackContent] =
    useState<ReactNode>(feedbackContent);

  useEffect(() => {
    if (state !== 'check') {
      setFrozenTitle(displayTitle);
      setFrozenFeedbackContent(feedbackContent);
    }
  }, [state, displayTitle, feedbackContent]);

  useEffect(() => {
    if (state !== 'wrong') {
      setHideWrongFeedback(false);
    }
  }, [state]);

  useEffect(() => {
    if (state === 'wrong') {
      setHideWrongFeedback(false);
    }
  }, [state, wrongFeedbackSignal]);

  useEffect(() => {
    const didClearSignalChange =
      lastClearSignalRef.current !== clearWrongFeedbackSignal;
    lastClearSignalRef.current = clearWrongFeedbackSignal;

    if (state === 'wrong' && didClearSignalChange) {
      setHideWrongFeedback(true);
    }
  }, [state, clearWrongFeedbackSignal]);

  return (
    <div
      className={clsx(
        'right-0 left-0 w-full',
        'border-t-2 border-(--border-color) bg-(--card-color)',
        'absolute bottom-0 z-10 px-2.5 py-4 sm:py-3 md:bottom-6 md:px-12 md:pt-2 md:pb-4',
        'flex flex-col items-center justify-center gap-4 sm:flex-row sm:gap-0',
        className,
      )}
    >
      {/* Feedback Container: Hidden on mobile when no feedback, always visible on desktop */}
      <div
        className={clsx(
          'w-full items-center justify-between sm:flex sm:w-1/2 sm:justify-center',
          showFeedback ? 'flex' : 'hidden',
        )}
      >
        <div
          className={clsx(
            'flex items-center gap-3 transition-all duration-500 md:gap-4',
            showFeedback
              ? 'translate-x-0 opacity-100'
              : 'pointer-events-none -translate-x-4 opacity-0 sm:-translate-x-8',
          )}
        >
          {isCorrect &&
            (USE_NEW_CHECK_ICON ? (
              <div className='flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 border-(--main-color) bg-(--main-color) sm:h-12 sm:w-12'>
                <svg
                  className='h-6 w-6 text-(--background-color) sm:h-8 sm:w-8'
                  fill='none'
                  viewBox='0 0 24 24'
                  stroke='currentColor'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={3}
                    d='M5 13l4 4L19 7'
                  />
                </svg>
              </div>
            ) : (
              <CircleCheck className='h-10 w-10 text-(--main-color) sm:h-12 sm:w-12' />
            ))}
          {isWrong && (
            <div className='flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 border-(--main-color) bg-(--main-color) sm:h-12 sm:w-12'>
              <svg
                className='h-6 w-6 text-(--background-color) sm:h-8 sm:w-8'
                fill='none'
                viewBox='0 0 24 24'
                stroke='currentColor'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={3}
                  d='M6 6l12 12M18 6L6 18'
                />
              </svg>
            </div>
          )}
          <p className='flex flex-col'>
            <span className='text-lg text-(--secondary-color) sm:text-xl'>
              {frozenTitle}
            </span>
            <span className='text-sm text-(--main-color) sm:text-lg'>
              {frozenFeedbackContent}
            </span>
          </p>
          <button
            onClick={() => {
              playClick();
              window.open('https://tally.so/r/2E4rB9', '_blank', 'noopener');
            }}
            className='max-sm:hidden'
          >
            <Flag className='h-6 w-6 text-(--secondary-color) delay-0 hover:cursor-pointer hover:text-(--main-color)' />
          </button>
        </div>
        <button
          onClick={() => {
            playClick();
            window.open('https://tally.so/r/2E4rB9', '_blank', 'noopener');
          }}
          className='sm:hidden'
        >
          <Flag className='h-6 w-6 text-(--secondary-color) delay-0 hover:cursor-pointer hover:text-(--main-color)' />
        </button>
      </div>

      {/* Buttons Container: Full width on mobile, 50% on desktop */}
      <div className='flex w-full flex-row items-end justify-center gap-2 sm:w-1/2 sm:gap-3'>
        {/* Main Action Button Wrapper: 80% if secondary exists, else 100% on mobile */}
        <div
          className={clsx(
            'flex h-[68px] items-end sm:h-[72px]',
            secondaryAction ? 'w-[80%] sm:w-auto' : 'w-full sm:w-auto',
          )}
        >
          <ActionButton
            ref={buttonRef}
            borderBottomThickness={12}
            borderRadius='3xl'
            className={clsx(
              'w-full px-6 py-2.5 text-lg font-medium transition-all duration-150 sm:w-auto sm:px-12 sm:py-3 sm:text-xl',
              !canCheck &&
                !showContinue &&
                !showRetryButton &&
                'cursor-default opacity-60',
              (canCheck || showNextButton) &&
                'animate-float [--float-distance:-2.5px]',
            )}
            onClick={onAction}
          >
            {showRetryButton ? (
              <div className='flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 border-(--background-color) bg-(--background-color)'>
                <RotateCcw className='h-5 w-5 text-(--main-color)' />
              </div>
            ) : showNextButton ? (
              USE_NEW_CHECK_ICON ? (
                <div className='flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 border-(--background-color) bg-(--background-color)'>
                  <svg
                    className='h-5 w-5 text-(--main-color)'
                    fill='none'
                    viewBox='0 0 24 24'
                    stroke='currentColor'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M13 7l5 5m0 0l-5 5m5-5H6'
                    />
                  </svg>
                </div>
              ) : (
                <svg
                  className='h-5 w-5 text-(--main-color)'
                  fill='none'
                  viewBox='0 0 24 24'
                  stroke='currentColor'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M13 7l5 5m0 0l-5 5m5-5H6'
                  />
                </svg>
              )
            ) : USE_NEW_CHECK_ICON ? (
              <div className='flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 border-(--background-color) bg-(--background-color)'>
                <svg
                  className='h-5 w-5 text-(--main-color)'
                  fill='none'
                  viewBox='0 0 24 24'
                  stroke='currentColor'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={3}
                    d='M5 13l4 4L19 7'
                  />
                </svg>
              </div>
            ) : (
              <CircleCheck className='h-8 w-8' />
            )}
            <span className=''>
              {actionLabel ||
                (state === 'correct'
                  ? 'next'
                  : showRetryButton
                    ? 'try again'
                    : 'check')}
            </span>
          </ActionButton>
        </div>

        {/* Secondary Action Wrapper: 20% on mobile */}
        {secondaryAction && (
          <div className='flex h-[68px] w-[20%] items-end sm:h-[72px] sm:w-auto'>
            {secondaryAction}
          </div>
        )}
      </div>
    </div>
  );
};
