'use client';

import { useMemo } from 'react';
import usePreferencesStore from '../store/usePreferencesStore';
import type { ClickSoundId } from '@/features/Preferences/data/audio/clickSounds';

export interface AudioPreferences {
  silentMode: boolean;
  setSilentMode: (silent: boolean) => void;
  pronunciationEnabled: boolean;
  setPronunciationEnabled: (enabled: boolean) => void;
  pronunciationSpeed: number;
  setPronunciationSpeed: (speed: number) => void;
  pronunciationPitch: number;
  setPronunciationPitch: (pitch: number) => void;
  pronunciationVoiceName: string | null;
  setPronunciationVoiceName: (name: string | null) => void;
  pronunciationAutoPlay: boolean;
  setPronunciationAutoPlay: (enabled: boolean) => void;
  clickSoundId: ClickSoundId;
  setClickSoundId: (id: ClickSoundId) => void;
}

/**
 * Audio Preferences Facade
 *
 * Provides access to audio-related preferences
 */
export function useAudioPreferences(): AudioPreferences {
  const silentMode = usePreferencesStore(state => state.silentMode);
  const setSilentMode = usePreferencesStore(state => state.setSilentMode);
  const pronunciationEnabled = usePreferencesStore(
    state => state.pronunciationEnabled,
  );
  const setPronunciationEnabled = usePreferencesStore(
    state => state.setPronunciationEnabled,
  );
  const pronunciationSpeed = usePreferencesStore(
    state => state.pronunciationSpeed,
  );
  const setPronunciationSpeed = usePreferencesStore(
    state => state.setPronunciationSpeed,
  );
  const pronunciationPitch = usePreferencesStore(
    state => state.pronunciationPitch,
  );
  const setPronunciationPitch = usePreferencesStore(
    state => state.setPronunciationPitch,
  );
  const pronunciationVoiceName = usePreferencesStore(
    state => state.pronunciationVoiceName,
  );
  const setPronunciationVoiceName = usePreferencesStore(
    state => state.setPronunciationVoiceName,
  );
  const pronunciationAutoPlay = usePreferencesStore(
    state => state.pronunciationAutoPlay,
  );
  const setPronunciationAutoPlay = usePreferencesStore(
    state => state.setPronunciationAutoPlay,
  );
  const clickSoundId = usePreferencesStore(state => state.clickSoundId);
  const setClickSoundId = usePreferencesStore(state => state.setClickSoundId);

  return useMemo<AudioPreferences>(
    () => ({
      silentMode,
      setSilentMode,
      pronunciationEnabled,
      setPronunciationEnabled,
      pronunciationSpeed,
      setPronunciationSpeed,
      pronunciationPitch,
      setPronunciationPitch,
      pronunciationVoiceName,
      setPronunciationVoiceName,
      pronunciationAutoPlay,
      setPronunciationAutoPlay,
      clickSoundId,
      setClickSoundId,
    }),
    [
      silentMode,
      setSilentMode,
      pronunciationEnabled,
      setPronunciationEnabled,
      pronunciationSpeed,
      setPronunciationSpeed,
      pronunciationPitch,
      setPronunciationPitch,
      pronunciationVoiceName,
      setPronunciationVoiceName,
      pronunciationAutoPlay,
      setPronunciationAutoPlay,
      clickSoundId,
      setClickSoundId,
    ],
  );
}
