import { useEffect, useCallback } from 'react';
import useAchievementStore, {
  type Achievement
} from '../store/useAchievementStore';
import useStatsStore from '@/features/Progress/store/useStatsStore';

interface UseAchievementsReturn {
  checkForNewAchievements: () => Achievement[];
  totalPoints: number;
  level: number;
  unlockedCount: number;
  hasUnseenNotifications: boolean;
}

/**
 * Hook to integrate achievements with the game flow
 * Automatically checks for new achievements when stats change
 */
export const useAchievements = (): UseAchievementsReturn => {
  const stats = useStatsStore();
  const achievementStore = useAchievementStore();

  // Check for new achievements based on current stats
  const checkForNewAchievements = useCallback(() => {
    return achievementStore.checkAchievements(stats);
  }, [stats, achievementStore]);

  // Auto-check achievements when relevant stats change
  useEffect(() => {
    checkForNewAchievements();
  }, [
    stats.allTimeStats.totalCorrect,
    stats.allTimeStats.bestStreak,
    stats.allTimeStats.totalSessions,
    checkForNewAchievements
  ]);

  const unlockedCount = Object.keys(
    achievementStore.unlockedAchievements
  ).length;
  const hasUnseenNotifications = useAchievementStore(
    state => state.hasUnseenNotifications
  );

  return {
    checkForNewAchievements,
    totalPoints: achievementStore.totalPoints,
    level: achievementStore.level,
    unlockedCount,
    hasUnseenNotifications
  };
};

/**
 * Hook specifically for triggering achievement checks after game actions
 */
export const useAchievementTrigger = () => {
  const achievementStore = useAchievementStore();
  const stats = useStatsStore();

  const triggerAchievementCheck = useCallback(() => {
    const newAchievements = achievementStore.checkAchievements(stats);
    return newAchievements;
  }, [achievementStore, stats]);

  return { triggerAchievementCheck };
};

export default useAchievements;
