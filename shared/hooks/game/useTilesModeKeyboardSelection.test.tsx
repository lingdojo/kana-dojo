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
});
