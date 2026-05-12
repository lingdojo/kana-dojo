'use client';
import { useState, useCallback, useEffect, useMemo } from 'react';
import { Random } from 'random-js';
import useClassicSessionStore from '@/shared/store/useClassicSessionStore';

const random = new Random();

interface TilesModeOptions {
  /** Base probability of tiles mode (default: 0.15 = 15%) */
  baseProbability?: number;
  /** Absolute probability of normal direction when tiles mode starts (0.0-1.0, default: 0.5) */
  normalModeProbability?: number;
  /** Probability increase per consecutive correct answer (default: 0.1 = 10%) */
  incrementPerCorrect?: number;
  /** Maximum probability cap (default: 0.4 = 40%) */
  maxProbability?: number;
  /** Minimum consecutive correct answers needed before tiles mode can trigger (default: 3) */
  minConsecutiveForTrigger?: number;
  /** Number of characters in the word (default: 3) */
  wordLength?: number;
  /** Enable adaptive word length progression (default: false) */
  enableAdaptiveWordLength?: boolean;
  /** Minimum adaptive word length (default: 1) */
  minWordLength?: number;
  /** Maximum adaptive word length (default: 3) */
  maxWordLength?: number;
  /** Number of consecutive correct answers needed to increase word length by 1 (default: 5) */
  correctAnswersPerLengthStep?: number;
  /** Minimum consecutive correct answers in tiles mode before switching back (default: 2) */
  minTilesModeStreak?: number;
}

interface TilesModeState {
  /** Whether tiles mode is currently active */
  isTilesMode: boolean;
  /** Whether the tiles mode uses reverse direction (romaji display -> kana tiles) */
  isTilesReverse: boolean;
  /** Consecutive correct answers in current mode */
  consecutiveCorrect: number;
  /** Consecutive correct answers while in tiles mode */
  tilesModeStreak: number;
  /** Current word length */
  wordLength: number;
  /** Correct answers counted toward the next +1 word length step */
  correctSinceLastLengthIncrease: number;
  /** Celebration mode to use for the next correct-answer event */
  nextCelebrationMode: 'bounce' | 'explode';
}

const clamp = (value: number, min: number, max: number): number =>
  Math.max(min, Math.min(max, value));

const createInitialTilesModeState = ({
  enableAdaptiveWordLength,
  minWordLength,
  maxWordLength,
  initialWordLength,
}: {
  enableAdaptiveWordLength: boolean;
  minWordLength: number;
  maxWordLength: number;
  initialWordLength: number;
}): TilesModeState => ({
  isTilesMode: false,
  isTilesReverse: false,
  consecutiveCorrect: 0,
  tilesModeStreak: 0,
  wordLength: enableAdaptiveWordLength
    ? minWordLength
    : clamp(initialWordLength, minWordLength, maxWordLength),
  correctSinceLastLengthIncrease: 0,
  nextCelebrationMode: 'bounce',
});

/**
 * Smart algorithm to decide when to trigger tiles mode in MCQ games.
 * Uses a weighted probability that increases tiles-mode chance as the learner improves.
 *
 * Tiles mode has 2 flavors:
 * - Normal: Multiple kana chars displayed, user selects romaji tiles
 * - Reverse: Multiple romaji chars displayed, user selects kana tiles
 *
  * - Base probability starts at 15%
  * - Increases by 10% for each consecutive correct answer
 * - Caps at 40% tiles-mode probability
 * - Requires minimum 3 consecutive correct answers before it can trigger
 * - After 2 correct answers in tiles mode, may switch back to normal MCQ
 * - Direction is decided from one explicit probability value:
 *   normalModeProbability = chance of normal mode
 *   reverse chance = 1 - normalModeProbability
 */
