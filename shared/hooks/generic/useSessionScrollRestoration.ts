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
  const scrollElementRef = useRef<HTMLDivElement>(null);
  const positionRef = useRef(0);
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout>>(null);
  const enabledRef = useRef(enabled);
  const readyRef = useRef(ready);

  enabledRef.current = enabled;
  readyRef.current = ready;

  const savePosition = useCallback(() => {
    try {
      sessionStorage.setItem(storageKey, String(positionRef.current));
    } catch {
      // Storage can be unavailable in restricted browser environments.
    }
  }, [storageKey]);

  const restorePosition = useCallback(
    (scrollElement: HTMLDivElement) => {
      try {
        const storedPosition = Number(sessionStorage.getItem(storageKey));
        const position =
          Number.isFinite(storedPosition) && storedPosition >= 0
            ? storedPosition
            : 0;

        positionRef.current = position;
        scrollElement.scrollTop = position;
      } catch {
        positionRef.current = 0;
        scrollElement.scrollTop = 0;
      }
    },
    [storageKey],
  );

  const scrollRef = useCallback(
    (scrollElement: HTMLDivElement | null) => {
      scrollElementRef.current = scrollElement;

      if (scrollElement && enabledRef.current && readyRef.current) {
        restorePosition(scrollElement);
      }
    },
    [restorePosition],
  );

  useLayoutEffect(() => {
    if (!enabled || !ready || !scrollElementRef.current) return;
    restorePosition(scrollElementRef.current);
  }, [enabled, ready, restorePosition]);

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
