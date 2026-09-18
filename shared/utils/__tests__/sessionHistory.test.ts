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

import {
  startSession,
  appendAttempt,
  finalizeSession,
  getAllSessions,
  getSessionById,
  deleteSession,
  clearAllSessions,
} from '../sessionHistory';

describe('sessionHistory module', () => {
  beforeEach(() => {
    storage.clear();
  });

  it('creates, appends attempts, and finalizes a session correctly', async () => {
    const sessionId = await startSession({
      sessionType: 'classic',
      dojoType: 'kana',
      gameMode: 'Classic Kana',
      selectedSets: ['hiragana-a'],
      route: '/kana/train',
    });

    expect(sessionId).toBeDefined();

    await appendAttempt(sessionId, {
      questionId: 'a',
      questionPrompt: 'あ',
      expectedAnswers: ['a'],
      userAnswer: 'a',
      inputKind: 'pick',
      isCorrect: true,
      timeTakenMs: 1200,
    });

    await appendAttempt(sessionId, {
      questionId: 'i',
      questionPrompt: 'い',
      expectedAnswers: ['i'],
      userAnswer: 'e',
      inputKind: 'pick',
      isCorrect: false,
      timeTakenMs: 1500,
    });

    const record = await finalizeSession({
      sessionId,
      endedReason: 'completed',
      endedAbruptly: false,
      correct: 1,
      wrong: 1,
      bestStreak: 1,
    });

    expect(record).not.toBeNull();
    expect(record?.id).toBe(sessionId);
    expect(record?.summary.correct).toBe(1);
    expect(record?.summary.wrong).toBe(1);
    expect(record?.summary.accuracy).toBe(0.5);
    expect(record?.attempts.length).toBe(2);

    const all = await getAllSessions();
    expect(all.length).toBe(1);
    expect(all[0].id).toBe(sessionId);

    const fetched = await getSessionById(sessionId);
    expect(fetched?.id).toBe(sessionId);
  });

  it('deletes a single session properly', async () => {
    const id1 = await startSession({
      sessionType: 'blitz',
      dojoType: 'kanji',
      gameMode: 'Blitz Kanji',
    });
    await finalizeSession({
      sessionId: id1,
      endedReason: 'completed',
      endedAbruptly: false,
      correct: 5,
      wrong: 0,
      bestStreak: 5,
    });

    const id2 = await startSession({
      sessionType: 'gauntlet',
      dojoType: 'vocabulary',
      gameMode: 'Gauntlet Vocab',
    });
    await finalizeSession({
      sessionId: id2,
      endedReason: 'failed',
      endedAbruptly: true,
      correct: 2,
      wrong: 3,
      bestStreak: 2,
    });

    let sessions = await getAllSessions();
    expect(sessions.length).toBe(2);

    await deleteSession(id1);

    sessions = await getAllSessions();
    expect(sessions.length).toBe(1);
    expect(sessions[0].id).toBe(id2);

    const deleted = await getSessionById(id1);
    expect(deleted).toBeNull();
  });

  it('clears all sessions properly', async () => {
    const id1 = await startSession({
      sessionType: 'classic',
      dojoType: 'kana',
      gameMode: 'Classic',
    });
    await finalizeSession({
      sessionId: id1,
      endedReason: 'completed',
      endedAbruptly: false,
      correct: 10,
      wrong: 0,
      bestStreak: 10,
    });

    await clearAllSessions();

    const sessions = await getAllSessions();
    expect(sessions.length).toBe(0);
  });
});
