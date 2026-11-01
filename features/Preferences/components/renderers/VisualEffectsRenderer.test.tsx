import { act, fireEvent, render } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import VisualEffectsRenderer from './VisualEffectsRenderer';
import usePreferencesStore from '@/features/Preferences/store/usePreferencesStore';

vi.mock('@/shared/hooks/generic/useHasFinePointer', () => ({
  useHasFinePointer: () => true,
}));

const context = {
  clearRect: vi.fn(),
  drawImage: vi.fn(),
  fillText: vi.fn(),
  restore: vi.fn(),
  rotate: vi.fn(),
  save: vi.fn(),
  setTransform: vi.fn(),
  translate: vi.fn(),
  globalAlpha: 1,
  font: '',
  textAlign: 'start' as CanvasTextAlign,
  textBaseline: 'alphabetic' as CanvasTextBaseline,
};

describe('VisualEffectsRenderer', () => {
  let nextFrameId: number;
  let frameCallbacks: Map<number, FrameRequestCallback>;

  beforeEach(() => {
    nextFrameId = 1;
    frameCallbacks = new Map();
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(
      context as unknown as CanvasRenderingContext2D,
    );
    vi.spyOn(window, 'requestAnimationFrame').mockImplementation(callback => {
      const id = nextFrameId++;
      frameCallbacks.set(id, callback);
      return id;
    });
    vi.spyOn(window, 'cancelAnimationFrame').mockImplementation(id => {
      frameCallbacks.delete(id);
    });
    usePreferencesStore.setState({
      cursorTrailEffect: 'none',
      clickEffect: 'sakura',
    });
  });

  afterEach(() => {
    act(() => {
      usePreferencesStore.setState({
        cursorTrailEffect: 'none',
        clickEffect: 'none',
      });
    });
    vi.restoreAllMocks();
    vi.clearAllMocks();
  });

  it('keeps the active scheduler when the selected emoji changes', () => {
    render(<VisualEffectsRenderer />);
    fireEvent.click(window, { clientX: 20, clientY: 30 });

    expect(requestAnimationFrame).toHaveBeenCalledOnce();
    act(() => usePreferencesStore.setState({ clickEffect: 'maple' }));
    expect(cancelAnimationFrame).not.toHaveBeenCalled();

    const pendingFrame = frameCallbacks.values().next().value;
    expect(pendingFrame).toBeTypeOf('function');
    act(() => pendingFrame?.(performance.now()));
    expect(context.drawImage).toHaveBeenCalled();
  });

  it('can schedule again after being disabled during an active frame', () => {
    render(<VisualEffectsRenderer />);
    fireEvent.click(window, { clientX: 20, clientY: 30 });
    expect(requestAnimationFrame).toHaveBeenCalledOnce();

    act(() => usePreferencesStore.setState({ clickEffect: 'none' }));
    expect(cancelAnimationFrame).toHaveBeenCalledOnce();
    act(() => usePreferencesStore.setState({ clickEffect: 'sakura' }));
    fireEvent.click(window, { clientX: 40, clientY: 50 });

    expect(requestAnimationFrame).toHaveBeenCalledTimes(2);
  });
});
