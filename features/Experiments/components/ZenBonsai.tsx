'use client';
import { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useClick, useCorrect } from '@/shared/hooks/useAudio';
import { allKana } from '../data/kanaData';
import clsx from 'clsx';
import { TreePine, Droplet, Sun, Wind, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';

interface PlantElement {
  id: number;
  type: 'leaf' | 'flower' | 'sparkle';
  x: number;
  y: number;
  kana: string;
  size: number;
  color: string;
}

const COLORS = [
  '#2ecc71',
  '#27ae60',
  '#a29bfe',
  '#fab1a0',
  '#ffeaa7',
  '#81ecec',
];

export default function ZenBonsai() {
  const [level, setLevel] = useState(1);
  const [energy, setEnergy] = useState(0);
  const [elements, setElements] = useState<PlantElement[]>([]);
  const { playClick } = useClick();
  const { playCorrect } = useCorrect();
  const idCounter = useRef(0);

  const addElement = useCallback(
    (type: PlantElement['type']) => {
      const kanaObj = allKana[Math.floor(Math.random() * allKana.length)];
      const newElement: PlantElement = {
        id: idCounter.current++,
        type,
        x: (Math.random() - 0.5) * 200, // Random spread around center
        y: -Math.random() * 200 - 50, // Growing upwards
        kana: kanaObj.kana,
        size: Math.random() * 1 + 1,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
      };
      setElements(prev => [...prev, newElement]);

      setEnergy(e => {
        const next = e + 1;
        if (next >= level * 10) {
          setLevel(l => l + 1);
          confetti({ particleCount: 50, spread: 60, origin: { y: 0.7 } });
          playCorrect();
          return 0;
        }
        return next;
      });
    },
    [level, playCorrect],
  );

  const handleInteract = (type: 'water' | 'sun' | 'wind') => {
    playClick();
    if (type === 'water') addElement('leaf');
    if (type === 'sun') addElement('flower');
    if (type === 'wind') addElement('sparkle');
  };

  return (
    <div className='flex min-h-[85vh] flex-1 flex-col items-center justify-between gap-8 overflow-hidden'>
      <div className='text-center'>
        <h1 className='flex items-center justify-center gap-2 text-3xl font-bold text-(--main-color)'>
          <TreePine className='text-emerald-500' /> Zen Bonsai
        </h1>
        <p className='text-(--secondary-color)'>
          Nurture your kana tree with mindful actions
        </p>
      </div>

      <div className='relative flex w-full flex-1 items-end justify-center'>
        {/* Pot */}
        <div className='relative z-20 h-16 w-48 rounded-t-lg rounded-b-3xl border-t-4 border-[#5d4037] bg-gradient-to-b from-[#4a3728] to-[#2d1e14] shadow-2xl'>
          <div className="pointer-events-none absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/dark-leather.png')] opacity-20" />
        </div>

        {/* Tree Trunk */}
        <motion.div
          animate={{ height: 100 + level * 20 }}
          className='absolute bottom-12 w-4 origin-bottom rounded-full bg-gradient-to-t from-[#5d4037] to-[#8d6e63]'
        />

        {/* Elements Container */}
        <div className='absolute bottom-16 left-1/2 h-0 w-0 -translate-x-1/2'>
          <AnimatePresence>
            {elements.map(el => (
              <motion.div
                key={el.id}
                initial={{ scale: 0, opacity: 0, x: 0, y: 0 }}
                animate={{
                  scale: el.size,
                  opacity: 1,
                  x: el.x,
                  y: el.y,
                }}
                className='absolute flex items-center justify-center select-none'
                style={{ color: el.color }}
              >
                {el.type === 'leaf' && (
                  <div className='relative'>
                    <span className='text-xl font-bold drop-shadow-sm'>
                      {el.kana}
                    </span>
                    <div className='absolute -inset-2 rounded-full bg-current opacity-20 blur-md' />
                  </div>
                )}
                {el.type === 'flower' && (
                  <div className='relative'>
                    <span className='text-2xl font-black drop-shadow-md'>
                      ✿{el.kana}
                    </span>
                    <div className='absolute -inset-3 rounded-full bg-white opacity-40 blur-lg' />
                  </div>
                )}
                {el.type === 'sparkle' && (
                  <Sparkles className='animate-pulse' size={16 * el.size} />
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>

      {/* Controls */}
      <div className='flex flex-col items-center gap-6 pb-8'>
        <div className='h-2 w-64 overflow-hidden rounded-full bg-(--border-color)'>
          <motion.div
            className='h-full bg-emerald-400'
            animate={{ width: `${(energy / (level * 10)) * 100}%` }}
          />
        </div>
        <p className='text-sm font-bold tracking-tighter text-(--secondary-color) uppercase'>
          Level {level} Evolution
        </p>

        <div className='flex gap-4'>
          <button
            onClick={() => handleInteract('water')}
            className='flex flex-col items-center gap-2 rounded-2xl border border-(--border-color) bg-(--card-color) p-4 text-(--secondary-color) transition-all hover:border-blue-400 hover:text-blue-400 active:scale-95'
          >
            <Droplet />
            <span className='text-[10px] font-bold'>WATER</span>
          </button>
          <button
            onClick={() => handleInteract('sun')}
            className='flex flex-col items-center gap-2 rounded-2xl border border-(--border-color) bg-(--card-color) p-4 text-(--secondary-color) transition-all hover:border-orange-400 hover:text-orange-400 active:scale-95'
          >
            <Sun />
            <span className='text-[10px] font-bold'>SUN</span>
          </button>
          <button
            onClick={() => handleInteract('wind')}
            className='flex flex-col items-center gap-2 rounded-2xl border border-(--border-color) bg-(--card-color) p-4 text-(--secondary-color) transition-all hover:border-(--main-color) hover:text-(--main-color) active:scale-95'
          >
            <Wind />
            <span className='text-[10px] font-bold'>WIND</span>
          </button>
        </div>
      </div>
    </div>
  );
}
