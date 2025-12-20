'use client';
import { usePathname } from 'next/navigation';
import { useEffect } from 'react';
import { useChristmas } from '@/shared/hooks/useAudio';
import usePreferencesStore from '@/features/Preferences/store/usePreferencesStore';

export default function GlobalAudioController() {
  const pathname = usePathname();
  const selectedTheme = usePreferencesStore(state => state.theme);
  const { playChristmas, pauseChristmas, isPlaying, resetTimer } =
    useChristmas();

  useEffect(() => {
    if (pathname.includes('/train')) {
      pauseChristmas();
      return;
    }

    if (selectedTheme === 'mariah-carey') {
      if (!isPlaying()) playChristmas();
    } else {
      pauseChristmas();
    }

    // Start a 2-minute timer when the user leaves the theme (mariah-carey).
    // If the user does not return within 2 minutes, reset savedTime so the song starts from the beginning next time
    const timeout = setTimeout(
      () => {
        resetTimer();
      },
      2 * 60 * 1000
    );

    return () => clearTimeout(timeout);
  }, [
    pathname,
    selectedTheme,
    playChristmas,
    pauseChristmas,
    isPlaying,
    resetTimer
  ]);

  return null;
}
