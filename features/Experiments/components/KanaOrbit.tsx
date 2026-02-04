'use client';
import { useState, useEffect } from 'react';
import { allKana } from '../data/kanaData';

/**
 * Kana Orbit - Characters orbiting in concentric circles
 * Lightweight: Pure CSS animations, GPU-accelerated transforms
 */
const KanaOrbit = () => {
  const [isMounted, setIsMounted] = useState(false);
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Create 3 orbital rings with different speeds
  const rings = [
    { count: 8, radius: 100, duration: 20, direction: 1 },
    { count: 12, radius: 170, duration: 35, direction: -1 },
    { count: 16, radius: 240, duration: 50, direction: 1 },
  ];

  const orbitals = rings.flatMap((ring, ringIdx) =>
    Array.from({ length: ring.count }, (_, i) => {
      const kana = allKana[(ringIdx * 20 + i) % allKana.length];
      return {
        id: ringIdx * 100 + i,
        kana: kana.kana,
        romanji: kana.romanji,
        ring: ringIdx,
        angle: (360 / ring.count) * i,
        ...ring,
      };
    }),
  );

  if (!isMounted) return null;

  return (
    <div className='flex min-h-[80vh] flex-1 items-center justify-center'>
      <div className='relative h-[500px] w-[500px]'>
        {/* Center Sun */}
        <div className='absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-4xl'>
          🌸
        </div>

        {/* Orbital Rings (visual guides) */}
        {rings.map((ring, i) => (
          <div
            key={i}
            className='absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-(--border-color) opacity-30'
            style={{
              width: ring.radius * 2,
              height: ring.radius * 2,
            }}
          />
        ))}

        {/* Orbiting Kana */}
        {orbitals.map(o => (
          <div
            key={o.id}
            className='absolute top-1/2 left-1/2 will-change-transform'
            style={{
              animation: `orbit ${o.duration}s linear infinite ${o.direction === -1 ? 'reverse' : ''}`,
              animationDelay: `-${(o.angle / 360) * o.duration}s`,
            }}
          >
            <span
              className='absolute cursor-default text-xl transition-all duration-200 md:text-2xl'
              style={{
                transform: `translateX(${o.radius}px) translateX(-50%)`,
                color:
                  hoveredIdx === o.id
                    ? 'var(--accent-color)'
                    : 'var(--main-color)',
                opacity: hoveredIdx === o.id ? 1 : 0.7,
                scale: hoveredIdx === o.id ? '1.5' : '1',
              }}
              onMouseEnter={() => setHoveredIdx(o.id)}
              onMouseLeave={() => setHoveredIdx(null)}
            >
              {o.kana}
              {hoveredIdx === o.id && (
                <span className='absolute -bottom-5 left-1/2 -translate-x-1/2 font-mono text-xs whitespace-nowrap'>
                  {o.romanji}
                </span>
              )}
            </span>
          </div>
        ))}
      </div>

      <style jsx>{`
        @keyframes orbit {
          from {
            transform: translate(-50%, -50%) rotate(0deg);
          }
          to {
            transform: translate(-50%, -50%) rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
};

export default KanaOrbit;
