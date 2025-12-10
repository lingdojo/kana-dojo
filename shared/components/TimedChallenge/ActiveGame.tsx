'use client';

import React, { useRef, useEffect } from 'react';
import { Timer, Target, X } from 'lucide-react';
import clsx from 'clsx';
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
    isReverse?: boolean
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
  onCancel
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

  return (
    <div className='min-h-[100dvh] flex flex-col lg:flex-row items-start justify-center p-4 gap-6'>
      <div className='max-w-md w-full lg:max-w-lg space-y-6'>
        {/* Header with timer, stats, and cancel button */}
        <GameHeader
          minutes={minutes}
          seconds={seconds}
          timeLeft={timeLeft}
          stats={stats}
          onCancel={onCancel}
        />

        {/* Progress bar */}
        <div className='w-full bg-[var(--border-color)] rounded-full h-2'>
          <div
            className='bg-[var(--main-color)] h-2 rounded-full transition-all duration-1000'
            style={{
              width: `${
                ((challengeDuration - timeLeft) / challengeDuration) * 100
              }%`
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
  onCancel
}: {
  minutes: number;
  seconds: number;
  timeLeft: number;
  stats: { correct: number; streak: number };
  onCancel: () => void;
}) {
  return (
    <div className='flex justify-between items-center'>
      <div className='flex items-center gap-2'>
        <Timer className='text-[var(--main-color)]' size={20} />
        <span
          className={clsx(
            'text-lg font-bold',
            timeLeft <= 10
              ? 'text-red-500 animate-pulse'
              : 'text-[var(--secondary-color)]'
          )}
        >
          {minutes}:{seconds.toString().padStart(2, '0')}
        </span>
      </div>
      <div className='flex items-center gap-4'>
        <div className='text-right text-sm text-[var(--muted-color)]'>
          <div>Score: {stats.correct}</div>
          <div>Streak: {stats.streak}</div>
        </div>
        <button
          onClick={onCancel}
          className={clsx(
            'p-2 rounded-lg border-2 border-red-500/50 hover:bg-red-500/10 transition-colors'
          )}
          title='Cancel challenge'
        >
          <X size={20} className='text-red-500' />
        </button>
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
  getCorrectAnswer
}: {
  currentQuestion: T | null;
  renderQuestion: (question: T, isReverse?: boolean) => React.ReactNode;
  isReverseActive: boolean;
  lastAnswerCorrect: boolean | null;
  gameMode: BlitzGameMode;
  getCorrectAnswer: (question: T, isReverse?: boolean) => string;
}) {
  return (
    <div className='text-center space-y-4'>
      <div className='flex flex-col items-center gap-4'>
        <div
          className={clsx(
            'transition-all duration-200',
            isReverseActive
              ? 'text-4xl md:text-5xl font-medium'
              : 'text-6xl md:text-7xl font-semibold',
            lastAnswerCorrect === true && 'text-green-500',
            lastAnswerCorrect === false && 'text-red-500',
            lastAnswerCorrect === null && 'text-[var(--main-color)]'
          )}
        >
          {currentQuestion && renderQuestion(currentQuestion, isReverseActive)}
        </div>
      </div>

      {/* Feedback - fixed height to prevent layout shift */}
      <div className='h-6 flex items-center justify-center'>
        {lastAnswerCorrect !== null && currentQuestion && (
          <div
            className={clsx(
              'text-sm font-medium',
              lastAnswerCorrect ? 'text-green-500' : 'text-red-500'
            )}
          >
            {lastAnswerCorrect
              ? '✓ Correct!'
              : gameMode === 'Pick'
              ? '✗ Try again!'
              : `✗ Incorrect! It was "${getCorrectAnswer(
                  currentQuestion,
                  isReverseActive
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
  inputPlaceholder
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
        className='w-full p-4 text-lg text-center border-2 border-[var(--border-color)] rounded-lg bg-[var(--card-color)] text-[var(--secondary-color)] focus:border-[var(--main-color)] focus:outline-none'
        placeholder={inputPlaceholder}
        autoComplete='off'
        autoFocus
      />
      <button
        type='submit'
        disabled={!userAnswer.trim()}
        className={clsx(
          'w-full h-12 px-6 flex flex-row justify-center items-center gap-2',
          'rounded-2xl transition-colors duration-200',
          'font-medium border-b-6 shadow-sm',
          userAnswer.trim()
            ? 'bg-[var(--main-color)] text-[var(--background-color)] border-[var(--main-color-accent)] hover:cursor-pointer'
            : 'bg-[var(--card-color)] text-[var(--border-color)] border-[var(--border-color)] cursor-not-allowed'
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
  isReverseActive
}: {
  buttonRefs: React.MutableRefObject<(HTMLButtonElement | null)[]>;
  shuffledOptions: string[];
  wrongSelectedAnswers: string[];
  onOptionClick: (option: string) => void;
  renderOption?: (
    option: string,
    items: T[],
    isReverse?: boolean
  ) => React.ReactNode;
  items: T[];
  isReverseActive: boolean;
}) {
  return (
    <div className='flex flex-col w-full gap-4'>
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
              'py-5 rounded-xl w-full flex flex-row items-center gap-1.5',
              isReverseActive
                ? 'justify-center text-5xl'
                : 'pl-8 justify-start text-2xl md:text-3xl',
              buttonBorderStyles,
              'active:scale-95 md:active:scale-98 active:duration-200',
              'text-[var(--border-color)]',
              'border-b-4',
              isWrong &&
                'hover:bg-[var(--card-color)] border-[var(--border-color)]',
              !isWrong &&
                'text-[var(--secondary-color)] border-[var(--secondary-color)]/50 hover:border-[var(--secondary-color)]'
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
                'hidden lg:inline text-xs rounded-full bg-[var(--border-color)] px-1',
                isReverseActive ? '' : 'mr-4',
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
  );
}

function RealTimeStats({
  correct,
  wrong,
  accuracy
}: {
  correct: number;
  wrong: number;
  accuracy: number;
}) {
  return (
    <div className='grid grid-cols-3 gap-2 text-center text-sm'>
      <div className='bg-[var(--card-color)] rounded p-2'>
        <div className='text-green-500 font-bold'>{correct}</div>
        <div className='text-[var(--muted-color)]'>Correct</div>
      </div>
      <div className='bg-[var(--card-color)] rounded p-2'>
        <div className='text-red-500 font-bold'>{wrong}</div>
        <div className='text-[var(--muted-color)]'>Wrong</div>
      </div>
      <div className='bg-[var(--card-color)] rounded p-2'>
        <div className='text-[var(--main-color)] font-bold'>{accuracy}%</div>
        <div className='text-[var(--muted-color)]'>Accuracy</div>
      </div>
    </div>
  );
}

function GoalTimersSidebar({
  goals,
  elapsedTime,
  goalTimers
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
    <div className='w-full lg:w-80 space-y-4'>
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
            'p-4 border-2 rounded-xl',
            'border-[var(--main-color)] bg-[var(--main-color)]/5'
          )}
        >
          <div className='flex items-center gap-2 mb-2'>
            <Target size={16} className='text-[var(--main-color)]' />
            <p className='text-sm text-[var(--secondary-color)] font-medium'>
              Next Goal
            </p>
          </div>
          <p className='font-bold text-[var(--main-color)] mb-2'>
            {goalTimers.nextGoal.label}
          </p>
          <div className='w-full bg-[var(--border-color)] rounded-full h-2'>
            <div
              className='bg-[var(--main-color)] h-2 rounded-full transition-all'
              style={{ width: `${goalTimers.progressToNextGoal}%` }}
            />
          </div>
          <p className='text-xs text-[var(--secondary-color)] mt-1 text-center'>
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
