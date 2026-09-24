'use client';

import { useEffect } from 'react';
import { statsApi, statsEvents } from '@/shared/events';
import type { StatEvent } from '@/shared/events';
import useStatsStore from '../store/useStatsStore';
import { useAchievementPrompts } from '@/features/Achievements/hooks/useAchievementPrompts';

/**
 * Game Stats Facade - Public API for stat tracking
 *
 * This facade decouples game components from the internal Progress store.
 * Games emit events; this facade subscribes and updates the store.
 */

export interface GameStats {
  correctAnswers: number;
  wrongAnswers: number;
  currentStreak: number;
  bestStreak: number;
  totalSessions: number;
}

export interface GameStatsActions {
  recordCorrect: typeof statsApi.recordCorrect;
  recordIncorrect: typeof statsApi.recordIncorrect;
  recordSessionComplete: typeof statsApi.recordSessionComplete;
  getStats: () => GameStats;
  resetSessionStats: () => void;
}

/**
 * Hook for game components to track stats
 *
 * @example
 * const stats = useGameStats();
 * stats.recordCorrect('kana', 'あ');
 */
export function useGameStats(): GameStatsActions {
  const store = useStatsStore();
  const { checkForAchievementProgress } = useAchievementPrompts();

  // Subscribe to stat events and update store
  useEffect(() => {
    const unsubCorrect = statsEvents.subscribe(
      'correct',
      (event: StatEvent) => {
        store.incrementCorrectAnswers();

        const contentType = event.contentType || 'general';

        // Content-specific tracking so vocabulary Input/Reverse-Input modes are
        // counted like MCQ/Tiles (which call incrementVocabularyCorrect directly).
        if (contentType === 'vocabulary') {
          store.incrementVocabularyCorrect();
        }

        // Feed answer-time metadata (emitted by vocab Input) into speed tracking,
        // matching the direct-hook game modes.
        if (event.metadata?.timeTaken !== undefined) {
          store.recordAnswerTime(event.metadata.timeTaken);
        }

        // Update character history based on content type
        if (event.character) {
          store.addCharacterToHistory(event.character);
          store.incrementCharacterScore(event.character, 'correct');
        }

        // Trigger achievement progress check for correct answers
        checkForAchievementProgress(contentType, true);
      },
    );

    const unsubIncorrect = statsEvents.subscribe(
      'incorrect',
      (event: StatEvent) => {
        store.incrementWrongAnswers();
        // Update character history based on content type
        if (event.character) {
          store.addCharacterToHistory(event.character);
          store.incrementCharacterScore(event.character, 'wrong');
        }
      },
    );

    const unsubSession = statsEvents.subscribe('session_complete', () => {
      store.saveSession();
    });

    return () => {
      unsubCorrect();
      unsubIncorrect();
      unsubSession();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [store]);

  return {
    recordCorrect: statsApi.recordCorrect,
    recordIncorrect: statsApi.recordIncorrect,
    recordSessionComplete: statsApi.recordSessionComplete,
    getStats: () => ({
      correctAnswers: store.numCorrectAnswers,
      wrongAnswers: store.numWrongAnswers,
      currentStreak: store.currentStreak,
      bestStreak: store.allTimeStats.bestStreak,
      totalSessions: store.allTimeStats.totalSessions,
    }),
    resetSessionStats: store.resetStats,
  };
}
