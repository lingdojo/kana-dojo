'use client';

import { motion } from 'framer-motion';
import clsx from 'clsx';
import { Trophy, Lock } from 'lucide-react';
import { type Achievement } from '@/features/Achievements/store/useAchievementStore';
import { rarityConfig } from './constants';
import { type AchievementProgressData } from './useAchievementProgress';

export interface AchievementCardProps {
  achievement: Achievement;
  isUnlocked: boolean;
  progress: AchievementProgressData;
}

/**
 * Displays an individual achievement card with:
 * - Achievement icon and title
 * - Rarity badge
 * - Progress bar (for locked achievements)
 * - Points footer
 */
export const AchievementCard = ({
  achievement,
  isUnlocked,
  progress,
}: AchievementCardProps) => {
  const config = rarityConfig[achievement.rarity];
  const RarityIcon = config.icon;

  return (
    <div
      className={clsx(
        'relative flex w-full flex-col overflow-hidden p-6',
        isUnlocked
          ? 'rounded-2xl bg-(--card-color)'
          : 'rounded-none border-x-0 border-y border-(--border-color) bg-(--background-color) opacity-80',
      )}
    >
      {/* Gradient overlay for unlocked achievements */}
      {isUnlocked && (
        <div
          className='absolute inset-0 opacity-5'
          style={{
            background: `linear-gradient(135deg, ${config.color}20, transparent)`,
          }}
        />
      )}

      {/* Rarity badge */}
      <div className='absolute top-3 right-3'>
        <div
          className={clsx(
            'flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium',
            'backdrop-blur-sm',
          )}
          style={
            isUnlocked
              ? {
                  backgroundColor: `${config.color}15`,
                  borderColor: `${config.color}30`,
                  color: config.color,
                }
              : {
                  backgroundColor: '#F3F4F620',
                  borderColor: '#D1D5DB50',
                  color: '#9CA3AF',
                }
          }
        >
          <RarityIcon size={12} />
          {config.label}
        </div>
      </div>

      <div className='flex flex-1 flex-col space-y-4'>
        {/* Achievement icon and title */}
        <div className='flex items-center gap-4'>
          <div
            className={clsx(
              'flex h-16 w-16 items-center justify-center rounded-2xl text-2xl font-bold',
              'border border-(--border-color)',
            )}
            style={
              isUnlocked
                ? {
                    backgroundColor: 'var(--background-color)',
                    color: config.color,
                  }
                : {
                    backgroundColor: 'var(--background-color)',
                    color: '#9CA3AF',
                  }
            }
          >
            {isUnlocked ? achievement.icon : <Lock size={24} />}
          </div>

          <div className='min-w-0 flex-1'>
            <h3
              className={clsx(
                'mb-1 text-lg font-bold',
                isUnlocked ? 'text-(--main-color)' : 'text-(--secondary-color)',
              )}
            >
              {achievement.title}
            </h3>

            <p
              className={clsx(
                'text-sm leading-relaxed',
                isUnlocked
                  ? 'text-(--secondary-color)'
                  : 'text-(--secondary-color)/70',
              )}
            >
              {achievement.description}
            </p>
          </div>
        </div>

        {/* Progress bar (now always shown) */}
        <div className='space-y-2'>
          <div className='flex items-center justify-between'>
            <span className='text-sm font-medium text-(--secondary-color)'>
              Progress
            </span>
            <span className='text-sm font-bold text-(--main-color)'>
              {progress.isPercentage
                ? `${Math.round(progress.current)}%`
                : `${Math.round(progress.current)}/${Math.round(progress.target)}`}
            </span>
          </div>
          <div className='h-3 w-full rounded-full bg-(--card-color)'>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress.completionPercentage}%` }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              className={clsx('h-3 rounded-full', !isUnlocked && 'opacity-60')}
              style={{
                background:
                  'linear-gradient(to right, var(--secondary-color), var(--main-color))',
              }}
            />
          </div>
        </div>

        {/* Footer */}
        <div className='mt-auto flex items-center justify-between border-t-2 border-(--border-color)/30 pt-2'>
          <div className='flex items-center gap-2'>
            <Trophy
              size={16}
              className={
                isUnlocked
                  ? 'text-(--secondary-color)'
                  : 'text-(--border-color)'
              }
            />
            <span
              className={clsx(
                'text-sm font-bold',
                isUnlocked ? 'text-(--main-color)' : 'text-(--secondary-color)',
              )}
            >
              {achievement.points} XP
            </span>
          </div>

          {isUnlocked ? (
            <div className='rounded-full bg-(--secondary-color) px-2 py-1 text-xs text-(--background-color)'>
              Unlocked
            </div>
          ) : (
            <div className='rounded-full  border-(--border-color) bg-(--background-color) px-2 py-1 text-xs text-(--secondary-color)/70'>
              Locked
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
