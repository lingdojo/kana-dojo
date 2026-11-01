import { beforeEach, describe, expect, it, vi } from 'vitest';

const { storage } = vi.hoisted(() => ({
  storage: new Map<string, unknown>(),
}));

vi.mock('@/core/i18n/routing', () => ({
  routing: {
    locales: ['en', 'es'],
    defaultLocale: 'en',
    localePrefix: 'never',
  },
  Link: () => null,
  redirect: vi.fn(),
  usePathname: () => '/',
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
}));

vi.mock('localforage', () => ({
  default: {
    getItem: vi.fn(async (key: string) => storage.get(key) ?? null),
    setItem: vi.fn(async (key: string, value: unknown) => {
      storage.set(key, value);
      return value;
    }),
    createInstance: vi.fn(() => ({
      getItem: vi.fn(async (key: string) => storage.get(key) ?? null),
      setItem: vi.fn(async (key: string, value: unknown) => {
        storage.set(key, value);
        return value;
      }),
    })),
  },
}));

import { createBackup, applyBackup, type BackupFile } from './backup';

describe('backup utility', () => {
  beforeEach(() => {
    storage.clear();
  });

  it('creates a backup with all core and progress data', async () => {
    storage.set('kanadojo-visits', ['2026-11-01', '2026-11-02']);
    storage.set('kanadojo-set-progress-v1', {
      version: 1,
      updatedAt: 1234567890,
      kanji: { 日: { correct: 5 } },
      vocabulary: { 日本: { meaningCorrect: 3, readingCorrect: 3 } },
    });

    const backup = await createBackup();

    expect(backup.version).toBeDefined();
    expect(backup.createdAt).toBeDefined();
    expect(backup.theme).toBeDefined();
    expect(backup.stats).toBeDefined();
    expect(backup.achievements).toBeDefined();
    expect(backup.visits).toEqual(['2026-11-01', '2026-11-02']);
    expect(backup.setProgress).toBeDefined();
    expect((backup.setProgress as Record<string, unknown>).version).toBe(1);
  });

  it('applies a valid backup successfully', async () => {
    const backup: BackupFile = {
      version: 'test',
      createdAt: '2026-11-01T00:00:00.000Z',
      visits: ['2026-10-30', '2026-10-31'],
      setProgress: {
        version: 1,
        updatedAt: 1700000000,
        kanji: { 木: { correct: 2 } },
        vocabulary: { 本: { meaningCorrect: 1, readingCorrect: 1 } },
      },
    };

    const success = await applyBackup(backup);
    expect(success).toBe(true);

    expect(storage.get('kanadojo-visits')).toEqual([
      '2026-10-30',
      '2026-10-31',
    ]);
    const savedProgress = storage.get('kanadojo-set-progress-v1') as Record<
      string,
      unknown
    >;
    expect(savedProgress).toBeDefined();
    expect(savedProgress.version).toBe(1);
  });

  it('filters out invalid visit date formats on import', async () => {
    const backup: BackupFile = {
      version: 'test',
      createdAt: '2026-11-01T00:00:00.000Z',
      visits: ['2026-10-30', 'invalid-date', '2026-10-31', 'not a date'],
    };

    const success = await applyBackup(backup);
    expect(success).toBe(true);

    expect(storage.get('kanadojo-visits')).toEqual([
      '2026-10-30',
      '2026-10-31',
    ]);
  });
});
