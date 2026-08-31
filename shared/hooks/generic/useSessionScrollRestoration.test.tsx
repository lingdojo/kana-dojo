import { fireEvent, render } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import useSessionScrollRestoration from '@/shared/hooks/generic/useSessionScrollRestoration';

interface TestScrollerProps {
  enabled: boolean;
  mounted?: boolean;
  ready?: boolean;
  storageKey?: string;
}

function TestScroller({
  enabled,
  mounted = true,
  ready = true,
  storageKey = 'test-scroll',
}: TestScrollerProps) {
  const { scrollRef, handleScroll } = useSessionScrollRestoration(storageKey, {
    enabled,
    ready,
  });

  if (!enabled || !mounted) return null;

  return <div data-testid='scroller' ref={scrollRef} onScroll={handleScroll} />;
}

describe('useSessionScrollRestoration', () => {
  beforeEach(() => {
    sessionStorage.clear();
  });

  it('saves the scroll position on close and restores it on reopen', () => {
    const view = render(<TestScroller enabled />);
    const scroller = view.getByTestId('scroller');

    scroller.scrollTop = 240;
    fireEvent.scroll(scroller);
    view.rerender(<TestScroller enabled={false} />);

    expect(sessionStorage.getItem('test-scroll')).toBe('240');

    view.rerender(<TestScroller enabled />);
    expect(view.getByTestId('scroller').scrollTop).toBe(240);
  });

  it('keeps positions separate by storage key', () => {
    sessionStorage.setItem('first-scroll', '120');
    sessionStorage.setItem('second-scroll', '360');

    const first = render(<TestScroller enabled storageKey='first-scroll' />);
    const second = render(<TestScroller enabled storageKey='second-scroll' />);

    expect(first.container.querySelector('div')?.scrollTop).toBe(120);
    expect(second.container.querySelector('div')?.scrollTop).toBe(360);
  });

  it('waits until the scroll content is ready before restoring', () => {
    sessionStorage.setItem('test-scroll', '480');
    const view = render(<TestScroller enabled ready={false} />);

    expect(view.getByTestId('scroller').scrollTop).toBe(0);

    view.rerender(<TestScroller enabled ready />);
    expect(view.getByTestId('scroller').scrollTop).toBe(480);
  });

  it('restores when a portal mounts after the parent layout effect', () => {
    sessionStorage.setItem('test-scroll', '320');
    const view = render(<TestScroller enabled mounted={false} />);

    view.rerender(<TestScroller enabled mounted />);

    expect(view.getByTestId('scroller').scrollTop).toBe(320);
  });

  it('falls back to the top for an invalid stored position', () => {
    sessionStorage.setItem('test-scroll', 'not-a-number');

    const view = render(<TestScroller enabled />);

    expect(view.getByTestId('scroller').scrollTop).toBe(0);
  });

  it('continues working when session storage is unavailable', () => {
    const getItem = vi
      .spyOn(Storage.prototype, 'getItem')
      .mockImplementation(() => {
        throw new Error('Storage unavailable');
      });
    const setItem = vi
      .spyOn(Storage.prototype, 'setItem')
      .mockImplementation(() => {
        throw new Error('Storage unavailable');
      });

    expect(() => render(<TestScroller enabled />)).not.toThrow();

    getItem.mockRestore();
    setItem.mockRestore();
  });
});
