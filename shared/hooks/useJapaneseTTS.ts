'use client';
import { useCallback, useState, useEffect, useRef } from 'react';
import usePreferencesStore from '@/features/Preferences/store/usePreferencesStore';

interface JapaneseVoice {
  name: string;
  lang: string;
  voice: SpeechSynthesisVoice;
}

interface TTSState {
  isPlaying: boolean;
  isSupported: boolean;
  availableVoices: JapaneseVoice[];
  currentVoice: JapaneseVoice | null;
  hasJapaneseVoices: boolean;
}

export const useJapaneseTTS = () => {
  type Prefs = ReturnType<typeof usePreferencesStore.getState>;
  const silentMode = usePreferencesStore((state: Prefs) => state.silentMode);
  const pronunciationVoiceName = usePreferencesStore(
    (state: Prefs) => state.pronunciationVoiceName
  );
  const setPronunciationVoiceName = usePreferencesStore(
    (state: Prefs) => state.setPronunciationVoiceName
  );
  const [state, setState] = useState<TTSState>({
    isPlaying: false,
    isSupported: false,
    availableVoices: [],
    currentVoice: null,
    hasJapaneseVoices: false
  });

  // Use ref to store current voice for access in callbacks without stale closures
  const currentVoiceRef = useRef<JapaneseVoice | null>(null);

  // Update ref whenever currentVoice changes
  useEffect(() => {
    currentVoiceRef.current = state.currentVoice;
  }, [state.currentVoice]);

  // SSR-safe check for browser environment
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Detect Firefox for special handling
  const isFirefox = useRef(false);
  useEffect(() => {
    if (typeof window !== 'undefined') {
      isFirefox.current = /Firefox/i.test(navigator.userAgent);
    }
  }, []);

  // Check browser support and load voices
  useEffect(() => {
    if (!isClient || !('speechSynthesis' in window)) return;

    // Assume TTS is supported in modern browsers
    const isSupported = true;

    if (isSupported) {
      // Load voices when they become available
      const loadVoices = () => {
        const voices = speechSynthesis.getVoices();

        // Firefox sometimes returns empty array initially, skip if so
        if (voices.length === 0) return;

        // Strictly filter for Japanese voices only
        // Only accept voices with Japanese language code or Japanese in name
        const japaneseVoices = voices
          .filter(voice => {
            // Only accept actual Japanese voices
            return (
              voice.lang.startsWith('ja') ||
              voice.lang === 'ja-JP' ||
              voice.lang === 'ja' ||
              voice.name.toLowerCase().includes('japanese') ||
              voice.name.toLowerCase().includes('japan')
            );
          })
          .map(voice => ({
            name: voice.name,
            lang: voice.lang,
            voice: voice
          }))
          .sort((a, b) => {
            // Prioritize actual Japanese voices
            if (a.lang === 'ja-JP' && b.lang !== 'ja-JP') return -1;
            if (b.lang === 'ja-JP' && a.lang !== 'ja-JP') return 1;
            if (a.lang.startsWith('ja') && !b.lang.startsWith('ja')) return -1;
            if (b.lang.startsWith('ja') && !a.lang.startsWith('ja')) return 1;
            return a.name.localeCompare(b.name);
          });

        // Choose current voice by preference if available
        const preferred = pronunciationVoiceName
          ? japaneseVoices.find(v => v.name === pronunciationVoiceName) || null
          : null;

        const newCurrentVoice = preferred || japaneseVoices[0] || null;

        // Update state with Japanese voices
        const hasJapaneseVoices = japaneseVoices.length > 0;
        setState((prev: TTSState) => ({
          ...prev,
          isSupported: true,
          availableVoices: japaneseVoices,
          currentVoice: newCurrentVoice,
          hasJapaneseVoices
        }));

        // Update ref immediately to avoid race conditions
        currentVoiceRef.current = newCurrentVoice;

        // Fallback: If no Japanese voices found, use any available voice but log warning
        if (voices.length > 0 && japaneseVoices.length === 0) {
          console.warn(
            'No Japanese voices found. Using fallback voice. Pronunciation may not be accurate.'
          );
          const fallbackVoice =
            voices.find(v => v.lang.startsWith('ja')) || voices[0];
          const fallbackJapaneseVoice = {
            name: fallbackVoice.name,
            lang: fallbackVoice.lang,
            voice: fallbackVoice
          };
          setState((prev: TTSState) => ({
            ...prev,
            isSupported: true,
            availableVoices: [fallbackJapaneseVoice],
            currentVoice: fallbackJapaneseVoice,
            hasJapaneseVoices: false
          }));
          currentVoiceRef.current = fallbackJapaneseVoice;
        }
      };

      // Load voices immediately if available
      loadVoices();

      // Also listen for voice changes (some browsers load voices asynchronously)
      speechSynthesis.addEventListener('voiceschanged', loadVoices);

      // Firefox needs more time and multiple attempts to load voices
      if (isFirefox.current) {
        setTimeout(loadVoices, 100);
        setTimeout(loadVoices, 500);
        setTimeout(loadVoices, 1000);
        setTimeout(loadVoices, 2000);
      } else {
        // Other browsers typically load faster
        setTimeout(loadVoices, 100);
        setTimeout(loadVoices, 500);
      }

      return () => {
        speechSynthesis.removeEventListener('voiceschanged', loadVoices);
      };
    }
  }, [isClient, pronunciationVoiceName]);

  const speak = useCallback(
    (
      text: string,
      options?: {
        rate?: number;
        pitch?: number;
        volume?: number;
        voice?: JapaneseVoice;
      }
    ) => {
      if (!isClient || silentMode) {
        return Promise.resolve();
      }

      // TTS is always supported in modern browsers

      return new Promise<void>(resolve => {
        // Stop any currently playing speech
        speechSynthesis.cancel();

        // Firefox needs voices to be loaded before creating utterance
        const attemptSpeak = (retries = 0) => {
          try {
            // Get current voices (Firefox requires this to be fresh)
            const voices = speechSynthesis.getVoices();

            // Firefox: voices might not be loaded yet, wait for them
            if (voices.length === 0) {
              if (retries < 10) {
                // Wait for voices to load (Firefox can take time)
                setTimeout(
                  () => attemptSpeak(retries + 1),
                  isFirefox.current ? 200 : 100
                );
                return;
              } else {
                console.warn('No voices available after retries');
                setState((prev: TTSState) => ({ ...prev, isPlaying: false }));
                resolve();
                return;
              }
            }

            // Create utterance fresh each time (Firefox requirement)
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = 'ja-JP';

            // Validate and apply rate (0.5-1.5)
            const rate = options?.rate ?? 1.0;
            utterance.rate = Math.max(0.5, Math.min(1.5, rate));

            // Validate and apply pitch (0.5-1.5)
            const pitch = options?.pitch ?? 1.0;
            utterance.pitch = Math.max(0.5, Math.min(1.5, pitch));

            // Validate and apply volume (0-1)
            const volume = options?.volume ?? 0.8;
            utterance.volume = Math.max(0, Math.min(1, volume));

            // Set voice - Always prioritize Japanese voices
            // Firefox requires voice to be matched from current voices list
            const selectedVoice = options?.voice || currentVoiceRef.current;

            // First, try to find Japanese voices
            const japaneseVoices = voices.filter(
              v =>
                v.lang.startsWith('ja') ||
                v.lang === 'ja-JP' ||
                v.lang === 'ja' ||
                v.name.toLowerCase().includes('japanese') ||
                v.name.toLowerCase().includes('japan')
            );

            if (selectedVoice) {
              // Try to match selected voice from current voices list (Firefox requirement)
              const matchedVoice = voices.find(
                v =>
                  v.name === selectedVoice.name && v.lang === selectedVoice.lang
              );

              // Check if matched voice is Japanese
              const isMatchedVoiceJapanese =
                matchedVoice &&
                (matchedVoice.lang.startsWith('ja') ||
                  matchedVoice.lang === 'ja-JP' ||
                  matchedVoice.lang === 'ja' ||
                  matchedVoice.name.toLowerCase().includes('japanese') ||
                  matchedVoice.name.toLowerCase().includes('japan'));

              // If matched voice is Japanese, use it; otherwise prefer Japanese voices
              if (isMatchedVoiceJapanese && matchedVoice) {
                utterance.voice = matchedVoice;
              } else if (japaneseVoices.length > 0) {
                // Prefer Japanese voice even if selected voice is not Japanese
                // Sort: ja-JP first, then ja, then others
                const sortedJapanese = japaneseVoices.sort((a, b) => {
                  if (a.lang === 'ja-JP' && b.lang !== 'ja-JP') return -1;
                  if (b.lang === 'ja-JP' && a.lang !== 'ja-JP') return 1;
                  return 0;
                });
                utterance.voice = sortedJapanese[0];
              } else {
                // Fallback to matched voice or any voice
                utterance.voice = matchedVoice || voices[0];
              }
            } else {
              // No voice selected, prioritize Japanese voices
              if (japaneseVoices.length > 0) {
                // Sort: ja-JP first, then ja, then others
                const sortedJapanese = japaneseVoices.sort((a, b) => {
                  if (a.lang === 'ja-JP' && b.lang !== 'ja-JP') return -1;
                  if (b.lang === 'ja-JP' && a.lang !== 'ja-JP') return 1;
                  return 0;
                });
                utterance.voice = sortedJapanese[0];
              } else if (voices.length > 0) {
                // Fallback if no Japanese voices
                utterance.voice = voices[0];
                console.warn(
                  'No Japanese voices available, using fallback voice'
                );
              }
            }

            // Firefox requires voice to be explicitly set
            if (!utterance.voice && voices.length > 0) {
              utterance.voice = voices[0];
            }

            // Event handlers
            utterance.onstart = () => {
              setState((prev: TTSState) => ({ ...prev, isPlaying: true }));
            };

            utterance.onend = () => {
              setState((prev: TTSState) => ({ ...prev, isPlaying: false }));
              resolve();
            };

            utterance.onerror = event => {
              console.warn('TTS Error:', event.error);
              setState((prev: TTSState) => ({ ...prev, isPlaying: false }));
              resolve();
            };

            // Speak only if we have a voice set
            if (utterance.voice) {
              speechSynthesis.speak(utterance);
            } else {
              console.warn('Could not set voice for speech synthesis');
              setState((prev: TTSState) => ({ ...prev, isPlaying: false }));
              resolve();
            }
          } catch (error) {
            console.warn('Speech synthesis error:', error);
            setState((prev: TTSState) => ({ ...prev, isPlaying: false }));
            resolve();
          }
        };

        // Start attempt immediately (will retry if voices not ready)
        attemptSpeak();
      });
    },
    [isClient, state.isSupported, silentMode]
  );

  const stop = useCallback(() => {
    if (isClient && state.isSupported) {
      speechSynthesis.cancel();
      setState((prev: TTSState) => ({ ...prev, isPlaying: false }));
    }
  }, [isClient, state.isSupported]);

  const setVoice = useCallback(
    (voice: JapaneseVoice) => {
      setState((prev: TTSState) => ({ ...prev, currentVoice: voice }));
      setPronunciationVoiceName(voice?.name ?? null);
      // Update ref immediately to avoid race conditions
      currentVoiceRef.current = voice;
    },
    [setPronunciationVoiceName]
  );

  // Method to refresh voices
  const refreshVoices = useCallback(() => {
    if (!isClient) return;

    const voices = speechSynthesis.getVoices();

    // Firefox sometimes returns empty array, skip if so
    if (voices.length === 0) return;

    // Strictly filter for Japanese voices only (same logic as loadVoices)
    const japaneseVoices = voices
      .filter(voice => {
        // Only accept actual Japanese voices
        return (
          voice.lang.startsWith('ja') ||
          voice.lang === 'ja-JP' ||
          voice.lang === 'ja' ||
          voice.name.toLowerCase().includes('japanese') ||
          voice.name.toLowerCase().includes('japan')
        );
      })
      .map(voice => ({
        name: voice.name,
        lang: voice.lang,
        voice: voice
      }))
      .sort((a, b) => {
        if (a.lang === 'ja-JP' && b.lang !== 'ja-JP') return -1;
        if (b.lang === 'ja-JP' && a.lang !== 'ja-JP') return 1;
        if (a.lang.startsWith('ja') && !b.lang.startsWith('ja')) return -1;
        if (b.lang.startsWith('ja') && !a.lang.startsWith('ja')) return 1;
        return a.name.localeCompare(b.name);
      });

    const preferred = pronunciationVoiceName
      ? japaneseVoices.find(v => v.name === pronunciationVoiceName) || null
      : null;

    const newCurrentVoice = preferred || japaneseVoices[0] || null;

    // Update state with Japanese voices
    const hasJapaneseVoices = japaneseVoices.length > 0;
    setState((prev: TTSState) => ({
      ...prev,
      isSupported: true,
      availableVoices: japaneseVoices,
      currentVoice: newCurrentVoice,
      hasJapaneseVoices
    }));

    // Update ref immediately to avoid race conditions
    currentVoiceRef.current = newCurrentVoice;

    // Fallback: If no Japanese voices found, use any available voice but log warning
    if (voices.length > 0 && japaneseVoices.length === 0) {
      console.warn(
        'No Japanese voices found. Using fallback voice. Pronunciation may not be accurate.'
      );
      const fallbackVoice =
        voices.find(v => v.lang.startsWith('ja')) || voices[0];
      const fallbackJapaneseVoice = {
        name: fallbackVoice.name,
        lang: fallbackVoice.lang,
        voice: fallbackVoice
      };
      setState((prev: TTSState) => ({
        ...prev,
        isSupported: true,
        availableVoices: [fallbackJapaneseVoice],
        currentVoice: fallbackJapaneseVoice,
        hasJapaneseVoices: false
      }));
      currentVoiceRef.current = fallbackJapaneseVoice;
    }
  }, [isClient, pronunciationVoiceName]);

  return {
    speak,
    stop,
    setVoice,
    refreshVoices,
    isPlaying: state.isPlaying,
    isSupported: state.isSupported,
    availableVoices: state.availableVoices,
    currentVoice: state.currentVoice,
    hasJapaneseVoices: state.hasJapaneseVoices
  };
};
