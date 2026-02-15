import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type AchievementRarity =
  | 'common'
  | 'uncommon'
  | 'rare'
  | 'epic'
  | 'legendary';

// Extended achievement categories including new content-specific and mode-specific categories
export type AchievementCategory =
  | 'streak'
  | 'milestone'
  | 'consistency'
  | 'mastery'
  | 'exploration'
  | 'kana'
  | 'kanji'
  | 'vocabulary'
  | 'gauntlet'
  | 'blitz'
  | 'speed'
  | 'fun';

// Extended requirement types for the expanded achievement system
export type AchievementRequirementType =
  // Existing types
  | 'streak'
  | 'total_correct'
  | 'total_incorrect'
  | 'sessions'
  | 'accuracy'
  | 'character_mastery'
  | 'dojo_completion'
  // New content-specific types
  | 'content_correct'
  | 'content_mastery'
  // New Gauntlet-specific types
  | 'gauntlet_completion'
  | 'gauntlet_difficulty'
  | 'gauntlet_perfect'
  | 'gauntlet_lives'
  // New Blitz-specific types
  | 'blitz_session'
  | 'blitz_score'
  // New time and speed types
  | 'speed'
  // New variety and exploration types
  | 'variety'
  | 'days_trained'
  | 'time_of_day'
  // New fun/secret achievement types
  | 'wrong_streak'
  | 'exact_count'
  | 'achievement_count'
  | 'total_points';

// Additional requirement parameters for complex achievement conditions
export interface AchievementRequirementAdditional {
  contentType?: 'hiragana' | 'katakana' | 'kanji' | 'vocabulary';
  jlptLevel?: 'N5' | 'N4' | 'N3' | 'N2' | 'N1';
  gameMode?: 'classic' | 'gauntlet' | 'blitz';
  difficulty?: 'normal' | 'hard' | 'instant-death';
  minAnswers?: number;
  minAccuracy?: number;
  timeWindowMs?: number;
  hourStart?: number;
  hourEnd?: number;
  dojos?: string[];
  modes?: string[];
  challengeModes?: string[];
  type?:
    | 'single_answer'
    | 'average'
    | 'session'
    | 'no_lives_lost'
    | 'lives_regenerated';
}

export interface AchievementRequirement {
  type: AchievementRequirementType;
  value: number;
  additional?: AchievementRequirementAdditional;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  rarity: AchievementRarity;
  points: number;
  unlockedAt?: Date;
  category: AchievementCategory;
  requirements: AchievementRequirement;
  rewards?: {
    themes?: string[];
    fonts?: string[];
    customization?: string[];
  };
  hidden?: boolean; // For secret achievements that are not shown until unlocked
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
  checkAchievements: (
    stats: unknown,
    sessionStats?: SessionStats,
  ) => Achievement[];

  // Internal method to update computed properties
  updateComputedProperties: () => void;

