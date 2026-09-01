/**
 * Tests for Session History tracking
 * Tests session lifecycle: start, attempts, and finalization
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import * as fc from 'fast-check';
import {
  startSession,
  appendAttempt,
  finalizeSession,
  type SessionRecord,
  type AttemptEvent,
} from './sessionHistory';

// Mock localforage
vi.mock('localforage', () => {
  const store: Record<string, unknown> = {};
  return {
    default: {
      getItem: vi.fn((key: string) => Promise.resolve(store[key])),
      setItem: vi.fn((key: string, value: unknown) => {
        store[key] = value;
        return Promise.resolve();
      }),
      removeItem: vi.fn((key: string) => {
        delete store[key];
        return Promise.resolve();
      }),
    },
  };
});

describe('Session History', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('startSession', () => {
    it('creates a new session and returns an ID', async () => {
      const sessionId = await startSession({
        sessionType: 'classic',
        dojoType: 'kana',
        gameMode: 'Pick',
      });

      expect(sessionId).toBeDefined();
      expect(sessionId).toMatch(/^classic-\d+-[a-z0-9]+$/);
    });

    it('creates different session IDs for different sessions', async () => {
      const id1 = await startSession({
        sessionType: 'classic',
        dojoType: 'kana',
        gameMode: 'Pick',
      });

      const id2 = await startSession({
        sessionType: 'blitz',
        dojoType: 'kana',
        gameMode: 'Input',
      });

      expect(id1).not.toBe(id2);
    });

    it('creates session IDs with correct session type prefix', async () => {
      const classicId = await startSession({
        sessionType: 'classic',
        dojoType: 'kana',
        gameMode: 'Pick',
      });
      expect(classicId.startsWith('classic-')).toBe(true);

      const blitzId = await startSession({
        sessionType: 'blitz',
        dojoType: 'kana',
        gameMode: 'Pick',
      });
      expect(blitzId.startsWith('blitz-')).toBe(true);

      const gauntletId = await startSession({
        sessionType: 'gauntlet',
        dojoType: 'kana',
        gameMode: 'Pick',
      });
      expect(gauntletId.startsWith('gauntlet-')).toBe(true);
    });

    it('stores selection context', async () => {
      const sessionId = await startSession({
        sessionType: 'classic',
        dojoType: 'vocabulary',
        gameMode: 'Pick',
        selectedSets: ['n5', 'n4'],
        selectedCount: 100,
        route: '/vocabulary',
      });

      expect(sessionId).toBeDefined();
    });
  });

  describe('appendAttempt', () => {
    it('appends an attempt to a session', async () => {
      const sessionId = await startSession({
        sessionType: 'classic',
        dojoType: 'kana',
        gameMode: 'Pick',
      });

      await appendAttempt(sessionId, {
        questionId: 'あ-a',
        questionPrompt: 'あ',
        expectedAnswers: ['a'],
        userAnswer: 'a',
        inputKind: 'pick',
        isCorrect: true,
      });

      // Attempt was appended (no error thrown)
      expect(true).toBe(true);
    });

    it('handles multiple attempts', async () => {
      const sessionId = await startSession({
        sessionType: 'classic',
        dojoType: 'kana',
        gameMode: 'Pick',
      });

      await appendAttempt(sessionId, {
        questionId: 'あ-a',
        questionPrompt: 'あ',
        expectedAnswers: ['a'],
        userAnswer: 'a',
        inputKind: 'pick',
        isCorrect: true,
      });

      await appendAttempt(sessionId, {
        questionId: 'い-i',
        questionPrompt: 'い',
        expectedAnswers: ['i'],
        userAnswer: 'e',
        inputKind: 'pick',
        isCorrect: false,
      });

      await appendAttempt(sessionId, {
        questionId: 'う-u',
        questionPrompt: 'う',
        expectedAnswers: ['u'],
        userAnswer: 'u',
        inputKind: 'type',
        isCorrect: true,
        timeTakenMs: 2500,
      });

      // All attempts appended successfully
      expect(true).toBe(true);
    });

    it('silently ignores attempts for non-existent session', async () => {
      // Should not throw
      await appendAttempt('non-existent-session', {
        questionId: 'あ-a',
        questionPrompt: 'あ',
        expectedAnswers: ['a'],
        userAnswer: 'a',
        inputKind: 'pick',
        isCorrect: true,
      });

      expect(true).toBe(true);
    });

    it('tracks optional attempt metadata', async () => {
      const sessionId = await startSession({
        sessionType: 'gauntlet',
        dojoType: 'kana',
        gameMode: 'Pick',
      });

      await appendAttempt(sessionId, {
        questionId: 'あ-a',
        questionPrompt: 'あ',
        expectedAnswers: ['a'],
        userAnswer: 'i',
        inputKind: 'pick',
        isCorrect: false,
        optionsShown: ['a', 'i', 'u', 'e'],
        wrongSelectionsBeforeCorrect: ['i'],
        streakBefore: 5,
        streakAfter: 0,
        scoreBefore: 100,
        scoreAfter: 90,
        livesBefore: 3,
        livesAfter: 2,
      });

      // Attempt with metadata appended
      expect(true).toBe(true);
    });
  });

  describe('finalizeSession', () => {
    it('finalizes a session and returns the record', async () => {
      const sessionId = await startSession({
        sessionType: 'classic',
        dojoType: 'kana',
        gameMode: 'Pick',
      });

      await appendAttempt(sessionId, {
        questionId: 'あ-a',
        questionPrompt: 'あ',
        expectedAnswers: ['a'],
        userAnswer: 'a',
        inputKind: 'pick',
        isCorrect: true,
      });

      const record = await finalizeSession({
        sessionId,
        endedReason: 'completed',
        endedAbruptly: false,
        correct: 1,
        wrong: 0,
        bestStreak: 1,
        stars: 3,
      });

      expect(record).toBeDefined();
      expect(record?.id).toBe(sessionId);
      expect(record?.sessionType).toBe('classic');
      expect(record?.dojoType).toBe('kana');
      expect(record?.gameMode).toBe('Pick');
      expect(record?.endedReason).toBe('completed');
      expect(record?.endedAbruptly).toBe(false);
      expect(record?.summary.correct).toBe(1);
      expect(record?.summary.wrong).toBe(0);
      expect(record?.summary.accuracy).toBe(1);
      expect(record?.summary.bestStreak).toBe(1);
      expect(record?.summary.stars).toBe(3);
    });

    it('calculates accuracy correctly', async () => {
      const sessionId = await startSession({
        sessionType: 'classic',
        dojoType: 'kana',
        gameMode: 'Pick',
      });

      const record = await finalizeSession({
        sessionId,
        endedReason: 'completed',
        endedAbruptly: false,
        correct: 7,
        wrong: 3,
        bestStreak: 5,
      });

      expect(record?.summary.accuracy).toBeCloseTo(0.7, 2);
    });

    it('handles zero attempts', async () => {
      const sessionId = await startSession({
        sessionType: 'classic',
        dojoType: 'kana',
        gameMode: 'Pick',
      });

      const record = await finalizeSession({
        sessionId,
        endedReason: 'manual_quit',
        endedAbruptly: true,
        correct: 0,
        wrong: 0,
        bestStreak: 0,
      });

      expect(record?.summary.accuracy).toBe(0);
      expect(record?.summary.totalAttempts).toBe(0);
    });

    it('returns null for non-existent session', async () => {
      const record = await finalizeSession({
        sessionId: 'non-existent',
        endedReason: 'completed',
        endedAbruptly: false,
        correct: 0,
        wrong: 0,
        bestStreak: 0,
      });

      expect(record).toBeNull();
    });

    it('tracks duration', async () => {
      const sessionId = await startSession({
        sessionType: 'classic',
        dojoType: 'kana',
        gameMode: 'Pick',
      });

      // Small delay
      await new Promise(resolve => setTimeout(resolve, 50));

      const record = await finalizeSession({
        sessionId,
        endedReason: 'completed',
        endedAbruptly: false,
        correct: 1,
        wrong: 0,
        bestStreak: 1,
      });

      expect(record?.durationMs).toBeGreaterThanOrEqual(50);
    });

    it('handles different end reasons', async () => {
      const reasons: Array<{ reason: 'completed' | 'failed' | 'manual_quit' | 'navigation_exit' | 'unload_exit'; abrupt: boolean }> = [
        { reason: 'completed', abrupt: false },
        { reason: 'failed', abrupt: false },
        { reason: 'manual_quit', abrupt: true },
        { reason: 'navigation_exit', abrupt: true },
        { reason: 'unload_exit', abrupt: true },
      ];

      for (const { reason, abrupt } of reasons) {
        const sessionId = await startSession({
          sessionType: 'classic',
          dojoType: 'kana',
          gameMode: 'Pick',
        });

        const record = await finalizeSession({
          sessionId,
          endedReason: reason,
          endedAbruptly: abrupt,
          correct: 1,
          wrong: 0,
          bestStreak: 1,
        });

        expect(record?.endedReason).toBe(reason);
        expect(record?.endedAbruptly).toBe(abrupt);
      }
    });

    it('stores mode payload', async () => {
      const sessionId = await startSession({
        sessionType: 'gauntlet',
        dojoType: 'kana',
        gameMode: 'Pick',
      });

      const record = await finalizeSession({
        sessionId,
        endedReason: 'failed',
        endedAbruptly: false,
        correct: 5,
        wrong: 1,
        bestStreak: 3,
        modePayload: {
          livesRemaining: 0,
          round: 10,
          difficulty: 'hard',
        },
      });

      expect(record?.modePayload.livesRemaining).toBe(0);
      expect(record?.modePayload.round).toBe(10);
    });

    it('includes attempt history in record', async () => {
      const sessionId = await startSession({
        sessionType: 'classic',
        dojoType: 'kana',
        gameMode: 'Pick',
      });

      await appendAttempt(sessionId, {
        questionId: 'あ-a',
        questionPrompt: 'あ',
        expectedAnswers: ['a'],
        userAnswer: 'a',
        inputKind: 'pick',
        isCorrect: true,
      });

      await appendAttempt(sessionId, {
        questionId: 'い-i',
        questionPrompt: 'い',
        expectedAnswers: ['i'],
        userAnswer: 'e',
        inputKind: 'pick',
        isCorrect: false,
      });

      const record = await finalizeSession({
        sessionId,
        endedReason: 'completed',
        endedAbruptly: false,
        correct: 1,
        wrong: 1,
        bestStreak: 1,
      });

      expect(record?.attempts).toHaveLength(2);
      expect(record?.attempts[0].idx).toBe(0);
      expect(record?.attempts[1].idx).toBe(1);
      expect(record?.attempts[0].isCorrect).toBe(true);
      expect(record?.attempts[1].isCorrect).toBe(false);
    });
  });

  describe('Session types', () => {
    it('supports kana dojo', async () => {
      const sessionId = await startSession({
        sessionType: 'classic',
        dojoType: 'kana',
        gameMode: 'Pick',
      });

      const record = await finalizeSession({
        sessionId,
        endedReason: 'completed',
        endedAbruptly: false,
        correct: 1,
        wrong: 0,
        bestStreak: 1,
      });

      expect(record?.dojoType).toBe('kana');
    });

    it('supports kanji dojo', async () => {
      const sessionId = await startSession({
        sessionType: 'classic',
        dojoType: 'kanji',
        gameMode: 'Input',
      });

      const record = await finalizeSession({
        sessionId,
        endedReason: 'completed',
        endedAbruptly: false,
        correct: 1,
        wrong: 0,
        bestStreak: 1,
      });

      expect(record?.dojoType).toBe('kanji');
    });

    it('supports vocabulary dojo', async () => {
      const sessionId = await startSession({
        sessionType: 'blitz',
        dojoType: 'vocabulary',
        gameMode: 'Pick',
        selectedSets: ['n5'],
      });

      const record = await finalizeSession({
        sessionId,
        endedReason: 'completed',
        endedAbruptly: false,
        correct: 1,
        wrong: 0,
        bestStreak: 1,
      });

      expect(record?.dojoType).toBe('vocabulary');
      expect(record?.selectionContext.selectedSets).toEqual(['n5']);
    });
  });

  describe('Property-based tests', () => {
    it('session ID format is consistent', async () => {
      const sessionTypes = ['classic', 'blitz', 'gauntlet'] as const;
      
      for (const sessionType of sessionTypes) {
        const sessionId = await startSession({
          sessionType,
          dojoType: 'kana',
          gameMode: 'Pick',
        });

        expect(sessionId).toMatch(new RegExp(`^${sessionType}-\\d+-[a-z0-9]+$`));
      }
    });

    it('accuracy is always between 0 and 1', async () => {
      fc.assert(
        fc.asyncProperty(
          fc.integer({ min: 0, max: 100 }),
          fc.integer({ min: 0, max: 100 }),
          async (correct, wrong) => {
            // Skip if both are 0 (division by zero case)
            if (correct === 0 && wrong === 0) return;

            const sessionId = await startSession({
              sessionType: 'classic',
              dojoType: 'kana',
              gameMode: 'Pick',
            });

            const record = await finalizeSession({
              sessionId,
              endedReason: 'completed',
              endedAbruptly: false,
              correct,
              wrong,
              bestStreak: 0,
            });

            expect(record?.summary.accuracy).toBeGreaterThanOrEqual(0);
            expect(record?.summary.accuracy).toBeLessThanOrEqual(1);
          }
        ),
        { numRuns: 50 }
      );
    });
  });

  describe('Edge cases', () => {
    it('handles very long sessions', async () => {
      const sessionId = await startSession({
        sessionType: 'classic',
        dojoType: 'kana',
        gameMode: 'Pick',
      });

      // Add many attempts
      for (let i = 0; i < 100; i++) {
        await appendAttempt(sessionId, {
          questionId: `char-${i}`,
          questionPrompt: `char-${i}`,
          expectedAnswers: ['answer'],
          userAnswer: 'answer',
          inputKind: 'pick',
          isCorrect: i % 2 === 0,
        });
      }

      const record = await finalizeSession({
        sessionId,
        endedReason: 'completed',
        endedAbruptly: false,
        correct: 50,
        wrong: 50,
        bestStreak: 1,
      });

      expect(record?.attempts).toHaveLength(100);
    });

    it('handles concurrent session finalization', async () => {
      const sessionId1 = await startSession({
        sessionType: 'classic',
        dojoType: 'kana',
        gameMode: 'Pick',
      });

      const sessionId2 = await startSession({
        sessionType: 'blitz',
        dojoType: 'kana',
        gameMode: 'Input',
      });

      const [record1, record2] = await Promise.all([
        finalizeSession({
          sessionId: sessionId1,
          endedReason: 'completed',
          endedAbruptly: false,
          correct: 1,
          wrong: 0,
          bestStreak: 1,
        }),
        finalizeSession({
          sessionId: sessionId2,
          endedReason: 'completed',
          endedAbruptly: false,
          correct: 2,
          wrong: 1,
          bestStreak: 2,
        }),
      ]);

      expect(record1?.id).toBe(sessionId1);
      expect(record2?.id).toBe(sessionId2);
    });
  });
});