'use client';

import clsx from 'clsx';
import { cardBorderStyles } from '@/shared/utils/styles';
import type { IKanjiObj } from '@/features/Kanji/store/useKanjiStore';
import { useAudioPreferences, useThemePreferences } from '@/features/Preferences';
import { useJapaneseTTS } from '@/features/Preferences/hooks/useJapaneseTTS';
import FuriganaText from '@/shared/ui-composite/text/FuriganaText';
import { useClick } from '@/shared/hooks/generic/useAudio';
import { removeVerbDuplicates } from '@/shared/utils/meanings';
import { Volume2 } from 'lucide-react';
import { memo, useCallback } from 'react';

type KanjiSetDictionaryProps = {
  words: IKanjiObj[];
};

const KanjiSetDictionary = memo(function KanjiSetDictionary({
  words,
}: KanjiSetDictionaryProps) {
  const { playClick } = useClick();
  const { displayKana: showKana } = useThemePreferences();
  const { pronunciationEnabled, pronunciationSpeed, pronunciationPitch } =
    useAudioPreferences();
  const { speak, refreshVoices } = useJapaneseTTS();

  const playReadingPronunciation = useCallback(
    async (reading: string) => {
      const normalizedReading = reading.trim();
      if (!pronunciationEnabled || !normalizedReading) return;

      if (typeof window !== 'undefined') {
        refreshVoices();
        const isFirefox = /Firefox/i.test(navigator.userAgent);
        const delay = isFirefox ? 300 : 100;
        await new Promise(resolve => setTimeout(resolve, delay));
      }

      await speak(normalizedReading, {
        rate: pronunciationSpeed,
        pitch: pronunciationPitch,
        volume: 0.8,
      });
    },
    [
      pronunciationEnabled,
      pronunciationPitch,
      pronunciationSpeed,
      refreshVoices,
      speak,
    ],
  );

  return (
    <div className={clsx('flex flex-col')}>
      {words.map((kanjiObj, i) => (
        <div
          key={kanjiObj.id}
          className={clsx(
            'flex flex-col items-center justify-start gap-2 py-4 max-md:px-4',
            i !== words.length - 1 && 'border-b-1 border-(--border-color)',
          )}
        >
          <div className='flex w-full flex-row gap-4'>
            <a
              className='group relative flex aspect-square w-full max-w-[100px] items-center justify-center hover:cursor-pointer'
              href={`http://kanjiheatmap.com/?open=${kanjiObj.kanjiChar}`}
              rel='noopener'
              target='_blank'
              onClick={() => {
                playClick();
              }}
            >
              {/* 4-segment square background */}
              <div className='absolute inset-0 grid grid-cols-2 grid-rows-2 rounded-xl border-1 border-(--border-color) bg-(--background-color) transition-all group-hover:bg-(--card-color)'>
                <div className='border-r border-b border-(--border-color)'></div>
                <div className='border-b border-(--border-color)'></div>
                <div className='border-r border-(--border-color)'></div>
                <div className=''></div>
              </div>

              <FuriganaText
                text={kanjiObj.kanjiChar}
                reading={kanjiObj.onyomi[0] || kanjiObj.kunyomi[0]}
                className='relative z-10 pb-2 text-7xl'
                lang='ja'
              />
            </a>

            <div className='flex w-full flex-col gap-1'>
              {kanjiObj.onyomi.length > 0 && kanjiObj.onyomi[0] !== '' && (
                <a
                  className='hover:text-underline w-full text-xs text-(--main-color)/80 hover:text-(--main-color)'
                  href='https://lingopie.com/blog/onyomi-vs-kunyomi/'
                  target='_blank'
                  rel='noopener'
                  onClick={() => {
                    playClick();
                  }}
                >
                  On{/* &apos;yomi */}
                </a>
              )}
              <div
                className={clsx(
                  'h-1/2',
                  'rounded-xl bg-(--background-color)',
                  'flex flex-row gap-2',
                  // 'border-1 border-(--border-color)',
                  (kanjiObj.onyomi[0] === '' || kanjiObj.onyomi.length === 0) &&
                    'hidden',
                )}
              >
                {kanjiObj.onyomi.slice(0, 2).map((onyomiReading, i) => {
                  const pronunciation = onyomiReading.split(' ')[1] || onyomiReading;

                  return (
                    <button
                      type='button'
                      key={onyomiReading}
                      onClick={() => {
                        void playReadingPronunciation(pronunciation);
                      }}
                      disabled={
                        !pronunciationEnabled || !pronunciation.trim()
                      }
                      className={clsx(
                        'group flex w-full flex-row items-center justify-center bg-transparent px-2 py-1.5 text-sm md:text-base',
                        'w-full text-(--secondary-color)',
                        pronunciationEnabled &&
                          pronunciation.trim() &&
                          'hover:cursor-pointer md:hover:text-(--main-color)',
                        (!pronunciationEnabled || !pronunciation.trim()) &&
                          'cursor-not-allowed opacity-70',
                        i < kanjiObj.onyomi.slice(0, 2).length - 1 &&
                          'border-r-1 border-(--border-color)',
                      )}
                      aria-label={`Play pronunciation for ${kanjiObj.kanjiChar} on'yomi ${pronunciation}`}
                    >
                      <div className='flex items-center gap-1.75 sm:gap-2'>
                        <span>
                          {showKana
                            ? pronunciation
                            : onyomiReading.split(' ')[0]}
                        </span>
                        <span
                          className={clsx(
                            'flex h-6 w-6 items-center justify-center rounded-full bg-(--card-color) text-(--main-color)',
                            'transition-colors duration-200',
                            pronunciationEnabled &&
                              pronunciation.trim() &&
                              'md:group-hover:bg-(--main-color)/15',
                          )}
                        >
                          <Volume2 size={15} className='fill-current' />
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
              {kanjiObj.kunyomi.length > 0 && kanjiObj.kunyomi[0] !== '' && (
                <a
                  className='hover:text-underline w-full text-xs text-(--main-color)/80 hover:text-(--main-color)'
                  href='https://lingopie.com/blog/onyomi-vs-kunyomi/'
                  target='_blank'
                  rel='noopener'
                  onClick={() => {
                    playClick();
                  }}
                >
                  Kun{/* &apos;yomi */}
                </a>
              )}

              <div
                className={clsx(
                  'h-1/2',
                  'rounded-xl bg-(--background-color)',
                  'flex flex-row gap-2',

                  // 'border-1 border-(--border-color)',
                  (kanjiObj.kunyomi[0] === '' ||
                    kanjiObj.kunyomi.length === 0) &&
                    'hidden',
                )}
              >
                {kanjiObj.kunyomi.slice(0, 2).map((kunyomiReading, i) => {
                  const pronunciation = kunyomiReading.split(' ')[1] || kunyomiReading;

                  return (
                    <button
                      type='button'
                      key={kunyomiReading}
                      onClick={() => {
                        void playReadingPronunciation(pronunciation);
                      }}
                      disabled={
                        !pronunciationEnabled || !pronunciation.trim()
                      }
                      className={clsx(
                        'group flex w-full flex-row items-center justify-center bg-transparent px-2 py-1.5 text-sm md:text-base',
                        'w-full text-(--secondary-color)',
                        pronunciationEnabled &&
                          pronunciation.trim() &&
                          'hover:cursor-pointer md:hover:text-(--main-color)',
                        (!pronunciationEnabled || !pronunciation.trim()) &&
                          'cursor-not-allowed opacity-70',
                        i < kanjiObj.kunyomi.slice(0, 2).length - 1 &&
                          'border-r-1 border-(--border-color)',
                      )}
                      aria-label={`Play pronunciation for ${kanjiObj.kanjiChar} kun'yomi ${pronunciation}`}
                    >
                      <div className='flex items-center gap-1.75 sm:gap-2'>
                        <span>
                          {showKana
                            ? pronunciation
                            : kunyomiReading.split(' ')[0]}
                        </span>
                        <span
                          className={clsx(
                            'flex h-6 w-6 items-center justify-center rounded-full bg-(--card-color) text-(--main-color)',
                            'transition-colors duration-200',
                            pronunciationEnabled &&
                              pronunciation.trim() &&
                              'md:group-hover:bg-(--main-color)/15',
                          )}
                        >
                          <Volume2 size={15} className='fill-current' />
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <p className='w-full text-xl text-(--secondary-color) md:text-2xl'>
            {removeVerbDuplicates(kanjiObj.meanings).join(', ')}
          </p>
        </div>
      ))}
    </div>
  );
});

export default KanjiSetDictionary;


