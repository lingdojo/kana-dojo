'use client';

import React, { useRef, useEffect } from 'react';
import clsx from 'clsx';
import {
  Heart,
  HeartCrack,
  X,
  Flame,
  SquareCheck,
  SquareX,
  MousePointerClick,
  Keyboard
} from 'lucide-react';
import { buttonBorderStyles } from '@/shared/lib/styles';
import {
  DIFFICULTY_CONFIG,
  type GauntletDifficulty,
  type GauntletGameMode
} from './types';

interface ActiveGameProps<T> {
  // Dojo type for layout customization
  dojoType: 'kana' | 'kanji' | 'vocabulary';

  // Progress
  currentIndex: number;
  totalQuestions: number;

  // Lives
  lives: number;
  maxLives: number;
  difficulty: GauntletDifficulty;
  lifeJustGained: boolean;
  lifeJustLost: boolean;

  // Time
  elapsedTime: number;

  // Question display
  currentQuestion: T | null;
  renderQuestion: (question: T, isReverse?: boolean) => React.ReactNode;
  isReverseActive: boolean;

  // Game mode
  gameMode: GauntletGameMode;
  inputPlaceholder: string;
  userAnswer: string;
  setUserAnswer: (answer: string) => void;
  onSubmit: (e?: React.FormEvent) => void;
  getCorrectAnswer: (question: T, isReverse?: boolean) => string;

  // Pick mode
  shuffledOptions: string[];
  wrongSelectedAnswers: string[];
  onOptionClick: (option: string) => void;
  renderOption?: (
    option: string,
    items: T[],
    isReverse?: boolean
  ) => React.ReactNode;
  items: T[];

  // Feedback (kept for API compatibility but no longer displayed)
  lastAnswerCorrect: boolean | null;
  currentStreak: number;
  correctSinceLastRegen: number;
  regenThreshold: number;

  // Stats
  correctAnswers: number;
  wrongAnswers: number;

  // Actions
  onCancel: () => void;
}

// Stat item component matching ReturnFromGame
const StatItem = ({
  icon: Icon,
  value
}: {
  icon: React.ElementType;
  value: number;
}) => (
  <p className='flex flex-row items-center gap-1 text-xl'>
    <Icon size={20} />
    <span>{value}</span>
  </p>
);

