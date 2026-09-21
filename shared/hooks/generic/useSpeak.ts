'use client';

import { useCallback, useEffect } from 'react';

interface UseSpeakOptions {
  lang?: string;
  rate?: number;
  pitch?: number;
}

export function useSpeak(options: UseSpeakOptions = {}) {
  const { lang = 'ja-JP', rate = 0.9, pitch = 1 } = options;

  useEffect(() => {
    return () => {
      window.speechSynthesis.cancel();
    };
  }, []);

  const speak = useCallback(
    (text: string) => {
      if (!window.speechSynthesis) return;

      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = lang;
      utterance.rate = rate;
      utterance.pitch = pitch;

      const voices = window.speechSynthesis.getVoices();
      const japaneseVoice = voices.find(v => v.lang.startsWith('ja'));
      if (japaneseVoice) utterance.voice = japaneseVoice;

      window.speechSynthesis.speak(utterance);
    },
    [lang, rate, pitch],
  );

  return { speak };
}
