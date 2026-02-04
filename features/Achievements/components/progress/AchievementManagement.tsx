'use client';

import clsx from 'clsx';
import { RotateCcw } from 'lucide-react';
import useAchievementStore from '@/features/Achievements/store/useAchievementStore';
import { useStatsStore } from '@/features/Progress';
import { useClick } from '@/shared/hooks/useAudio';
import { cardBorderStyles, buttonBorderStyles } from '@/shared/lib/styles';

/**
 * Achievement Management Component
 * Provides controls for recalculating achievements based on current progress
 */
export const AchievementManagement = () => {
  const { playClick } = useClick();
  const stats = useStatsStore();

  const handleRecalculateAchievements = () => {
    playClick();
    // Trigger a full recalculation of achievements based on current stats
    useAchievementStore.getState().checkAchievements(stats);
  };

  return (
    <div className='mx-auto mt-12 max-w-4xl'>
      {/* Management Header */}
      <div
        className={clsx(
          'border border-(--border-color) p-6',
          cardBorderStyles,
        )}
      >
        <div className='mb-4 flex items-center gap-3'>
          <RotateCcw className='text-(--main-color)' size={24} />
          <h2 className='text-xl font-bold text-(--main-color)'>
            Achievement Management
          </h2>
        </div>

        <p className='mb-6 text-(--secondary-color)'>
          Check for any missed achievements based on your current progress.
        </p>

        {/* Recalculate Achievements */}
        <div className='flex items-center justify-between rounded-lg bg-(--background-color) p-4'>
          <div>
            <h4 className='font-medium text-(--main-color)'>
              Recalculate Achievements
            </h4>
            <p className='text-sm text-(--secondary-color)'>
              Scan your progress and unlock any achievements you may have earned
            </p>
          </div>
          <button
            onClick={handleRecalculateAchievements}
            className={clsx(
              'flex items-center gap-2 rounded-lg px-4 py-2',
              buttonBorderStyles,
              'text-(--main-color) hover:bg-(--border-color)',
            )}
          >
            <RotateCcw size={16} />
            Recalculate
          </button>
        </div>
      </div>
    </div>
  );
};
