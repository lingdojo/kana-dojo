'use client';

import React, { useEffect, useMemo } from 'react';
import {
  CircleArrowLeft,
  RotateCcw,
  Timer,
  Zap,
  Target,
  Star,
  Trophy,
  Activity,
} from 'lucide-react';
import { useClick } from '@/shared/hooks/generic/useAudio';

interface ClassicSessionSummaryProps {
  title?: string;
  subtitle?: string;
  correct: number;
  wrong: number;
  bestStreak: number;
  stars: number;
  totalTimeMs?: number;
  correctAnswerTimes?: number[];
  onBackToSelection: () => void;
  onNewSession: () => void;
}

const formatTime = (ms: number) => {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
};

export default function ClassicSessionSummary({
  title = 'session summary',
  subtitle = 'your progress is saved.',
  correct,
  wrong,
  bestStreak,
  stars,
  totalTimeMs = 0,
  correctAnswerTimes = [],
  onBackToSelection,
  onNewSession,
}: ClassicSessionSummaryProps) {
  const { playClick } = useClick();
  const total = correct + wrong;
  const accuracy = total > 0 ? Math.round((correct / total) * 100) : 0;
  const timeFormatted = formatTime(totalTimeMs);

  // Calculate average response time
  const avgResponseTime = useMemo(() => {
    if (correctAnswerTimes.length === 0) return 0;
    const sum = correctAnswerTimes.reduce((a, b) => a + b, 0);
    return sum / correctAnswerTimes.length;
  }, [correctAnswerTimes]);

  // Calculate fastest response
  const fastestResponse = useMemo(() => {
    if (correctAnswerTimes.length === 0) return 0;
    return Math.min(...correctAnswerTimes);
  }, [correctAnswerTimes]);

  // Calculate APM (Answers Per Minute)
  const apm = useMemo(() => {
    if (totalTimeMs === 0) return 0;
    return Math.round((total / (totalTimeMs / 60000)) * 10) / 10;
  }, [total, totalTimeMs]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        playClick();
        onBackToSelection();
      }

      if (event.key === 'Enter') {
        event.preventDefault();
        playClick();
        onNewSession();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onBackToSelection, onNewSession, playClick]);


  return (
    <div className='fixed inset-0 z-50 flex h-full w-full flex-col overflow-x-hidden overflow-y-auto bg-(--background-color)'>
      <div className='mx-auto flex min-h-full w-full max-w-7xl flex-1 flex-col justify-start px-4 py-8 sm:min-h-[100dvh] sm:justify-center sm:px-8 sm:py-20 lg:px-12 lg:py-16'>
        {/* Header Section */}
        <div className='mb-8 flex flex-col items-center gap-1 text-center select-none sm:mb-12 sm:items-start sm:text-left lg:mb-16'>
          <h1 className='text-3xl font-black tracking-tighter text-(--main-color) lowercase sm:text-5xl lg:text-6xl'>
            {title}
          </h1>
          <p className='text-base font-medium tracking-tight text-(--secondary-color) lowercase opacity-60 sm:text-xl'>
            {subtitle}
          </p>
        </div>

        {/* Main Content: Hero Grid */}
        <div className='mb-8 flex flex-col gap-4 sm:mb-12 sm:gap-6 lg:mb-16'>
          <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-4'>
            {/* Accuracy Hero - Col Span 2 */}
            <div className='relative flex flex-col items-center justify-center rounded-[2.5rem] border-2 border-(--main-color)/20 bg-(--background-color) p-6 sm:col-span-2 sm:flex-row sm:gap-12 sm:p-10'>
              <div className='relative flex aspect-square w-full max-w-36 flex-col items-center justify-center sm:max-w-44'>
                <div
                  className='h-full w-full rounded-full'
                  style={{
                    background: `conic-gradient(var(--main-color) 0deg ${accuracy * 3.6}deg, var(--border-color) ${accuracy * 3.6}deg 360deg)`,
                  }}
                />
                <div className='absolute inset-[12%] rounded-full bg-(--background-color)' />
                <div className='absolute inset-0 flex flex-col items-center justify-center'>
                  <span className='text-4xl font-black tracking-tighter text-(--main-color) sm:text-5xl'>
                    {accuracy}%
                  </span>
                </div>
              </div>

              <div className='mt-6 flex flex-col items-center text-center sm:mt-0 sm:items-start sm:text-left'>
                <div className='mb-1 flex items-center gap-2'>
                  <Target className='h-5 w-5 text-(--main-color)' />
                <span className='text-sm leading-none font-bold tracking-wider text-(--secondary-color) uppercase opacity-60'>
                    accuracy
                  </span>
                </div>
                <div className='text-3xl font-black tracking-tighter text-(--main-color) sm:text-5xl'>
                  {accuracy === 100 ? 'perfect run' : `${correct} / ${total}`}
                </div>
                <p className='mt-2 text-sm text-(--secondary-color) lowercase opacity-60 sm:text-base'>
                  out of {total} attempts, you answered {correct} correctly.
                </p>
              </div>
            </div>

            {/* Top Stats - Individual Cards */}
            <div className='flex flex-col justify-between rounded-[2.5rem] border-2 border-(--main-color)/20 bg-(--background-color) p-6 sm:p-8'>
              <div className='mb-auto flex items-center gap-2'>
                <Timer className='h-5 w-5 text-(--main-color)' />
                <span className='text-xs leading-none font-bold tracking-widest text-(--secondary-color) uppercase opacity-60'>
                  time spent
                </span>
              </div>
              <div className='mt-4 text-4xl font-black tracking-tighter text-(--main-color) sm:text-5xl'>
                {timeFormatted}
              </div>
            </div>

            <div className='flex flex-col justify-between rounded-[2.5rem] border-2 border-(--main-color)/20 bg-(--background-color) p-6 sm:p-8'>
              <div className='mb-auto flex items-center gap-2'>
                <Star className='h-5 w-5 text-(--main-color)' />
                <span className='text-xs leading-none font-bold tracking-widest text-(--secondary-color) uppercase opacity-60'>
                  stars
                </span>
              </div>
              <div className='mt-4 text-4xl font-black tracking-tighter text-(--main-color) sm:text-5xl'>
                +{stars}
              </div>
            </div>
          </div>

          {/* Secondary Stats Row */}
          <div className='grid grid-cols-2 gap-4 sm:grid-cols-4 sm:gap-6'>
            <div className='flex flex-col rounded-[2rem] border-2 border-(--secondary-color)/10 bg-(--background-color) p-5 sm:p-6'>
              <div className='mb-2 flex items-center gap-2'>
                <Trophy className='h-4 w-4 text-(--secondary-color) opacity-60' />
                  <span className='text-xs leading-none font-bold tracking-widest text-(--secondary-color) uppercase opacity-60'>
                  best streak
                </span>
              </div>
              <div className='text-2xl font-black tracking-tighter text-(--main-color) sm:text-3xl'>
                {bestStreak}
              </div>
            </div>

            <div className='flex flex-col rounded-[2rem] border-2 border-(--secondary-color)/10 bg-(--background-color) p-5 sm:p-6'>
              <div className='mb-2 flex items-center gap-2'>
                <Zap className='h-4 w-4 text-(--secondary-color) opacity-60' />
                  <span className='text-xs leading-none font-bold tracking-widest text-(--secondary-color) uppercase opacity-60'>
                  avg. speed
                </span>
              </div>
              <div className='text-2xl font-black tracking-tighter text-(--main-color) sm:text-3xl'>
                {avgResponseTime.toFixed(1)}s
              </div>
            </div>

            <div className='flex flex-col rounded-[2rem] border-2 border-(--secondary-color)/10 bg-(--background-color) p-5 sm:p-6'>
              <div className='mb-2 flex items-center gap-2'>
                <Activity className='h-4 w-4 text-(--secondary-color) opacity-60' />
                  <span className='text-xs leading-none font-bold tracking-widest text-(--secondary-color) uppercase opacity-60'>
                  top speed
                </span>
              </div>
              <div className='text-2xl font-black tracking-tighter text-(--main-color) sm:text-3xl'>
                {fastestResponse.toFixed(2)}s
              </div>
            </div>

            <div className='flex flex-col rounded-[2rem] border-2 border-(--secondary-color)/10 bg-(--background-color) p-5 sm:p-6'>
              <div className='mb-2 flex items-center gap-2'>
                <Zap className='h-4 w-4 text-(--secondary-color) opacity-60' />
                  <span className='text-xs leading-none font-bold tracking-widest text-(--secondary-color) uppercase opacity-60'>
                  answers/min
                </span>
              </div>
              <div className='text-2xl font-black tracking-tighter text-(--main-color) sm:text-3xl'>
                {apm}
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className='sticky bottom-0 z-10 -mx-4 mt-auto flex w-auto items-center justify-center gap-3 border-t-2 border-(--border-color) bg-(--background-color) py-4 px-4 select-none sm:static sm:mx-0 sm:w-full sm:justify-start sm:gap-5 sm:border-0 sm:bg-transparent sm:px-0 sm:py-0'>
          <button
            onClick={() => {
              playClick();
              onBackToSelection();
            }}
            className='group flex h-14 flex-1 cursor-pointer items-center justify-center gap-3 rounded-xl bg-(--secondary-color) px-4 text-lg font-bold text-(--background-color) lowercase outline-hidden transition-all duration-150 sm:px-10 sm:text-xl md:flex-none'
          >
            <CircleArrowLeft
              className='h-5 w-5 group-hover:animate-none sm:h-6 sm:w-6'
              strokeWidth={2.5}
            />
            <span className='leading-none'>menu</span>
          </button>
          <button
            onClick={() => {
              playClick();
              onNewSession();
            }}
            className='group flex h-14 flex-1 cursor-pointer items-center justify-center gap-3 rounded-xl bg-(--main-color) px-4 text-lg font-bold text-(--background-color) lowercase outline-hidden transition-all duration-150 sm:px-12 sm:text-xl md:flex-none'
          >
            <RotateCcw
              className='h-5 w-5 group-hover:animate-none sm:h-6 sm:w-6'
              strokeWidth={2.5}
            />
            <span className='leading-none sm:hidden'>new</span>
            <span className='hidden leading-none sm:inline'>new session</span>
          </button>
        </div>
      </div>
    </div>
  );
}

