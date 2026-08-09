import { beforeEach, describe, expect, it, vi } from 'vitest';

import {
  clearAutoLearningHandoff,
  readAutoLearningHandoff,
  writeAutoLearningHandoff,
} from './autoLearningHandoff';

describe('autoLearningHandoff', () => {
  beforeEach(() => {
    sessionStorage.clear();
    vi.useRealTimers();
  });

  it('round-trips a lightweight route handoff', () => {
    writeAutoLearningHandoff({
      dojo: 'kanji',
      gameMode: 'Pick',
      sets: [
        {
          setName: 'Set 1',
          level: 'n5',
          startIndex: 0,
          endIndex: 10,
        },
      ],
    });

    expect(readAutoLearningHandoff('kanji')).toMatchObject({
      dojo: 'kanji',
      gameMode: 'Pick',
      sets: [{ setName: 'Set 1', level: 'n5' }],
    });
  });

  it('clears a consumed handoff', () => {
    writeAutoLearningHandoff({
      dojo: 'kana',
      gameMode: 'Pick',
      sets: [{ startIndex: 0, endIndex: 1 }],
    });

    clearAutoLearningHandoff();

    expect(readAutoLearningHandoff('kana')).toBeNull();
  });

  it('rejects expired handoffs', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-01-01T00:00:00Z'));
    writeAutoLearningHandoff({
      dojo: 'vocabulary',
      gameMode: 'Type',
      sets: [
        { level: 'n5', setName: 'Set 1', startIndex: 0, endIndex: 10 },
      ],
    });
    vi.advanceTimersByTime(5 * 60 * 1000 + 1);

    expect(readAutoLearningHandoff('vocabulary')).toBeNull();
  });
});
