'use client';
import { useEffect, useState, useRef } from 'react';
import clsx from 'clsx';
import { allKana } from '../data/kanaData';

interface RainDrop {
  id: number;
  column: number;
  kana: string;
  romanji: string;
  speed: number;
  opacity: number;
  startDelay: number;
}

const COLUMNS = 20;
const MAX_DROPS = 60;
const SPAWN_INTERVAL = 200;

const KanaRain = () => {
  const [isMounted, setIsMounted] = useState(false);
  const [drops, setDrops] = useState<RainDrop[]>([]);
  const [hoveredId, setHoveredId] = useState<number | null>(null);
  const idCounter = useRef(0);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted) return;

    const createDrop = (): RainDrop => {
      const kana = allKana[Math.floor(Math.random() * allKana.length)];
      return {
        id: idCounter.current++,
        column: Math.floor(Math.random() * COLUMNS),
        kana: kana.kana,
        romanji: kana.romanji,
        speed: Math.random() * 2 + 3, // 4-6 seconds
        opacity: Math.random() * 0.4 + 0.4, // 0.4-0.8
        startDelay: Math.random() * 5 // 0-5 seconds into animation
      };
    };

    // Create 40 initial drops spread throughout the screen
    const initial: RainDrop[] = [];
    for (let i = 0; i < 40; i++) {
      initial.push(createDrop());
    }
    setDrops(initial);

    // Spawn a new drop every 300ms
    const interval = setInterval(() => {
      setDrops(prev => {
        const newDrop = createDrop();
        const updated = [...prev, newDrop];
        // Keep only the 60 most recent drops
        return updated.length > MAX_DROPS ? updated.slice(-MAX_DROPS) : updated;
      });
    }, SPAWN_INTERVAL);

    return () => clearInterval(interval);
  }, [isMounted]);

  if (!isMounted) return null;

  return (
    <div className='relative flex-1 min-h-[80vh] overflow-hidden'>
      {drops.map(drop => (
        <div
          key={drop.id}
          className='absolute text-2xl md:text-3xl cursor-default select-none will-change-transform'
          style={{
            left: `${(drop.column / COLUMNS) * 100 + 2.5}%`,
            animation: `rain-fall ${drop.speed}s linear infinite`,
            animationDelay: `-${drop.startDelay}s`
          }}
          onMouseEnter={() => setHoveredId(drop.id)}
          onMouseLeave={() => setHoveredId(null)}
        >
          <span
            lang='ja'
            className={clsx(
              'text-[var(--main-color)] transition-all duration-200',
              hoveredId === drop.id && 'text-green-400 scale-150'
            )}
            style={{
              opacity: hoveredId === drop.id ? 1 : drop.opacity
            }}
          >
            {drop.kana}
          </span>
          {hoveredId === drop.id && (
            <span className='absolute -bottom-5 left-1/2 -translate-x-1/2 text-xs text-green-400 whitespace-nowrap font-mono'>
              {drop.romanji}
            </span>
          )}
        </div>
      ))}
      <style jsx>{`
        @keyframes rain-fall {
          0% {
            transform: translateY(-5vh);
          }
          100% {
            transform: translateY(105vh);
          }
        }
      `}</style>
    </div>
  );
};

export default KanaRain;
