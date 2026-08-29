'use client';

import { useCallback } from 'react';
import { useAudioPreferences } from '@/features/Preferences';
import { useJapaneseTTS } from '@/features/Preferences/hooks/useJapaneseTTS';

export const useKanaPronunciation = () => {
  const { pronunciationEnabled, pronunciationSpeed, pronunciationPitch } =
    useAudioPreferences();
  const { speak } = useJapaneseTTS();

  return useCallback(
    (text: string) => {
      const normalizedText = text.trim();
      if (!pronunciationEnabled || !normalizedText)
        return Promise.resolve(false);

      return speak(normalizedText, {
        rate: pronunciationSpeed,
        pitch: pronunciationPitch,
        volume: 1.0,
      }).then(() => true);
    },
    [pronunciationEnabled, pronunciationPitch, pronunciationSpeed, speak],
  );
};
