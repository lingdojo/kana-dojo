'use client';
import { useEffect, useState, useRef } from 'react';
import clsx from 'clsx';
import { getRandomKana } from '../data/kanaData';

interface FloatingKana {
  id: number;
  kana: string;
  romanji: string;
  x: number;
  y: number;
  size: number;
  duration: number;
  delay: number;
  opacity: number;
}

const AmbientMode = () => {
  const [isMounted, setIsMounted] = useState(false);
  const [floatingKana, setFloatingKana] = useState<FloatingKana[]>([]);
  const [hoveredId, setHoveredId] = useState<number | null>(null);
  const idCounter = useRef(0);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted) return;

    // Initial batch
    const initial: FloatingKana[] = [];
    for (let i = 0; i < 15; i++) {
      const kana = getRandomKana();
      initial.push({
        id: idCounter.current++,
        kana: kana.kana,
        romanji: kana.romanji,
        x: Math.random() * 90 + 5,
        y: Math.random() * 90 + 5,
        size: Math.random() * 2 + 1.5,
        duration: Math.random() * 20 + 15,
        delay: Math.random() * 5,
        opacity: Math.random() * 0.4 + 0.2
      });
    }
    setFloatingKana(initial);

    // Add new kana periodically
    const interval = setInterval(() => {
      const kana = getRandomKana();
      setFloatingKana(prev => {
        const newKana: FloatingKana = {
          id: idCounter.current++,
          kana: kana.kana,
          romanji: kana.romanji,
          x: Math.random() * 90 + 5,
          y: 110,
          size: Math.random() * 2 + 1.5,
          duration: Math.random() * 20 + 15,
          delay: 0,
          opacity: Math.random() * 0.4 + 0.2
        };
        // Keep max 25 kana
        const updated = [...prev, newKana];
        if (updated.length > 25) {
          return updated.slice(-25);
        }
        return updated;
      });
    }, 3000);

    return () => clearInterval(interval);
  }, [isMounted]);

  if (!isMounted) return null;

  return (
    <div className='relative flex-1 min-h-[80vh] overflow-hidden'>
      {/* Floating kana */}
      {floatingKana.map(item => (
        <div
          key={item.id}
          className='absolute transition-opacity duration-500 cursor-default select-none'
          style={{
            left: `${item.x}%`,
            top: `${item.y}%`,
            fontSize: `${item.size}rem`,
            opacity: hoveredId === item.id ? 1 : item.opacity,
            animation: `float-up ${item.duration}s linear ${item.delay}s infinite`,
            transform: 'translateX(-50%)'
          }}
          onMouseEnter={() => setHoveredId(item.id)}
          onMouseLeave={() => setHoveredId(null)}
        >
          <span
            lang='ja'
            className={clsx(
              'text-[var(--main-color)] transition-all duration-300',
              hoveredId === item.id && 'scale-125'
            )}
          >
            {item.kana}
          </span>
          {hoveredId === item.id && (
            <span className='absolute -bottom-6 left-1/2 -translate-x-1/2 text-sm text-[var(--secondary-color)] whitespace-nowrap'>
              {item.romanji}
            </span>
          )}
        </div>
      ))}

      {/* CSS animation */}
      <style jsx>{`
        @keyframes float-up {
          0% {
            transform: translateX(-50%) translateY(0);
          }
          100% {
            transform: translateX(-50%) translateY(-120vh);
          }
        }
      `}</style>
    </div>
  );
};

export default AmbientMode;
