'use client';
import { usePathname } from 'next/navigation';
import { useEffect } from 'react';
import { useChristmas } from '@/shared/hooks/generic/useAudio';
import { useThemePreferences } from '@/features/Preferences';

export default function GlobalAudioController() {
  const pathname = usePathname();
  const { theme: selectedTheme } = useThemePreferences();
  const { playChristmas, pauseChristmas, isPlaying, scheduleRelease } =
    useChristmas();

  useEffect(() => {
    if (pathname.includes('/train')) {
      pauseChristmas();
      scheduleRelease();
      return;
    }

    if (selectedTheme === 'mariah-carey') {
      if (!isPlaying()) playChristmas();
    } else {
      pauseChristmas();
      scheduleRelease();
    }
  }, [
    pathname,
    selectedTheme,
    playChristmas,
    pauseChristmas,
    isPlaying,
    scheduleRelease,
  ]);

  return null;
}
