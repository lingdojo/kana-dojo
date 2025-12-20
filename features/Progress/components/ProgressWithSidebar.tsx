'use client';
import { useState } from 'react';
import SimpleProgress from './SimpleProgress';
import StreakProgress from './StreakProgress';
import AchievementProgress from '@/features/Achievements/components/AchievementProgress';
import { TrendingUp, Flame, Trophy } from 'lucide-react';
import { useClick } from '@/shared/hooks/useAudio';
import SidebarLayout from '@/shared/components/layout/SidebarLayout';
import { ActionButton } from '@/shared/components/ui/ActionButton';
import { cn } from '@/shared/lib/utils';

type ViewType = 'statistics' | 'streak' | 'achievements';

const viewOptions: { value: ViewType; label: string; icon: React.ReactNode }[] =
  [
    {
      value: 'statistics',
      label: 'Stats',
      icon: <TrendingUp className={cn('h-5 w-5')} />
    },
    {
      value: 'streak',
      label: 'Streak',
      icon: <Flame className={cn('h-5 w-5')} />
    },
    {
      value: 'achievements',
      label: 'Achievements',
      icon: <Trophy className={cn('h-5 w-5')} />
    }
  ];

const ProgressWithSidebar = () => {
  const { playClick } = useClick();
  const [currentView, setCurrentView] = useState<ViewType>('statistics');

  return (
    <SidebarLayout>
      {/* View Toggle Switch */}
      <div className={cn('flex justify-center px-2')}>
        <div
          className={cn(
            'inline-flex flex-wrap justify-center gap-2 rounded-2xl border border-[var(--border-color)] bg-[var(--card-color)] p-2 max-sm:w-full'
          )}
        >
          {viewOptions.map(option => {
            const isSelected = currentView === option.value;
            return (
              <ActionButton
                key={option.value}
                onClick={() => {
                  setCurrentView(option.value);
                  playClick();
                }}
                colorScheme={isSelected ? 'main' : undefined}
                borderColorScheme={isSelected ? 'main' : undefined}
                borderBottomThickness={isSelected ? 6 : 0}
                className={cn(
                  'w-auto gap-1.5 px-5 py-2.5 text-sm sm:gap-2',
                  !isSelected &&
                    'bg-transparent text-[var(--secondary-color)] hover:bg-[var(--border-color)]/50 hover:text-[var(--main-color)]'
                )}
              >
                {option.icon}
                <span className={cn('max-sm:hidden')}>{option.label}</span>
              </ActionButton>
            );
          })}
        </div>
      </div>
      {currentView === 'statistics' && <SimpleProgress />}
      {currentView === 'streak' && <StreakProgress />}
      {currentView === 'achievements' && <AchievementProgress />}
    </SidebarLayout>
  );
};

export default ProgressWithSidebar;
