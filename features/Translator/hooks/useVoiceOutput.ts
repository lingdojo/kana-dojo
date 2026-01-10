'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import type { Language } from '../types';

interface UseVoiceOutputOptions {
  language: Language;
  onEnd?: () => void;
  onError?: (error: string) => void;
}

interface UseVoiceOutputReturn {
  isSpeaking: boolean;
  isSupported: boolean;
  error: string | null;
  speak: (text: string) => void;
  stop: () => void;
  pause: () => void;
  resume: () => void;
  isPaused: boolean;
}

/**
 * Hook for text-to-speech using Web Speech API
 */
export function useVoiceOutput({
  language,
  onEnd,
  onError
}: UseVoiceOutputOptions): UseVoiceOutputReturn {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Check if Web Speech API is supported
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsSupported('speechSynthesis' in window);
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const speak = useCallback(
    (text: string) => {
      if (!isSupported) {
        const msg = 'Text-to-speech is not supported in your browser.';
        setError(msg);
        if (onError) onError(msg);
        return;
      }

      if (!text || text.trim().length === 0) {
        return;
      }

      // Stop any ongoing speech
      if (window.speechSynthesis.speaking) {
        window.speechSynthesis.cancel();
      }

      const utterance = new SpeechSynthesisUtterance(text);

      // Set language
      utterance.lang = language === 'ja' ? 'ja-JP' : 'en-US';

      // Set voice properties
      utterance.rate = 0.9; // Slightly slower for better comprehension
      utterance.pitch = 1.0;
      utterance.volume = 1.0;

      // Try to find the best voice for the language
      const voices = window.speechSynthesis.getVoices();
      const preferredVoice = voices.find(
        voice =>
          voice.lang.startsWith(language === 'ja' ? 'ja' : 'en') &&
          voice.localService
      );

      if (preferredVoice) {
        utterance.voice = preferredVoice;
      }

      utterance.onstart = () => {
        setIsSpeaking(true);
        setIsPaused(false);
        setError(null);
      };

      utterance.onend = () => {
        setIsSpeaking(false);
        setIsPaused(false);
        if (onEnd) onEnd();
      };

      utterance.onerror = (event: SpeechSynthesisErrorEvent) => {
        let errorMessage = 'Text-to-speech error';

        switch (event.error) {
          case 'canceled':
            errorMessage = 'Speech was canceled.';
            break;
          case 'interrupted':
            errorMessage = 'Speech was interrupted.';
            break;
          case 'not-allowed':
            errorMessage = 'Speech permission denied.';
            break;
          case 'network':
            errorMessage = 'Network error during speech.';
            break;
          default:
            errorMessage = `Speech error: ${event.error}`;
        }

        setError(errorMessage);
        setIsSpeaking(false);
        setIsPaused(false);
        if (onError) onError(errorMessage);
      };

      utterance.onpause = () => {
        setIsPaused(true);
      };

      utterance.onresume = () => {
        setIsPaused(false);
      };

      utteranceRef.current = utterance;
      window.speechSynthesis.speak(utterance);
    },
    [isSupported, language, onEnd, onError]
  );

  const stop = useCallback(() => {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      setIsPaused(false);
    }
  }, []);

  const pause = useCallback(() => {
    if (window.speechSynthesis && isSpeaking && !isPaused) {
      window.speechSynthesis.pause();
      setIsPaused(true);
    }
  }, [isSpeaking, isPaused]);

  const resume = useCallback(() => {
    if (window.speechSynthesis && isSpeaking && isPaused) {
      window.speechSynthesis.resume();
      setIsPaused(false);
    }
  }, [isSpeaking, isPaused]);

  return {
    isSpeaking,
    isSupported,
    error,
    speak,
    stop,
    pause,
    resume,
    isPaused
  };
}
