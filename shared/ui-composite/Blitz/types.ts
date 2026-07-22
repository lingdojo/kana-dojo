import React from 'react';

export type BlitzGameMode = 'Pick' | 'Type';

export interface BlitzConfig<T> {
  // Identity
  dojoType: 'kana' | 'kanji' | 'vocabulary';
  dojoLabel: string;
  localStorageKey: string;
  goalTimerContext: string;

  // Optional: Initial game mode from store (used when autoStart is true)
  initialGameMode?: BlitzGameMode;

  // Data
  items: T[];
  selectedSets?: string[]; // e.g. ["Set 1", "Set 2"] for displaying selected levels
  generateQuestion: (items: T[]) => T;

  // Display
  renderQuestion: (question: T, isReverse?: boolean) => React.ReactNode;
  inputPlaceholder: string;
  modeDescription: string;

  // Validation (for Type mode)
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

  // Reverse mode support - if provided, enables smart reverse mode switching
  supportsReverseMode?: boolean;

  // Stats
  stats: {
    correct: number;
    wrong: number;
    streak: number;
    bestStreak: number;
    incrementCorrect: () => void;
    incrementWrong: () => void;
    reset: () => void;
  };
}

export interface GoalTimer {
  id: string;
  label: string;
  targetSeconds: number;
  reached: boolean;
}

export type AddGoalFn = (goal: Omit<GoalTimer, 'id' | 'reached'>) => void;
