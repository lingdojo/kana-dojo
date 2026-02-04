'use client';
import { useState, useCallback } from 'react';
import clsx from 'clsx';
import { allKana } from '../data/kanaData';

/**
 * Kana Mirror - Match hiragana with katakana pairs
 * Lightweight: Pure CSS animations, no external dependencies
 */
const KanaMirror = () => {
  const [pairs] = useState(() => {
    // Create 6 hiragana-katakana pairs
    const hiragana = allKana.slice(0, 46);
    const katakana = allKana.slice(46, 92);
    const indices = Array.from({ length: 6 }, () =>
      Math.floor(Math.random() * 46),
    );
    return indices.map(i => ({
      id: i,
      hiragana: hiragana[i].kana,
      katakana: katakana[i].kana,
      romanji: hiragana[i].romanji,
    }));
  });

  const [selected, setSelected] = useState<{
    type: 'h' | 'k';
    id: number;
  } | null>(null);
  const [matched, setMatched] = useState<number[]>([]);
  const [shuffledKatakana] = useState(() =>
    [...pairs].sort(() => Math.random() - 0.5),
  );

  const handleClick = useCallback(
    (type: 'h' | 'k', id: number) => {
      if (matched.includes(id)) return;

      if (!selected) {
        setSelected({ type, id });
      } else if (selected.type !== type && selected.id === id) {
        setMatched(prev => [...prev, id]);
        setSelected(null);
      } else {
        setSelected({ type, id });
      }
    },
    [selected, matched],
  );

  const allMatched = matched.length === pairs.length;

  return (
    <div className='flex flex-1 flex-col items-center justify-center gap-8 p-4'>
      <h2 className='text-2xl text-(--main-color)'>
        {allMatched ? '✨ Perfect Match!' : 'Match Hiragana ↔ Katakana'}
      </h2>

      <div className='flex gap-12'>
        {/* Hiragana Column */}
        <div className='flex flex-col gap-3'>
          {pairs.map(p => (
            <button
              key={`h-${p.id}`}
              onClick={() => handleClick('h', p.id)}
              disabled={matched.includes(p.id)}
              className={clsx(
                'h-16 w-16 rounded-xl text-3xl transition-all duration-200',
                'border-2 border-(--border-color)',
                matched.includes(p.id)
                  ? 'scale-90 bg-green-500/20 text-green-400'
                  : selected?.type === 'h' && selected.id === p.id
                    ? 'scale-110 bg-(--accent-color) text-white'
                    : 'bg-(--card-color) text-(--main-color) hover:scale-105',
              )}
            >
              {p.hiragana}
            </button>
          ))}
        </div>

        {/* Katakana Column (shuffled) */}
        <div className='flex flex-col gap-3'>
          {shuffledKatakana.map(p => (
            <button
              key={`k-${p.id}`}
              onClick={() => handleClick('k', p.id)}
              disabled={matched.includes(p.id)}
              className={clsx(
                'h-16 w-16 rounded-xl text-3xl transition-all duration-200',
                'border-2 border-(--border-color)',
                matched.includes(p.id)
                  ? 'scale-90 bg-green-500/20 text-green-400'
                  : selected?.type === 'k' && selected.id === p.id
                    ? 'scale-110 bg-(--accent-color) text-white'
                    : 'bg-(--card-color) text-(--main-color) hover:scale-105',
              )}
            >
              {p.katakana}
            </button>
          ))}
        </div>
      </div>

      {allMatched && (
        <button
          onClick={() => window.location.reload()}
          className='rounded-xl bg-(--accent-color) px-6 py-3 text-white transition-transform hover:scale-105'
        >
          Play Again
        </button>
      )}
    </div>
  );
};

export default KanaMirror;