  // Getters
  getAchievementsByCategory: (
    category: Achievement['category'],
  ) => Achievement[];
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
    requirements: { type: 'total_correct', value: 1 },
  },
  {
    id: 'streak_starter',
    title: 'Streak Starter',
    description: 'Achieve a 5-answer streak',
    icon: '🔥',
    rarity: 'common',
    points: 25,
    category: 'streak',
    requirements: { type: 'streak', value: 5 },
  },
  {
    id: 'hot_streak',
    title: 'Hot Streak',
    description: 'Achieve a 10-answer streak',
    icon: '🌟',
    rarity: 'uncommon',
    points: 50,
    category: 'streak',
    requirements: { type: 'streak', value: 10 },
  },
  {
    id: 'streak_legend',
    title: 'Streak Legend',
    description: 'Achieve a 25-answer streak',
    icon: '⚡',
    rarity: 'rare',
    points: 150,
    category: 'streak',
    requirements: { type: 'streak', value: 25 },
  },
  {
    id: 'unstoppable',
    title: 'Unstoppable',
    description: 'Achieve a 50-answer streak',
    icon: '🚀',
    rarity: 'epic',
    points: 300,
    category: 'streak',
    requirements: { type: 'streak', value: 50 },
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
    requirements: { type: 'total_correct', value: 100 },
  },
  {
    id: 'knowledge_seeker',
    title: 'Knowledge Seeker',
    description: 'Answer 500 questions correctly',
    icon: '🎓',
    rarity: 'rare',
    points: 250,
    category: 'milestone',
    requirements: { type: 'total_correct', value: 500 },
  },
  {
    id: 'master_scholar',
    title: 'Master Scholar',
    description: 'Answer 1000 questions correctly',
    icon: '👑',
    rarity: 'epic',
    points: 500,
    category: 'milestone',
    requirements: { type: 'total_correct', value: 1000 },
  },
  {
    id: 'legendary_master',
    title: 'Legendary Master',
    description: 'Answer 5000 questions correctly',
    icon: '🏆',
    rarity: 'legendary',
    points: 1000,
    category: 'milestone',
    requirements: { type: 'total_correct', value: 5000 },
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
    requirements: { type: 'sessions', value: 10 },
  },
  {
    id: 'persistent_student',
    title: 'Persistent Student',
    description: 'Complete 50 training sessions',
    icon: '🎯',
    rarity: 'uncommon',
    points: 200,
    category: 'consistency',
    requirements: { type: 'sessions', value: 50 },
  },
  {
    id: 'training_master',
    title: 'Training Master',
    description: 'Complete 100 training sessions',
    icon: '🥋',
    rarity: 'rare',
    points: 400,
    category: 'consistency',
    requirements: { type: 'sessions', value: 100 },
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
      additional: { minAnswers: 50 },
    },
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
      additional: { minAnswers: 100 },
    },
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
      additional: { minAnswers: 200 },
    },
  },

  // ============================================
  // KANA ACHIEVEMENTS (Requirements 1.1-1.8)
  // ============================================
  {
    id: 'hiragana_apprentice',
    title: 'Hiragana Apprentice',
    description: 'Answer 50 Hiragana questions correctly',
    icon: 'あ',
    rarity: 'common',
    points: 50,
    category: 'kana',
    requirements: {
      type: 'content_correct',
      value: 50,
      additional: { contentType: 'hiragana' },
    },
  },
  {
    id: 'hiragana_adept',
    title: 'Hiragana Adept',
    description: 'Answer 200 Hiragana questions correctly',
    icon: 'い',
    rarity: 'uncommon',
    points: 150,
    category: 'kana',
    requirements: {
      type: 'content_correct',
      value: 200,
      additional: { contentType: 'hiragana' },
    },
  },
  {
    id: 'hiragana_master',
    title: 'Hiragana Master',
    description: 'Answer 500 Hiragana questions correctly',
    icon: 'う',
    rarity: 'rare',
    points: 300,
    category: 'kana',
    requirements: {
      type: 'content_correct',
      value: 500,
      additional: { contentType: 'hiragana' },
    },
  },
  {
    id: 'katakana_apprentice',
    title: 'Katakana Apprentice',
    description: 'Answer 50 Katakana questions correctly',
    icon: 'ア',
    rarity: 'common',
    points: 50,
    category: 'kana',
    requirements: {
      type: 'content_correct',
      value: 50,
      additional: { contentType: 'katakana' },
    },
  },
  {
    id: 'katakana_adept',
    title: 'Katakana Adept',
    description: 'Answer 200 Katakana questions correctly',
    icon: 'イ',
    rarity: 'uncommon',
    points: 150,
    category: 'kana',
    requirements: {
      type: 'content_correct',
      value: 200,
      additional: { contentType: 'katakana' },
    },
  },
  {
    id: 'katakana_master',
    title: 'Katakana Master',
    description: 'Answer 500 Katakana questions correctly',
    icon: 'ウ',
    rarity: 'rare',
    points: 300,
    category: 'kana',
    requirements: {
      type: 'content_correct',
      value: 500,
      additional: { contentType: 'katakana' },
    },
  },
  {
    id: 'hiragana_perfectionist',
    title: 'Hiragana Perfectionist',
    description: 'Achieve 100% accuracy on all basic Hiragana (46 characters)',
    icon: '💯',
    rarity: 'epic',
    points: 500,
    category: 'kana',
    requirements: {
      type: 'content_mastery',
      value: 100,
      additional: { contentType: 'hiragana' },
    },
  },
  {
    id: 'katakana_perfectionist',
    title: 'Katakana Perfectionist',
    description: 'Achieve 100% accuracy on all basic Katakana (46 characters)',
    icon: '💯',
    rarity: 'epic',
    points: 500,
    category: 'kana',
    requirements: {
      type: 'content_mastery',
      value: 100,
      additional: { contentType: 'katakana' },
    },
  },

  // ============================================
  // KANJI ACHIEVEMENTS (Requirements 2.1-2.10)
  // ============================================
  {
    id: 'n5_explorer',
    title: 'N5 Explorer',
    description: 'Answer 100 N5 Kanji questions correctly',
    icon: '🔰',
    rarity: 'common',
    points: 75,
    category: 'kanji',
    requirements: {
      type: 'content_correct',
      value: 100,
      additional: { contentType: 'kanji', jlptLevel: 'N5' },
    },
  },
  {
    id: 'n4_explorer',
    title: 'N4 Explorer',
    description: 'Answer 100 N4 Kanji questions correctly',
    icon: '📗',
    rarity: 'uncommon',
    points: 100,
    category: 'kanji',
    requirements: {
      type: 'content_correct',
      value: 100,
      additional: { contentType: 'kanji', jlptLevel: 'N4' },
    },
  },
  {
    id: 'n3_explorer',
    title: 'N3 Explorer',
    description: 'Answer 100 N3 Kanji questions correctly',
    icon: '📘',
    rarity: 'rare',
    points: 150,
    category: 'kanji',
    requirements: {
      type: 'content_correct',
      value: 100,
      additional: { contentType: 'kanji', jlptLevel: 'N3' },
    },
  },
  {
    id: 'n2_explorer',
    title: 'N2 Explorer',
    description: 'Answer 100 N2 Kanji questions correctly',
    icon: '📕',
    rarity: 'epic',
    points: 200,
    category: 'kanji',
    requirements: {
      type: 'content_correct',
      value: 100,
      additional: { contentType: 'kanji', jlptLevel: 'N2' },
    },
  },
  {
    id: 'n1_explorer',
    title: 'N1 Explorer',
    description: 'Answer 100 N1 Kanji questions correctly',
    icon: '📙',
    rarity: 'legendary',
    points: 300,
    category: 'kanji',
    requirements: {
      type: 'content_correct',
      value: 100,
      additional: { contentType: 'kanji', jlptLevel: 'N1' },
    },
  },
  {
    id: 'n5_graduate',
    title: 'N5 Graduate',
    description: 'Master all N5 Kanji with 80% accuracy',
    icon: '🎓',
    rarity: 'rare',
    points: 400,
    category: 'kanji',
    requirements: {
      type: 'content_mastery',
      value: 80,
      additional: { contentType: 'kanji', jlptLevel: 'N5' },
    },
  },
  {
    id: 'n4_graduate',
    title: 'N4 Graduate',
    description: 'Master all N4 Kanji with 80% accuracy',
    icon: '🎓',
    rarity: 'epic',
    points: 500,
    category: 'kanji',
    requirements: {
      type: 'content_mastery',
      value: 80,
      additional: { contentType: 'kanji', jlptLevel: 'N4' },
    },
  },
  {
    id: 'n3_graduate',
    title: 'N3 Graduate',
    description: 'Master all N3 Kanji with 80% accuracy',
    icon: '🎓',
    rarity: 'epic',
    points: 600,
    category: 'kanji',
    requirements: {
      type: 'content_mastery',
      value: 80,
      additional: { contentType: 'kanji', jlptLevel: 'N3' },
    },
  },
  {
    id: 'n2_graduate',
    title: 'N2 Graduate',
    description: 'Master all N2 Kanji with 80% accuracy',
    icon: '🎓',
    rarity: 'legendary',
    points: 800,
    category: 'kanji',
    requirements: {
      type: 'content_mastery',
      value: 80,
      additional: { contentType: 'kanji', jlptLevel: 'N2' },
    },
  },
  {
    id: 'n1_graduate',
    title: 'N1 Graduate',
    description: 'Master all N1 Kanji with 80% accuracy',
    icon: '👑',
    rarity: 'legendary',
    points: 1000,
    category: 'kanji',
    requirements: {
      type: 'content_mastery',
      value: 80,
      additional: { contentType: 'kanji', jlptLevel: 'N1' },
    },
  },

  // ============================================
  // VOCABULARY ACHIEVEMENTS (Requirements 3.1-3.6)
  // ============================================
  {
    id: 'word_collector',
    title: 'Word Collector',
    description: 'Answer 100 vocabulary questions correctly',
    icon: '📝',
    rarity: 'common',
    points: 75,
    category: 'vocabulary',
    requirements: {
      type: 'content_correct',
      value: 100,
      additional: { contentType: 'vocabulary' },
    },
  },
  {
    id: 'lexicon_builder',
    title: 'Lexicon Builder',
    description: 'Answer 500 vocabulary questions correctly',
    icon: '📖',
    rarity: 'uncommon',
    points: 200,
    category: 'vocabulary',
    requirements: {
      type: 'content_correct',
      value: 500,
      additional: { contentType: 'vocabulary' },
    },
  },
  {
    id: 'dictionary_devotee',
    title: 'Dictionary Devotee',
    description: 'Answer 1000 vocabulary questions correctly',
    icon: '📚',
    rarity: 'rare',
    points: 400,
    category: 'vocabulary',
    requirements: {
      type: 'content_correct',
      value: 1000,
      additional: { contentType: 'vocabulary' },
    },
  },
  {
    id: 'vocabulary_virtuoso',
    title: 'Vocabulary Virtuoso',
    description: 'Answer 2500 vocabulary questions correctly',
    icon: '🎭',
    rarity: 'epic',
    points: 750,
    category: 'vocabulary',
    requirements: {
      type: 'content_correct',
      value: 2500,
      additional: { contentType: 'vocabulary' },
    },
  },
  {
    id: 'word_wizard',
    title: 'Word Wizard',
    description: 'Master 50 unique vocabulary words with 90% accuracy',
    icon: '🧙',
    rarity: 'rare',
    points: 350,
    category: 'vocabulary',
    requirements: {
      type: 'content_mastery',
      value: 90,
      additional: { contentType: 'vocabulary', minAnswers: 50 },
    },
  },
  {
    id: 'linguistic_legend',
    title: 'Linguistic Legend',
    description: 'Master 200 unique vocabulary words with 90% accuracy',
    icon: '🏛️',
    rarity: 'legendary',
    points: 800,
    category: 'vocabulary',
    requirements: {
      type: 'content_mastery',
      value: 90,
      additional: { contentType: 'vocabulary', minAnswers: 200 },
    },
  },

  // ============================================
  // GAUNTLET ACHIEVEMENTS (Requirements 4.1-4.10)
  // ============================================
  {
    id: 'gauntlet_initiate',
    title: 'Gauntlet Initiate',
    description: 'Complete your first Gauntlet run',
    icon: '⚔️',
    rarity: 'common',
    points: 50,
    category: 'gauntlet',
    requirements: { type: 'gauntlet_completion', value: 1 },
  },
  {
    id: 'gauntlet_survivor',
    title: 'Gauntlet Survivor',
    description: 'Complete a Gauntlet run on Normal difficulty',
    icon: '🛡️',
    rarity: 'uncommon',
    points: 100,
    category: 'gauntlet',
    requirements: {
      type: 'gauntlet_difficulty',
      value: 1,
      additional: { difficulty: 'normal' },
    },
  },
  {
    id: 'gauntlet_warrior',
    title: 'Gauntlet Warrior',
    description: 'Complete a Gauntlet run on Hard difficulty',
    icon: '⚔️',
    rarity: 'rare',
    points: 250,
    category: 'gauntlet',
    requirements: {
      type: 'gauntlet_difficulty',
      value: 1,
      additional: { difficulty: 'hard' },
    },
  },
  {
    id: 'gauntlet_legend',
    title: 'Gauntlet Legend',
    description: 'Complete a Gauntlet run on Instant Death difficulty',
    icon: '💀',
    rarity: 'legendary',
    points: 500,
    category: 'gauntlet',
    requirements: {
      type: 'gauntlet_difficulty',
      value: 1,
      additional: { difficulty: 'instant-death' },
    },
  },
  {
    id: 'gauntlet_veteran',
    title: 'Gauntlet Veteran',
    description: 'Complete 10 Gauntlet runs',
    icon: '🎖️',
    rarity: 'uncommon',
    points: 150,
    category: 'gauntlet',
    requirements: { type: 'gauntlet_completion', value: 10 },
  },
  {
    id: 'gauntlet_champion',
    title: 'Gauntlet Champion',
    description: 'Complete 50 Gauntlet runs',
    icon: '🏆',
    rarity: 'epic',
    points: 400,
    category: 'gauntlet',
    requirements: { type: 'gauntlet_completion', value: 50 },
  },
  {
    id: 'flawless_victory',
    title: 'Flawless Victory',
    description: 'Complete a Gauntlet run with 100% accuracy',
    icon: '✨',
    rarity: 'epic',
    points: 500,
    category: 'gauntlet',
    requirements: { type: 'gauntlet_perfect', value: 1 },
  },
  {
    id: 'untouchable',
    title: 'Untouchable',
    description: 'Complete a Gauntlet run without losing any lives',
    icon: '🌟',
    rarity: 'rare',
    points: 300,
    category: 'gauntlet',
    requirements: {
      type: 'gauntlet_lives',
      value: 0,
      additional: { type: 'no_lives_lost' },
    },
  },
  {
    id: 'phoenix_rising',
    title: 'Phoenix Rising',
    description: 'Regenerate 5 lives in a single Gauntlet run',
    icon: '🔥',
    rarity: 'rare',
    points: 200,
    category: 'gauntlet',
    requirements: {
      type: 'gauntlet_lives',
      value: 5,
      additional: { type: 'lives_regenerated' },
    },
  },
  {
    id: 'gauntlet_streak_master',
    title: 'Gauntlet Streak Master',
    description: 'Achieve a 50-streak in Gauntlet mode',
    icon: '⚡',
    rarity: 'epic',
    points: 350,
    category: 'gauntlet',
    requirements: {
      type: 'streak',
      value: 50,
      additional: { gameMode: 'gauntlet' },
    },
  },

  // ============================================
  // BLITZ ACHIEVEMENTS (Requirements 5.1-5.8)
  // ============================================
  {
    id: 'speed_demon_initiate',
    title: 'Speed Demon Initiate',
    description: 'Complete your first Blitz session',
    icon: '💨',
    rarity: 'common',
    points: 50,
    category: 'blitz',
    requirements: { type: 'blitz_session', value: 1 },
  },
  {
    id: 'blitz_warrior',
    title: 'Blitz Warrior',
    description: 'Answer 50 questions correctly in a single Blitz session',
    icon: '⚡',
    rarity: 'uncommon',
    points: 150,
    category: 'blitz',
    requirements: { type: 'blitz_score', value: 50 },
  },
  {
    id: 'blitz_champion',
    title: 'Blitz Champion',
    description: 'Answer 100 questions correctly in a single Blitz session',
    icon: '🏅',
    rarity: 'rare',
    points: 300,
    category: 'blitz',
    requirements: { type: 'blitz_score', value: 100 },
  },
  {
    id: 'lightning_reflexes',
    title: 'Lightning Reflexes',
    description: 'Achieve a 25-streak in Blitz mode',
    icon: '⚡',
    rarity: 'rare',
    points: 200,
    category: 'blitz',
    requirements: {
      type: 'streak',
      value: 25,
      additional: { gameMode: 'blitz' },
    },
  },
  {
    id: 'blitz_legend',
    title: 'Blitz Legend',
    description: 'Achieve a 50-streak in Blitz mode',
    icon: '🌩️',
    rarity: 'epic',
    points: 400,
    category: 'blitz',
    requirements: {
      type: 'streak',
      value: 50,
      additional: { gameMode: 'blitz' },
    },
  },
  {
    id: 'precision_under_pressure',
    title: 'Precision Under Pressure',
    description: 'Maintain 90% accuracy over 100 Blitz answers',
    icon: '🎯',
    rarity: 'epic',
    points: 350,
    category: 'blitz',
    requirements: {
      type: 'accuracy',
      value: 90,
      additional: { gameMode: 'blitz', minAnswers: 100 },
    },
  },
  {
    id: 'speed_addict',
    title: 'Speed Addict',
    description: 'Complete 10 Blitz sessions',
    icon: '🏃',
    rarity: 'uncommon',
    points: 100,
    category: 'blitz',
    requirements: { type: 'blitz_session', value: 10 },
  },
  {
    id: 'blitz_master',
    title: 'Blitz Master',
    description: 'Complete 50 Blitz sessions',
    icon: '👑',
    rarity: 'epic',
    points: 400,
    category: 'blitz',
    requirements: { type: 'blitz_session', value: 50 },
  },

  // ============================================
  // SPEED ACHIEVEMENTS (Requirements 6.1-6.5)
  // ============================================
  {
    id: 'quick_draw',
    title: 'Quick Draw',
    description: 'Answer 10 questions correctly in under 30 seconds total',
    icon: '🤠',
    rarity: 'uncommon',
    points: 100,
    category: 'speed',
    requirements: {
      type: 'speed',
      value: 30000,
      additional: { minAnswers: 10 },
    },
  },
  {
    id: 'speed_reader',
    title: 'Speed Reader',
    description: 'Answer 25 questions correctly in under 60 seconds total',
    icon: '📖',
    rarity: 'rare',
    points: 200,
    category: 'speed',
    requirements: {
      type: 'speed',
      value: 60000,
      additional: { minAnswers: 25 },
    },
  },
  {
    id: 'instant_recognition',
    title: 'Instant Recognition',
    description: 'Answer a question correctly in under 1 second',
    icon: '👁️',
    rarity: 'rare',
    points: 150,
    category: 'speed',
    requirements: {
      type: 'speed',
      value: 1000,
      additional: { type: 'single_answer' },
    },
  },
  {
    id: 'rapid_fire',
    title: 'Rapid Fire',
    description:
      'Maintain an average response time under 2 seconds over 50 questions',
    icon: '🔫',
    rarity: 'epic',
    points: 300,
    category: 'speed',
    requirements: {
      type: 'speed',
      value: 2000,
      additional: { type: 'average', minAnswers: 50 },
    },
  },
  {
    id: 'efficient_learner',
    title: 'Efficient Learner',
    description:
      'Complete a training session in under 5 minutes with 90% accuracy',
    icon: '⏱️',
    rarity: 'rare',
    points: 250,
    category: 'speed',
    requirements: {
      type: 'speed',
      value: 300000,
      additional: { type: 'session', minAccuracy: 90 },
    },
  },

  // ============================================
  // EXTENDED STREAK ACHIEVEMENTS (Requirements 7.1-7.5)
  // ============================================
  {
    id: 'streak_warrior',
    title: 'Streak Warrior',
    description: 'Achieve a 75-answer streak',
    icon: '⚔️',
    rarity: 'epic',
    points: 400,
    category: 'streak',
    requirements: { type: 'streak', value: 75 },
  },
  {
    id: 'century_streak',
    title: 'Century Streak',
    description: 'Achieve a 100-answer streak',
    icon: '💯',
    rarity: 'epic',
    points: 600,
    category: 'streak',
    requirements: { type: 'streak', value: 100 },
  },
  {
    id: 'streak_titan',
    title: 'Streak Titan',
    description: 'Achieve a 150-answer streak',
    icon: '🗿',
    rarity: 'legendary',
    points: 800,
    category: 'streak',
    requirements: { type: 'streak', value: 150 },
  },
  {
    id: 'streak_immortal',
    title: 'Streak Immortal',
    description: 'Achieve a 200-answer streak',
    icon: '♾️',
    rarity: 'legendary',
    points: 1000,
    category: 'streak',
    requirements: { type: 'streak', value: 200 },
  },
  {
    id: 'streak_god',
    title: 'Streak God',
    description: 'Achieve a 500-answer streak',
    icon: '🌌',
    rarity: 'legendary',
    points: 2000,
    category: 'streak',
    requirements: { type: 'streak', value: 500 },
  },

  // ============================================
  // EXPLORATION ACHIEVEMENTS (Requirements 8.1-8.7)
  // ============================================
  {
    id: 'well_rounded',
    title: 'Well-Rounded',
    description: 'Train in all three dojos (Kana, Kanji, Vocabulary)',
    icon: '🌐',
    rarity: 'uncommon',
    points: 100,
    category: 'exploration',
    requirements: {
      type: 'variety',
      value: 3,
      additional: { dojos: ['kana', 'kanji', 'vocabulary'] },
    },
  },
  {
    id: 'mode_explorer',
    title: 'Mode Explorer',
    description: 'Try all core game modes (Pick, Input, Reverse-Input)',
    icon: '🧭',
    rarity: 'uncommon',
    points: 100,
    category: 'exploration',
    requirements: {
      type: 'variety',
      value: 3,
      additional: { modes: ['pick', 'type', 'anti-type'] },
    },
  },
  {
    id: 'triple_threat',
    title: 'Triple Threat',
    description: 'Complete sessions in Classic, Gauntlet, and Blitz modes',
    icon: '🎯',
    rarity: 'rare',
    points: 200,
    category: 'exploration',
    requirements: {
      type: 'variety',
      value: 3,
      additional: { challengeModes: ['classic', 'gauntlet', 'blitz'] },
    },
  },
  {
    id: 'consistent_learner',
    title: 'Consistent Learner',
    description: 'Train on 5 different days',
    icon: '📅',
    rarity: 'common',
    points: 75,
    category: 'exploration',
    requirements: { type: 'days_trained', value: 5 },
  },
  {
    id: 'monthly_dedication',
    title: 'Monthly Dedication',
    description: 'Train on 30 different days',
    icon: '🗓️',
    rarity: 'rare',
    points: 300,
    category: 'exploration',
    requirements: { type: 'days_trained', value: 30 },
  },
  {
    id: 'century_of_learning',
    title: 'Century of Learning',
    description: 'Train on 100 different days',
    icon: '📆',
    rarity: 'epic',
    points: 600,
    category: 'exploration',
    requirements: { type: 'days_trained', value: 100 },
  },
  {
    id: 'year_of_mastery',
    title: 'Year of Mastery',
    description: 'Train on 365 different days',
    icon: '🎊',
    rarity: 'legendary',
    points: 1500,
    category: 'exploration',
    requirements: { type: 'days_trained', value: 365 },
  },

  // ============================================
  // EXTENDED MILESTONE ACHIEVEMENTS (Requirements 9.1-9.6)
  // ============================================
  {
    id: 'dedicated_scholar',
    title: 'Dedicated Scholar',
    description: 'Answer 2500 questions correctly',
    icon: '📚',
    rarity: 'rare',
    points: 350,
    category: 'milestone',
    requirements: { type: 'total_correct', value: 2500 },
  },
  {
    id: 'grand_master',
    title: 'Grand Master',
    description: 'Answer 10000 questions correctly',
    icon: '🏛️',
    rarity: 'legendary',
    points: 1500,
    category: 'milestone',
    requirements: { type: 'total_correct', value: 10000 },
  },
  {
    id: 'legendary_scholar',
    title: 'Legendary Scholar',
    description: 'Answer 25000 questions correctly',
    icon: '⭐',
    rarity: 'legendary',
    points: 3000,
    category: 'milestone',
    requirements: { type: 'total_correct', value: 25000 },
  },
  {
    id: 'session_veteran',
    title: 'Session Veteran',
    description: 'Complete 250 training sessions',
    icon: '🎖️',
    rarity: 'rare',
    points: 400,
    category: 'consistency',
    requirements: { type: 'sessions', value: 250 },
  },
  {
    id: 'session_legend',
    title: 'Session Legend',
    description: 'Complete 500 training sessions',
    icon: '🏆',
    rarity: 'epic',
    points: 700,
    category: 'consistency',
    requirements: { type: 'sessions', value: 500 },
  },
  {
    id: 'eternal_student',
    title: 'Eternal Student',
    description: 'Complete 1000 training sessions',
    icon: '♾️',
    rarity: 'legendary',
    points: 1200,
    category: 'consistency',
    requirements: { type: 'sessions', value: 1000 },
  },

  // ============================================
  // POINT-BASED ACHIEVEMENTS (Requirements 9.7-9.9)
  // ============================================
  {
    id: 'point_collector',
    title: 'Point Collector',
    description: 'Earn 1000 achievement points',
    icon: '💰',
    rarity: 'uncommon',
    points: 100,
    category: 'milestone',
    requirements: { type: 'total_points', value: 1000 },
  },
  {
    id: 'point_hoarder',
    title: 'Point Hoarder',
    description: 'Earn 5000 achievement points',
    icon: '💎',
    rarity: 'rare',
    points: 250,
    category: 'milestone',
    requirements: { type: 'total_points', value: 5000 },
  },
  {
    id: 'point_master',
    title: 'Point Master',
    description: 'Earn 10000 achievement points',
    icon: '👑',
    rarity: 'epic',
    points: 500,
    category: 'milestone',
    requirements: { type: 'total_points', value: 10000 },
  },

  // ============================================
  // FUN/SECRET ACHIEVEMENTS (Requirements 10.1-10.10)
  // ============================================
  {
    id: 'learning_from_mistakes',
    title: 'Learning from Mistakes',
    description: 'Answer your first question wrong',
    icon: '🤔',
    rarity: 'common',
    points: 10,
    category: 'fun',
    requirements: { type: 'total_incorrect', value: 1 },
    hidden: false,
  },
  {
    id: 'perseverance',
    title: 'Perseverance',
    description: 'Get 5 wrong answers in a row',
    icon: '💪',
    rarity: 'uncommon',
    points: 50,
    category: 'fun',
    requirements: { type: 'wrong_streak', value: 5 },
  },
  {
    id: 'night_owl',
    title: 'Night Owl',
    description: 'Train at midnight (00:00-01:00)',
    icon: '🦉',
    rarity: 'uncommon',
    points: 75,
    category: 'fun',
    requirements: {
      type: 'time_of_day',
      value: 1,
      additional: { hourStart: 0, hourEnd: 1 },
    },
    hidden: true,
  },
  {
    id: 'early_bird',
    title: 'Early Bird',
    description: 'Train early morning (05:00-06:00)',
    icon: '🐦',
    rarity: 'uncommon',
    points: 75,
    category: 'fun',
    requirements: {
      type: 'time_of_day',
      value: 1,
      additional: { hourStart: 5, hourEnd: 6 },
    },
    hidden: true,
  },
  {
    id: 'answer_to_everything',
    title: 'Answer to Everything',
    description: 'Achieve exactly 42 correct answers in a session',
    icon: '🌌',
    rarity: 'rare',
    points: 142,
    category: 'fun',
    requirements: { type: 'exact_count', value: 42 },
    hidden: true,
  },
  {
    id: 'perfect_century',
    title: 'Perfect Century',
    description: 'Achieve exactly 100 correct answers in a session',
    icon: '💯',
    rarity: 'rare',
    points: 200,
    category: 'fun',
    requirements: { type: 'exact_count', value: 100 },
    hidden: true,
  },
  {
    id: 'achievement_hunter',
    title: 'Achievement Hunter',
    description: 'Unlock 10 achievements',
    icon: '🎯',
    rarity: 'uncommon',
    points: 100,
    category: 'fun',
    requirements: { type: 'achievement_count', value: 10 },
  },
  {
    id: 'achievement_collector',
    title: 'Achievement Collector',
    description: 'Unlock 25 achievements',
    icon: '🏅',
    rarity: 'rare',
    points: 250,
    category: 'fun',
    requirements: { type: 'achievement_count', value: 25 },
  },
  {
    id: 'achievement_enthusiast',
    title: 'Achievement Enthusiast',
    description: 'Unlock 50 achievements',
    icon: '🎖️',
    rarity: 'epic',
    points: 500,
    category: 'fun',
    requirements: { type: 'achievement_count', value: 50 },
  },
  {
    id: 'completionist',
    title: 'Completionist',
    description: 'Unlock all achievements',
    icon: '🌟',
    rarity: 'legendary',
    points: 2000,
    category: 'fun',
    requirements: { type: 'achievement_count', value: -1 }, // -1 means all
    hidden: true,
  },
];

