'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import useStatsStore from '../store/useStatsStore';
import useVisitStore from '../store/useVisitStore';
import useAchievementStore, {
  ACHIEVEMENTS,
} from '@/features/Achievements/store/useAchievementStore';
import { getOverallStats } from '@/shared/utils/gauntletStats';
import { classifyCharacter } from '../lib/classifyCharacter';
import { detectContentType } from '../lib/detectContentType';
import { calculateAccuracy } from '../lib/calculateAccuracy';
import type {
  AggregatedStats,
  CharacterMasteryItem,
  TimedModeStats,
  GauntletOverallStats,
  MasteryDistribution,
  ContentFilter,
} from '../types/stats';

/**
 * Loading state for the stats aggregator
 */
export interface StatsAggregatorState {
  /** Aggregated stats data */
  stats: AggregatedStats;
  /** Whether gauntlet stats are still loading */
  isLoading: boolean;
  /** Any error that occurred during loading */
  error: string | null;
  /** Refresh gauntlet stats */
  refreshGauntletStats: () => Promise<void>;
}

/**
 * Creates default timed mode stats
 */
function createDefaultTimedStats(): TimedModeStats {
  return {
    correct: 0,
    wrong: 0,
    streak: 0,
    bestStreak: 0,
    accuracy: 0,
  };
}

/**
 * Creates default mastery distribution
 */
function createDefaultMasteryDistribution(): MasteryDistribution {
  return {
    mastered: 0,
    learning: 0,
    needsPractice: 0,
    total: 0,
  };
}

/**
 * Creates default aggregated stats
 */
function createDefaultStats(): AggregatedStats {
  return {
    totalSessions: 0,
    totalCorrect: 0,
    totalIncorrect: 0,
    overallAccuracy: 0,
    bestStreak: 0,
    uniqueCharactersLearned: 0,
    characterMastery: [],
    masteryDistribution: createDefaultMasteryDistribution(),
    timedKana: createDefaultTimedStats(),
    timedKanji: createDefaultTimedStats(),
    timedVocabulary: createDefaultTimedStats(),
    gauntlet: null,
    achievements: {
      totalPoints: 0,
      level: 1,
      unlockedCount: 0,
      totalAchievements: ACHIEVEMENTS.length,
    },
  };
}

/**
 * Calculates mastery distribution from character mastery items
 */
export function calculateMasteryDistribution(
  items: CharacterMasteryItem[],
): MasteryDistribution {
  const distribution: MasteryDistribution = {
    mastered: 0,
    learning: 0,
    needsPractice: 0,
    total: items.length,
  };

  for (const item of items) {
    switch (item.masteryLevel) {
      case 'mastered':
        distribution.mastered++;
        break;
      case 'learning':
        distribution.learning++;
        break;
      case 'needs-practice':
        distribution.needsPractice++;
        break;
    }
  }

  return distribution;
}

/**
 * Transforms raw character mastery data into CharacterMasteryItem array
 */
function transformCharacterMastery(
  rawMastery: Record<string, { correct: number; incorrect: number }>,
): CharacterMasteryItem[] {
  return Object.entries(rawMastery).map(([character, data]) => {
    const total = data.correct + data.incorrect;
    const accuracy = calculateAccuracy(data.correct, data.incorrect);
    const masteryLevel = classifyCharacter(data.correct, data.incorrect);
    const contentType = detectContentType(character);

    return {
      character,
      correct: data.correct,
      incorrect: data.incorrect,
      total,
      accuracy,
      masteryLevel,
      contentType,
    };
  });
}

/**
 * Loads and aggregates gauntlet stats from all content types
 */
