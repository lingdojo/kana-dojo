'use client';
import { useState, useCallback } from 'react';
import { Random } from 'random-js';

const random = new Random();

interface SmartReverseModeOptions {
  /** Base probability of reverse mode (default: 0.2 = 20%) */
  baseProbability?: number;
  /** Probability increase per consecutive correct answer (default: 0.1 = 10%) */
  incrementPerCorrect?: number;
  /** Maximum probability cap (default: 0.7 = 70%) */
  maxProbability?: number;
  /** Force mode switch every N consecutive correct answers (default: 4) */
  forceSwitchInterval?: number;
}

/**
 * Smart algorithm to decide when to use reverse mode in pick games.
 * Uses a weighted probability that increases reverse chance as user improves.
 *
 * - Base probability starts at 20%
 * - Increases by 10% for each consecutive correct answer
 * - Caps at 70% reverse probability after 5 consecutive correct answers
 * - Forces a mode switch every 4 consecutive correct answers to keep it varied
 * - Call recordWrongAnswer() on wrong answers to reset streak without changing mode
 * - Call decideNextMode() only on correct answers to advance to next question
 */
export const useSmartReverseMode = (options: SmartReverseModeOptions = {}) => {
  const {
    baseProbability = 0.2,
    incrementPerCorrect = 0.08,
    maxProbability = 0.55,
    forceSwitchInterval = 3
  } = options;

  const [consecutiveCorrect, setConsecutiveCorrect] = useState(0);
  const [isReverse, setIsReverse] = useState(false);

  // Call this on wrong answers to reset the streak without changing mode
  const recordWrongAnswer = useCallback(() => {
    setConsecutiveCorrect(0);
  }, []);

  // Call this only on correct answers to decide the next mode
  const decideNextMode = useCallback(() => {
    const newConsecutive = consecutiveCorrect + 1;
    setConsecutiveCorrect(newConsecutive);

    const reverseProbability = Math.min(
      baseProbability + newConsecutive * incrementPerCorrect,
      maxProbability
    );

    // Add some randomness - occasionally force a mode switch to keep it interesting
    const forceSwitch =
      newConsecutive > 0 && newConsecutive % forceSwitchInterval === 0;

    if (forceSwitch) {
      setIsReverse(prev => !prev);
    } else {
      setIsReverse(random.real(0, 1) < reverseProbability);
    }
  }, [
    consecutiveCorrect,
    baseProbability,
    incrementPerCorrect,
    maxProbability,
    forceSwitchInterval
  ]);

  return { isReverse, decideNextMode, recordWrongAnswer, consecutiveCorrect };
};

export default useSmartReverseMode;