// ============================================
// TYPE DEFINITIONS FOR ACHIEVEMENT CHECKING
// ============================================

// Gauntlet stats interface
interface GauntletStats {
  totalRuns: number;
  completedRuns: number;
  normalCompleted: number;
  hardCompleted: number;
  instantDeathCompleted: number;
  perfectRuns: number;
  noDeathRuns: number;
  livesRegenerated: number;
  bestStreak: number;
}

// Blitz stats interface
interface BlitzStats {
  totalSessions: number;
  bestSessionScore: number;
  bestStreak: number;
  totalCorrect: number;
  totalAnswers?: number;
}

// All-time stats interface for achievement checking
interface AllTimeStatsForAchievements {
  totalCorrect?: number;
  totalIncorrect?: number;
  bestStreak?: number;
  totalSessions?: number;
  characterMastery?: Record<string, { correct: number; incorrect: number }>;
  hiraganaCorrect?: number;
  katakanaCorrect?: number;
  kanjiCorrectByLevel?: Record<string, number>;
  vocabularyCorrect?: number;
  gauntletStats?: GauntletStats;
  blitzStats?: BlitzStats;
  fastestAnswerMs?: number;
  answerTimesMs?: number[];
  dojosUsed?: string[];
  modesUsed?: string[];
  challengeModesUsed?: string[];
  trainingDays?: string[];
  currentWrongStreak?: number;
  maxWrongStreak?: number;
}

