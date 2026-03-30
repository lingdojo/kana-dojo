'use client';
import { useCallback, useEffect } from 'react';
import { Random } from 'random-js';
import { useAudioPreferences } from '@/features/Preferences';
import {
  DEFAULT_CLICK_SOUND_ID,
  getClickSoundVariantBaseUrls,
} from '@/features/Preferences/data/audio/clickSounds';
import type { ClickSoundId } from '@/features/Preferences/data/audio/clickSounds';

const random = new Random();

// =============================================================================
// Web Audio API Core System
// =============================================================================

let audioContext: AudioContext | null = null;
const bufferCache = new Map<string, AudioBuffer>();
const inFlightLoads = new Map<string, Promise<AudioBuffer | null>>();
const MAX_CACHE_SIZE = 300;
const CLICK_SOUND_PRELOAD_LIMIT = 3;

/**
 * Get or create the shared AudioContext
 * AudioContext must be created after user interaction due to browser policies
 */
const getAudioContext = (): AudioContext => {
  if (!audioContext || audioContext.state === 'closed') {
    audioContext = new AudioContext();
  }
  // Resume if suspended (browsers suspend AudioContext until user interaction)
  if (audioContext.state === 'suspended') {
    audioContext.resume();
  }
  return audioContext;
};

/**
 * Load and decode an audio file into an AudioBuffer (cached)
 * Uses FIFO eviction when cache exceeds MAX_CACHE_SIZE
 */
const loadAudioBuffer = async (url: string): Promise<AudioBuffer | null> => {
  // Check cache first
  const cached = bufferCache.get(url);
  if (cached) return cached;
  const pending = inFlightLoads.get(url);
  if (pending) return pending;

  const loadPromise = (async () => {
    try {
      const ctx = getAudioContext();
      const response = await fetch(url, { cache: 'force-cache' });
      if (!response.ok) throw new Error(`Failed to fetch ${url}`);

      const arrayBuffer = await response.arrayBuffer();
      const audioBuffer = await ctx.decodeAudioData(arrayBuffer);

      // FIFO eviction: delete oldest entry if cache is full
      if (bufferCache.size >= MAX_CACHE_SIZE) {
        const firstKey = bufferCache.keys().next().value;
        if (firstKey) {
          bufferCache.delete(firstKey);
        }
      }

      bufferCache.set(url, audioBuffer);
      return audioBuffer;
    } catch (error) {
      console.warn(`Failed to load audio: ${url}`, error);
      return null;
    } finally {
      inFlightLoads.delete(url);
    }
  })();

  inFlightLoads.set(url, loadPromise);
  return loadPromise;
};

/**
 * Play a sound using Web Audio API
 * Creates a new buffer source each time (required by Web Audio API)
 */
const playBuffer = (buffer: AudioBuffer, volume: number = 1): void => {
  const ctx = getAudioContext();

  const source = ctx.createBufferSource();
  const gainNode = ctx.createGain();

  source.buffer = buffer;
  gainNode.gain.value = volume;

  source.connect(gainNode);
  gainNode.connect(ctx.destination);

  source.start(0);
};

// =============================================================================
// Audio Pool for Overlapping Sounds (Issue #4)
// =============================================================================

/**
 * Creates a pool of audio sources for sounds that may overlap
 * Web Audio API handles this naturally, but we preload buffers for instant playback
 */
const createAudioPool = (url: string, volume: number = 1) => {
  let buffer: AudioBuffer | null = null;
  let loading = false;

  const ensureLoaded = async () => {
    if (buffer || loading) return buffer;
    loading = true;
    buffer = await loadAudioBuffer(url);
    loading = false;
    return buffer;
  };

  const play = () => {
    if (buffer) {
      playBuffer(buffer, volume);
    } else {
      // Load and play asynchronously if not loaded yet
      ensureLoaded().then(b => {
        if (b) playBuffer(b, volume);
      });
    }
  };

  return { play, ensureLoaded };
};

// =============================================================================
// Opus Format Detection (Issue #9)
// =============================================================================

let opusSupported: boolean | null = null;

/**
 * Check if the browser supports Opus audio format
 */
