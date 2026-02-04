'use client';
import { useState, useEffect } from 'react';
import { allKana } from '../data/kanaData';

/**
 * Kana DNA - Beautiful double helix of rotating kana!
 */
const KanaDNA = () => {
  const [rotation, setRotation] = useState(0);
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  useEffect(() => {
    const animate = () => {
      setRotation(r => (r + 0.5) % 360);
    };
    const interval = setInterval(animate, 16);
    return () => clearInterval(interval);
  }, []);

  const helixPoints = 24;
  const height = 600;

  return (
    <div className='flex min-h-[80vh] flex-1 items-center justify-center overflow-hidden'>
      <div className='relative' style={{ height, width: 200 }}>
        {Array.from({ length: helixPoints }, (_, i) => {
          const y = (i / helixPoints) * height;
          const angle = (rotation + i * 15) * (Math.PI / 180);
          const xOffset = Math.sin(angle) * 60;
          const zIndex = Math.cos(angle) > 0 ? 10 : 1;
          const opacity = 0.3 + (Math.cos(angle) + 1) * 0.35;

          const kana1 = allKana[i % allKana.length];
          const kana2 = allKana[(i + 12) % allKana.length];

          return (
            <div key={i}>
              {/* Strand 1 */}
              <span
                lang='ja'
                className='absolute cursor-default text-xl transition-all duration-100 md:text-2xl'
                style={{
                  left: `calc(50% + ${xOffset}px)`,
                  top: y,
                  transform: 'translate(-50%, -50%)',
                  zIndex,
                  opacity: hoveredIdx === i ? 1 : opacity,
                  color:
                    hoveredIdx === i
                      ? 'var(--accent-color)'
                      : 'var(--main-color)',
                  scale: hoveredIdx === i ? '1.5' : '1',
                }}
                onMouseEnter={() => setHoveredIdx(i)}
                onMouseLeave={() => setHoveredIdx(null)}
              >
                {kana1.kana}
              </span>

              {/* Strand 2 */}
              <span
                lang='ja'
                className='absolute cursor-default text-xl transition-all duration-100 md:text-2xl'
                style={{
                  left: `calc(50% - ${xOffset}px)`,
                  top: y,
                  transform: 'translate(-50%, -50%)',
                  zIndex: 11 - zIndex,
                  opacity: hoveredIdx === i + 100 ? 1 : 1 - opacity + 0.3,
                  color:
                    hoveredIdx === i + 100
                      ? 'var(--accent-color)'
                      : 'var(--main-color)',
                  scale: hoveredIdx === i + 100 ? '1.5' : '1',
                }}
                onMouseEnter={() => setHoveredIdx(i + 100)}
                onMouseLeave={() => setHoveredIdx(null)}
              >
                {kana2.kana}
              </span>

              {/* Connecting line */}
              <div
                className='absolute h-px bg-(--border-color)'
                style={{
                  left: `calc(50% - ${xOffset}px)`,
                  top: y,
                  width: xOffset * 2,
                  opacity: 0.3,
                  zIndex: 0,
                }}
              />
            </div>
          );
        })}
      </div>

      <div className='absolute bottom-8 text-center text-(--secondary-color)'>
        <p>🧬 Kana DNA Helix</p>
        <p className='mt-1 text-sm'>Hover to highlight</p>
      </div>
    </div>
  );
};

export default KanaDNA;
