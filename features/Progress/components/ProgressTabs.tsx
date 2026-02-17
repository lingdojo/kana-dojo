'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';
import type { CSSProperties } from 'react';
import SimpleProgress from './SimpleProgress';
import StreakProgress from './StreakProgress';
import AchievementProgress from '@/features/Achievements/components';
import { TrendingUp, Flame, Trophy } from 'lucide-react';
import { useClick } from '@/shared/hooks/useAudio';
import { cn } from '@/shared/lib/utils';

type ViewType = 'statistics' | 'streak' | 'achievements';

const PROGRESS_TABS_HALO_GAP = 8;

const viewOptions: { value: ViewType; label: string; icon: React.ReactNode }[] =
  [
    {
      value: 'statistics',
      label: 'Stats',
      icon: <TrendingUp className='h-5 w-5' />,
    },
    {
      value: 'streak',
      label: 'Streak',
      icon: <Flame className='h-5 w-5' />,
    },
    {
      value: 'achievements',
      label: 'Achievements',
      icon: <Trophy className='h-5 w-5' />,
    },
  ];

const ProgressTabs = () => {
  const { playClick } = useClick();
  const [currentView, setCurrentView] = useState<ViewType>('statistics');

  return (
    <div className='flex flex-col gap-8'>
      {/* View Toggle Switch with smooth sliding animation */}
      <div className='flex justify-center px-2'>
        <div
          className={cn(
            'rounded-(--progress-tabs-outer-radius) border-4 border-(--border-color) p-(--progress-tabs-halo-gap)',
          )}
          style={
            {
              '--progress-tabs-halo-gap': `${PROGRESS_TABS_HALO_GAP}px`,
              '--progress-tabs-outer-radius':
                'calc(var(--radius-2xl) + var(--progress-tabs-halo-gap))',
              '--progress-tabs-shared-radius':
                'calc(var(--progress-tabs-outer-radius) - var(--progress-tabs-halo-gap))',
            } as CSSProperties
          }
        >
          <div
            className={cn(
              'inline-flex flex-wrap justify-center gap-0 overflow-hidden rounded-(--progress-tabs-shared-radius)',
              'bg-(--card-color) p-0',
            )}
          >
            {viewOptions.map(option => {
              const isSelected = currentView === option.value;
              return (
                <div key={option.value} className='relative'>
                  {/* Smooth sliding background indicator */}
                  {isSelected && (
                    <motion.div
                      layoutId='activeProgressTab'
                      className='absolute inset-0 rounded-(--progress-tabs-shared-radius) border-b-10 border-(--main-color-accent) bg-(--main-color)'
                      transition={{
                        type: 'spring',
                        stiffness: 300,
                        damping: 30,
                      }}
                    />
                  )}
                  <button
                    onClick={() => {
                      setCurrentView(option.value);
                      playClick();
                    }}
                    className={cn(
                      'relative z-10 flex cursor-pointer items-center gap-2 rounded-(--progress-tabs-shared-radius) px-6 pt-3 pb-5 text-sm font-semibold transition-colors duration-300',
                      isSelected
                        ? 'text-(--background-color)'
                        : 'text-(--secondary-color) hover:text-(--main-color)',
                    )}
                  >
                    {option.icon}
                    <span className='max-sm:hidden'>{option.label}</span>
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      <div className='w-full'>
        {currentView === 'statistics' && <SimpleProgress />}
        {currentView === 'streak' && <StreakProgress />}
        {currentView === 'achievements' && <AchievementProgress />}
      </div>
    </div>
  );
};

export default ProgressTabs;