// Stats object passed to checkAchievements
interface StatsForAchievements {
  allTimeStats?: AllTimeStatsForAchievements;
  numCorrectAnswers?: number;
  currentStreak?: number;
}

// Session stats for session-specific achievements
export interface SessionStats {
  sessionCorrect?: number;
  sessionTime?: number;
  sessionAccuracy?: number;
  currentHour?: number;
}

const BASIC_HIRAGANA = new Set([
  '\u3042','\u3044','\u3046','\u3048','\u304A','\u304B','\u304D','\u304F','\u3051','\u3053',
  '\u3055','\u3057','\u3059','\u305B','\u305D','\u305F','\u3061','\u3064','\u3066','\u3068',
  '\u306A','\u306B','\u306C','\u306D','\u306E','\u306F','\u3072','\u3075','\u3078','\u307B',
  '\u307E','\u307F','\u3080','\u3081','\u3082','\u3084','\u3086','\u3088','\u3089','\u308A',
  '\u308B','\u308C','\u308D','\u308F','\u3092','\u3093',
]);

const BASIC_KATAKANA = new Set([
  '\u30A2','\u30A4','\u30A6','\u30A8','\u30AA','\u30AB','\u30AD','\u30AF','\u30B1','\u30B3',
  '\u30B5','\u30B7','\u30B9','\u30BB','\u30BD','\u30BF','\u30C1','\u30C4','\u30C6','\u30C8',
  '\u30CA','\u30CB','\u30CC','\u30CD','\u30CE','\u30CF','\u30D2','\u30D5','\u30D8','\u30DB',
  '\u30DE','\u30DF','\u30E0','\u30E1','\u30E2','\u30E4','\u30E6','\u30E8','\u30E9','\u30EA',
  '\u30EB','\u30EC','\u30ED','\u30EF','\u30F2','\u30F3',
]);

