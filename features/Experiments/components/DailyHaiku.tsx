'use client';
import { useEffect, useState } from 'react';
import { RefreshCw } from 'lucide-react';
import clsx from 'clsx';
import { useClick } from '@/shared/hooks/useAudio';
import { getDailyHaiku, getRandomHaiku, Haiku } from '../data/haiku';

const DailyHaiku = () => {
  const [isMounted, setIsMounted] = useState(false);
  const [haiku, setHaiku] = useState<Haiku | null>(null);
  const [showRomanji, setShowRomanji] = useState(false);
  const [isDaily, setIsDaily] = useState(true);
  const { playClick } = useClick();

  useEffect(() => {
    setIsMounted(true);
    setHaiku(getDailyHaiku());
  }, []);

  const handleNewHaiku = () => {
    playClick();
    setHaiku(getRandomHaiku());
    setIsDaily(false);
  };

  const toggleRomanji = () => {
    playClick();
    setShowRomanji(!showRomanji);
  };

  if (!isMounted || !haiku) return null;

  return (
    <div className='flex min-h-[80vh] flex-1 flex-col items-center justify-center gap-8'>
      {/* Title */}
      <div className='text-center'>
        <h1 className='text-xl text-(--secondary-color) md:text-2xl'>
          {isDaily ? "Today's Haiku" : 'Random Haiku'}
        </h1>
      </div>

      {/* Haiku card */}
      <div
        className={clsx(
          'border border-(--border-color) bg-(--card-color)',
          'w-full max-w-xl rounded-2xl p-8 md:p-12',
          'flex flex-col items-center gap-6',
        )}
      >
        {/* Japanese lines */}
        <div className='flex flex-col items-center gap-3'>
          {haiku.japanese.map((line, i) => (
            <div key={i} className='text-center'>
              <p
                lang='ja'
                className='text-2xl tracking-wider text-(--main-color) md:text-3xl'
              >
                {line}
              </p>
              {showRomanji && (
                <p className='mt-1 text-sm text-(--secondary-color) italic'>
                  {haiku.romanji[i]}
                </p>
              )}
            </div>
          ))}
        </div>

        {/* Divider */}
        <div className='h-px w-16 bg-(--border-color)' />

        {/* English translation */}
        <div className='flex flex-col items-center gap-1'>
          {haiku.english.map((line, i) => (
            <p
              key={i}
              className='text-center text-base text-(--secondary-color) italic md:text-lg'
            >
              {line}
            </p>
          ))}
        </div>

        {/* Author */}
        <div className='mt-4 text-center'>
          <p className='text-sm text-(--secondary-color)'>
            — {haiku.author}
          </p>
          <p lang='ja' className='text-sm text-(--main-color)'>
            {haiku.authorJapanese}
          </p>
        </div>
      </div>

      {/* Controls */}
      <div className='flex gap-4'>
        <button
          onClick={toggleRomanji}
          className={clsx(
            'rounded-lg px-4 py-2',
            'border border-(--border-color) bg-(--card-color)',
            'text-(--secondary-color) hover:text-(--main-color)',
            'transition-all duration-250 hover:cursor-pointer',
            'active:scale-95',
            showRomanji &&
              'border-(--main-color) text-(--main-color)',
          )}
        >
          {showRomanji ? 'Hide' : 'Show'} Romanji
        </button>
        <button
          onClick={handleNewHaiku}
          className={clsx(
            'flex items-center gap-2 rounded-lg px-4 py-2',
            'border border-(--border-color) bg-(--card-color)',
            'text-(--secondary-color) hover:text-(--main-color)',
            'transition-all duration-250 hover:cursor-pointer',
            'active:scale-95',
          )}
        >
          <RefreshCw size={16} />
          New Haiku
        </button>
      </div>
    </div>
  );
};

export default DailyHaiku;
