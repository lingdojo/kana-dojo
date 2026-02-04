'use client';
import { useEffect, useMemo } from 'react';
import clsx from 'clsx';
import {
  Hourglass,
  SquareCheck,
  SquareX,
  Target,
  Timer,
  Clover,
  HeartCrack,
  Flame,
  Shapes,
  TrendingUp,
  Clock,
  Activity,
  ChevronsLeft,
  LucideIcon,
} from 'lucide-react';
import { useStatsDisplay } from '@/features/Progress';
import { findHighestCounts } from '@/shared/lib/helperFunctions';
import { useClick } from '@/shared/hooks/useAudio';

interface StatItem {
  label: string;
  value: string;
  Icon: LucideIcon;
}

interface StatCardProps {
  title: string;
  stats: StatItem[];
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
  const characterScores = statsData.characterScores;

  // Memoized stat calculations
  const stats = useMemo(() => {
    // Calculate time
    const totalMinutes = Math.floor(totalMilliseconds / 60000);
    const seconds = ((totalMilliseconds / 1000) % 60).toFixed(0);
    const timeDisplay = `${totalMinutes}m ${seconds}s`;

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

    // Calculate character metrics
    const uniqueChars = [...new Set(characterHistory)].length;
    const {
      highestCorrectChars,
      highestCorrectCharsValue,
      highestWrongChars,
      highestWrongCharsValue,
    } = findHighestCounts(characterScores);

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
      highestCorrectChars,
      highestCorrectCharsValue,
      highestWrongChars,
      highestWrongCharsValue,
    };
  }, [
    totalMilliseconds,
    numCorrectAnswers,
    numWrongAnswers,
    correctAnswerTimes,
    characterHistory,
    characterScores,
  ]);

  const formatValue = (
    value: string | number | null | undefined,
    suffix: string = '',
  ): string => {
    if (value === null || value === undefined) return '~';
    if (value === Infinity) return '∞';
    return `${value}${suffix}`;
  };

  const StatCard: React.FC<StatCardProps> = ({ title, stats }) => (
    <div className='w-full rounded-lg border-(--border-color) bg-(--bg-color) p-6'>
      <h3 className='mb-6 border-b-2 border-(--border-color) pb-3 text-2xl font-bold text-(--secondary-color)'>
        {title}
      </h3>
      <div className='space-y-4'>
        {stats.map(({ label, value, Icon }: StatItem, i: number) => (
          <div
            key={label}
            className={clsx(
              'flex items-center justify-between gap-4 pb-4',
              i < stats.length - 1 &&
                'border-b border-(--border-color)/70',
            )}
          >
            <div className='flex min-w-0 flex-1 items-center gap-2'>
              <Icon
                size={20}
                className='flex-shrink-0 text-(--secondary-color)'
              />
              <span className='truncate text-sm text-(--text-color)/80 md:text-base'>
                {label}
              </span>
            </div>
            <span className='text-base font-semibold whitespace-nowrap md:text-lg'>
              {value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );

  const generalStats: StatItem[] = [
    { label: 'Training Time', value: stats.timeDisplay, Icon: Hourglass },
    {
      label: 'Correct Answers',
      value: formatValue(numCorrectAnswers),
      Icon: SquareCheck,
    },
    {
      label: 'Wrong Answers',
      value: formatValue(numWrongAnswers),
      Icon: SquareX,
    },
    {
      label: 'Accuracy',
      value: formatValue(stats.accuracy.toFixed(1), '%'),
      Icon: Target,
    },
  ];

  const answerStats: StatItem[] = [
    {
      label: 'Average Time',
      value: formatValue(stats.avgTime, 's'),
      Icon: Timer,
    },
    {
      label: 'Fastest Answer',
      value: formatValue(stats.fastestTime, 's'),
      Icon: Flame,
    },
    {
      label: 'Slowest Answer',
      value: formatValue(stats.slowestTime, 's'),
      Icon: Clock,
    },
    {
      label: 'Correct/Incorrect Ratio',
      value: formatValue(
        stats.ciRatio === Infinity ? '∞' : stats.ciRatio.toFixed(2),
      ),
      Icon: TrendingUp,
    },
  ];

  const characterStats: StatItem[] = [
    {
      label: 'Characters Played',
      value: formatValue(characterHistory.length),
      Icon: Activity,
    },
    {
      label: 'Unique Characters',
      value: formatValue(stats.uniqueChars),
      Icon: Shapes,
    },
    {
      label: 'Easiest Characters',
      value:
        stats.highestCorrectChars.length > 0
          ? `${stats.highestCorrectChars.join(', ')} (${stats.highestCorrectCharsValue})`
          : '~',
      Icon: Clover,
    },
    {
      label: 'Hardest Characters',
      value:
        stats.highestWrongChars.length > 0
          ? `${stats.highestWrongChars.join(', ')} (${stats.highestWrongCharsValue})`
          : '~',
      Icon: HeartCrack,
    },
  ];

  return (
    <div className='flex min-h-screen w-full items-center justify-center bg-(--bg-color) px-4 py-8 md:py-12'>
      <div className='mx-auto w-full max-w-7xl'>
        {/* Header */}
        <button
          onClick={() => {
            playClick();
            toggleStats();
          }}
          className='group flex w-full items-center justify-center gap-3 hover:cursor-pointer'
        >
          <ChevronsLeft
            size={32}
            className='text-(--border-color) hover:text-(--secondary-color)'
          />
          <h2 className='flex items-center justify-center gap-3 text-3xl font-bold md:text-4xl'>
            Statistics
            <Activity size={32} className='text-(--secondary-color)' />
          </h2>
        </button>

        {/* Stats Grid */}
        <div className='grid grid-cols-1 gap-6 md:gap-8 lg:grid-cols-3'>
          <StatCard title='General' stats={generalStats} />
          <StatCard title='Answers' stats={answerStats} />
          <StatCard title='Characters' stats={characterStats} />
        </div>
      </div>
    </div>
  );
};

export default Stats;
