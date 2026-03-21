'use client';
import clsx from 'clsx';
import usePreferencesStore from '@/features/Preferences/store/usePreferencesStore';
import { buttonBorderStyles } from '@/shared/lib/styles';
import { useHasFinePointer } from '@/shared/hooks/useHasFinePointer';
import { EFFECTS, CLICK_EFFECTS } from '../../data/effects/effectsData';
import { CLICK_SOUND_OPTIONS } from '../../data/audio/clickSounds';
import CollapsibleSection from '../shared/CollapsibleSection';
import { MousePointer2, Volume2, Zap } from 'lucide-react';
import { useClick } from '@/shared/hooks/useAudio';

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
        'flex h-20 flex-col items-center justify-center gap-1',
        buttonBorderStyles,
        'rounded-3xl',
        'border border-(--card-color)',
        'cursor-pointer px-2 py-2.5',
      )}
      style={{
        backgroundColor: isSelected ? 'var(--secondary-color)' : undefined,
        transition: 'background-color 275ms',
      }}
    >
      <input
        type='radio'
        name={`effect-${group}`}
        className='hidden'
        onChange={onSelect}
        checked={isSelected}
        aria-label={name}
      />
      {emoji ? (
        <span className='text-4xl leading-none'>{emoji}</span>
      ) : (
        <span className='text-lg leading-none text-(--secondary-color)'>-</span>
      )}
      {/* TEMP: hide effect names in cards */}
      {/* <span className='text-center text-xs leading-tight'>{name}</span> */}
    </label>
  );
}

function SoundEffectCard({
  name,
  isSelected,
  onSelect,
}: {
  name: string;
  isSelected: boolean;
  onSelect: () => void;
}) {
  return (
    <label
      className={clsx(
        'flex min-h-20 items-center justify-center text-center',
        buttonBorderStyles,
        'rounded-3xl border border-(--card-color) px-3 py-4',
        'cursor-pointer',
      )}
      style={{
        backgroundColor: isSelected ? 'var(--secondary-color)' : undefined,
        transition: 'background-color 275ms',
      }}
    >
      <input
        type='radio'
        name='effect-sound'
        className='hidden'
        onChange={onSelect}
        checked={isSelected}
        aria-label={name}
      />
      <span
        className='text-lg leading-tight'
        style={{
          color: isSelected ? 'var(--background-color)' : 'var(--main-color)',
          transition: 'color 275ms',
        }}
      >
        {name.toLowerCase()}
      </span>
    </label>
  );
}

const Effects = () => {
  const hasFinePointer = useHasFinePointer();
  const { playClickById } = useClick();
  const cursorTrailEffect = usePreferencesStore(s => s.cursorTrailEffect);
  const setCursorTrailEffect = usePreferencesStore(s => s.setCursorTrailEffect);
  const clickEffect = usePreferencesStore(s => s.clickEffect);
  const setClickEffect = usePreferencesStore(s => s.setClickEffect);
  const clickSoundId = usePreferencesStore(s => s.clickSoundId);
  const setClickSoundId = usePreferencesStore(s => s.setClickSoundId);

  return (
    <div className='flex flex-col gap-6'>
      <CollapsibleSection
        title='Sound Effects'
        icon={<Volume2 size={18} />}
        level='subsection'
        defaultOpen={true}
        storageKey='prefs-effects-click-sounds'
      >
        <fieldset className='grid grid-cols-2 gap-3 p-1 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5'>
          {CLICK_SOUND_OPTIONS.map(option => {
            const isSelected = clickSoundId === option.id;
            return (
              <SoundEffectCard
                key={option.id}
                name={option.label}
                isSelected={isSelected}
                onSelect={() => {
                  setClickSoundId(option.id);
                  playClickById(option.id);
                }}
              />
            );
          })}
        </fieldset>
      </CollapsibleSection>

      {hasFinePointer && (
        <CollapsibleSection
          title='Cursor Trail'
          icon={<MousePointer2 size={18} />}
          level='subsection'
          defaultOpen={true}
          storageKey='prefs-effects-cursor'
        >
          <fieldset className='grid grid-cols-4 gap-3 p-1 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-7'>
            {EFFECTS.map(effect => (
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
      )}

      <CollapsibleSection
        title='Click Effects'
        icon={<Zap size={18} />}
        level='subsection'
        defaultOpen={true}
        storageKey='prefs-effects-click'
      >
        <fieldset className='grid grid-cols-4 gap-3 p-1 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-7'>
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
