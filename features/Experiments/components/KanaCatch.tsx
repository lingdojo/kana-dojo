'use client';
import { useState, useEffect, useCallback } from 'react';
import clsx from 'clsx';
import { allKana } from '../data/kanaData';

/**
 * Kana Catch - Catch falling kana in your basket!
 * Move with mouse or arrow keys
 */
const KanaCatch = () => {
  const [basketX, setBasketX] = useState(50);
  const [falling, setFalling] = useState<
    Array<{
      id: number;
      kana: string;
      romanji: string;
      x: number;
      y: number;
      speed: number;
    }>
  >([]);
  const [score, setScore] = useState(0);
  const [missed, setMissed] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [idCounter, setIdCounter] = useState(0);

  const spawnKana = useCallback(() => {
    const kana = allKana[Math.floor(Math.random() * allKana.length)];
    return {
      id: idCounter,
      kana: kana.kana,
      romanji: kana.romanji,
      x: Math.random() * 80 + 10,
      y: -5,
      speed: 0.3 + Math.random() * 0.3,
    };
  }, [idCounter]);

  // Spawn kana periodically
  useEffect(() => {
    if (gameOver) return;
    const interval = setInterval(() => {
      setFalling(prev => [...prev, spawnKana()]);
      setIdCounter(i => i + 1);
    }, 1500);
    return () => clearInterval(interval);
  }, [gameOver, spawnKana]);

  // Move falling kana
  useEffect(() => {
    if (gameOver) return;

    const animate = () => {
      setFalling(prev => {
        const updated: typeof prev = [];

        prev.forEach(k => {
          const newY = k.y + k.speed;

          // Check if caught by basket
          if (newY > 85 && newY < 95 && Math.abs(k.x - basketX) < 10) {
            setScore(s => s + 10);
            return; // Don't add to updated
          }

          // Check if missed
          if (newY > 100) {
            setMissed(m => {
              const newMissed = m + 1;
              if (newMissed >= 5) setGameOver(true);
              return newMissed;
            });
            return; // Don't add to updated
          }

          updated.push({ ...k, y: newY });
        });

        return updated;
      });
    };

    const interval = setInterval(animate, 16);
    return () => clearInterval(interval);
  }, [basketX, gameOver]);

  // Keyboard controls
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') setBasketX(x => Math.max(10, x - 5));
      if (e.key === 'ArrowRight') setBasketX(x => Math.min(90, x + 5));
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, []);

  // Mouse controls
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    setBasketX(Math.max(10, Math.min(90, x)));
  };

  const restart = () => {
    setFalling([]);
    setScore(0);
    setMissed(0);
    setGameOver(false);
  };

  return (
    <div
      className='relative min-h-[80vh] flex-1 cursor-none overflow-hidden'
      onMouseMove={handleMouseMove}
    >
      {/* HUD */}
      <div className='absolute top-4 left-1/2 z-10 flex -translate-x-1/2 gap-8 text-lg text-(--main-color)'>
        <span>Score: {score}</span>
        <span className='text-red-400'>Missed: {missed}/5</span>
      </div>

      {/* Falling Kana */}
      {falling.map(k => (
        <div
          key={k.id}
          className='absolute flex flex-col items-center'
          style={{
            left: `${k.x}%`,
            top: `${k.y}%`,
            transform: 'translate(-50%, -50%)',
          }}
        >
          <span lang='ja' className='text-3xl text-(--main-color)'>
            {k.kana}
          </span>
        </div>
      ))}

      {/* Basket */}
      <div
        className='absolute bottom-[8%] h-12 w-20 rounded-b-xl border-4 border-t-0 border-(--accent-color) bg-(--accent-color)/20'
        style={{
          left: `${basketX}%`,
          transform: 'translateX(-50%)',
        }}
      >
        <span className='absolute -top-6 left-1/2 -translate-x-1/2 text-2xl'>
          🧺
        </span>
      </div>

      {/* Game Over */}
      {gameOver && (
        <div className='absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/50'>
          <div className='flex flex-col items-center gap-4 rounded-2xl bg-(--card-color) p-8'>
            <p className='text-2xl text-(--main-color)'>Game Over!</p>
            <p className='text-xl text-(--accent-color)'>
              Final Score: {score}
            </p>
            <button
              onClick={restart}
              className='rounded-xl bg-(--accent-color) px-6 py-3 text-white transition-transform hover:scale-105'
            >
              Play Again
            </button>
          </div>
        </div>
      )}

      {/* Instructions */}
      {!gameOver && (
        <p className='absolute bottom-2 left-1/2 -translate-x-1/2 text-sm text-(--secondary-color)'>
          Move mouse or use ← → arrow keys
        </p>
      )}
    </div>
  );
};

export default KanaCatch;