async function loadGauntletStats(): Promise<GauntletOverallStats | null> {
  try {
    const [kanaStats, kanjiStats, vocabStats] = await Promise.all([
      getOverallStats('kana'),
      getOverallStats('kanji'),
      getOverallStats('vocabulary'),
    ]);

    const totalSessions =
      kanaStats.totalSessions +
      kanjiStats.totalSessions +
      vocabStats.totalSessions;

    // If no sessions, return null
    if (totalSessions === 0) {
      return null;
    }

    const completedSessions =
      kanaStats.completedSessions +
      kanjiStats.completedSessions +
      vocabStats.completedSessions;

    const totalCorrect =
      kanaStats.totalCorrect +
      kanjiStats.totalCorrect +
      vocabStats.totalCorrect;

    const totalWrong =
      kanaStats.totalWrong + kanjiStats.totalWrong + vocabStats.totalWrong;

    const bestStreak = Math.max(
      kanaStats.bestStreak,
      kanjiStats.bestStreak,
      vocabStats.bestStreak,
    );

    // Find fastest time across all types (only from completed runs)
    const fastestTimes = [
      kanaStats.fastestTime,
      kanjiStats.fastestTime,
      vocabStats.fastestTime,
    ].filter((t): t is number => t !== null);

    const fastestTime =
      fastestTimes.length > 0 ? Math.min(...fastestTimes) : null;

    const completionRate =
      totalSessions > 0 ? (completedSessions / totalSessions) * 100 : 0;

    const accuracy = calculateAccuracy(totalCorrect, totalWrong);

    return {
      totalSessions,
      completedSessions,
      completionRate,
      totalCorrect,
      totalWrong,
      bestStreak,
      fastestTime,
      accuracy,
    };
  } catch (error) {
    console.warn('[useStatsAggregator] Failed to load gauntlet stats:', error);
    return null;
  }
}

/**
 * Hook that aggregates statistics from multiple stores into a unified format.
 *
 * Combines data from:
 * - useStatsStore: Core session and character mastery data
 * - useVisitStore: Visit streak data
 * - useAchievementStore: Achievement progress
 * - Gauntlet stats from localforage (loaded asynchronously)
 *
 * @returns Aggregated stats with loading state
 */