export default function ActiveGame<T>({
  dojoType,
  currentIndex,
  totalQuestions,
  lives,
  maxLives,
  difficulty,
  elapsedTime: _elapsedTime,
  currentQuestion,
  renderQuestion,
  isReverseActive,
  gameMode,
  inputPlaceholder,
  userAnswer,
  setUserAnswer,
  onSubmit,
  getCorrectAnswer: _getCorrectAnswer,
  shuffledOptions,
  wrongSelectedAnswers,
  onOptionClick,
  renderOption,
  items,
  lastAnswerCorrect: _lastAnswerCorrect,
  currentStreak,
  correctSinceLastRegen: _correctSinceLastRegen,
  regenThreshold: _regenThreshold,
  correctAnswers,
  wrongAnswers,
  onCancel
}: ActiveGameProps<T>) {
  const inputRef = useRef<HTMLInputElement>(null);
  const buttonRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const progressPercent = Math.round((currentIndex / totalQuestions) * 100);

  // Focus input for Type mode
  useEffect(() => {
    if (gameMode === 'Type' && inputRef.current) {
      inputRef.current.focus();
    }
  }, [currentQuestion, gameMode]);

  // Keyboard shortcuts for Pick mode (1, 2, 3 keys)
  useEffect(() => {
    if (gameMode !== 'Pick') return;

    const handleKeyDown = (event: KeyboardEvent) => {
      const keyMap: Record<string, number> = {
        Digit1: 0,
        Digit2: 1,
        Digit3: 2,
        Numpad1: 0,
        Numpad2: 1,
        Numpad3: 2
      };
      const index = keyMap[event.code];
      if (index !== undefined && index < shuffledOptions.length) {
        buttonRefs.current[index]?.click();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameMode, shuffledOptions.length]);

  // Get game mode icon
  const ModeIcon = gameMode === 'Pick' ? MousePointerClick : Keyboard;

  return (
    <div
      className={clsx(
        'flex min-h-[100dvh] flex-col items-center px-4 pt-4 md:pt-8'
      )}
    >
      {/* Header section - matching ReturnFromGame layout */}
      <div className='flex w-full flex-col md:w-2/3 lg:w-1/2'>
        {/* Row 1: Exit button, Progress bar, Lives */}
        <div className='flex w-full flex-row items-center justify-between gap-4 md:gap-6'>
          {/* Exit Button */}
          <button
            onClick={onCancel}
            className='text-[var(--border-color)] duration-250 hover:cursor-pointer hover:text-[var(--secondary-color)]'
          >
            <X size={32} />
          </button>

          {/* Progress Bar - Gauntlet specific with percentage */}
          <div className='flex flex-1 flex-col gap-1'>
            <div className='h-3 w-full overflow-hidden rounded-full bg-[var(--card-color)]'>
              <div
                className='h-3 rounded-full bg-[var(--main-color)] transition-all duration-300'
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <div className='flex justify-between text-xs text-[var(--muted-color)]'>
              <span>
                {currentIndex + 1} / {totalQuestions}
              </span>
              <span>{progressPercent}%</span>
            </div>
          </div>

          {/* Lives Display */}
          <div className='flex items-center gap-1'>
            {Array.from({ length: maxLives }).map((_, i) => {
              const hasLife = i < lives;
              return (
                <div key={i}>
                  {hasLife ? (
                    <Heart
                      size={24}
                      className='fill-[var(--main-color)] text-[var(--main-color)]'
                    />
                  ) : (
                    <HeartCrack
                      size={24}
                      className='text-[var(--border-color)]'
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Row 2: Game mode and stats - matching ReturnFromGame exactly */}
        <div className='flex w-full flex-row items-center'>
          {/* Game mode indicator */}
          <p className='flex w-1/2 items-center justify-start gap-1 text-lg sm:gap-2 sm:pl-1 md:text-xl'>
            <ModeIcon className='text-[var(--main-color)]' />
            <span className='text-[var(--secondary-color)]'>
              {gameMode.toLowerCase()}
            </span>
          </p>

          {/* Stats display - matching ReturnFromGame */}
          <div className='flex w-1/2 flex-row items-center justify-end gap-1.5 py-2 text-[var(--secondary-color)] sm:gap-2 md:gap-3'>
            <StatItem icon={SquareCheck} value={correctAnswers} />
            <StatItem icon={SquareX} value={wrongAnswers} />
            <StatItem icon={Flame} value={currentStreak} />
          </div>
        </div>
      </div>

      {/* Main game area - centered with proper spacing */}
      <div className='flex w-full flex-1 flex-col items-center gap-8 sm:w-4/5 sm:gap-10'>
        {/* Question Display - matching Classic game layout */}
        <div className='flex flex-row items-center justify-center gap-1'>
          <p className='text-8xl font-medium sm:text-9xl'>
            {currentQuestion &&
              renderQuestion(currentQuestion, isReverseActive)}
          </p>
        </div>

        {/* Answer Area - layout based on dojoType and gameMode */}
        {gameMode === 'Type' ? (
          /* Type mode - same for all dojos */
          <form
            onSubmit={onSubmit}
            className='flex w-full max-w-lg flex-col items-center gap-4'
          >
            <input
              ref={inputRef}
              type='text'
              value={userAnswer}
              onChange={e => setUserAnswer(e.target.value)}
              placeholder={inputPlaceholder}
              className={clsx(
                'w-full text-center text-2xl lg:text-4xl',
                'border-b-2 bg-transparent pb-2 outline-none',
                'text-[var(--secondary-color)]',
                'border-[var(--border-color)] focus:border-[var(--main-color)]'
              )}
              autoComplete='off'
              autoCorrect='off'
              autoCapitalize='off'
              spellCheck='false'
            />
            <button
              type='submit'
              disabled={!userAnswer.trim()}
              className={clsx(
                'flex h-12 w-full flex-row items-center justify-center gap-2 px-6',
                'rounded-2xl transition-colors duration-200',
                'border-b-6 font-medium shadow-sm',
                userAnswer.trim()
                  ? 'border-[var(--main-color-accent)] bg-[var(--main-color)] text-[var(--background-color)] hover:cursor-pointer'
                  : 'cursor-not-allowed border-[var(--border-color)] bg-[var(--card-color)] text-[var(--border-color)]'
              )}
            >
              Submit
            </button>
          </form>
        ) : dojoType === 'kana' ? (
          /* Kana Pick mode - horizontal row layout matching Kana/Pick.tsx */
          <div className='flex w-full flex-row gap-5 sm:justify-evenly sm:gap-0'>
            {shuffledOptions.map((option, i) => {
              const isWrong = wrongSelectedAnswers.includes(option);
              return (
                <button
                  ref={elem => {
                    buttonRefs.current[i] = elem;
                  }}
                  key={option + i}
                  type='button'
                  disabled={isWrong}
                  className={clsx(
                    'relative flex w-full flex-row items-center justify-center gap-1 pt-3 pb-6 text-5xl font-semibold sm:w-1/5',
                    buttonBorderStyles,
                    'border-b-4',
                    isWrong &&
                      'border-[var(--border-color)] text-[var(--border-color)] hover:border-[var(--border-color)] hover:bg-[var(--card-color)]',
                    !isWrong &&
                      'border-[var(--secondary-color)]/50 text-[var(--secondary-color)] hover:border-[var(--secondary-color)]'
                  )}
                  onClick={() => onOptionClick(option)}
                  lang={isReverseActive ? 'ja' : undefined}
                >
                  <span>
                    {renderOption
                      ? renderOption(option, items, isReverseActive)
                      : option}
                  </span>
                  <span
                    className={clsx(
                      'absolute top-1/2 right-4 hidden h-5 min-w-5 -translate-y-1/2 items-center justify-center rounded-full bg-[var(--border-color)] px-1 text-xs leading-none lg:inline-flex',
                      isWrong
                        ? 'text-[var(--border-color)]'
                        : 'text-[var(--secondary-color)]'
                    )}
                  >
                    {i + 1}
                  </span>
                </button>
              );
            })}
          </div>
        ) : (
          /* Kanji/Vocabulary Pick mode - vertical stacked layout matching their Pick.tsx */
          <div
            className={clsx(
              'flex w-full flex-col items-center gap-6',
              dojoType === 'kanji' &&
                isReverseActive &&
                'md:flex-row md:justify-evenly'
            )}
          >
            {shuffledOptions.map((option, i) => {
              const isWrong = wrongSelectedAnswers.includes(option);
              return (
                <button
                  ref={elem => {
                    buttonRefs.current[i] = elem;
                  }}
                  key={option + i}
                  type='button'
                  disabled={isWrong}
                  className={clsx(
                    'flex flex-row items-center gap-1.5 rounded-xl py-5',
                    buttonBorderStyles,
                    'active:scale-95 active:duration-200 md:active:scale-98',
                    'border-b-4',
                    // Width and alignment based on dojo and mode
                    dojoType === 'kanji' && isReverseActive
                      ? 'w-full justify-center text-5xl md:w-1/4 lg:w-1/5'
                      : 'w-full justify-start pl-8 text-3xl md:w-1/2 md:text-4xl',
                    // Colors
                    isWrong &&
                      'border-[var(--border-color)] text-[var(--border-color)] hover:border-[var(--border-color)] hover:bg-[var(--card-color)]',
                    !isWrong &&
                      'border-[var(--secondary-color)]/50 text-[var(--secondary-color)] hover:border-[var(--secondary-color)]'
                  )}
                  onClick={() => onOptionClick(option)}
                  lang={isReverseActive ? 'ja' : undefined}
                >
                  <span
                    className={clsx(
                      dojoType === 'kanji' && isReverseActive
                        ? ''
                        : 'flex-1 text-left'
                    )}
                  >
                    {renderOption
                      ? renderOption(option, items, isReverseActive)
                      : option}
                  </span>
                  <span
                    className={clsx(
                      'hidden rounded-full bg-[var(--border-color)] px-1 text-xs lg:inline',
                      dojoType === 'kanji' && isReverseActive ? '' : 'mr-4',
                      isWrong
                        ? 'text-[var(--border-color)]'
                        : 'text-[var(--secondary-color)]'
                    )}
                  >
                    {i + 1}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
