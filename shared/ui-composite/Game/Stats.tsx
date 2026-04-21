'use client';
import { useEffect, useMemo } from 'react';
import {
  CircleArrowLeft,
  Hourglass,
  SquareCheck,
  SquareX,
  Target,
  Timer,
  Flame,
  Shapes,
  TrendingUp,
  Clock,
  Activity,
  LucideIcon,
} from 'lucide-react';
import { useStatsDisplay } from '@/features/Progress';
import { useClick } from '@/shared/hooks/generic/useAudio';

interface BentoTileProps {
  Icon: LucideIcon;
  label: string;
  value: string | number;
  description?: string;
  className?: string;
  valueClassName?: string;
}

function BentoTile({
  Icon,
  label,
  value,
  description,
  className = '',
  valueClassName = '',
}: BentoTileProps) {
  return (
    <div
      className={`flex min-w-0 flex-col justify-between overflow-hidden rounded-[2rem] border-2 border-(--secondary-color)/10 bg-(--background-color) p-5 sm:p-6 ${className}`}
    >
      <div className='mb-2 flex min-w-0 items-center gap-2'>
        <Icon className='h-4 w-4 shrink-0 text-(--secondary-color) opacity-60' />
        <span className='block min-w-0 break-all text-[11px] leading-tight font-bold tracking-wider text-(--secondary-color) uppercase opacity-60 sm:text-xs'>
          {label}
        </span>
      </div>
      <div
        className={`min-w-0 overflow-hidden break-words text-2xl font-black tracking-tighter text-(--main-color) sm:text-3xl ${valueClassName}`}
      >
        {value}
      </div>
      {description ? (
        <p className='mt-2 text-sm text-(--secondary-color) lowercase opacity-60'>
          {description}
        </p>
      ) : null}
    </div>
  );
}

