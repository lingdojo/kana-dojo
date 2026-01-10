'use client';
import { useState, useEffect, useRef } from 'react';
import { allKana } from '../data/kanaData';

/**
 * Kana Magnet - Kana attracted or repelled by your cursor!
 * Hold click to repel, release to attract
 */
const KanaMagnet = () => {
  const [repel, setRepel] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 50, y: 50 });
  const [particles, setParticles] = useState<
    Array<{
      id: number;
      kana: string;
      x: number;
      y: number;
      vx: number;
      vy: number;
    }>
  >([]);
  const frameRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    const initial = Array.from({ length: 30 }, (_, i) => ({
      id: i,
      kana: allKana[i % allKana.length].kana,
      x: Math.random() * 80 + 10,
      y: Math.random() * 80 + 10,
      vx: 0,
      vy: 0
    }));
    setParticles(initial);
  }, []);

  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setMousePos({
      x: ((e.clientX - rect.left) / rect.width) * 100,
      y: ((e.clientY - rect.top) / rect.height) * 100
    });
  };

  useEffect(() => {
    const animate = () => {
      setParticles(prev =>
        prev.map(p => {
          const dx = mousePos.x - p.x;
          const dy = mousePos.y - p.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const force = Math.min(8 / (dist + 1), 2);
          const angle = Math.atan2(dy, dx);

          const fx = Math.cos(angle) * force * (repel ? -1 : 1);
          const fy = Math.sin(angle) * force * (repel ? -1 : 1);

          let newVx = (p.vx + fx * 0.1) * 0.95;
          let newVy = (p.vy + fy * 0.1) * 0.95;
          let newX = p.x + newVx;
          let newY = p.y + newVy;

          // Boundary bounce
          if (newX < 5 || newX > 95) newVx *= -0.5;
          if (newY < 5 || newY > 95) newVy *= -0.5;
          newX = Math.max(5, Math.min(95, newX));
          newY = Math.max(5, Math.min(95, newY));

          return { ...p, x: newX, y: newY, vx: newVx, vy: newVy };
        })
      );
      frameRef.current = requestAnimationFrame(animate);
    };

    frameRef.current = requestAnimationFrame(animate);
    return () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
    };
  }, [mousePos, repel]);

  return (
    <div
      className='relative min-h-[80vh] flex-1 cursor-crosshair overflow-hidden'
      onMouseMove={handleMouseMove}
      onMouseDown={() => setRepel(true)}
      onMouseUp={() => setRepel(false)}
      onMouseLeave={() => setRepel(false)}
    >
      {/* Cursor indicator */}
      <div
        className='pointer-events-none absolute h-16 w-16 rounded-full transition-all duration-150'
        style={{
          left: `${mousePos.x}%`,
          top: `${mousePos.y}%`,
          transform: 'translate(-50%, -50%)',
          background: repel
            ? 'radial-gradient(circle, rgba(239,68,68,0.3) 0%, transparent 70%)'
            : 'radial-gradient(circle, rgba(59,130,246,0.3) 0%, transparent 70%)',
          boxShadow: repel
            ? '0 0 30px rgba(239,68,68,0.5)'
            : '0 0 30px rgba(59,130,246,0.5)'
        }}
      />

      {/* Particles */}
      {particles.map(p => (
        <span
          key={p.id}
          lang='ja'
          className='absolute text-xl text-[var(--main-color)] select-none md:text-2xl'
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            transform: 'translate(-50%, -50%)'
          }}
        >
          {p.kana}
        </span>
      ))}

      {/* Instructions */}
      <div className='absolute bottom-8 left-1/2 -translate-x-1/2 text-center text-[var(--secondary-color)]'>
        <p>Move cursor to attract • Hold click to repel</p>
        <p className='mt-1 text-sm'>
          {repel ? '💥 Repelling!' : '🧲 Attracting...'}
        </p>
      </div>
    </div>
  );
};

export default KanaMagnet;
