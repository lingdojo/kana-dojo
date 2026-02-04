'use client';
import { useState, useEffect, useCallback } from 'react';
import clsx from 'clsx';
import { allKana } from '../data/kanaData';

/**
 * Kana Snake - Classic snake game collecting kana!
 * Control with arrow keys or WASD
 */
type Direction = 'up' | 'down' | 'left' | 'right';
type Position = { x: number; y: number };

const GRID_SIZE = 15;
const INITIAL_SPEED = 200;

const KanaSnake = () => {
  const [snake, setSnake] = useState<Position[]>([{ x: 7, y: 7 }]);
  const [direction, setDirection] = useState<Direction>('right');
  const [food, setFood] = useState<
    Position & { kana: string; romanji: string }
  >({
    x: 10,
    y: 7,
    kana: 'あ',
    romanji: 'a',
  });
  const [collected, setCollected] = useState<string[]>([]);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [speed, setSpeed] = useState(INITIAL_SPEED);

  const spawnFood = useCallback(() => {
    const kana = allKana[Math.floor(Math.random() * allKana.length)];
    let pos: Position;
    do {
      pos = {
        x: Math.floor(Math.random() * GRID_SIZE),
        y: Math.floor(Math.random() * GRID_SIZE),
      };
    } while (snake.some(s => s.x === pos.x && s.y === pos.y));
    return { ...pos, kana: kana.kana, romanji: kana.romanji };
  }, [snake]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (gameOver) return;
      const key = e.key.toLowerCase();
      if ((key === 'arrowup' || key === 'w') && direction !== 'down')
        setDirection('up');
      if ((key === 'arrowdown' || key === 's') && direction !== 'up')
        setDirection('down');
      if ((key === 'arrowleft' || key === 'a') && direction !== 'right')
        setDirection('left');
      if ((key === 'arrowright' || key === 'd') && direction !== 'left')
        setDirection('right');
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [direction, gameOver]);

  useEffect(() => {
    if (gameOver) return;

    const move = () => {
      setSnake(prev => {
        const head = prev[0];
        const newHead = { ...head };

        if (direction === 'up') newHead.y--;
        if (direction === 'down') newHead.y++;
        if (direction === 'left') newHead.x--;
        if (direction === 'right') newHead.x++;

        // Wall collision
        if (
          newHead.x < 0 ||
          newHead.x >= GRID_SIZE ||
          newHead.y < 0 ||
          newHead.y >= GRID_SIZE
        ) {
          setGameOver(true);
          return prev;
        }

        // Self collision
        if (prev.some(s => s.x === newHead.x && s.y === newHead.y)) {
          setGameOver(true);
          return prev;
        }

        const newSnake = [newHead, ...prev];

        // Eat food
        if (newHead.x === food.x && newHead.y === food.y) {
          setScore(s => s + 10);
          setCollected(c => [...c.slice(-7), food.kana]);
          setFood(spawnFood());
          setSpeed(s => Math.max(80, s - 5));
        } else {
          newSnake.pop();
        }

        return newSnake;
      });
    };

    const interval = setInterval(move, speed);
    return () => clearInterval(interval);
  }, [direction, food, gameOver, speed, spawnFood]);

  const restart = () => {
    setSnake([{ x: 7, y: 7 }]);
    setDirection('right');
    setFood(spawnFood());
    setCollected([]);
    setGameOver(false);
    setScore(0);
    setSpeed(INITIAL_SPEED);
  };

  return (
    <div className='flex flex-1 flex-col items-center justify-center gap-4 p-4'>
      <div className='flex items-center gap-6 text-lg text-(--main-color)'>
        <span>Score: {score}</span>
        <span className='text-sm text-(--secondary-color)'>
          Collected: {collected.join(' ')}
        </span>
      </div>

      <div
        className='grid gap-px rounded-lg bg-(--border-color) p-1'
        style={{
          gridTemplateColumns: `repeat(${GRID_SIZE}, 1fr)`,
        }}
      >
        {Array.from({ length: GRID_SIZE * GRID_SIZE }, (_, i) => {
          const x = i % GRID_SIZE;
          const y = Math.floor(i / GRID_SIZE);
          const isSnakeHead = snake[0]?.x === x && snake[0]?.y === y;
          const isSnakeBody = snake.slice(1).some(s => s.x === x && s.y === y);
          const isFood = food.x === x && food.y === y;

          return (
            <div
              key={i}
              className={clsx(
                'flex h-5 w-5 items-center justify-center rounded-sm text-xs transition-colors md:h-6 md:w-6',
                isSnakeHead
                  ? 'bg-green-500'
                  : isSnakeBody
                    ? 'bg-green-400/70'
                    : isFood
                      ? 'bg-(--accent-color)/30'
                      : 'bg-(--card-color)',
              )}
            >
              {isFood && <span lang='ja'>{food.kana}</span>}
            </div>
          );
        })}
      </div>

      {gameOver && (
        <div className='flex flex-col items-center gap-3'>
          <p className='text-xl text-(--main-color)'>
            Game Over! Score: {score}
          </p>
          <button
            onClick={restart}
            className='rounded-xl bg-(--accent-color) px-6 py-3 text-white transition-transform hover:scale-105'
          >
            Play Again
          </button>
        </div>
      )}

      <p className='text-sm text-(--secondary-color)'>
        Use Arrow Keys or WASD to move
      </p>
    </div>
  );
};

export default KanaSnake;
