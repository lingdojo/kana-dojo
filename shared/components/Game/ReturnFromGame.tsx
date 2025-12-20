'use client';
import { useEffect, useRef } from 'react';
import clsx from 'clsx';
import { Link } from '@/core/i18n/routing';
import { useClick } from '@/shared/hooks/useAudio';
import { useStopwatch } from 'react-timer-hook';
import useStatsStore from '@/features/Progress/store/useStatsStore';
import {
  X,
  SquareCheck,
  SquareX,
  Star,
  ChartSpline,
  MousePointerClick,
  Keyboard,
  Flame,
  type LucideIcon
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
  'anti-type': { icon: Keyboard, className: 'scale-y-[-1]' }
};

interface StatItemProps {
  icon: LucideIcon;
  value: number;
}

const StatItem = ({ icon: Icon, value }: StatItemProps) => (
  <p className='text-xl flex flex-row items-center gap-1'>
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

  const saveSession = useStatsStore(s => s.saveSession);
  const numCorrectAnswers = useStatsStore(s => s.numCorrectAnswers);
  const numWrongAnswers = useStatsStore(s => s.numWrongAnswers);
  const numStars = useStatsStore(s => s.stars);
  const currentStreak = useStatsStore(s => s.currentStreak);
  const toggleStats = useStatsStore(s => s.toggleStats);
  const setNewTotalMilliseconds = useStatsStore(s => s.setNewTotalMilliseconds);

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
        'flex flex-col w-full md:w-2/3 lg:w-1/2 mt-4 md:mt-8',
        isHidden && 'hidden'
      )}
    >
      {/* Header with exit and progress */}
      <div className='w-full flex flex-row gap-4 md:gap-6 items-center justify-between'>
        <Link href={href} ref={buttonRef} onClick={handleExit}>
          <X
            size={32}
            className='hover:cursor-pointer duration-250 text-[var(--border-color)] hover:text-[var(--secondary-color)]'
          />
        </Link>
        <ProgressBar />
        {/* Stats button - visible only on small screens */}
        <ActionButton
          borderRadius='xl'
          className='py-1 px-3 text-xl w-auto sm:hidden'
          onClick={handleShowStats}
        >
          <ChartSpline size={24} />
        </ActionButton>
      </div>

      {/* Game mode and stats row */}
      <div className='flex flex-row w-full items-center'>
        {/* Game mode indicator */}
        <p className='w-1/2 text-lg md:text-xl  flex justify-start items-center gap-1 sm:gap-2 sm:pl-1'>
          {ModeIcon && (
            <ModeIcon
              className={clsx('text-[var(--main-color)]', modeConfig.className)}
            />
          )}
          <span className='text-[var(--secondary-color)]'>
            {normalizedMode}
          </span>
        </p>

        {/* Stats display */}
        <div className='w-1/2 flex flex-row gap-1.5 sm:gap-2 md:gap-3 items-center justify-end  py-2 text-[var(--secondary-color)]'>
          <StatItem icon={SquareCheck} value={numCorrectAnswers} />
          <StatItem icon={SquareX} value={numWrongAnswers} />
          <StatItem icon={Flame} value={currentStreak} />
          <StatItem icon={Star} value={numStars} />

          {/* Stats button - hidden on small screens, visible on sm and up */}
          <ActionButton
            borderRadius='2xl'
            className='p-2 md:px-6 text-xl w-auto hidden sm:flex'
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
