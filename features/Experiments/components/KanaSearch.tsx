'use client';
import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useClick, useCorrect, useError } from '@/shared/hooks/useAudio';
import { allKana } from '../data/kanaData';
import clsx from 'clsx';
import { Search, Timer, Trophy, AlertCircle } from 'lucide-react';

const GRID_SIZE = 36; // 6x6
const ROUND_TIME = 10;

export default function KanaSearch() {
  const [level, setLevel] = useState(1);
  const [target, setTarget] = useState(allKana[0]);
  const [grid, setGrid] = useState<any[]>([]);
  const [timeLeft, setTimeLeft] = useState(ROUND_TIME);
  const [score, setScore] = useState(0);
  const [gameState, setGameState] = useState<'playing' | 'gameover' | 'idle'>(
    'idle',
  );

  const { playClick } = useClick();
  const { playCorrect } = useCorrect();
  const { playError } = useError();

  const generateGrid = useCallback(() => {
    const mainTarget = allKana[Math.floor(Math.random() * allKana.length)];
    setTarget(mainTarget);

    // Find "distractor" kana that look similar or just other kana
    const distractors = allKana
      .filter(k => k.kana !== mainTarget.kana)
      .sort(() => Math.random() - 0.5)
      .slice(0, 10);

    const newGrid = Array(GRID_SIZE)
      .fill(null)
      .map(() => {
        return distractors[Math.floor(Math.random() * distractors.length)];
      });

    // Insert target at random position
    const targetIdx = Math.floor(Math.random() * GRID_SIZE);
    newGrid[targetIdx] = mainTarget;

    setGrid(newGrid);
  }, []);

  const startGame = () => {
    playClick();
    setScore(0);
    setLevel(1);
    setTimeLeft(ROUND_TIME);
    setGameState('playing');
    generateGrid();
  };

  useEffect(() => {
    if (gameState !== 'playing') return;
    if (timeLeft <= 0) {
      setGameState('gameover');
      playError();
      return;
    }
    const timer = setInterval(() => setTimeLeft(t => t - 1), 1000);
    return () => clearInterval(timer);
  }, [gameState, timeLeft, playError]);

  const handleSelect = (kana: any) => {
    if (gameState !== 'playing') return;

    if (kana.kana === target.kana) {
      playCorrect();
      setScore(s => s + level * 100 + timeLeft * 10);
      setLevel(l => l + 1);
      setTimeLeft(ROUND_TIME);
      generateGrid();
    } else {
      playError();
      setTimeLeft(t => Math.max(0, t - 2));
    }
  };

  return (
    <div className='flex min-h-[85vh] flex-1 flex-col items-center justify-center gap-8'>
      <div className='flex w-full max-w-md items-center justify-between px-4'>
        <div className='flex items-center gap-2'>
          <Search className='text-(--main-color)' size={32} />
          <h1 className='text-2xl font-black text-(--main-color) uppercase'>
            Kana Search
          </h1>
        </div>
        <div className='flex flex-col items-end'>
          <span className='text-[10px] font-bold text-(--secondary-color)'>
            High Score
          </span>
          <span className='text-xl font-black text-(--main-color)'>
            {score}
          </span>
        </div>
      </div>

      {gameState === 'idle' ? (
        <div className='flex flex-col items-center gap-6'>
          <p className='max-w-xs text-center text-(--secondary-color)'>
            Find the target character in the grid before the time runs out!
          </p>
          <button
            onClick={startGame}
            className='rounded-2xl bg-(--main-color) px-8 py-4 font-bold text-white shadow-lg transition-all hover:scale-105 active:scale-95'
          >
            START SEARCH
          </button>
        </div>
      ) : gameState === 'gameover' ? (
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className='flex flex-col items-center gap-6 text-center'
        >
          <div className='rounded-fill flex h-40 w-40 items-center justify-center rounded-full bg-red-400/20 text-red-500'>
            <AlertCircle size={80} />
          </div>
          <div>
            <h2 className='text-3xl font-black text-(--main-color)'>
              TIME'S UP!
            </h2>
            <p className='text-(--secondary-color)'>
              You reached Level {level}
            </p>
          </div>
          <button
            onClick={startGame}
            className='flex items-center gap-2 rounded-xl border border-(--border-color) bg-(--card-color) px-8 py-3 font-bold text-(--main-color) transition-all hover:border-(--main-color)'
          >
            RETRY
          </button>
        </motion.div>
      ) : (
        <div className='flex w-full flex-col items-center gap-8'>
          <div className='flex items-center gap-6'>
            <div className='flex min-w-[100px] flex-col items-center rounded-2xl bg-(--main-color) p-4 text-white shadow-xl'>
              <span className='text-xs font-bold tracking-widest uppercase opacity-80'>
                Target
              </span>
              <span className='text-5xl font-black'>{target.kana}</span>
            </div>
            <div className='flex min-w-[100px] flex-col items-center rounded-2xl border border-(--border-color) bg-(--card-color) p-4 text-(--main-color)'>
              <Timer
                size={20}
                className={clsx(timeLeft < 4 && 'animate-ping text-red-500')}
              />
              <span
                className={clsx(
                  'font-mono text-2xl font-black',
                  timeLeft < 4 && 'text-red-500',
                )}
              >
                {timeLeft}s
              </span>
            </div>
          </div>

          <div className='grid grid-cols-6 gap-2 rounded-[2.5rem] border border-(--border-color) bg-(--card-color) p-4 shadow-2xl'>
            {grid.map((item, i) => (
              <motion.button
                key={i}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => handleSelect(item)}
                className='flex h-12 w-12 items-center justify-center rounded-xl border border-(--border-color) bg-(--background-color) text-xl font-bold text-(--secondary-color) transition-colors hover:border-(--main-color) hover:text-(--main-color) md:h-14 md:w-14 md:text-2xl'
              >
                {item.kana}
              </motion.button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
