'use client';

import { useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';

export interface UseIndefiniteConfettiOptions {
  active: boolean;
  emojis: string[];
  scalar?: number;
  duration?: number; // ms, for an auto-off style
  intervalMs?: number;
  particleBaseCount?: number;
}

function useFireworkEmojiConfetti({
  active,
  emojis,
  scalar = 2,
  duration,
  intervalMs = 250,
  particleBaseCount = 50,
}: UseIndefiniteConfettiOptions) {
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!active || !emojis.length) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    const shapes = emojis.map(emoji =>
      confetti.shapeFromText({ text: emoji, scalar }),
    );

    // --- Firework style params
    const fireworkDuration = duration ?? 15_000;
    const animationEnd = Date.now() + fireworkDuration;
    const defaults = {
      startVelocity: 30,
      spread: 360,
      ticks: 60,
      zIndex: 0,
      shapes,
    };

    function randomInRange(min: number, max: number) {
      return Math.random() * (max - min) + min;
    }

    const fireFn = () => {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
        return;
      }

      const particleCount = Math.round(
        particleBaseCount * (timeLeft / fireworkDuration),
      );

      // Two firework bursts per tick, different origins
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
      });
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
      });
    };

    fireFn();
    intervalRef.current = setInterval(fireFn, intervalMs);

    // Clean up
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    active,
    emojis.join(':'),
    scalar,
    duration,
    intervalMs,
    particleBaseCount,
  ]);
}

export default useFireworkEmojiConfetti;