const isSingleKanji = (value: string) => /^[\u4E00-\u9FFF]$/.test(value);

// ============================================
// ACHIEVEMENT REQUIREMENT CHECKERS
// ============================================

/**
 * 6.1 Check content_correct requirement
 * Validates correct answers for specific content types (hiragana, katakana, kanji by level, vocabulary)
 * Requirements: 1.1-1.6, 2.1-2.5, 3.1-3.4
 */
function checkContentCorrect(
  achievement: Achievement,
  allTimeStats: AllTimeStatsForAchievements,
): boolean {
  const { value, additional } = achievement.requirements;
  const contentType = additional?.contentType;

  if (!contentType) return false;

  switch (contentType) {
    case 'hiragana':
      return (allTimeStats.hiraganaCorrect ?? 0) >= value;
    case 'katakana':
      return (allTimeStats.katakanaCorrect ?? 0) >= value;
    case 'kanji': {
      const jlptLevel = additional?.jlptLevel;
      if (!jlptLevel) return false;
      const kanjiCorrect = allTimeStats.kanjiCorrectByLevel?.[jlptLevel] ?? 0;
      return kanjiCorrect >= value;
    }
    case 'vocabulary':
      return (allTimeStats.vocabularyCorrect ?? 0) >= value;
    default:
      return false;
  }
}

