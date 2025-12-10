'use client';

import clsx from 'clsx';
import { cardBorderStyles } from '@/shared/lib/styles';
import type { IKanjiObj } from '@/features/Kanji/store/useKanjiStore';
import usePreferencesStore from '@/features/Preferences/store/usePreferencesStore';
import FuriganaText from '@/shared/components/FuriganaText';
import { useClick } from '@/shared/hooks/useAudio';
import { memo } from 'react';

type KanjiSetDictionaryProps = {
  words: IKanjiObj[];
};

const KanjiSetDictionary = memo(function KanjiSetDictionary({
  words
}: KanjiSetDictionaryProps) {
  const { playClick } = useClick();
  const showKana = usePreferencesStore(state => state.displayKana);

  return (
    <div className={clsx('flex flex-col', cardBorderStyles)}>
      {words.map((kanjiObj, i) => (
        <div
          key={kanjiObj.id}
          className={clsx(
            'flex flex-col justify-start items-center gap-2 py-4 max-md:px-4',
            i !== words.length - 1 && 'border-b-1 border-[var(--border-color)]'
          )}
        >
          <div className='flex flex-row w-full gap-4'>
            <a
              className='relative w-full max-w-[100px] aspect-square flex items-center justify-center hover:cursor-pointer group'
              href={`http://kanjiheatmap.com/?open=${kanjiObj.kanjiChar}`}
              rel='noopener'
              target='_blank'
              onClick={() => {
                playClick();
              }}
            >
              {/* 4-segment square background */}
              <div className='absolute inset-0 grid grid-cols-2 grid-rows-2 border-1 border-[var(--border-color)] rounded-xl bg-[var(--background-color)] group-hover:bg-[var(--card-color)] transition-all'>
                <div className=' border-r border-b border-[var(--border-color)]'></div>
                <div className=' border-b border-[var(--border-color)]'></div>
                <div className=' border-r border-[var(--border-color)]'></div>
                <div className=''></div>
              </div>

              <FuriganaText
                text={kanjiObj.kanjiChar}
                reading={kanjiObj.onyomi[0] || kanjiObj.kunyomi[0]}
                className='text-7xl pb-2 relative z-10 '
                lang='ja'
              />
            </a>

            <div className='flex flex-col gap-1 w-full'>
              <a
                className='w-full text-[var(--main-color)]/80 text-xs hover:text-[var(--main-color)] hover:text-underline'
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
                  'h-1/2 ',
                  'bg-[var(--background-color)] rounded-xl',
                  'flex flex-row gap-2',
                  // 'border-1 border-[var(--border-color)]',
                  (kanjiObj.onyomi[0] === '' || kanjiObj.onyomi.length === 0) &&
                    'hidden'
                )}
              >
                {kanjiObj.onyomi.slice(0, 2).map((onyomiReading, i) => (
                  <span
                    key={onyomiReading}
                    className={clsx(
                      'px-2 py-1 flex flex-row justify-center items-center text-sm md:text-base',
                      'text-[var(--secondary-color)] w-full ',

                      i < kanjiObj.onyomi.slice(0, 2).length - 1 &&
                        'border-r-1 border-[var(--border-color)]'
                    )}
                  >
                    {showKana
                      ? onyomiReading.split(' ')[1]
                      : onyomiReading.split(' ')[0]}
                  </span>
                ))}
              </div>
              <a
                className='w-full text-[var(--main-color)]/80 text-xs hover:text-underline hover:text-[var(--main-color)]'
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
                  'bg-[var(--background-color)] rounded-xl',
                  'flex flex-row gap-2',

                  // 'border-1 border-[var(--border-color)]',
                  (kanjiObj.kunyomi[0] === '' ||
                    kanjiObj.kunyomi.length === 0) &&
                    'hidden'
                )}
              >
                {kanjiObj.kunyomi.slice(0, 2).map((kunyomiReading, i) => (
                  <span
                    key={kunyomiReading}
                    className={clsx(
                      'px-2 py-1 flex flex-row justify-center items-center text-sm md:text-base',
                      'text-[var(--secondary-color)] w-full ',
                      i < kanjiObj.kunyomi.slice(0, 2).length - 1 &&
                        'border-r-1 border-[var(--border-color)]'
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

          <p className='text-xl md:text-2xl w-full text-[var(--secondary-color)]'>
            {kanjiObj.fullDisplayMeanings.join(', ')}
          </p>
        </div>
      ))}
    </div>
  );
});

export default KanjiSetDictionary;
