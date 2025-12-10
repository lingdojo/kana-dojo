'use client';
import clsx from 'clsx';
import Banner from '@/shared/components/Menu/Banner';
import Themes from './Themes';
import Fonts from './Fonts';
import Behavior from './Behavior';
import Backup from './Backup';
import GoalTimers from './GoalTimers';
import {
  Joystick,
  Sparkles,
  CaseSensitive,
  Blocks,
  Palette,
  Target,
} from 'lucide-react';
import Sidebar from '@/shared/components/Menu/Sidebar';

const Settings = () => {
  return (
    <div className="min-h-[100dvh] max-w-[100dvw] lg:pr-20 flex gap-0">
      <Sidebar />
      <div
        className={clsx(
          'flex flex-col gap-4',
          'w-full lg:w-4/5 px-4 md:px-8',
          'pb-20'
        )}
      >
        <Banner />
        <div className="flex flex-col gap-8 ">
          <div className="flex flex-col gap-4 ">
            <h3 className="flex flex-row text-3xl gap-2 items-center border-b-2  py-6 border-[var(--border-color)]">
              <Joystick />
              <span>Behavior</span>
            </h3>
            <Behavior />
          </div>
          <div className="flex flex-col gap-4">
            <h3 className="flex flex-row text-3xl gap-2 items-center border-b-2 py-6 border-[var(--border-color)]">
              <Palette size={28} />
              <span>Display</span>
            </h3>
            <h3 className="flex flex-row text-2xl gap-2 items-center pb-2 border-b-1 border-[var(--border-color)] ">
              <Sparkles />
              <span>Themes</span>
            </h3>
            <Themes />
          </div>
          <div className="flex flex-col gap-4">
            <h3 className="flex flex-row text-2xl gap-2 items-end pb-2 border-b-1 border-[var(--border-color)]">
              <CaseSensitive size={32} />
              <span>Fonts</span>
            </h3>
            <Fonts />
          </div>
          <div className="flex flex-col gap-4">
            <h3 className="flex flex-row text-2xl gap-2 items-center pb-2 border-b-1 border-[var(--border-color)]">
              <Target size={28} />
              <span>Goal Timers</span>
            </h3>
            <GoalTimers />
          </div>
          <div className="flex flex-col gap-4">
            <h3 className="flex flex-row text-2xl gap-2 items-end pb-2 border-b-1 border-[var(--border-color)]">
              <span>Backup</span>
            </h3>
            <Backup />
          </div>

          <div className="flex flex-col gap-4 mb-12">
            <h3
              className={clsx(
                'flex flex-row text-3xl gap-2 items-end',
                'border-b-0  py-6 border-[var(--border-color)]'
              )}
            >
              <Blocks size={32} />
              <span>Coming Soon...</span>
            </h3>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
