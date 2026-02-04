'use client';

import { motion } from 'framer-motion';
import clsx from 'clsx';
import { Trophy } from 'lucide-react';
import { cardBorderStyles } from '@/shared/lib/styles';

interface StatCardProps {
  value: number;
  label: string;
  index: number;
}

/**
 * Individual stat card displayed in the hero section
 */
const StatCard = ({ value, label, index }: StatCardProps) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.1 * (index + 1) }}
    className={clsx(
      'border border-(--border-color) p-6 text-center',
      cardBorderStyles,
    )}
  >
    <div className='mb-1 text-3xl font-bold text-(--main-color)'>
      {value}
    </div>
    <div className='text-sm text-(--secondary-color)'>{label}</div>
  </motion.div>
);

interface ProgressBarProps {
  percentage: number;
}

/**
 * Overall progress bar component
 */
const ProgressBar = ({ percentage }: ProgressBarProps) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.5 }}
    className='mx-auto mt-6 max-w-md'
  >
    <div className='mb-2 flex items-center justify-between'>
      <span className='text-sm font-medium text-(--main-color)'>
        Overall Progress
      </span>
      <span className='text-sm font-bold text-(--main-color)'>
        {Math.round(percentage)}%
      </span>
    </div>
    <div className='h-4 w-full rounded-full bg-(--card-color)'>
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${percentage}%` }}
        transition={{ duration: 1.5, ease: 'easeOut' }}
        className='h-4 rounded-full'
        style={{
          background:
            'linear-gradient(to right, var(--secondary-color), var(--main-color))',
        }}
      />
    </div>
  </motion.div>
);

export interface HeroSectionProps {
  unlockedCount: number;
  totalCount: number;
  totalPoints: number;
  level: number;
  completionPercentage: number;
}

/**
 * Hero section for the achievements page
 * Displays title, stats cards, and overall progress bar
 */
export const HeroSection = ({
  unlockedCount,
  totalCount,
  totalPoints,
  level,
  completionPercentage,
}: HeroSectionProps) => {
  const stats = [
    { value: unlockedCount, label: 'Unlocked' },
    { value: totalCount, label: 'Total' },
    { value: totalPoints, label: 'Points' },
    { value: level, label: 'Level' },
  ];

  return (
    <div className='relative overflow-hidden'>
      <div className='relative px-6 py-12 text-center'>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className='space-y-4'
        >
          <div className='mb-4 flex items-center justify-center gap-3'>
            <Trophy className='text-yellow-500' size={40} />
            <h1 className='text-4xl font-bold text-(--main-color)'>
              Achievements
            </h1>
          </div>
          <p className='mx-auto max-w-2xl text-lg text-(--secondary-color)'>
            Track your Japanese learning journey and celebrate your milestones
          </p>

          {/* Stats Cards */}
          <div className='mx-auto mt-8 grid max-w-4xl grid-cols-1 gap-4 md:grid-cols-4'>
            {stats.map((stat, index) => (
              <StatCard
                key={stat.label}
                value={stat.value}
                label={stat.label}
                index={index}
              />
            ))}
          </div>

          {/* Overall Progress */}
          <ProgressBar percentage={completionPercentage} />
        </motion.div>
      </div>
    </div>
  );
};
