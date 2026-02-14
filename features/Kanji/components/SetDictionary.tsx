'use client';

import clsx from 'clsx';
import { cardBorderStyles } from '@/shared/lib/styles';
import type { IKanjiObj } from '@/features/Kanji/store/useKanjiStore';
import { useThemePreferences } from '@/features/Preferences';
import FuriganaText from '@/shared/components/text/FuriganaText';
import { useClick } from '@/shared/hooks/useAudio';
import { memo } from 'react';

type KanjiSetDictionaryProps = {
  words: IKanjiObj[];
};

const KanjiSetDictionary = memo(function KanjiSetDictionary({
  words,
}: KanjiSetDictionaryProps) {
  const { playClick } = useClick();
  const { displayKana: showKana } = useThemePreferences();

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
                {kanjiObj.onyomi.slice(0, 2).map((onyomiReading, i) => (
                  <span
                    key={onyomiReading}
                    className={clsx(
                      'flex flex-row items-center justify-center px-2 py-1 text-sm md:text-base',
                      'w-full text-(--secondary-color)',

                      i < kanjiObj.onyomi.slice(0, 2).length - 1 &&
                        'border-r-1 border-(--border-color)',
                    )}
                  >
                    {showKana
                      ? onyomiReading.split(' ')[1]
                      : onyomiReading.split(' ')[0]}
                  </span>
                ))}
              </div>
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
                {kanjiObj.kunyomi.slice(0, 2).map((kunyomiReading, i) => (
                  <span
                    key={kunyomiReading}
                    className={clsx(
                      'flex flex-row items-center justify-center px-2 py-1 text-sm md:text-base',
                      'w-full text-(--secondary-color)',
                      i < kanjiObj.kunyomi.slice(0, 2).length - 1 &&
                        'border-r-1 border-(--border-color)',
                    )}
                  >
                    {showKana
                      ? kunyomiReading.split(' ')[1]
                      : kunyomiReading.split(' ')[0]}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <p className='w-full text-xl text-(--secondary-color) md:text-2xl'>
            {kanjiObj.meanings.join(', ')}
          </p>
        </div>
      ))}
    </div>
  );
});

export default KanjiSetDictionary;