const canPlayOpus = (): boolean => {
  if (opusSupported !== null) return opusSupported;

  if (typeof Audio === 'undefined') {
    opusSupported = false;
    return false;
  }

  const audio = new Audio();
  // Check both Ogg Opus and WebM Opus containers
  opusSupported = !!(
    audio.canPlayType('audio/ogg; codecs="opus"') ||
    audio.canPlayType('audio/webm; codecs="opus"')
  );

  return opusSupported;
};

/**
 * Get the best audio URL based on format support
 * Prefers Opus, falls back to WAV
 */
const getAudioUrl = (basePath: string, hasOpus: boolean = true): string => {
  if (hasOpus && canPlayOpus()) {
    return `${basePath}.opus`;
  }
  // Fallback to WAV (will be converted to Opus, but keep WAV as ultimate fallback)
  return `${basePath}.wav`;
};

// =============================================================================
// Sound File URLs
// =============================================================================

const CORRECT_SOUND_BASE = '/sounds/correct';
const ERROR_SOUND_BASE = '/sounds/error/error1/error1_1';
const LONG_SOUND_BASE = '/sounds/long';
const LONG_LOOP_VOLUME = 0.12;

// =============================================================================
// Preloaded Audio Pools
// =============================================================================

// Lazy-initialized pools for critical sounds
let correctPool: ReturnType<typeof createAudioPool> | null = null;
let errorPool: ReturnType<typeof createAudioPool> | null = null;
let longPool: ReturnType<typeof createAudioPool> | null = null;
let longLoopAudio: HTMLAudioElement | null = null;
const clickPools = new Map<string, ReturnType<typeof createAudioPool>>();

const getCorrectPool = () => {
  if (!correctPool) {
    const url = getAudioUrl(CORRECT_SOUND_BASE);
    correctPool = createAudioPool(url, 0.7);
  }
  return correctPool;
};

const getErrorPool = () => {
  if (!errorPool) {
    const url = getAudioUrl(ERROR_SOUND_BASE);
    errorPool = createAudioPool(url, 1);
  }
  return errorPool;
};

const getLongPool = () => {
  if (!longPool) {
    const url = getAudioUrl(LONG_SOUND_BASE);
    longPool = createAudioPool(url, 0.2);
  }
  return longPool;
};

const getLongLoopAudio = () => {
  if (typeof window === 'undefined') return null;
  if (!longLoopAudio) {
    longLoopAudio = new Audio(getAudioUrl(LONG_SOUND_BASE));
    longLoopAudio.loop = true;
    longLoopAudio.volume = LONG_LOOP_VOLUME;
    longLoopAudio.onerror = () => {
      console.warn('Failed to load long theme audio');
    };
  }

  return longLoopAudio;
};

const getClickPool = (baseUrl: string) => {
  let pool = clickPools.get(baseUrl);
  if (!pool) {
    const url = getAudioUrl(baseUrl);
    pool = createAudioPool(url, 1);
    clickPools.set(baseUrl, pool);
  }
  return pool;
};

// =============================================================================
// Preload Function for Critical Sounds (Issue #5 - bonus)
// =============================================================================

/**
 * Preload critical game sounds for instant playback
 * Call this when entering a game mode
 */
export const preloadGameSounds = async (): Promise<void> => {
  await Promise.all([
    getCorrectPool().ensureLoaded(),
    getErrorPool().ensureLoaded(),
    preloadClickSoundPack(DEFAULT_CLICK_SOUND_ID),
  ]);
};

export const preloadClickSoundPack = async (
  soundId: ClickSoundId,
): Promise<void> => {
  const variantBaseUrls = getClickSoundVariantBaseUrls(soundId);
  const prioritized = variantBaseUrls.slice(0, CLICK_SOUND_PRELOAD_LIMIT);
  await Promise.all(
    prioritized.map(baseUrl => getClickPool(baseUrl).ensureLoaded()),
  );
};

// =============================================================================
// Audio Hooks
// =============================================================================

export const useClick = () => {
  const { silentMode, clickSoundId } = useAudioPreferences();

  useEffect(() => {
    void preloadClickSoundPack(clickSoundId);
  }, [clickSoundId]);

  const playClickById = useCallback(
    (soundId: ClickSoundId) => {
      if (silentMode) return;
      const variantBaseUrls = getClickSoundVariantBaseUrls(soundId);
      if (variantBaseUrls.length === 0) return;
      const baseUrl =
        variantBaseUrls[random.integer(0, variantBaseUrls.length - 1)];
      const pool = getClickPool(baseUrl);
      pool.play();
    },
    [silentMode],
  );

  const playClick = useCallback(() => {
    playClickById(clickSoundId);
  }, [clickSoundId, playClickById]);

  return { playClick, playClickById };
};

