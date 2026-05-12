'use client';
import usePreferencesStore from '@/features/Preferences/store/usePreferencesStore';
import { useClick } from '@/shared/hooks/generic/useAudio';
import { AudioLines, VolumeX, Volume2 } from 'lucide-react';
import { useJapaneseTTS } from '@/features/Preferences/hooks/useJapaneseTTS';
import { ActionButton } from '@/shared/ui/components/ActionButton';
// import{Command, KeyboardOff} from 'lucide-react'
// import HotkeyReference from './HotkeyReference';

const Behavior = () => {
  const { playClick } = useClick();

  const displayKana = usePreferencesStore(state => state.displayKana);
  const setDisplayKana = usePreferencesStore(state => state.setDisplayKana);
  const silentMode = usePreferencesStore(state => state.silentMode);
  const setSilentMode = usePreferencesStore(state => state.setSilentMode);
  const pronunciationEnabled = usePreferencesStore(
    state => state.pronunciationEnabled,
  );
  const setPronunciationEnabled = usePreferencesStore(
    state => state.setPronunciationEnabled,
  );
  const pronunciationAutoPlay = usePreferencesStore(
    state => state.pronunciationAutoPlay,
  );
  const setPronunciationAutoPlay = usePreferencesStore(
    state => state.setPronunciationAutoPlay,
  );
  const furiganaEnabled = usePreferencesStore(state => state.furiganaEnabled);
  const setFuriganaEnabled = usePreferencesStore(
    state => state.setFuriganaEnabled,
  );

  // Unused but kept for future TTS voice panel
  const {
    availableVoices,
    currentVoice,
    setVoice,
    speak,
    refreshVoices,
    hasJapaneseVoices,
  } = useJapaneseTTS();

  /*   const hotkeysOn = useThemeStore(state => state.hotkeysOn);
  const setHotkeys = useThemeStore(state => state.setHotkeys);
  const hotkeys = [
    { key: 'Esc', action: 'Back' },
    { key: 'H', action: 'Home' },
    { key: 'P', action: 'Open Preferences' },
    { key: 'Enter \u23CE', action: 'Start Training' },
  ]; */

  const options = [
    {
      label: 'In the character selection menu, for readings, display:',
      value: displayKana,
      choices: [
        {
          label: <>Romaji&nbsp;🇺🇸</>,
          selectedWhen: false,
          onClick: () => setDisplayKana(false),
        },
        {
          label: <>Kana&nbsp;🇯🇵</>,
          selectedWhen: true,
          onClick: () => setDisplayKana(true),
        },
      ],
    },
    {
      label:
        'Show furigana (reading) above the character/word for kanji/vocabulary:',
      value: furiganaEnabled,
      choices: [
        {
          label: (
            <>
              <span>on</span>
              <span className='mb-0.5 text-sm'>ふり</span>
            </>
          ),
          selectedWhen: true,
          onClick: () => setFuriganaEnabled(true),
        },
        {
          label: <span>off</span>,
          selectedWhen: false,
          onClick: () => setFuriganaEnabled(false),
        },
      ],
    },
    {
      label: 'Play UI + feedback sound effects:',
      value: silentMode,
      choices: [
        {
          label: (
            <>
              <span>on</span>
              <AudioLines size={20} className='mb-0.5' />
            </>
          ),
          selectedWhen: false,
          onClick: () => setSilentMode(false),
        },
        {
          label: (
            <>
              <span>off</span>
              <VolumeX size={20} className='mb-0.5' />
            </>
          ),
          selectedWhen: true,
          onClick: () => setSilentMode(true),
        },
      ],
    },
    {
      label: 'Enable pronunciation audio:',
      value: pronunciationEnabled,
      choices: [
        {
          label: (
            <>
              <span>on</span>
              <Volume2 size={20} className='mb-0.5' />
            </>
          ),
          selectedWhen: true,
          onClick: () => setPronunciationEnabled(true),
        },
        {
          label: (
            <>
              <span>off</span>
              <VolumeX size={20} className='mb-0.5' />
            </>
          ),
          selectedWhen: false,
          onClick: () => setPronunciationEnabled(false),
        },
      ],
    },
    {
      label: 'Auto-play pronunciation for new prompts:',
      value: pronunciationAutoPlay,
      choices: [
        {
          label: (
            <>
              <span>on</span>
              <Volume2 size={20} className='mb-0.5' />
            </>
          ),
          selectedWhen: true,
          onClick: () => setPronunciationAutoPlay(true),
        },
        {
          label: (
            <>
              <span>off</span>
              <VolumeX size={20} className='mb-0.5' />
            </>
          ),
          selectedWhen: false,
          onClick: () => setPronunciationAutoPlay(false),
        },
      ],
    },
  ] as const;

  return (
    <div className='flex flex-col gap-6'>
      {options.map(({ label, value, choices }) => (
        <div key={label} className='flex flex-col gap-2'>
          <h4 className='text-lg'>{label}</h4>
          <div className='flex flex-row gap-6 p-1 md:gap-12'>
            {choices.map((choice, i) => {
              const selected = value === choice.selectedWhen;
              return (
                <ActionButton
                  key={i}
                  colorScheme={selected ? 'main' : 'secondary'}
                  borderColorScheme={selected ? 'main' : 'secondary'}
                  borderBottomThickness={16}
                  borderRadius='3xl'
                  className={`flex-1 items-end p-4 text-lg text-(--background-color) ${!selected ? 'opacity-40' : ''}`}
                  onClick={() => {
                    playClick();
                    choice.onClick();
                  }}
                >
                  {choice.label}
                </ActionButton>
              );
            })}
          </div>
        </div>
      ))}

      {/* TTS voice settings (disabled until polished)
      {pronunciationEnabled && ( ... )} */}

      {/* Theme preview & hotkeys (disabled)
      <h4 className='text-lg'>Enable theme preview on hover:</h4>
      <h4 className='text-lg'>Enable hotkeys (desktop only):</h4>
      <HotkeyReference hotkeys={hotkeys} />
      */}
    </div>
  );
};

export default Behavior;