/**
 * 6.2 Check content_mastery requirement
 * Validates accuracy across all characters in a content set
 * Requirements: 1.7-1.8, 2.6-2.10, 3.5-3.6
 */
function checkContentMastery(
  achievement: Achievement,
  allTimeStats: AllTimeStatsForAchievements,
): boolean {
  const { value, additional } = achievement.requirements;
  const contentType = additional?.contentType;
  const minAnswers = additional?.minAnswers;

  if (!contentType) return false;

  const characterMastery = allTimeStats.characterMastery ?? {};
  const entries = Object.entries(characterMastery);

  // For vocabulary mastery with minAnswers, check unique words mastered
  if (contentType === 'vocabulary' && minAnswers !== undefined) {
    const relevantEntries = entries.filter(([key]) => {
      // Vocabulary keys are usually words/phrases. Exclude single-character kana/kanji keys.
      if (key.length !== 1) return true;
      if (BASIC_HIRAGANA.has(key) || BASIC_KATAKANA.has(key)) return false;
      if (isSingleKanji(key)) return false;
      return true;
    });

    let masteredCount = 0;
    for (const [, stats] of relevantEntries) {
      const total = stats.correct + stats.incorrect;
      if (total > 0) {
        const accuracy = (stats.correct / total) * 100;
        if (accuracy >= value) {
          masteredCount++;
        }
      }
    }
    return masteredCount >= minAnswers;
  }

  let relevantEntries: Array<[string, { correct: number; incorrect: number }]>;
  if (contentType === 'hiragana') {
    relevantEntries = entries.filter(([key]) => BASIC_HIRAGANA.has(key));
    if (relevantEntries.length < BASIC_HIRAGANA.size) return false;
  } else if (contentType === 'katakana') {
    relevantEntries = entries.filter(([key]) => BASIC_KATAKANA.has(key));
    if (relevantEntries.length < BASIC_KATAKANA.size) return false;
  } else if (contentType === 'kanji') {
    relevantEntries = entries.filter(([key]) => isSingleKanji(key));
  } else {
    relevantEntries = entries;
  }

  if (relevantEntries.length === 0) return false;

  for (const [, stats] of relevantEntries) {
    const total = stats.correct + stats.incorrect;
    if (total === 0) return false;
    const accuracy = (stats.correct / total) * 100;
    if (accuracy < value) {
      return false;
    }
  }

  return true;
}

/**
 * 6.3 Check gauntlet requirement checkers
 * Validates gauntlet_completion, gauntlet_difficulty, gauntlet_perfect, gauntlet_lives
 * Requirements: 4.1-4.9
 */
function checkGauntletRequirement(
  achievement: Achievement,
  allTimeStats: AllTimeStatsForAchievements,
): boolean {
  const { type, value, additional } = achievement.requirements;
  const gauntletStats = allTimeStats.gauntletStats;

  if (!gauntletStats) return false;

  switch (type) {
    case 'gauntlet_completion':
      return gauntletStats.completedRuns >= value;

    case 'gauntlet_difficulty': {
      const difficulty = additional?.difficulty;
      if (!difficulty) return false;
      switch (difficulty) {
        case 'normal':
          return gauntletStats.normalCompleted >= value;
        case 'hard':
          return gauntletStats.hardCompleted >= value;
        case 'instant-death':
          return gauntletStats.instantDeathCompleted >= value;
        default:
          return false;
      }
    }

    case 'gauntlet_perfect':
      return gauntletStats.perfectRuns >= value;

    case 'gauntlet_lives': {
      const lifeType = additional?.type;
      if (lifeType === 'no_lives_lost') {
        return gauntletStats.noDeathRuns >= 1;
      } else if (lifeType === 'lives_regenerated') {
        return gauntletStats.livesRegenerated >= value;
      }
      return false;
    }

    default:
      return false;
  }
}

