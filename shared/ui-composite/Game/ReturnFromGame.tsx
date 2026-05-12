'use client';
import { useEffect, useMemo, useRef, useState } from 'react';
import clsx from 'clsx';
import { useClick } from '@/shared/hooks/generic/useAudio';
import { useStopwatch } from 'react-timer-hook';
import { useStatsDisplay } from '@/features/Progress';
import { useKanaSelection } from '@/features/Kana';
import { useKanjiSelection } from '@/features/Kanji';
import { useVocabSelection } from '@/features/Vocabulary';
import { getSelectionLabels } from '@/shared/utils/selectionFormatting';
import { SelectedLevelsCard } from '@/shared/ui-composite/Menu/SelectedLevelsCard';
import { usePathname } from '@/core/i18n/routing';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/shared/ui/components/popover';
import {
  X,
  SquareCheck,
  SquareX,
  Star,
  ChartSpline,
  MousePointerClick,
  Keyboard,
  Flame,
  Check,
  type LucideIcon,
} from 'lucide-react';
import ProgressBar from './ProgressBar';
import { ActionButton } from '@/shared/ui/components/ActionButton';

// Game mode icon configuration
const GAME_MODE_ICONS: Record<
  string,
  { icon: LucideIcon; className?: string }
> = {
  pick: { icon: MousePointerClick },
  mcq: { icon: MousePointerClick },
  'reverse-mcq': { icon: MousePointerClick, className: 'scale-x-[-1]' },
  // Legacy compatibility alias for older persisted/internal mode values.
  'anti-pick': { icon: MousePointerClick, className: 'scale-x-[-1]' },
  type: { icon: Keyboard },
  'anti-type': { icon: Keyboard, className: 'scale-y-[-1]' },
};
const USE_TILDE_SEPARATOR = false;

interface StatItemProps {
  icon: LucideIcon;
  value: number;
}

const StatItem = ({ icon: Icon, value }: StatItemProps) => (
  <p className='flex flex-row items-center gap-0.75 text-xl sm:gap-1'>
    <Icon className='text-(--secondary-color)' />
    <span className='text-(--main-color)'>{value}</span>
  </p>
);

interface ReturnProps {
  isHidden: boolean;
  gameMode: string;
  onQuit: () => void;
}

