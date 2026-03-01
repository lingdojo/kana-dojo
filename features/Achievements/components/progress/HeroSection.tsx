'use client';

import { motion } from 'framer-motion';
import clsx from 'clsx';
import { Trophy } from 'lucide-react';
import type { CSSProperties } from 'react';

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
      'relative overflow-hidden rounded-3xl p-6 text-center',
      'bg-linear-to-br from-(--card-color) to-(--card-color)',
    )}
  >
    {/* Top gradient accent bar */}
    <motion.div
      className='absolute top-0 right-0 left-0 h-1.5 rounded-t-3xl bg-linear-to-r from-(--main-color) via-(--secondary-color) to-(--main-color)'
      initial={{ opacity: 0, scaleX: 0 }}
      animate={{ opacity: 1, scaleX: 1 }}
      transition={{ duration: 0.8, delay: index * 0.08 + 0.3 }}
    />

    {/* Bottom gradient accent bar */}
    <motion.div
      className='absolute right-0 bottom-0 left-0 h-1.5 rounded-b-3xl bg-linear-to-r from-(--main-color) via-(--secondary-color) to-(--main-color)'
      initial={{ opacity: 0, scaleX: 0 }}
      animate={{ opacity: 1, scaleX: 1 }}
      transition={{ duration: 0.8, delay: index * 0.08 + 0.35 }}
    />

    <div className='relative z-10'>
      <div className='mb-1 text-3xl font-bold text-(--main-color)'>{value}</div>
      <div className='text-sm text-(--secondary-color)'>{label}</div>
    </div>
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
    className='mx-auto mt-10 max-w-4xl'
  >
    <div className='mb-3 flex items-center justify-between px-2'>
      <span className='text-xl font-bold text-(--secondary-color)'>
        Overall Progress
      </span>
      <span className='text-2xl font-black text-(--main-color)'>
        {Math.round(percentage)}%
      </span>
    </div>
    <div className='h-8 w-full overflow-hidden rounded-full bg-(--card-color)'>
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${percentage}%` }}
        transition={{ duration: 1.5, ease: 'easeOut' }}
        className='h-full rounded-full'
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
  statCardHaloGap?: number;
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
  statCardHaloGap = 10,
}: HeroSectionProps) => {
  const stats = [
    { value: unlockedCount, label: 'Unlocked' },
    { value: totalCount, label: 'Total' },
    { value: totalPoints, label: 'XP' },
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

          {/* Overall Progress */}
          <ProgressBar percentage={completionPercentage} />

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
        </motion.div>
      </div>
    </div>
  );
};
