import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import StreakMilestoneOverlay from '@/shared/ui-composite/Game/StreakMilestoneOverlay';

const playClick = vi.fn();

vi.mock('canvas-confetti', () => ({ default: vi.fn() }));

vi.mock('@/features/Preferences', () => ({
  useThemePreferences: () => ({ isGlassMode: true }),
}));

vi.mock('@/shared/hooks/generic/useAudio', () => ({
  useClick: () => ({ playClick }),
}));

vi.mock('@/shared/ui-composite/Game/GameBottomBar', () => ({
  GameBottomBar: ({
    actionLabel,
    buttonRef,
    onAction,
  }: {
    actionLabel: string;
    buttonRef: React.RefObject<HTMLButtonElement>;
    onAction: () => void;
  }) => (
    <button ref={buttonRef} onClick={onAction}>
      {actionLabel}
    </button>
  ),
}));

vi.mock('@/shared/ui-composite/layout/BottomBar', () => ({
  default: () => null,
}));

afterEach(() => {
  playClick.mockClear();
  delete window.__kanaDojoContinueShortcutSuppressedUntil;
});

describe('StreakMilestoneOverlay keyboard handling', () => {
  it('focuses Skip when the milestone opens', () => {
    render(<StreakMilestoneOverlay milestone={10} onDismiss={vi.fn()} />);

    expect(document.activeElement).toBe(
      screen.getByRole('button', { name: 'skip' }),
    );
  });

  it.each([
    ['Enter', 'Enter'],
    ['Space', ' '],
  ])('uses %s to dismiss without reaching the game', (_, key) => {
    const onDismiss = vi.fn();
    const gameKeyDown = vi.fn();
    window.addEventListener('keydown', gameKeyDown);

    render(<StreakMilestoneOverlay milestone={10} onDismiss={onDismiss} />);
    fireEvent.keyDown(document.body, {
      key,
      code: key === ' ' ? 'Space' : key,
    });

    expect(onDismiss).toHaveBeenCalledOnce();
    expect(playClick).toHaveBeenCalledOnce();
    expect(gameKeyDown).not.toHaveBeenCalled();
    expect(window.__kanaDojoContinueShortcutSuppressedUntil).toBeGreaterThan(
      performance.now(),
    );

    window.removeEventListener('keydown', gameKeyDown);
  });

  it('ignores repeated shortcut keydown events', () => {
    const onDismiss = vi.fn();
    render(<StreakMilestoneOverlay milestone={10} onDismiss={onDismiss} />);

    fireEvent.keyDown(document.body, { key: 'Enter', repeat: true });

    expect(onDismiss).not.toHaveBeenCalled();
  });

  it('leaves donation modal keyboard actions alone', () => {
    const onDismiss = vi.fn();
    const donationModal = document.createElement('div');
    donationModal.dataset.donationModal = '';
    document.body.appendChild(donationModal);

    render(<StreakMilestoneOverlay milestone={10} onDismiss={onDismiss} />);
    fireEvent.keyDown(donationModal, { key: 'Enter' });

    expect(onDismiss).not.toHaveBeenCalled();
    donationModal.remove();
  });

  it('removes shortcut listeners when the milestone closes', () => {
    const onDismiss = vi.fn();
    const { rerender } = render(
      <StreakMilestoneOverlay milestone={10} onDismiss={onDismiss} />,
    );

    rerender(<StreakMilestoneOverlay milestone={null} onDismiss={onDismiss} />);
    fireEvent.keyDown(document.body, { key: 'Enter' });

    expect(onDismiss).not.toHaveBeenCalled();
  });
});
