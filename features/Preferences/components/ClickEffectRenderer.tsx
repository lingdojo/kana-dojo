'use client';
import { useEffect, useRef } from 'react';
import usePreferencesStore from '@/features/Preferences/store/usePreferencesStore';
import { CLICK_EFFECTS } from '@/features/Preferences/data/effectsData';
import { getEmojiBitmap } from '@/features/Preferences/data/emojiBitmapCache';

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
  bitmap: CanvasImageSource;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function ClickEffectRenderer() {
  const effectId = usePreferencesStore(s => s.clickEffect);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particles = useRef<Particle[]>([]);
  const rafRef = useRef<number>(0);
  const mountedRef = useRef(false);
  const hasParticles = useRef(false); // skip render loop when idle

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (effectId === 'none') return;

    const effectDef = CLICK_EFFECTS.find(e => e.id === effectId);
    if (!effectDef) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    mountedRef.current = true;
    const emoji = effectDef.emoji;

    // Pre-warm bitmap cache
    getEmojiBitmap(emoji, 22);

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

    // ── Spawn burst ───────────────────────────────────────────────────────────
    const BURST_COUNT = 7;

    const spawnAt = (x: number, y: number) => {
      const bmp = getEmojiBitmap(emoji, 22);
      if (!bmp) return;
      for (let i = 0; i < BURST_COUNT; i++) {
        const angle = (i / BURST_COUNT) * Math.PI * 2 + Math.random() * 0.35;
        const speed = Math.random() * 2.5 + 1.2;
        particles.current.push({
          x,
          y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          life: 1,
          decay: 0.022 + Math.random() * 0.008,
          size: Math.random() * 6 + 14,
          rotation: Math.random() * Math.PI * 2,
          rotationSpeed: (Math.random() - 0.5) * 0.08,
          bitmap: bmp,
        });
      }
      // Start ticking if idle
      if (!hasParticles.current) {
        hasParticles.current = true;
        rafRef.current = requestAnimationFrame(tick);
      }
    };

    const onClick = (e: MouseEvent) => spawnAt(e.clientX, e.clientY);
    const onTouch = (e: TouchEvent) => {
      const t = e.changedTouches[0];
      if (t) spawnAt(t.clientX, t.clientY);
    };

    window.addEventListener('click', onClick);
    window.addEventListener('touchstart', onTouch, { passive: true });

    // ── Render loop (only runs while particles exist) ─────────────────────────
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
        p.vy += 0.05; // softer gravity
        p.vx *= 0.98; // air resistance
        p.vy *= 0.98;
        p.rotation += p.rotationSpeed;

        const alpha = p.life;
        ctx.globalAlpha = alpha;
        const s = p.size * (0.5 + alpha * 0.5); // shrink to 50%
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

      if (writeIdx > 0) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        // All particles gone — stop the loop to save CPU
        hasParticles.current = false;
        ctx.clearRect(0, 0, w, h);
      }
    };

    return () => {
      mountedRef.current = false;
      window.removeEventListener('click', onClick);
      window.removeEventListener('touchstart', onTouch);
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(rafRef.current);
      particles.current.length = 0;
      hasParticles.current = false;
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
