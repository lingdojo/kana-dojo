'use client';
import { useState, useCallback } from 'react';
import { Random } from 'random-js';

const random = new Random();

interface SmartReverseModeOptions {
  /** Probability of reverse mode (default: 0.40 = 40%) */
  reverseProbability?: number;
  /** Force mode switch after N consecutive exercises of the same type (default: 3) */
  forceSwitchAfter?: number;
}

/**
 * Algorithm to decide when to use reverse mode in pick games.
 * Uses a flat probability with bidirectional force switch to prevent long streaks.
 *
 * - Base probability: 60% normal mode, 40% reverse mode
 * - Forces a mode switch after 3 consecutive exercises of the same type
 * - This works bidirectionally (3 normal → force reverse, 3 reverse → force normal)
 * - Call recordWrongAnswer() on wrong answers to reset streak without changing mode
 * - Call decideNextMode() only on correct answers to advance to next question
 */
export const useSmartReverseMode = (options: SmartReverseModeOptions = {}) => {
  const { reverseProbability = 0.4, forceSwitchAfter = 3 } = options;

  const [consecutiveSameMode, setConsecutiveSameMode] = useState(0);
  const [isReverse, setIsReverse] = useState(false);

  // Call this on wrong answers to reset the streak without changing mode
  const recordWrongAnswer = useCallback(() => {
    // Wrong answers don't affect the consecutive count for mode switching
  }, []);

  // Call this only on correct answers to decide the next mode
  const decideNextMode = useCallback(() => {
    // Check if we need to force a switch
    if (consecutiveSameMode >= forceSwitchAfter - 1) {
      // Force switch to the opposite mode
      setIsReverse(prev => !prev);
      setConsecutiveSameMode(0);
      return;
    }

    // Roll for the next mode using flat probability
    const shouldBeReverse = random.real(0, 1) < reverseProbability;

    if (shouldBeReverse === isReverse) {
      // Same mode as before, increment consecutive counter
      setConsecutiveSameMode(prev => prev + 1);
    } else {
      // Mode changed, reset counter
      setConsecutiveSameMode(0);
    }

    setIsReverse(shouldBeReverse);
  }, [consecutiveSameMode, forceSwitchAfter, reverseProbability, isReverse]);

  return {
    isReverse,
    decideNextMode,
    recordWrongAnswer,
    consecutiveSameMode,
  };
};

export default useSmartReverseMode;
