'use client';
import { useState, useEffect } from 'react';
import { allKana } from '../data/kanaData';

/**
 * Kana Glow - Beautiful glowing kana with mouse interaction
 * Lightweight: CSS glow effects and transitions
 */
const KanaGlow = () => {
  const [isMounted, setIsMounted] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 50, y: 50 });

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setMousePos({
      x: ((e.clientX - rect.left) / rect.width) * 100,
      y: ((e.clientY - rect.top) / rect.height) * 100,
    });
  };

  const glowers = Array.from({ length: 20 }, (_, i) => {
    const kana = allKana[i % allKana.length];
    return {
      id: i,
      kana: kana.kana,
      romanji: kana.romanji,
      x: (i % 5) * 20 + 10,
      y: Math.floor(i / 5) * 25 + 12,
      hue: (i * 18) % 360,
      delay: i * 0.2,
    };
  });

  if (!isMounted) return null;

  return (
    <div
      className='relative min-h-[80vh] flex-1 cursor-crosshair overflow-hidden'
      onMouseMove={handleMouseMove}
      style={{
        background: `radial-gradient(circle at ${mousePos.x}% ${mousePos.y}%, rgba(var(--accent-rgb), 0.1) 0%, transparent 50%)`,
      }}
    >
      {glowers.map(g => {
        const dx = g.x - mousePos.x;
        const dy = g.y - mousePos.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const intensity = Math.max(0, 1 - distance / 40);

        return (
          <span
            key={g.id}
            lang='ja'
            className='absolute cursor-default text-3xl transition-all duration-300 select-none md:text-4xl'
            style={{
              left: `${g.x}%`,
              top: `${g.y}%`,
              transform: 'translate(-50%, -50%)',
              color: `hsl(${g.hue}, 70%, ${50 + intensity * 30}%)`,
              textShadow:
                intensity > 0.3
                  ? `0 0 ${10 + intensity * 30}px hsl(${g.hue}, 80%, 60%),
                     0 0 ${20 + intensity * 40}px hsl(${g.hue}, 80%, 50%)`
                  : 'none',
              opacity: 0.4 + intensity * 0.6,
              scale: `${1 + intensity * 0.3}`,
            }}
          >
            {g.kana}
          </span>
        );
      })}

      <div className='pointer-events-none absolute bottom-8 left-1/2 -translate-x-1/2 text-(--secondary-color) opacity-60'>
        Move your cursor to illuminate the kana ✨
      </div>
    </div>
  );
};

export default KanaGlow;
