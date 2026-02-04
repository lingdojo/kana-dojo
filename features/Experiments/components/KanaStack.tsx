'use client';
import { useState, useCallback } from 'react';
import clsx from 'clsx';
import { allKana } from '../data/kanaData';

/**
 * Kana Stack - Stack kana cards by romanji alphabetically
 * Lightweight: Simple drag simulation with transitions
 */
const KanaStack = () => {
  const [cards, setCards] = useState(() => {
    const shuffled = [...allKana]
      .sort(() => Math.random() - 0.5)
      .slice(0, 8)
      .map((k, i) => ({ ...k, id: i, stacked: false }));
    return shuffled;
  });

  const [stack, setStack] = useState<typeof cards>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const getNextExpected = useCallback(() => {
    const unstacked = cards.filter(c => !c.stacked);
    if (unstacked.length === 0) return null;
    return unstacked.reduce((min, c) =>
      c.romanji.localeCompare(min.romanji) < 0 ? c : min,
    );
  }, [cards]);

  const handleCardClick = (id: number) => {
    const card = cards.find(c => c.id === id);
    if (!card || card.stacked) return;

    const expected = getNextExpected();
    if (expected && card.id === expected.id) {
      setCards(prev =>
        prev.map(c => (c.id === id ? { ...c, stacked: true } : c)),
      );
      setStack(prev => [...prev, card]);
      setSelectedId(null);
    } else {
      setSelectedId(id);
      setTimeout(() => setSelectedId(null), 300);
    }
  };

  const allStacked = stack.length === 8;

  const restart = () => {
    const shuffled = [...allKana]
      .sort(() => Math.random() - 0.5)
      .slice(0, 8)
      .map((k, i) => ({ ...k, id: i, stacked: false }));
    setCards(shuffled);
    setStack([]);
  };

  return (
    <div className='flex flex-1 flex-col items-center justify-center gap-8 p-4'>
      <h2 className='text-xl text-(--main-color)'>
        {allStacked
          ? '🎉 Perfect Stack!'
          : `Stack alphabetically by romanji (${stack.length}/8)`}
      </h2>
      <p className='text-sm text-(--secondary-color)'>
        Next: Pick the kana with the earliest romanji
      </p>

      {/* Available Cards */}
      <div className='flex flex-wrap justify-center gap-3'>
        {cards
          .filter(c => !c.stacked)
          .map(card => (
            <button
              key={card.id}
              onClick={() => handleCardClick(card.id)}
              className={clsx(
                'flex h-20 w-20 flex-col items-center justify-center rounded-xl',
                'border-2 transition-all duration-200',
                selectedId === card.id
                  ? 'animate-shake scale-95 border-red-500 bg-red-500/20'
                  : 'border-(--border-color) bg-(--card-color) hover:scale-105 hover:border-(--accent-color)',
              )}
            >
              <span lang='ja' className='text-3xl text-(--main-color)'>
                {card.kana}
              </span>
              <span className='text-xs text-(--secondary-color)'>
                {card.romanji}
              </span>
            </button>
          ))}
      </div>

      {/* Stack */}
      <div className='flex h-24 items-end gap-1'>
        {stack.map((card, i) => (
          <div
            key={card.id}
            className='flex h-16 w-12 items-center justify-center rounded-lg border border-green-500 bg-green-500/20 text-green-400'
            style={{
              animation: 'stack-in 0.3s ease-out',
            }}
          >
            <span lang='ja' className='text-xl'>
              {card.kana}
            </span>
          </div>
        ))}
      </div>

      {allStacked && (
        <button
          onClick={restart}
          className='rounded-xl bg-(--accent-color) px-6 py-3 text-white transition-transform hover:scale-105'
        >
          Play Again
        </button>
      )}

      <style jsx>{`
        @keyframes shake {
          0%,
          100% {
            transform: translateX(0);
          }
          25% {
            transform: translateX(-4px);
          }
          75% {
            transform: translateX(4px);
          }
        }
        .animate-shake {
          animation: shake 0.3s ease-in-out;
        }
        @keyframes stack-in {
          from {
            transform: translateY(-20px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
};

export default KanaStack;
