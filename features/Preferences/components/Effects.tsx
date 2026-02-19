'use client';
import clsx from 'clsx';
import usePreferencesStore from '@/features/Preferences/store/usePreferencesStore';
import { buttonBorderStyles } from '@/shared/lib/styles';
import { CURSOR_TRAIL_EFFECTS, CLICK_EFFECTS } from '../data/effectsData';
import CollapsibleSection from './CollapsibleSection';
import { MousePointer2, Zap } from 'lucide-react';

// ─── Effect card ─────────────────────────────────────────────────────────────

function EffectCard({
  name,
  emoji,
  isSelected,
  onSelect,
  group,
}: {
  name: string;
  emoji: string;
  isSelected: boolean;
  onSelect: () => void;
  group: 'cursor-trail' | 'click';
}) {
  return (
    <label
      className={clsx(
        'flex flex-col items-center justify-center gap-1',
        buttonBorderStyles,
        'border-1 border-(--card-color)',
        'cursor-pointer px-3 py-4',
      )}
      style={{
        outline: isSelected ? '3px solid var(--secondary-color)' : 'none',
        transition: 'background-color 275ms',
      }}
    >
      <input
        type='radio'
        name={`effect-${group}`}
        className='hidden'
        onChange={onSelect}
        checked={isSelected}
      />
      {emoji ? (
        <span className='text-3xl leading-none'>{emoji}</span>
      ) : (
        <span className='text-lg leading-none text-(--secondary-color)'>—</span>
      )}
      <span className='text-center text-sm leading-tight'>{name}</span>
    </label>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

const Effects = () => {
  const cursorTrailEffect = usePreferencesStore(s => s.cursorTrailEffect);
  const setCursorTrailEffect = usePreferencesStore(s => s.setCursorTrailEffect);
  const clickEffect = usePreferencesStore(s => s.clickEffect);
  const setClickEffect = usePreferencesStore(s => s.setClickEffect);

  return (
    <div className='flex flex-col gap-6'>
      {/* Cursor Trail — desktop only */}
      <CollapsibleSection
        title={
          <span className='flex items-center gap-2'>
            Cursor Trail
            <span className='rounded-md bg-(--card-color) px-1.5 py-0.5 text-xs text-(--secondary-color)'>
              desktop only
            </span>
          </span>
        }
        icon={<MousePointer2 size={18} />}
        level='subsubsection'
        defaultOpen={true}
        storageKey='prefs-effects-cursor'
      >
        <fieldset className='grid grid-cols-2 gap-4 p-1 md:grid-cols-3 lg:grid-cols-4'>
          {CURSOR_TRAIL_EFFECTS.map(effect => (
            <EffectCard
              key={effect.id}
              name={effect.name}
              emoji={effect.emoji}
              isSelected={cursorTrailEffect === effect.id}
              onSelect={() => setCursorTrailEffect(effect.id)}
              group='cursor-trail'
            />
          ))}
        </fieldset>
      </CollapsibleSection>

      {/* Click / Tap Effects — all devices */}
      <CollapsibleSection
        title='Click Effects'
        icon={<Zap size={18} />}
        level='subsubsection'
        defaultOpen={true}
        storageKey='prefs-effects-click'
      >
        <fieldset className='grid grid-cols-2 gap-4 p-1 md:grid-cols-3 lg:grid-cols-4'>
          {CLICK_EFFECTS.map(effect => (
            <EffectCard
              key={effect.id}
              name={effect.name}
              emoji={effect.emoji}
              isSelected={clickEffect === effect.id}
              onSelect={() => setClickEffect(effect.id)}
              group='click'
            />
          ))}
        </fieldset>
      </CollapsibleSection>
    </div>
  );
};

export default Effects;
