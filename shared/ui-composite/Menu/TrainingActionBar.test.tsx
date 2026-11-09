import '@/shared/test-utils/storagePolyfill';
import React from 'react';
import { fireEvent, render } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import TrainingActionBar from '@/shared/ui-composite/Menu/TrainingActionBar';
import useVocabStore from '@/features/Vocabulary/store/useVocabStore';
import type { IVocabObj } from '@/entities/vocabulary';

const pushMock = vi.hoisted(() => vi.fn());

vi.mock('@/core/i18n/routing', () => ({
  Link: ({
    children,
    prefetch: _prefetch,
    ...props
  }: React.AnchorHTMLAttributes<HTMLAnchorElement> & {
    prefetch?: boolean;
  }) => <a {...props}>{children}</a>,
  usePathname: () => '/vocabulary',
  useRouter: () => ({ push: pushMock }),
}));

vi.mock('@/features/Preferences', () => ({
  useInputPreferences: () => ({ hotkeysOn: false }),
}));

vi.mock('@/features/Preferences/store/usePreferencesStore', () => ({
  default: (selector: (state: { showExperimentalModes: boolean }) => boolean) =>
    selector({ showExperimentalModes: false }),
}));

vi.mock('@/features/Progress', () => ({
  useAutoLearningStore: (
    selector: (state: { activeSelections: Record<string, boolean> }) => boolean,
  ) =>
    selector({
      activeSelections: { kana: false, kanji: false, vocabulary: false },
    }),
}));

vi.mock('@/shared/hooks/generic/useAudio', () => ({
  useClick: () => ({ playClick: vi.fn() }),
}));

vi.mock('@/shared/hooks/generic/useScrollVisibility', () => ({
  useScrollVisibility: () => true,
}));

vi.mock('framer-motion', () => ({
  motion: {
    div: ({
      children,
      initial: _initial,
      animate: _animate,
      transition: _transition,
      ...props
    }: React.HTMLAttributes<HTMLDivElement> & Record<string, unknown>) => (
      <div {...props}>{children}</div>
    ),
  },
}));

const vocab = (word: string, meanings: string[]): IVocabObj =>
  ({ word, reading: word, meanings }) as IVocabObj;

beforeEach(() => {
  globalThis.sessionStorage.clear();
  globalThis.localStorage.clear();
  pushMock.mockClear();
  Object.defineProperty(window, 'matchMedia', {
    configurable: true,
    value: () => ({
      matches: false,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }),
  });
  useVocabStore
    .getState()
    .setSelectedVocabObjs([
      vocab('たべる', ['to eat']),
      vocab('のむ', ['to drink']),
      vocab('みる', ['to see']),
    ]);
  useVocabStore.getState().setSelectedVocabSets(['Set 68', 'Set 69']);
});

afterEach(() => {
  useVocabStore.getState().clearVocabObjs();
  useVocabStore.getState().clearVocabSets();
  vi.restoreAllMocks();
});

describe('TrainingActionBar classic Go', () => {
  it('trains the manually selected sets instead of auto-learning', () => {
    const { container } = render(
      <TrainingActionBar currentDojo='vocabulary' />,
    );

    const buttons = container.querySelectorAll(
      '#main-training-action-bar button',
    );
    expect(buttons.length).toBe(2);
    const goButton = buttons[1] as HTMLButtonElement;
    expect(goButton.disabled).toBe(false);

    fireEvent.click(goButton);

    // Manual selection drives classic training.
    expect(pushMock).toHaveBeenCalledWith('/vocabulary/train');
    // No auto-learning handoff may be written: it would replace the
    // manually selected words with progress-based sets (see #30400).
    expect(sessionStorage.getItem('kanadojo-auto-learning-handoff')).toBeNull();
    expect(
      useVocabStore.getState().selectedVocabObjs.map(entry => entry.word),
    ).toEqual(['たべる', 'のむ', 'みる']);
  });
});