const Return = ({ isHidden, gameMode, onQuit }: ReturnProps) => {
  const totalTimeStopwatch = useStopwatch({ autoStart: false });
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const closePopoverTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const [isFinePointerDevice, setIsFinePointerDevice] = useState(false);

  const stats = useStatsDisplay();
  const saveSession = stats.saveSession;
  const numCorrectAnswers = stats.correctAnswers;
  const numWrongAnswers = stats.wrongAnswers;
  const numStars = stats.stars;
  const currentStreak = stats.currentStreak;
  const toggleStats = stats.toggleStats;
  const setNewTotalMilliseconds = stats.setNewTotalMilliseconds;

  const { playClick } = useClick();
  const pathname = usePathname();
  const kanaSelection = useKanaSelection();
  const kanjiSelection = useKanjiSelection();
  const vocabSelection = useVocabSelection();

  const currentDojo = useMemo<'kana' | 'kanji' | 'vocabulary'>(() => {
    if (pathname.includes('/kanji')) return 'kanji';
    if (pathname.includes('/vocabulary')) return 'vocabulary';
    return 'kana';
  }, [pathname]);
  const { compact: selectionLabelCompact } = useMemo(() => {
    const dojoType = currentDojo as 'kana' | 'kanji' | 'vocabulary';
    const selection =
      dojoType === 'kana'
        ? kanaSelection.selectedGroupIndices
        : dojoType === 'kanji'
          ? kanjiSelection.selectedSets
          : vocabSelection.selectedSets;
    return getSelectionLabels(dojoType, selection);
  }, [
    currentDojo,
    kanaSelection.selectedGroupIndices,
    kanjiSelection.selectedSets,
    vocabSelection.selectedSets,
  ]);

  // Start stopwatch when component becomes visible
  useEffect(() => {
    if (!isHidden) totalTimeStopwatch.start();
    // `totalTimeStopwatch` object identity is not stable across renders.
    // Including it in deps can cause a render -> start -> render loop.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isHidden]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') buttonRef.current?.click();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const mediaQuery = window.matchMedia('(hover: hover) and (pointer: fine)');
    const updateInputMode = (event?: MediaQueryListEvent) => {
      setIsFinePointerDevice(event?.matches ?? mediaQuery.matches);
    };

    updateInputMode();
    mediaQuery.addEventListener('change', updateInputMode);

    return () => {
      mediaQuery.removeEventListener('change', updateInputMode);
    };
  }, []);

  useEffect(() => {
    return () => {
      if (closePopoverTimeoutRef.current) {
        clearTimeout(closePopoverTimeoutRef.current);
      }
    };
  }, []);

  const clearPopoverCloseTimeout = () => {
    if (!closePopoverTimeoutRef.current) return;
    clearTimeout(closePopoverTimeoutRef.current);
    closePopoverTimeoutRef.current = null;
  };

  const openPopover = () => {
    clearPopoverCloseTimeout();
    setIsPopoverOpen(true);
  };

  const closePopoverWithDelay = () => {
    clearPopoverCloseTimeout();
    closePopoverTimeoutRef.current = setTimeout(() => {
      setIsPopoverOpen(false);
      closePopoverTimeoutRef.current = null;
    }, 80);
  };

  const handleExit = () => {
    playClick();
    totalTimeStopwatch.pause();
    setNewTotalMilliseconds(totalTimeStopwatch.totalMilliseconds);
    saveSession();
    onQuit();
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
        <button type='button' ref={buttonRef} onClick={handleExit}>
          <X
            size={32}
            className='text-(--border-color) duration-250 hover:scale-125 hover:cursor-pointer hover:text-(--secondary-color)'
          />
        </button>
        <ProgressBar />
        {/* Stats button - visible only on small screens */}
        <ActionButton
          borderRadius='xl'
          className='w-auto px-3 py-1 text-xl sm:hidden animate-float [--float-distance:-2px]'
          onClick={handleShowStats}
        >
          <ChartSpline size={24} />
        </ActionButton>
      </div>

      {/* Game mode and stats row */}
      <div className='flex w-full flex-row items-center'>
        {/* Game mode indicator */}
        <p className='flex w-1/2 items-center justify-start gap-1.5 text-lg sm:gap-2 sm:pl-1 md:text-xl'>
          {ModeIcon && (
            <ModeIcon
              className={clsx('text-(--main-color)', modeConfig.className)}
            />
          )}
          <span className='text-(--secondary-color)'>
            {normalizedMode}
          </span>
          <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
            <PopoverTrigger asChild>
              <button
                type='button'
                aria-label='Show selected levels'
                onMouseEnter={() => {
                  if (isFinePointerDevice) openPopover();
                }}
                onMouseLeave={() => {
                  if (isFinePointerDevice) closePopoverWithDelay();
                }}
                onClick={() => {
                  if (!isFinePointerDevice) {
                    setIsPopoverOpen(prev => !prev);
                  }
                }}
                className='rounded-full focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--main-color)'
              >
                <span className='flex h-6 w-6 items-center justify-center rounded-lg bg-(--main-color) border-b-3 border-(--main-color-accent) ml-0.5 sm:ml-1 mt-0.5'>
                  <Check className='h-4 w-4 text-(--background-color)' />
                </span>
              </button>
            </PopoverTrigger>
            <PopoverContent
              side='bottom'
              align='start'
              className='w-64 border-0 bg-transparent p-0 text-(--main-color) shadow-none'
              onMouseEnter={() => {
                if (isFinePointerDevice) openPopover();
              }}
              onMouseLeave={() => {
                if (isFinePointerDevice) closePopoverWithDelay();
              }}
            >
              <SelectedLevelsCard
                currentDojo={currentDojo}
                compactLabel={selectionLabelCompact}
                useTildeSeparator={USE_TILDE_SEPARATOR}
              />
            </PopoverContent>
          </Popover>
        </p>

        {/* Stats display */}
        <div className='flex w-1/2 flex-row items-center justify-end gap-2.5 py-2 sm:gap-3'>
          <StatItem icon={SquareCheck} value={numCorrectAnswers} />
          <StatItem icon={SquareX} value={numWrongAnswers} />
          <StatItem icon={Flame} value={currentStreak} />
          <StatItem icon={Star} value={numStars} />

          {/* Stats button - hidden on small screens, visible on sm and up */}
          <ActionButton
            borderRadius='2xl'
            borderBottomThickness={8}
            className='hidden w-auto p-2 text-xl sm:flex md:px-6 animate-float [--float-distance:-4px]'
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

