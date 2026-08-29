'use client';

import { useEffect, useRef } from 'react';
import usePreferencesStore from '@/features/Preferences/store/usePreferencesStore';
import {
  CLICK_EFFECTS,
  CURSOR_TRAIL_EFFECTS,
} from '@/features/Preferences/data/effects/effectsData';
import { getEmojiBitmap } from '@/features/Preferences/data/effects/emojiBitmapCache';
import { useHasFinePointer } from '@/shared/hooks/generic/useHasFinePointer';

const MAX_BACKING_PIXELS = 8_000_000;
const MAX_CURSOR_PARTICLES = 100;
const MAX_CLICK_PARTICLES = 150;
const CURSOR_SPAWN_THROTTLE_MS = 30;
const CLICK_BURST_COUNT = 10;

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

/** Renders both effects on one capped canvas to minimize retained GPU memory. */
export default function VisualEffectsRenderer() {
  const cursorEffectId = usePreferencesStore(state => state.cursorTrailEffect);
  const clickEffectId = usePreferencesStore(state => state.clickEffect);
  const hasFinePointer = useHasFinePointer();
  const cursorEmoji = CURSOR_TRAIL_EFFECTS.find(
    effect => effect.id === cursorEffectId,
  )?.emoji;
  const clickEmoji = CLICK_EFFECTS.find(
    effect => effect.id === clickEffectId,
  )?.emoji;
  const isEnabled = Boolean(cursorEmoji || clickEmoji);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cursorEmojiRef = useRef(cursorEmoji);
  const clickEmojiRef = useRef(clickEmoji);
  const hasFinePointerRef = useRef(hasFinePointer);
  const cursorParticles = useRef<Particle[]>([]);
  const clickParticles = useRef<Particle[]>([]);
  const rafRef = useRef(0);
  const visibleRef = useRef(true);
  const lastCursorSpawn = useRef(0);

  // Handlers read refs so changing an emoji does not tear down the scheduler.
  useEffect(() => {
    cursorEmojiRef.current = cursorEmoji;
    clickEmojiRef.current = clickEmoji;
    hasFinePointerRef.current = hasFinePointer;
  }, [clickEmoji, cursorEmoji, hasFinePointer]);

  useEffect(() => {
    if (!isEnabled) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;
    const activeCursorParticles = cursorParticles.current;
    const activeClickParticles = clickParticles.current;
    let dpr = 1;

    const resize = () => {
      const area = Math.max(1, window.innerWidth * window.innerHeight);
      dpr = Math.min(
        window.devicePixelRatio || 1,
        2,
        Math.sqrt(MAX_BACKING_PIXELS / area),
      );
      canvas.width = Math.max(1, Math.floor(window.innerWidth * dpr));
      canvas.height = Math.max(1, Math.floor(window.innerHeight * dpr));
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const draw = (particle: Particle, scale: number) => {
      const size = particle.size * scale;
      ctx.globalAlpha = particle.life;
      ctx.save();
      ctx.translate(particle.x, particle.y);
      ctx.rotate(particle.rotation);
      ctx.drawImage(particle.bitmap, -size / 2, -size / 2, size, size);
      ctx.restore();
    };

    const updateCursorParticles = () => {
      const particles = cursorParticles.current;
      let next = 0;
      for (const particle of particles) {
        particle.life -= particle.decay;
        if (particle.life <= 0) continue;
        particle.x += particle.vx;
        particle.y += particle.vy;
        particle.rotation += particle.rotationSpeed;
        draw(particle, particle.life);
        particles[next++] = particle;
      }
      particles.length = next;
    };

    const updateClickParticles = () => {
      const particles = clickParticles.current;
      let next = 0;
      for (const particle of particles) {
        particle.life -= particle.decay;
        if (particle.life <= 0) continue;
        particle.x += particle.vx;
        particle.y += particle.vy;
        particle.vy += 0.03;
        particle.vx *= 0.97;
        particle.vy *= 0.97;
        particle.rotation += particle.rotationSpeed;
        draw(particle, 0.5 + particle.life * 0.5);
        particles[next++] = particle;
      }
      particles.length = next;
    };

    function schedule() {
      if (rafRef.current === 0 && visibleRef.current) {
        rafRef.current = requestAnimationFrame(tick);
      }
    }

    function tick() {
      // The scheduled frame is consumed; zero is the sole idle state.
      rafRef.current = 0;
      if (!visibleRef.current || !canvas || !ctx) return;
      ctx.clearRect(0, 0, canvas.width / dpr, canvas.height / dpr);
      updateCursorParticles();
      updateClickParticles();
      ctx.globalAlpha = 1;
      if (cursorParticles.current.length || clickParticles.current.length)
        schedule();
    }

    const onMove = (event: MouseEvent) => {
      const emoji = cursorEmojiRef.current;
      if (!emoji || !hasFinePointerRef.current) return;
      const now = performance.now();
      if (now - lastCursorSpawn.current < CURSOR_SPAWN_THROTTLE_MS) return;
      lastCursorSpawn.current = now;

      const bitmap = getEmojiBitmap(emoji, 40);
      if (!bitmap) return;
      const particles = cursorParticles.current;
      if (particles.length >= MAX_CURSOR_PARTICLES) particles.shift();
      particles.push({
        x: event.clientX + (Math.random() - 0.5) * 6,
        y: event.clientY + (Math.random() - 0.5) * 6,
        vx: (Math.random() - 0.5) * 0.12,
        vy: Math.random() * 0.15 + 0.04,
        life: 1,
        decay: 0.004 + Math.random() * 0.0015,
        size: 40,
        rotation: (Math.random() - 0.5) * 0.25,
        rotationSpeed: (Math.random() - 0.5) * 0.02,
        bitmap,
      });
      schedule();
    };

    const spawnClick = (x: number, y: number) => {
      const emoji = clickEmojiRef.current;
      if (!emoji) return;
      const bitmap = getEmojiBitmap(emoji, 48);
      if (!bitmap) return;
      const particles = clickParticles.current;
      const overflow =
        particles.length + CLICK_BURST_COUNT - MAX_CLICK_PARTICLES;
      if (overflow > 0) particles.splice(0, overflow);
      for (let index = 0; index < CLICK_BURST_COUNT; index++) {
        const angle =
          (index / CLICK_BURST_COUNT) * Math.PI * 2 + Math.random() * 0.35;
        const speed = Math.random() * 1.6 + 0.8;
        particles.push({
          x,
          y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          life: 1,
          decay: 0.0035 + Math.random() * 0.0015,
          size: Math.random() * 10 + 40,
          rotation: Math.random() * Math.PI * 2,
          rotationSpeed: (Math.random() - 0.5) * 0.08,
          bitmap,
        });
      }
      schedule();
    };

    const onWindowClick = (event: MouseEvent) =>
      spawnClick(event.clientX, event.clientY);
    const onTouchStart = (event: TouchEvent) => {
      const touch = event.changedTouches[0];
      if (touch) spawnClick(touch.clientX, touch.clientY);
    };
    const onVisibilityChange = () => {
      visibleRef.current = !document.hidden;
      if (document.hidden) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = 0;
        cursorParticles.current.length = 0;
        clickParticles.current.length = 0;
        canvas.width = 1;
        canvas.height = 1;
        return;
      }
      resize();
    };

    visibleRef.current = !document.hidden;
    resize();
    window.addEventListener('resize', resize);
    window.addEventListener('mousemove', onMove, { passive: true });
    window.addEventListener('click', onWindowClick);
    window.addEventListener('touchstart', onTouchStart, { passive: true });
    document.addEventListener('visibilitychange', onVisibilityChange);

    return () => {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = 0;
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('click', onWindowClick);
      window.removeEventListener('touchstart', onTouchStart);
      document.removeEventListener('visibilitychange', onVisibilityChange);
      activeCursorParticles.length = 0;
      activeClickParticles.length = 0;
    };
  }, [isEnabled]);

  if (!isEnabled) return null;
  return (
    <canvas
      ref={canvasRef}
      aria-hidden='true'
      style={{
        position: 'fixed',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 9999,
      }}
    />
  );
}
