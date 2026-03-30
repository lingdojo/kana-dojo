'use client';
import { useState, useCallback, useMemo } from 'react';

interface AdaptiveTargetLengthOptions {
  minLength?: number;
  maxLength?: number;
  correctsPerLevel?: number;
  wrongsToDecrease?: number;
}

interface AdaptiveTargetLengthState {
  targetLength: number;
  difficultyLevel: number;
  levelStreak: number;
  wrongStreak: number;
  pendingWrongs: number;
}

/**
 * Progressive target length for Kana input games.
 * - Starts at minLength (default 1)
 * - After N corrects, increases by 1 (up to maxLength)
 * - After M wrongs, decreases by 1 (down to minLength)
 */
export function useAdaptiveTargetLength(options: AdaptiveTargetLengthOptions = {}) {
  const {
    minLength = 1,
    maxLength = 3,
    correctsPerLevel = 3,
    wrongsToDecrease = 1,
  } = options;

  const [state, setState] = useState<AdaptiveTargetLengthState>({
    targetLength: minLength,
    difficultyLevel: 0,
    levelStreak: 0,
    wrongStreak: 0,
    pendingWrongs: 0,
  });

  const recordCorrect = useCallback(() => {
    setState(prev => {
      const maxLevel = maxLength - minLength;
      let newTargetLength = prev.targetLength;
      let newDifficultyLevel = prev.difficultyLevel;
      // Apply pending wrongs (decrease length)
      if (prev.pendingWrongs >= wrongsToDecrease && prev.difficultyLevel > 0) {
        newTargetLength = Math.max(prev.targetLength - 1, minLength);
        newDifficultyLevel = prev.difficultyLevel - 1;
        return {
          targetLength: newTargetLength,
          difficultyLevel: newDifficultyLevel,
          levelStreak: 0,
          wrongStreak: 0,
          pendingWrongs: 0,
        };
      }
      // Otherwise, check for increase
      const newLevelStreak = prev.levelStreak + 1;
      if (newLevelStreak >= correctsPerLevel && prev.difficultyLevel < maxLevel) {
        return {
          targetLength: Math.min(prev.targetLength + 1, maxLength),
          difficultyLevel: prev.difficultyLevel + 1,
          levelStreak: 0,
          wrongStreak: 0,
          pendingWrongs: 0,
        };
      }
      return {
        ...prev,
        levelStreak: newLevelStreak,
        wrongStreak: 0,
        pendingWrongs: 0,
      };
    });
  }, [minLength, maxLength, correctsPerLevel, wrongsToDecrease]);

  const recordWrong = useCallback(() => {
    setState(prev => ({
      ...prev,
      levelStreak: 0,
      wrongStreak: prev.wrongStreak + 1,
      pendingWrongs: prev.pendingWrongs + 1,
    }));
  }, []);

  const reset = useCallback(() => {
    setState({
      targetLength: minLength,
      difficultyLevel: 0,
      levelStreak: 0,
      wrongStreak: 0,
      pendingWrongs: 0,
    });
  }, [minLength]);

  // Progress to next level (0-100%)
  const levelProgress = useMemo(() => {
    return Math.round((state.levelStreak / correctsPerLevel) * 100);
  }, [state.levelStreak, correctsPerLevel]);

  return {
    targetLength: state.targetLength,
    difficultyLevel: state.difficultyLevel,
    levelStreak: state.levelStreak,
    levelProgress,
    recordCorrect,
    recordWrong,
    reset,
  };
}
