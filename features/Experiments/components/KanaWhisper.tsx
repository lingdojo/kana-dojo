'use client';
import { useState, useEffect, useRef } from 'react';
import clsx from 'clsx';
import { allKana } from '../data/kanaData';

/**
 * Kana Whisper - Fading kana that you must remember
 * Lightweight: Simple opacity transitions
 */
const KanaWhisper = () => {
  const [phase, setPhase] = useState<'show' | 'hide' | 'guess'>('show');
  const [target, setTarget] = useState(
    () => allKana[Math.floor(Math.random() * allKana.length)],
  );
  const [options, setOptions] = useState<typeof allKana>([]);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [showTime, setShowTime] = useState(2000);
  const [result, setResult] = useState<'correct' | 'wrong' | null>(null);

  const generateOptions = (correct: (typeof allKana)[0]) => {
    const opts = [correct];
    while (opts.length < 4) {
      const rand = allKana[Math.floor(Math.random() * allKana.length)];
      if (!opts.find(o => o.kana === rand.kana)) {
        opts.push(rand);
      }
    }
    return opts.sort(() => Math.random() - 0.5);
  };

  useEffect(() => {
    if (phase === 'show') {
      const timer = setTimeout(() => setPhase('hide'), showTime);
      return () => clearTimeout(timer);
    }
    if (phase === 'hide') {
      const timer = setTimeout(() => {
        setOptions(generateOptions(target));
        setPhase('guess');
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [phase, target, showTime]);

  const handleGuess = (kana: string) => {
    const isCorrect = kana === target.kana;
    setResult(isCorrect ? 'correct' : 'wrong');

    if (isCorrect) {
      setScore(s => s + 10 + streak * 5);
      setStreak(s => s + 1);
      // Speed up slightly with streak
      setShowTime(t => Math.max(800, t - 100));
    } else {
      setStreak(0);
      setShowTime(2000);
    }

    setTimeout(() => {
      setTarget(allKana[Math.floor(Math.random() * allKana.length)]);
      setResult(null);
      setPhase('show');
    }, 1000);
  };

  return (
    <div className='flex flex-1 flex-col items-center justify-center gap-8 p-4'>
      <div className='flex gap-8 text-lg text-(--main-color)'>
        <span>Score: {score}</span>
        <span>🔥 Streak: {streak}</span>
      </div>

      {/* Display Area */}
      <div className='flex h-48 w-48 items-center justify-center rounded-2xl border-2 border-(--border-color) bg-(--card-color)'>
        {phase !== 'guess' ? (
          <span
            lang='ja'
            className='text-8xl text-(--main-color) transition-opacity duration-500'
            style={{ opacity: phase === 'show' ? 1 : 0 }}
          >
            {target.kana}
          </span>
        ) : (
          <span className='text-4xl text-(--secondary-color)'>?</span>
        )}
      </div>

      {/* Options */}
      {phase === 'guess' && (
        <div className='grid grid-cols-2 gap-4'>
          {options.map((opt, i) => (
            <button
              key={i}
              onClick={() => handleGuess(opt.kana)}
              disabled={result !== null}
              className={clsx(
                'h-20 w-20 rounded-xl text-3xl transition-all duration-200',
                'border-2',
                result && opt.kana === target.kana
                  ? 'border-green-500 bg-green-500/20 text-green-400'
                  : result === 'wrong'
                    ? 'opacity-50'
                    : 'border-(--border-color) bg-(--card-color) text-(--main-color) hover:scale-105',
              )}
            >
              {opt.kana}
            </button>
          ))}
        </div>
      )}

      {/* Instructions */}
      <p className='text-sm text-(--secondary-color)'>
        {phase === 'show'
          ? 'Remember this kana...'
          : phase === 'hide'
            ? 'Fading...'
            : 'Which kana was it?'}
      </p>
    </div>
  );
};

export default KanaWhisper;
