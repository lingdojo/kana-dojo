'use client';

import { useSyncExternalStore } from 'react';
import { isOnline } from '../services/translationAPI';

function subscribe(onStoreChange: () => void): () => void {
  window.addEventListener('online', onStoreChange);
  window.addEventListener('offline', onStoreChange);
  return () => {
    window.removeEventListener('online', onStoreChange);
    window.removeEventListener('offline', onStoreChange);
  };
}

// The server (and the hydrating client render) always assume online, so the
// server HTML and the first client render match. React then re-renders with
// the real browser status from `isOnline` right after hydration.
function getServerSnapshot(): boolean {
  return true;
}

/**
 * Hydration-safe browser online status that follows `online`/`offline` events.
 */
export function useOnlineStatus(): boolean {
  return useSyncExternalStore(subscribe, isOnline, getServerSnapshot);
}