/**
 * 6.4 Check blitz requirement checkers
 * Validates blitz_session, blitz_score requirements
 * Requirements: 5.1-5.3, 5.7-5.8
 */
function checkBlitzRequirement(
  achievement: Achievement,
  allTimeStats: AllTimeStatsForAchievements,
): boolean {
  const { type, value } = achievement.requirements;
  const blitzStats = allTimeStats.blitzStats;

  if (!blitzStats) return false;

  switch (type) {
    case 'blitz_session':
      return blitzStats.totalSessions >= value;

    case 'blitz_score':
      return blitzStats.bestSessionScore >= value;

    default:
      return false;
  }
}

/**
 * 6.5 Check speed requirement
 * Validates time-based achievements (total time, average time, single answer time)
 * Requirements: 6.1-6.5
 */
function checkSpeedRequirement(
  achievement: Achievement,
  allTimeStats: AllTimeStatsForAchievements,
  sessionStats?: SessionStats,
): boolean {
  const { value, additional } = achievement.requirements;
  const speedType = additional?.type;
  const minAnswers = additional?.minAnswers ?? 0;
  const minAccuracy = additional?.minAccuracy ?? 0;

  const answerTimes = allTimeStats.answerTimesMs ?? [];
  const fastestAnswer = allTimeStats.fastestAnswerMs ?? Infinity;

  switch (speedType) {
    case 'single_answer':
      // Check if fastest answer is under the threshold
      return fastestAnswer <= value;

    case 'average': {
      // Check average response time over minAnswers questions
      if (answerTimes.length < minAnswers) return false;
      const recentTimes = answerTimes.slice(-minAnswers);
      const avgTime =
        recentTimes.reduce((a, b) => a + b, 0) / recentTimes.length;
      return avgTime <= value;
    }

    case 'session': {
      // Check session time with accuracy requirement
      if (!sessionStats) return false;
      const sessionTime = sessionStats.sessionTime ?? Infinity;
      const sessionAccuracy = sessionStats.sessionAccuracy ?? 0;
      return sessionTime <= value && sessionAccuracy >= minAccuracy;
    }

    default: {
      // Default: total time for minAnswers questions
      if (answerTimes.length < minAnswers) return false;
      const recentTimes = answerTimes.slice(-minAnswers);
      const totalTime = recentTimes.reduce((a, b) => a + b, 0);
      return totalTime <= value;
    }
  }
}

/**
 * 6.6 Check variety requirement
 * Validates dojo variety, mode variety, challenge mode variety
 * Requirements: 8.1-8.3
 */
function checkVarietyRequirement(
  achievement: Achievement,
  allTimeStats: AllTimeStatsForAchievements,
): boolean {
  const { value, additional } = achievement.requirements;

  if (additional?.dojos) {
    const dojosUsed = allTimeStats.dojosUsed ?? [];
    const requiredDojos = additional.dojos;
    const matchedDojos = requiredDojos.filter(d => dojosUsed.includes(d));
    return matchedDojos.length >= value;
  }

  if (additional?.modes) {
    const modesUsed = allTimeStats.modesUsed ?? [];
    const requiredModes = additional.modes;
    const matchedModes = requiredModes.filter(m => modesUsed.includes(m));
    return matchedModes.length >= value;
  }

  if (additional?.challengeModes) {
    const challengeModesUsed = allTimeStats.challengeModesUsed ?? [];
    const requiredChallengeModes = additional.challengeModes;
    const matchedChallengeModes = requiredChallengeModes.filter(cm =>
      challengeModesUsed.includes(cm),
    );
    return matchedChallengeModes.length >= value;
  }

  return false;
}

/**
 * 6.7 Check days_trained requirement
 * Validates unique training days count
 * Requirements: 8.4-8.7
 */
function checkDaysTrainedRequirement(
  achievement: Achievement,
  allTimeStats: AllTimeStatsForAchievements,
): boolean {
  const { value } = achievement.requirements;
  const trainingDays = allTimeStats.trainingDays ?? [];
  return trainingDays.length >= value;
}

/**
 * 6.8 Check time_of_day requirement
 * Validates current hour against time windows for Night Owl/Early Bird
 * Requirements: 10.3-10.4
 */
function checkTimeOfDayRequirement(
  achievement: Achievement,
  sessionStats?: SessionStats,
): boolean {
  const { additional } = achievement.requirements;
  const hourStart = additional?.hourStart;
  const hourEnd = additional?.hourEnd;

  if (hourStart === undefined || hourEnd === undefined) return false;

  // Use provided hour or current hour
  const currentHour = sessionStats?.currentHour ?? new Date().getHours();

  return currentHour >= hourStart && currentHour < hourEnd;
}

/**
 * 6.9 Check wrong_streak requirement
 * Validates consecutive wrong answers
 * Requirements: 10.2
 */
function checkWrongStreakRequirement(
  achievement: Achievement,
  allTimeStats: AllTimeStatsForAchievements,
): boolean {
  const { value } = achievement.requirements;
  const maxWrongStreak = allTimeStats.maxWrongStreak ?? 0;
  return maxWrongStreak >= value;
}

/**
 * 6.10 Check exact_count requirement
 * Validates exact session correct counts (42, 100)
 * Requirements: 10.5-10.6
 */
function checkExactCountRequirement(
  achievement: Achievement,
  sessionStats?: SessionStats,
): boolean {
  const { value } = achievement.requirements;

  if (!sessionStats) return false;

  const sessionCorrect = sessionStats.sessionCorrect ?? 0;
  return sessionCorrect === value;
}

/**
 * 6.11 Check achievement_count requirement
 * Validates number of unlocked achievements for meta achievements
 * Requirements: 10.7-10.10
 */
function checkAchievementCountRequirement(
  achievement: Achievement,
  state: AchievementState,
): boolean {
  const { value } = achievement.requirements;
  const unlockedCount = Object.keys(state.unlockedAchievements).length;

  // -1 means all achievements (excluding this one and other meta achievements)
  if (value === -1) {
    // Count total non-meta achievements
    const nonMetaAchievements = ACHIEVEMENTS.filter(
      a =>
        a.requirements.type !== 'achievement_count' && a.id !== achievement.id,
    );
    return unlockedCount >= nonMetaAchievements.length;
  }

  return unlockedCount >= value;
}

/**
 * 6.12 Check total_points requirement
 * Validates total achievement points earned
 * Requirements: 9.7-9.9
 */
function checkTotalPointsRequirement(
  achievement: Achievement,
  state: AchievementState,
): boolean {
  const { value } = achievement.requirements;
  return state.totalPoints >= value;
}

