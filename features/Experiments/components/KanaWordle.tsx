'use client';
import { useState, useEffect } from 'react';
import clsx from 'clsx';
import { allKana } from '../data/kanaData';

/**
 * Kana Wordle - Guess the kana in limited tries!
 * Like Wordle but for kana learning
 */
const KanaWordle = () => {
  const [target, setTarget] = useState(
    () => allKana[Math.floor(Math.random() * allKana.length)],
  );
  const [guesses, setGuesses] = useState<
    Array<{ kana: string; result: 'correct' | 'wrong' }>
  >([]);
  const [options, setOptions] = useState<typeof allKana>([]);
  const [gameState, setGameState] = useState<'playing' | 'won' | 'lost'>(
    'playing',
  );

  useEffect(() => {
    generateOptions();
  }, [target]);

  const generateOptions = () => {
    const opts = [target];
    while (opts.length < 6) {
      const rand = allKana[Math.floor(Math.random() * allKana.length)];
      if (!opts.find(o => o.kana === rand.kana)) {
        opts.push(rand);
      }
    }
    setOptions(opts.sort(() => Math.random() - 0.5));
  };

  const handleGuess = (kana: (typeof allKana)[0]) => {
    if (gameState !== 'playing') return;
    if (guesses.find(g => g.kana === kana.kana)) return;

    const isCorrect = kana.kana === target.kana;
    const newGuesses = [
      ...guesses,
      {
        kana: kana.kana,
        result: isCorrect ? ('correct' as const) : ('wrong' as const),
      },
    ];
    setGuesses(newGuesses);

    if (isCorrect) {
      setGameState('won');
    } else if (newGuesses.length >= 5) {
      setGameState('lost');
    }
  };

  const restart = () => {
    setTarget(allKana[Math.floor(Math.random() * allKana.length)]);
    setGuesses([]);
    setGameState('playing');
  };

  return (
    <div className='flex flex-1 flex-col items-center justify-center gap-6 p-4'>
      <h2 className='text-2xl text-(--main-color)'>🎯 Kana Wordle</h2>

      {/* Hint */}
      <div className='text-center'>
        <p className='text-lg text-(--secondary-color)'>
          Find the kana that sounds like:
        </p>
        <p className='mt-2 font-mono text-3xl text-(--accent-color)'>
          "{target.romanji}"
        </p>
      </div>

      {/* Guess History */}
      <div className='flex h-16 gap-2'>
        {Array.from({ length: 5 }, (_, i) => {
          const guess = guesses[i];
          return (
            <div
              key={i}
              className={clsx(
                'flex h-14 w-14 items-center justify-center rounded-xl border-2 text-2xl transition-all',
                !guess
                  ? 'border-(--border-color) bg-(--card-color)'
                  : guess.result === 'correct'
                    ? 'scale-110 border-green-500 bg-green-500/20 text-green-400'
                    : 'border-red-500 bg-red-500/20 text-red-400',
              )}
            >
              {guess?.kana || '?'}
            </div>
          );
        })}
      </div>

      {/* Options */}
      <div className='grid grid-cols-3 gap-3'>
        {options.map((opt, i) => {
          const guessed = guesses.find(g => g.kana === opt.kana);
          return (
            <button
              key={i}
              onClick={() => handleGuess(opt)}
              disabled={gameState !== 'playing' || !!guessed}
              className={clsx(
                'h-16 w-16 rounded-xl text-3xl transition-all',
                'border-2',
                guessed?.result === 'correct'
                  ? 'border-green-500 bg-green-500/20'
                  : guessed?.result === 'wrong'
                    ? 'border-red-500 bg-red-500/20 opacity-50'
                    : gameState !== 'playing'
                      ? 'border-(--border-color) opacity-50'
                      : 'border-(--border-color) bg-(--card-color) hover:scale-105 hover:border-(--accent-color)',
              )}
            >
              {opt.kana}
            </button>
          );
        })}
      </div>

      {/* Result */}
      {gameState !== 'playing' && (
        <div className='flex flex-col items-center gap-3'>
          <p
            className={clsx(
              'text-xl',
              gameState === 'won' ? 'text-green-400' : 'text-red-400',
            )}
          >
            {gameState === 'won'
              ? `🎉 Correct! Found in ${guesses.length} ${guesses.length === 1 ? 'try' : 'tries'}!`
              : `😢 The answer was ${target.kana} (${target.romanji})`}
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

export default KanaWordle;
