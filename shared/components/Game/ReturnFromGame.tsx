'use client';
import { useEffect, useRef } from 'react';
import clsx from 'clsx';
import { Link } from '@/core/i18n/routing';
import { useClick } from '@/shared/hooks/useAudio';
import { useStopwatch } from 'react-timer-hook';
import { useStatsDisplay } from '@/features/Progress';
import {
  X,
  SquareCheck,
  SquareX,
  Star,
  ChartSpline,
  MousePointerClick,
  Keyboard,
  Flame,
  type LucideIcon,
} from 'lucide-react';
import ProgressBar from './ProgressBar';
import { ActionButton } from '@/shared/components/ui/ActionButton';

// Game mode icon configuration
const GAME_MODE_ICONS: Record<
  string,
  { icon: LucideIcon; className?: string }
> = {
  pick: { icon: MousePointerClick },
  'anti-pick': { icon: MousePointerClick, className: 'scale-x-[-1]' },
  type: { icon: Keyboard },
  'anti-type': { icon: Keyboard, className: 'scale-y-[-1]' },
};

interface StatItemProps {
  icon: LucideIcon;
  value: number;
}

const StatItem = ({ icon: Icon, value }: StatItemProps) => (
  <p className='flex flex-row items-center gap-0.75 text-xl sm:gap-1'>
    <Icon />
    <span>{value}</span>
  </p>
);

interface ReturnProps {
  isHidden: boolean;
  href: string;
  gameMode: string;
}

const Return = ({ isHidden, href, gameMode }: ReturnProps) => {
  const totalTimeStopwatch = useStopwatch({ autoStart: false });
  const buttonRef = useRef<HTMLAnchorElement | null>(null);

  const stats = useStatsDisplay();
  const saveSession = stats.saveSession;
  const numCorrectAnswers = stats.correctAnswers;
  const numWrongAnswers = stats.wrongAnswers;
  const numStars = stats.stars;
  const currentStreak = stats.currentStreak;
  const toggleStats = stats.toggleStats;
  const setNewTotalMilliseconds = stats.setNewTotalMilliseconds;

  const { playClick } = useClick();

  // Start stopwatch when component becomes visible
  useEffect(() => {
    if (!isHidden) totalTimeStopwatch.start();
  }, [isHidden]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') buttonRef.current?.click();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleExit = () => {
    playClick();
    totalTimeStopwatch.pause();
    setNewTotalMilliseconds(totalTimeStopwatch.totalMilliseconds);
    saveSession();
  };

  const handleShowStats = () => {
    playClick();
    toggleStats();
    totalTimeStopwatch.pause();
    setNewTotalMilliseconds(totalTimeStopwatch.totalMilliseconds);
  };

  const normalizedMode = gameMode.toLowerCase();
  const modeConfig = GAME_MODE_ICONS[normalizedMode];
  const ModeIcon = modeConfig?.icon;

  return (
    <div
      className={clsx(
        'mt-2 flex w-full flex-col md:mt-4 md:w-2/3 lg:w-1/2',
        isHidden && 'hidden',
      )}
    >
      {/* Header with exit and progress */}
      <div className='flex w-full flex-row items-center justify-between gap-3 md:gap-4'>
        <Link href={href} ref={buttonRef} onClick={handleExit}>
          <X
            size={32}
            className='text-(--border-color) duration-250 hover:scale-125 hover:cursor-pointer hover:text-(--secondary-color)'
          />
        </Link>
        <ProgressBar />
        {/* Stats button - visible only on small screens */}
        <ActionButton
          borderRadius='xl'
          className='w-auto px-3 py-1 text-xl sm:hidden'
          onClick={handleShowStats}
        >
          <ChartSpline size={24} />
        </ActionButton>
      </div>

      {/* Game mode and stats row */}
      <div className='flex w-full flex-row items-center'>
        {/* Game mode indicator */}
        <p className='flex w-1/2 items-center justify-start gap-1 text-lg sm:gap-2 sm:pl-1 md:text-xl'>
          {ModeIcon && (
            <ModeIcon
              className={clsx('text-(--main-color)', modeConfig.className)}
            />
          )}
          <span className='text-(--secondary-color)'>
            {normalizedMode}
          </span>
        </p>

        {/* Stats display */}
        <div className='flex w-1/2 flex-row items-center justify-end gap-2.5 py-2 text-(--secondary-color) sm:gap-3'>
          <StatItem icon={SquareCheck} value={numCorrectAnswers} />
          <StatItem icon={SquareX} value={numWrongAnswers} />
          <StatItem icon={Flame} value={currentStreak} />
          <StatItem icon={Star} value={numStars} />

          {/* Stats button - hidden on small screens, visible on sm and up */}
          <ActionButton
            borderRadius='3xl'
            borderBottomThickness={8}
            className='hidden w-auto p-2 text-xl sm:flex md:px-6'
            onClick={handleShowStats}
          >
            <ChartSpline size={24} />
          </ActionButton>
        </div>
      </div>
    </div>
  );
};

export default Return;
