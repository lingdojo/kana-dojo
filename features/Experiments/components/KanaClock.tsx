'use client';
import { useState, useEffect } from 'react';
import { hiraganaOnly } from '../data/kanaData';

/**
 * Kana Clock - A beautiful analog clock with kana numbers!
 */
const KanaClock = () => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const hours = time.getHours() % 12;
  const minutes = time.getMinutes();
  const seconds = time.getSeconds();

  const hourAngle = (hours + minutes / 60) * 30;
  const minuteAngle = (minutes + seconds / 60) * 6;
  const secondAngle = seconds * 6;

  // Use hiragana for clock numbers
  const clockKana = [
    'じゅうに',
    'いち',
    'に',
    'さん',
    'し',
    'ご',
    'ろく',
    'しち',
    'はち',
    'く',
    'じゅう',
    'じゅういち',
  ];

  return (
    <div className='flex flex-1 flex-col items-center justify-center gap-8 p-4'>
      <h2 className='text-2xl text-(--main-color)'>⏰ Kana Clock</h2>

      {/* Clock Face */}
      <div className='relative h-72 w-72 rounded-full border-4 border-(--border-color) bg-(--card-color) md:h-80 md:w-80'>
        {/* Kana Numbers */}
        {clockKana.map((kana, i) => {
          const angle = (i - 3) * 30 * (Math.PI / 180);
          const radius = 42;
          return (
            <span
              key={i}
              lang='ja'
              className='absolute text-xs whitespace-nowrap text-(--main-color) md:text-sm'
              style={{
                left: `${50 + radius * Math.cos(angle)}%`,
                top: `${50 + radius * Math.sin(angle)}%`,
                transform: 'translate(-50%, -50%)',
              }}
            >
              {kana}
            </span>
          );
        })}

        {/* Hour Hand */}
        <div
          className='absolute top-1/2 left-1/2 h-20 w-1.5 origin-bottom rounded-full bg-(--main-color)'
          style={{
            transform: `translateX(-50%) translateY(-100%) rotate(${hourAngle}deg)`,
          }}
        />

        {/* Minute Hand */}
        <div
          className='absolute top-1/2 left-1/2 h-28 w-1 origin-bottom rounded-full bg-(--accent-color)'
          style={{
            transform: `translateX(-50%) translateY(-100%) rotate(${minuteAngle}deg)`,
          }}
        />

        {/* Second Hand */}
        <div
          className='absolute top-1/2 left-1/2 h-32 w-0.5 origin-bottom rounded-full bg-red-500'
          style={{
            transform: `translateX(-50%) translateY(-100%) rotate(${secondAngle}deg)`,
            transition: 'none',
          }}
        />

        {/* Center Dot */}
        <div className='absolute top-1/2 left-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full bg-(--main-color)' />

        {/* Floating Kana Decoration */}
        <span
          lang='ja'
          className='absolute right-4 bottom-4 text-2xl text-(--accent-color) opacity-50'
        >
          {hiraganaOnly[seconds % hiraganaOnly.length].kana}
        </span>
      </div>

      {/* Digital Time */}
      <div className='font-mono text-3xl text-(--main-color)'>
        {time.toLocaleTimeString('ja-JP')}
      </div>
    </div>
  );
};

export default KanaClock;
