'use client';
import { useEffect, useRef } from 'react';
import usePreferencesStore from '@/features/Preferences/store/usePreferencesStore';
import {
  preloadEffectImages,
  getEffectImage,
  EFFECT_SVG_ASPECT,
} from '@/features/Preferences/data/effectImages';

// ─── Particle ─────────────────────────────────────────────────────────────────

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number; // 1 → 0
  decay: number; // subtracted from life each frame
  size: number;
  rotation: number;
  rotationSpeed: number;
  imageId?: string; // SVG-based effects
  emoji?: string; // emoji/text-based effects
}

// ─── Japan palette (hardcoded — not theme-dependent) ─────────────────────────

const KANJI_POOL = ['花', '道', '愛', '心', '雪', '月', '桜', '平', '和', '風'];

// ─── Effect definitions ───────────────────────────────────────────────────────

type SpawnFn = (x: number, y: number, angle: number) => Particle[];
type DrawFn = (ctx: CanvasRenderingContext2D, p: Particle) => void;

function drawSVGParticle(ctx: CanvasRenderingContext2D, p: Particle): void {
  if (!p.imageId) return;
  const img = getEffectImage(p.imageId);
  if (!img) return;
  const aspect = EFFECT_SVG_ASPECT[p.imageId] ?? 1;
  const w = p.size;
  const h = p.size * aspect;
  ctx.save();
  ctx.translate(p.x, p.y);
  ctx.rotate(p.rotation);
  ctx.globalAlpha = Math.max(0, p.life);
  ctx.drawImage(img, -w / 2, -h / 2, w, h);
  ctx.restore();
}

