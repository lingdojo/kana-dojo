'use client';
import { useCallback, useRef, useMemo } from 'react';
import { Random } from 'random-js';
import usePreferencesStore from '@/features/Preferences/store/usePreferencesStore';

const random = new Random();

const clickSoundUrls = [
  '/sounds/click/click4/click4_11.wav',
  '/sounds/click/click4/click4_22.wav',
  '/sounds/click/click4/click4_33.wav',
  '/sounds/click/click4/click4_44.wav'
];

// Module-level cache shared across all components
const audioCache = new Map<string, HTMLAudioElement>();

// Lazy audio loader with caching
const useAudioLoader = (url: string, volume: number = 1) => {
  const silentMode = usePreferencesStore(state => state.silentMode);

  const play = useCallback(() => {
    if (silentMode) return;

    let audio = audioCache.get(url);
    if (!audio) {
      audio = new Audio(url);
      audio.volume = volume;
      audioCache.set(url, audio);
    }

    audio.currentTime = 0;
    audio.play().catch(() => {
      // Ignore autoplay errors
    });
  }, [url, volume, silentMode]);

  return play;
};

export const useClick = () => {
  const silentMode = usePreferencesStore(state => state.silentMode);

  const playClick = useCallback(() => {
    if (silentMode) return;

    const url = clickSoundUrls[random.integer(0, clickSoundUrls.length - 1)];

    let audio = audioCache.get(url);
    if (!audio) {
      audio = new Audio(url);
      audio.volume = 1;
      audioCache.set(url, audio);
    }

    audio.currentTime = 0;
    audio.play().catch(() => {
      // Ignore autoplay errors
    });
  }, [silentMode]);

  return { playClick };
};

export const useCorrect = () => {
  const play = useAudioLoader('/sounds/correct.wav', 0.7);
  return { playCorrect: play };
};

export const useError = () => {
  const play = useAudioLoader('/sounds/error/error1/error1_1.wav', 1);

  const playErrorTwice = useCallback(() => {
    play();
    setTimeout(() => play(), 90);
  }, [play]);

  return {
    playError: play,
    playErrorTwice
  };
};

export const useLong = () => {
  const play = useAudioLoader('/sounds/long.wav', 0.2);
  return { playLong: play };
};
