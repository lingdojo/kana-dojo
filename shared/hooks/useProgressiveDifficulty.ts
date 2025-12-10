'use client';
import { useState, useCallback, useMemo } from 'react';

interface ProgressiveDifficultyOptions {
  /** Minimum number of options (default: 3) */
  minOptions?: number;
  /** Maximum number of options (default: 6) */
  maxOptions?: number;
  /** Correct answers needed to increase difficulty by 1 option (default: 3) */
  streakPerLevel?: number;
  /** How many wrong answers to decrease difficulty by 1 option (default: 2) */
  wrongsToDecrease?: number;
}

interface ProgressiveDifficultyState {
  /** Current number of answer options to display */
  optionCount: number;
  /** Current difficulty level (0 = easiest) */
  difficultyLevel: number;
  /** Consecutive correct answers at current level */
  levelStreak: number;
  /** Consecutive wrong answers at current level */
  wrongStreak: number;
  /** Pending wrong answers to apply on next question */
  pendingWrongs: number;
}

/**
 * Smart progressive difficulty system for pick games.
 *
 * - Starts with 3 options (easiest)
 * - After N consecutive correct answers, adds 1 more option (up to 6)
 * - After M consecutive wrong answers, removes 1 option (down to 3)
 * - Tracks performance to adaptively adjust difficulty
 *
 * @example
 * const { optionCount, recordCorrect, recordWrong, difficultyLevel } = useProgressiveDifficulty();
 * // optionCount starts at 3
 * // After 3 correct answers: optionCount becomes 4
 * // After 6 correct answers: optionCount becomes 5
 * // After 9 correct answers: optionCount becomes 6 (max)
 */
export const useProgressiveDifficulty = (
  options: ProgressiveDifficultyOptions = {}
) => {
  const {
    minOptions = 3,
    maxOptions = 6,
    streakPerLevel = 3,
    wrongsToDecrease = 2
  } = options;

  const [state, setState] = useState<ProgressiveDifficultyState>({
    optionCount: minOptions,
    difficultyLevel: 0,
    levelStreak: 0,
    wrongStreak: 0,
    pendingWrongs: 0
  });

  const recordCorrect = useCallback(() => {
    setState(prev => {
      const maxLevel = maxOptions - minOptions;

      // First, apply any pending wrong answers (difficulty decrease)
      let newOptionCount = prev.optionCount;
      let newDifficultyLevel = prev.difficultyLevel;

      if (prev.pendingWrongs >= wrongsToDecrease && prev.difficultyLevel > 0) {
        newOptionCount = Math.max(prev.optionCount - 1, minOptions);
        newDifficultyLevel = prev.difficultyLevel - 1;
        // Reset streak since we had wrong answers
        return {
          optionCount: newOptionCount,
          difficultyLevel: newDifficultyLevel,
          levelStreak: 0,
          wrongStreak: 0,
          pendingWrongs: 0
        };
      }

      // No pending wrongs to apply, check if we should increase difficulty
      const newLevelStreak = prev.levelStreak + 1;

      if (newLevelStreak >= streakPerLevel && prev.difficultyLevel < maxLevel) {
        return {
          optionCount: Math.min(prev.optionCount + 1, maxOptions),
          difficultyLevel: prev.difficultyLevel + 1,
          levelStreak: 0,
          wrongStreak: 0,
          pendingWrongs: 0
        };
      }

      return {
        ...prev,
        levelStreak: newLevelStreak,
        wrongStreak: 0,
        pendingWrongs: 0
      };
    });
  }, [minOptions, maxOptions, streakPerLevel, wrongsToDecrease]);

  const recordWrong = useCallback(() => {
    setState(prev => {
      // Track wrong answers but don't change optionCount yet
      // The difficulty decrease will be applied on the next correct answer
      return {
        ...prev,
        levelStreak: 0,
        wrongStreak: prev.wrongStreak + 1,
        pendingWrongs: prev.pendingWrongs + 1
      };
    });
  }, []);

  const reset = useCallback(() => {
    setState({
      optionCount: minOptions,
      difficultyLevel: 0,
      levelStreak: 0,
      wrongStreak: 0,
      pendingWrongs: 0
    });
  }, [minOptions]);

  // Progress to next level (0-100%)
  const levelProgress = useMemo(() => {
    return Math.round((state.levelStreak / streakPerLevel) * 100);
  }, [state.levelStreak, streakPerLevel]);

  return {
    optionCount: state.optionCount,
    difficultyLevel: state.difficultyLevel,
    levelStreak: state.levelStreak,
    levelProgress,
    recordCorrect,
    recordWrong,
    reset
  };
};

export default useProgressiveDifficulty;
