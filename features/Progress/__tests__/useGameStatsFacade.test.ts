import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { statsApi } from '@/shared/events';
import useStatsStore from '../store/useStatsStore';
import { useGameStats } from '../facade/useGameStats';

// The facade wires achievement prompts, which transitively pull in the
// Progress barrel and next-intl routing — mock it to keep this test focused.
vi.mock('@/features/Achievements/hooks/useAchievementPrompts', () => ({
  useAchievementPrompts: () => ({
    checkForAchievementProgress: vi.fn(),
    recentPrompts: [],
    clearPrompts: vi.fn(),
  }),
}));

describe('useGameStats facade — correct-answer stat tracking', () => {
  beforeEach(() => {
    // Reset the store to a clean state (persist layer is bypassed for tests).
    useStatsStore.setState({
      numCorrectAnswers: 0,
      numWrongAnswers: 0,
      currentStreak: 0,
      allTimeStats: {
        totalSessions: 0,
        totalCorrect: 0,
        totalIncorrect: 0,
        bestStreak: 0,
        characterMastery: {},
        hiraganaCorrect: 0,
        katakanaCorrect: 0,
        kanjiCorrectByLevel: {},
        vocabularyCorrect: 0,
        gauntletStats: {
          totalRuns: 0,
          completedRuns: 0,
          normalCompleted: 0,
          hardCompleted: 0,
          instantDeathCompleted: 0,
          perfectRuns: 0,
          noDeathRuns: 0,
          livesRegenerated: 0,
          bestStreak: 0,
        },
        blitzStats: {
          totalRuns: 0,
          bestRunScore: 0,
          bestRunAccuracy: 0,
          correctAnswers: 0,
          wrongAnswers: 0,
          bestStreak: 0,
        },
        fastestAnswerMs: Infinity,
        answerTimesMs: [],
        dojosUsed: [],
        modesUsed: [],
        challengeModesUsed: [],
        trainingDays: [],
        currentWrongStreak: 0,
        maxWrongStreak: 0,
      },
    });
  });

  it('increments vocabularyCorrect for vocabulary correct answers', () => {
    renderHook(() => useGameStats());

    act(() => {
      statsApi.recordCorrect('vocabulary', '食べる');
    });

    expect(useStatsStore.getState().allTimeStats.vocabularyCorrect).toBe(1);

    act(() => {
      statsApi.recordCorrect('vocabulary', '飲む');
    });

    expect(useStatsStore.getState().allTimeStats.vocabularyCorrect).toBe(2);
  });

  it('does not increment vocabularyCorrect for non-vocabulary content', () => {
    renderHook(() => useGameStats());

    act(() => {
      statsApi.recordCorrect('kana', 'あ');
      statsApi.recordCorrect('kanji', '日');
    });

    expect(useStatsStore.getState().allTimeStats.vocabularyCorrect).toBe(0);
  });

  it('records answer time metadata from vocabulary correct answers', () => {
    renderHook(() => useGameStats());

    act(() => {
      statsApi.recordCorrect('vocabulary', '食べる', { timeTaken: 1234 });
    });

    const allTimeStats = useStatsStore.getState().allTimeStats;
    expect(allTimeStats.fastestAnswerMs).toBe(1234);
    expect(allTimeStats.answerTimesMs).toContain(1234);
  });

  it('records the fastest answer time across multiple answers', () => {
    renderHook(() => useGameStats());

    act(() => {
      statsApi.recordCorrect('vocabulary', '食べる', { timeTaken: 2500 });
      statsApi.recordCorrect('vocabulary', '飲む', { timeTaken: 800 });
    });

    const allTimeStats = useStatsStore.getState().allTimeStats;
    expect(allTimeStats.fastestAnswerMs).toBe(800);
    expect(allTimeStats.answerTimesMs).toContain(2500);
    expect(allTimeStats.answerTimesMs).toContain(800);
  });
});
