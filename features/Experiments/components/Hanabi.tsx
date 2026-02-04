'use client';
import { useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useClick, useCorrect } from '@/shared/hooks/useAudio';
import { allKana } from '../data/kanaData';
import clsx from 'clsx';
import { Sparkles, Moon } from 'lucide-react';

interface Firework {
  id: number;
  x: number;
  y: number;
  kana: string;
  color: string;
}

const COLORS = [
  '#f472b6', // pink-400
  '#fbbf24', // amber-400
  '#34d399', // emerald-400
  '#60a5fa', // blue-400
  '#a78bfa', // violet-400
  '#f87171', // red-400
];

export default function Hanabi() {
  const [fireworks, setFireworks] = useState<Firework[]>([]);
  const { playClick } = useClick();
  const { playCorrect } = useCorrect();
  const idCounter = useRef(0);

  const launchFirework = useCallback(
    (e: React.MouseEvent | React.TouchEvent) => {
      let clientX, clientY;
      if ('touches' in e) {
        clientX = e.touches[0].clientX;
        clientY = e.touches[0].clientY;
      } else {
        clientX = e.clientX;
        clientY = e.clientY;
      }

      // Get container bounds
      const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
      const x = clientX - rect.left;
      const y = clientY - rect.top;

      playCorrect();
      const kanaObj = allKana[Math.floor(Math.random() * allKana.length)];
      const newFirework: Firework = {
        id: idCounter.current++,
        x,
        y,
        kana: kanaObj.kana,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
      };

      setFireworks(prev => [...prev, newFirework]);

      // Remove after animation
      setTimeout(() => {
        setFireworks(prev => prev.filter(f => f.id !== newFirework.id));
      }, 1500);
    },
    [playCorrect],
  );

  return (
    <div
      className='relative flex flex-1 cursor-crosshair flex-col overflow-hidden rounded-3xl border border-(--border-color) bg-[#0a0a0f]'
      onMouseDown={launchFirework}
      onTouchStart={launchFirework}
    >
      {/* Background Decor */}
      <div className='absolute inset-0 opacity-20'>
        <div className='absolute top-20 right-20 text-white/20'>
          <Moon size={80} strokeWidth={1} />
        </div>
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className='absolute animate-pulse rounded-full bg-white'
            style={{
              width: Math.random() * 3,
              height: Math.random() * 3,
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
            }}
          />
        ))}
      </div>

      {/* Header */}
      <div className='pointer-events-none absolute top-8 left-8 z-10'>
        <div className='flex items-center gap-2'>
          <Sparkles className='text-yellow-400' size={24} />
          <h1 className='text-3xl font-bold tracking-tight text-white'>
            Hanabi ✨
          </h1>
        </div>
        <p className='text-white/50'>Click anywhere to launch fireworks</p>
      </div>

      {/* Firework Display */}
      <AnimatePresence>
        {fireworks.map(fw => (
          <motion.div
            key={fw.id}
            initial={{ scale: 0, opacity: 1 }}
            animate={{ scale: 1, opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.2, ease: 'easeOut' }}
            className='pointer-events-none absolute flex items-center justify-center'
            style={{
              left: fw.x,
              top: fw.y,
              transform: 'translate(-50%, -50%)',
            }}
          >
            {/* Exploding particles (simplified visual) */}
            <div className='relative'>
              <span
                className='text-6xl font-bold'
                style={{
                  color: fw.color,
                  textShadow: `0 0 20px ${fw.color}, 0 0 40px ${fw.color}`,
                }}
              >
                {fw.kana}
              </span>

              {/* Particle rings */}
              {[...Array(8)].map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ x: 0, y: 0, opacity: 1 }}
                  animate={{
                    x: Math.cos(i * (Math.PI / 4)) * 100,
                    y: Math.sin(i * (Math.PI / 4)) * 100,
                    opacity: 0,
                  }}
                  className='absolute top-1/2 left-1/2 h-2 w-2 rounded-full'
                  style={{ backgroundColor: fw.color }}
                />
              ))}
            </div>
          </motion.div>
        ))}
      </AnimatePresence>

      <div className='pointer-events-none absolute bottom-8 left-1/2 -translate-x-1/2 text-xs tracking-widest text-white uppercase opacity-30'>
        Traditional Japanese Fireworks
      </div>
    </div>
  );
}
