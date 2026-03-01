'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { cn } from '@/shared/lib/utils';
import { Trophy, Star, Award, ChevronRight } from 'lucide-react';
import type { AchievementSummary } from '../../types/stats';

/**
 * Props for the AchievementSummaryBar component
 */
export interface AchievementSummaryBarProps {
  /** Achievement summary data */
  summary: AchievementSummary;
  /** Optional additional CSS classes */
  className?: string;
}

/**
 * Individual stat item - no hover animations
 */
function StatItem({
  icon: Icon,
  label,
  value,
  index,
}: {
  icon: typeof Trophy;
  label: string;
  value: string | number;
  index: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.2 + index * 0.1 }}
      className='flex items-center gap-4'
    >
      <div
        className={cn(
          'flex h-14 w-14 items-center justify-center rounded-2xl',
          'bg-linear-to-br from-(--main-color)/10 to-(--secondary-color)/5',
          'border border-(--border-color)/30',
          'text-(--main-color)',
        )}
      >
        <Icon className='h-6 w-6' />
      </div>
      <div className='flex flex-col'>
        <span className='text-2xl font-bold text-(--main-color)'>{value}</span>
        <span className='text-xs font-medium text-(--secondary-color)'>
          {label}
        </span>
      </div>
    </motion.div>
  );
}

/**
 * AchievementSummaryBar Component
 *
 * Premium horizontal card with bold stats and gradient progress.
 */
export default function AchievementSummaryBar({
  summary,
  className,
}: AchievementSummaryBarProps) {
  const { totalPoints, level, unlockedCount, totalAchievements } = summary;
  const progressPercent =
    totalAchievements > 0 ? (unlockedCount / totalAchievements) * 100 : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      className={cn(
        'group relative overflow-hidden rounded-3xl bg-(--card-color) p-6',
        className,
      )}
    >
      {/* Decorative trophy glow */}
      <div className='pointer-events-none absolute -top-10 -right-10 h-40 w-40 rounded-full bg-linear-to-br from-(--main-color)/10 to-transparent blur-3xl' />

      <div className='relative z-10 flex flex-col gap-6'>
        {/* Header with animated trophy */}
        <div className='flex items-center justify-between'>
          <div className='flex items-center gap-4'>
            <motion.div
              animate={{ rotate: [0, 5, -5, 0] }}
              transition={{ duration: 3, repeat: Infinity, repeatDelay: 2 }}
              className='flex h-14 w-14 items-center justify-center rounded-2xl border border-(--main-color)/20 bg-linear-to-br from-(--main-color)/20 to-(--secondary-color)/10'
            >
              <Trophy className='h-7 w-7 text-(--main-color)' />
            </motion.div>
            <div>
              <h3 className='text-2xl font-bold text-(--main-color)'>
                Achievements
              </h3>
              <p className='text-sm text-(--secondary-color)/70'>
                Celebrate your milestones
              </p>
            </div>
          </div>
          <Link
            href='?tab=achievements'
            className={cn(
              'group/link flex cursor-pointer items-center gap-2 rounded-full px-5 py-2.5',
              'bg-(--background-color)',
              'border border-(--border-color)/30',
              'text-sm font-semibold text-(--secondary-color)',
              'transition-colors duration-300',
              'hover:text-(--main-color)',
            )}
          >
            View All
            <ChevronRight className='h-4 w-4 transition-colors duration-300' />
          </Link>
        </div>

        {/* Stats row */}
        <div className='flex flex-wrap items-center gap-8 sm:gap-12'>
          <StatItem
            icon={Star}
            label='XP'
            value={totalPoints.toLocaleString()}
            index={0}
          />
          <StatItem icon={Trophy} label='Level' value={level} index={1} />
          <StatItem
            icon={Award}
            label='Unlocked'
            value={`${unlockedCount}/${totalAchievements}`}
            index={2}
          />
        </div>

        {/* Progress bar */}
        <div className='space-y-3'>
          <div className='relative h-4 overflow-hidden rounded-full bg-(--background-color)'>
            <motion.div
              className='absolute inset-y-0 left-0 rounded-full bg-linear-to-r from-(--secondary-color) to-(--main-color)'
              initial={{ width: 0 }}
              animate={{ width: `${progressPercent}%` }}
              transition={{ duration: 1, delay: 0.5, ease: 'easeOut' }}
            />
          </div>
          <div className='flex items-center justify-between text-sm'>
            <span className='text-(--secondary-color)/70'>
              Overall Progress
            </span>
            <span className='font-bold text-(--main-color)'>
              {progressPercent.toFixed(0)}%
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

/**
 * Helper function to get achievement summary display values for testing
 */
export function getAchievementDisplayValues(summary: AchievementSummary): {
  totalPoints: number;
  level: number;
  unlockedCount: number;
  totalAchievements: number;
  progressPercent: string;
} {
  const progressPercent =
    summary.totalAchievements > 0
      ? (summary.unlockedCount / summary.totalAchievements) * 100
      : 0;

  return {
    totalPoints: summary.totalPoints,
    level: summary.level,
    unlockedCount: summary.unlockedCount,
    totalAchievements: summary.totalAchievements,
    progressPercent: `${progressPercent.toFixed(0)}%`,
  };
}
