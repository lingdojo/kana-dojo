'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Button } from '@/shared/components/ui/button';
import { RefreshCcw, Play, Volume2, VolumeX } from 'lucide-react';
import clsx from 'clsx';
import { useGameAudio } from '../hooks/useGameAudio';
import { generateAssets, GameAssets } from './RunnerAssets';

// Game Constants
const GRAVITY = 0.6;
const JUMP_FORCE = -15; // Increased jump force for snappier feel
const BASE_SPEED = 5; // Reduced from 6 for better control
const SPEED_INCREMENT = 0.001; // Speed accumulated per frame
const OBSTACLE_SPAWN_MIN = 60; // Minimum frames between spawns
const OBSTACLE_SPAWN_MAX = 120; // Maximum frames between spawns (decreases with speed)
const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 400;
const GROUND_HEIGHT = 350;

type GameState = 'START' | 'PLAYING' | 'GAME_OVER';

interface Player {
  x: number;
  y: number;
  width: number;
  height: number;
  dy: number;
  grounded: boolean;
  rotation: number;
  canDoubleJump: boolean;
  isDiving: boolean;
}

interface Obstacle {
  x: number;
  y: number;
  width: number;
  height: number;
  type: 'TORII' | 'DARUMA' | 'TENGU' | 'ONI' | 'KASA_OBAKE' | 'CHOCHIN_OBAKE';
  passed: boolean;
}

interface Cloud {
  x: number;
  y: number;
  speed: number;
  scale: number;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  color: string;
}

interface Sakura {
  x: number;
  y: number;
  vx: number;
  vy: number;
  rotation: number;
  rotationSpeed: number;
  size: number;
}

interface Spirit {
  x: number;
  y: number;
  char: string;
  collected: boolean;
}

const KANA_CHARS = [
  'あ',
  'い',
  'う',
  'え',
  'お',
  'か',
  'き',
  'く',
  'け',
  'こ',
  'さ',
  'し',
  'す',
  'せ',
  'そ',
];