export const useTilesMode = (options: TilesModeOptions = {}) => {
  const {
    baseProbability = 0.15,
    normalModeProbability = 0.65,
    incrementPerCorrect = 0.1,
    maxProbability = 0.4,
    minConsecutiveForTrigger = 5,
    wordLength: initialWordLength = 3,
    enableAdaptiveWordLength = false,
    minWordLength = 1,
    maxWordLength = 3,
    correctAnswersPerLengthStep = 5,
    minTilesModeStreak = 2,
  } = options;
  const activeSessionId = useClassicSessionStore(state => state.activeSessionId);

  const clampedMinWordLength = Math.max(1, minWordLength);
  const clampedMaxWordLength = Math.max(clampedMinWordLength, maxWordLength);
  const clampedCorrectAnswersPerLengthStep = Math.max(
    1,
    correctAnswersPerLengthStep,
  );
  const clampedNormalModeProbability = Math.max(
    0,
    Math.min(1, normalModeProbability),
  );

  const initialState = useMemo(
    () =>
      createInitialTilesModeState({
        enableAdaptiveWordLength,
        minWordLength: clampedMinWordLength,
        maxWordLength: clampedMaxWordLength,
        initialWordLength,
      }),
    [
      clampedMaxWordLength,
      clampedMinWordLength,
      enableAdaptiveWordLength,
      initialWordLength,
    ],
  );

  const [state, setState] = useState<TilesModeState>(initialState);

  useEffect(() => {
    setState(initialState);
  }, [activeSessionId, initialState]);

  // Call this on wrong answers to reset the streak without changing mode
  const recordWrongAnswer = useCallback(() => {
    setState(prev => ({
      ...prev,
      consecutiveCorrect: 0,
      tilesModeStreak: 0,
      correctSinceLastLengthIncrease: 0,
      wordLength: enableAdaptiveWordLength
        ? Math.max(clampedMinWordLength, prev.wordLength - 1)
        : prev.wordLength,
      nextCelebrationMode: prev.nextCelebrationMode,
    }));
  }, [clampedMinWordLength, enableAdaptiveWordLength]);

  // Call this only on correct answers to decide the next mode
  const decideNextMode = useCallback(() => {
    setState(prev => {
      const newConsecutive = prev.consecutiveCorrect + 1;
      const newTilesModeStreak = prev.isTilesMode
        ? prev.tilesModeStreak + 1
        : 0;
      const nextCorrectSinceIncrease = prev.correctSinceLastLengthIncrease + 1;
      const shouldIncreaseLength =
        enableAdaptiveWordLength &&
        nextCorrectSinceIncrease >= clampedCorrectAnswersPerLengthStep;
      const newWordLength = shouldIncreaseLength
        ? Math.min(clampedMaxWordLength, prev.wordLength + 1)
        : prev.wordLength;
      const resetCorrectSinceIncrease = shouldIncreaseLength
        ? 0
        : nextCorrectSinceIncrease;

      // If currently in tiles mode, check if we should exit
      if (prev.isTilesMode) {
        // After minTilesModeStreak correct in tiles mode, 50% chance to exit
        if (
          newTilesModeStreak >= minTilesModeStreak &&
          random.real(0, 1) < 0.5
        ) {
          return {
            ...prev,
            isTilesMode: false,
            isTilesReverse: false,
            consecutiveCorrect: newConsecutive,
            tilesModeStreak: 0,
            correctSinceLastLengthIncrease: resetCorrectSinceIncrease,
            wordLength: newWordLength,
            nextCelebrationMode:
              prev.nextCelebrationMode === 'bounce' ? 'explode' : 'bounce',
          };
        }
        return {
          ...prev,
          consecutiveCorrect: newConsecutive,
          tilesModeStreak: newTilesModeStreak,
          correctSinceLastLengthIncrease: resetCorrectSinceIncrease,
          wordLength: newWordLength,
          nextCelebrationMode:
            prev.nextCelebrationMode === 'bounce' ? 'explode' : 'bounce',
        };
      }

      // Check if we should enter tiles mode
      if (newConsecutive >= minConsecutiveForTrigger) {
        const tilesModeProbability = Math.min(
          baseProbability +
            (newConsecutive - minConsecutiveForTrigger) * incrementPerCorrect,
          maxProbability,
        );

        if (random.real(0, 1) < tilesModeProbability) {
          // Enter tiles mode using one explicit probability:
          // normal = clampedNormalModeProbability
          // reverse = 1 - clampedNormalModeProbability
          return {
            ...prev,
            isTilesMode: true,
            isTilesReverse: random.real(0, 1) >= clampedNormalModeProbability,
            consecutiveCorrect: newConsecutive,
            tilesModeStreak: 0,
            correctSinceLastLengthIncrease: resetCorrectSinceIncrease,
            wordLength: newWordLength,
            nextCelebrationMode:
              prev.nextCelebrationMode === 'bounce' ? 'explode' : 'bounce',
          };
        }
      }

      // Stay in normal MCQ mode
      return {
        ...prev,
        consecutiveCorrect: newConsecutive,
        correctSinceLastLengthIncrease: resetCorrectSinceIncrease,
        wordLength: newWordLength,
        nextCelebrationMode:
          prev.nextCelebrationMode === 'bounce' ? 'explode' : 'bounce',
      };
    });
  }, [
    baseProbability,
    clampedCorrectAnswersPerLengthStep,
    clampedMaxWordLength,
    clampedNormalModeProbability,
    enableAdaptiveWordLength,
    incrementPerCorrect,
    maxProbability,
    minConsecutiveForTrigger,
    minTilesModeStreak,
  ]);

  // Force exit tiles mode (e.g., when question pool is too small)
  const exitTilesMode = useCallback(() => {
    setState(prev => ({
      ...prev,
      isTilesMode: false,
      isTilesReverse: false,
      tilesModeStreak: 0,
    }));
  }, []);

  // Set word length dynamically
  const setWordLength = useCallback((length: number) => {
    setState(prev => ({
      ...prev,
      wordLength: clamp(length, clampedMinWordLength, clampedMaxWordLength),
    }));
  }, [clampedMaxWordLength, clampedMinWordLength]);

  return {
    isTilesMode: state.isTilesMode,
    isTilesReverse: state.isTilesReverse,
    wordLength: state.wordLength,
    consecutiveCorrect: state.consecutiveCorrect,
    tilesModeStreak: state.tilesModeStreak,
    nextCelebrationMode: state.nextCelebrationMode,
    decideNextMode,
    recordWrongAnswer,
    exitTilesMode,
    setWordLength,
  };
};

export default useTilesMode;
