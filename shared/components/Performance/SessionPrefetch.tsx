'use client';

import { useEffect } from 'react';

const PREFETCH_KEY = 'kanadojo_prefetch_v1';

const PREFETCH_URLS = [
  '/data-kanji/decorations.json',
  '/data-kanji/N5.json',
  '/data-vocab/n5.json',
  '/api/facts',
];

export default function SessionPrefetch() {
  useEffect(() => {
    if (typeof window === 'undefined') return;

    try {
      if (sessionStorage.getItem(PREFETCH_KEY)) return;
      sessionStorage.setItem(PREFETCH_KEY, '1');

      PREFETCH_URLS.forEach(url => {
        fetch(url).catch(() => {
          // Best-effort prefetch. Ignore failures.
        });
      });
    } catch {
      // sessionStorage may be unavailable (privacy modes). Ignore and skip.
    }
  }, []);

  return null;
}
