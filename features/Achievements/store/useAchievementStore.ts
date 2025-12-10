import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type AchievementRarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  rarity: AchievementRarity;
  points: number;
  unlockedAt?: Date;
  category: 'streak' | 'milestone' | 'consistency' | 'mastery' | 'exploration';
  requirements: {
    type: 'streak' | 'total_correct' | 'sessions' | 'accuracy' | 'character_mastery' | 'dojo_completion';
    value: number;
    additional?: Record<string, unknown>;
  };
  rewards?: {
    themes?: string[];
    fonts?: string[];
    customization?: string[];
  };
}

export interface AchievementNotification {
  id: string;
  achievement: Achievement;
  timestamp: Date;
  seen: boolean;
}

interface AchievementState {
  // Achievement data
  unlockedAchievements: Record<string, Achievement>;
  notifications: AchievementNotification[];
  
  // Computed properties to avoid filter operations
  unseenNotifications: AchievementNotification[];
  hasUnseenNotifications: boolean;
  
  // Achievement points and level system
  totalPoints: number;
  level: number;
  
  // Actions
  unlockAchievement: (achievement: Achievement) => void;
  markNotificationSeen: (notificationId: string) => void;
  clearAllNotifications: () => void;
  checkAchievements: (stats: unknown) => Achievement[];
  
  // Internal method to update computed properties
  updateComputedProperties: () => void;
  
  // Getters
  getAchievementsByCategory: (category: Achievement['category']) => Achievement[];
}

// Achievement definitions
export const ACHIEVEMENTS: Achievement[] = [
  // Streak Achievements
  {
    id: 'first_steps',
    title: 'First Steps',
    description: 'Get your first correct answer',
    icon: '🎯',
    rarity: 'common',
    points: 10,
    category: 'milestone',
    requirements: { type: 'total_correct', value: 1 }
  },
  {
    id: 'streak_starter',
    title: 'Streak Starter',
    description: 'Achieve a 5-answer streak',
    icon: '🔥',
    rarity: 'common',
    points: 25,
    category: 'streak',
    requirements: { type: 'streak', value: 5 }
  },
  {
    id: 'hot_streak',
    title: 'Hot Streak',
    description: 'Achieve a 10-answer streak',
    icon: '🌟',
    rarity: 'uncommon',
    points: 50,
    category: 'streak',
    requirements: { type: 'streak', value: 10 }
  },
  {
    id: 'streak_legend',
    title: 'Streak Legend',
    description: 'Achieve a 25-answer streak',
    icon: '⚡',
    rarity: 'rare',
    points: 150,
    category: 'streak',
    requirements: { type: 'streak', value: 25 }
  },
  {
    id: 'unstoppable',
    title: 'Unstoppable',
    description: 'Achieve a 50-answer streak',
    icon: '🚀',
    rarity: 'epic',
    points: 300,
    category: 'streak',
    requirements: { type: 'streak', value: 50 }
  },
  
  // Milestone Achievements
  {
    id: 'century_scholar',
    title: 'Century Scholar',
    description: 'Answer 100 questions correctly',
    icon: '📚',
    rarity: 'uncommon',
    points: 100,
    category: 'milestone',
    requirements: { type: 'total_correct', value: 100 }
  },
  {
    id: 'knowledge_seeker',
    title: 'Knowledge Seeker',
    description: 'Answer 500 questions correctly',
    icon: '🎓',
    rarity: 'rare',
    points: 250,
    category: 'milestone',
    requirements: { type: 'total_correct', value: 500 }
  },
  {
    id: 'master_scholar',
    title: 'Master Scholar',
    description: 'Answer 1000 questions correctly',
    icon: '👑',
    rarity: 'epic',
    points: 500,
    category: 'milestone',
    requirements: { type: 'total_correct', value: 1000 }
  },
  {
    id: 'legendary_master',
    title: 'Legendary Master',
    description: 'Answer 5000 questions correctly',
    icon: '🏆',
    rarity: 'legendary',
    points: 1000,
    category: 'milestone',
    requirements: { type: 'total_correct', value: 5000 }
  },
  
  // Consistency Achievements
  {
    id: 'dedicated_learner',
    title: 'Dedicated Learner',
    description: 'Complete 10 training sessions',
    icon: '📖',
    rarity: 'common',
    points: 75,
    category: 'consistency',
    requirements: { type: 'sessions', value: 10 }
  },
  {
    id: 'persistent_student',
    title: 'Persistent Student',
    description: 'Complete 50 training sessions',
    icon: '🎯',
    rarity: 'uncommon',
    points: 200,
    category: 'consistency',
    requirements: { type: 'sessions', value: 50 }
  },
  {
    id: 'training_master',
    title: 'Training Master',
    description: 'Complete 100 training sessions',
    icon: '🥋',
    rarity: 'rare',
    points: 400,
    category: 'consistency',
    requirements: { type: 'sessions', value: 100 }
  },
  
  // Accuracy Achievements
  {
    id: 'precision_novice',
    title: 'Precision Novice',
    description: 'Maintain 80% accuracy over 50 answers',
    icon: '🎯',
    rarity: 'uncommon',
    points: 100,
    category: 'mastery',
    requirements: { 
      type: 'accuracy', 
      value: 80,
      additional: { minAnswers: 50 }
    }
  },
  {
    id: 'accuracy_expert',
    title: 'Accuracy Expert',
    description: 'Maintain 90% accuracy over 100 answers',
    icon: '🏹',
    rarity: 'rare',
    points: 250,
    category: 'mastery',
    requirements: { 
      type: 'accuracy', 
      value: 90,
      additional: { minAnswers: 100 }
    }
  },
  {
    id: 'perfectionist',
    title: 'Perfectionist',
    description: 'Maintain 95% accuracy over 200 answers',
    icon: '💎',
    rarity: 'epic',
    points: 500,
    category: 'mastery',
    requirements: { 
      type: 'accuracy', 
      value: 95,
      additional: { minAnswers: 200 }
    }
  }
];

