'use client';

import { useEffect, useRef } from 'react';
import usePreferencesStore from '@/features/Preferences/store/usePreferencesStore';
import { CLICK_EFFECTS, CURSOR_TRAIL_EFFECTS } from '@/features/Preferences/data/effects/effectsData';
import { getEmojiBitmap } from '@/features/Preferences/data/effects/emojiBitmapCache';

const MAX_BACKING_PIXELS = 8_000_000;

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

/** One capped canvas replaces the former cursor and click canvases. */
export default function VisualEffectsRenderer() {
  const cursorEffect = usePreferencesStore(s => s.cursorTrailEffect);
  const clickEffect = usePreferencesStore(s => s.clickEffect);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cursorParticles = useRef<Particle[]>([]);
  const clickParticles = useRef<Particle[]>([]);
  const rafRef = useRef<number>(0);
  const visibleRef = useRef(true);
  const lastCursorSpawn = useRef(0);

  useEffect(() => {
    if (cursorEffect === 'none' && clickEffect === 'none') return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;
    const cursor = CURSOR_TRAIL_EFFECTS.find(effect => effect.id === cursorEffect);
    const click = CLICK_EFFECTS.find(effect => effect.id === clickEffect);
    let dpr = 1;

    const resize = () => {
      const area = window.innerWidth * window.innerHeight;
      dpr = Math.min(window.devicePixelRatio || 1, 2, Math.sqrt(MAX_BACKING_PIXELS / area));
      canvas.width = Math.max(1, Math.floor(window.innerWidth * dpr));
      canvas.height = Math.max(1, Math.floor(window.innerHeight * dpr));
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    const draw = (particle: Particle) => {
      const alpha = particle.life;
      const size = particle.size * (0.5 + alpha * 0.5);
      ctx.globalAlpha = alpha;
      ctx.save();
      ctx.translate(particle.x, particle.y);
      ctx.rotate(particle.rotation);
      ctx.drawImage(particle.bitmap, -size / 2, -size / 2, size, size);
      ctx.restore();
    };
    const update = (particles: Particle[]) => {
      let next = 0;
      for (let index = 0; index < particles.length; index++) {
        const particle = particles[index];
        particle.life -= particle.decay;
        if (particle.life <= 0) continue;
        particle.x += particle.vx;
        particle.y += particle.vy;
        particle.vx *= 0.97;
        particle.vy = (particle.vy + 0.02) * 0.97;
        particle.rotation += particle.rotationSpeed;
        draw(particle);
        particles[next++] = particle;
      }
      particles.length = next;
    };
    const tick = () => {
      if (!visibleRef.current) return;
      ctx.clearRect(0, 0, canvas.width / dpr, canvas.height / dpr);
      update(cursorParticles.current);
      update(clickParticles.current);
      if (cursorParticles.current.length || clickParticles.current.length) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        rafRef.current = 0;
      }
    };
    const schedule = () => {
      if (!rafRef.current && visibleRef.current) rafRef.current = requestAnimationFrame(tick);
    };
    const add = (particles: Particle[], x: number, y: number, count: number, bitmap: CanvasImageSource, limit: number) => {
      if (particles.length + count > limit) particles.splice(0, particles.length + count - limit);
      for (let index = 0; index < count; index++) particles.push({ x, y, vx: (Math.random() - .5) * 2, vy: (Math.random() - .5) * 2, life: 1, decay: .004 + Math.random() * .002, size: 40, rotation: Math.random() * Math.PI, rotationSpeed: (Math.random() - .5) * .04, bitmap });
      schedule();
    };
    const onMove = (event: MouseEvent) => {
      if (!cursor) return;
      const now = performance.now();
      if (now - lastCursorSpawn.current < 30) return;
      lastCursorSpawn.current = now;
      const bitmap = getEmojiBitmap(cursor.emoji, 40);
      if (bitmap) add(cursorParticles.current, event.clientX, event.clientY, 1, bitmap, 100);
    };
    const onClick = (x: number, y: number) => {
      if (!click) return;
      const bitmap = getEmojiBitmap(click.emoji, 48);
      if (bitmap) add(clickParticles.current, x, y, 10, bitmap, 150);
    };
    const onWindowClick = (event: MouseEvent) => onClick(event.clientX, event.clientY);
    const onTouchStart = (event: TouchEvent) => {
      const touch = event.changedTouches[0];
      if (touch) onClick(touch.clientX, touch.clientY);
    };
    const onVisibility = () => {
      visibleRef.current = !document.hidden;
      if (document.hidden) { cancelAnimationFrame(rafRef.current); rafRef.current = 0; canvas.width = 1; canvas.height = 1; }
      else { resize(); schedule(); }
    };
    resize();
    window.addEventListener('resize', resize);
    window.addEventListener('mousemove', onMove, { passive: true });
    window.addEventListener('click', onWindowClick);
    window.addEventListener('touchstart', onTouchStart, { passive: true });
    document.addEventListener('visibilitychange', onVisibility);
    return () => { cancelAnimationFrame(rafRef.current); window.removeEventListener('resize', resize); window.removeEventListener('mousemove', onMove); window.removeEventListener('click', onWindowClick); window.removeEventListener('touchstart', onTouchStart); document.removeEventListener('visibilitychange', onVisibility); cursorParticles.current = []; clickParticles.current = []; };
  }, [clickEffect, cursorEffect]);

  if (cursorEffect === 'none' && clickEffect === 'none') return null;
  return <canvas ref={canvasRef} aria-hidden='true' style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 9999 }} />;
}
