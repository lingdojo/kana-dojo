'use client';
import { useEffect, useState, useCallback, useRef } from 'react';
import { RotateCcw, Play } from 'lucide-react';
import clsx from 'clsx';
import { useClick, useCorrect, useError } from '@/shared/hooks/useAudio';
import { allKana } from '../data/kanaData';

type GameState = 'idle' | 'playing' | 'finished';

const GAME_DURATION = 60; // seconds
const QUEUE_SIZE = 10;

const SpeedTyping = () => {
  const [isMounted, setIsMounted] = useState(false);
  const [gameState, setGameState] = useState<GameState>('idle');
  const [queue, setQueue] = useState<typeof allKana>([]);
  const [input, setInput] = useState('');
  const [score, setScore] = useState(0);
  const [mistakes, setMistakes] = useState(0);
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION);
  const [wpm, setWpm] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const { playClick } = useClick();
  const { playCorrect } = useCorrect();
  const { playError } = useError();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const generateQueue = useCallback(() => {
    const newQueue = [];
    for (let i = 0; i < QUEUE_SIZE; i++) {
      newQueue.push(allKana[Math.floor(Math.random() * allKana.length)]);
    }
    return newQueue;
  }, []);

  const startGame = useCallback(() => {
    playClick();
    setGameState('playing');
    setQueue(generateQueue());
    setInput('');
    setScore(0);
    setMistakes(0);
    setTimeLeft(GAME_DURATION);
    setTimeout(() => inputRef.current?.focus(), 100);
  }, [generateQueue, playClick]);

  // Timer
  useEffect(() => {
    if (gameState !== 'playing') return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          setGameState('finished');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [gameState]);

  // Calculate WPM
  useEffect(() => {
    if (gameState === 'finished') {
      const minutes = (GAME_DURATION - timeLeft) / 60 || 1;
      setWpm(Math.round(score / minutes));
    }
  }, [gameState, score, timeLeft]);

  const handleInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value.toLowerCase();
      setInput(value);

      if (queue.length === 0) return;

      const currentKana = queue[0];
      if (value === currentKana.romanji) {
        playCorrect();
        setScore(s => s + 1);
        setInput('');
        setQueue(prev => {
          const newQueue = [...prev.slice(1)];
          newQueue.push(allKana[Math.floor(Math.random() * allKana.length)]);
          return newQueue;
        });
      } else if (currentKana.romanji.startsWith(value)) {
        // Partial match, keep typing
      } else {
        playError();
        setMistakes(m => m + 1);
        setInput('');
      }
    },
    [queue, playCorrect, playError],
  );

  if (!isMounted) return null;

  return (
    <div className='flex min-h-[80vh] flex-1 flex-col items-center justify-center gap-8'>
      {/* Header */}
      <div className='text-center'>
        <h1 className='text-2xl text-(--main-color) md:text-3xl'>
          Speed Typing
        </h1>
        <p className='mt-2 text-(--secondary-color)'>
          Type the romanji as fast as you can!
        </p>
      </div>

      {gameState === 'idle' && (
        <button
          onClick={startGame}
          className={clsx(
            'flex items-center gap-3 rounded-xl px-8 py-4',
            'border-2 border-(--border-color) bg-(--card-color)',
            'text-xl text-(--main-color)',
            'hover:cursor-pointer hover:border-(--main-color)',
            'transition-all duration-250 active:scale-95',
          )}
        >
          <Play size={24} />
          Start Game
        </button>
      )}

      {gameState === 'playing' && (
        <>
          {/* Stats bar */}
          <div className='flex w-full max-w-md justify-between text-lg'>
            <span className='text-(--secondary-color)'>
              Score: <span className='text-(--main-color)'>{score}</span>
            </span>
            <span className='text-(--secondary-color)'>
              Time:{' '}
              <span className='text-(--main-color)'>{timeLeft}s</span>
            </span>
            <span className='text-(--secondary-color)'>
              Errors: <span className='text-red-400'>{mistakes}</span>
            </span>
          </div>

          {/* Kana queue */}
          <div className='flex items-center gap-4 overflow-hidden'>
            {queue.slice(0, 5).map((kana, i) => (
              <div
                key={i}
                className={clsx(
                  'flex flex-col items-center rounded-xl p-4 transition-all',
                  i === 0
                    ? 'scale-110 border-2 border-(--main-color) bg-(--card-color)'
                    : 'opacity-50',
                )}
              >
                <span
                  lang='ja'
                  className='text-4xl text-(--main-color) md:text-5xl'
                >
                  {kana.kana}
                </span>
                {i === 0 && (
                  <span className='mt-1 text-xs text-(--secondary-color)'>
                    {kana.romanji}
                  </span>
                )}
              </div>
            ))}
          </div>

          {/* Input */}
          <input
            ref={inputRef}
            type='text'
            value={input}
            onChange={handleInput}
            className={clsx(
              'w-full max-w-xs rounded-xl px-6 py-4 text-center text-2xl',
              'border-2 border-(--border-color) bg-(--card-color)',
              'text-(--main-color) outline-none',
              'focus:border-(--main-color)',
            )}
            placeholder='Type here...'
            autoComplete='off'
            autoCapitalize='off'
          />
        </>
      )}

      {gameState === 'finished' && (
        <div className='flex flex-col items-center gap-6'>
          <div
            className={clsx(
              'border border-(--border-color) bg-(--card-color)',
              'rounded-2xl p-8 text-center',
            )}
          >
            <h2 className='mb-4 text-2xl text-(--main-color)'>Results</h2>
            <div className='space-y-2'>
              <p className='text-lg text-(--secondary-color)'>
                Correct:{' '}
                <span className='text-(--main-color)'>{score}</span>
              </p>
              <p className='text-lg text-(--secondary-color)'>
                Mistakes: <span className='text-red-400'>{mistakes}</span>
              </p>
              <p className='text-lg text-(--secondary-color)'>
                Accuracy:{' '}
                <span className='text-(--main-color)'>
                  {score + mistakes > 0
                    ? Math.round((score / (score + mistakes)) * 100)
                    : 0}
                  %
                </span>
              </p>
              <p className='mt-4 text-2xl text-(--main-color)'>
                {wpm} KPM
              </p>
              <p className='text-sm text-(--secondary-color)'>
                (Kana Per Minute)
              </p>
            </div>
          </div>

          <button
            onClick={startGame}
            className={clsx(
              'flex items-center gap-2 rounded-xl px-6 py-3',
              'border border-(--border-color) bg-(--card-color)',
              'text-(--main-color)',
              'hover:cursor-pointer hover:border-(--main-color)',
              'transition-all duration-250 active:scale-95',
            )}
          >
            <RotateCcw size={20} />
            Play Again
          </button>
        </div>
      )}
    </div>
  );
};

export default SpeedTyping;
