'use client';
import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useClick, useCorrect, useError } from '@/shared/hooks/useAudio';
import { allKana } from '../data/kanaData';
import clsx from 'clsx';
import { Music, Activity, Play } from 'lucide-react';

interface WaveKana {
  id: number;
  kana: string;
  romaji: string;
  x: number; // Percentage from right to left
  lane: number; // 0, 1, 2
}

const LANES = [0, 1, 2];
const SPAWN_INTERVAL = 1500;
const SPEED = 0.5; // Percent per frame

export default function KanaWave() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [waveKanas, setWaveKanas] = useState<WaveKana[]>([]);
  const [score, setScore] = useState(0);
  const [activeLane, setActiveLane] = useState(1);
  const { playClick } = useClick();
  const { playCorrect } = useCorrect();
  const { playError } = useError();
  const idCounter = useRef(0);
  const requestRef = useRef<number>(null);
  const lastSpawnRef = useRef<number>(0);

  const spawnKana = useCallback(() => {
    const kanaObj = allKana[Math.floor(Math.random() * allKana.length)];
    const newWave: WaveKana = {
      id: idCounter.current++,
      kana: kanaObj.kana,
      romaji: kanaObj.romanji,
      x: 110, // Start off-screen right
      lane: Math.floor(Math.random() * 3),
    };
    setWaveKanas(prev => [...prev, newWave]);
  }, []);

  const update = useCallback(
    (time: number) => {
      if (time - lastSpawnRef.current > SPAWN_INTERVAL) {
        spawnKana();
        lastSpawnRef.current = time;
      }

      setWaveKanas(prev => {
        const filtered = prev
          .map(k => ({ ...k, x: k.x - SPEED }))
          .filter(k => k.x > -10);

        // Check for misses (characters that passed the target line at x=15)
        const missed = filtered.find(
          k => k.x < 15 && k.x > 14 && k.lane === activeLane,
        );
        // Logic for hitting is in handleHit

        return filtered;
      });

      requestRef.current = requestAnimationFrame(update);
    },
    [spawnKana, activeLane],
  );

  useEffect(() => {
    if (isPlaying) {
      requestRef.current = requestAnimationFrame(update);
    } else {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    }
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [isPlaying, update]);

  const handleLaneChange = (lane: number) => {
    setActiveLane(lane);
    playClick();
  };

  const checkHit = () => {
    const targetRange = [10, 25]; // Range where it counts as a hit
    const hit = waveKanas.find(
      k =>
        k.lane === activeLane && k.x >= targetRange[0] && k.x <= targetRange[1],
    );

    if (hit) {
      playCorrect();
      setScore(s => s + 100);
      setWaveKanas(prev => prev.filter(k => k.id !== hit.id));
    } else {
      playError();
      setScore(s => Math.max(0, s - 50));
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isPlaying) return;
      if (e.key === 'ArrowUp') handleLaneChange(Math.max(0, activeLane - 1));
      if (e.key === 'ArrowDown') handleLaneChange(Math.min(2, activeLane + 1));
      if (e.key === ' ' || e.key === 'Enter') checkHit();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPlaying, activeLane, waveKanas]);

  return (
    <div className='flex min-h-[85vh] flex-1 flex-col gap-8'>
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='flex items-center gap-2 text-3xl font-bold text-(--main-color)'>
            <Music className='text-pink-400' /> Kana Wave
          </h1>
          <p className='text-(--secondary-color)'>
            Catch the kana in the target zone!
          </p>
        </div>
        <div className='flex flex-col items-end'>
          <span className='text-sm tracking-widest text-(--secondary-color) uppercase'>
            Score
          </span>
          <span className='font-mono text-4xl font-black text-(--main-color)'>
            {score.toString().padStart(6, '0')}
          </span>
        </div>
      </div>

      {!isPlaying ? (
        <div className='flex flex-1 flex-col items-center justify-center gap-6 rounded-[3rem] border-2 border-dashed border-(--border-color) bg-(--card-color)/50'>
          <Activity size={64} className='text-(--main-color) opacity-20' />
          <div className='space-y-2 text-center'>
            <p className='text-(--secondary-color)'>
              Use Arrow Keys to switch lanes and Space to hit!
            </p>
            <p className='text-xs text-(--secondary-color) opacity-60'>
              Wait for characters to reach the target line on the left.
            </p>
          </div>
          <button
            onClick={() => {
              playClick();
              setIsPlaying(true);
            }}
            className='flex items-center gap-3 rounded-2xl bg-(--main-color) px-12 py-5 text-xl font-bold text-white shadow-lg transition-transform hover:scale-105 active:scale-95'
          >
            <Play fill='currentColor' /> START SESSION
          </button>
        </div>
      ) : (
        <div className='relative flex-1 overflow-hidden rounded-[3rem] border border-(--border-color) bg-(--card-color) shadow-2xl'>
          {/* LANES */}
          <div className='absolute inset-0 flex flex-col'>
            {LANES.map(l => (
              <div
                key={l}
                className={clsx(
                  'relative flex flex-1 items-center border-b border-(--border-color)/30 transition-colors duration-300',
                  activeLane === l ? 'bg-(--main-color)/[0.03]' : '',
                )}
                onClick={() => handleLaneChange(l)}
              >
                {/* Lane Marker */}
                {activeLane === l && (
                  <motion.div
                    layoutId='lane-indicator'
                    className='absolute left-6 h-12 w-1.5 rounded-full bg-(--main-color) shadow-[0_0_15px_var(--main-color)]'
                  />
                )}
              </div>
            ))}
          </div>

          {/* Target Zone */}
          <div className='pointer-events-none absolute inset-y-0 left-[15%] w-20 border-l-2 border-dashed border-(--main-color)/40 bg-gradient-to-r from-(--main-color)/10 to-transparent' />

          {/* Moving Kanas */}
          <AnimatePresence>
            {waveKanas.map(k => (
              <motion.div
                key={k.id}
                className='absolute flex flex-col items-center justify-center rounded-2xl border border-(--border-color) bg-(--card-color) p-3 shadow-sm'
                style={{
                  left: `${k.x}%`,
                  top: `${k.lane * 33.33 + 16.66}%`,
                  transform: 'translate(-50%, -50%)',
                }}
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.5 }}
              >
                <span className='text-2xl font-bold text-(--main-color)'>
                  {k.kana}
                </span>
                <span className='font-mono text-[10px] text-(--secondary-color) uppercase'>
                  {k.romaji}
                </span>
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Action Zone Overlay */}
          <div className='absolute bottom-8 left-1/2 flex -translate-x-1/2 items-center gap-4'>
            <button
              onPointerDown={checkHit}
              className='h-20 w-40 rounded-full bg-(--main-color) text-xl font-black text-white shadow-lg transition-transform active:scale-95'
            >
              HIT!
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
