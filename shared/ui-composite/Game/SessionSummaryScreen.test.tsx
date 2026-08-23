import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import SessionSummaryScreen from '@/shared/ui-composite/Game/SessionSummaryScreen';

const playClick = vi.fn();

vi.mock('@/shared/hooks/generic/useAudio', () => ({
  useClick: () => ({ playClick }),
}));

vi.mock('@/shared/utils/gauntletStats', () => ({
  getBestTime: vi.fn().mockResolvedValue(null),
  formatTime: (ms: number) => `${ms}ms`,
}));

const renderSummary = (onBackToSelection = vi.fn(), onNewSession = vi.fn()) => {
  render(
    <SessionSummaryScreen
      mode='classic'
      correct={5}
      wrong={1}
      onBackToSelection={onBackToSelection}
      onNewSession={onNewSession}
    />,
  );
  return { onBackToSelection, onNewSession };
};

describe('SessionSummaryScreen keyboard handling', () => {
  beforeEach(() => {
    playClick.mockClear();
  });

  const pressKey = (key: string, repeat = false) => {
    fireEvent.keyDown(window, { key, repeat });
  };

  it('returns to selection on a discrete Escape press', () => {
    const { onBackToSelection } = renderSummary();
    pressKey('Escape');
    expect(onBackToSelection).toHaveBeenCalledTimes(1);
  });

  it('starts a new session on a discrete Enter press', () => {
    const { onNewSession } = renderSummary();
    pressKey('Enter');
    expect(onNewSession).toHaveBeenCalledTimes(1);
  });

  it.each(['Escape', 'Enter'])('ignores auto-repeat while holding %s', key => {
    const { onBackToSelection, onNewSession } = renderSummary();

    for (let i = 0; i < 10; i++) {
      pressKey(key, true);
    }

    expect(onBackToSelection).not.toHaveBeenCalled();
    expect(onNewSession).not.toHaveBeenCalled();
    // summary is still mounted (getBy throws if the screen went away)
    screen.getByText(/session summary/i);
  });
});
