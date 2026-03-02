'use client';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import SimpleProgress from './SimpleProgress';
import StreakProgress from './StreakProgress';
import AchievementProgress from '@/features/Achievements/components';
import { TrendingUp, Flame, Trophy } from 'lucide-react';
import { useClick } from '@/shared/hooks/useAudio';
import { cn } from '@/shared/lib/utils';
import dynamic from 'next/dynamic';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';

const isDevOrPreview =
  process.env.NODE_ENV === 'development' ||
  process.env.NEXT_PUBLIC_VERCEL_ENV === 'preview';

const DevAchievementPreview = isDevOrPreview
  ? dynamic(
      () =>
        import('@/features/Achievements/components/dev/DevAchievementPreview'),
      { ssr: false },
    )
  : null;

type ViewType = 'statistics' | 'streak' | 'achievements';

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
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const tabParam = searchParams.get('tab') as ViewType | null;

  const [currentView, setCurrentView] = useState<ViewType>('statistics');

  useEffect(() => {
    if (
      tabParam &&
      ['statistics', 'streak', 'achievements'].includes(tabParam)
    ) {
      setCurrentView(tabParam);
    }
  }, [tabParam]);

  const [layout, setLayout] = useState<{
    top: number;
    left: number | string;
    width: number | string;
  }>({
    top: 0,
    left: 0,
    width: '100%',
  });

  useEffect(() => {
    const updateLayout = () => {
      const sidebar = document.getElementById('main-sidebar');
      const width = window.innerWidth;

      const top = 0;
      let left: number | string = 0;
      let barWidth: number | string = '100%';

      // Calculate Horizontal Layout
      if (width >= 1024) {
        // Desktop: Stretch from sidebar's right edge to viewport right edge
        if (sidebar) {
          const sidebarRect = sidebar.getBoundingClientRect();
          left = sidebarRect.right;
          barWidth = width - sidebarRect.right;
        }
      } else {
        // Mobile: Full width
        left = 0;
        barWidth = '100%';
      }

      setLayout({ top, left, width: barWidth });
    };

    updateLayout();

    let observer: ResizeObserver | null = null;
    const sidebar = document.getElementById('main-sidebar');

    if (sidebar) {
      observer = new ResizeObserver(() => {
        updateLayout();
      });
      observer.observe(sidebar);
    }

    window.addEventListener('resize', updateLayout);

    return () => {
      window.removeEventListener('resize', updateLayout);
      if (observer) {
        observer.disconnect();
      }
    };
  }, []);

  return (
    <div className='flex flex-col'>
      {DevAchievementPreview && <DevAchievementPreview />}

      {/* Fixed Sticky Header for Tabs */}
      <div
        style={{
          top: `${layout.top}px`,
          left:
            typeof layout.left === 'number' ? `${layout.left}px` : layout.left,
          width:
            typeof layout.width === 'number'
              ? `${layout.width}px`
              : layout.width,
        }}
        className='fixed z-30 flex border-b-2 border-(--border-color) bg-(--card-color)'
      >
        {viewOptions.map(option => {
          const isSelected = currentView === option.value;
          return (
            <button
              key={option.value}
              onClick={() => {
                setCurrentView(option.value);
                router.replace(`${pathname}?tab=${option.value}`, {
                  scroll: false,
                });
                playClick();
              }}
              className={cn(
                'relative flex flex-1 cursor-pointer items-center justify-center gap-2 py-4 text-sm font-semibold transition-colors duration-300',
                isSelected
                  ? 'text-(--main-color)'
                  : 'text-(--secondary-color) hover:text-(--main-color)',
              )}
            >
              {option.icon}
              <span className='max-sm:hidden'>{option.label}</span>

              {isSelected && (
                <motion.div
                  layoutId='activeProgressTabBorder'
                  className='absolute right-0 bottom-[-2px] left-0 h-[2px] bg-(--main-color)'
                  transition={{
                    type: 'spring',
                    stiffness: 300,
                    damping: 30,
                  }}
                />
              )}
            </button>
          );
        })}
      </div>

      {/* Spacer to prevent content from hiding under the fixed header */}
      <div className='h-[64px] shrink-0' />

      <div className='mt-4 flex w-full flex-col gap-8'>
        {currentView === 'statistics' && <SimpleProgress />}
        {currentView === 'streak' && <StreakProgress />}
        {currentView === 'achievements' && <AchievementProgress />}
      </div>
    </div>
  );
};

export default ProgressTabs;
