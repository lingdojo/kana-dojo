'use client';

import clsx from 'clsx';
import { toKana, toRomaji } from 'wanakana';
import { IWord } from '@/shared/types/interfaces';
import {
  useAudioPreferences,
  useThemePreferences,
} from '@/features/Preferences';
import { useJapaneseTTS } from '@/features/Preferences/hooks/useJapaneseTTS';
import FuriganaText from '@/shared/ui-composite/text/FuriganaText';
import { Volume2 } from 'lucide-react';
import { memo, useCallback, useState } from 'react';
import JapaneseVoiceNotice from '@/shared/ui-composite/audio/JapaneseVoiceNotice';

type SetDictionaryProps = {
  words: IWord[];
};

const SetDictionary = memo(function SetDictionary({
  words,
}: SetDictionaryProps) {
  const { displayKana: showKana } = useThemePreferences();
  const { pronunciationEnabled, pronunciationSpeed, pronunciationPitch } =
    useAudioPreferences();
  const {
    speak,
    stop,
    isPlaying,
    refreshVoices,
    voicesLoaded,
    hasJapaneseVoices,
  } = useJapaneseTTS();
  const [hasRequestedPronunciation, setHasRequestedPronunciation] =
    useState(false);
  const [activePronunciationText, setActivePronunciationText] = useState<
    string | null
  >(null);

  const playReadingPronunciation = useCallback(
    async (reading: string) => {
      const normalizedReading = reading.trim();
      if (!pronunciationEnabled || !normalizedReading) return;

      if (isPlaying && activePronunciationText === normalizedReading) {
        stop();
        setActivePronunciationText(null);
        return;
      }

      setHasRequestedPronunciation(true);
      setActivePronunciationText(normalizedReading);

      if (typeof window !== 'undefined') {
        refreshVoices();
      }

      await speak(normalizedReading, {
        rate: pronunciationSpeed,
        pitch: pronunciationPitch,
        volume: 0.8,
      });

      setActivePronunciationText(current =>
        current === normalizedReading ? null : current,
      );
    },
    [
      activePronunciationText,
      isPlaying,
      pronunciationEnabled,
      pronunciationPitch,
      pronunciationSpeed,
      refreshVoices,
      speak,
      stop,
    ],
  );

  return (
    <div className={clsx('flex flex-col')}>
      <JapaneseVoiceNotice
        requested={hasRequestedPronunciation}
        voicesLoaded={voicesLoaded}
        hasJapaneseVoices={hasJapaneseVoices}
        onDismiss={() => setHasRequestedPronunciation(false)}
      />
      {words.map((wordObj, i) => {
        const rawReading =
          typeof wordObj.reading === 'string' ? wordObj.reading : '';
        const baseReading = rawReading.split(' ')[1] || rawReading;
        const displayReading = showKana
          ? toKana(baseReading)
          : toRomaji(baseReading);

        return (
          <div
            key={`${wordObj.word}-${i}`}
            className={clsx(
              'flex flex-col items-start justify-start gap-4 py-4 max-md:px-4',
              i !== words.length - 1 && 'border-b-1 border-(--border-color)',
            )}
          >
            <a
              href={`https://jisho.org/search/${encodeURIComponent(
                wordObj.word,
              )}`}
              target='_blank'
              rel='noopener'
              className='cursor-pointer transition-opacity'
            >
              <FuriganaText
                text={wordObj.word}
                reading={wordObj.reading}
                className='text-6xl md:text-5xl'
                lang='ja'
              />
            </a>
            <div className='flex flex-col items-start gap-2'>
              <button
                type='button'
                onClick={() => {
                  void playReadingPronunciation(baseReading);
                }}
                disabled={!pronunciationEnabled || !baseReading.trim()}
                className={clsx(
                  'group flex flex-row items-center gap-1.5 rounded-xl px-2 py-1',
                  'bg-(--background-color) text-lg',
                  'text-(--secondary-color)',
                  'transition-colors duration-200',
                  pronunciationEnabled &&
                    baseReading.trim() &&
                    'hover:cursor-pointer md:hover:text-(--main-color)',
                  (!pronunciationEnabled || !baseReading.trim()) &&
                    'cursor-not-allowed opacity-70',
                )}
                aria-label={`Play pronunciation for ${wordObj.word}`}
              >
                <span>{displayReading}</span>
                <span
                  className={clsx(
                    'flex h-6 w-6 items-center justify-center rounded-full bg-(--card-color) text-(--main-color)',
                    'transition-colors duration-200',
                    'max-md:group-active:bg-(--main-color)/15',
                    'md:group-hover:bg-(--main-color)/15',
                  )}
                >
                  <Volume2 size={15} className='fill-current' />
                </span>
              </button>
              <p className='text-xl text-(--secondary-color) md:text-2xl'>
                {wordObj.meanings.join(', ')}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
});

export default SetDictionary;
