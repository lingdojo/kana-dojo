'use client';

import React, { useRef, useEffect } from 'react';
import { Timer, Target, X } from 'lucide-react';
import clsx from 'clsx';
import { ActionButton } from '@/shared/components/ui/ActionButton';
import GoalTimersPanel from '@/shared/components/Timer/GoalTimersPanel';
import { buttonBorderStyles } from '@/shared/lib/styles';
import type { BlitzGameMode, GoalTimer, AddGoalFn } from './types';

interface ActiveGameProps<T> {
  // Timer
  minutes: number;
  seconds: number;
  timeLeft: number;
  challengeDuration: number;

  // Question
  currentQuestion: T | null;
  renderQuestion: (question: T, isReverse?: boolean) => React.ReactNode;
  isReverseActive: boolean;

  // Game mode
  gameMode: BlitzGameMode;
  inputPlaceholder: string;

  // Type mode
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
    isReverse?: boolean,
  ) => React.ReactNode;
  items: T[];

  // Feedback
  lastAnswerCorrect: boolean | null;

  // Stats
  stats: {
    correct: number;
    wrong: number;
    streak: number;
  };

  // Goal timers
  showGoalTimers: boolean;
  elapsedTime: number;
  goalTimers: {
    goals: GoalTimer[];
    addGoal: AddGoalFn;
    removeGoal: (id: string) => void;
    clearGoals: () => void;
    nextGoal: GoalTimer | undefined;
    progressToNextGoal: number;
  };

  // Actions
  onCancel: () => void;
}

export default function ActiveGame<T>({
  minutes,
  seconds,
  timeLeft,
  challengeDuration,
  currentQuestion,
  renderQuestion,
  isReverseActive,
  gameMode,
  inputPlaceholder,
  userAnswer,
  setUserAnswer,
  onSubmit,
  getCorrectAnswer,
  shuffledOptions,
  wrongSelectedAnswers,
  onOptionClick,
  renderOption,
  items,
  lastAnswerCorrect,
  stats,
  showGoalTimers,
  elapsedTime,
  goalTimers,
  onCancel,
}: ActiveGameProps<T>) {
  const inputRef = useRef<HTMLInputElement>(null);
  const buttonRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const totalAnswers = stats.correct + stats.wrong;
  const accuracy =
    totalAnswers > 0 ? Math.round((stats.correct / totalAnswers) * 100) : 0;

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
        Numpad3: 2,
      };
      const index = keyMap[event.code];
      if (index !== undefined && index < shuffledOptions.length) {
        buttonRefs.current[index]?.click();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameMode, shuffledOptions.length]);

  return (
    <div className='flex min-h-[100dvh] flex-col items-start justify-center gap-6 p-4 lg:flex-row'>
      <div className='w-full max-w-md space-y-6 lg:max-w-lg'>
        {/* Header with timer, stats, and cancel button */}
        <GameHeader
          minutes={minutes}
          seconds={seconds}
          timeLeft={timeLeft}
          stats={stats}
          onCancel={onCancel}
        />

        {/* Progress bar */}
        <div className='h-2 w-full rounded-full bg-(--border-color)'>
          <div
            className='h-2 rounded-full bg-(--main-color) transition-all duration-1000'
            style={{
              width: `${
                ((challengeDuration - timeLeft) / challengeDuration) * 100
              }%`,
            }}
          />
        </div>

        {/* Current question */}
        <QuestionDisplay
          currentQuestion={currentQuestion}
          renderQuestion={renderQuestion}
          isReverseActive={isReverseActive}
          lastAnswerCorrect={lastAnswerCorrect}
          gameMode={gameMode}
          getCorrectAnswer={getCorrectAnswer}
        />

        {/* Type mode: Input form */}
        {gameMode === 'Type' && (
          <TypeModeInput
            inputRef={inputRef}
            userAnswer={userAnswer}
            setUserAnswer={setUserAnswer}
            onSubmit={onSubmit}
            inputPlaceholder={inputPlaceholder}
          />
        )}

        {/* Pick mode: Option buttons */}
        {gameMode === 'Pick' && (
          <PickModeOptions
            buttonRefs={buttonRefs}
            shuffledOptions={shuffledOptions}
            wrongSelectedAnswers={wrongSelectedAnswers}
            onOptionClick={onOptionClick}
            renderOption={renderOption}
            items={items}
            isReverseActive={isReverseActive}
          />
        )}

        {/* Real-time stats */}
        <RealTimeStats
          correct={stats.correct}
          wrong={stats.wrong}
          accuracy={accuracy}
        />
      </div>

      {/* Goal Timers Sidebar - During Game */}
      {showGoalTimers && goalTimers.goals.length > 0 && (
        <GoalTimersSidebar
          goals={goalTimers.goals}
          elapsedTime={elapsedTime}
          goalTimers={goalTimers}
        />
      )}
    </div>
  );
}

