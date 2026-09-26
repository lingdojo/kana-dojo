import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act, waitFor, cleanup } from '@testing-library/react';
import { useJapaneseTTS } from '@/features/Preferences/hooks/useJapaneseTTS';

vi.mock('@/features/Preferences', () => ({
  useAudioPreferences: () => ({
    pronunciationEnabled: true,
    pronunciationVoiceName: null,
    setPronunciationVoiceName: vi.fn(),
  }),
}));

/**
 * Brave with fingerprint blocking on, and some other engines, never populate
 * getVoices() but still speak a plain utterance. This stands in for that.
 */
const stubSpeechSynthesis = (voices: SpeechSynthesisVoice[]) => {
  const spoken: SpeechSynthesisUtterance[] = [];

  vi.stubGlobal(
    'SpeechSynthesisUtterance',
    class {
      text: string;
      lang = '';
      rate = 1;
      pitch = 1;
      volume = 1;
      voice: SpeechSynthesisVoice | null = null;
      onstart: (() => void) | null = null;
      onend: (() => void) | null = null;
      onerror: (() => void) | null = null;
      constructor(text: string) {
        this.text = text;
      }
    },
  );

  vi.stubGlobal('speechSynthesis', {
    speaking: false,
    pending: false,
    cancel: vi.fn(),
    getVoices: () => voices,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    speak: (utterance: SpeechSynthesisUtterance) => {
      spoken.push(utterance);
      utterance.onstart?.(new Event('start') as SpeechSynthesisEvent);
      utterance.onend?.(new Event('end') as SpeechSynthesisEvent);
    },
  });

  return spoken;
};

describe('useJapaneseTTS speak', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    // Unmount before the globals go away, or the cleanup effect that removes
    // the voiceschanged listener throws.
    cleanup();
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it('still speaks when the browser reports no voices', async () => {
    const spoken = stubSpeechSynthesis([]);
    const { result } = renderHook(() => useJapaneseTTS());

    await act(async () => {
      const speaking = result.current.speak('しゅ');
      // The hook retries getVoices ten times before giving up on the list.
      await vi.advanceTimersByTimeAsync(3000);
      await speaking;
    });

    await waitFor(() => expect(spoken).toHaveLength(1));
    expect(spoken[0].text).toBe('しゅ');
    expect(spoken[0].lang).toBe('ja-JP');
    // No voice to choose from, so the engine picks its own.
    expect(spoken[0].voice).toBeNull();
  });
  it('still prefers a Japanese voice when the browser reports one', async () => {
    const jaVoice = { name: 'Kyoko', lang: 'ja-JP' } as SpeechSynthesisVoice;
    const enVoice = { name: 'Daniel', lang: 'en-GB' } as SpeechSynthesisVoice;
    const spoken = stubSpeechSynthesis([enVoice, jaVoice]);
    const { result } = renderHook(() => useJapaneseTTS());

    await act(async () => {
      const speaking = result.current.speak('しゅ');
      await vi.advanceTimersByTimeAsync(3000);
      await speaking;
    });

    await waitFor(() => expect(spoken).toHaveLength(1));
    expect(spoken[0].voice).toBe(jaVoice);
  });
});
