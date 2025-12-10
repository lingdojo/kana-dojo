'use client';

import { useState } from 'react';
import clsx from 'clsx';
import Sidebar from '@/shared/components/Menu/Sidebar';
import Banner from '@/shared/components/Menu/Banner';
import SimpleProgress from './SimpleProgress';
import StreakProgress from './StreakProgress';
import { TrendingUp, Flame } from 'lucide-react';
import { useClick } from '@/shared/hooks/useAudio';

type ViewType = 'statistics' | 'streak';

const viewOptions: { value: ViewType; label: string; icon: React.ReactNode }[] =
  [
    {
      value: 'statistics',
      label: 'Statistics',
      icon: <TrendingUp className='w-4 h-4' />
    },
    { value: 'streak', label: 'Streak', icon: <Flame className='w-4 h-4' /> }
  ];

const ProgressWithSidebar = () => {
  const { playClick } = useClick();

  const [currentView, setCurrentView] = useState<ViewType>('statistics');

  return (
    <div className='min-h-[100dvh] max-w-[100dvw] lg:pr-20 flex gap-4'>
      <Sidebar />
      <div
        className={clsx(
          'flex flex-col gap-4',
          'w-full lg:w-4/5 lg:px-0 px-4 md:px-8',
          'pb-20'
        )}
      >
        <Banner />

        {/* View Toggle Switch - Improved Design */}
        <div className='flex justify-center'>
          <div className='inline-flex rounded-2xl bg-[var(--card-color)] border border-[var(--border-color)] p-2 gap-2 '>
            {viewOptions.map(option => (
              <button
                key={option.value}
                onClick={() => {
                  setCurrentView(option.value);
                  playClick();
                }}
                className={clsx(
                  'relative px-5 py-2.5 rounded-xl text-sm font-medium transition-all hover:cursor-pointer',
                  'flex items-center gap-2',
                  currentView === option.value
                    ? 'bg-[var(--main-color)] text-[var(--background-color)] border-b-4 border-[var(--main-color-accent)]'
                    : 'text-[var(--secondary-color)] hover:text-[var(--main-color)] border-b-4 border-[var(--card-color)] hover:border-[var(--border-color)]/50 hover:bg-[var(--border-color)]/50'
                )}
              >
                {option.icon}
                <span>{option.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Conditional Content */}
        {currentView === 'statistics' ? <SimpleProgress /> : <StreakProgress />}
      </div>
    </div>
  );
};

export default ProgressWithSidebar;
