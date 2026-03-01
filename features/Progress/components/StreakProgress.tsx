'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import useVisitStore from '../store/useVisitStore';
import StreakStats from './StreakStats';
import StreakGrid from './StreakGrid';
import type { TimePeriod } from '../lib/streakCalculations';
import { useClick } from '@/shared/hooks/useAudio';
import {
  CalendarDays,
  CalendarRange,
  Calendars,
  LucideIcon,
} from 'lucide-react';
import { cn } from '@/shared/lib/utils';

const periodOptions: { value: TimePeriod; label: string; icon: LucideIcon }[] =
  [
    { value: 'week', label: 'Week', icon: CalendarDays },
    { value: 'month', label: 'Month', icon: Calendars },
    { value: 'year', label: 'Year', icon: CalendarRange },
  ];

export default function StreakProgress() {
  const { playClick } = useClick();

  const { visits, isLoaded, loadVisits } = useVisitStore();
  const [period, setPeriod] = useState<TimePeriod>('week');

  useEffect(() => {
    if (!isLoaded) {
      loadVisits();
    }
  }, [isLoaded, loadVisits]);

  if (!isLoaded) {
    return (
      <div className='flex items-center justify-center p-8'>
        <div className='text-(--secondary-color)'>Loading...</div>
      </div>
    );
  }

  return (
    <div className='space-y-6'>
      <div className='flex items-end justify-between'>
        <h1 className='text-3xl font-bold text-(--main-color)'>Visit Streak</h1>
      </div>

      {/* Stats Cards */}
      <StreakStats visits={visits} />

      {/* Period Selector */}
      <div className='flex justify-center'>
        <div
          className={cn(
            'inline-flex gap-0 overflow-hidden rounded-3xl p-2',
            'bg-(--card-color)',
          )}
        >
          {periodOptions.map(option => {
            const isSelected = period === option.value;
            const Icon = option.icon;
            return (
              <div key={option.value} className='relative'>
                {/* Smooth sliding background indicator */}
                {isSelected && (
                  <motion.div
                    layoutId='activePeriodTab'
                    className='absolute inset-0 rounded-2xl border-b-10 border-(--main-color-accent) bg-(--main-color)'
                    transition={{
                      type: 'spring',
                      stiffness: 300,
                      damping: 30,
                    }}
                  />
                )}
                <button
                  onClick={() => {
                    setPeriod(option.value);
                    playClick();
                  }}
                  className={cn(
                    'relative z-10 flex cursor-pointer items-center gap-2 rounded-2xl px-5 pt-3 pb-5 text-sm font-semibold transition-colors duration-300',
                    isSelected
                      ? 'text-(--background-color)'
                      : 'text-(--secondary-color) hover:text-(--main-color)',
                  )}
                >
                  <Icon className='h-4 w-4' />
                  <span>{option.label}</span>
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Streak Grid */}
      <StreakGrid visits={visits} period={period} />

      {/* Instructions */}
      <div className='rounded-2xl bg-(--card-color) p-4'>
        <h3 className='pb-2 font-semibold text-(--main-color)'>
          How Streak Tracking Works
        </h3>
        <div className='space-y-2 text-sm text-(--secondary-color)'>
          <p>• Your visits are automatically tracked when you use KanaDojo</p>
          <p>• Each day you visit counts toward your streak</p>
          <p>• Keep your streak going by visiting daily!</p>
        </div>
      </div>
    </div>
  );
}
