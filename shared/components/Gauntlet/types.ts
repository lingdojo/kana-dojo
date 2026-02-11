import React from 'react';

export type GauntletDifficulty = 'normal' | 'hard' | 'instant-death';
export type GauntletGameMode = 'Pick' | 'Type';

export interface GauntletConfig<T> {
  // Identity
  dojoType: 'kana' | 'kanji' | 'vocabulary';
  dojoLabel: string;

  // Data
  items: T[];
  selectedSets?: string[];

  // Question handling
  generateQuestion: (items: T[]) => T;
  renderQuestion: (question: T, isReverse?: boolean) => React.ReactNode;
  checkAnswer: (question: T, answer: string, isReverse?: boolean) => boolean;
  getCorrectAnswer: (question: T, isReverse?: boolean) => string;

  // Pick mode support
  generateOptions?: (
    question: T,
    items: T[],
    count: number,
    isReverse?: boolean,
  ) => string[];
  renderOption?: (
    option: string,
    items: T[],
    isReverse?: boolean,
  ) => React.ReactNode;
  getCorrectOption?: (question: T, isReverse?: boolean) => string;

  // Reverse mode support
  supportsReverseMode?: boolean;

  // Initial game mode from store
  initialGameMode?: GauntletGameMode;
}

export interface GauntletSessionStats {
  id: string;
  timestamp: number;
  dojoType: 'kana' | 'kanji' | 'vocabulary';
  difficulty: GauntletDifficulty;
  gameMode: GauntletGameMode;

  // Core stats
  totalQuestions: number;
  correctAnswers: number;
  wrongAnswers: number;
  accuracy: number;

  // Streak tracking
  bestStreak: number;
  currentStreak: number;

  // Lives
  startingLives: number;
  livesRemaining: number;
  livesLost: number;
  livesRegenerated: number;

  // Time
  totalTimeMs: number;
  averageTimePerQuestionMs: number;
  fastestAnswerMs: number;
  slowestAnswerMs: number;

  // Completion
  completed: boolean;
  questionsCompleted: number;

  // Character breakdown
  characterStats: Record<string, { correct: number; wrong: number }>;

  // Context
  totalCharacters: number;
  repetitionsPerChar: number;
  selectedSets: string[];
}

export interface GauntletQuestion<T> {
  item: T;
  index: number; // Position in the queue
  repetitionNumber: number; // Which repetition this is (1, 2, 3...)
}

export interface GauntletState<T> {
  // Queue
  questionQueue: GauntletQuestion<T>[];
  currentIndex: number;
  currentQuestion: GauntletQuestion<T> | null;

  // Lives
  lives: number;
  maxLives: number;
  correctSinceLastRegen: number;
  regenThreshold: number;

  // Stats
  correctAnswers: number;
  wrongAnswers: number;
  currentStreak: number;
  bestStreak: number;

  // Time tracking
  startTime: number;
  answerTimes: number[];

  // Character tracking
  characterStats: Record<string, { correct: number; wrong: number }>;
}

export const DIFFICULTY_CONFIG: Record<
  GauntletDifficulty,
  {
    lives: number;
    regenerates: boolean;
    label: string;
    description: string;
    icon: string;
  }
> = {
  normal: {
    lives: 3,
    regenerates: true,
    label: 'Normal',
    description:
      'Challenging but forgiving. Earn lives back through consistent correct answers.',
    icon: '🛡️',
  },
  hard: {
    lives: 3,
    regenerates: false,
    label: 'Hard',
    description:
      'No second chances on lives. Every mistake brings you closer to defeat.',
    icon: '⚔️',
  },
  'instant-death': {
    lives: 1,
    regenerates: false,
    label: 'YOLO',
    description: "One strike and you're out. For true masters only.",
    icon: '💀',
  },
};

export const REPETITION_OPTIONS = [3, 5, 10, 15, 20] as const;
export type RepetitionCount = (typeof REPETITION_OPTIONS)[number];