const useAchievementStore = create<AchievementState>()(
  persist(
    (set, get) => ({
      unlockedAchievements: {},
      notifications: [],
      unseenNotifications: [],
      hasUnseenNotifications: false,
      totalPoints: 0,
      level: 1,

      updateComputedProperties: () => {
        const state = get();
        const unseenNotifications = state.notifications.filter(n => !n.seen);
        set({
          unseenNotifications,
          hasUnseenNotifications: unseenNotifications.length > 0
        });
      },

      unlockAchievement: (achievement: Achievement) => {
        const state = get();
        if (state.unlockedAchievements[achievement.id]) return;

        const unlockedAchievement = {
          ...achievement,
          unlockedAt: new Date()
        };

        const notification: AchievementNotification = {
          id: `${achievement.id}-${Date.now()}`,
          achievement: unlockedAchievement,
          timestamp: new Date(),
          seen: false
        };

        const newTotalPoints = state.totalPoints + achievement.points;
        const newLevel = Math.floor(newTotalPoints / 500) + 1;

        set({
          unlockedAchievements: {
            ...state.unlockedAchievements,
            [achievement.id]: unlockedAchievement
          },
          notifications: [...state.notifications, notification],
          totalPoints: newTotalPoints,
          level: newLevel
        });
        
        // Update computed properties
        get().updateComputedProperties();
      },

      markNotificationSeen: (notificationId: string) => {
        set((state) => ({
          notifications: state.notifications.map(notification =>
            notification.id === notificationId
              ? { ...notification, seen: true }
              : notification
          )
        }));
        
        // Update computed properties
        get().updateComputedProperties();
      },

      clearAllNotifications: () => {
        set((state) => ({
          notifications: state.notifications.map(notification => ({
            ...notification,
            seen: true
          }))
        }));
        
        // Update computed properties
        get().updateComputedProperties();
      },

      checkAchievements: (stats: unknown) => {
        const state = get();
        const newlyUnlocked: Achievement[] = [];
        
        // Type guard for stats object
        const typedStats = stats as { allTimeStats?: { totalCorrect?: number; totalIncorrect?: number; bestStreak?: number; totalSessions?: number; characterMastery?: Record<string, { correct: number; incorrect: number }> } };
        if (!typedStats.allTimeStats) return newlyUnlocked;
        
        const allTimeStats = typedStats.allTimeStats;

        ACHIEVEMENTS.forEach(achievement => {
          if (state.unlockedAchievements[achievement.id]) return;

          let isUnlocked = false;

          switch (achievement.requirements.type) {
            case 'total_correct':
              isUnlocked = (allTimeStats.totalCorrect ?? 0) >= achievement.requirements.value;
              break;
            case 'streak':
              isUnlocked = (allTimeStats.bestStreak ?? 0) >= achievement.requirements.value;
              break;
            case 'sessions':
              isUnlocked = (allTimeStats.totalSessions ?? 0) >= achievement.requirements.value;
              break;
            case 'accuracy':
              const totalAnswers = (allTimeStats.totalCorrect ?? 0) + (allTimeStats.totalIncorrect ?? 0);
              const accuracy = totalAnswers > 0 ? ((allTimeStats.totalCorrect ?? 0) / totalAnswers) * 100 : 0;
              const minAnswers = (achievement.requirements.additional?.minAnswers as number | undefined) ?? 0;
              isUnlocked = totalAnswers >= minAnswers && accuracy >= achievement.requirements.value;
              break;
          }

          if (isUnlocked) {
            newlyUnlocked.push(achievement);
            get().unlockAchievement(achievement);
          }
        });

        return newlyUnlocked;
      },

      getAchievementsByCategory: (category: Achievement['category']) => {
        const state = get();
        return ACHIEVEMENTS.filter(achievement => achievement.category === category)
          .map(achievement => ({
            ...achievement,
            unlockedAt: state.unlockedAchievements[achievement.id]?.unlockedAt
          }));
      }
    }),
    {
      name: 'kanadojo-achievements',
      partialize: (state) => ({
        unlockedAchievements: state.unlockedAchievements,
        notifications: state.notifications,
        totalPoints: state.totalPoints,
        level: state.level
      })
    }
  )
);

export default useAchievementStore;