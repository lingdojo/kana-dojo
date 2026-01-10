'use client';

import { useState, useEffect } from 'react';
import useVisitStore from '../store/useVisitStore';
import StreakStats from './StreakStats';
import StreakGrid from './StreakGrid';
import type { TimePeriod } from '../lib/streakCalculations';
import { useClick } from '@/shared/hooks/useAudio';
import { ActionButton } from '@/shared/components/ui/ActionButton';
import {
  CalendarDays,
  CalendarRange,
  Calendars,
  LucideIcon
} from 'lucide-react';

const periodOptions: { value: TimePeriod; label: string; icon: LucideIcon }[] =
  [
    { value: 'week', label: 'Week', icon: CalendarDays },
    { value: 'month', label: 'Month', icon: Calendars },
    { value: 'year', label: 'Year', icon: CalendarRange }
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
        <div className='text-[var(--secondary-color)]'>Loading...</div>
      </div>
    );
  }

  return (
    <div className='space-y-6'>
      <div className='flex items-end justify-between'>
        <h1 className='text-3xl font-bold text-[var(--main-color)]'>
          Visit Streak
        </h1>
      </div>

      {/* Stats Cards */}
      <StreakStats visits={visits} />

      {/* Period Selector */}
      <div className='flex justify-center'>
        <div className='inline-flex gap-2 rounded-3xl border-0 border-[var(--border-color)] bg-[var(--card-color)] p-2'>
          {periodOptions.map(option => {
            const isSelected = period === option.value;
            const Icon = option.icon;
            return (
              <ActionButton
                key={option.value}
                onClick={() => {
                  setPeriod(option.value);
                  playClick();
                }}
                colorScheme={isSelected ? 'main' : undefined}
                borderColorScheme={isSelected ? 'main' : undefined}
                borderBottomThickness={isSelected ? 10 : 0}
                borderRadius='3xl'
                className={
                  isSelected
                    ? 'w-auto px-5 py-2.5 text-sm'
                    : 'w-auto bg-transparent px-5 py-2.5 text-sm text-[var(--secondary-color)] hover:bg-[var(--border-color)]/50 hover:text-[var(--main-color)]'
                }
              >
                <Icon className='h-4 w-4' />
                <span>{option.label}</span>
              </ActionButton>
            );
          })}
        </div>
      </div>

      {/* Streak Grid */}
      <StreakGrid visits={visits} period={period} />

      {/* Instructions */}
      <div className='rounded-2xl border border-[var(--border-color)] bg-[var(--card-color)] p-4'>
        <h3 className='pb-2 font-semibold text-[var(--main-color)]'>
          How Streak Tracking Works
        </h3>
        <div className='space-y-2 text-sm text-[var(--secondary-color)]'>
          <p>• Your visits are automatically tracked when you use KanaDojo</p>
          <p>• Each day you visit counts toward your streak</p>
          <p>• Keep your streak going by visiting daily!</p>
        </div>
      </div>
    </div>
  );
}