// Sub-components

function GameHeader({
  minutes,
  seconds,
  timeLeft,
  stats,
  onCancel,
}: {
  minutes: number;
  seconds: number;
  timeLeft: number;
  stats: { correct: number; streak: number };
  onCancel: () => void;
}) {
  return (
    <div className='flex items-center justify-between'>
      <div className='flex items-center gap-2'>
        <Timer className='text-(--main-color)' size={20} />
        <span
          className={clsx(
            'text-lg font-bold',
            timeLeft <= 10
              ? 'animate-pulse text-red-500'
              : 'text-(--secondary-color)',
          )}
        >
          {minutes}:{seconds.toString().padStart(2, '0')}
        </span>
      </div>
      <div className='flex items-center gap-4'>
        <div className='text-right text-sm text-(--muted-color)'>
          <div>
            <span className='text-(--secondary-color)'>Score: </span>
            <span className='text-(--main-color)'>{stats.correct}</span>
          </div>
          <div>
            <span className='text-(--secondary-color)'>Streak: </span>
            <span className='text-(--main-color)'>{stats.streak}</span>
          </div>
        </div>
        <ActionButton
          onClick={onCancel}
          colorScheme='secondary'
          borderColorScheme='secondary'
          borderRadius='2xl'
          borderBottomThickness={10}
          className='w-auto px-3 py-2'
          title='Cancel challenge'
        >
          <X size={20} />
        </ActionButton>
      </div>
    </div>
  );
}

function QuestionDisplay<T>({
  currentQuestion,
  renderQuestion,
  isReverseActive,
  lastAnswerCorrect,
  gameMode,
  getCorrectAnswer,
}: {
  currentQuestion: T | null;
  renderQuestion: (question: T, isReverse?: boolean) => React.ReactNode;
  isReverseActive: boolean;
  lastAnswerCorrect: boolean | null;
  gameMode: BlitzGameMode;
  getCorrectAnswer: (question: T, isReverse?: boolean) => string;
}) {
  return (
    <div className='space-y-4 text-center'>
      <div className='flex flex-col items-center gap-4'>
        <div
          className={clsx(
            'transition-all duration-200',
            isReverseActive
              ? 'text-4xl font-medium md:text-5xl'
              : 'text-6xl font-semibold md:text-7xl',
            lastAnswerCorrect === true && 'text-green-500',
            lastAnswerCorrect === false && 'text-red-500',
            lastAnswerCorrect === null && 'text-(--main-color)',
          )}
        >
          {currentQuestion && renderQuestion(currentQuestion, isReverseActive)}
        </div>
      </div>

      {/* Feedback - fixed height to prevent layout shift */}
      <div className='flex h-6 items-center justify-center'>
        {lastAnswerCorrect !== null && currentQuestion && (
          <div
            className={clsx(
              'text-sm font-medium',
              lastAnswerCorrect ? 'text-green-500' : 'text-red-500',
            )}
          >
            {lastAnswerCorrect
              ? '✓ Correct!'
              : gameMode === 'Pick'
                ? '✗ Try again!'
                : `✗ Incorrect! It was "${getCorrectAnswer(
                    currentQuestion,
                    isReverseActive,
                  )}"`}
          </div>
        )}
      </div>
    </div>
  );
}

function TypeModeInput({
  inputRef,
  userAnswer,
  setUserAnswer,
  onSubmit,
  inputPlaceholder,
}: {
  inputRef: React.RefObject<HTMLInputElement | null>;
  userAnswer: string;
  setUserAnswer: (answer: string) => void;
  onSubmit: (e?: React.FormEvent) => void;
  inputPlaceholder: string;
}) {
  return (
    <form onSubmit={onSubmit} className='space-y-4'>
      <input
        ref={inputRef}
        type='text'
        value={userAnswer}
        onChange={e => setUserAnswer(e.target.value)}
        onKeyPress={e => e.key === 'Enter' && onSubmit()}
        className='w-full rounded-lg border-2 border-(--border-color) bg-(--card-color) p-4 text-center text-lg text-(--secondary-color) focus:border-(--main-color) focus:outline-none'
        placeholder={inputPlaceholder}
        autoComplete='off'
        autoFocus
      />
      <button
        type='submit'
        disabled={!userAnswer.trim()}
        className={clsx(
          'flex h-12 w-full flex-row items-center justify-center gap-2 px-6',
          'rounded-2xl transition-colors duration-200',
          'border-b-6 font-medium shadow-sm',
          userAnswer.trim()
            ? 'border-(--main-color-accent) bg-(--main-color) text-(--background-color) hover:cursor-pointer'
            : 'cursor-not-allowed border-(--border-color) bg-(--card-color) text-(--border-color)',
        )}
      >
        Submit
      </button>
    </form>
  );
}

