'use client';

import clsx from 'clsx';
import { toKana, toRomaji } from 'wanakana';
import { IWord } from '@/shared/types/interfaces';
import { cardBorderStyles } from '@/shared/lib/styles';
import { useThemePreferences } from '@/features/Preferences';
import FuriganaText from '@/shared/components/text/FuriganaText';
import { memo } from 'react';

type SetDictionaryProps = {
  words: IWord[];
};

const SetDictionary = memo(function SetDictionary({
  words,
}: SetDictionaryProps) {
  const { displayKana: showKana } = useThemePreferences();

  return (
    <div className={clsx('flex flex-col')}>
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
              <span
                className={clsx(
                  'flex flex-row items-center rounded-xl px-2 py-1',
                  'bg-(--background-color) text-lg',
                  'text-(--secondary-color)',
                )}
              >
                {/* {toRomaji(rawReading) + ' ' + rawReading} */}
                {displayReading}
              </span>
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
