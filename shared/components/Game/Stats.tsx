'use client';
import { useEffect } from 'react';
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
  LucideIcon
} from 'lucide-react';
import useStatsStore from '@/features/Progress/store/useStatsStore';
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
  const toggleStats = useStatsStore(state => state.toggleStats);

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

  // Get data from store
  const numCorrectAnswers: number = useStatsStore(
    state => state.numCorrectAnswers
  );
  const numWrongAnswers: number = useStatsStore(state => state.numWrongAnswers);
  const characterHistory: string[] = useStatsStore(
    state => state.characterHistory
  );
  const totalMilliseconds: number = useStatsStore(
    state => state.totalMilliseconds
  );
  const correctAnswerTimes: number[] = useStatsStore(
    state => state.correctAnswerTimes
  );
  const characterScores = useStatsStore(state => state.characterScores);

  // Calculate time
  const totalMinutes: number = Math.floor(totalMilliseconds / 60000);
  const seconds: string = ((totalMilliseconds / 1000) % 60).toFixed(0);
  const timeDisplay: string = `${totalMinutes}m ${seconds}s`;

  // Calculate accuracy metrics
  const totalAnswers: number = numCorrectAnswers + numWrongAnswers;
  const accuracy: number =
    totalAnswers > 0 ? (numCorrectAnswers / totalAnswers) * 100 : 0;
  const ciRatio: number =
    numWrongAnswers > 0
      ? numCorrectAnswers / numWrongAnswers
      : numCorrectAnswers > 0
      ? Infinity
      : 0;

  // Calculate timing metrics
  const hasAnswers: boolean = correctAnswerTimes.length > 0;
  const avgTime: string | null = hasAnswers
    ? (
        correctAnswerTimes.reduce((sum: number, t: number) => sum + t, 0) /
        correctAnswerTimes.length
      ).toFixed(2)
    : null;
  const fastestTime: string | null = hasAnswers
    ? Math.min(...correctAnswerTimes).toFixed(2)
    : null;
  const slowestTime: string | null = hasAnswers
    ? Math.max(...correctAnswerTimes).toFixed(2)
    : null;

  // Calculate character metrics
  const uniqueChars: number = [...new Set(characterHistory)].length;
  const {
    highestCorrectChars,
    highestCorrectCharsValue,
    highestWrongChars,
    highestWrongCharsValue
  } = findHighestCounts(characterScores);

  const formatValue = (
    value: string | number | null | undefined,
    suffix: string = ''
  ): string => {
    if (value === null || value === undefined) return '~';
    if (value === Infinity) return '∞';
    return `${value}${suffix}`;
  };

  const StatCard: React.FC<StatCardProps> = ({ title, stats }) => (
    <div className='bg-[var(--bg-color)]  border-[var(--border-color)] rounded-lg p-6 w-full'>
      <h3 className='text-2xl font-bold mb-6 text-[var(--secondary-color)] border-b-2 border-[var(--border-color)] pb-3'>
        {title}
      </h3>
      <div className='space-y-4'>
        {stats.map(({ label, value, Icon }: StatItem, i: number) => (
          <div
            key={label}
            className={clsx(
              'flex items-center justify-between gap-4 pb-4',
              i < stats.length - 1 && 'border-b border-[var(--border-color)]/70'
            )}
          >
            <div className='flex items-center gap-2 flex-1 min-w-0'>
              <Icon
                size={20}
                className='text-[var(--secondary-color)] flex-shrink-0'
              />
              <span className='text-sm md:text-base text-[var(--text-color)]/80 truncate'>
                {label}
              </span>
            </div>
            <span className='font-semibold text-base md:text-lg whitespace-nowrap'>
              {value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );

  const generalStats: StatItem[] = [
    { label: 'Training Time', value: timeDisplay, Icon: Hourglass },
    {
      label: 'Correct Answers',
      value: formatValue(numCorrectAnswers),
      Icon: SquareCheck
    },
    {
      label: 'Wrong Answers',
      value: formatValue(numWrongAnswers),
      Icon: SquareX
    },
    {
      label: 'Accuracy',
      value: formatValue(accuracy.toFixed(1), '%'),
      Icon: Target
    }
  ];

  const answerStats: StatItem[] = [
    { label: 'Average Time', value: formatValue(avgTime, 's'), Icon: Timer },
    {
      label: 'Fastest Answer',
      value: formatValue(fastestTime, 's'),
      Icon: Flame
    },
    {
      label: 'Slowest Answer',
      value: formatValue(slowestTime, 's'),
      Icon: Clock
    },
    {
      label: 'Correct/Incorrect Ratio',
      value: formatValue(ciRatio === Infinity ? '∞' : ciRatio.toFixed(2)),
      Icon: TrendingUp
    }
  ];

  const characterStats: StatItem[] = [
    {
      label: 'Characters Played',
      value: formatValue(characterHistory.length),
      Icon: Activity
    },
    {
      label: 'Unique Characters',
      value: formatValue(uniqueChars),
      Icon: Shapes
    },
    {
      label: 'Easiest Characters',
      value:
        highestCorrectChars.length > 0
          ? `${highestCorrectChars.join(', ')} (${highestCorrectCharsValue})`
          : '~',
      Icon: Clover
    },
    {
      label: 'Hardest Characters',
      value:
        highestWrongChars.length > 0
          ? `${highestWrongChars.join(', ')} (${highestWrongCharsValue})`
          : '~',
      Icon: HeartCrack
    }
  ];

  return (
    <div className='min-h-screen w-full bg-[var(--bg-color)] px-4 py-8 md:py-12 flex items-center justify-center'>
      <div className='max-w-7xl mx-auto w-full'>
        {/* Header */}
        <button
          onClick={() => {
            playClick();
            toggleStats();
          }}
          className='group flex items-center gap-3  justify-center w-full hover:cursor-pointer'
        >
          <ChevronsLeft
            size={32}
            className='text-[var(--border-color)] hover:text-[var(--secondary-color)]'
          />
          <h2 className='text-3xl md:text-4xl font-bold flex items-center justify-center gap-3'>
            Statistics
            <Activity size={32} className='text-[var(--secondary-color)]' />
          </h2>
        </button>

        {/* Stats Grid */}
        <div className='grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8'>
          <StatCard title='General' stats={generalStats} />
          <StatCard title='Answers' stats={answerStats} />
          <StatCard title='Characters' stats={characterStats} />
        </div>
      </div>
    </div>
  );
};

export default Stats;