export const useCorrect = () => {
  const { silentMode } = useAudioPreferences();

  const playCorrect = useCallback(() => {
    if (silentMode) return;
    getCorrectPool().play();
  }, [silentMode]);

  return { playCorrect };
};

export const useError = () => {
  const { silentMode } = useAudioPreferences();

  const playError = useCallback(() => {
    if (silentMode) return;
    getErrorPool().play();
  }, [silentMode]);

  // Issue #4: Audio pooling - Web Audio API naturally supports overlapping sounds
  const playErrorTwice = useCallback(() => {
    if (silentMode) return;

    const pool = getErrorPool();
    pool.play();
    // Second play after 90ms - Web Audio API handles overlap naturally
    setTimeout(() => pool.play(), 90);
  }, [silentMode]);

  return {
    playError,
    playErrorTwice,
  };
};

export const useLong = () => {
  const { silentMode } = useAudioPreferences();

  const playLong = useCallback(() => {
    if (silentMode) return;
    getLongPool().play();
  }, [silentMode]);

  const playLongLoop = useCallback(() => {
    if (silentMode) return;

    const audio = getLongLoopAudio();
    if (!audio) return;

    audio.volume = LONG_LOOP_VOLUME;
    audio.play().catch(() => {
      // Ignore autoplay errors
    });
  }, [silentMode]);

  const stopLongLoop = useCallback(() => {
    if (!longLoopAudio) return;
    longLoopAudio.pause();
    longLoopAudio.currentTime = 0;
  }, []);

  useEffect(() => {
    if (!silentMode) return;
    if (!longLoopAudio) return;

    longLoopAudio.pause();
    longLoopAudio.currentTime = 0;
  }, [silentMode]);

  return { playLong, playLongLoop, stopLongLoop };
};

// =============================================================================
// Christmas Audio (Special case - looping audio)
// =============================================================================

let christmasAudio: HTMLAudioElement | null = null;
let savedTime = 0;

export const useChristmas = () => {
  const initChristmas = () => {
    if (typeof window !== 'undefined' && !christmasAudio) {
      // mariah-carey.opus - Opus has excellent browser support (Chrome, Firefox, Safari 15+, Edge)
      // No WAV fallback exists for this file, but Opus is supported in all modern browsers
      christmasAudio = new Audio('/sounds/mariah-carey.opus');
      christmasAudio.loop = true;
      christmasAudio.volume = 0.2;

      // Handle load errors
      christmasAudio.onerror = () => {
        console.warn(
          'Failed to load Christmas audio - Opus may not be supported in this browser',
        );
      };
    }
  };

  const playChristmas = () => {
    initChristmas();
    if (christmasAudio) {
      christmasAudio.currentTime = savedTime;
      christmasAudio.play().catch(() => {
        // Ignore autoplay errors
      });
    }
  };

  const pauseChristmas = () => {
    if (christmasAudio) {
      savedTime = christmasAudio.currentTime;
      christmasAudio.pause();
    }
  };

  const resetTimer = () => {
    savedTime = 0;
  };

  const isPlaying = () => (christmasAudio ? !christmasAudio.paused : false);

  return { playChristmas, pauseChristmas, isPlaying, resetTimer };
};

// =============================================================================
// Standalone Play Function for External Use (e.g., useGoalTimers)
// =============================================================================

/**
 * Play a sound by URL with specified volume
 * Uses Web Audio API for better performance
 */
export const playSoundByUrl = async (
  url: string,
  volume: number = 1,
): Promise<void> => {
  const buffer = await loadAudioBuffer(url);
  if (buffer) {
    playBuffer(buffer, volume);
  }
};

/**
 * Play the correct sound (for use outside of React hooks)
 */
export const playCorrectSound = (volume: number = 0.7): void => {
  const url = getAudioUrl(CORRECT_SOUND_BASE);
  loadAudioBuffer(url).then(buffer => {
    if (buffer) playBuffer(buffer, volume);
  });
};
