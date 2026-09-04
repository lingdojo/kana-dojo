import { act, fireEvent, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  getTilePrefixMatches,
  useTilesModeKeyboardSelection,
} from '@/shared/hooks/game/useTilesModeKeyboardSelection';

const setFinePointer = (matches: boolean) => {
  Object.defineProperty(window, 'matchMedia', {
    configurable: true,
    value: vi.fn().mockImplementation(() => ({
      matches,
      media: '(hover: hover) and (pointer: fine)',
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });
};

const renderKeyboardSelection = (
  allTiles: Map<number, string>,
  onTileClick = vi.fn(),
  placedTileIds: number[] = [],
) =>
  renderHook(() =>
    useTilesModeKeyboardSelection({
      allTiles,
      placedTileIds,
      onTileClick,
      enabled: true,
    }),
  );

describe('useTilesModeKeyboardSelection', () => {
  beforeEach(() => setFinePointer(true));

  it('automatically selects a tile once its prefix is unique', async () => {
    const onTileClick = vi.fn();
    const { result } = renderKeyboardSelection(
      new Map([
        [1, 'lake'],
        [2, 'lair'],
      ]),
      onTileClick,
    );

    await waitFor(() =>
      expect(result.current.isKeyboardSelectionEnabled).toBe(true),
    );

    fireEvent.keyDown(window, { key: 'L' });
    fireEvent.keyDown(window, { key: 'a' });
    expect(result.current.typedPrefix).toBe('La');

    fireEvent.keyDown(window, { key: 'k' });
    expect(onTileClick).toHaveBeenCalledWith(1, 'lake');
    expect(result.current.typedPrefix).toBe('');
  });

  it('uses Enter to commit an exact shorter match', async () => {
    const onTileClick = vi.fn();
    const { result } = renderKeyboardSelection(
      new Map([
        [1, 'an'],
        [2, 'ann'],
      ]),
      onTileClick,
    );

    await waitFor(() =>
      expect(result.current.isKeyboardSelectionEnabled).toBe(true),
    );

    fireEvent.keyDown(window, { key: 'a' });
    fireEvent.keyDown(window, { key: 'n' });
    expect(result.current.typedPrefix).toBe('an');

    fireEvent.keyDown(window, { key: 'Enter' });
    expect(onTileClick).toHaveBeenCalledWith(1, 'an');
    expect(result.current.typedPrefix).toBe('');
  });

  it('edits an active prefix before removing the last placed tile', async () => {
    const onTileClick = vi.fn();
    const { result } = renderKeyboardSelection(
      new Map([
        [1, 'lake'],
        [2, 'lair'],
        [3, 'done'],
      ]),
      onTileClick,
      [3],
    );

    await waitFor(() =>
      expect(result.current.isKeyboardSelectionEnabled).toBe(true),
    );

    fireEvent.keyDown(window, { key: 'l' });
    fireEvent.keyDown(window, { key: 'a' });
    fireEvent.keyDown(window, { key: 'Backspace' });
    expect(result.current.typedPrefix).toBe('l');
    expect(onTileClick).not.toHaveBeenCalled();

    fireEvent.keyDown(window, { key: 'Backspace' });
    fireEvent.keyDown(window, { key: 'Backspace' });
    expect(onTileClick).toHaveBeenCalledWith(3, 'done');
  });

  it('clears an active prefix with Escape but leaves the next Escape unhandled', async () => {
    const onExit = vi.fn();
    const exitHandler = (event: KeyboardEvent) => {
      if (!event.defaultPrevented && event.key === 'Escape') onExit();
    };
    window.addEventListener('keydown', exitHandler);

    const { result } = renderKeyboardSelection(
      new Map([
        [1, 'lake'],
        [2, 'lair'],
      ]),
    );

    await waitFor(() =>
      expect(result.current.isKeyboardSelectionEnabled).toBe(true),
    );

    fireEvent.keyDown(window, { key: 'l' });
    expect(result.current.typedPrefix).toBe('l');

    const clearingEscape = new KeyboardEvent('keydown', {
      key: 'Escape',
      bubbles: true,
      cancelable: true,
    });
    act(() => window.dispatchEvent(clearingEscape));
    expect(clearingEscape.defaultPrevented).toBe(true);
    expect(result.current.typedPrefix).toBe('');
    expect(onExit).not.toHaveBeenCalled();

    const exitingEscape = new KeyboardEvent('keydown', {
      key: 'Escape',
      bubbles: true,
      cancelable: true,
    });
    act(() => window.dispatchEvent(exitingEscape));
    expect(exitingEscape.defaultPrevented).toBe(false);
    expect(onExit).toHaveBeenCalledOnce();

    window.removeEventListener('keydown', exitHandler);
  });

  it('clears an ambiguous prefix when a commit key has no exact match', async () => {
    const { result } = renderKeyboardSelection(
      new Map([
        [1, 'lake'],
        [2, 'lair'],
      ]),
    );

    await waitFor(() =>
      expect(result.current.isKeyboardSelectionEnabled).toBe(true),
    );

    fireEvent.keyDown(window, { key: 'l' });
    fireEvent.keyDown(window, { key: 'a' });
    fireEvent.keyDown(window, { key: ' ' });

    expect(result.current.typedPrefix).toBe('');
  });

  it('clears a pending prefix on mismatch without replaying the mismatched key', async () => {
    const onTileClick = vi.fn();
    const { result } = renderKeyboardSelection(
      new Map([
        [1, 'lake'],
        [2, 'lair'],
        [3, 'dog'],
      ]),
      onTileClick,
    );

    await waitFor(() =>
      expect(result.current.isKeyboardSelectionEnabled).toBe(true),
    );

    fireEvent.keyDown(window, { key: 'l' });
    fireEvent.keyDown(window, { key: 'a' });
    expect(result.current.typedPrefix).toBe('la');

    fireEvent.keyDown(window, { key: 'd' });
    expect(result.current.typedPrefix).toBe('');
    expect(onTileClick).not.toHaveBeenCalled();

    fireEvent.keyDown(window, { key: 'd' });
    expect(onTileClick).toHaveBeenCalledOnce();
    expect(onTileClick).toHaveBeenCalledWith(3, 'dog');
  });

  it('excludes a selected tile immediately and ignores repeated keydown events', async () => {
    const onTileClick = vi.fn();
    const { result } = renderKeyboardSelection(
      new Map([[1, 'cat']]),
      onTileClick,
    );

    await waitFor(() =>
      expect(result.current.isKeyboardSelectionEnabled).toBe(true),
    );

    fireEvent.keyDown(window, { key: 'c', repeat: true });
    expect(onTileClick).not.toHaveBeenCalled();

    fireEvent.keyDown(window, { key: 'c' });
    fireEvent.keyDown(window, { key: 'c' });
    expect(onTileClick).toHaveBeenCalledTimes(1);
    expect(onTileClick).toHaveBeenCalledWith(1, 'cat');
  });

  it('does nothing on coarse-pointer devices', async () => {
    setFinePointer(false);
    const onTileClick = vi.fn();
    const { result } = renderKeyboardSelection(
      new Map([[1, 'only']]),
      onTileClick,
    );

    await act(async () => undefined);
    fireEvent.keyDown(window, { key: 'o' });

    expect(result.current.isKeyboardSelectionEnabled).toBe(false);
    expect(result.current.typedPrefix).toBe('');
    expect(onTileClick).not.toHaveBeenCalled();
  });
});

describe('getTilePrefixMatches', () => {
  it('matches case-insensitively with Unicode NFC normalization', () => {
    const candidates = [
      { id: 1, text: 'CAFÉ' },
      { id: 2, text: 'cake' },
    ];

    expect(getTilePrefixMatches(candidates, 'cafe\u0301')).toEqual([
      candidates[0],
    ]);
  });

  it('normalizes common apostrophes, dashes, and whitespace', () => {
    const candidates = [
      { id: 1, text: 'rock’n’roll' },
      { id: 2, text: 'well—known' },
      { id: 3, text: 'ice\u00a0cream' },
    ];

    expect(getTilePrefixMatches(candidates, "rock'n")).toEqual([candidates[0]]);
    expect(getTilePrefixMatches(candidates, 'well-known')).toEqual([
      candidates[1],
    ]);
    expect(getTilePrefixMatches(candidates, 'ice cream')).toEqual([
      candidates[2],
    ]);
  });
});
