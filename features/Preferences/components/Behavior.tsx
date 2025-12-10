'use client';
import clsx from 'clsx';
import { buttonBorderStyles } from '@/shared/lib/styles';
import usePreferencesStore from '@/features/Preferences/store/usePreferencesStore';
import { useClick } from '@/shared/hooks/useAudio';
import {
  AudioLines,
  VolumeX,
  Volume2,
  RefreshCw,
  Play,
  Zap,
  ZapOff
} from 'lucide-react';
import useCrazyModeStore from '@/features/CrazyMode/store/useCrazyModeStore';
import { useJapaneseTTS } from '@/shared/hooks/useJapaneseTTS';
// import{Command, KeyboardOff} from 'lucide-react'
// import HotkeyReference from './HotkeyReference';

const Behavior = () => {
  const { playClick } = useClick();

  const displayKana = usePreferencesStore(state => state.displayKana);
  const setDisplayKana = usePreferencesStore(state => state.setDisplayKana);

  const silentMode = usePreferencesStore(state => state.silentMode);
  const setSilentMode = usePreferencesStore(state => state.setSilentMode);

  // Pronunciation settings
  const pronunciationEnabled = usePreferencesStore(
    state => state.pronunciationEnabled
  );
  const setPronunciationEnabled = usePreferencesStore(
    state => state.setPronunciationEnabled
  );
  const pronunciationSpeed = usePreferencesStore(
    state => state.pronunciationSpeed
  );
  const setPronunciationSpeed = usePreferencesStore(
    state => state.setPronunciationSpeed
  );
  const pronunciationPitch = usePreferencesStore(
    state => state.pronunciationPitch
  );
  const setPronunciationPitch = usePreferencesStore(
    state => state.setPronunciationPitch
  );
  const furiganaEnabled = usePreferencesStore(state => state.furiganaEnabled);
  const setFuriganaEnabled = usePreferencesStore(
    state => state.setFuriganaEnabled
  );
  const themePreview = usePreferencesStore(state => state.themePreview);
  const setThemePreview = usePreferencesStore(state => state.setThemePreview);

  type Prefs = ReturnType<typeof usePreferencesStore.getState>;
  const pronunciationVoiceName = usePreferencesStore(
    (state: Prefs) => state.pronunciationVoiceName
  );
  const setPronunciationVoiceName = usePreferencesStore(
    (state: Prefs) => state.setPronunciationVoiceName
  );

  const {
    availableVoices,
    currentVoice,
    setVoice,
    speak,
    refreshVoices,
    hasJapaneseVoices
  } = useJapaneseTTS();

  /*   const hotkeysOn = useThemeStore(state => state.hotkeysOn);
  const setHotkeys = useThemeStore(state => state.setHotkeys);

  const hotkeys = [
    { key: 'Esc', action: 'Back' },
    { key: 'H', action: 'Home' },
    { key: 'P', action: 'Open Preferences' },
    { key: 'Enter \u23CE', action: 'Start Training' },
  ]; */

  return (
    <div className='flex flex-col gap-4'>
      <h4 className='text-lg'>
        In the character selection menu, for readings, display:
      </h4>
      <div className='flex flex-row gap-4'>
        <button
          className={clsx(
            buttonBorderStyles,
            'text-center text-lg',
            'w-1/2 md:w-1/4 p-4',
            'text-[var(--secondary-color)]',
            'flex-1 overflow-hidden'
          )}
          onClick={() => {
            playClick();
            setDisplayKana(false);
          }}
        >
          <span className='text-[var(--main-color)]'>
            {!displayKana && '\u2B24 '}
          </span>
          Romaji&nbsp;🇺🇸
        </button>
        <button
          className={clsx(
            buttonBorderStyles,
            'text-center text-lg',
            'w-1/2 md:w-1/4 p-4',
            'text-[var(--secondary-color)]',
            'flex-1 overflow-hidden'
          )}
          onClick={() => {
            playClick();
            setDisplayKana(true);
          }}
        >
          <span className='text-[var(--main-color)]'>
            {displayKana && '\u2B24 '}
          </span>
          Kana&nbsp;🇯🇵
        </button>
      </div>
      <h4 className='text-lg'>
        Show furigana (reading) above the character/word for kanji/vocabulary:
      </h4>
      <div className='flex flex-row gap-4'>
        <button
          className={clsx(
            buttonBorderStyles,
            'text-center text-lg',
            'w-1/2 md:w-1/4 p-4',
            'flex flex-row gap-1.5 justify-center items-end',
            'text-[var(--secondary-color)]',
            'flex-1 overflow-hidden'
          )}
          onClick={() => {
            playClick();
            setFuriganaEnabled(true);
          }}
        >
          <span>
            <span className='text-[var(--main-color)]'>
              {furiganaEnabled && '\u2B24 '}
            </span>
            on
          </span>
          <span className='text-sm mb-0.5'>ふり</span>
        </button>
        <button
          className={clsx(
            buttonBorderStyles,
            'text-center text-lg',
            'w-1/2 md:w-1/4 p-4',
            'flex flex-row gap-1.5 justify-center items-end',
            'text-[var(--secondary-color)]',
            'flex-1 overflow-hidden'
          )}
          onClick={() => {
            playClick();
            setFuriganaEnabled(false);
          }}
        >
          <span>
            <span className='text-[var(--main-color)]'>
              {!furiganaEnabled && '\u2B24 '}
            </span>
            off
          </span>
        </button>
      </div>

      <h4 className='text-lg'>Play UI + feedback sound effects:</h4>
      <div className='flex flex-row gap-4'>
        <button
          className={clsx(
            buttonBorderStyles,
            'text-center text-lg',
            'w-1/2 md:w-1/4 p-4',
            'flex flex-row gap-1.5 justify-center items-end',
            'text-[var(--secondary-color)]',
            'flex-1 overflow-hidden'
          )}
          onClick={() => {
            playClick();
            setSilentMode(false);
          }}
        >
          <span>
            <span className='text-[var(--main-color)]'>
              {!silentMode && '\u2B24 '}
            </span>
            on
          </span>
          <AudioLines size={20} className='mb-0.5' />
        </button>
        <button
          className={clsx(
            buttonBorderStyles,
            'text-center text-lg',
            'w-1/2 md:w-1/4 p-4',
            'flex flex-row gap-1.5 justify-center items-end',
            'text-[var(--secondary-color)]',
            'flex-1 overflow-hidden'
          )}
          onClick={() => {
            playClick();
            setSilentMode(true);
          }}
        >
          <span>
            <span className='text-[var(--main-color)]'>
              {silentMode && '\u2B24 '}
            </span>
            off
          </span>
          <VolumeX size={20} className='mb-0.5' />
        </button>
      </div>

      <h4 className='text-lg'>Enable pronunciation audio:</h4>
      <div className='flex flex-row gap-4'>
        <button
          className={clsx(
            buttonBorderStyles,
            'text-center text-lg',
            'w-1/2 md:w-1/4 p-4',
            'flex flex-row gap-1.5 justify-center items-end',
            'text-[var(--secondary-color)]',
            'flex-1 overflow-hidden'
          )}
          onClick={() => {
            playClick();
            setPronunciationEnabled(true);
          }}
        >
          <span>
            <span className='text-[var(--main-color)]'>
              {pronunciationEnabled && '\u2B24 '}
            </span>
            on
          </span>
          <Volume2 size={20} className='mb-0.5' />
        </button>
        <button
          className={clsx(
            buttonBorderStyles,
            'text-center text-lg',
            'w-1/2 md:w-1/4 p-4',
            'flex flex-row gap-1.5 justify-center items-end',
            'text-[var(--secondary-color)]',
            'flex-1 overflow-hidden'
          )}
          onClick={() => {
            playClick();
            setPronunciationEnabled(false);
          }}
        >
          <span>
            <span className='text-[var(--main-color)]'>
              {!pronunciationEnabled && '\u2B24 '}
            </span>
            off
          </span>
          <VolumeX size={20} className='mb-0.5' />
        </button>
      </div>

      {pronunciationEnabled && (
        <>
          <h4 className='text-lg'>Pronunciation speed:</h4>
          <div className='flex flex-col gap-2'>
            <input
              type='range'
              min='0.5'
              max='1.5'
              step='0.1'
              value={pronunciationSpeed}
              onChange={e => setPronunciationSpeed(parseFloat(e.target.value))}
              className='w-full'
            />
            <div className='text-sm text-[var(--secondary-color)] text-center'>
              {pronunciationSpeed}x
            </div>
          </div>

          <h4 className='text-lg'>Pronunciation pitch:</h4>
          <div className='flex flex-col gap-2'>
            <input
              type='range'
              min='0.5'
              max='1.5'
              step='0.1'
              value={pronunciationPitch}
              onChange={e => setPronunciationPitch(parseFloat(e.target.value))}
              className='w-full'
            />
            <div className='text-sm text-[var(--secondary-color)] text-center'>
              {pronunciationPitch}x
            </div>
          </div>

          <h4 className='text-lg'>Pronunciation voice:</h4>
          <div className='flex flex-col gap-2'>
            <div className='flex gap-2 items-center'>
              <select
                className={clsx(buttonBorderStyles, 'p-2 flex-1')}
                value={pronunciationVoiceName || currentVoice?.name || ''}
                onChange={e => {
                  const name = e.target.value || null;
                  setPronunciationVoiceName(name);
                  const match = availableVoices.find(v => v.name === name);
                  if (match) setVoice(match);
                }}
              >
                <option value=''>Auto (best available)</option>
                {availableVoices.map(v => (
                  <option key={v.name} value={v.name}>
                    {v.name} ({v.lang})
                  </option>
                ))}
              </select>
              <button
                className={clsx(buttonBorderStyles, 'px-3 py-2')}
                onClick={() => {
                  playClick();
                  refreshVoices();
                }}
                title='Refresh voices'
              >
                <RefreshCw size={18} />
              </button>
              <button
                className={clsx(buttonBorderStyles, 'px-3 py-2')}
                onClick={async () => {
                  playClick();
                  await speak('こんにちは', {
                    rate: pronunciationSpeed,
                    pitch: pronunciationPitch,
                    volume: 0.8
                  });
                }}
                title='Test voice'
              >
                <Play size={18} />
              </button>
            </div>
            <div className='text-sm text-[var(--secondary-color)] text-center'>
              {currentVoice
                ? `${currentVoice.name} • ${currentVoice.lang}`
                : 'No voice selected'}
            </div>
            {!hasJapaneseVoices &&
              availableVoices.length > 0 &&
              (() => {
                const isFirefox =
                  typeof window !== 'undefined' &&
                  /Firefox/i.test(navigator.userAgent);
                const isChrome =
                  typeof window !== 'undefined' &&
                  /Chrome/i.test(navigator.userAgent) &&
                  !/Edge/i.test(navigator.userAgent);

                return (
                  <div className='text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 p-3 rounded-lg border border-red-200 dark:border-red-800'>
                    <strong className='block mb-2'>
                      ⚠️ Notice: No Japanese voices found
                    </strong>
                    <p className='mb-2'>
                      {isFirefox && (
                        <>
                          <strong>Firefox uses system voices</strong> - it
                          requires Japanese language packs installed on your
                          operating system. Chrome/Edge come with built-in
                          Google TTS voices (including Japanese), which is why
                          you might see Japanese voices in Chrome but not
                          Firefox.
                        </>
                      )}
                      {!isFirefox && !isChrome && (
                        <>
                          A fallback voice is being used, but pronunciation may
                          not be accurate. This is not a system issue - please
                          install Japanese language packs for your operating
                          system.
                        </>
                      )}
                      {isChrome && (
                        <>
                          Chrome usually includes Japanese voices by default. If
                          you&apos;re not seeing them, try refreshing voices or
                          check chrome://flags.
                        </>
                      )}
                    </p>
                    <details className='mt-2'>
                      <summary className='cursor-pointer font-semibold hover:underline'>
                        How to install Japanese voices:
                      </summary>
                      <div className='mt-2 pl-4 space-y-2 text-xs'>
                        {isFirefox && (
                          <div className='mb-3 p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded border border-yellow-200 dark:border-yellow-800'>
                            <strong>⚠️ Firefox-specific:</strong> Firefox relies
                            on your operating system&apos;s voices. You must
                            install Japanese language packs in your OS, then
                            restart Firefox.
                          </div>
                        )}
                        <div>
                          <strong>Windows:</strong>
                          <ol className='list-decimal list-inside ml-2 space-y-1'>
                            <li>
                              Open Settings → Time &amp; Language → Language
                            </li>
                            <li>
                              Click &quot;Add a language&quot; → Search for
                              &quot;Japanese&quot;
                            </li>
                            <li>Install Japanese language pack</li>
                            <li>Restart your browser</li>
                          </ol>
                        </div>
                        <div>
                          <strong>macOS:</strong>
                          <ol className='list-decimal list-inside ml-2 space-y-1'>
                            <li>
                              Open System Settings → General → Language &amp;
                              Region
                            </li>
                            <li>Click &quot;+&quot; to add Japanese</li>
                            <li>
                              System will download Japanese voices automatically
                            </li>
                            <li>Restart your browser</li>
                          </ol>
                        </div>
                        <div>
                          <strong>Linux (Ubuntu/Debian):</strong>
                          <ol className='list-decimal list-inside ml-2 space-y-1'>
                            <li>
                              Install speech-dispatcher:{' '}
                              <code className='bg-gray-100 dark:bg-gray-800 px-1 rounded'>
                                sudo apt install speech-dispatcher
                              </code>
                            </li>
                            <li>
                              Install espeak with Japanese:{' '}
                              <code className='bg-gray-100 dark:bg-gray-800 px-1 rounded'>
                                sudo apt install espeak espeak-data
                              </code>
                            </li>
                            <li>
                              Or install festival:{' '}
                              <code className='bg-gray-100 dark:bg-gray-800 px-1 rounded'>
                                sudo apt install festival festvox-ja
                              </code>
                            </li>
                            <li>Restart your browser</li>
                          </ol>
                        </div>
                        <div>
                          <strong>Chrome/Edge:</strong>
                          <ol className='list-decimal list-inside ml-2 space-y-1'>
                            <li>
                              Chrome includes built-in Google TTS voices
                              (including Japanese) - no installation needed
                            </li>
                            <li>
                              If voices don&apos;t appear, go to chrome://flags
                              and search for &quot;Web Speech API&quot;
                            </li>
                            <li>
                              Ensure it&apos;s enabled, then restart Chrome
                            </li>
                          </ol>
                        </div>
                        <div>
                          <strong>Firefox:</strong>
                          <ol className='list-decimal list-inside ml-2 space-y-1'>
                            <li>
                              Type{' '}
                              <code className='bg-gray-100 dark:bg-gray-800 px-1 rounded'>
                                about:config
                              </code>{' '}
                              in address bar
                            </li>
                            <li>
                              Search for{' '}
                              <code className='bg-gray-100 dark:bg-gray-800 px-1 rounded'>
                                media.webspeech.synth.enabled
                              </code>
                            </li>
                            <li>
                              Ensure it&apos;s set to{' '}
                              <code className='bg-gray-100 dark:bg-gray-800 px-1 rounded'>
                                true
                              </code>
                            </li>
                            <li>
                              <strong>
                                Install Japanese voices in your OS first
                              </strong>{' '}
                              (Firefox uses system voices)
                            </li>
                            <li>Restart Firefox</li>
                          </ol>
                        </div>
                      </div>
                    </details>
                  </div>
                );
              })()}
            {availableVoices.length === 0 && (
              <div className='text-sm text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/20 p-3 rounded-lg border border-orange-200 dark:border-orange-800'>
                <strong>⚠️ Notice:</strong> No voices are available. Please
                refresh voices or check your system and browser speech synthesis
                settings. This may be due to the operating system (e.g.,
                privacy-oriented OS without a default TTS engine) or an
                unsupported API (e.g., Opera Mobile does not support speech
                synthesis).
              </div>
            )}
          </div>
        </>
      )}

      <h4 className='text-lg'>Crazy Mode (Experimental):</h4>
      <div className='flex flex-row gap-4'>
        <button
          className={clsx(
            buttonBorderStyles,
            'text-center text-lg',
            'w-1/2 md:w-1/4 p-4',
            'flex flex-row gap-1.5 justify-center items-end',
            'text-[var(--secondary-color)]',
            'flex-1 overflow-hidden'
          )}
          onClick={() => {
            playClick();
            const currentState = useCrazyModeStore.getState().isCrazyMode;
            if (!currentState) {
              useCrazyModeStore.getState().toggleCrazyMode();
            }
          }}
        >
          <span>
            <span className='text-[var(--main-color)]'>
              {useCrazyModeStore(state => state.isCrazyMode) && '\u2B24 '}
            </span>
            on
          </span>
          <Zap size={20} className='mb-0.5' />
        </button>
        <button
          className={clsx(
            buttonBorderStyles,
            'text-center text-lg',
            'w-1/2 md:w-1/4 p-4',
            'flex flex-row gap-1.5 justify-center items-end',
            'text-[var(--secondary-color)]',
            'flex-1 overflow-hidden'
          )}
          onClick={() => {
            playClick();
            const currentState = useCrazyModeStore.getState().isCrazyMode;
            if (currentState) {
              useCrazyModeStore.getState().toggleCrazyMode();
            }
          }}
        >
          <span>
            <span className='text-[var(--main-color)]'>
              {!useCrazyModeStore(state => state.isCrazyMode) && '\u2B24 '}
            </span>
            off
          </span>
          <ZapOff size={20} className='mb-0.5' />
        </button>
      </div>
      {/* 
      <h4 className='text-lg'>Enable theme preview on hover:</h4>
      <div className='flex flex-row gap-4'>
        <button
          className={clsx(
            buttonBorderStyles,
            'text-center text-lg',
            'w-1/2 md:w-1/4 p-4',
            'flex flex-row gap-1.5 justify-center items-end',
            'text-[var(--secondary-color)]',
            'flex-1 overflow-hidden'
          )}
          onClick={() => {
            playClick();
            setThemePreview(true);
          }}
        >
          <span>
            <span className='text-[var(--main-color)]'>
              {themePreview && '\u2B24 '}
            </span>
            on
          </span>
        </button>
        <button
          className={clsx(
            buttonBorderStyles,
            'text-center text-lg',
            'w-1/2 md:w-1/4 p-4',
            'flex flex-row gap-1.5 justify-center items-end',
            'text-[var(--secondary-color)]',
            'flex-1 overflow-hidden'
          )}
          onClick={() => {
            playClick();
            setThemePreview(false);
          }}
        >
          <span>
            <span className='text-[var(--main-color)]'>
              {!themePreview && '\u2B24 '}
            </span>
            off
          </span>
        </button>
      </div>
 */}
      {/*       <h4 className="text-lg">Enable hotkeys (desktop only):</h4>
      <div className="flex flex-row gap-4">
        <button
          className={clsx(
            buttonBorderStyles,
            'text-center text-lg',
            'w-1/2 md:w-1/4 p-4',
            'flex flex-row gap-1.5 justify-center items-end',
            'text-[var(--secondary-color)]'
          )}
          onClick={() => {
            playClick();
            setHotkeys(true);
          }}
        >
          <span>
            <span className="text-[var(--main-color)]">
              {hotkeysOn && '\u2B24 '}
            </span>
            on
          </span>
          <Command
            size={20}
            className="mb-0.5"
          />
        </button>
        <button
          className={clsx(
            buttonBorderStyles,
            'text-center text-lg',
            'w-1/2 md:w-1/4 p-4',
            'flex flex-row gap-1.5 justify-center items-end',
            'text-[var(--secondary-color)]'
          )}
          onClick={() => {
            playClick();
            setHotkeys(false);
          }}
        >
          <span>
            <span className="text-[var(--main-color)]">
              {!hotkeysOn && '\u2B24 '}
            </span>
            off
          </span>
          <KeyboardOff
            size={20}
            className="mb-0.5"
          />
        </button>
      </div>
      <HotkeyReference hotkeys={hotkeys} /> */}
    </div>
  );
};

export default Behavior;
