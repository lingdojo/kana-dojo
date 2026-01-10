'use client';
import { useState, useEffect, useRef } from 'react';
import { allKana } from '../data/kanaData';

/**
 * Kana Gravity - Characters float and fall with physics!
 * Click to reverse gravity, watch kana respond
 */
const KanaGravity = () => {
  const [gravityUp, setGravityUp] = useState(false);
  const [particles, setParticles] = useState<
    Array<{
      id: number;
      kana: string;
      x: number;
      y: number;
      vy: number;
    }>
  >([]);
  const frameRef = useRef<number | undefined>(undefined);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Initialize particles
    const initial = Array.from({ length: 20 }, (_, i) => ({
      id: i,
      kana: allKana[i % allKana.length].kana,
      x: Math.random() * 90 + 5,
      y: Math.random() * 40 + 30,
      vy: 0
    }));
    setParticles(initial);
  }, []);

  useEffect(() => {
    const gravity = gravityUp ? -0.3 : 0.3;
    const bounce = 0.6;
    const friction = 0.99;

    const animate = () => {
      setParticles(prev =>
        prev.map(p => {
          let newVy = p.vy + gravity;
          let newY = p.y + newVy * 0.5;

          // Bounce off floor/ceiling
          if (newY > 90) {
            newY = 90;
            newVy = -newVy * bounce;
          }
          if (newY < 5) {
            newY = 5;
            newVy = -newVy * bounce;
          }

          return {
            ...p,
            y: newY,
            vy: newVy * friction
          };
        })
      );
      frameRef.current = requestAnimationFrame(animate);
    };

    frameRef.current = requestAnimationFrame(animate);
    return () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
    };
  }, [gravityUp]);

  return (
    <div
      ref={containerRef}
      className='relative min-h-[80vh] flex-1 cursor-pointer overflow-hidden'
      onClick={() => setGravityUp(g => !g)}
    >
      {/* Gravity indicator */}
      <div className='absolute top-4 left-1/2 z-10 flex -translate-x-1/2 items-center gap-2 text-[var(--main-color)]'>
        <span
          className={`text-3xl transition-transform duration-300 ${gravityUp ? 'rotate-180' : ''}`}
        >
          ⬇️
        </span>
        <span className='text-sm'>Click to flip gravity!</span>
      </div>

      {/* Particles */}
      {particles.map(p => (
        <span
          key={p.id}
          lang='ja'
          className='absolute text-2xl text-[var(--main-color)] transition-none select-none md:text-3xl'
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            transform: 'translate(-50%, -50%)'
          }}
        >
          {p.kana}
        </span>
      ))}

      {/* Ground/Ceiling lines */}
      <div className='absolute right-0 bottom-[10%] left-0 h-px bg-[var(--border-color)]' />
      <div className='absolute top-[5%] right-0 left-0 h-px bg-[var(--border-color)]' />
    </div>
  );
};

export default KanaGravity;
