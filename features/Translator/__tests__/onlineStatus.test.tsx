import { describe, it, expect, afterEach, vi } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import { renderToString } from 'react-dom/server';
import { hydrateRoot } from 'react-dom/client';
import { isOnline } from '../services/translationAPI';
import { useOnlineStatus } from '../hooks/useOnlineStatus';

function mockOnLine(value: boolean) {
  return vi.spyOn(window.navigator, 'onLine', 'get').mockReturnValue(value);
}

function StatusText() {
  return <span>{useOnlineStatus() ? 'online' : 'offline'}</span>;
}

describe('isOnline', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('treats a missing navigator (SSR) as online', () => {
    vi.stubGlobal('navigator', undefined);
    expect(isOnline()).toBe(true);
  });

  it('treats a Node.js-style navigator without onLine as online', () => {
    // Node.js 21+ exposes a global navigator that has no onLine property.
    vi.stubGlobal('navigator', {
      userAgent: 'Node.js/24',
      hardwareConcurrency: 8,
    });
    expect(isOnline()).toBe(true);
  });

  it('returns navigator.onLine when it is a boolean', () => {
    mockOnLine(true);
    expect(isOnline()).toBe(true);

    mockOnLine(false);
    expect(isOnline()).toBe(false);
  });
});

describe('useOnlineStatus', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('reflects navigator.onLine on the client', () => {
    mockOnLine(false);
    const { result } = renderHook(() => useOnlineStatus());
    expect(result.current).toBe(false);
  });

  it('updates on offline and online events', () => {
    const onLine = mockOnLine(true);
    const { result } = renderHook(() => useOnlineStatus());
    expect(result.current).toBe(true);

    act(() => {
      onLine.mockReturnValue(false);
      window.dispatchEvent(new Event('offline'));
    });
    expect(result.current).toBe(false);

    act(() => {
      onLine.mockReturnValue(true);
      window.dispatchEvent(new Event('online'));
    });
    expect(result.current).toBe(true);
  });

  it('removes its event listeners on unmount', () => {
    const removeSpy = vi.spyOn(window, 'removeEventListener');
    const { unmount } = renderHook(() => useOnlineStatus());
    unmount();

    const removed = removeSpy.mock.calls.map(([type]) => type);
    expect(removed).toEqual(expect.arrayContaining(['online', 'offline']));
  });

  it('renders online on the server even when the browser reports offline', () => {
    mockOnLine(false);
    expect(renderToString(<StatusText />)).toContain('online');
    expect(renderToString(<StatusText />)).not.toContain('offline');
  });

  it('hydrates without a mismatch, then switches to the real offline status', async () => {
    const container = document.createElement('div');
    container.innerHTML = renderToString(<StatusText />);
    document.body.appendChild(container);

    mockOnLine(false);
    const onRecoverableError = vi.fn();
    let root: ReturnType<typeof hydrateRoot> | undefined;

    await act(async () => {
      root = hydrateRoot(container, <StatusText />, { onRecoverableError });
    });

    expect(onRecoverableError).not.toHaveBeenCalled();
    expect(container.textContent).toBe('offline');

    act(() => root?.unmount());
    container.remove();
  });
});
