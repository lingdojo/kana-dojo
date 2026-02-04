'use client';
import { useEffect, useState } from 'react';
import { Play, Pause } from 'lucide-react';
import clsx from 'clsx';
import { useClick } from '@/shared/hooks/useAudio';
import { getRandomKana } from '../data/kanaData';

type BreathPhase = 'inhale' | 'hold' | 'exhale' | 'rest';

const PHASE_DURATIONS = {
  inhale: 4000,
  hold: 4000,
  exhale: 4000,
  rest: 2000,
};

const PHASE_LABELS = {
  inhale: 'Breathe In',
  hold: 'Hold',
  exhale: 'Breathe Out',
  rest: 'Rest',
};

const BreathingExercise = () => {
  const [isMounted, setIsMounted] = useState(false);
  const [isPlaying, setIsPlaying] = useState(true);
  const [phase, setPhase] = useState<BreathPhase>('inhale');
  const [currentKana, setCurrentKana] = useState(getRandomKana());
  const [cycleCount, setCycleCount] = useState(0);
  const { playClick } = useClick();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isPlaying) return;

    const timer = setTimeout(() => {
      switch (phase) {
        case 'inhale':
          setPhase('hold');
          break;
        case 'hold':
          setPhase('exhale');
          break;
        case 'exhale':
          setPhase('rest');
          break;
        case 'rest':
          setPhase('inhale');
          setCurrentKana(getRandomKana());
          setCycleCount(c => c + 1);
          break;
      }
    }, PHASE_DURATIONS[phase]);

    return () => clearTimeout(timer);
  }, [phase, isPlaying]);

  const togglePlay = () => {
    playClick();
    setIsPlaying(!isPlaying);
  };

  if (!isMounted) return null;

  const scale =
    phase === 'inhale' || phase === 'hold' ? 'scale-100' : 'scale-75';

  return (
    <div className='flex min-h-[80vh] flex-1 flex-col items-center justify-center gap-8'>
      {/* Breathing circle */}
      <div className='relative flex flex-col items-center gap-8'>
        <div
          className={clsx(
            'h-64 w-64 rounded-full md:h-80 md:w-80',
            'border-4 border-(--border-color) bg-(--card-color)',
            'flex items-center justify-center',
            'transition-transform ease-in-out',
            scale,
            phase === 'inhale' && 'duration-[4000ms]',
            phase === 'hold' && 'duration-[4000ms]',
            phase === 'exhale' && 'duration-[4000ms]',
            phase === 'rest' && 'duration-[2000ms]',
          )}
        >
          <div className='text-center'>
            <span
              lang='ja'
              className='block text-6xl text-(--main-color) md:text-8xl'
            >
              {currentKana.kana}
            </span>
            <span className='text-xl text-(--secondary-color) md:text-2xl'>
              {currentKana.romanji}
            </span>
          </div>
        </div>

        {/* Phase indicator */}
        <div className='text-center'>
          <p className='text-2xl font-medium text-(--main-color) md:text-3xl'>
            {PHASE_LABELS[phase]}
          </p>
          <p className='mt-2 text-sm text-(--secondary-color)'>
            Cycle {cycleCount + 1}
          </p>
        </div>

        {/* Play/Pause button */}
        <button
          onClick={togglePlay}
          className={clsx(
            'rounded-full p-4',
            'border border-(--border-color) bg-(--card-color)',
            'text-(--secondary-color) hover:text-(--main-color)',
            'transition-all duration-250 hover:cursor-pointer',
            'active:scale-95',
          )}
        >
          {isPlaying ? <Pause size={24} /> : <Play size={24} />}
        </button>
      </div>
    </div>
  );
};

export default BreathingExercise;