function PickModeOptions<T>({
  buttonRefs,
  shuffledOptions,
  wrongSelectedAnswers,
  onOptionClick,
  renderOption,
  items,
  isReverseActive,
}: {
  buttonRefs: React.MutableRefObject<(HTMLButtonElement | null)[]>;
  shuffledOptions: string[];
  wrongSelectedAnswers: string[];
  onOptionClick: (option: string) => void;
  renderOption?: (
    option: string,
    items: T[],
    isReverse?: boolean,
  ) => React.ReactNode;
  items: T[];
  isReverseActive: boolean;
}) {
  return (
    <div className='flex w-full flex-col gap-4'>
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
              'flex w-full flex-row items-center gap-1.5 rounded-xl py-5',
              isReverseActive
                ? 'justify-center text-5xl'
                : 'justify-start pl-8 text-2xl md:text-3xl',
              buttonBorderStyles,
              'active:scale-95 active:duration-200 md:active:scale-98',
              'text-(--border-color)',
              'border-b-4',
              isWrong &&
                'border-(--border-color) hover:bg-(--card-color)',
              !isWrong &&
                'border-(--secondary-color)/50 text-(--secondary-color) hover:border-(--secondary-color)',
            )}
            onClick={() => onOptionClick(option)}
            lang={isReverseActive ? 'ja' : undefined}
          >
            <span className={clsx(isReverseActive ? '' : 'flex-1 text-left')}>
              {renderOption
                ? renderOption(option, items, isReverseActive)
                : option}
            </span>
            <span
              className={clsx(
                'hidden rounded-full bg-(--border-color) px-1 text-xs lg:inline',
                isReverseActive ? '' : 'mr-4',
                isWrong
                  ? 'text-(--border-color)'
                  : 'text-(--secondary-color)',
              )}
            >
              {i + 1}
            </span>
          </button>
        );
      })}
    </div>
  );
}

function RealTimeStats({
  correct,
  wrong,
  accuracy,
}: {
  correct: number;
  wrong: number;
  accuracy: number;
}) {
  return (
    <div className='grid grid-cols-3 gap-2 text-center text-sm'>
      <div className='rounded-lg bg-(--card-color) p-2'>
        <div className='font-bold text-green-500'>{correct}</div>
        <div className='text-(--muted-color)'>Correct</div>
      </div>
      <div className='rounded-lg bg-(--card-color) p-2'>
        <div className='font-bold text-red-500'>{wrong}</div>
        <div className='text-(--muted-color)'>Wrong</div>
      </div>
      <div className='rounded-lg bg-(--card-color) p-2'>
        <div className='font-bold text-(--main-color)'>{accuracy}%</div>
        <div className='text-(--muted-color)'>Accuracy</div>
      </div>
    </div>
  );
}

function GoalTimersSidebar({
  goals,
  elapsedTime,
  goalTimers,
}: {
  goals: GoalTimer[];
  elapsedTime: number;
  goalTimers: {
    addGoal: AddGoalFn;
    removeGoal: (id: string) => void;
    clearGoals: () => void;
    nextGoal: GoalTimer | undefined;
    progressToNextGoal: number;
  };
}) {
  return (
    <div className='w-full space-y-4 lg:w-80'>
      <GoalTimersPanel
        goals={goals}
        currentSeconds={elapsedTime}
        onAddGoal={goalTimers.addGoal}
        onRemoveGoal={goalTimers.removeGoal}
        onClearGoals={goalTimers.clearGoals}
        disabled={true}
      />
      {goalTimers.nextGoal && (
        <div
          className={clsx(
            'rounded-xl border-2 p-4',
            'border-(--main-color) bg-(--main-color)/5',
          )}
        >
          <div className='mb-2 flex items-center gap-2'>
            <Target size={16} className='text-(--main-color)' />
            <p className='text-sm font-medium text-(--secondary-color)'>
              Next Goal
            </p>
          </div>
          <p className='mb-2 font-bold text-(--main-color)'>
            {goalTimers.nextGoal.label}
          </p>
          <div className='h-2 w-full rounded-full bg-(--border-color)'>
            <div
              className='h-2 rounded-full bg-(--main-color) transition-all'
              style={{ width: `${goalTimers.progressToNextGoal}%` }}
            />
          </div>
          <p className='mt-1 text-center text-xs text-(--secondary-color)'>
            {Math.floor(goalTimers.nextGoal.targetSeconds / 60)}:
            {(goalTimers.nextGoal.targetSeconds % 60)
              .toString()
              .padStart(2, '0')}
          </p>
        </div>
      )}
    </div>
  );
}