export function useStatsAggregator(): StatsAggregatorState {
  const [gauntletStats, setGauntletStats] =
    useState<GauntletOverallStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Get data from stores
  const allTimeStats = useStatsStore(state => state.allTimeStats);
  const timedKanaCorrect = useStatsStore(state => state.timedCorrectAnswers);
  const timedKanaWrong = useStatsStore(state => state.timedWrongAnswers);
  const timedKanaStreak = useStatsStore(state => state.timedStreak);
  const timedKanaBestStreak = useStatsStore(state => state.timedBestStreak);
  const timedKanjiCorrect = useStatsStore(
    state => state.timedKanjiCorrectAnswers,
  );
  const timedKanjiWrong = useStatsStore(state => state.timedKanjiWrongAnswers);
  const timedKanjiStreak = useStatsStore(state => state.timedKanjiStreak);
  const timedKanjiBestStreak = useStatsStore(
    state => state.timedKanjiBestStreak,
  );
  const timedVocabCorrect = useStatsStore(
    state => state.timedVocabCorrectAnswers,
  );
  const timedVocabWrong = useStatsStore(state => state.timedVocabWrongAnswers);
  const timedVocabStreak = useStatsStore(state => state.timedVocabStreak);
  const timedVocabBestStreak = useStatsStore(
    state => state.timedVocabBestStreak,
  );

  const achievementPoints = useAchievementStore(state => state.totalPoints);
  const achievementLevel = useAchievementStore(state => state.level);
  const unlockedAchievements = useAchievementStore(
    state => state.unlockedAchievements,
  );

  // Load gauntlet stats asynchronously
  const refreshGauntletStats = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const stats = await loadGauntletStats();
      setGauntletStats(stats);
    } catch (err) {
      setError('Failed to load gauntlet stats');
      console.error('[useStatsAggregator] Error loading gauntlet stats:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshGauntletStats();
  }, [refreshGauntletStats]);

  // Memoize character mastery transformation
  const characterMastery = useMemo(
    () => transformCharacterMastery(allTimeStats.characterMastery),
    [allTimeStats.characterMastery],
  );

  // Memoize mastery distribution calculation
  const masteryDistribution = useMemo(
    () => calculateMasteryDistribution(characterMastery),
    [characterMastery],
  );

  // Memoize timed stats
  const timedKana: TimedModeStats = useMemo(
    () => ({
      correct: timedKanaCorrect,
      wrong: timedKanaWrong,
      streak: timedKanaStreak,
      bestStreak: timedKanaBestStreak,
      accuracy: calculateAccuracy(timedKanaCorrect, timedKanaWrong),
    }),
    [timedKanaCorrect, timedKanaWrong, timedKanaStreak, timedKanaBestStreak],
  );

  const timedKanji: TimedModeStats = useMemo(
    () => ({
      correct: timedKanjiCorrect,
      wrong: timedKanjiWrong,
      streak: timedKanjiStreak,
      bestStreak: timedKanjiBestStreak,
      accuracy: calculateAccuracy(timedKanjiCorrect, timedKanjiWrong),
    }),
    [
      timedKanjiCorrect,
      timedKanjiWrong,
      timedKanjiStreak,
      timedKanjiBestStreak,
    ],
  );

  const timedVocabulary: TimedModeStats = useMemo(
    () => ({
      correct: timedVocabCorrect,
      wrong: timedVocabWrong,
      streak: timedVocabStreak,
      bestStreak: timedVocabBestStreak,
      accuracy: calculateAccuracy(timedVocabCorrect, timedVocabWrong),
    }),
    [
      timedVocabCorrect,
      timedVocabWrong,
      timedVocabStreak,
      timedVocabBestStreak,
    ],
  );

  // Memoize the final aggregated stats
  const stats: AggregatedStats = useMemo(() => {
    const overallAccuracy = calculateAccuracy(
      allTimeStats.totalCorrect,
      allTimeStats.totalIncorrect,
    );

    return {
      // Overview
      totalSessions: allTimeStats.totalSessions,
      totalCorrect: allTimeStats.totalCorrect,
      totalIncorrect: allTimeStats.totalIncorrect,
      overallAccuracy,
      bestStreak: allTimeStats.bestStreak,
      uniqueCharactersLearned: characterMastery.length,

      // Character mastery
      characterMastery,
      masteryDistribution,

      // Timed mode
      timedKana,
      timedKanji,
      timedVocabulary,

      // Gauntlet
      gauntlet: gauntletStats,

      // Achievements
      achievements: {
        totalPoints: achievementPoints,
        level: achievementLevel,
        unlockedCount: Object.keys(unlockedAchievements).length,
        totalAchievements: ACHIEVEMENTS.length,
      },
    };
  }, [
    allTimeStats,
    characterMastery,
    masteryDistribution,
    timedKana,
    timedKanji,
    timedVocabulary,
    gauntletStats,
    achievementPoints,
    achievementLevel,
    unlockedAchievements,
  ]);

  return {
    stats,
    isLoading,
    error,
    refreshGauntletStats,
  };
}

/**
 * Filters character mastery items by content type
 */
export function filterCharacterMasteryByType(
  items: CharacterMasteryItem[],
  filter: ContentFilter,
): CharacterMasteryItem[] {
  if (filter === 'all') {
    return items;
  }
  return items.filter(item => item.contentType === filter);
}

/**
 * Gets top N most difficult characters (lowest accuracy with sufficient attempts)
 */
export function getTopDifficultCharacters(
  items: CharacterMasteryItem[],
  count: number = 5,
  minAttempts: number = 5,
): CharacterMasteryItem[] {
  return items
    .filter(item => item.total >= minAttempts)
    .sort((a, b) => a.accuracy - b.accuracy)
    .slice(0, count);
}

/**
 * Gets top N best mastered characters (highest accuracy meeting mastery criteria)
 */
export function getTopMasteredCharacters(
  items: CharacterMasteryItem[],
  count: number = 5,
): CharacterMasteryItem[] {
  return items
    .filter(item => item.masteryLevel === 'mastered')
    .sort((a, b) => b.accuracy - a.accuracy)
    .slice(0, count);
}

export default useStatsAggregator;