function drawEmojiParticle(ctx: CanvasRenderingContext2D, p: Particle): void {
  if (!p.emoji) return;
  ctx.save();
  ctx.translate(p.x, p.y);
  ctx.rotate(p.rotation);
  ctx.globalAlpha = Math.max(0, p.life);
  ctx.font = `${p.size}px serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(p.emoji, 0, 0);
  ctx.restore();
}

const EFFECTS: Record<
  string,
  { preload?: string[]; spawn: SpawnFn; draw: DrawFn }
> = {
  // ── Sakura ────────────────────────────────────────────────────────────────
  sakura: {
    preload: ['sakura'],
    spawn: (x, y) => {
      const count = Math.random() > 0.5 ? 2 : 1;
      return Array.from({ length: count }, () => ({
        x: x + (Math.random() - 0.5) * 6,
        y: y + (Math.random() - 0.5) * 6,
        vx: (Math.random() - 0.5) * 0.5,
        vy: Math.random() * 0.6 + 0.2,
        life: 1,
        decay: 0.016 + Math.random() * 0.009,
        size: Math.random() * 10 + 10,
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.07,
        imageId: 'sakura',
      }));
    },
    draw: drawSVGParticle,
  },

  // ── Momiji ────────────────────────────────────────────────────────────────
  momiji: {
    preload: ['momiji'],
    spawn: (x, y) => [
      {
        x,
        y: y + (Math.random() - 0.5) * 4,
        vx: (Math.random() - 0.5) * 0.8,
        vy: Math.random() * 0.7 + 0.4,
        life: 1,
        decay: 0.014 + Math.random() * 0.008,
        size: Math.random() * 10 + 12,
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.09,
        imageId: 'momiji',
      },
    ],
    draw: drawSVGParticle,
  },

  // ── Ink Drop ──────────────────────────────────────────────────────────────
  'ink-drop': {
    preload: ['ink-drop'],
    spawn: (x, y) => [
      {
        x: x + (Math.random() - 0.5) * 4,
        y: y + (Math.random() - 0.5) * 4,
        vx: (Math.random() - 0.5) * 0.3,
        vy: Math.random() * 0.5 + 0.1,
        life: 1,
        decay: 0.022 + Math.random() * 0.01,
        size: Math.random() * 8 + 8,
        rotation: (Math.random() - 0.5) * 0.4,
        rotationSpeed: 0,
        imageId: 'ink-drop',
      },
    ],
    draw: drawSVGParticle,
  },

  // ── Koi Stream — fish oriented toward the mouse travel direction ──────────
  koi: {
    preload: ['koi'],
    spawn: (x, y, angle) => [
      {
        x,
        y,
        vx: 0,
        vy: 0,
        life: 1,
        decay: 0.025 + Math.random() * 0.008,
        size: Math.random() * 8 + 14, // koi is wide (aspect 0.5), so size = width
        rotation: angle,
        rotationSpeed: 0,
        imageId: 'koi',
      },
    ],
    draw: drawSVGParticle,
  },

  // ── Firefly ───────────────────────────────────────────────────────────────
  firefly: {
    preload: ['firefly'],
    spawn: (x, y) => [
      {
        x: x + (Math.random() - 0.5) * 10,
        y: y + (Math.random() - 0.5) * 10,
        vx: (Math.random() - 0.5) * 0.4,
        vy: -(Math.random() * 0.5 + 0.2),
        life: 1,
        decay: 0.012 + Math.random() * 0.008,
        size: Math.random() * 10 + 10,
        rotation: 0,
        rotationSpeed: 0,
        imageId: 'firefly',
      },
    ],
    draw: (ctx, p) => {
      // Pulse the alpha for a breathing glow effect
      const pulse = 0.7 + 0.3 * Math.sin(Date.now() * 0.006 + p.x * 0.05);
      const saved = p.life;
      p.life = saved * pulse;
      drawSVGParticle(ctx, p);
      p.life = saved;
    },
  },

  // ── Kanji (emoji/text style) ───────────────────────────────────────────────
  kanji: {
    spawn: (x, y) => [
      {
        x: x + (Math.random() - 0.5) * 8,
        y,
        vx: (Math.random() - 0.5) * 0.3,
        vy: -(Math.random() * 0.5 + 0.2),
        life: 1,
        decay: 0.014 + Math.random() * 0.008,
        size: Math.random() * 8 + 14,
        rotation: (Math.random() - 0.5) * 0.2,
        rotationSpeed: (Math.random() - 0.5) * 0.01,
        emoji: KANJI_POOL[Math.floor(Math.random() * KANJI_POOL.length)],
      },
    ],
    draw: drawEmojiParticle,
  },
};

// ─── Component ────────────────────────────────────────────────────────────────

export default function CursorTrailRenderer() {
  const cursorTrailEffect = usePreferencesStore(s => s.cursorTrailEffect);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const rafRef = useRef<number>(0);
  const mountedRef = useRef(false);
  const prevMouseRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    // Desktop / pointer-fine only
    if (!window.matchMedia('(pointer: fine)').matches) return;
    if (cursorTrailEffect === 'none') return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    mountedRef.current = true;

    const effect = EFFECTS[cursorTrailEffect];
    if (!effect) return;

    // Pre-load SVG images this effect needs
    if (effect.preload) preloadEffectImages(effect.preload);

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const onMove = (e: MouseEvent) => {
      const dx = e.clientX - prevMouseRef.current.x;
      const dy = e.clientY - prevMouseRef.current.y;
      const angle = Math.atan2(dy, dx);
      prevMouseRef.current = { x: e.clientX, y: e.clientY };

      const spawned = effect.spawn(e.clientX, e.clientY, angle);
      particlesRef.current.push(...spawned);
      if (particlesRef.current.length > 200) {
        particlesRef.current = particlesRef.current.slice(-200);
      }
    };
    window.addEventListener('mousemove', onMove);

    const tick = () => {
      if (!mountedRef.current) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particlesRef.current = particlesRef.current.filter(p => {
        p.life -= p.decay;
        p.x += p.vx;
        p.y += p.vy;
        p.rotation += p.rotationSpeed;
        if (p.life <= 0) return false;
        effect.draw(ctx, p);
        return true;
      });
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);

    return () => {
      mountedRef.current = false;
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(rafRef.current);
      particlesRef.current = [];
    };
  }, [cursorTrailEffect]);

  if (cursorTrailEffect === 'none') return null;

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 9999,
      }}
      aria-hidden='true'
    />
  );
}
