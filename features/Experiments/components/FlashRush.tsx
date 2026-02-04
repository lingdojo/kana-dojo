'use client';
import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useClick, useCorrect, useError } from '@/shared/hooks/useAudio';
import { allKana } from '../data/kanaData';
import clsx from 'clsx';
import { Timer, Zap, Trophy, RefreshCcw } from 'lucide-react';
import confetti from 'canvas-confetti';

const GAME_DURATION = 30;

export default function FlashRush() {
  const [gameState, setGameState] = useState<'idle' | 'playing' | 'result'>(
    'idle',
  );
  const [currentKana, setCurrentKana] = useState<any>(null);
  const [options, setOptions] = useState<any[]>([]);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION);
  const [lastResult, setLastResult] = useState<'correct' | 'wrong' | null>(
    null,
  );

  const { playClick } = useClick();
  const { playCorrect } = useCorrect();
  const { playError } = useError();

  const nextQuestion = useCallback(() => {
    const correct = allKana[Math.floor(Math.random() * allKana.length)];
    const others = allKana
      .filter(k => k.romanji !== correct.romanji)
      .sort(() => Math.random() - 0.5)
      .slice(0, 3);

    setOptions([...others, correct].sort(() => Math.random() - 0.5));
    setCurrentKana(correct);
    setLastResult(null);
  }, []);

  const startGame = () => {
    playClick();
    setScore(0);
    setTimeLeft(GAME_DURATION);
    setGameState('playing');
    nextQuestion();
  };

  useEffect(() => {
    if (gameState !== 'playing') return;
    if (timeLeft <= 0) {
      setGameState('result');
      if (score > 10) confetti();
      return;
    }
    const timer = setInterval(() => setTimeLeft(t => t - 1), 1000);
    return () => clearInterval(timer);
  }, [gameState, timeLeft, score]);

  const handleAnswer = (option: any) => {
    if (gameState !== 'playing') return;

    if (option.kana === currentKana.kana) {
      playCorrect();
      setScore(s => s + 1);
      setLastResult('correct');
      setTimeout(nextQuestion, 150);
    } else {
      playError();
      setLastResult('wrong');
      // Shake animation is handled by framer-motion below
    }
  };

  if (gameState === 'idle') {
    return (
      <div className='flex min-h-[85vh] flex-1 flex-col items-center justify-center gap-6'>
        <div className='relative'>
          <Zap
            className='absolute -top-8 -right-8 animate-pulse text-yellow-400'
            size={48}
          />
          <h1 className='text-center text-5xl font-black text-(--main-color)'>
            FLASH RUSH
          </h1>
        </div>
        <p className='max-w-md text-center text-(--secondary-color)'>
          Identify as many kana as you can in 30 seconds. Speed is key!
        </p>
        <button
          onClick={startGame}
          className='group relative flex items-center gap-3 rounded-2xl bg-(--main-color) px-10 py-5 text-xl font-bold text-white transition-all hover:scale-105 active:scale-95'
        >
          <Zap className='fill-current' size={24} />
          START RUSH
          <div className='absolute inset-0 rounded-2xl bg-white/20 opacity-0 transition-opacity group-hover:opacity-100' />
        </button>
      </div>
    );
  }

  if (gameState === 'result') {
    return (
      <div className='flex min-h-[85vh] flex-1 flex-col items-center justify-center gap-8'>
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className='flex flex-col items-center gap-4 text-center'
        >
          <Trophy className='text-yellow-400' size={80} />
          <h2 className='text-4xl font-bold text-(--main-color)'>
            Rush Over!
          </h2>
          <div className='rounded-3xl border border-(--border-color) bg-(--card-color) p-8 shadow-xl'>
            <p className='text-sm tracking-widest text-(--secondary-color) uppercase'>
              Final Score
            </p>
            <p className='text-7xl font-black text-(--main-color)'>
              {score}
            </p>
          </div>
        </motion.div>
        <button
          onClick={startGame}
          className='flex items-center gap-2 rounded-xl border-2 border-(--main-color) px-8 py-3 font-bold text-(--main-color) transition-all hover:bg-(--main-color) hover:text-white'
        >
          <RefreshCcw size={20} />
          TRY AGAIN
        </button>
      </div>
    );
  }

  return (
    <div className='flex min-h-[85vh] flex-1 flex-col items-center justify-center gap-12'>
      {/* Stats Bar */}
      <div className='flex w-full max-w-md items-center justify-between px-4'>
        <div className='flex items-center gap-2 rounded-full border border-(--border-color) bg-(--card-color) px-4 py-2'>
          <Timer
            className={clsx(
              'text-(--main-color)',
              timeLeft < 5 && 'animate-bounce text-red-500',
            )}
            size={20}
          />
          <span
            className={clsx(
              'font-mono text-xl font-bold',
              timeLeft < 5 ? 'text-red-500' : 'text-(--main-color)',
            )}
          >
            {timeLeft}s
          </span>
        </div>
        <div className='flex items-center gap-2 rounded-full border border-(--border-color) bg-(--card-color) px-4 py-2'>
          <Trophy className='text-yellow-400' size={20} />
          <span className='font-mono text-xl font-bold text-(--main-color)'>
            {score}
          </span>
        </div>
      </div>

      {/* Target Kana */}
      <AnimatePresence mode='wait'>
        <motion.div
          key={currentKana?.kana}
          initial={{ scale: 0.8, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 1.2, opacity: 0 }}
          className='relative flex h-48 w-48 items-center justify-center rounded-[3rem] border-4 border-(--border-color) bg-(--card-color) shadow-2xl'
        >
          <span className='text-8xl font-black text-(--main-color)'>
            {currentKana?.kana}
          </span>

          {/* Visual Feedback Overlays */}
          {lastResult === 'correct' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className='absolute inset-0 flex items-center justify-center rounded-[2.7rem] bg-green-500/20 text-4xl'
            >
              ✨
            </motion.div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Options Grid */}
      <div className='grid w-full max-w-md grid-cols-2 gap-4 px-4'>
        {options.map((option, idx) => (
          <motion.button
            key={`${option.kana}-${idx}`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleAnswer(option)}
            className={clsx(
              'flex flex-col items-center justify-center rounded-2xl border-2 py-6 transition-all',
              'border-(--border-color) bg-(--card-color) hover:border-(--main-color)',
            )}
          >
            <span className='text-3xl font-bold text-(--main-color)'>
              {option.romanji}
            </span>
          </motion.button>
        ))}
      </div>
    </div>
  );
}
