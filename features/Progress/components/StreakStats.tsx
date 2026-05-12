'use client';

import { Flame, Trophy, Calendar, type LucideIcon } from 'lucide-react';
import { motion } from 'framer-motion';
import clsx from 'clsx';
import {
  calculateCurrentStreak,
  calculateLongestStreak,
  calculateTotalVisits,
} from '../lib/streakCalculations';

interface StatCardProps {
  title: string;
  icon: LucideIcon;
  value: number;
  description: string;
  index: number;
}

function StatCard({
  title,
  icon: Icon,
  value,
  description,
  index,
}: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 * (index + 1) }}
      className={clsx(
        'relative overflow-hidden rounded-3xl p-6',
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
        <div className='flex flex-row items-center justify-between space-y-0 pb-2'>
          <h3 className='text-sm text-(--secondary-color)'>{title}</h3>
          <Icon className='h-4 w-4 text-(--main-color)' />
        </div>
        <div className='flex flex-col gap-1 pt-2'>
          <div className='text-3xl font-bold text-(--main-color)'>
            {value}{' '}
            <span className='text-xl font-normal'>
              {value === 1 ? 'day' : 'days'}
            </span>
          </div>
          <p className='text-sm text-(--secondary-color)'>{description}</p>
        </div>
      </div>
    </motion.div>
  );
}

interface StreakStatsProps {
  visits: string[];
}

export default function StreakStats({ visits }: StreakStatsProps) {
  const currentStreak = calculateCurrentStreak(visits);
  const longestStreak = calculateLongestStreak(visits);
  const totalVisits = calculateTotalVisits(visits);

  const stats = [
    {
      title: 'Current Streak',
      icon: Flame,
      value: currentStreak,
      description:
        currentStreak > 0 ? 'Keep it going!' : 'Start your streak today!',
    },
    {
      title: 'Longest Streak',
      icon: Trophy,
      value: longestStreak,
      description:
        currentStreak >= longestStreak && currentStreak > 0
          ? "You're at your best!"
          : 'Your personal record',
    },
    {
      title: 'Total Visits',
      icon: Calendar,
      value: totalVisits,
      description: "Days you've practiced",
    },
  ];

  return (
    <div className='grid grid-cols-1 gap-4 md:grid-cols-3'>
      {stats.map((stat, index) => (
        <StatCard key={stat.title} index={index} {...stat} />
      ))}
    </div>
  );
}
