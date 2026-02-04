'use client';

import { Flame, Trophy, Calendar, type LucideIcon } from 'lucide-react';
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
}

function StatCard({ title, icon: Icon, value, description }: StatCardProps) {
  return (
    <div className='rounded-2xl border border-(--border-color) bg-(--card-color) p-4'>
      <div className='flex flex-row items-center justify-between space-y-0 pb-2'>
        <h3 className='text-sm text-(--secondary-color)'>{title}</h3>
        <Icon className='h-4 w-4 text-(--main-color)' />
      </div>
      <div className='flex flex-col gap-1 pt-2'>
        <div className='text-2xl text-(--main-color)'>
          {value} {value === 1 ? 'day' : 'days'}
        </div>
        <p className='text-xs text-(--secondary-color)'>{description}</p>
      </div>
    </div>
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
      {stats.map(stat => (
        <StatCard key={stat.title} {...stat} />
      ))}
    </div>
  );
}
