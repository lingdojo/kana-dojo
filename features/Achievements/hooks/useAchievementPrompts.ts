import { useStatsStore } from '@/features/Progress';
import { useCallback, useState } from 'react';
import useAchievementStore, { type Achievement } from '../store/useAchievementStore';

export interface AchievementPrompt {
  achievement: Achievement;
  progress: number;
  isUnlocked: boolean;
  nextMilestone?: number;
  context: string;
}

interface UseAchievementPromptsReturn {
  checkForAchievementProgress: (contentType: string, isCorrect: boolean) => void;
  recentPrompts: AchievementPrompt[];
  clearPrompts: () => void;
}

/**
 * Enhanced achievement system that provides contextual prompts
 * when users answer questions correctly, showing progress toward achievements
 */
export const useAchievementPrompts = (): UseAchievementPromptsReturn => {
  const [recentPrompts, setRecentPrompts] = useState<AchievementPrompt[]>([]);
  const achievementStore = useAchievementStore();
  const stats = useStatsStore();

  // Get relevant achievements based on content type
  const getRelevantAchievements = useCallback((contentType: string): Achievement[] => {
    const allAchievements = achievementStore.getAchievementsByCategory(
      contentType === 'hiragana' || contentType === 'katakana' ? 'kana' :
        contentType === 'kanji' ? 'kanji' :
          contentType === 'vocabulary' ? 'vocabulary' : 'milestone'
    );

    // Also include streak and milestone achievements
    const streakAchievements = achievementStore.getAchievementsByCategory('streak');
    const milestoneAchievements = achievementStore.getAchievementsByCategory('milestone');

    return [...allAchievements, ...streakAchievements, ...milestoneAchievements]
      .filter(achievement => !achievementStore.unlockedAchievements[achievement.id]);
  }, [achievementStore]);

  // Calculate progress for a specific achievement
  const calculateProgress = useCallback((achievement: Achievement, stats: any): number => {
    const { type, value, additional } = achievement.requirements;

    switch (type) {
      case 'total_correct':
        return Math.min((stats.allTimeStats.totalCorrect / value) * 100, 100);

      case 'streak':
        return Math.min((stats.currentStreak / value) * 100, 100);

      case 'content_correct':
        if (additional?.contentType === 'hiragana') {
          return Math.min((stats.allTimeStats.hiraganaCorrect / value) * 100, 100);
        } else if (additional?.contentType === 'katakana') {
          return Math.min((stats.allTimeStats.katakanaCorrect / value) * 100, 100);
        } else if (additional?.contentType === 'kanji') {
          return Math.min((stats.allTimeStats.kanjiCorrect / value) * 100, 100);
        } else if (additional?.contentType === 'vocabulary') {
          return Math.min((stats.allTimeStats.vocabularyCorrect / value) * 100, 100);
        }
        return 0;

      case 'accuracy':
        const accuracy = stats.allTimeStats.totalCorrect /
          (stats.allTimeStats.totalCorrect + stats.allTimeStats.totalIncorrect) * 100;
        const minAnswers = additional?.minAnswers || 50;
        const totalAnswers = stats.allTimeStats.totalCorrect + stats.allTimeStats.totalIncorrect;
        if (totalAnswers < minAnswers) return (totalAnswers / minAnswers) * 50;
        return Math.min((accuracy / value) * 100, 100);

      case 'sessions':
        return Math.min((stats.allTimeStats.sessionsCompleted / value) * 100, 100);

      default:
        return 0;
    }
  }, []);

  // Generate contextual message for achievement progress
  const generateContext = useCallback((achievement: Achievement, progress: number): string => {
    if (progress >= 100) return "Achievement Unlocked! ";

    const { type, value } = achievement.requirements;

    switch (type) {
      case 'total_correct':
        const current = stats.allTimeStats.totalCorrect;
        return `${current}/${value} correct answers - `;

      case 'streak':
        const streak = stats.currentStreak;
        return `${streak}/${value} streak - `;

      case 'content_correct':
        if (achievement.requirements.additional?.contentType === 'hiragana') {
          const hiragana = stats.allTimeStats.hiraganaCorrect;
          return `${hiragana}/${value} Hiragana correct - `;
        } else if (achievement.requirements.additional?.contentType === 'katakana') {
          const katakana = stats.allTimeStats.katakanaCorrect;
          return `${katakana}/${value} Katakana correct - `;
        }
        return `Progress: ${Math.round(progress)}% - `;

      case 'accuracy':
        const accuracy = stats.allTimeStats.totalCorrect /
          (stats.allTimeStats.totalCorrect + stats.allTimeStats.totalIncorrect) * 100;
        return `${accuracy.toFixed(1)}% accuracy - `;

      default:
        return `${Math.round(progress)}% complete - `;
    }
  }, [stats]);

  // Check for achievement progress and generate prompts
  const checkForAchievementProgress = useCallback((contentType: string, isCorrect: boolean) => {
    if (!isCorrect) return;

    const relevantAchievements = getRelevantAchievements(contentType);
    const newPrompts: AchievementPrompt[] = [];

    relevantAchievements.forEach(achievement => {
      const progress = calculateProgress(achievement, stats);

      // Only show progress for achievements that are > 20% complete and < 100% complete
      if (progress > 20 && progress < 100) {
        // Check if this is a milestone (25%, 50%, 75%, 90%)
        const milestones = [25, 50, 75, 90];
        const isMilestone = milestones.some(milestone =>
          progress >= milestone && progress < milestone + 5
        );

        if (isMilestone) {
          const context = generateContext(achievement, progress);

          newPrompts.push({
            achievement,
            progress,
            isUnlocked: false,
            context,
            nextMilestone: milestones.find(m => m > progress) || 100
          });
        }
      }
    });

    // Check for newly unlocked achievements
    const newlyUnlocked = achievementStore.checkAchievements(stats);

    newlyUnlocked.forEach(achievement => {
      const context = generateContext(achievement, 100);
      newPrompts.push({
        achievement,
        progress: 100,
        isUnlocked: true,
        context
      });
    });

    if (newPrompts.length > 0) {
      setRecentPrompts(prev => [...newPrompts, ...prev].slice(0, 3)); // Keep max 3 recent prompts
    }
  }, [getRelevantAchievements, calculateProgress, stats, generateContext, achievementStore]);

  const clearPrompts = useCallback(() => {
    setRecentPrompts([]);
  }, []);

  return {
    checkForAchievementProgress,
    recentPrompts,
    clearPrompts
  };
};

export default useAchievementPrompts;
