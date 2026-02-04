'use client';
import { useEffect, useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useClick, useCorrect } from '@/shared/hooks/useAudio';
import { allKana } from '../data/kanaData';
import clsx from 'clsx';
import { Sparkles } from 'lucide-react';

interface Bubble {
  id: number;
  kana: string;
  romaji: string;
  x: number;
  size: number;
  speed: number;
  color: string;
}

const COLORS = [
  'from-blue-400/40 to-cyan-400/40',
  'from-purple-400/40 to-pink-400/40',
  'from-pink-400/40 to-rose-400/40',
  'from-cyan-400/40 to-teal-400/40',
  'from-indigo-400/40 to-blue-400/40',
  'from-emerald-400/40 to-teal-400/40',
];

export default function KanaPop() {
  const [bubbles, setBubbles] = useState<Bubble[]>([]);
  const [score, setScore] = useState(0);
  const [isMounted, setIsMounted] = useState(false);
  const { playClick } = useClick();
  const { playCorrect } = useCorrect();
  const idCounter = useRef(0);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const spawnBubble = useCallback(() => {
    const kanaObj = allKana[Math.floor(Math.random() * allKana.length)];
    const newBubble: Bubble = {
      id: idCounter.current++,
      kana: kanaObj.kana,
      romaji: kanaObj.romanji,
      x: Math.random() * 80 + 10,
      size: Math.random() * 30 + 70, // 70-100px
      speed: Math.random() * 3 + 4, // 4-7s
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
    };
    setBubbles(prev => [...prev, newBubble]);
  }, []);

  useEffect(() => {
    if (!isMounted) return;
    const interval = setInterval(spawnBubble, 1200);
    return () => clearInterval(interval);
  }, [isMounted, spawnBubble]);

  const popBubble = (id: number) => {
    playCorrect();
    setScore(s => s + 1);
    setBubbles(prev => prev.filter(b => b.id !== id));
  };

  if (!isMounted) return null;

  return (
    <div className='relative flex min-h-[85vh] flex-1 flex-col overflow-hidden rounded-3xl border border-(--border-color) bg-gradient-to-b from-transparent to-(--main-color)/5'>
      {/* Header Info */}
      <div className='pointer-events-none absolute top-8 left-8 z-10 flex flex-col gap-1'>
        <div className='flex items-center gap-2'>
          <Sparkles className='text-yellow-400' size={24} />
          <h1 className='text-3xl font-bold tracking-tight text-(--main-color)'>
            Kana Pop!
          </h1>
        </div>
        <div className='flex items-center gap-4'>
          <p className='text-lg font-medium text-(--secondary-color)'>
            Score: <span className='text-(--main-color)'>{score}</span>
          </p>
        </div>
      </div>

      {/* Play Area */}
      <div className='relative flex-1'>
        <AnimatePresence>
          {bubbles.map(bubble => (
            <motion.button
              key={bubble.id}
              initial={{
                y: '100vh',
                x: `${bubble.x}vw`,
                opacity: 0,
                scale: 0.5,
              }}
              animate={{
                y: '-20vh',
                opacity: 1,
                scale: 1,
                transition: { duration: bubble.speed, ease: 'linear' },
              }}
              exit={{
                scale: 2,
                opacity: 0,
                transition: { duration: 0.2, ease: 'easeOut' },
              }}
              onPointerDown={() => popBubble(bubble.id)}
              className={clsx(
                'absolute flex cursor-pointer flex-col items-center justify-center rounded-full border border-white/30 shadow-[0_0_20px_rgba(255,255,255,0.1)] backdrop-blur-md transition-transform hover:scale-110 active:scale-95',
                'bg-gradient-to-br',
                bubble.color,
              )}
              style={{
                width: bubble.size,
                height: bubble.size,
                left: 0, // Positioned by initial x
              }}
            >
              {/* Shine effect */}
              <div className='absolute top-2 left-4 h-1/4 w-1/4 rounded-full bg-white/40 blur-[2px]' />

              <span className='text-3xl font-bold text-white drop-shadow-md select-none'>
                {bubble.kana}
              </span>
              <span className='font-mono text-[10px] font-bold tracking-wider text-white/80 uppercase select-none'>
                {bubble.romaji}
              </span>

              {/* Float animation on the bubble itself */}
              <style jsx>{`
                button {
                  animation: float 3s ease-in-out infinite;
                }
                @keyframes float {
                  0%,
                  100% {
                    transform: translateX(0);
                  }
                  50% {
                    transform: translateX(10px);
                  }
                }
              `}</style>
            </motion.button>
          ))}
        </AnimatePresence>
      </div>

      {/* Instructions */}
      <div className='pointer-events-none absolute bottom-8 left-1/2 -translate-x-1/2 text-sm text-(--secondary-color) opacity-50'>
        Pop the bubbles to score points!
      </div>
    </div>
  );
}
