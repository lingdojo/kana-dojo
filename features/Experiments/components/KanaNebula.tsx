'use client';
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useClick } from '@/shared/hooks/useAudio';
import { allKana } from '../data/kanaData';
import { Telescope, Rocket } from 'lucide-react';

interface StarKana {
  id: number;
  kana: string;
  romaji: string;
  x: number;
  y: number;
  z: number; // For depth effect
  scale: number;
  opacity: number;
}

export default function KanaNebula() {
  const [stars, setStars] = useState<StarKana[]>([]);
  const { playClick } = useClick();
  const idCounter = useRef(0);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const spawnStar = () => {
      const kanaObj = allKana[Math.floor(Math.random() * allKana.length)];
      const newStar: StarKana = {
        id: idCounter.current++,
        kana: kanaObj.kana,
        romaji: kanaObj.romanji,
        x: Math.random() * 100,
        y: Math.random() * 100,
        z: Math.random() * 1000 + 500, // Travel distance
        scale: Math.random() * 0.5 + 0.1,
        opacity: Math.random() * 0.5 + 0.2,
      };
      setStars(prev => [...prev, newStar].slice(-50)); // Keep legacy clean
    };

    const interval = setInterval(spawnStar, 400);
    return () => clearInterval(interval);
  }, []);

  return (
    <div
      ref={containerRef}
      className='relative flex flex-1 cursor-none flex-col overflow-hidden rounded-[3rem] border border-(--border-color) bg-[#05050a]'
    >
      {/* Space Overlay */}
      <div className='pointer-events-none absolute inset-0 z-10 bg-[radial-gradient(circle_at_center,_transparent_0%,_#000_100%)]' />

      {/* Distant Stars (Static) */}
      <div className='absolute inset-0 opacity-30'>
        {[...Array(100)].map((_, i) => (
          <div
            key={i}
            className='absolute rounded-full bg-white transition-opacity'
            style={{
              width: Math.random() * 2,
              height: Math.random() * 2,
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              opacity: Math.random(),
            }}
          />
        ))}
      </div>

      {/* Header */}
      <div className='pointer-events-none absolute top-10 left-10 z-20'>
        <h1 className='flex items-center gap-3 text-4xl font-black text-white'>
          <Telescope className='text-indigo-400' /> KANA NEBULA
        </h1>
        <p className='mt-2 text-xs tracking-[0.3em] text-indigo-300 uppercase opacity-60'>
          Deep Space Exploration
        </p>
      </div>

      {/* Travelling Stars */}
      <div className='relative flex-1 overflow-hidden perspective-[1000px]'>
        <AnimatePresence>
          {stars.map(star => (
            <motion.div
              key={star.id}
              initial={{
                x: `${star.x}vw`,
                y: `${star.y}vh`,
                z: -star.z,
                scale: 0,
                opacity: 0,
              }}
              animate={{
                z: 1000,
                scale: star.scale * 4,
                opacity: [0, star.opacity, 0],
                transition: { duration: 6, ease: 'easeIn' },
              }}
              exit={{ opacity: 0 }}
              onPointerDown={() => playClick()}
              className='group pointer-events-auto absolute flex cursor-pointer items-center justify-center'
              style={{
                top: 0,
                left: 0,
                transformStyle: 'preserve-3d',
              }}
            >
              <div className='flex flex-col items-center'>
                <span className='font-bold text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.8)] transition-transform group-hover:scale-150'>
                  {star.kana}
                </span>
                <span className='font-mono text-[10px] text-indigo-300 opacity-0 transition-opacity group-hover:opacity-100'>
                  {star.romaji}
                </span>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Navigation Cursor Decor */}
      <motion.div
        className='pointer-events-none fixed z-50 flex items-center justify-center'
        animate={{
          x: 'var(--mouse-x)',
          y: 'var(--mouse-y)',
        }}
      >
        <div className='relative flex h-12 w-12 items-center justify-center'>
          <div className='absolute inset-0 animate-ping rounded-full border-2 border-indigo-500/30' />
          <Rocket className='rotate-[-45deg] text-white' size={20} />
        </div>
      </motion.div>

      {/* Mouse Tracker Script */}
      <script
        dangerouslySetInnerHTML={{
          __html: `
        document.addEventListener('mousemove', (e) => {
          document.documentElement.style.setProperty('--mouse-x', e.clientX + 'px');
          document.documentElement.style.setProperty('--mouse-y', e.clientY + 'px');
        });
      `,
        }}
      />

      <div className='absolute right-10 bottom-10 z-20 font-mono text-[10px] tracking-widest text-indigo-400 uppercase opacity-20'>
        Sector {Math.floor(idCounter.current / 10)}-Alpha
      </div>
    </div>
  );
}
