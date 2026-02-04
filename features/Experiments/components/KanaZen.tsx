'use client';
import { useState, useEffect } from 'react';
import { allKana } from '../data/kanaData';

/**
 * Kana Zen - Peaceful floating kana with gentle animations
 * Lightweight: Pure CSS float animation
 */
const KanaZen = () => {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const floaters = Array.from({ length: 25 }, (_, i) => {
    const kana = allKana[Math.floor(Math.random() * allKana.length)];
    return {
      id: i,
      kana: kana.kana,
      x: Math.random() * 90 + 5,
      y: Math.random() * 80 + 10,
      size: Math.random() * 1.5 + 1,
      delay: Math.random() * 5,
      duration: Math.random() * 4 + 6,
    };
  });

  if (!isMounted) return null;

  return (
    <div className='relative min-h-[80vh] flex-1 overflow-hidden bg-gradient-to-b from-transparent to-(--card-color)/30'>
      {floaters.map(f => (
        <span
          key={f.id}
          lang='ja'
          className='absolute cursor-default text-(--main-color) opacity-40 will-change-transform select-none'
          style={{
            left: `${f.x}%`,
            top: `${f.y}%`,
            fontSize: `${f.size}rem`,
            animation: `zen-float ${f.duration}s ease-in-out infinite`,
            animationDelay: `-${f.delay}s`,
          }}
        >
          {f.kana}
        </span>
      ))}

      <div className='pointer-events-none absolute inset-0 flex items-center justify-center'>
        <p className='text-lg text-(--secondary-color) opacity-60'>
          Breathe and relax...
        </p>
      </div>

      <style jsx>{`
        @keyframes zen-float {
          0%,
          100% {
            transform: translateY(0) rotate(0deg);
            opacity: 0.3;
          }
          25% {
            transform: translateY(-15px) rotate(3deg);
            opacity: 0.5;
          }
          50% {
            transform: translateY(-8px) rotate(-2deg);
            opacity: 0.4;
          }
          75% {
            transform: translateY(-20px) rotate(1deg);
            opacity: 0.5;
          }
        }
      `}</style>
    </div>
  );
};

export default KanaZen;
