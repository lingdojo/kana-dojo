'use client';

import { useMemo } from 'react';
import useCrazyModeStreakStore from '../store/useCrazyModeStreakStore';

export interface CrazyModeStreakBadgeProps {
  /** Minimum streak to show the badge */
  threshold?: number;
}

export function CrazyModeStreakBadge({ threshold = 3 }: CrazyModeStreakBadgeProps) {
  const currentStreak = useCrazyModeStreakStore(s => s.currentStreak);
  const bestStreak = useCrazyModeStreakStore(s => s.bestStreak);

  const display = useMemo(() => {
    if (currentStreak < threshold) return null;

    const fireIntensity =
      currentStreak >= 50
        ? 'text-orange-500 scale-125 animate-pulse'
        : currentStreak >= 25
          ? 'text-orange-400 scale-110'
          : currentStreak >= 10
            ? 'text-yellow-500 scale-105'
            : 'text-yellow-400';

    return { fireIntensity };
  }, [currentStreak, threshold]);

  if (!display) return null;

  return (
    <div className='flex items-center gap-1.5 rounded-full border border-yellow-500/30 bg-yellow-500/10 px-2.5 py-1 text-sm font-semibold'>
      <span className={display.fireIntensity}>🔥</span>
      <span className='text-yellow-400'>{currentStreak}</span>
      {bestStreak > 0 && currentStreak < bestStreak && (
        <span className='ml-1 text-xs text-yellow-600/60'>
          (best: {bestStreak})
        </span>
      )}
    </div>
  );
}

export default CrazyModeStreakBadge;
