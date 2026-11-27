'use client';
import { useCallback, useState, useEffect, useRef } from 'react';
import { useAudioPreferences } from '@/features/Preferences';

interface JapaneseVoice {
  name: string;
  lang: string;
  voice: SpeechSynthesisVoice;
}

interface TTSState {
  isPlaying: boolean;
  isSupported: boolean;
  voicesLoaded: boolean;
  availableVoices: JapaneseVoice[];
  currentVoice: JapaneseVoice | null;
  hasJapaneseVoices: boolean;
}

export const useJapaneseTTS = () => {
  const {
    pronunciationEnabled,
    pronunciationVoiceName,
    setPronunciationVoiceName,
  } = useAudioPreferences();
  const [state, setState] = useState<TTSState>({
    isPlaying: false,
    isSupported: false,
    voicesLoaded: false,
    availableVoices: [],
    currentVoice: null,
    hasJapaneseVoices: false,
  });

  // Use ref to store current voice for access in callbacks without stale closures
  const currentVoiceRef = useRef<JapaneseVoice | null>(null);
  const speakRequestIdRef = useRef(0);

  // Update ref whenever currentVoice changes
  useEffect(() => {
    currentVoiceRef.current = state.currentVoice;
  }, [state.currentVoice]);

  // SSR-safe check for browser environment
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
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

        // Only accept voices with a Japanese language code.
        const japaneseVoices = voices
          .filter(voice => voice.lang.toLowerCase().startsWith('ja'))
          .map(voice => ({
            name: voice.name,
            lang: voice.lang,
            voice: voice,
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
          voicesLoaded: true,
          availableVoices: japaneseVoices,
          currentVoice: newCurrentVoice,
          hasJapaneseVoices,
        }));

        // Update ref immediately to avoid race conditions
        currentVoiceRef.current = newCurrentVoice;

        // Leave voice unset so the browser can decide how to handle ja-JP speech.
        if (voices.length > 0 && japaneseVoices.length === 0) {
          console.warn(
            'No Japanese voices found. Submitting Japanese speech without an explicit voice.',
          );
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
      },
    ) => {
      if (!isClient || !pronunciationEnabled) {
        return Promise.resolve();
      }

      // TTS is always supported in modern browsers

      return new Promise<void>(resolve => {
        const requestId = ++speakRequestIdRef.current;

        const stopCurrentSpeech = () => {
          if (speechSynthesis.speaking || speechSynthesis.pending) {
            speechSynthesis.cancel();
          }
        };

        // Firefox needs voices to be loaded before creating utterance
        const attemptSpeak = (retries = 0) => {
          try {
            if (requestId !== speakRequestIdRef.current) {
              resolve();
              return;
            }

            // Get current voices (Firefox requires this to be fresh)
            const voices = speechSynthesis.getVoices();

            // Firefox: voices might not be loaded yet, wait for them
            if (voices.length === 0 && retries < 10) {
              // Wait for voices to load (Firefox can take time)
              setTimeout(
                () => attemptSpeak(retries + 1),
                isFirefox.current ? 200 : 100,
              );
              return;
            }

            if (voices.length > 0) {
              const hasJapaneseVoices = voices.some(voice =>
                voice.lang.toLowerCase().startsWith('ja'),
              );
              setState((prev: TTSState) => ({
                ...prev,
                voicesLoaded: true,
                hasJapaneseVoices,
              }));
            }

            if (voices.length === 0) {
              console.warn(
                'No voices available after retries; submitting speech without an explicit voice',
              );
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
            const japaneseVoices = voices.filter(voice =>
              voice.lang.toLowerCase().startsWith('ja'),
            );

            if (selectedVoice) {
              // Try to match selected voice from current voices list (Firefox requirement)
              const matchedVoice = voices.find(
                v =>
                  v.name === selectedVoice.name &&
                  v.lang === selectedVoice.lang,
              );

              // Check if matched voice is Japanese
              const isMatchedVoiceJapanese =
                matchedVoice?.lang.toLowerCase().startsWith('ja') ?? false;

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
              }
            }

            // Event handlers
            utterance.onstart = () => {
              if (requestId !== speakRequestIdRef.current) return;
              setState((prev: TTSState) => ({ ...prev, isPlaying: true }));
            };

            utterance.onend = () => {
              if (requestId !== speakRequestIdRef.current) return;
              setState((prev: TTSState) => ({ ...prev, isPlaying: false }));
              resolve();
            };

            utterance.onerror = event => {
              if (requestId !== speakRequestIdRef.current) {
                resolve();
                return;
              }

              if (event.error !== 'interrupted') {
                console.warn('TTS Error:', event.error);
              }
              setState((prev: TTSState) => ({ ...prev, isPlaying: false }));
              resolve();
            };

            stopCurrentSpeech();
            speechSynthesis.speak(utterance);
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
    [isClient, pronunciationEnabled],
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
    [setPronunciationVoiceName],
  );

  // Method to refresh voices
  const refreshVoices = useCallback(() => {
    if (!isClient) return;

    const voices = speechSynthesis.getVoices();

    // Firefox sometimes returns empty array, skip if so
    if (voices.length === 0) return;

    // Use the same language-code filter as loadVoices.
    const japaneseVoices = voices
      .filter(voice => voice.lang.toLowerCase().startsWith('ja'))
      .map(voice => ({
        name: voice.name,
        lang: voice.lang,
        voice: voice,
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
      voicesLoaded: true,
      availableVoices: japaneseVoices,
      currentVoice: newCurrentVoice,
      hasJapaneseVoices,
    }));

    // Update ref immediately to avoid race conditions
    currentVoiceRef.current = newCurrentVoice;

    // Leave voice unset so the browser can decide how to handle ja-JP speech.
    if (voices.length > 0 && japaneseVoices.length === 0) {
      console.warn(
        'No Japanese voices found. Submitting Japanese speech without an explicit voice.',
      );
    }
  }, [isClient, pronunciationVoiceName]);

  return {
    speak,
    stop,
    setVoice,
    refreshVoices,
    isPlaying: state.isPlaying,
    isSupported: state.isSupported,
    voicesLoaded: state.voicesLoaded,
    availableVoices: state.availableVoices,
    currentVoice: state.currentVoice,
    hasJapaneseVoices: state.hasJapaneseVoices,
  };
};
