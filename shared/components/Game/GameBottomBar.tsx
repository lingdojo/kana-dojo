'use client';
import { ReactNode } from 'react';
import {
  CircleCheck,
  CircleX,
  CircleArrowRight,
  RotateCcw,
} from 'lucide-react';
import clsx from 'clsx';
import { ActionButton } from '@/shared/components/ui/ActionButton';

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
}: GameBottomBarProps) => {
  const isCorrect = state === 'correct';
  const isWrong = state === 'wrong';
  const showFeedback = state !== 'check';
  const showContinue = isCorrect;
  // When hideRetry is true, treat wrong state like check state for button display
  const showRetryButton = isWrong && !hideRetry;

  // Default titles if not provided
  const defaultTitle = isCorrect ? 'Nicely done!' : 'Wrong! Correct answer:';
  const displayTitle = feedbackTitle || defaultTitle;

  return (
    <div
      className={clsx(
        'right-0 left-0 w-full',
        'border-t-2 border-(--border-color) bg-(--card-color)',
        'absolute bottom-0 z-10 px-2 py-4 sm:py-3 md:bottom-6 md:px-12 md:pt-2 md:pb-4',
        'flex flex-col items-center justify-center gap-4 sm:flex-row sm:gap-0',
        className,
      )}
    >
      {/* Feedback Container: Hidden on mobile when no feedback, always visible on desktop */}
      <div
        className={clsx(
          'w-full items-center justify-start sm:flex sm:w-1/2 sm:justify-center',
          showFeedback ? 'flex' : 'hidden',
        )}
      >
        <div
          className={clsx(
            'flex items-center gap-2 transition-all duration-500 sm:gap-3 md:gap-4',
            showFeedback
              ? 'translate-x-0 opacity-100'
              : 'pointer-events-none -translate-x-4 opacity-0 sm:-translate-x-8',
          )}
        >
          {isCorrect ? (
            <CircleCheck className='h-10 w-10 text-(--main-color) sm:h-12 sm:w-12' />
          ) : (
            <CircleX className='h-10 w-10 text-(--main-color) sm:h-12 sm:w-12' />
          )}
          <div className='flex flex-col'>
            <span className='text-lg text-(--secondary-color) sm:text-xl'>
              {displayTitle}
            </span>
            <span className='text-sm text-(--main-color) sm:text-lg'>
              {feedbackContent}
            </span>
          </div>
        </div>
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
            )}
            onClick={onAction}
          >
            {showRetryButton ? (
              <RotateCcw className='h-8 w-8' />
            ) : state === 'correct' ? (
              <CircleArrowRight className='h-8 w-8' />
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
