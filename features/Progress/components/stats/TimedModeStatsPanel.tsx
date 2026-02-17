'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/shared/lib/utils';
import { Clock, Target, Zap, Trophy, Timer } from 'lucide-react';
import { ActionButton } from '@/shared/components/ui/ActionButton';
import type { TimedModeStats, ContentType } from '../../types/stats';

/**
 * Props for the BlitzStatsPanel component
 */
export interface TimedModeStatsPanelProps {
  /** Kana timed mode stats */
  kanaStats: TimedModeStats;
  /** Kanji timed mode stats */
  kanjiStats: TimedModeStats;
  /** Vocabulary timed mode stats */
  vocabularyStats: TimedModeStats;
  /** Optional additional CSS classes */
  className?: string;
}

/**
 * Content type tabs configuration
 */
const CONTENT_TABS: { value: ContentType; label: string }[] = [
  { value: 'kana', label: 'Kana' },
  { value: 'kanji', label: 'Kanji' },
  { value: 'vocabulary', label: 'Vocab' },
];

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
  icon: typeof Clock;
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
 * Stats display for a single content type
 */
function ContentTypeStats({ stats }: { stats: TimedModeStats }) {
  const hasData = stats.correct > 0 || stats.wrong > 0;

  if (!hasData) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className='flex flex-col items-center justify-center py-16 text-center'
      >
        <div className='mb-4 opacity-30'>
          <Timer className='h-16 w-16' />
        </div>
        <p className='text-(--secondary-color)'>No Blitz data yet</p>
        <p className='text-sm text-(--secondary-color)/60'>
          Start a Blitz challenge to see stats!
        </p>
      </motion.div>
    );
  }

  const statItems = [
    { icon: Target, label: 'Correct', value: stats.correct },
    { icon: Clock, label: 'Wrong', value: stats.wrong },
    { icon: Zap, label: 'Streak', value: stats.streak },
    { icon: Trophy, label: 'Best', value: stats.bestStreak },
  ];

  return (
    <div className='grid grid-cols-2 gap-3'>
      {statItems.map((item, idx) => (
        <StatItem
          key={item.label}
          icon={item.icon}
          label={item.label}
          value={item.value}
          index={idx}
        />
      ))}
      <div className='col-span-2'>
        <StatItem
          icon={Target}
          label='Accuracy'
          value={`${stats.accuracy.toFixed(1)}%`}
          subValue={`${stats.correct} / ${stats.correct + stats.wrong} correct`}
          index={4}
        />
      </div>
    </div>
  );
}

/**
 * BlitzStatsPanel Component
 *
 * Premium panel with pill tabs and bold stats.
 */
export default function BlitzStatsPanel({
  kanaStats,
  kanjiStats,
  vocabularyStats,
  className,
}: TimedModeStatsPanelProps) {
  const [activeTab, setActiveTab] = useState<ContentType>('kana');

  const statsMap: Record<ContentType, TimedModeStats> = {
    kana: kanaStats,
    kanji: kanjiStats,
    vocabulary: vocabularyStats,
  };

  const currentStats = statsMap[activeTab];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.4 }}
      className={cn(
        'group relative overflow-hidden rounded-3xl',
        'bg-(--card-color)',
        'p-6',
        className,
      )}
    >
      {/* Decorative gradient */}
      <div className='pointer-events-none absolute -right-16 -bottom-16 h-48 w-48 rounded-full bg-linear-to-br from-(--main-color)/5 to-transparent' />

      <div className='relative z-10 flex flex-col gap-6'>
        {/* Header */}
        <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
          <div className='flex items-center gap-4'>
            <motion.div
              animate={{ rotate: [0, 5, -5, 0] }}
              transition={{ duration: 3, repeat: Infinity, repeatDelay: 2 }}
              className='flex h-14 w-14 items-center justify-center rounded-2xl border border-(--main-color)/20 bg-linear-to-br from-(--main-color)/20 to-(--secondary-color)/10'
            >
              <Zap className='h-7 w-7 text-(--main-color)' />
            </motion.div>
            <div>
              <h3 className='text-2xl font-bold text-(--main-color)'>Blitz</h3>
              <p className='text-sm text-(--secondary-color)/70'>
                Speed challenge stats
              </p>
            </div>
          </div>

          {/* Pill tabs with smooth sliding animation */}
          <div className='flex gap-1 rounded-[22px] bg-(--background-color) p-1.5'>
            {CONTENT_TABS.map(tab => {
              const isSelected = activeTab === tab.value;
              return (
                <div key={tab.value} className='relative'>
                  {/* Smooth sliding background indicator */}
                  {isSelected && (
                    <motion.div
                      layoutId='activeBlitzTab'
                      className='absolute inset-0 rounded-2xl border-b-10 border-(--main-color-accent) bg-(--main-color)'
                      transition={{
                        type: 'spring',
                        stiffness: 300,
                        damping: 30,
                      }}
                    />
                  )}
                  <button
                    onClick={() => setActiveTab(tab.value)}
                    className={cn(
                      'relative z-10 cursor-pointer rounded-2xl px-5 pt-2 pb-4 text-sm font-semibold transition-colors duration-300',
                      isSelected
                        ? 'text-(--background-color)'
                        : 'text-(--secondary-color)/70 hover:text-(--main-color)',
                    )}
                  >
                    {tab.label}
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Stats content */}
        <AnimatePresence mode='wait'>
          <motion.div
            key={activeTab}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <ContentTypeStats stats={currentStats} />
          </motion.div>
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

/**
 * Helper function for testing
 */
export function getTimedModeDisplayValues(stats: TimedModeStats): {
  correct: number;
  wrong: number;
  streak: number;
  bestStreak: number;
  accuracy: string;
  total: number;
} {
  return {
    correct: stats.correct,
    wrong: stats.wrong,
    streak: stats.streak,
    bestStreak: stats.bestStreak,
    accuracy: `${stats.accuracy.toFixed(1)}%`,
    total: stats.correct + stats.wrong,
  };
}