export const RunnerGame = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [gameState, setGameState] = useState<GameState>('START');
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const { playSound } = useGameAudio();
  const [audioEnabled, setAudioEnabled] = useState(true);

  // Game state refs (mutable for physics loop)
  const playerRef = useRef<Player>({
    x: 50,
    y: GROUND_HEIGHT - 40,
    width: 40,
    height: 40,
    dy: 0,
    grounded: true,
    rotation: 0,
    canDoubleJump: true,
    isDiving: false,
  });
  const obstaclesRef = useRef<Obstacle[]>([]);
  const spiritsRef = useRef<Spirit[]>([]);
  const particlesRef = useRef<Particle[]>([]);
  const startAssetsRef = useRef<GameAssets | null>(null);

  const sakuraRef = useRef<Sakura[]>([]);
  const cloudsRef = useRef<Cloud[]>([]);
  const speedRef = useRef(BASE_SPEED);
  const frameRef = useRef(0);
  const scoreRef = useRef(0);
  const distanceRef = useRef(0);
  const highScoreRef = useRef(highScore); // Keep in sync with state for persistence if needed
  const lastTimeRef = useRef(0);
  const requestRef = useRef<number | null>(null);

  useEffect(() => {
    highScoreRef.current = highScore;
  }, [highScore]);

  useEffect(() => {
    startAssetsRef.current = generateAssets();
    // Init Sakura
    for (let i = 0; i < 40; i++) {
      sakuraRef.current.push({
        x: Math.random() * CANVAS_WIDTH,
        y: Math.random() * CANVAS_HEIGHT,
        vx: -2 - Math.random() * 2,
        vy: 0.5 + Math.random() * 1.5,
        rotation: Math.random() * Math.PI,
        rotationSpeed: (Math.random() - 0.5) * 0.1,
        size: Math.random() * 4 + 2,
      });
    }
    // Init Clouds
    for (let i = 0; i < 5; i++) {
      cloudsRef.current.push({
        x: Math.random() * CANVAS_WIDTH,
        y: Math.random() * 150, // Upper sky
        speed: 0.2 + Math.random() * 0.3,
        scale: 0.8 + Math.random() * 0.5,
      });
    }
  }, []);

  // Initialize Game
  const resetGame = useCallback(() => {
    playerRef.current = {
      x: 50,
      y: GROUND_HEIGHT - 40,
      width: 40,
      height: 40,
      dy: 0,
      grounded: true,
      rotation: 0,
      canDoubleJump: true,
      isDiving: false,
    };
    obstaclesRef.current = [];
    spiritsRef.current = [];
    particlesRef.current = [];
    // Reset Sakura positions on restart for fresh feel
    sakuraRef.current.forEach(s => {
      s.x = Math.random() * CANVAS_WIDTH;
      s.y = Math.random() * CANVAS_HEIGHT;
    });
    speedRef.current = BASE_SPEED;
    frameRef.current = 0;
    scoreRef.current = 0;
    distanceRef.current = 0;
    setScore(0);
    setGameState('PLAYING');
  }, []);

  // Jump Action
  const jump = useCallback(() => {
    if (gameState !== 'PLAYING') {
      if (gameState === 'START' || gameState === 'GAME_OVER') {
        resetGame();
      }
      return;
    }

    // Play tick sound periodically just for ambience if running
    if (Math.random() < 0.01 && audioEnabled) playSound('TICK');

    const player = playerRef.current;

    // First Jump
    if (player.grounded) {
      player.dy = JUMP_FORCE;
      player.grounded = false;
      player.canDoubleJump = true;
      if (audioEnabled) playSound('JUMP');
      // Add jump particles
      createParticles(player.x + 20, player.y + 40, 5, 'rgba(200,200,200,0.5)');
    }
    // Double Jump
    else if (player.canDoubleJump) {
      player.dy = JUMP_FORCE * 0.8; // Slightly weaker second jump
      player.canDoubleJump = false;
      player.rotation -= 10; // Backflip effect
      if (audioEnabled) playSound('DOUBLE_JUMP');
      // Add magical particles
      createParticles(player.x + 20, player.y + 40, 8, 'rgba(100,200,255,0.6)');
    }
  }, [gameState, resetGame]);

  const dive = useCallback(() => {
    if (gameState === 'PLAYING' && !playerRef.current.grounded) {
      playerRef.current.dy = 15; // Fast fall
      playerRef.current.isDiving = true;
    }
  }, [gameState]);

  // Particle System
  const createParticles = (
    x: number,
    y: number,
    count: number,
    color: string,
  ) => {
    for (let i = 0; i < count; i++) {
      particlesRef.current.push({
        x,
        y,
        vx: (Math.random() - 0.5) * 4,
        vy: (Math.random() - 0.5) * 4,
        life: 1.0,
        color,
      });
    }
  };

  const updateParticles = () => {
    for (let i = particlesRef.current.length - 1; i >= 0; i--) {
      const p = particlesRef.current[i];
      p.x += p.vx;
      p.y += p.vy;
      p.life -= 0.05;
      if (p.life <= 0) {
        particlesRef.current.splice(i, 1);
      }
    }
  };

  const drawParticles = (ctx: CanvasRenderingContext2D) => {
    particlesRef.current.forEach(p => {
      ctx.globalAlpha = p.life;
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1.0;
    });
  };

  const updateSakura = () => {
    sakuraRef.current.forEach(s => {
      s.x += s.vx - speedRef.current * 0.2; // Parallax effect on petals
      s.y += s.vy;
      s.rotation += s.rotationSpeed;

      if (s.x < -10) s.x = CANVAS_WIDTH + 10;
      if (s.y > CANVAS_HEIGHT + 10) s.y = -10;
    });
  };

  const drawSakura = (ctx: CanvasRenderingContext2D) => {
    ctx.fillStyle = '#ffb7b2'; // Sakura Pink
    sakuraRef.current.forEach(s => {
      ctx.save();
      ctx.translate(Math.floor(s.x), Math.floor(s.y));
      ctx.rotate(s.rotation);
      ctx.beginPath();
      // Petal shape
      ctx.ellipse(0, 0, s.size, s.size / 2, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });
  };

  // Game Loop
  const animate = useCallback(
    (time: number) => {
      if (gameState !== 'PLAYING') return;

      lastTimeRef.current = time;

      const canvas = canvasRef.current;
      const ctx = canvas?.getContext('2d');
      if (!canvas || !ctx) return;

      // Clear Canvas
      ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      // Day/Night Cycle Background
      const cycle = (scoreRef.current % 1000) / 1000; // 0 to 1
      const isNight = cycle > 0.5;

      // Sky Gradient
      const gradient = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
      if (isNight) {
        gradient.addColorStop(0, '#0f172a'); // Slate 900
        gradient.addColorStop(1, '#334155'); // Slate 700
      } else {
        gradient.addColorStop(0, '#bae6fd'); // Sky 200
        gradient.addColorStop(1, '#f0f9ff'); // Sky 50
      }
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      // Draw Clouds (Background)
      if (startAssetsRef.current && !isNight) {
        ctx.globalAlpha = 0.6;
        cloudsRef.current.forEach(cloud => {
          // Dynamic cloud speed based on player speed
          cloud.x -= cloud.speed + speedRef.current * 0.05;
          if (cloud.x + 120 * cloud.scale < 0)
            cloud.x = CANVAS_WIDTH + Math.random() * 200;

          ctx.drawImage(
            startAssetsRef.current!.cloud,
            Math.floor(cloud.x),
            Math.floor(cloud.y),
            120 * cloud.scale,
            60 * cloud.scale,
          );
        });
        ctx.globalAlpha = 1.0;
      }

      // 2. Sun/Moon (Far Background)
      if (startAssetsRef.current) {
        const x = 700;
        const y = 80;
        ctx.beginPath();
        ctx.arc(x, y, 40, 0, Math.PI * 2);
        if (isNight) {
          ctx.fillStyle = '#fef3c7'; // Pale yellow moon
          ctx.shadowColor = '#fef3c7';
          ctx.shadowBlur = 20;
        } else {
          ctx.fillStyle = '#ef4444'; // Rising Sun red
          ctx.shadowColor = '#ef4444';
          ctx.shadowBlur = 20;
        }
        ctx.fill();
        ctx.shadowBlur = 0; // Reset
      }

      // 2.5. Mt Fuji (Static Far Background) - Draw BEFORE Mountains/Pagoda
      if (startAssetsRef.current && !isNight) {
        ctx.globalAlpha = 0.9;
        const fujiX = CANVAS_WIDTH / 2 - 400;
        const shift = (distanceRef.current * 0.01) % 50;

        ctx.drawImage(
          startAssetsRef.current.fuji,
          Math.floor(fujiX - shift),
          GROUND_HEIGHT - 350,
        );
        ctx.globalAlpha = 1.0;
      }

      // 3. Distant Pagoda (Parallax Layer 2)
      if (startAssetsRef.current) {
        const pagodaSpeed = 0.05; // Very slow
        const pOffset = Math.floor(
          (distanceRef.current * pagodaSpeed) % (CANVAS_WIDTH + 200),
        );
        const pX = CANVAS_WIDTH - pOffset;

        // Only draw if visible
        if (pX > -150 && pX < CANVAS_WIDTH + 150) {
          ctx.globalAlpha = isNight ? 0.4 : 0.6; // Silhouetted
          ctx.drawImage(
            startAssetsRef.current.pagoda,
            Math.floor(pX),
            GROUND_HEIGHT - 180,
          ); // Just peeking over hills
          ctx.globalAlpha = 1.0;
        }
      }

      // 4. Parallax Mountains (Pre-rendered Asset - Fixed)
      if (startAssetsRef.current) {
        const mountainSpeed = 0.2;
        const bgWidth = 1600; // Match asset width
        // Use DISTANCE for smooth scrolling
        const offset = Math.floor(
          (distanceRef.current * mountainSpeed) % bgWidth,
        );

        ctx.globalAlpha = isNight ? 0.3 : 1.0;
        // Draw twice for seamless scrolling
        const yPos = GROUND_HEIGHT - 200;

        // Draw full image at -offset, and another at -offset + width
        ctx.drawImage(startAssetsRef.current.mountains, -offset, yPos);
        ctx.drawImage(
          startAssetsRef.current.mountains,
          -offset + bgWidth,
          yPos,
        );

        ctx.globalAlpha = 1.0;
      }

      // Get theme colors
      const style = getComputedStyle(document.body);
      const mainColor = style.getPropertyValue('--main-color').trim() || '#000';
      const accentColor =
        style.getPropertyValue('--secondary-color').trim() || 'gray';
      const groundColor =
        style.getPropertyValue('--border-color').trim() || '#ccc';

      const textColor = isNight ? '#fff' : mainColor;

      // Game Logic ---------------------------

      // Speed Increase
      speedRef.current += SPEED_INCREMENT;
      distanceRef.current += speedRef.current;

      // Player Physics
      const player = playerRef.current;
      player.dy += GRAVITY;
      player.y += player.dy;

      // Ground Collision
      if (player.y + player.height > GROUND_HEIGHT) {
        player.y = GROUND_HEIGHT - player.height;
        player.dy = 0;
        player.grounded = true;
        player.rotation = 0;
        player.canDoubleJump = true;
        player.isDiving = false;
      } else {
        // Rotate while jumping for style (Smoother)
        if (player.isDiving) {
          player.rotation += 20; // Fast spin on dive
        } else {
          player.rotation += 6; // Steady flip ~1s per full rotation
        }
      }

      // Obstacle Spawning
      frameRef.current++;
      const currentScore = scoreRef.current;
      const spawnRate = Math.max(
        OBSTACLE_SPAWN_MIN,
        OBSTACLE_SPAWN_MAX - Math.floor(currentScore / 50),
      );

      // Simple logic: spawn if frame count exceeds threshold and randomly
      if (frameRef.current > spawnRate && Math.random() < 0.02) {
        if (
          obstaclesRef.current.length === 0 ||
          CANVAS_WIDTH -
            obstaclesRef.current[obstaclesRef.current.length - 1].x >
            200
        ) {
          const typeRoll = Math.random();
          let type: Obstacle['type'] = 'DARUMA';

          if (typeRoll > 0.9) type = 'ONI';
          else if (typeRoll > 0.8) type = 'CHOCHIN_OBAKE';
          else if (typeRoll > 0.7) type = 'TORII';
          else if (typeRoll > 0.55) type = 'KASA_OBAKE';
          else if (typeRoll > 0.4) type = 'TENGU';

          // Dimensions & Position
          let height = 40;
          let width = 40;
          let y = GROUND_HEIGHT - height;

          if (type === 'TORII') {
            height = 80;
            width = 50;
            y = GROUND_HEIGHT - height;
          } else if (type === 'TENGU') {
            height = 30;
            width = 30;
            y = GROUND_HEIGHT - 90; // Always high flyer
          } else if (type === 'ONI') {
            height = 50;
            width = 50;
            y = GROUND_HEIGHT - 50;
          } else if (type === 'KASA_OBAKE') {
            height = 70;
            width = 50;
            // Hops!
            y = GROUND_HEIGHT - 70;
          } else if (type === 'CHOCHIN_OBAKE') {
            height = 60;
            width = 40;
            y = GROUND_HEIGHT - 120; // Very high floater
          }

          obstaclesRef.current.push({
            x: CANVAS_WIDTH,
            y,
            width,
            height,
            type,
            passed: false,
          });
          frameRef.current = 0;
        }
      }

      // Spirit Spawning (Collecting Kana)
      if (Math.random() < 0.01) {
        // 1% chance per frame
        if (spiritsRef.current.length < 3) {
          spiritsRef.current.push({
            x: CANVAS_WIDTH + Math.random() * 200,
            y: GROUND_HEIGHT - 60 - Math.random() * 100, // Varying heights
            char: KANA_CHARS[Math.floor(Math.random() * KANA_CHARS.length)],
            collected: false,
          });
        }
      }

      // Update Spirits
      for (let i = spiritsRef.current.length - 1; i >= 0; i--) {
        const spirit = spiritsRef.current[i];
        spirit.x -= speedRef.current; // Move with world

        // Collection
        const dist = Math.hypot(
          player.x + 20 - spirit.x,
          player.y + 20 - spirit.y,
        );
        if (!spirit.collected && dist < 40) {
          spirit.collected = true;
          scoreRef.current += 50; // Bonus points
          if (audioEnabled) playSound('SCORE');
          createParticles(spirit.x, spirit.y, 10, '#ffd700'); // Gold particles
        }

        if (spirit.x < -50 || spirit.collected) {
          spiritsRef.current.splice(i, 1);
        }
      }

      // Update Obstacles
      for (let i = obstaclesRef.current.length - 1; i >= 0; i--) {
        const obs = obstaclesRef.current[i];

        // TENGU move faster
        let moveSpeed = speedRef.current;
        if (obs.type === 'TENGU') {
          moveSpeed *= 1.3;
        }
        // Kasa-Obake hops
        if (obs.type === 'KASA_OBAKE') {
          obs.y =
            GROUND_HEIGHT -
            70 -
            Math.abs(Math.sin(frameRef.current * 0.1)) * 30;
        }
        // Chochin swings
        if (obs.type === 'CHOCHIN_OBAKE') {
          obs.y += Math.sin(frameRef.current * 0.05) * 0.5;
        }

        obs.x -= moveSpeed;

        // Collision Detection
        if (
          player.x < obs.x + obs.width - 5 && // tighten hitbox slightly
          player.x + player.width - 5 > obs.x &&
          player.y < obs.y + obs.height - 5 &&
          player.y + player.height - 5 > obs.y
        ) {
          setGameState('GAME_OVER');
          if (audioEnabled) playSound('GAME_OVER');
          setScore(Math.floor(scoreRef.current));
          setHighScore(prev => Math.max(prev, Math.floor(scoreRef.current)));
          return; // Stop animation loop
        }

        // Scoring
        if (!obs.passed && obs.x + obs.width < player.x) {
          obs.passed = true;
          scoreRef.current += 10;
          if (scoreRef.current % 100 === 0 && audioEnabled) playSound('SCORE');
        }

        // Remove off-screen obstacles
        if (obs.x + obs.width < 0) {
          obstaclesRef.current.splice(i, 1);
        }
      }

      updateParticles();
      updateSakura(); // Update Sakura physics

      // Drawing ---------------------------

      // Draw Ground
      ctx.beginPath();
      ctx.moveTo(0, GROUND_HEIGHT);
      ctx.lineTo(CANVAS_WIDTH, GROUND_HEIGHT);
      ctx.strokeStyle = groundColor;
      ctx.lineWidth = 2;
      ctx.stroke();

      // Draw Background Sakura (Behind player)
      drawSakura(ctx);

      // Draw Player (Kitsune Sprite)
      ctx.save();
      ctx.translate(
        Math.floor(player.x + player.width / 2),
        Math.floor(player.y + player.height / 2),
      );
      ctx.rotate((player.rotation * Math.PI) / 180);

      if (startAssetsRef.current) {
        ctx.drawImage(startAssetsRef.current.kitsune, -30, -30, 60, 60);
      } else {
        // Fallback
        ctx.fillStyle = mainColor;
        ctx.fillRect(-20, -20, 40, 40);
      }
      ctx.restore();

      // Draw Obstacles
      obstaclesRef.current.forEach(obs => {
        if (startAssetsRef.current) {
          const obsX = Math.floor(obs.x);
          const obsY = Math.floor(obs.y);
          if (obs.type === 'TORII') {
            ctx.drawImage(
              startAssetsRef.current.torii,
              obsX,
              obsY - 10,
              100,
              120,
            );
          } else if (obs.type === 'TENGU') {
            ctx.drawImage(startAssetsRef.current.tengu, obsX, obsY, 40, 40);
          } else if (obs.type === 'DARUMA') {
            ctx.drawImage(startAssetsRef.current.daruma, obsX, obsY, 40, 40);
          } else if (obs.type === 'ONI') {
            ctx.drawImage(startAssetsRef.current.oni, obsX, obsY, 50, 50);
          } else if (obs.type === 'KASA_OBAKE') {
            ctx.drawImage(startAssetsRef.current.kasaObake, obsX, obsY, 50, 70);
          } else if (obs.type === 'CHOCHIN_OBAKE') {
            ctx.drawImage(
              startAssetsRef.current.chochinObake,
              obsX,
              obsY,
              40,
              60,
            );
          } else {
            // Fallback
            ctx.fillStyle = accentColor;
            ctx.beginPath();
            ctx.arc(
              Math.floor(obs.x + obs.width / 2),
              Math.floor(obs.y + obs.height / 2),
              obs.width / 2,
              0,
              Math.PI * 2,
            );
            ctx.fill();
          }
        } else {
          // Fallback
          ctx.fillStyle = '#f00';
          ctx.fillRect(obs.x, obs.y, obs.width, obs.height);
        }
      });

      // Draw Spirits
      spiritsRef.current.forEach(spirit => {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.beginPath();
        ctx.arc(spirit.x, spirit.y, 15, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = isNight ? '#000' : '#444';
        ctx.font = '16px serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(spirit.char, spirit.x, spirit.y);

        // Outer glow
        ctx.strokeStyle = '#ffd700';
        ctx.lineWidth = 2;
        ctx.stroke();
      });

      drawParticles(ctx);

      // Draw Score
      ctx.fillStyle = textColor;
      ctx.font = '20px monospace';
      ctx.textAlign = 'right';
      ctx.fillText(
        `SCORE: ${Math.floor(scoreRef.current)}`,
        CANVAS_WIDTH - 20,
        30,
      );
      ctx.fillText(`HI: ${highScoreRef.current}`, CANVAS_WIDTH - 20, 60);

      requestRef.current = requestAnimationFrame(animate);
    },
    [gameState],
  );

  // Input Handling
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.code === 'ArrowUp') {
        e.preventDefault();
        jump();
      }
      if (e.code === 'ArrowDown') {
        e.preventDefault();
        dive();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [jump]);

  useEffect(() => {
    if (gameState === 'PLAYING') {
      requestRef.current = requestAnimationFrame(animate);
    }
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [gameState, animate]);

  return (
    <div className='mx-auto flex h-full w-full max-w-4xl flex-col items-center justify-center p-4'>
      <div className='mb-2 flex w-full justify-end'>
        <Button
          variant='ghost'
          size='sm'
          onClick={() => setAudioEnabled(!audioEnabled)}
        >
          {audioEnabled ? (
            <Volume2 className='h-4 w-4' />
          ) : (
            <VolumeX className='h-4 w-4' />
          )}
        </Button>
      </div>
      <div className='relative aspect-[2/1] w-full overflow-hidden rounded-xl border border-(--border-color) bg-(--card-color) shadow-sm'>
        <canvas
          ref={canvasRef}
          width={CANVAS_WIDTH}
          height={CANVAS_HEIGHT}
          className='h-full w-full cursor-pointer object-contain'
          onClick={e => {
            e.preventDefault(); // Prevent double firing on touch devices if mapped
            jump();
          }}
          onTouchStart={e => {
            // Simple touch control: Tap to jump
            // If we wanted swipe for dive, we'd need touch start/end coords
            e.preventDefault();
            jump();
          }}
        />

        {/* Overlay UI */}
        {gameState !== 'PLAYING' && (
          <div className='absolute inset-0 flex flex-col items-center justify-center bg-black/40 backdrop-blur-[2px] transition-all'>
            <div className='animate-in fade-in zoom-in rounded-2xl border border-(--border-color) bg-(--bg-color) p-8 text-center shadow-xl duration-300'>
              <h2 className='mb-2 text-4xl font-bold text-(--main-color)'>
                {gameState === 'START' ? '妖怪ラン' : 'Game Over'}
              </h2>
              <p className='mb-6 text-lg tracking-widest text-(--secondary-color) uppercase'>
                {gameState === 'START' ? 'Yokai Run' : 'Try Again?'}
              </p>

              {gameState === 'GAME_OVER' && (
                <div className='mb-6 font-mono text-2xl'>
                  Score: <span className='font-bold'>{Math.floor(score)}</span>
                </div>
              )}

              <Button
                onClick={resetGame}
                size='lg'
                className='gap-3 rounded-full px-12 py-6 text-xl transition-transform hover:scale-105'
              >
                {gameState === 'START' ? (
                  <Play className='h-6 w-6' />
                ) : (
                  <RefreshCcw className='h-6 w-6' />
                )}
                {gameState === 'START' ? 'Start Game' : 'Retry'}
              </Button>

              <p className='mt-4 text-xs text-(--secondary-color) opacity-70'>
                Space / Tap to Jump • Down to Dive • Collect Kana for Points
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
