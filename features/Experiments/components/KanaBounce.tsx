'use client';
import { useState, useCallback, useEffect } from 'react';
import clsx from 'clsx';
import { allKana } from '../data/kanaData';

/**
 * Kana Bounce - Bouncing kana physics playground!
 * Click to spawn new bouncing kana
 */
type Ball = {
  id: number;
  kana: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  hue: number;
};

const KanaBounce = () => {
  const [balls, setBalls] = useState<Ball[]>([]);
  const [idCounter, setIdCounter] = useState(0);

  const spawnBall = useCallback(
    (clientX: number, clientY: number, rect: DOMRect) => {
      const kana = allKana[Math.floor(Math.random() * allKana.length)];
      const newBall: Ball = {
        id: idCounter,
        kana: kana.kana,
        x: ((clientX - rect.left) / rect.width) * 100,
        y: ((clientY - rect.top) / rect.height) * 100,
        vx: (Math.random() - 0.5) * 4,
        vy: (Math.random() - 0.5) * 4,
        hue: Math.random() * 360,
      };
      setBalls(prev => [...prev.slice(-19), newBall]); // Keep max 20 balls
      setIdCounter(i => i + 1);
    },
    [idCounter],
  );

  useEffect(() => {
    const animate = () => {
      setBalls(prev =>
        prev.map(ball => {
          let { x, y, vx, vy } = ball;

          // Apply gravity
          vy += 0.15;

          // Apply velocity
          x += vx;
          y += vy;

          // Bounce off walls
          if (x < 3 || x > 97) {
            vx *= -0.85;
            x = Math.max(3, Math.min(97, x));
          }

          // Bounce off floor/ceiling
          if (y < 3) {
            vy *= -0.85;
            y = 3;
          }
          if (y > 93) {
            vy *= -0.85;
            y = 93;
            vx *= 0.98; // Floor friction
          }

          return { ...ball, x, y, vx, vy };
        }),
      );
    };

    const interval = setInterval(animate, 16);
    return () => clearInterval(interval);
  }, []);

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    spawnBall(e.clientX, e.clientY, rect);
  };

  return (
    <div
      className='relative min-h-[80vh] flex-1 cursor-pointer overflow-hidden'
      onClick={handleClick}
    >
      {/* Instructions */}
      <div className='absolute top-4 left-1/2 z-10 -translate-x-1/2 text-center text-(--secondary-color)'>
        <p>Click anywhere to spawn bouncing kana!</p>
        <p className='mt-1 text-sm'>🎱 Balls: {balls.length}/20</p>
      </div>

      {/* Floor */}
      <div className='absolute right-4 bottom-[7%] left-4 h-1 rounded-full bg-(--border-color)' />

      {/* Balls */}
      {balls.map(ball => (
        <div
          key={ball.id}
          className='absolute flex h-10 w-10 items-center justify-center rounded-full md:h-12 md:w-12'
          style={{
            left: `${ball.x}%`,
            top: `${ball.y}%`,
            transform: 'translate(-50%, -50%)',
            backgroundColor: `hsla(${ball.hue}, 70%, 50%, 0.3)`,
            border: `2px solid hsl(${ball.hue}, 70%, 50%)`,
            boxShadow: `0 0 10px hsla(${ball.hue}, 70%, 50%, 0.5)`,
          }}
        >
          <span
            lang='ja'
            className='text-lg text-(--main-color) md:text-xl'
          >
            {ball.kana}
          </span>
        </div>
      ))}
    </div>
  );
};

export default KanaBounce;
