'use client';

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/shared/lib/utils';
import type { MasteryDistribution } from '../../types/stats';
import { ChartColumn } from 'lucide-react';

/**
 * Props for the MasteryDistributionChart component
 */
export interface MasteryDistributionChartProps {
  /** Mastery distribution data */
  distribution: MasteryDistribution;
  /** Optional additional CSS classes */
  className?: string;
}

/**
 * Theme-compliant configuration for mastery levels
 */
const MASTERY_CONFIG = {
  mastered: {
    label: 'Mastered',
    colorVar: '--main-color',
    description: '90%+ accuracy',
  },
  learning: {
    label: 'Learning',
    colorVar: '--secondary-color',
    description: 'In progress',
  },
  needsPractice: {
    label: 'Needs Practice',
    colorVar: '--border-color',
    description: '<70% accuracy',
  },
} as const;

/**
 * Calculates percentage for a value
 */
function calculatePercentage(value: number, total: number): number {
  if (total === 0) return 0;
  return (value / total) * 100;
}

/**
 * MasteryDistributionChart Component
 *
 * Bold visual breakdown with stacked bar and large numbers.
 */
export default function MasteryDistributionChart({
  distribution,
  className,
}: MasteryDistributionChartProps) {
  const { mastered, learning, needsPractice, total } = distribution;

  const masteredPercent = useMemo(
    () => calculatePercentage(mastered, total),
    [mastered, total],
  );
  const learningPercent = useMemo(
    () => calculatePercentage(learning, total),
    [learning, total],
  );
  const needsPracticePercent = useMemo(
    () => calculatePercentage(needsPractice, total),
    [needsPractice, total],
  );

  const hasData = total > 0;

  const segments = useMemo(
    () => [
      {
        key: 'mastered',
        value: mastered,
        percent: masteredPercent,
        config: MASTERY_CONFIG.mastered,
      },
      {
        key: 'learning',
        value: learning,
        percent: learningPercent,
        config: MASTERY_CONFIG.learning,
      },
      {
        key: 'needsPractice',
        value: needsPractice,
        percent: needsPracticePercent,
        config: MASTERY_CONFIG.needsPractice,
      },
    ],
    [learning, learningPercent, mastered, masteredPercent, needsPractice, needsPracticePercent],
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className={cn(
        'group relative overflow-hidden rounded-3xl',
        'border border-(--border-color)/50 bg-(--card-color)',
        'p-6',
        className,
      )}
    >
      {/* Decorative element */}
      <div className='pointer-events-none absolute -bottom-16 -left-16 h-48 w-48 rounded-full bg-gradient-to-tr from-(--secondary-color)/5 to-transparent' />

      <div className='relative z-10 flex flex-col gap-6'>
        {/* Header */}
        <div className='flex items-center justify-between'>
          <div>
            <h3 className='text-2xl font-bold text-(--main-color)'>
              Mastery Distribution
            </h3>
            <p className='text-sm text-(--secondary-color)/70'>
              Character proficiency breakdown
            </p>
          </div>
          {hasData && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className='flex flex-col items-end'
            >
              <span className='text-3xl font-bold text-(--main-color)'>
                {total}
              </span>
              <span className='text-xs text-(--secondary-color)'>
                total characters
              </span>
            </motion.div>
          )}
        </div>

        {!hasData ? (
          <div className='flex flex-col items-center justify-center py-16 text-center'>
            <div className='mb-4 opacity-30'>
              <ChartColumn className='h-16 w-16' />
            </div>
            <p className='text-(--secondary-color)'>
              No characters practiced yet
            </p>
          </div>
        ) : (
          <>
            {/* Large stacked bar */}
            <div className='space-y-4'>
              <div className='relative h-12 overflow-hidden rounded-2xl bg-(--background-color)'>
                <div className='absolute inset-0 flex'>
                  {segments.map(
                    ({ key, percent, config }, idx) =>
                      percent > 0 && (
                        <motion.div
                          key={key}
                          className='relative flex h-full items-center justify-center overflow-hidden bg-gradient-to-r from-(--secondary-color) to-(--main-color)'
                          initial={{ width: 0 }}
                          animate={{ width: `${percent}%` }}
                          transition={{
                            duration: 0.8,
                            delay: 0.3 + idx * 0.1,
                            ease: [0.25, 0.46, 0.45, 0.94],
                          }}
                          style={{ backgroundColor: `var(${config.colorVar})` }}
                        >
                          {percent >= 12 && (
                            <motion.span
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              transition={{ delay: 0.8 + idx * 0.1 }}
                              className='text-sm font-bold text-white/90'
                            >
                              {percent.toFixed(0)}%
                            </motion.span>
                          )}
                        </motion.div>
                      ),
                  )}
                </div>
              </div>
            </div>

            {/* Stats cards - stacked vertically for bold display */}
            <div className='grid grid-cols-1 gap-3 sm:grid-cols-3'>
              {segments.map(({ key, value, percent, config }, idx) => (
                <motion.div
                  key={key}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.5 + idx * 0.1 }}
                  className={cn(
                    'group/item cursor-pointer rounded-2xl p-4',
                    'bg-(--background-color)',
                    'border border-transparent',
                    'transition-colors duration-300',
                    'hover:border-(--main-color)/20',
                  )}
                >
                  <div className='flex items-center gap-3'>
                    <div
                      className='h-10 w-2 rounded-full'
                      style={{ backgroundColor: `var(${config.colorVar})` }}
                    />
                    <div className='flex-1'>
                      <div className='flex items-baseline gap-2'>
                        <span className='text-2xl font-bold text-(--main-color)'>
                          {value}
                        </span>
                        <span className='text-sm text-(--secondary-color)/60'>
                          ({percent.toFixed(0)}%)
                        </span>
                      </div>
                      <span
                        className='text-sm font-medium'
                        style={{ color: `var(${config.colorVar})` }}
                      >
                        {config.label}
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </>
        )}
      </div>
    </motion.div>
  );
}

/**
 * Helper function to get mastery distribution display values for testing
 */
export function getMasteryDistributionDisplayValues(
  distribution: MasteryDistribution,
): {
  mastered: number;
  learning: number;
  needsPractice: number;
  total: number;
  masteredPercent: string;
  learningPercent: string;
  needsPracticePercent: string;
  percentageSum: number;
} {
  const { mastered, learning, needsPractice, total } = distribution;

  const masteredPercent = calculatePercentage(mastered, total);
  const learningPercent = calculatePercentage(learning, total);
  const needsPracticePercent = calculatePercentage(needsPractice, total);

  return {
    mastered,
    learning,
    needsPractice,
    total,
    masteredPercent: `${masteredPercent.toFixed(1)}%`,
    learningPercent: `${learningPercent.toFixed(1)}%`,
    needsPracticePercent: `${needsPracticePercent.toFixed(1)}%`,
    percentageSum: masteredPercent + learningPercent + needsPracticePercent,
  };
}
