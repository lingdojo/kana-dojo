// =============================================================================
// Rush Mode Types
// =============================================================================

/**
 * Rush mode difficulty levels
 * Each level has different time limits and score multipliers
 */
export type RushDifficulty = 'easy' | 'medium' | 'hard' | 'extreme';

/**
 * Game modes supported in Rush
 */
export type RushGameMode = 'Pick' | 'Type';

/**
 * Configuration for each difficulty level
 */
export const RUSH_DIFFICULTY_CONFIG: Record<
  RushDifficulty,
  {
    timeLimitSeconds: number;
    scoreMultiplier: number;
    comboDecaySeconds: number; // Time before combo resets
    label: string;
    description: string;
  }
> = {
  easy: {
    timeLimitSeconds: 60,
    scoreMultiplier: 1,
    comboDecaySeconds: 5,
    label: 'Easy',
    description: '60 seconds - Relaxed pace',
  },
  medium: {
    timeLimitSeconds: 45,
    scoreMultiplier: 1.5,
    comboDecaySeconds: 4,
    label: 'Medium',
    description: '45 seconds - Balanced challenge',
  },
  hard: {
    timeLimitSeconds: 30,
    scoreMultiplier: 2,
    comboDecaySeconds: 3,
    label: 'Hard',
    description: '30 seconds - Fast-paced',
  },
  extreme: {
    timeLimitSeconds: 15,
    scoreMultiplier: 3,
    comboDecaySeconds: 2,
    label: 'Extreme',
    description: '15 seconds - Intense!',
  },
};

/**
 * Question item for Rush mode
 */
export interface RushQuestion<T> {
  item: T;
  index: number;
}

/**
 * Session stats for Rush mode results
 */
export interface RushSessionStats {
  id?: string;
  timestamp: number;
  dojoType: 'kana' | 'kanji' | 'vocabulary';
  difficulty: RushDifficulty;
  gameMode: RushGameMode;
  timeLimitSeconds: number;
  correctAnswers: number;
  wrongAnswers: number;
  accuracy: number;
  maxCombo: number;
  finalScore: number;
  baseScore: number;
  comboBonus: number;
  averageTimeMs: number;
  fastestAnswerMs: number;
  slowestAnswerMs: number;
  totalCharacters: number;
  selectedSets: string[];
}

/**
 * Configuration for Rush mode - similar to Gauntlet/Gauntlet config pattern
 */
export interface RushConfig<T> {
  dojoType: 'kana' | 'kanji' | 'vocabulary';
  dojoLabel: string;
  localStorageKey?: string; // For storing preferred duration/difficulty
  goalTimerContext?: string;
  initialGameMode?: RushGameMode;
  items: T[];
  selectedSets: string[];
  
  // Question generation
  generateQuestion: (items: T[]) => RushQuestion<T>;
  
  // Display
  renderQuestion: (question: T, isReverse: boolean) => string;
  renderOption?: (option: string) => string;
  inputPlaceholder?: string;
  modeDescription?: string;
  
  // Answer checking
  checkAnswer: (question: T, answer: string, isReverse: boolean) => boolean;
  getCorrectAnswer: (question: T, isReverse: boolean) => string;
  
  // Pick mode options
  generateOptions?: (
    question: T,
    items: T[],
    count: number,
    isReverse: boolean,
  ) => string[];
  getCorrectOption?: (question: T, isReverse: boolean) => string;
  
  // Features
  supportsReverseMode?: boolean;
}

/**
 * Star rating based on score percentage
 */
export const getRushStars = (
  score: number,
  maxPossibleScore: number,
): number => {
  const percentage = maxPossibleScore > 0 ? score / maxPossibleScore : 0;
  if (percentage >= 0.9) return 3;
  if (percentage >= 0.7) return 2;
  if (percentage >= 0.5) return 1;
  return 0;
};

/**
 * Calculate combo bonus multiplier
 * Combo increases by 0.1 for each consecutive correct answer
 * Max combo multiplier is 3x
 */
export const getComboMultiplier = (combo: number): number => {
  return Math.min(3, 1 + combo * 0.1);
};

/**
 * Calculate score for a correct answer
 */
export const calculateScore = (
  basePoints: number,
  combo: number,
  difficultyMultiplier: number,
): number => {
  const comboMultiplier = getComboMultiplier(combo);
  return Math.round(basePoints * comboMultiplier * difficultyMultiplier);
};