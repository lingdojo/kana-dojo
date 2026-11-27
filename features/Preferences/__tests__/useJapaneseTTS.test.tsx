import {
  act,
  cleanup,
  fireEvent,
  render,
  renderHook,
  screen,
} from '@testing-library/react';
import { useState } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useJapaneseTTS } from '@/features/Preferences/hooks/useJapaneseTTS';
import JapaneseVoiceNotice from '@/shared/ui-composite/audio/JapaneseVoiceNotice';

vi.mock('@/features/Preferences', () => ({
  useAudioPreferences: () => ({
    pronunciationEnabled: true,
    pronunciationVoiceName: null,
    setPronunciationVoiceName: vi.fn(),
  }),
}));

class MockSpeechSynthesisUtterance {
  lang = '';
  rate = 1;
  pitch = 1;
  volume = 1;
  voice: SpeechSynthesisVoice | null = null;
  onstart: SpeechSynthesisUtterance['onstart'] = null;
  onend: SpeechSynthesisUtterance['onend'] = null;
  onerror: SpeechSynthesisUtterance['onerror'] = null;

  constructor(readonly text: string) {}
}

const createVoice = (name: string, lang: string): SpeechSynthesisVoice =>
  ({
    name,
    lang,
    voiceURI: name,
    default: false,
    localService: true,
  }) as SpeechSynthesisVoice;

const setupSpeechSynthesis = (voices: SpeechSynthesisVoice[]) => {
  const spokenUtterances: SpeechSynthesisUtterance[] = [];
  let voicesChangedHandler: EventListener | undefined;
  const speechSynthesisMock = {
    speaking: false,
    pending: false,
    cancel: vi.fn(),
    getVoices: vi.fn(() => voices),
    addEventListener: vi.fn((type: string, handler: EventListener) => {
      if (type === 'voiceschanged') voicesChangedHandler = handler;
    }),
    removeEventListener: vi.fn(),
    speak: vi.fn((utterance: SpeechSynthesisUtterance) => {
      spokenUtterances.push(utterance);
      utterance.onend?.call(
        utterance,
        new Event('end') as SpeechSynthesisEvent,
      );
    }),
  };

  vi.stubGlobal('SpeechSynthesisUtterance', MockSpeechSynthesisUtterance);
  vi.stubGlobal('speechSynthesis', speechSynthesisMock);

  return {
    spokenUtterances,
    speechSynthesisMock,
    emitVoicesChanged: () => voicesChangedHandler?.(new Event('voiceschanged')),
  };
};

const VoiceNoticeHarness = () => {
  const { refreshVoices, voicesLoaded, hasJapaneseVoices } = useJapaneseTTS();
  const [requested, setRequested] = useState(false);

  return (
    <>
      <button
        type='button'
        onClick={() => {
          setRequested(true);
          refreshVoices();
        }}
      >
        Play pronunciation
      </button>
      <JapaneseVoiceNotice
        requested={requested}
        voicesLoaded={voicesLoaded}
        hasJapaneseVoices={hasJapaneseVoices}
        onDismiss={() => setRequested(false)}
      />
    </>
  );
};

describe('useJapaneseTTS', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    cleanup();
    vi.useRealTimers();
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('submits Japanese speech without assigning an English voice', async () => {
    const englishVoice = createVoice('English', 'en-US');
    const { spokenUtterances, speechSynthesisMock } = setupSpeechSynthesis([
      englishVoice,
    ]);
    const { result } = renderHook(() => useJapaneseTTS());

    act(() => result.current.refreshVoices());
    expect(result.current.voicesLoaded).toBe(true);
    expect(result.current.hasJapaneseVoices).toBe(false);

    let speech: Promise<void>;
    act(() => {
      speech = result.current.speak('あ');
    });
    expect(speechSynthesisMock.speak).toHaveBeenCalledOnce();
    await act(async () => {
      await vi.runAllTimersAsync();
    });
    await speech!;

    expect(speechSynthesisMock.speak).toHaveBeenCalledOnce();
    expect(spokenUtterances[0].lang).toBe('ja-JP');
    expect(spokenUtterances[0].voice).toBeNull();
  });

  it('keeps assigning a Japanese voice when one is available', async () => {
    const japaneseVoice = createVoice('Japanese', 'ja-JP');
    const { spokenUtterances, speechSynthesisMock } = setupSpeechSynthesis([
      createVoice('English', 'en-US'),
      japaneseVoice,
    ]);
    const { result } = renderHook(() => useJapaneseTTS());
    expect(result.current.voicesLoaded).toBe(true);
    expect(result.current.hasJapaneseVoices).toBe(true);

    let speech: Promise<void>;
    act(() => {
      speech = result.current.speak('あ');
    });
    await act(async () => {
      await vi.runAllTimersAsync();
    });
    await speech!;

    expect(speechSynthesisMock.speak).toHaveBeenCalledOnce();
    expect(spokenUtterances[0].voice).toBe(japaneseVoice);
  });

  it('submits Japanese speech without a voice if none appear after retries', async () => {
    const { spokenUtterances, speechSynthesisMock } = setupSpeechSynthesis([]);
    const { result } = renderHook(() => useJapaneseTTS());

    let speech: Promise<void>;
    act(() => {
      speech = result.current.speak('あ');
    });
    await act(async () => {
      await vi.runAllTimersAsync();
    });
    await speech!;

    expect(speechSynthesisMock.speak).toHaveBeenCalledOnce();
    expect(spokenUtterances[0].lang).toBe('ja-JP');
    expect(spokenUtterances[0].voice).toBeNull();
  });

  it('shows the notice after a click when only English voices are available', () => {
    setupSpeechSynthesis([createVoice('English', 'en-US')]);
    render(<VoiceNoticeHarness />);

    expect(screen.queryByRole('status')).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: 'Play pronunciation' }));

    expect(screen.getByRole('status').textContent).toContain(
      'No Japanese voice is available in this browser.',
    );
  });

  it('does not show the notice when a Japanese voice is available', () => {
    setupSpeechSynthesis([createVoice('Japanese', 'ja-JP')]);
    render(<VoiceNoticeHarness />);

    fireEvent.click(screen.getByRole('button', { name: 'Play pronunciation' }));

    expect(screen.queryByRole('status')).toBeNull();
  });

  it('does not show the notice until voices have loaded', () => {
    const voices: SpeechSynthesisVoice[] = [];
    const { emitVoicesChanged } = setupSpeechSynthesis(voices);
    render(<VoiceNoticeHarness />);

    fireEvent.click(screen.getByRole('button', { name: 'Play pronunciation' }));

    expect(screen.queryByRole('status')).toBeNull();

    act(() => {
      voices.push(createVoice('English', 'en-US'));
      emitVoicesChanged();
    });

    expect(screen.getByRole('status')).toBeTruthy();
  });
});
