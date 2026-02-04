'use client';
import { useState } from 'react';
import clsx from 'clsx';
import { allKana } from '../data/kanaData';

/**
 * Kana Shadow - Guess the kana from its silhouette
 * Lightweight: CSS blur filter, no animations needed
 */
const KanaShadow = () => {
  const [round, setRound] = useState(0);
  const [score, setScore] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);

  const generateRound = () => {
    const correctIdx = Math.floor(Math.random() * allKana.length);
    const correct = allKana[correctIdx];

    // Get 3 wrong options
    const wrongIndices = new Set<number>();
    while (wrongIndices.size < 3) {
      const idx = Math.floor(Math.random() * allKana.length);
      if (idx !== correctIdx) wrongIndices.add(idx);
    }

    const options = [correct, ...Array.from(wrongIndices).map(i => allKana[i])];
    return {
      shadow: correct,
      options: options.sort(() => Math.random() - 0.5),
    };
  };

  const [currentRound, setCurrentRound] = useState(generateRound);

  const handleGuess = (kana: string) => {
    if (revealed) return;

    const isCorrect = kana === currentRound.shadow.kana;
    setFeedback(isCorrect ? 'correct' : 'wrong');
    setRevealed(true);
    if (isCorrect) setScore(s => s + 1);
  };

  const nextRound = () => {
    setCurrentRound(generateRound());
    setRevealed(false);
    setFeedback(null);
    setRound(r => r + 1);
  };

  return (
    <div className='flex flex-1 flex-col items-center justify-center gap-8 p-4'>
      <div className='flex gap-6 text-xl text-(--main-color)'>
        <span>Round: {round + 1}</span>
        <span>Score: {score}</span>
      </div>

      {/* Shadow Display */}
      <div
        className={clsx(
          'flex h-40 w-40 items-center justify-center rounded-2xl',
          'border-2 border-(--border-color) bg-(--card-color)',
          'transition-all duration-500',
        )}
      >
        <span
          lang='ja'
          className='text-7xl text-(--main-color) transition-all duration-500'
          style={{
            filter: revealed ? 'blur(0)' : 'blur(8px)',
            opacity: revealed ? 1 : 0.6,
          }}
        >
          {currentRound.shadow.kana}
        </span>
      </div>

      {/* Options */}
      <div className='grid grid-cols-2 gap-4'>
        {currentRound.options.map((opt, i) => (
          <button
            key={i}
            onClick={() => handleGuess(opt.kana)}
            disabled={revealed}
            className={clsx(
              'h-20 w-20 rounded-xl text-3xl transition-all duration-200',
              'border-2',
              revealed && opt.kana === currentRound.shadow.kana
                ? 'border-green-500 bg-green-500/20 text-green-400'
                : revealed && feedback === 'wrong'
                  ? 'border-(--border-color) opacity-50'
                  : 'border-(--border-color) bg-(--card-color) text-(--main-color) hover:scale-105 hover:border-(--accent-color)',
            )}
          >
            {opt.kana}
          </button>
        ))}
      </div>

      {revealed && (
        <div className='flex flex-col items-center gap-2'>
          <p
            className={clsx(
              'text-xl',
              feedback === 'correct' ? 'text-green-400' : 'text-red-400',
            )}
          >
            {feedback === 'correct' ? '✓ Correct!' : '✗ Wrong!'} It's "
            {currentRound.shadow.romanji}"
          </p>
          <button
            onClick={nextRound}
            className='mt-2 rounded-xl bg-(--accent-color) px-6 py-3 text-white transition-transform hover:scale-105'
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default KanaShadow;
