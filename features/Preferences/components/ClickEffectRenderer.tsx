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
  life: number;
  decay: number;
  size: number;
  rotation: number;
  rotationSpeed: number;
  imageId?: string;
  emoji?: string;
}

// ─── Emoji pools ──────────────────────────────────────────────────────────────

const FESTIVAL_POOL = ['🏮', '🌸', '🎋', '🪷', '✨'];
const MOMIJI_EMOJI = '🍂';

// ─── Shared draw helpers ──────────────────────────────────────────────────────

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

// ─── Effect definitions ───────────────────────────────────────────────────────

type SpawnFn = (x: number, y: number) => Particle[];
type DrawFn = (ctx: CanvasRenderingContext2D, p: Particle) => void;

const EFFECTS: Record<
  string,
  { preload?: string[]; spawn: SpawnFn; draw: DrawFn }
> = {
  // ── Sakura Burst — petals radiate outward ─────────────────────────────────
  'sakura-burst': {
    preload: ['sakura'],
    spawn: (x, y) => {
      const count = 10 + Math.floor(Math.random() * 5);
      return Array.from({ length: count }, (_, i) => {
        const angle = (i / count) * Math.PI * 2 + Math.random() * 0.4;
        const speed = Math.random() * 3.5 + 2;
        return {
          x,
          y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          life: 1,
          decay: 0.018 + Math.random() * 0.008,
          size: Math.random() * 10 + 10,
          rotation: Math.random() * Math.PI * 2,
          rotationSpeed: (Math.random() - 0.5) * 0.12,
          imageId: 'sakura',
        };
      });
    },
    draw: drawSVGParticle,
  },

  // ── Ink Splash — ink drops radiate outward ───────────────────────────────
  'ink-splash': {
    preload: ['ink-drop'],
    spawn: (x, y) => {
      const count = 9 + Math.floor(Math.random() * 5);
      return Array.from({ length: count }, (_, i) => {
        const angle = (i / count) * Math.PI * 2 + Math.random() * 0.5;
        const speed = Math.random() * 4 + 1.5;
        return {
          x,
          y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          life: 1,
          decay: 0.022 + Math.random() * 0.01,
          size: Math.random() * 9 + 7,
          rotation: angle + Math.PI / 2, // orient teardrop outward
          rotationSpeed: 0,
          imageId: 'ink-drop',
        };
      });
    },
    draw: drawSVGParticle,
  },

  // ── Torii — gates shoot outward ───────────────────────────────────────────
  torii: {
    preload: ['torii'],
    spawn: (x, y) => {
      const count = 6;
      return Array.from({ length: count }, (_, i) => {
        const angle = (i / count) * Math.PI * 2 + Math.PI / 12;
        const speed = Math.random() * 3.5 + 2.5;
        return {
          x,
          y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          life: 1,
          decay: 0.02 + Math.random() * 0.008,
          size: Math.random() * 8 + 14,
          rotation: Math.random() * Math.PI * 2,
          rotationSpeed: (Math.random() - 0.5) * 0.06,
          imageId: 'torii',
        };
      });
    },
    draw: drawSVGParticle,
  },

  // ── Shockwave — clean canvas ring (no image needed) ───────────────────────
  shockwave: {
    spawn: (x, y) => [
      {
        x,
        y,
        vx: 0,
        vy: 0,
        life: 1,
        decay: 0.022,
        size: 4,
        rotation: 0,
        rotationSpeed: 0,
      },
    ],
    draw: (ctx, p) => {
      ctx.save();
      const radius = p.size + (1 - p.life) * 55;
      ctx.globalAlpha = p.life * 0.85;
      ctx.strokeStyle = '#B0B8D0';
      ctx.lineWidth = 2 * p.life;
      ctx.beginPath();
      ctx.arc(p.x, p.y, radius, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    },
  },

  // ── Momiji Rain — 🍂 emoji scatter from click ─────────────────────────────
  'momiji-rain': {
    spawn: (x, y) => {
      const count = 10 + Math.floor(Math.random() * 5);
      return Array.from({ length: count }, () => {
        const angle = (Math.random() - 0.5) * Math.PI + Math.PI * 0.5;
        const speed = Math.random() * 3 + 1.5;
        return {
          x: x + (Math.random() - 0.5) * 20,
          y,
          vx: Math.cos(angle) * speed * 0.6,
          vy: -(Math.random() * 2 + 1), // initially up, gravity brings down
          life: 1,
          decay: 0.015 + Math.random() * 0.008,
          size: Math.random() * 10 + 14,
          rotation: Math.random() * Math.PI * 2,
          rotationSpeed: (Math.random() - 0.5) * 0.1,
          emoji: MOMIJI_EMOJI,
        };
      });
    },
    draw: drawEmojiParticle,
  },

  // ── Festival — mixed emoji burst ──────────────────────────────────────────
  festival: {
    spawn: (x, y) => {
      const count = 12 + Math.floor(Math.random() * 6);
      return Array.from({ length: count }, (_, i) => {
        const angle = (i / count) * Math.PI * 2 + Math.random() * 0.3;
        const speed = Math.random() * 4 + 2;
        return {
          x,
          y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          life: 1,
          decay: 0.016 + Math.random() * 0.01,
          size: Math.random() * 10 + 14,
          rotation: 0,
          rotationSpeed: 0,
          emoji: FESTIVAL_POOL[i % FESTIVAL_POOL.length],
        };
      });
    },
    draw: drawEmojiParticle,
  },
};

// ─── Component ────────────────────────────────────────────────────────────────

export default function ClickEffectRenderer() {
  const clickEffect = usePreferencesStore(s => s.clickEffect);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const rafRef = useRef<number>(0);
  const mountedRef = useRef(false);

  useEffect(() => {
    if (clickEffect === 'none') return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    mountedRef.current = true;

    const effect = EFFECTS[clickEffect];
    if (!effect) return;

    if (effect.preload) preloadEffectImages(effect.preload);

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const spawnAt = (x: number, y: number) => {
      const spawned = effect.spawn(x, y);
      particlesRef.current.push(...spawned);
    };

    const onClick = (e: MouseEvent) => spawnAt(e.clientX, e.clientY);
    const onTouch = (e: TouchEvent) => {
      const t = e.changedTouches[0];
      if (t) spawnAt(t.clientX, t.clientY);
    };

    window.addEventListener('click', onClick);
    window.addEventListener('touchstart', onTouch, { passive: true });

    const tick = () => {
      if (!mountedRef.current) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particlesRef.current = particlesRef.current.filter(p => {
        p.life -= p.decay;
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.1; // gravity
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
      window.removeEventListener('click', onClick);
      window.removeEventListener('touchstart', onTouch);
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(rafRef.current);
      particlesRef.current = [];
    };
  }, [clickEffect]);

  if (clickEffect === 'none') return null;

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
