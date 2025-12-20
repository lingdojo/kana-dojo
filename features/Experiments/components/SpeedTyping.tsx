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
    [queue, playCorrect, playError]
  );

  if (!isMounted) return null;

  return (
    <div className='flex flex-col items-center justify-center gap-8 flex-1 min-h-[80vh]'>
      {/* Header */}
      <div className='text-center'>
        <h1 className='text-2xl md:text-3xl text-[var(--main-color)]'>
          Speed Typing
        </h1>
        <p className='text-[var(--secondary-color)] mt-2'>
          Type the romanji as fast as you can!
        </p>
      </div>

      {gameState === 'idle' && (
        <button
          onClick={startGame}
          className={clsx(
            'px-8 py-4 rounded-xl flex items-center gap-3',
            'bg-[var(--card-color)] border-2 border-[var(--border-color)]',
            'text-[var(--main-color)] text-xl',
            'hover:cursor-pointer hover:border-[var(--main-color)]',
            'transition-all duration-250 active:scale-95'
          )}
        >
          <Play size={24} />
          Start Game
        </button>
      )}

      {gameState === 'playing' && (
        <>
          {/* Stats bar */}
          <div className='flex justify-between w-full max-w-md text-lg'>
            <span className='text-[var(--secondary-color)]'>
              Score: <span className='text-[var(--main-color)]'>{score}</span>
            </span>
            <span className='text-[var(--secondary-color)]'>
              Time:{' '}
              <span className='text-[var(--main-color)]'>{timeLeft}s</span>
            </span>
            <span className='text-[var(--secondary-color)]'>
              Errors: <span className='text-red-400'>{mistakes}</span>
            </span>
          </div>

          {/* Kana queue */}
          <div className='flex items-center gap-4 overflow-hidden'>
            {queue.slice(0, 5).map((kana, i) => (
              <div
                key={i}
                className={clsx(
                  'flex flex-col items-center p-4 rounded-xl transition-all',
                  i === 0
                    ? 'bg-[var(--card-color)] border-2 border-[var(--main-color)] scale-110'
                    : 'opacity-50'
                )}
              >
                <span
                  lang='ja'
                  className='text-4xl md:text-5xl text-[var(--main-color)]'
                >
                  {kana.kana}
                </span>
                {i === 0 && (
                  <span className='text-xs text-[var(--secondary-color)] mt-1'>
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
              'w-full max-w-xs px-6 py-4 text-2xl text-center rounded-xl',
              'bg-[var(--card-color)] border-2 border-[var(--border-color)]',
              'text-[var(--main-color)] outline-none',
              'focus:border-[var(--main-color)]'
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
              'bg-[var(--card-color)] border border-[var(--border-color)]',
              'rounded-2xl p-8 text-center'
            )}
          >
            <h2 className='text-2xl text-[var(--main-color)] mb-4'>Results</h2>
            <div className='space-y-2'>
              <p className='text-lg text-[var(--secondary-color)]'>
                Correct:{' '}
                <span className='text-[var(--main-color)]'>{score}</span>
              </p>
              <p className='text-lg text-[var(--secondary-color)]'>
                Mistakes: <span className='text-red-400'>{mistakes}</span>
              </p>
              <p className='text-lg text-[var(--secondary-color)]'>
                Accuracy:{' '}
                <span className='text-[var(--main-color)]'>
                  {score + mistakes > 0
                    ? Math.round((score / (score + mistakes)) * 100)
                    : 0}
                  %
                </span>
              </p>
              <p className='text-2xl text-[var(--main-color)] mt-4'>
                {wpm} KPM
              </p>
              <p className='text-sm text-[var(--secondary-color)]'>
                (Kana Per Minute)
              </p>
            </div>
          </div>

          <button
            onClick={startGame}
            className={clsx(
              'px-6 py-3 rounded-xl flex items-center gap-2',
              'bg-[var(--card-color)] border border-[var(--border-color)]',
              'text-[var(--main-color)]',
              'hover:cursor-pointer hover:border-[var(--main-color)]',
              'transition-all duration-250 active:scale-95'
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
