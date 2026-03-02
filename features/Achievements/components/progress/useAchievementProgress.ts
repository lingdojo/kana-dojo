import { useState, useCallback, useMemo } from 'react';
import useAchievementStore, {
  ACHIEVEMENTS,
} from '@/features/Achievements/store/useAchievementStore';
import { useStatsStore } from '@/features/Progress';
import { useClick } from '@/shared/hooks/useAudio';
import { useShallow } from 'zustand/react/shallow';
import { CategoryId } from './constants';

// Create achievement lookup map once at module level for O(1) access
const ACHIEVEMENT_MAP = new Map(ACHIEVEMENTS.map(a => [a.id, a]));

export interface AchievementProgressData {
  current: number;
  target: number;
  isPercentage: boolean;
  completionPercentage: number;
}

/**
 * Custom hook for AchievementProgress component logic
 * Encapsulates state management and utility functions
 */
export const useAchievementProgress = () => {
  const { playClick } = useClick();
  const [selectedCategory, setSelectedCategory] = useState<CategoryId>('all');

  // Optimize Zustand selectors - combine multiple selectors into one using useShallow
  const { unlockedAchievements, totalPoints, level } = useAchievementStore(
    useShallow(state => ({
      unlockedAchievements: state.unlockedAchievements,
      totalPoints: state.totalPoints,
      level: state.level,
    })),
  );
  const stats = useStatsStore();

  /**
   * Calculate achievement progress percentage based on current stats
   * Optimized with O(1) Map lookup instead of O(n) array find
   */
  const getAchievementProgress = useCallback(
    (achievementId: string): AchievementProgressData => {
      const achievement = ACHIEVEMENT_MAP.get(achievementId);
      if (!achievement)
        return {
          current: 0,
          target: 1,
          isPercentage: true,
          completionPercentage: 0,
        };

      let current = 0;
      let target = achievement.requirements.value;
      let isPercentage = false;

      const { type, additional } = achievement.requirements;
      const allTimeStats = stats.allTimeStats;

      switch (type) {
        case 'total_correct':
          current = allTimeStats.totalCorrect;
          break;
        case 'total_incorrect':
          current = allTimeStats.totalIncorrect;
          break;
        case 'streak': {
          if (additional?.gameMode === 'gauntlet')
            current = allTimeStats.gauntletStats?.bestStreak ?? 0;
          else if (additional?.gameMode === 'blitz')
            current = allTimeStats.blitzStats?.bestStreak ?? 0;
          else current = allTimeStats.bestStreak;
          break;
        }
        case 'sessions':
          current = allTimeStats.totalSessions;
          break;
        case 'accuracy': {
          const totalAnswers =
            allTimeStats.totalCorrect + allTimeStats.totalIncorrect;
          current =
            totalAnswers > 0
              ? (allTimeStats.totalCorrect / totalAnswers) * 100
              : 0;
          isPercentage = true;
          break;
        }
        case 'content_correct': {
          const contentType = additional?.contentType;
          if (contentType === 'hiragana')
            current = allTimeStats.hiraganaCorrect ?? 0;
          else if (contentType === 'katakana')
            current = allTimeStats.katakanaCorrect ?? 0;
          else if (contentType === 'vocabulary')
            current = allTimeStats.vocabularyCorrect ?? 0;
          else if (contentType === 'kanji') {
            const jpLevel = additional?.jlptLevel;
            if (jpLevel && allTimeStats.kanjiCorrectByLevel) {
              current = allTimeStats.kanjiCorrectByLevel[jpLevel] ?? 0;
            } else {
              current = Object.values(
                allTimeStats.kanjiCorrectByLevel ?? {},
              ).reduce((a, b) => a + b, 0);
            }
          }
          break;
        }
        case 'content_mastery': {
          const contentType = additional?.contentType;
          const targetAccuracy = target;

          let entries = Object.entries(allTimeStats.characterMastery ?? {});
          let relevantEntries: Array<
            [string, { correct: number; incorrect: number }]
          > = [];

          if (
            contentType === 'vocabulary' &&
            additional?.minAnswers !== undefined
          ) {
            relevantEntries = entries.filter(([key]) => key.length !== 1);
            let masteredCount = 0;
            for (const [, s] of relevantEntries) {
              const tot = s.correct + s.incorrect;
              if (tot > 0 && (s.correct / tot) * 100 >= targetAccuracy)
                masteredCount++;
            }
            current = masteredCount;
            target = additional.minAnswers;
          } else {
            isPercentage = true;
            current = 0;
          }
          break;
        }
        case 'gauntlet_completion':
          current = allTimeStats.gauntletStats?.completedRuns ?? 0;
          break;
        case 'gauntlet_difficulty':
          if (additional?.difficulty === 'normal')
            current = allTimeStats.gauntletStats?.normalCompleted ?? 0;
          else if (additional?.difficulty === 'hard')
            current = allTimeStats.gauntletStats?.hardCompleted ?? 0;
          else if (additional?.difficulty === 'instant-death')
            current = allTimeStats.gauntletStats?.instantDeathCompleted ?? 0;
          break;
        case 'gauntlet_perfect':
          current = allTimeStats.gauntletStats?.perfectRuns ?? 0;
          break;
        case 'gauntlet_lives':
          if (additional?.type === 'lives_regenerated')
            current = allTimeStats.gauntletStats?.livesRegenerated ?? 0;
          else if (additional?.type === 'no_lives_lost') {
            current = allTimeStats.gauntletStats?.noDeathRuns ?? 0;
            target = 1;
          }
          break;
        case 'blitz_session':
          current = allTimeStats.blitzStats?.totalSessions ?? 0;
          break;
        case 'blitz_score':
          current = allTimeStats.blitzStats?.bestSessionScore ?? 0;
          break;
        case 'speed': {
          isPercentage = true;
          current = 0;
          break;
        }
        case 'variety': {
          if (additional?.dojos)
            current = (allTimeStats.dojosUsed ?? []).filter(d =>
              additional.dojos!.includes(d),
            ).length;
          else if (additional?.modes)
            current = (allTimeStats.modesUsed ?? []).filter(m =>
              additional.modes!.includes(m),
            ).length;
          else if (additional?.challengeModes)
            current = (allTimeStats.challengeModesUsed ?? []).filter(c =>
              additional.challengeModes!.includes(c),
            ).length;
          break;
        }
        case 'days_trained':
          current = allTimeStats.trainingDays?.length ?? 0;
          break;
        case 'total_points':
          current = totalPoints;
          break;
        case 'achievement_count':
          current = Object.keys(unlockedAchievements).length;
          if (target === -1) target = ACHIEVEMENTS.length - 1;
          break;
        default:
          current = 0;
      }

      const isUnlocked = !!unlockedAchievements[achievementId];
      if (isUnlocked) {
        current = Math.max(current, target);
      }
      current = Math.min(current, target);

      const completionPercentage =
        target > 0 ? Math.min((current / target) * 100, 100) : 100;

      return {
        current,
        target,
        isPercentage,
        completionPercentage,
      };
    },
    [stats.allTimeStats, totalPoints, unlockedAchievements],
  );

  /**
   * Filter achievements by selected category
   * Memoized to prevent recalculation on every render
   */
  const filteredAchievements = useMemo(
    () =>
      selectedCategory === 'all'
        ? ACHIEVEMENTS
        : ACHIEVEMENTS.filter(
            achievement => achievement.category === selectedCategory,
          ),
    [selectedCategory],
  );

  const unlockedCount = Object.keys(unlockedAchievements).length;
  const totalCount = ACHIEVEMENTS.length;
  const completionPercentage = (unlockedCount / totalCount) * 100;

  /**
   * Handle category selection with audio feedback
   */
  const handleCategorySelect = useCallback(
    (categoryId: CategoryId) => {
      playClick();
      setSelectedCategory(categoryId);
    },
    [playClick],
  );

  /**
   * Get stats for a specific category
   */
  const getCategoryStats = useCallback(
    (categoryId: string) => {
      const categoryAchievements =
        categoryId === 'all'
          ? ACHIEVEMENTS
          : ACHIEVEMENTS.filter(a => a.category === categoryId);
      const categoryUnlocked = categoryAchievements.filter(
        a => unlockedAchievements[a.id],
      ).length;
      return { total: categoryAchievements.length, unlocked: categoryUnlocked };
    },
    [unlockedAchievements],
  );

  return {
    // State
    selectedCategory,
    unlockedAchievements,
    totalPoints,
    level,
    filteredAchievements,
    unlockedCount,
    totalCount,
    completionPercentage,

    // Actions
    handleCategorySelect,
    getAchievementProgress,
    getCategoryStats,
  };
};
