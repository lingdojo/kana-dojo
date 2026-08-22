import React, { StrictMode } from 'react';
import { act, render, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import Sidebar from '@/shared/ui-composite/Menu/Sidebar';

vi.mock('@/core/i18n/routing', () => ({
  Link: ({
    children,
    prefetch: _prefetch,
    ...props
  }: React.AnchorHTMLAttributes<HTMLAnchorElement> & { prefetch?: boolean }) => (
    <a {...props}>{children}</a>
  ),
  usePathname: () => '/kana',
  useRouter: () => ({ push: vi.fn() }),
}));

vi.mock('@/features/Preferences', () => ({
  useInputPreferences: () => ({ hotkeysOn: false }),
}));

vi.mock('@/shared/hooks/generic/useAudio', () => ({
  useClick: () => ({ playClick: vi.fn() }),
}));

vi.mock('@/shared/hooks/generic/useScrollVisibility', () => ({
  useScrollVisibility: () => true,
}));

vi.mock('@/shared/data/experiments', () => ({ experiments: [] }));

vi.mock('@/shared/ui/components/magicui/AuroraText', () => ({
  default: ({ children }: { children: React.ReactNode }) => children,
}));

vi.mock('framer-motion', () => ({
  motion: {
    aside: ({
      children,
      initial: _initial,
      animate: _animate,
      transition: _transition,
      ...props
    }: React.HTMLAttributes<HTMLElement> & Record<string, unknown>) => (
      <aside {...props}>{children}</aside>
    ),
    div: ({
      children,
      initial: _initial,
      animate: _animate,
      transition: _transition,
      layoutId: _layoutId,
      ...props
    }: React.HTMLAttributes<HTMLDivElement> & Record<string, unknown>) => (
      <div {...props}>{children}</div>
    ),
  },
}));

const storageKeys = [
  'sidebar-desktop-collapsed',
  'sidebar-collapsible-academy',
  'sidebar-collapsible-tools',
  'sidebar-collapsible-experiments',
] as const;

beforeEach(() => {
  sessionStorage.clear();
  localStorage.clear();
  Object.defineProperty(window, 'matchMedia', {
    configurable: true,
    value: () => ({
      matches: false,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }),
  });
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('Sidebar storage restoration', () => {
  it('preserves and restores saved state under Strict Mode', async () => {
    for (const key of storageKeys) sessionStorage.setItem(key, 'true');

    const { container } = render(
      <StrictMode>
        <Sidebar />
      </StrictMode>,
    );

    await waitFor(() => {
      expect(
        container
          .querySelector('#main-sidebar')
          ?.classList.contains('lg:w-20'),
      ).toBe(true);
    });

    for (const key of storageKeys) {
      expect(sessionStorage.getItem(key)).toBe('true');
    }

    await act(async () => {
      await vi.dynamicImportSettled();
    });
  });
});
