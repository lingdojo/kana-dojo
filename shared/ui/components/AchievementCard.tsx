'use client';

import { motion } from 'framer-motion';
import clsx from 'clsx';
import { Trophy, Lock, Star, Zap, Crown, Gem } from 'lucide-react';
import type { LucideProps } from 'lucide-react';
import type { MouseEvent } from 'react';
import { cardBorderStyles } from '@/shared/utils/styles';

type AchievementRarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';

export interface SharedAchievementData {
  icon: string;
  title: string;
  description: string;
  points: number;
  rarity?: AchievementRarity;
}

export interface SharedAchievementProgress {
  current: number;
  target: number;
  completionPercentage: number;
  isPercentage: boolean;
}

interface AchievementCardProps {
  achievement: SharedAchievementData;
  isUnlocked: boolean;
  variant?: 'default' | 'notification';
  progress?: SharedAchievementProgress;
  onClick?: () => void;
  onClose?: (e: MouseEvent<HTMLButtonElement>) => void;
}

const rarityConfig: Record<
  AchievementRarity,
  { color: string; label: string; icon: React.FC<LucideProps> }
> = {
  common: { color: '#6B7280', label: 'Common', icon: Star },
  uncommon: { color: '#059669', label: 'Uncommon', icon: Zap },
  rare: { color: '#2563EB', label: 'Rare', icon: Trophy },
  epic: { color: '#7C3AED', label: 'Epic', icon: Crown },
  legendary: { color: '#DC2626', label: 'Legendary', icon: Gem },
};

export const AchievementCard = ({
  achievement,
  isUnlocked,
  variant = 'default',
  progress,
  onClick,
  onClose,
}: AchievementCardProps) => {
  if (variant === 'notification') {
    return (
      <div
        className={clsx(
          'relative w-80 cursor-pointer p-4',
          cardBorderStyles,
          'border border-solid border-(--border-color)',
          'shadow-none transition-colors duration-200',
        )}
        onClick={onClick}
      >
        {onClose && (
          <button
            onClick={onClose}
            className={clsx(
              'absolute top-2 right-2 cursor-pointer rounded p-1',
              'text-(--secondary-color) hover:text-(--main-color)',
              'transition-colors duration-200 hover:bg-(--background-color)',
            )}
          >
            ×
          </button>
        )}

        <div className='flex items-start gap-3 pr-6'>
          <div className='flex-shrink-0'>
            <div
              className={clsx(
                'flex h-10 w-10 items-center justify-center rounded-full',
                'bg-yellow-100 text-lg font-bold text-yellow-600',
              )}
            >
              {achievement.icon}
            </div>
          </div>

          <div className='min-w-0 flex-1'>
            <div className='mb-1 flex items-center gap-2'>
              <Trophy size={14} className='text-yellow-500' />
              <span className='text-xs font-semibold tracking-wide text-yellow-600 uppercase'>
                Achievement Unlocked
              </span>
            </div>

            <h4 className='mb-1 truncate text-sm font-semibold text-(--main-color)'>
              {achievement.title}
            </h4>

            <p className='line-clamp-2 text-xs text-(--secondary-color)'>
              {achievement.description}
            </p>

            <div className='mt-2 flex items-center justify-between'>
              <span className='text-xs font-medium text-yellow-600'>
                +{achievement.points} points
              </span>
              <span className='text-xs text-(--secondary-color)'>
                Click to view
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const rarity = achievement.rarity ?? 'common';
  const config = rarityConfig[rarity];
  const RarityIcon = config.icon;
  const safeProgress = progress ?? {
    current: 0,
    target: 100,
    completionPercentage: 0,
    isPercentage: true,
  };

  return (
    <div
      className={clsx(
        'relative flex w-full flex-col overflow-hidden p-6',
        isUnlocked
          ? 'rounded-2xl bg-(--card-color)'
          : 'rounded-none border-x-0 border-y border-(--border-color) bg-(--background-color) opacity-80',
      )}
      onClick={onClick}
    >
      {isUnlocked && (
        <div
          className='absolute inset-0 opacity-5'
          style={{
            background: `linear-gradient(135deg, ${config.color}20, transparent)`,
          }}
        />
      )}

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

        <div className='space-y-2'>
          <div className='flex items-center justify-between'>
            <span className='text-sm font-medium text-(--secondary-color)'>
              Progress
            </span>
            <span className='text-sm font-bold text-(--main-color)'>
              {safeProgress.isPercentage
                ? `${Math.round(safeProgress.current)}%`
                : `${Math.round(safeProgress.current)}/${Math.round(safeProgress.target)}`}
            </span>
          </div>
          <div className='h-3 w-full rounded-full bg-(--card-color)'>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${safeProgress.completionPercentage}%` }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              className={clsx('h-3 rounded-full', !isUnlocked && 'opacity-60')}
              style={{
                background:
                  'linear-gradient(to right, var(--secondary-color), var(--main-color))',
              }}
            />
          </div>
        </div>

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
            <div className='rounded-full border-(--border-color) bg-(--background-color) px-2 py-1 text-xs text-(--secondary-color)/70'>
              Locked
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
