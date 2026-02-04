'use client';
import { useState, useEffect, useCallback } from 'react';
import clsx from 'clsx';
import { allKana } from '../data/kanaData';

/**
 * Kana Pulse - Tap the highlighted kana before time runs out
 * Lightweight: Simple grid with CSS transitions
 */
const KanaPulse = () => {
  const [grid] = useState(() =>
    Array.from({ length: 16 }, (_, i) => ({
      id: i,
      ...allKana[Math.floor(Math.random() * allKana.length)],
    })),
  );

  const [targetIdx, setTargetIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(100);
  const [gameOver, setGameOver] = useState(false);

  const pickNewTarget = useCallback(() => {
    setTargetIdx(Math.floor(Math.random() * 16));
  }, []);

  useEffect(() => {
    pickNewTarget();
  }, [pickNewTarget]);

  useEffect(() => {
    if (gameOver) return;
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          setGameOver(true);
          return 0;
        }
        return prev - 1;
      });
    }, 100);
    return () => clearInterval(timer);
  }, [gameOver]);

  const handleClick = (idx: number) => {
    if (gameOver) return;
    if (idx === targetIdx) {
      setScore(s => s + 10);
      setTimeLeft(t => Math.min(t + 15, 100));
      pickNewTarget();
    } else {
      setTimeLeft(t => Math.max(t - 20, 0));
    }
  };

  const restart = () => {
    setScore(0);
    setTimeLeft(100);
    setGameOver(false);
    pickNewTarget();
  };

  return (
    <div className='flex flex-1 flex-col items-center justify-center gap-6 p-4'>
      <div className='flex items-center gap-8 text-xl'>
        <span className='text-(--main-color)'>Score: {score}</span>
        <div className='h-3 w-40 overflow-hidden rounded-full bg-(--border-color)'>
          <div
            className='h-full transition-all duration-100'
            style={{
              width: `${timeLeft}%`,
              backgroundColor:
                timeLeft > 50
                  ? '#22c55e'
                  : timeLeft > 25
                    ? '#eab308'
                    : '#ef4444',
            }}
          />
        </div>
      </div>

      <div className='grid grid-cols-4 gap-3'>
        {grid.map((cell, idx) => (
          <button
            key={cell.id}
            onClick={() => handleClick(idx)}
            disabled={gameOver}
            className={clsx(
              'h-16 w-16 rounded-xl text-2xl transition-all duration-150 md:h-20 md:w-20 md:text-3xl',
              'border-2',
              idx === targetIdx
                ? 'scale-110 animate-pulse border-(--accent-color) bg-(--accent-color)/20 text-(--accent-color)'
                : 'border-(--border-color) bg-(--card-color) text-(--main-color) hover:scale-105',
            )}
          >
            {cell.kana}
          </button>
        ))}
      </div>

      {gameOver && (
        <div className='flex flex-col items-center gap-4'>
          <p className='text-2xl text-(--main-color)'>
            Game Over! Final Score: {score}
          </p>
          <button
            onClick={restart}
            className='rounded-xl bg-(--accent-color) px-6 py-3 text-white transition-transform hover:scale-105'
          >
            Play Again
          </button>
        </div>
      )}
    </div>
  );
};

export default KanaPulse;