/**
 * Main requirement checker that delegates to specific checkers
 */
function checkRequirement(
  achievement: Achievement,
  allTimeStats: AllTimeStatsForAchievements,
  state: AchievementState,
  sessionStats?: SessionStats,
): boolean {
  const { type, value, additional } = achievement.requirements;

  switch (type) {
    // Existing types
    case 'total_correct':
      return (allTimeStats.totalCorrect ?? 0) >= value;

    case 'total_incorrect':
      return (allTimeStats.totalIncorrect ?? 0) >= value;

    case 'streak': {
      // Check if game mode specific
      const gameMode = additional?.gameMode;
      if (gameMode === 'gauntlet') {
        return (allTimeStats.gauntletStats?.bestStreak ?? 0) >= value;
      } else if (gameMode === 'blitz') {
        return (allTimeStats.blitzStats?.bestStreak ?? 0) >= value;
      }
      return (allTimeStats.bestStreak ?? 0) >= value;
    }

    case 'sessions':
      return (allTimeStats.totalSessions ?? 0) >= value;

    case 'accuracy': {
      const gameMode = additional?.gameMode;
      const minAnswers = additional?.minAnswers ?? 0;

      // For blitz-specific accuracy
      if (gameMode === 'blitz') {
        const blitzStats = allTimeStats.blitzStats;
        if (!blitzStats) return false;
        const blitzTotalAnswers = blitzStats.totalAnswers ?? 0;
        const blitzAccuracy =
          blitzTotalAnswers > 0
            ? (blitzStats.totalCorrect / blitzTotalAnswers) * 100
            : 0;
        return blitzTotalAnswers >= minAnswers && blitzAccuracy >= value;
      }

      const totalAnswers =
        (allTimeStats.totalCorrect ?? 0) + (allTimeStats.totalIncorrect ?? 0);
      const accuracy =
        totalAnswers > 0
          ? ((allTimeStats.totalCorrect ?? 0) / totalAnswers) * 100
          : 0;
      return totalAnswers >= minAnswers && accuracy >= value;
    }

    // New content-specific types (6.1)
    case 'content_correct':
      return checkContentCorrect(achievement, allTimeStats);

    // New mastery type (6.2)
    case 'content_mastery':
      return checkContentMastery(achievement, allTimeStats);

    // Gauntlet types (6.3)
    case 'gauntlet_completion':
    case 'gauntlet_difficulty':
    case 'gauntlet_perfect':
    case 'gauntlet_lives':
      return checkGauntletRequirement(achievement, allTimeStats);

    // Blitz types (6.4)
    case 'blitz_session':
    case 'blitz_score':
      return checkBlitzRequirement(achievement, allTimeStats);

    // Speed type (6.5)
    case 'speed':
      return checkSpeedRequirement(achievement, allTimeStats, sessionStats);

    // Variety type (6.6)
    case 'variety':
      return checkVarietyRequirement(achievement, allTimeStats);

    // Days trained type (6.7)
    case 'days_trained':
      return checkDaysTrainedRequirement(achievement, allTimeStats);

    // Time of day type (6.8)
    case 'time_of_day':
      return checkTimeOfDayRequirement(achievement, sessionStats);

    // Wrong streak type (6.9)
    case 'wrong_streak':
      return checkWrongStreakRequirement(achievement, allTimeStats);

    // Exact count type (6.10)
    case 'exact_count':
      return checkExactCountRequirement(achievement, sessionStats);

    // Achievement count type (6.11)
    case 'achievement_count':
      return checkAchievementCountRequirement(achievement, state);

    // Total points type (6.12)
    case 'total_points':
      return checkTotalPointsRequirement(achievement, state);

    default:
      return false;
  }
}

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
          hasUnseenNotifications: unseenNotifications.length > 0,
        });
      },

      unlockAchievement: (achievement: Achievement) => {
        const state = get();
        if (state.unlockedAchievements[achievement.id]) return;

        const unlockedAchievement = {
          ...achievement,
          unlockedAt: new Date(),
        };

        const notification: AchievementNotification = {
          id: `${achievement.id}-${Date.now()}`,
          achievement: unlockedAchievement,
          timestamp: new Date(),
          seen: false,
        };

        const newTotalPoints = state.totalPoints + achievement.points;
        const newLevel = Math.floor(newTotalPoints / 500) + 1;

        set({
          unlockedAchievements: {
            ...state.unlockedAchievements,
            [achievement.id]: unlockedAchievement,
          },
          notifications: [...state.notifications, notification],
          totalPoints: newTotalPoints,
          level: newLevel,
        });

        // Update computed properties
        get().updateComputedProperties();
      },

      markNotificationSeen: (notificationId: string) => {
        set(state => ({
          notifications: state.notifications.map(notification =>
            notification.id === notificationId
              ? { ...notification, seen: true }
              : notification,
          ),
        }));

        // Update computed properties
        get().updateComputedProperties();
      },

      clearAllNotifications: () => {
        set(state => ({
          notifications: state.notifications.map(notification => ({
            ...notification,
            seen: true,
          })),
        }));

        // Update computed properties
        get().updateComputedProperties();
      },

      checkAchievements: (stats: unknown, sessionStats?: SessionStats) => {
        const newlyUnlocked: Achievement[] = [];

        // Type guard for stats object
        const typedStats = stats as StatsForAchievements;
        if (!typedStats.allTimeStats) return newlyUnlocked;

        const allTimeStats = typedStats.allTimeStats;

        ACHIEVEMENTS.forEach(achievement => {
          const currentState = get();
          if (currentState.unlockedAchievements[achievement.id]) return;

          const isUnlocked = checkRequirement(
            achievement,
            allTimeStats,
            currentState,
            sessionStats,
          );

          if (isUnlocked) {
            newlyUnlocked.push(achievement);
            get().unlockAchievement(achievement);
          }
        });

        return newlyUnlocked;
      },

      getAchievementsByCategory: (category: Achievement['category']) => {
        const state = get();
        return ACHIEVEMENTS.filter(
          achievement => achievement.category === category,
        ).map(achievement => ({
          ...achievement,
          unlockedAt: state.unlockedAchievements[achievement.id]?.unlockedAt,
        }));
      },
    }),
    {
      name: 'kanadojo-achievements',
      partialize: state => ({
        unlockedAchievements: state.unlockedAchievements,
        notifications: state.notifications,
        totalPoints: state.totalPoints,
        level: state.level,
      }),
      merge: (persistedState, currentState) => {
        const persisted = persistedState as
          | Partial<AchievementState>
          | undefined;

        return {
          ...currentState,
          unlockedAchievements: persisted?.unlockedAchievements ?? {},
          notifications: persisted?.notifications ?? [],
          totalPoints: persisted?.totalPoints ?? 0,
          level: persisted?.level ?? 1,
        };
      },
    },
  ),
);

export default useAchievementStore;

