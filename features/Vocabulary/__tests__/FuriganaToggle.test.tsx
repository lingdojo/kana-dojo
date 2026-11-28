import React from 'react';
import { createEvent, fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import FuriganaToggle from '@/features/Vocabulary/components/Game/FuriganaToggle';

const mockPreferences = {
  furiganaEnabled: false,
  setFuriganaEnabled: vi.fn(),
};

vi.mock('@/features/Preferences', () => ({
  useThemePreferences: () => mockPreferences,
}));

describe('FuriganaToggle', () => {
  beforeEach(() => {
    mockPreferences.furiganaEnabled = false;
    mockPreferences.setFuriganaEnabled.mockReset();
  });

  it('shows the off state when furigana is disabled', () => {
    render(<FuriganaToggle />);

    const button = screen.getByRole('button', { name: 'Show furigana' });
    expect(button.getAttribute('aria-pressed')).toBe('false');
    expect(button.textContent).toContain('off');
  });

  it('shows the on state when furigana is enabled', () => {
    mockPreferences.furiganaEnabled = true;
    render(<FuriganaToggle />);

    const button = screen.getByRole('button', { name: 'Hide furigana' });
    expect(button.getAttribute('aria-pressed')).toBe('true');
    expect(button.textContent).toContain('on');
  });

  it('turns furigana on when clicked while off', () => {
    render(<FuriganaToggle />);

    fireEvent.click(screen.getByRole('button'));
    expect(mockPreferences.setFuriganaEnabled).toHaveBeenCalledWith(true);
  });

  it('turns furigana off when clicked while on', () => {
    mockPreferences.furiganaEnabled = true;
    render(<FuriganaToggle />);

    fireEvent.click(screen.getByRole('button'));
    expect(mockPreferences.setFuriganaEnabled).toHaveBeenCalledWith(false);
  });

  it('does not take focus away from the answer input on mouse down', () => {
    render(<FuriganaToggle />);

    const button = screen.getByRole('button');
    const mouseDown = createEvent.mouseDown(button);
    fireEvent(button, mouseDown);
    expect(mouseDown.defaultPrevented).toBe(true);
  });
});
