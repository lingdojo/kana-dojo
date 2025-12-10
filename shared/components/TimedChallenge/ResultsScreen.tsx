'use client';

import {
  Timer,
  Target,
  TrendingUp,
  RotateCcw,
  ArrowLeft,
  CheckCircle2,
  XCircle
} from 'lucide-react';
import { Link } from '@/core/i18n/routing';
import clsx from 'clsx';
import { useClick } from '@/shared/hooks/useAudio';
import type { GoalTimer } from './types';

interface ResultsScreenProps {
  dojoType: 'kana' | 'kanji' | 'vocabulary';
  challengeDuration: number;
  stats: {
    correct: number;
    wrong: number;
    bestStreak: number;
  };
  showGoalTimers: boolean;
  goals: GoalTimer[];
  onRestart: () => void;
}

export default function ResultsScreen({
  dojoType,
  challengeDuration,
  stats,
  showGoalTimers,
  goals,
  onRestart
}: ResultsScreenProps) {
  const { playClick } = useClick();

  const totalAnswers = stats.correct + stats.wrong;
  const accuracy =
    totalAnswers > 0 ? Math.round((stats.correct / totalAnswers) * 100) : 0;
  const questionsPerMinute =
    totalAnswers > 0
      ? ((totalAnswers / challengeDuration) * 60).toFixed(1)
      : '0';

  const reachedGoals = goals.filter(g => g.reached);
  const missedGoals = goals.filter(g => !g.reached);

  return (
    <div className='fixed inset-0 z-50 bg-[var(--background-color)]'>
      <div className='min-h-[100dvh] flex flex-col items-center justify-center p-4'>
        <div className='max-w-2xl w-full max-h-[90vh] overflow-y-auto space-y-6'>
          {/* Header */}
          <ResultsHeader challengeDuration={challengeDuration} />

          {/* Main Stats Grid */}
          <MainStatsGrid
            correct={stats.correct}
            wrong={stats.wrong}
            accuracy={accuracy}
            questionsPerMinute={questionsPerMinute}
          />

          {/* Secondary Stats */}
          <div className='grid grid-cols-2 gap-4'>
            <div className='bg-[var(--card-color)] rounded-lg p-4 space-y-2 border border-[var(--border-color)]'>
              <p className='text-sm text-[var(--muted-color)]'>Best Streak</p>
              <p className='text-2xl font-bold text-[var(--secondary-color)]'>
                🔥 {stats.bestStreak}
              </p>
            </div>
            <div className='bg-[var(--card-color)] rounded-lg p-4 space-y-2 border border-[var(--border-color)]'>
              <p className='text-sm text-[var(--muted-color)]'>Total Answers</p>
              <p className='text-2xl font-bold text-[var(--secondary-color)]'>
                {totalAnswers}
              </p>
            </div>
          </div>

          {/* Goal Timers Statistics */}
          {showGoalTimers && goals.length > 0 && (
            <GoalTimersResults
              reachedGoals={reachedGoals}
              missedGoals={missedGoals}
            />
          )}

          {/* Action Buttons */}
          <div className='flex flex-row items-center justify-center gap-2 md:gap-4 w-full'>
            <Link href={`/${dojoType}`} className='w-1/2'>
              <button
                className={clsx(
                  'w-full h-12 px-2 sm:px-6 flex flex-row justify-center items-center gap-2',
                  'bg-[var(--secondary-color)] text-[var(--background-color)]',
                  'rounded-2xl transition-colors duration-200',
                  'border-b-6 border-[var(--secondary-color-accent)] shadow-sm',
                  'hover:cursor-pointer'
                )}
                onClick={() => playClick()}
              >
                <ArrowLeft size={20} />
                <span className='whitespace-nowrap'>Back</span>
              </button>
            </Link>
            <button
              onClick={onRestart}
              className={clsx(
                'w-1/2 h-12 px-2 sm:px-6 flex flex-row justify-center items-center gap-2',
                'bg-[var(--main-color)] text-[var(--background-color)]',
                'rounded-2xl transition-colors duration-200',
                'font-medium border-b-6 border-[var(--main-color-accent)] shadow-sm',
                'hover:cursor-pointer'
              )}
            >
              <RotateCcw size={20} />
              <span className='whitespace-nowrap'>Try Again</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Sub-components

function ResultsHeader({ challengeDuration }: { challengeDuration: number }) {
  return (
    <div className='text-center space-y-2'>
      <div className='inline-flex items-center justify-center w-20 h-20 rounded-full bg-[var(--main-color)]/10 mb-4'>
        <Timer size={48} className='text-[var(--main-color)]' />
      </div>
      <h1 className='text-3xl font-bold text-[var(--secondary-color)]'>
        Challenge Complete!
      </h1>
      <p className='text-[var(--muted-color)]'>
        {challengeDuration < 60
          ? `${challengeDuration} seconds`
          : `${challengeDuration / 60} minute${
              challengeDuration > 60 ? 's' : ''
            }`}{' '}
        challenge finished
      </p>
    </div>
  );
}

function MainStatsGrid({
  correct,
  wrong,
  accuracy,
  questionsPerMinute
}: {
  correct: number;
  wrong: number;
  accuracy: number;
  questionsPerMinute: string;
}) {
  return (
    <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
      <div className='bg-[var(--card-color)] rounded-xl p-4 text-center space-y-2 border-2 border-[var(--border-color)]'>
        <Target className='mx-auto text-green-500' size={28} />
        <p className='text-3xl font-bold text-green-500'>{correct}</p>
        <p className='text-sm text-[var(--muted-color)]'>Correct</p>
      </div>
      <div className='bg-[var(--card-color)] rounded-xl p-4 text-center space-y-2 border-2 border-[var(--border-color)]'>
        <XCircle className='mx-auto text-red-500' size={28} />
        <p className='text-3xl font-bold text-red-500'>{wrong}</p>
        <p className='text-sm text-[var(--muted-color)]'>Wrong</p>
      </div>
      <div className='bg-[var(--card-color)] rounded-xl p-4 text-center space-y-2 border-2 border-[var(--border-color)]'>
        <TrendingUp className='mx-auto text-[var(--main-color)]' size={28} />
        <p className='text-3xl font-bold text-[var(--main-color)]'>
          {accuracy}%
        </p>
        <p className='text-sm text-[var(--muted-color)]'>Accuracy</p>
      </div>
      <div className='bg-[var(--card-color)] rounded-xl p-4 text-center space-y-2 border-2 border-[var(--border-color)]'>
        <Timer className='mx-auto text-blue-500' size={28} />
        <p className='text-3xl font-bold text-blue-500'>{questionsPerMinute}</p>
        <p className='text-sm text-[var(--muted-color)]'>Q/Min</p>
      </div>
    </div>
  );
}

function GoalTimersResults({
  reachedGoals,
  missedGoals
}: {
  reachedGoals: GoalTimer[];
  missedGoals: GoalTimer[];
}) {
  return (
    <div className='bg-[var(--card-color)] rounded-lg p-4 space-y-3 text-left border border-[var(--border-color)]'>
      <div className='flex items-center gap-2 justify-center'>
        <Target className='text-[var(--main-color)]' size={20} />
        <h3 className='text-lg font-semibold text-[var(--secondary-color)]'>
          Goal Timers Results
        </h3>
      </div>
      {reachedGoals.length > 0 && (
        <div className='space-y-2'>
          <p className='text-sm font-medium text-green-500 flex items-center gap-2'>
            <CheckCircle2 size={16} />
            Reached ({reachedGoals.length})
          </p>
          <div className='space-y-1.5'>
            {reachedGoals.map(goal => (
              <div
                key={goal.id}
                className='flex items-center justify-between text-sm p-2 rounded bg-green-500/10 border border-green-500/20'
              >
                <span className='text-[var(--secondary-color)]'>
                  {goal.label}
                </span>
                <span className='text-green-500 font-mono'>
                  {Math.floor(goal.targetSeconds / 60)}:
                  {(goal.targetSeconds % 60).toString().padStart(2, '0')}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
      {missedGoals.length > 0 && (
        <div className='space-y-2'>
          <p className='text-sm font-medium text-[var(--muted-color)] flex items-center gap-2'>
            <XCircle size={16} />
            Not Reached ({missedGoals.length})
          </p>
          <div className='space-y-1.5'>
            {missedGoals.map(goal => (
              <div
                key={goal.id}
                className='flex items-center justify-between text-sm p-2 rounded bg-[var(--border-color)] opacity-60'
              >
                <span className='text-[var(--muted-color)]'>{goal.label}</span>
                <span className='text-[var(--muted-color)] font-mono'>
                  {Math.floor(goal.targetSeconds / 60)}:
                  {(goal.targetSeconds % 60).toString().padStart(2, '0')}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
