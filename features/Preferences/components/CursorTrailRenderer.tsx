'use client';
import { useEffect, useRef } from 'react';
import usePreferencesStore from '@/features/Preferences/store/usePreferencesStore';
import {
  CURSOR_TRAIL_EFFECTS,
  KANJI_POOL,
} from '@/features/Preferences/data/effectsData';

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
  emoji: string;
}

// ─── Spawn + draw ─────────────────────────────────────────────────────────────

function spawnTrail(
  x: number,
  y: number,
  emoji: string,
  isKanji: boolean,
): Particle[] {
  const count = isKanji ? 1 : Math.random() > 0.5 ? 2 : 1;
  return Array.from({ length: count }, () => ({
    x: x + (Math.random() - 0.5) * 8,
    y: y + (Math.random() - 0.5) * 8,
    vx: (Math.random() - 0.5) * 0.6,
    vy: Math.random() * 0.5 + 0.15,
    life: 1,
    decay: 0.015 + Math.random() * 0.008,
    size: Math.random() * 6 + 12,
    rotation: (Math.random() - 0.5) * 0.3,
    rotationSpeed: (Math.random() - 0.5) * 0.04,
    emoji: isKanji
      ? KANJI_POOL[Math.floor(Math.random() * KANJI_POOL.length)]
      : emoji,
  }));
}

function drawParticle(ctx: CanvasRenderingContext2D, p: Particle): void {
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

// ─── Component ────────────────────────────────────────────────────────────────

export default function CursorTrailRenderer() {
  const effectId = usePreferencesStore(s => s.cursorTrailEffect);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const rafRef = useRef<number>(0);
  const mountedRef = useRef(false);

  useEffect(() => {
    if (!window.matchMedia('(pointer: fine)').matches) return;
    if (effectId === 'none') return;

    const effectDef = CURSOR_TRAIL_EFFECTS.find(e => e.id === effectId);
    if (!effectDef) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    mountedRef.current = true;
    const isKanji = effectId === 'kanji';
    const emoji = effectDef.emoji;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const onMove = (e: MouseEvent) => {
      const spawned = spawnTrail(e.clientX, e.clientY, emoji, isKanji);
      particlesRef.current.push(...spawned);
      if (particlesRef.current.length > 150) {
        particlesRef.current = particlesRef.current.slice(-150);
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
        drawParticle(ctx, p);
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
  }, [effectId]);

  if (effectId === 'none') return null;

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
