'use client';

import { motion } from 'framer-motion';
import { cn } from '@/shared/lib/utils';
import {
  Swords,
  Target,
  Clock,
  Zap,
  CheckCircle,
  Activity,
  Trophy,
} from 'lucide-react';
import type { GauntletOverallStats } from '../../types/stats';

/**
 * Props for the GauntletStatsPanel component
 */
export interface GauntletStatsPanelProps {
  /** Gauntlet stats data, null if not available */
  stats: GauntletOverallStats | null;
  /** Whether the stats are currently loading */
  isLoading: boolean;
  /** Optional additional CSS classes */
  className?: string;
}

/**
 * Formats time in milliseconds to a readable string
 */
function formatTime(ms: number | null): string {
  if (ms === null) return '--';

  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;

  if (minutes > 0) {
    return `${minutes}m ${remainingSeconds}s`;
  }
  return `${seconds}s`;
}

/**
 * Individual stat item - color transitions only
 */
function StatItem({
  icon: Icon,
  label,
  value,
  subValue,
  index,
}: {
  icon: typeof Trophy;
  label: string;
  value: string | number;
  subValue?: string;
  index: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      className={cn(
        'group/item cursor-pointer rounded-2xl p-4',
        'bg-(--background-color)',
        'border border-transparent',
        'transition-colors duration-300',
        'hover:border-(--main-color)/20',
      )}
    >
      <div className='flex items-center gap-4'>
        <div
          className={cn(
            'flex h-12 w-12 shrink-0 items-center justify-center rounded-xl',
            'bg-linear-to-br from-(--main-color)/10 to-(--secondary-color)/5',
            'text-(--main-color)',
            'transition-colors duration-300',
            'group-hover/item:from-(--main-color)/15 group-hover/item:to-(--secondary-color)/10',
          )}
        >
          <Icon className='h-5 w-5' />
        </div>
        <div className='min-w-0 flex-1'>
          <p className='text-xs font-medium text-(--secondary-color)'>
            {label}
          </p>
          <p className='text-xl font-bold text-(--main-color)'>{value}</p>
          {subValue && (
            <p className='text-xs text-(--secondary-color)/60'>{subValue}</p>
          )}
        </div>
      </div>
    </motion.div>
  );
}

/**
 * Loading skeleton with shimmer
 */
function LoadingSkeleton() {
  return (
    <div className='grid grid-cols-2 gap-3'>
      {[...Array(6)].map((_, i) => (
        <div
          key={i}
          className='relative overflow-hidden rounded-2xl bg-(--background-color) p-4'
        >
          <div className='animate-shimmer absolute inset-0 -translate-x-full bg-linear-to-r from-transparent via-(--card-color)/50 to-transparent' />
          <div className='flex items-center gap-4'>
            <div className='h-12 w-12 shrink-0 rounded-xl bg-(--border-color)/30' />
            <div className='flex-1 space-y-2'>
              <div className='h-3 w-16 rounded bg-(--border-color)/30' />
              <div className='h-5 w-12 rounded bg-(--border-color)/30' />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * Empty state
 */
function EmptyState() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className='flex flex-col items-center justify-center py-16 text-center'
    >
      <div className='mb-4 opacity-30'>
        <Trophy className='h-16 w-16' />
      </div>
      <p className='text-(--secondary-color)'>No gauntlet data yet</p>
      <p className='text-sm text-(--secondary-color)/60'>
        Complete a gauntlet to see your stats!
      </p>
    </motion.div>
  );
}

/**
 * GauntletStatsPanel Component
 *
 * Premium panel with bold stats and consistent styling.
 */
export default function GauntletStatsPanel({
  stats,
  isLoading,
  className,
}: GauntletStatsPanelProps) {
  const hasData = stats && stats.totalSessions > 0;

  const statItems = hasData
    ? [
        { icon: Activity, label: 'Sessions', value: stats.totalSessions },
        {
          icon: CheckCircle,
          label: 'Completion',
          value: `${stats.completionRate.toFixed(0)}%`,
          subValue: `${stats.completedSessions}/${stats.totalSessions}`,
        },
        {
          icon: Clock,
          label: 'Best Time',
          value: formatTime(stats.fastestTime),
        },
        {
          icon: Target,
          label: 'Accuracy',
          value: `${stats.accuracy.toFixed(0)}%`,
          subValue: `${stats.totalCorrect}/${stats.totalCorrect + stats.totalWrong}`,
        },
        { icon: Zap, label: 'Best Streak', value: stats.bestStreak },
        { icon: Trophy, label: 'Correct', value: stats.totalCorrect },
      ]
    : [];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.5 }}
      className={cn(
        'group relative overflow-hidden rounded-3xl',
        'bg-(--card-color)',
        'p-6',
        className,
      )}
    >
      {/* Decorative element */}
      <div className='pointer-events-none absolute -bottom-16 -left-16 h-48 w-48 rounded-full bg-linear-to-tr from-(--secondary-color)/5 to-transparent' />

      <div className='relative z-10 flex flex-col gap-6'>
        {/* Header */}
        <div className='flex items-center gap-4'>
          <motion.div
            animate={{ rotate: [0, 5, -5, 0] }}
            transition={{ duration: 3, repeat: Infinity, repeatDelay: 2 }}
            className='flex h-14 w-14 items-center justify-center rounded-2xl border border-(--main-color)/20 bg-linear-to-br from-(--main-color)/20 to-(--secondary-color)/10'
          >
            <Swords className='h-7 w-7 text-(--main-color)' />
          </motion.div>
          <div>
            <h3 className='text-2xl font-bold text-(--main-color)'>Gauntlet</h3>
            <p className='text-sm text-(--secondary-color)/70'>
              Endurance challenge stats
            </p>
          </div>
        </div>

        {/* Content */}
        {isLoading ? (
          <LoadingSkeleton />
        ) : !hasData ? (
          <EmptyState />
        ) : (
          <div className='grid grid-cols-2 gap-3'>
            {statItems.map((item, idx) => (
              <StatItem
                key={item.label}
                icon={item.icon}
                label={item.label}
                value={item.value}
                subValue={item.subValue}
                index={idx}
              />
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}

/**
 * Helper function for testing
 */
export function getGauntletDisplayValues(stats: GauntletOverallStats): {
  totalSessions: number;
  completedSessions: number;
  completionRate: string;
  totalCorrect: number;
  totalWrong: number;
  bestStreak: number;
  fastestTime: string;
  accuracy: string;
} {
  return {
    totalSessions: stats.totalSessions,
    completedSessions: stats.completedSessions,
    completionRate: `${stats.completionRate.toFixed(1)}%`,
    totalCorrect: stats.totalCorrect,
    totalWrong: stats.totalWrong,
    bestStreak: stats.bestStreak,
    fastestTime: formatTime(stats.fastestTime),
    accuracy: `${stats.accuracy.toFixed(1)}%`,
  };
}
