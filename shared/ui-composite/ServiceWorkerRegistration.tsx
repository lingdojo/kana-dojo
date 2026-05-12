'use client';

import { useEffect } from 'react';

/**
 * Registers the audio caching service worker
 * This component should be included in the root layout
 */
export default function ServiceWorkerRegistration() {
  useEffect(() => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        const registerServiceWorker = async () => {
          try {
            const registration = await navigator.serviceWorker.register(
              '/sw.js',
              {
                scope: '/sounds/',
              },
            );

            console.warn('Audio SW registered:', registration.scope);

            setInterval(
              () => {
                registration.update();
              },
              60 * 60 * 1000,
            );
          } catch (error) {
            console.warn('SW registration failed:', error);
          }
        };

        void registerServiceWorker();
      });
    }
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
