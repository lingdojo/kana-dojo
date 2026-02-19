'use client';
import { useEffect, useRef } from 'react';
import usePreferencesStore from '@/features/Preferences/store/usePreferencesStore';
import {
  CURSOR_TRAIL_EFFECTS,
  KANJI_POOL,
} from '@/features/Preferences/data/effectsData';
import { getEmojiBitmap } from '@/features/Preferences/data/emojiBitmapCache';

// ─── Particle (flat struct, no strings at draw time) ──────────────────────────

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
  bitmap: CanvasImageSource; // pre-rendered emoji bitmap
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function CursorTrailRenderer() {
  const effectId = usePreferencesStore(s => s.cursorTrailEffect);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particles = useRef<Particle[]>([]);
  const rafRef = useRef<number>(0);
  const mountedRef = useRef(false);
  const lastSpawn = useRef(0); // timestamp throttle

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!window.matchMedia('(pointer: fine)').matches) return;
    if (effectId === 'none') return;

    const effectDef = CURSOR_TRAIL_EFFECTS.find(e => e.id === effectId);
    if (!effectDef) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    mountedRef.current = true;
    const isKanji = effectId === 'kanji';
    const emoji = effectDef.emoji;

    // Pre-warm bitmap cache
    if (isKanji) {
      KANJI_POOL.forEach(k => getEmojiBitmap(k, 20));
    } else {
      getEmojiBitmap(emoji, 20);
    }

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const resize = () => {
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener('resize', resize);

    // ── Throttled mousemove: spawn max 1 particle every 30ms ──────────────
    const MAX_PARTICLES = 80;
    const SPAWN_THROTTLE_MS = 30;

    const onMove = (e: MouseEvent) => {
      const now = performance.now();
      if (now - lastSpawn.current < SPAWN_THROTTLE_MS) return;
      lastSpawn.current = now;

      const em = isKanji
        ? KANJI_POOL[Math.floor(Math.random() * KANJI_POOL.length)]
        : emoji;

      const bmp = getEmojiBitmap(em, 18);
      if (!bmp) return;

      if (particles.current.length >= MAX_PARTICLES) {
        // Reuse the oldest particle instead of allocating
        const p = particles.current.shift()!;
        p.x = e.clientX + (Math.random() - 0.5) * 6;
        p.y = e.clientY + (Math.random() - 0.5) * 6;
        p.vx = (Math.random() - 0.5) * 0.25;
        p.vy = Math.random() * 0.25 + 0.08;
        p.life = 1;
        p.decay = 0.028 + Math.random() * 0.01;
        p.size = 16;
        p.rotation = (Math.random() - 0.5) * 0.25;
        p.rotationSpeed = (Math.random() - 0.5) * 0.02;
        p.bitmap = bmp;
        particles.current.push(p);
      } else {
        particles.current.push({
          x: e.clientX + (Math.random() - 0.5) * 6,
          y: e.clientY + (Math.random() - 0.5) * 6,
          vx: (Math.random() - 0.5) * 0.25,
          vy: Math.random() * 0.25 + 0.08,
          life: 1,
          decay: 0.028 + Math.random() * 0.01, // ~30-35 frame lifespan
          size: 16,
          rotation: (Math.random() - 0.5) * 0.25,
          rotationSpeed: (Math.random() - 0.5) * 0.02,
          bitmap: bmp,
        });
      }
    };
    window.addEventListener('mousemove', onMove, { passive: true });

    // ── Render loop ───────────────────────────────────────────────────────────
    const tick = () => {
      if (!mountedRef.current) return;

      const w = canvas.width / dpr;
      const h = canvas.height / dpr;
      ctx.clearRect(0, 0, w, h);

      let writeIdx = 0;
      const arr = particles.current;
      for (let i = 0; i < arr.length; i++) {
        const p = arr[i];
        p.life -= p.decay;
        if (p.life <= 0) continue;
        p.x += p.vx;
        p.y += p.vy;
        p.rotation += p.rotationSpeed;

        // Draw with pre-rendered bitmap (fast path: drawImage)
        const alpha = p.life;
        ctx.globalAlpha = alpha;
        const s = p.size * alpha; // shrink as it fades
        const hs = s * 0.5;
        if (p.rotation !== 0) {
          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate(p.rotation);
          ctx.drawImage(p.bitmap, -hs, -hs, s, s);
          ctx.restore();
        } else {
          ctx.drawImage(p.bitmap, p.x - hs, p.y - hs, s, s);
        }

        arr[writeIdx++] = p;
      }
      arr.length = writeIdx;
      ctx.globalAlpha = 1;

      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);

    return () => {
      mountedRef.current = false;
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(rafRef.current);
      particles.current.length = 0;
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
