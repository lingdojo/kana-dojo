import React from 'react';
import { act, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import TilesModeGrid from '@/shared/ui-composite/Game/TilesModeGrid';

vi.mock('framer-motion', () => ({
  motion: {
    button: ({
      children,
      layout: _layout,
      layoutId: _layoutId,
      variants: _variants,
      transition: _transition,
      ...props
    }: React.ButtonHTMLAttributes<HTMLButtonElement> &
      Record<string, unknown>) => <button {...props}>{children}</button>,
    div: ({
      children,
      variants: _variants,
      initial: _initial,
      animate: _animate,
      transition: _transition,
      ...props
    }: React.HTMLAttributes<HTMLDivElement> & Record<string, unknown>) => (
      <div {...props}>{children}</div>
    ),
  },
}));

afterEach(() => {
  vi.useRealTimers();
});

describe('TilesModeGrid explode celebration', () => {
  it('explodes, hides, fades back in, and returns to idle', () => {
    vi.useFakeTimers();
    const props = {
      allTiles: new Map([[1, 'あ']]),
      placedTileIds: [1],
      onTileClick: vi.fn(),
      isTileDisabled: true,
      celebrationMode: 'explode' as const,
      tilesPerRow: 1,
      tileSizeClassName: 'text-2xl',
      answerRowClassName: 'answer-row',
      tilesWrapperKey: 'question-1',
    };

    const { rerender } = render(
      <TilesModeGrid {...props} isCelebrating={false} />,
    );
    const tile = screen.getByRole('button', { name: 'あ' });

    expect(document.querySelector('style')?.textContent).toContain(
      '@keyframes tiles-mode-explode',
    );
    expect(document.querySelector('style')?.textContent).toContain(
      '@keyframes tiles-mode-fade-in',
    );

    rerender(<TilesModeGrid {...props} isCelebrating />);

    act(() => vi.advanceTimersByTime(0));
    expect(tile.style.animation).toBe(
      'tiles-mode-explode 300ms ease-out forwards',
    );

    act(() => vi.advanceTimersByTime(300));
    expect(tile.style.opacity).toBe('0');

    act(() => vi.advanceTimersByTime(750));
    expect(tile.style.animation).toBe(
      'tiles-mode-fade-in 600ms ease-in forwards',
    );

    act(() => vi.advanceTimersByTime(600));
    expect(tile.style.animation).toBe('');
    expect(tile.style.opacity).toBe('1');
  });
});
