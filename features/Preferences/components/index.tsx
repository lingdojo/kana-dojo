'use client';
import clsx from 'clsx';
import Themes from './Themes';
import Fonts from './Fonts';
import Behavior from './Behavior';
import Backup from './Backup';
import CollapsibleSection from './CollapsibleSection';
// import GoalTimers from './GoalTimers';
import {
  Joystick,
  Sparkles,
  CaseSensitive,
  Blocks,
  Palette,
  Save,
  Wand2,
  // Target
} from 'lucide-react';
import Effects from './Effects';

const Settings = () => {
  return (
    <div className='flex flex-col gap-6'>
      {/* Behavior Section */}
      <CollapsibleSection
        title='Behavior'
        icon={<Joystick size={28} />}
        level='section'
        defaultOpen={true}
        storageKey='prefs-behavior'
      >
        <Behavior />
      </CollapsibleSection>

      {/* Display Section */}
      <CollapsibleSection
        title='Display'
        icon={<Palette size={28} />}
        level='section'
        defaultOpen={true}
        storageKey='prefs-display'
      >
        <div className='flex flex-col gap-6'>
          {/* Themes Subsection */}
          <CollapsibleSection
            title='Themes'
            icon={<Sparkles size={22} />}
            level='subsection'
            defaultOpen={true}
            storageKey='prefs-themes'
          >
            <Themes />
          </CollapsibleSection>

          {/* Fonts Subsection */}
          <CollapsibleSection
            title='Fonts'
            icon={<CaseSensitive size={28} />}
            level='subsection'
            defaultOpen={true}
            storageKey='prefs-fonts'
          >
            <Fonts />
          </CollapsibleSection>

          {/* Effects Subsection */}
          <CollapsibleSection
            title='Effects'
            icon={<Wand2 size={22} />}
            level='subsection'
            defaultOpen={true}
            storageKey='prefs-effects'
          >
            <Effects />
          </CollapsibleSection>
        </div>
      </CollapsibleSection>

      {/* Goal Timers section - commented out
      <CollapsibleSection
        title='Goal Timers'
        icon={<Target size={28} />}
        level='section'
        defaultOpen={true}
        storageKey='prefs-goal-timers'
      >
        <GoalTimers />
      </CollapsibleSection>
      */}

      {/* Backup Section - not collapsible since it's short */}
      <div className='flex flex-col gap-4'>
        <h3 className='flex flex-row items-end gap-2 border-b-1 border-(--border-color) pb-2 text-2xl'>
          <Save size={22} className='text-(--secondary-color)' />
          <span>Backup</span>
        </h3>
        <Backup />
      </div>

      {/* Coming Soon */}
      <div className='mb-12 flex flex-col gap-4'>
        <h3
          className={clsx(
            'flex flex-row items-end gap-2 border-b-0 border-(--border-color) py-6 text-3xl',
          )}
        >
          <Blocks size={32} />
          <span>Coming Soon...</span>
        </h3>
      </div>
    </div>
  );
};

export default Settings;
