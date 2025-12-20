'use client';

import { useState, useEffect } from 'react';
import useVisitStore from '../store/useVisitStore';
import StreakStats from './StreakStats';
import StreakGrid from './StreakGrid';
import type { TimePeriod } from '../lib/streakCalculations';
import { useClick } from '@/shared/hooks/useAudio';
import { ActionButton } from '@/shared/components/ui/ActionButton';

const periodOptions: { value: TimePeriod; label: string; icon: string }[] = [
  { value: 'week', label: 'Week', icon: '📅' },
  { value: 'month', label: 'Month', icon: '📆' },
  { value: 'year', label: 'Year', icon: '🗓️' }
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
      <div className='flex justify-between items-end'>
        <h1 className='text-3xl font-bold text-[var(--main-color)]'>
          Visit Streak
        </h1>
      </div>

      {/* Stats Cards */}
      <StreakStats visits={visits} />

      {/* Period Selector */}
      <div className='flex justify-center'>
        <div className='inline-flex rounded-2xl bg-[var(--card-color)] border border-[var(--border-color)] p-2 gap-2'>
          {periodOptions.map(option => {
            const isSelected = period === option.value;
            return (
              <ActionButton
                key={option.value}
                onClick={() => {
                  setPeriod(option.value);
                  playClick();
                }}
                colorScheme={isSelected ? 'main' : undefined}
                borderColorScheme={isSelected ? 'main' : undefined}
                borderBottomThickness={isSelected ? 6 : 0}
                borderRadius='2xl'
                className={
                  isSelected
                    ? 'w-auto px-5 py-2.5 text-sm'
                    : 'w-auto px-5 py-2.5 text-sm bg-transparent text-[var(--secondary-color)] hover:text-[var(--main-color)] hover:bg-[var(--border-color)]/50'
                }
              >
                <span className='text-base'>{option.icon}</span>
                <span>{option.label}</span>
              </ActionButton>
            );
          })}
        </div>
      </div>

      {/* Streak Grid */}
      <StreakGrid visits={visits} period={period} />

      {/* Instructions */}
      <div className='rounded-2xl bg-[var(--card-color)] border border-[var(--border-color)] p-4'>
        <h3 className='font-semibold text-[var(--main-color)] pb-2'>
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
