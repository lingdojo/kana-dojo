'use client';

import { useCallback, useEffect, useLayoutEffect, useRef } from 'react';
import type { UIEvent } from 'react';

interface SessionScrollRestorationOptions {
  enabled: boolean;
  ready?: boolean;
}

const SAVE_DELAY_MS = 100;

export default function useSessionScrollRestoration(
  storageKey: string,
  { enabled, ready = true }: SessionScrollRestorationOptions,
) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const positionRef = useRef(0);
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout>>(null);

  const savePosition = useCallback(() => {
    try {
      sessionStorage.setItem(storageKey, String(positionRef.current));
    } catch {
      // Storage can be unavailable in restricted browser environments.
    }
  }, [storageKey]);

  useLayoutEffect(() => {
    if (!enabled || !ready || !scrollRef.current) return;

    try {
      const storedPosition = Number(sessionStorage.getItem(storageKey));
      const position =
        Number.isFinite(storedPosition) && storedPosition >= 0
          ? storedPosition
          : 0;

      positionRef.current = position;
      scrollRef.current.scrollTop = position;
    } catch {
      positionRef.current = 0;
      scrollRef.current.scrollTop = 0;
    }
  }, [enabled, ready, storageKey]);

  useEffect(() => {
    if (!enabled) return;

    return () => {
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
      savePosition();
    };
  }, [enabled, savePosition]);

  const handleScroll = useCallback(
    (event: UIEvent<HTMLDivElement>) => {
      positionRef.current = event.currentTarget.scrollTop;

      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
      saveTimeoutRef.current = setTimeout(savePosition, SAVE_DELAY_MS);
    },
    [savePosition],
  );

  return { scrollRef, handleScroll };
}
