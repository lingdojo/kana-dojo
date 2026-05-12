'use client';

import { useState, useEffect } from 'react';
import useVisitStore from '../store/useVisitStore';
import StreakStats from './StreakStats';
import StreakGrid from './StreakGrid';
import type { TimePeriod } from '../lib/streakCalculations';
import { cn } from '@/shared/utils/utils';

export default function StreakProgress() {
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

      {/* Streak Grid */}
      <StreakGrid visits={visits} period={period} onPeriodChange={setPeriod} />

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