const Stats: React.FC = () => {
  const { playClick } = useClick();
  const statsData = useStatsDisplay();
  const toggleStats = statsData.toggleStats;

  // Handle ESC key to close stats
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation(); // Prevent the event from bubbling to ReturnFromGame
        playClick();
        toggleStats();
      }
    };
    window.addEventListener('keydown', handleKeyDown, true); // Use capture phase
    return () => window.removeEventListener('keydown', handleKeyDown, true);
  }, [playClick, toggleStats]);

  // Get data from facade
  const numCorrectAnswers = statsData.correctAnswers;
  const numWrongAnswers = statsData.wrongAnswers;
  const characterHistory = statsData.characterHistory;
  const totalMilliseconds = statsData.totalMilliseconds;
  const correctAnswerTimes = statsData.correctAnswerTimes;

  // Memoized stat calculations
  const stats = useMemo(() => {
    // Calculate time
    const totalMinutes = Math.floor(totalMilliseconds / 60000);
    const seconds = Math.floor((totalMilliseconds / 1000) % 60);
    const timeDisplay = `${totalMinutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

    // Calculate accuracy metrics
    const totalAnswers = numCorrectAnswers + numWrongAnswers;
    const accuracy =
      totalAnswers > 0 ? (numCorrectAnswers / totalAnswers) * 100 : 0;
    const ciRatio =
      numWrongAnswers > 0
        ? numCorrectAnswers / numWrongAnswers
        : numCorrectAnswers > 0
          ? Infinity
          : 0;

    // Calculate timing metrics
    const hasAnswers = correctAnswerTimes.length > 0;
    const avgTime = hasAnswers
      ? (
          correctAnswerTimes.reduce((sum, t) => sum + t, 0) /
          correctAnswerTimes.length
        ).toFixed(2)
      : null;
    const fastestTime = hasAnswers
      ? Math.min(...correctAnswerTimes).toFixed(2)
      : null;
    const slowestTime = hasAnswers
      ? Math.max(...correctAnswerTimes).toFixed(2)
      : null;

    const uniqueChars = [...new Set(characterHistory)].length;

    return {
      totalMinutes,
      seconds,
      timeDisplay,
      totalAnswers,
      accuracy,
      ciRatio,
      hasAnswers,
      avgTime,
      fastestTime,
      slowestTime,
      uniqueChars,
    };
  }, [
    totalMilliseconds,
    numCorrectAnswers,
    numWrongAnswers,
    correctAnswerTimes,
    characterHistory,
  ]);

  const formatValue = (
    value: string | number | null | undefined,
    suffix: string = '',
  ): string => {
    if (value === null || value === undefined) return '~';
    if (value === Infinity) return '∞';
    return `${value}${suffix}`;
  };

  return (
    <div className='fixed inset-0 z-50 flex h-full w-full flex-col overflow-x-hidden overflow-y-auto bg-(--background-color)'>
      <div className='mx-auto flex min-h-full w-full max-w-7xl flex-1 flex-col justify-start px-4 py-8 sm:min-h-[100dvh] sm:justify-center sm:px-8 sm:py-20 lg:px-12 lg:py-16'>
        <div className='mb-8 flex flex-col items-center gap-1 text-center select-none sm:mb-12 sm:items-start sm:text-left lg:mb-16'>
          <h1 className='text-3xl font-black tracking-tighter text-(--main-color) lowercase sm:text-5xl lg:text-6xl'>
            statistics
          </h1>
          <p className='text-base font-medium tracking-tight text-(--secondary-color) lowercase opacity-60 sm:text-xl'>
            track your performance across all sessions.
          </p>
        </div>

        <div className='mb-8 flex flex-col gap-4 sm:mb-12 sm:gap-6 lg:mb-16'>
          <div className='grid grid-cols-1 auto-rows-[minmax(140px,auto)] gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-6'>
            <div className='relative flex flex-col items-center justify-center rounded-[2.5rem] border-2 border-(--main-color)/20 bg-(--background-color) p-6 sm:col-span-2 sm:flex-row sm:gap-10 sm:p-8 lg:col-span-3 lg:row-span-2'>
              <div className='relative flex aspect-square w-full max-w-36 flex-col items-center justify-center sm:max-w-44'>
                <div
                  className='h-full w-full rounded-full'
                  style={{
                    background: `conic-gradient(var(--main-color) 0deg ${stats.accuracy * 3.6}deg, var(--border-color) ${stats.accuracy * 3.6}deg 360deg)`,
                  }}
                />
                <div className='absolute inset-[12%] rounded-full bg-(--background-color)' />
                <div className='absolute inset-0 flex flex-col items-center justify-center'>
                  <span className='text-4xl font-black tracking-tighter text-(--main-color) sm:text-5xl'>
                    {Math.round(stats.accuracy)}%
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
                  {formatValue(numCorrectAnswers)} / {formatValue(stats.totalAnswers)}
                </div>
                <p className='mt-2 text-sm text-(--secondary-color) lowercase opacity-60 sm:text-base'>
                  out of {stats.totalAnswers} attempts, you answered {numCorrectAnswers} correctly.
                </p>
              </div>
            </div>

            <BentoTile
              Icon={Hourglass}
              label='training time'
              value={stats.timeDisplay}
              className='lg:col-span-2'
              valueClassName='text-4xl sm:text-5xl'
            />
            <BentoTile
              Icon={Activity}
              label='answers'
              value={stats.totalAnswers}
              className='lg:col-span-1'
              valueClassName='text-4xl sm:text-5xl'
            />
            <BentoTile
              Icon={SquareCheck}
              label='correct'
              value={numCorrectAnswers}
              className='lg:col-span-1'
            />
            <BentoTile
              Icon={SquareX}
              label='wrong'
              value={numWrongAnswers}
              className='lg:col-span-1'
            />
            <BentoTile
              Icon={TrendingUp}
              label='correct/incorrect'
              value={formatValue(
                stats.ciRatio === Infinity ? '∞' : stats.ciRatio.toFixed(2),
              )}
              className='lg:col-span-1'
              valueClassName='break-all text-xl sm:text-2xl'
            />
            <BentoTile
              Icon={Shapes}
              label='unique chars'
              value={stats.uniqueChars}
              className='lg:col-span-1'
            />
            <BentoTile
              Icon={Timer}
              label='average time'
              value={formatValue(stats.avgTime, 's')}
              className='lg:col-span-2'
            />
            <BentoTile
              Icon={Flame}
              label='fastest answer'
              value={formatValue(stats.fastestTime, 's')}
              className='lg:col-span-1'
            />
            <BentoTile
              Icon={Clock}
              label='slowest answer'
              value={formatValue(stats.slowestTime, 's')}
              className='lg:col-span-1'
            />
          </div>
        </div>

        <div className='sticky bottom-0 z-10 -mx-4 mt-auto flex w-auto items-center justify-center gap-3 border-t-2 border-(--border-color) bg-(--background-color) py-4 px-4 select-none sm:static sm:mx-0 sm:w-full sm:justify-start sm:gap-5 sm:border-0 sm:bg-transparent sm:px-0 sm:py-0'>
          <button
            onClick={() => {
              playClick();
              toggleStats();
            }}
            className='group flex h-14 flex-1 cursor-pointer items-center justify-center gap-3 rounded-xl bg-(--secondary-color) px-4 text-lg font-bold text-(--background-color) lowercase outline-hidden transition-all duration-150 sm:px-10 sm:text-xl md:flex-none'
          >
            <CircleArrowLeft
              className='h-5 w-5 group-hover:animate-none sm:h-6 sm:w-6'
              strokeWidth={2.5}
            />
            <span className='leading-none'>back</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Stats;

