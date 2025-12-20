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
    <div className='flex flex-col items-center justify-center gap-8 flex-1 min-h-[80vh]'>
      {/* Title */}
      <div className='text-center'>
        <h1 className='text-xl md:text-2xl text-[var(--secondary-color)]'>
          {isDaily ? "Today's Haiku" : 'Random Haiku'}
        </h1>
      </div>

      {/* Haiku card */}
      <div
        className={clsx(
          'bg-[var(--card-color)] border border-[var(--border-color)]',
          'rounded-2xl p-8 md:p-12 w-full max-w-xl',
          'flex flex-col items-center gap-6'
        )}
      >
        {/* Japanese lines */}
        <div className='flex flex-col items-center gap-3'>
          {haiku.japanese.map((line, i) => (
            <div key={i} className='text-center'>
              <p
                lang='ja'
                className='text-2xl md:text-3xl text-[var(--main-color)] tracking-wider'
              >
                {line}
              </p>
              {showRomanji && (
                <p className='text-sm text-[var(--secondary-color)] mt-1 italic'>
                  {haiku.romanji[i]}
                </p>
              )}
            </div>
          ))}
        </div>

        {/* Divider */}
        <div className='w-16 h-px bg-[var(--border-color)]' />

        {/* English translation */}
        <div className='flex flex-col items-center gap-1'>
          {haiku.english.map((line, i) => (
            <p
              key={i}
              className='text-base md:text-lg text-[var(--secondary-color)] text-center italic'
            >
              {line}
            </p>
          ))}
        </div>

        {/* Author */}
        <div className='text-center mt-4'>
          <p className='text-sm text-[var(--secondary-color)]'>
            — {haiku.author}
          </p>
          <p lang='ja' className='text-sm text-[var(--main-color)]'>
            {haiku.authorJapanese}
          </p>
        </div>
      </div>

      {/* Controls */}
      <div className='flex gap-4'>
        <button
          onClick={toggleRomanji}
          className={clsx(
            'px-4 py-2 rounded-lg',
            'bg-[var(--card-color)] border border-[var(--border-color)]',
            'text-[var(--secondary-color)] hover:text-[var(--main-color)]',
            'hover:cursor-pointer transition-all duration-250',
            'active:scale-95',
            showRomanji && 'border-[var(--main-color)] text-[var(--main-color)]'
          )}
        >
          {showRomanji ? 'Hide' : 'Show'} Romanji
        </button>
        <button
          onClick={handleNewHaiku}
          className={clsx(
            'px-4 py-2 rounded-lg flex items-center gap-2',
            'bg-[var(--card-color)] border border-[var(--border-color)]',
            'text-[var(--secondary-color)] hover:text-[var(--main-color)]',
            'hover:cursor-pointer transition-all duration-250',
            'active:scale-95'
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
