import { beforeEach, describe, expect, it, vi } from 'vitest';

const storage = new Map<string, unknown>();

vi.mock('localforage', () => ({
  default: {
    getItem: vi.fn(async (key: string) => storage.get(key) ?? null),
    setItem: vi.fn(async (key: string, value: unknown) => {
      storage.set(key, value);
      return value;
    }),
    removeItem: vi.fn(async (key: string) => {
      storage.delete(key);
    }),
  },
}));

import { createAdaptiveSelector } from './adaptiveSelection';

describe('adaptiveSelection v2', () => {
  beforeEach(() => {
    storage.clear();
  });

  it('persists historical stats without time fields', async () => {
    const selector = createAdaptiveSelector('test-persist');
    await selector.ensureLoaded();

    selector.markCharacterSeen('a');
    selector.updateCharacterWeight('a', true);
    await selector.forceSave();

    const payload = storage.get('kanadojo-adaptive-weights-test-persist') as {
      version: number;
      weights: Record<string, unknown>;
    };

    expect(payload.version).toBe(2);
    expect(payload.weights.a).toEqual({ correct: 1, wrong: 0 });
    expect(String(JSON.stringify(payload))).not.toContain('lastUpdated');
    expect(String(JSON.stringify(payload))).not.toContain('recentMisses');
    expect(String(JSON.stringify(payload))).not.toContain('lastSeen');
  });

  it('resets session stats when session token changes and keeps historical stats', async () => {
    const selector = createAdaptiveSelector('test-session-reset');
    await selector.ensureLoaded();

    selector.startSession('s1');
    selector.markCharacterSeen('a');
    selector.updateCharacterWeight('a', false);
    selector.updateCharacterWeight('a', true);

    const before = selector.getCharacterWeight('a');
    expect(before?.sessionCorrect).toBe(1);
    expect(before?.sessionWrong).toBe(1);
    expect(before?.historicalCorrect).toBe(1);
    expect(before?.historicalWrong).toBe(1);

    selector.startSession('s2');
    const after = selector.getCharacterWeight('a');

    expect(after?.sessionCorrect).toBe(0);
    expect(after?.sessionWrong).toBe(0);
    expect(after?.seenCountInSession).toBe(0);
    expect(after?.lastSeenSelectionIndex).toBeNull();
    expect(after?.historicalCorrect).toBe(1);
    expect(after?.historicalWrong).toBe(1);
  });

  it('prioritizes under-shown keys within the current session', () => {
    let underShownWins = 0;
    let overShownWins = 0;

    for (let i = 0; i < 500; i++) {
      const selector = createAdaptiveSelector();
      selector.startSession(`coverage-${i}`);

      // b is seen once early; a is repeatedly shown after that.
      selector.markCharacterSeen('b');
      for (let j = 0; j < 18; j++) selector.markCharacterSeen('a');

      const picked = selector.selectWeightedCharacter(['a', 'b']);
      if (picked === 'b') underShownWins += 1;
      else overShownWins += 1;
    }

    expect(underShownWins).toBeGreaterThan(overShownWins);
  });

  it('prioritizes low session-accuracy keys over high session-accuracy keys', () => {
    let hardKeyWins = 0;
    let easyKeyWins = 0;

    for (let i = 0; i < 500; i++) {
      const selector = createAdaptiveSelector();
      selector.startSession(`accuracy-${i}`);

      // Equal exposure baseline
      selector.markCharacterSeen('hard');
      selector.markCharacterSeen('easy');
      selector.markCharacterSeen('hard');
      selector.markCharacterSeen('easy');

      // hard performs worse than easy in session.
      for (let k = 0; k < 5; k++) selector.updateCharacterWeight('hard', false);
      for (let k = 0; k < 5; k++) selector.updateCharacterWeight('easy', true);

      const picked = selector.selectWeightedCharacter(['hard', 'easy']);
      if (picked === 'hard') hardKeyWins += 1;
      else easyKeyWins += 1;
    }

    expect(hardKeyWins).toBeGreaterThan(easyKeyWins);
  });

  it('locks vocabulary format to worst pending format until cleared by correct answer', () => {
    const selector = createAdaptiveSelector();
    selector.startSession('format-lock');

    selector.registerQuestionFormatResult('食べる', 'reading', false);
    selector.registerQuestionFormatResult('食べる', 'meaning-normal', false);
    selector.registerQuestionFormatResult('食べる', 'meaning-normal', true);

    expect(
      selector.getPreferredLockedFormat('食べる', ['meaning-normal', 'reading']),
    ).toBe('reading');

    selector.registerQuestionFormatResult('食べる', 'reading', true);
    expect(
      selector.getPreferredLockedFormat('食べる', ['meaning-normal', 'reading']),
    ).toBeNull();
  });
});
