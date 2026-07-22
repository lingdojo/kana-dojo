'use client';

import { useEffect } from 'react';

/**
 * Registers the audio caching service worker
 * This component should be included in the root layout
 */
export default function ServiceWorkerRegistration() {
  useEffect(() => {
    let updateInterval: ReturnType<typeof setInterval> | undefined;
    let cancelled = false;
    let onLoad: (() => void) | undefined;

    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
    const registerServiceWorker = async () => {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js', {
          scope: '/',
        });

        if (cancelled) return;
        updateInterval = setInterval(() => {
          void registration.update();
        }, 60 * 60 * 1000);
      } catch (error) {
        console.warn('SW registration failed:', error);
      }
    };

    onLoad = () => void registerServiceWorker();
    if (document.readyState === 'complete') onLoad();
    else window.addEventListener('load', onLoad, { once: true });
    }

    return () => {
      cancelled = true;
      if (onLoad) window.removeEventListener('load', onLoad);
      if (updateInterval) clearInterval(updateInterval);
    };
  }, []);

  return null;
}

/**
 * Utility to manually cache an audio file
 */
export const cacheAudioFile = (url: string) => {
  if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
    navigator.serviceWorker.controller.postMessage({
      type: 'CACHE_AUDIO',
      url,
    });
  }
};

/**
 * Utility to clear the audio cache
 */
export const clearAudioCache = () => {
  if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
    navigator.serviceWorker.controller.postMessage({
      type: 'CLEAR_AUDIO_CACHE',
    });
  }
};
