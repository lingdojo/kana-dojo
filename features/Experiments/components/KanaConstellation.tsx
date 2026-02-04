'use client';
import { useEffect, useState, useCallback } from 'react';
import { RotateCcw, Star } from 'lucide-react';
import clsx from 'clsx';
import { useClick, useCorrect, useError } from '@/shared/hooks/useAudio';
import { hiraganaOnly } from '../data/kanaData';

interface ConstellationPoint {
  kana: string;
  romanji: string;
  x: number;
  y: number;
  order: number;
  isConnected: boolean;
}

const generateConstellation = (): ConstellationPoint[] => {
  // Pick 5-7 random kana
  const count = Math.floor(Math.random() * 3) + 5;
  const shuffled = [...hiraganaOnly]
    .sort(() => Math.random() - 0.5)
    .slice(0, count);

  // Generate positions in a rough pattern
  const points: ConstellationPoint[] = shuffled.map((k, i) => ({
    kana: k.kana,
    romanji: k.romanji,
    x: 15 + Math.random() * 70,
    y: 15 + Math.random() * 60,
    order: i,
    isConnected: false,
  }));

  return points;
};

const KanaConstellation = () => {
  const [isMounted, setIsMounted] = useState(false);
  const [points, setPoints] = useState<ConstellationPoint[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [lines, setLines] = useState<
    { x1: number; y1: number; x2: number; y2: number }[]
  >([]);
  const [isComplete, setIsComplete] = useState(false);
  const [score, setScore] = useState(0);
  const { playClick } = useClick();
  const { playCorrect } = useCorrect();
  const { playError } = useError();

  useEffect(() => {
    setIsMounted(true);
    setPoints(generateConstellation());
  }, []);

  const handlePointClick = useCallback(
    (index: number) => {
      const point = points[index];

      if (point.order === currentIndex) {
        playCorrect();

        // Mark as connected
        setPoints(prev =>
          prev.map((p, i) => (i === index ? { ...p, isConnected: true } : p)),
        );

        // Draw line from previous point
        if (currentIndex > 0) {
          const prevPoint = points.find(p => p.order === currentIndex - 1);
          if (prevPoint) {
            setLines(prev => [
              ...prev,
              {
                x1: prevPoint.x,
                y1: prevPoint.y,
                x2: point.x,
                y2: point.y,
              },
            ]);
          }
        }

        setCurrentIndex(prev => prev + 1);

        // Check if complete
        if (currentIndex === points.length - 1) {
          setIsComplete(true);
          setScore(s => s + 1);
        }
      } else {
        playError();
      }
    },
    [points, currentIndex, playCorrect, playError],
  );

  const resetGame = useCallback(() => {
    playClick();
    setPoints(generateConstellation());
    setCurrentIndex(0);
    setLines([]);
    setIsComplete(false);
  }, [playClick]);

  if (!isMounted) return null;

  const currentTarget = points.find(p => p.order === currentIndex);

  return (
    <div className='flex min-h-[80vh] flex-1 flex-col items-center justify-center gap-4'>
      {/* Header */}
      <div className='mb-4 text-center'>
        <h1 className='flex items-center justify-center gap-2 text-2xl text-(--main-color) md:text-3xl'>
          <Star size={28} />
          Kana Constellation
        </h1>
        <p className='mt-2 text-(--secondary-color)'>
          Connect the stars in order: {currentTarget?.romanji || 'Complete!'}
        </p>
        <p className='text-sm text-(--secondary-color)'>
          Constellations completed: {score}
        </p>
      </div>

      {/* Constellation area */}
      <div
        className={clsx(
          'relative aspect-[4/3] w-full max-w-2xl',
          'border border-(--border-color) bg-(--card-color)',
          'overflow-hidden rounded-2xl',
        )}
      >
        {/* SVG for lines */}
        <svg className='pointer-events-none absolute inset-0 h-full w-full'>
          {lines.map((line, i) => (
            <line
              key={i}
              x1={`${line.x1}%`}
              y1={`${line.y1}%`}
              x2={`${line.x2}%`}
              y2={`${line.y2}%`}
              stroke='var(--main-color)'
              strokeWidth='2'
              strokeLinecap='round'
              className='animate-pulse'
            />
          ))}
        </svg>

        {/* Points */}
        {points.map((point, index) => (
          <button
            key={index}
            onClick={() => handlePointClick(index)}
            className={clsx(
              'absolute h-12 w-12 -translate-x-1/2 -translate-y-1/2 md:h-14 md:w-14',
              'flex flex-col items-center justify-center rounded-full',
              'transition-all duration-200',
              'hover:scale-110 hover:cursor-pointer',
              point.isConnected
                ? 'bg-(--main-color) text-(--background-color)'
                : 'border-2 border-(--border-color) bg-(--background-color) hover:border-(--main-color)',
            )}
            style={{
              left: `${point.x}%`,
              top: `${point.y}%`,
            }}
          >
            <span lang='ja' className='text-lg md:text-xl'>
              {point.kana}
            </span>
            <span className='text-xs'>{point.romanji}</span>
          </button>
        ))}

        {/* Complete overlay */}
        {isComplete && (
          <div className='absolute inset-0 flex items-center justify-center bg-(--background-color)/80'>
            <div className='text-center'>
              <p className='mb-4 text-2xl text-(--main-color)'>
                ✨ Constellation Complete! ✨
              </p>
              <button
                onClick={resetGame}
                className={clsx(
                  'mx-auto flex items-center gap-2 rounded-xl px-6 py-3',
                  'border border-(--border-color) bg-(--card-color)',
                  'text-(--main-color)',
                  'hover:cursor-pointer hover:border-(--main-color)',
                  'transition-all duration-250 active:scale-95',
                )}
              >
                <RotateCcw size={20} />
                New Constellation
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Reset button */}
      {!isComplete && (
        <button
          onClick={resetGame}
          className={clsx(
            'mt-4 flex items-center gap-2 rounded-lg px-4 py-2',
            'border border-(--border-color) bg-(--card-color)',
            'text-(--secondary-color) hover:text-(--main-color)',
            'transition-all duration-250 hover:cursor-pointer',
            'active:scale-95',
          )}
        >
          <RotateCcw size={16} />
          Reset
        </button>
      )}
    </div>
  );
};

export default KanaConstellation;
