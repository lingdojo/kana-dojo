'use client';
import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import clsx from 'clsx';
import { kana } from '@/features/Kana/data/kana';
import useKanaStore from '@/features/Kana/store/useKanaStore';
import { Random } from 'random-js';
import { useCorrect, useError, useClick } from '@/shared/hooks/useAudio';
// import GameIntel from '@/shared/components/Game/GameIntel';
import { getGlobalAdaptiveSelector } from '@/shared/lib/adaptiveSelection';
import Stars from '@/shared/components/Game/Stars';
import { useCrazyModeTrigger } from '@/features/CrazyMode/hooks/useCrazyModeTrigger';
import { useStatsStore } from '@/features/Progress';
import { useShallow } from 'zustand/react/shallow';
import { useStopwatch } from 'react-timer-hook';
import { useSmartReverseMode } from '@/shared/hooks/useSmartReverseMode';
import { GameBottomBar } from '@/shared/components/Game/GameBottomBar';
import { cn } from '@/shared/lib/utils';
import { useThemePreferences } from '@/features/Preferences';
import {
  BottomBarState,
  gameContentVariants,
  useWordBuildingActionKey,
} from '@/shared/components/Game/wordBuildingShared';
import WordBuildingTilesGrid from '@/shared/components/Game/WordBuildingTilesGrid';

const random = new Random();
const adaptiveSelector = getGlobalAdaptiveSelector();

// Helper function to determine if a kana character is hiragana or katakana
const isHiragana = (char: string): boolean => {
  const code = char.charCodeAt(0);
  return code >= 0x3040 && code <= 0x309f;
};

const isKatakana = (char: string): boolean => {
  const code = char.charCodeAt(0);
  return code >= 0x30a0 && code <= 0x30ff;
};

interface WordBuildingGameProps {
  isHidden: boolean;
  /** Optional: externally controlled reverse mode. If not provided, uses internal useSmartReverseMode */
  isReverse?: boolean;
  /** Optional: word length. Defaults to 3 */
  wordLength?: number;
  /** Optional: callback when answer is correct. If not provided, handles internally */
  onCorrect?: (chars: string[]) => void;
  /** Optional: callback when answer is wrong. If not provided, handles internally */
  onWrong?: () => void;
}

const WordBuildingGame = ({
  isHidden,
  isReverse: externalIsReverse,
  wordLength: externalWordLength = 3,
  onCorrect: externalOnCorrect,
  onWrong: externalOnWrong,
}: WordBuildingGameProps) => {
  // Smart reverse mode - used when not controlled externally
  const {
    isReverse: internalIsReverse,
    decideNextMode: decideNextReverseMode,
    recordWrongAnswer: recordReverseModeWrong,
  } = useSmartReverseMode();

  // Use external isReverse if provided, otherwise use internal smart mode
  const isReverse = externalIsReverse ?? internalIsReverse;
  const wordLength = externalWordLength;

  // Answer timing for speed achievements
  const speedStopwatch = useStopwatch({ autoStart: false });
  const { playCorrect } = useCorrect();
  const { playErrorTwice } = useError();
  const { playClick } = useClick();
  const { trigger: triggerCrazyMode } = useCrazyModeTrigger();
  const buttonRef = useRef<HTMLButtonElement>(null);

  const {
    score,
    setScore,
    incrementHiraganaCorrect,
    incrementKatakanaCorrect,
    incrementWrongStreak,
    resetWrongStreak,
    recordAnswerTime,
    incrementCorrectAnswers,
    incrementWrongAnswers,
    addCharacterToHistory,
    incrementCharacterScore,
    addCorrectAnswerTime,
  } = useStatsStore(
    useShallow(state => ({
      score: state.score,
      setScore: state.setScore,
      incrementHiraganaCorrect: state.incrementHiraganaCorrect,
      incrementKatakanaCorrect: state.incrementKatakanaCorrect,
      incrementWrongStreak: state.incrementWrongStreak,
      resetWrongStreak: state.resetWrongStreak,
      recordAnswerTime: state.recordAnswerTime,
      incrementCorrectAnswers: state.incrementCorrectAnswers,
      incrementWrongAnswers: state.incrementWrongAnswers,
      addCharacterToHistory: state.addCharacterToHistory,
      incrementCharacterScore: state.incrementCharacterScore,
      addCorrectAnswerTime: state.addCorrectAnswerTime,
    })),
  );

  const isGlassMode = useThemePreferences().isGlassMode;

  const kanaGroupIndices = useKanaStore(state => state.kanaGroupIndices);

  // Get all available kana and romaji from selected groups
  const { selectedKana, selectedRomaji, kanaToRomaji, romajiToKana } =
    useMemo(() => {
      const kanaChars = kanaGroupIndices.map(i => kana[i].kana).flat();
      const romajiChars = kanaGroupIndices.map(i => kana[i].romanji).flat();

      const k2r: Record<string, string> = {};
      const r2k: Record<string, string> = {};

      kanaChars.forEach((k, i) => {
        k2r[k] = romajiChars[i];
        r2k[romajiChars[i]] = k;
      });

      return {
        selectedKana: kanaChars,
        selectedRomaji: romajiChars,
        kanaToRomaji: k2r,
        romajiToKana: r2k,
      };
    }, [kanaGroupIndices]);

  const [bottomBarState, setBottomBarState] = useState<BottomBarState>('check');

  // Memoize dependencies for generateWord to reduce re-renders
  const generateWordDeps = useMemo(
    () => ({
      isReverse,
      selectedKana,
      selectedRomaji,
      wordLength,
      kanaToRomaji,
      romajiToKana,
    }),
    [
      isReverse,
      selectedKana,
      selectedRomaji,
      wordLength,
      kanaToRomaji,
      romajiToKana,
    ],
  );

  // Generate a word (array of characters) and distractors
  const generateWord = useCallback(() => {
    const {
      isReverse,
      selectedKana,
      selectedRomaji,
      wordLength,
      kanaToRomaji,
      romajiToKana,
    } = generateWordDeps;
    const sourceChars = isReverse ? selectedRomaji : selectedKana;
    const totalTileCount =
      wordLength <= 1 ? 3 : wordLength === 2 ? 4 : 5;
    if (sourceChars.length < totalTileCount) {
      return { wordChars: [], answerChars: [], allTiles: [] };
    }

    const wordChars: string[] = [];
    const usedChars = new Set<string>();

    for (let i = 0; i < wordLength; i++) {
      const available = sourceChars.filter(c => !usedChars.has(c));
      if (available.length === 0) break;

      const selected = adaptiveSelector.selectWeightedCharacter(available);
      wordChars.push(selected);
      usedChars.add(selected);
      adaptiveSelector.markCharacterSeen(selected);
    }

    const answerChars = isReverse
      ? wordChars.map(r => romajiToKana[r])
      : wordChars.map(k => kanaToRomaji[k]);

    const distractorCount = Math.max(0, totalTileCount - answerChars.length);
    const distractorSource = isReverse ? selectedKana : selectedRomaji;
    const distractors: string[] = [];
    const usedAnswers = new Set(answerChars);

    for (let i = 0; i < distractorCount; i++) {
      const available = distractorSource.filter(
        c => !usedAnswers.has(c) && !distractors.includes(c),
      );
      if (available.length === 0) break;
      const selected = available[random.integer(0, available.length - 1)];
      distractors.push(selected);
    }

    const allTiles = [...answerChars, ...distractors].sort(
      () => random.real(0, 1) - 0.5,
    );

    return { wordChars, answerChars, allTiles };
  }, [generateWordDeps]);

  const [wordData, setWordData] = useState(() => generateWord());
  const [placedTiles, setPlacedTiles] = useState<string[]>([]);
  const [isChecking, setIsChecking] = useState(false);
  const [isCelebrating, setIsCelebrating] = useState(false);

  const resetGame = useCallback(() => {
    const newWord = generateWord();
    setWordData(newWord);
    setPlacedTiles([]);
    setIsChecking(false);
    setIsCelebrating(false);
    setBottomBarState('check');
    // Start timing for the new question
    speedStopwatch.reset();
    speedStopwatch.start();
  }, [generateWord]);
  // Note: speedStopwatch deliberately excluded - only calling methods

  useEffect(() => {
    resetGame();
  }, [isReverse, wordLength, resetGame]);

  // Pause stopwatch when game is hidden
  useEffect(() => {
    if (isHidden) {
      speedStopwatch.pause();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isHidden]); // speedStopwatch intentionally excluded - only calling methods

  // Keyboard shortcut for Enter/Space to trigger button
  useWordBuildingActionKey(buttonRef);

  // Handle Check button
  const handleCheck = useCallback(() => {
    if (placedTiles.length === 0) return;

    // Stop timing and record answer time
    speedStopwatch.pause();
    const answerTimeMs = speedStopwatch.totalMilliseconds;

    playClick();
    setIsChecking(true);

    const isCorrect =
      placedTiles.length === wordData.answerChars.length &&
      placedTiles.every((tile, i) => tile === wordData.answerChars[i]);

    if (isCorrect) {
      // Record answer time for speed achievements
      addCorrectAnswerTime(answerTimeMs / 1000);
      recordAnswerTime(answerTimeMs);
      speedStopwatch.reset();

      playCorrect();
      triggerCrazyMode();
      resetWrongStreak();

      wordData.wordChars.forEach(char => {
        addCharacterToHistory(char);
        incrementCharacterScore(char, 'correct');
        adaptiveSelector.updateCharacterWeight(char, true);

        if (isHiragana(char)) {
          incrementHiraganaCorrect();
        } else if (isKatakana(char)) {
          incrementKatakanaCorrect();
        }
      });

      incrementCorrectAnswers();
      setScore(score + wordData.wordChars.length);
      setBottomBarState('correct');
      setIsCelebrating(true);

      // Advance smart reverse mode if not externally controlled
      if (externalIsReverse === undefined) {
        decideNextReverseMode();
      }
    } else {
      speedStopwatch.reset();
      playErrorTwice();
      triggerCrazyMode();
      incrementWrongStreak();
      incrementWrongAnswers();

      wordData.wordChars.forEach(char => {
        incrementCharacterScore(char, 'wrong');
        adaptiveSelector.updateCharacterWeight(char, false);
      });

      if (score - 1 >= 0) {
        setScore(score - 1);
      }

      setBottomBarState('wrong');

      // Reset smart reverse mode streak if not externally controlled
      if (externalIsReverse === undefined) {
        recordReverseModeWrong();
      }

      // Call external callback if provided
      externalOnWrong?.();
    }
  }, [
    placedTiles,
    wordData,
    playClick,
    playCorrect,
    playErrorTwice,
    triggerCrazyMode,
    resetWrongStreak,
    incrementWrongStreak,
    addCharacterToHistory,
    incrementCharacterScore,
    incrementHiraganaCorrect,
    incrementKatakanaCorrect,
    incrementCorrectAnswers,
    incrementWrongAnswers,
    score,
    setScore,
    externalOnWrong,
    externalIsReverse,
    decideNextReverseMode,
    recordReverseModeWrong,
    addCorrectAnswerTime,
    recordAnswerTime,
    // speedStopwatch intentionally excluded - only calling methods
  ]);

  // Handle Continue button (only for correct answers)
  const handleContinue = useCallback(() => {
    playClick();
    externalOnCorrect?.(wordData.wordChars);
    resetGame();
  }, [playClick, externalOnCorrect, wordData.wordChars, resetGame]);

  // Handle Try Again button (for wrong answers)
  const handleTryAgain = useCallback(() => {
    playClick();
    // Clear placed tiles and reset to check state, but keep the same word
    setPlacedTiles([]);
    setIsChecking(false);
    setBottomBarState('check');
    // Restart timing for the retry
    speedStopwatch.reset();
    speedStopwatch.start();
  }, [playClick]);
  // Note: speedStopwatch deliberately excluded - only calling methods

  // Handle tile click - add or remove
  const handleTileClick = useCallback(
    (char: string) => {
      if (isChecking && bottomBarState !== 'wrong') return;

      playClick();

      // If in wrong state, reset to check state and continue with normal tile logic
      if (bottomBarState === 'wrong') {
        setIsChecking(false);
        setBottomBarState('check');
        // Restart timing for the retry
        speedStopwatch.reset();
        speedStopwatch.start();
      }

      // Normal tile add/remove logic
      if (placedTiles.includes(char)) {
        setPlacedTiles(prev => prev.filter(c => c !== char));
      } else {
        setPlacedTiles(prev => [...prev, char]);
      }
    },
    [isChecking, bottomBarState, placedTiles, playClick],
  );
  // Note: speedStopwatch deliberately excluded - only calling methods

  const handleClearPlaced = useCallback(() => {
    if (isChecking) return;
    playClick();
    setPlacedTiles([]);
  }, [isChecking, playClick]);

  // Not enough characters for word building
  const requiredTileCount = wordLength <= 1 ? 3 : wordLength === 2 ? 4 : 5;
  if (
    selectedKana.length < requiredTileCount ||
    wordData.wordChars.length === 0
  ) {
    return null;
  }

  const canCheck = placedTiles.length > 0 && !isChecking;
  const showContinue = bottomBarState === 'correct';
  const showTryAgain = bottomBarState === 'wrong';
  const showFeedback = showContinue || showTryAgain;

  return (
    <div
      className={clsx(
        'flex w-full flex-col items-center gap-6 sm:w-4/5 sm:gap-10',
        isHidden && 'hidden',
      )}
    >
      {/* <GameIntel gameMode='word-building' /> */}

      <AnimatePresence mode='wait'>
        <motion.div
          key={wordData.wordChars.join('')}
          variants={gameContentVariants}
          initial='hidden'
          animate='visible'
          exit='exit'
          className={cn(
            'flex w-full flex-col items-center gap-6 sm:gap-10',
            // 'bg-red-500',
          )}
        >
          {/* Word Display */}
          <div
            className={cn(
              'flex flex-row items-center gap-1',
              isGlassMode && 'rounded-xl bg-(--card-color) px-4 py-2',
            )}
          >
            <motion.p
              className={clsx(
                'sm:text-8xl',
                !isReverse && wordData.wordChars.length === 3
                  ? 'text-6xl'
                  : 'text-7xl',
              )}
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              {wordData.wordChars.join('')}
            </motion.p>
          </div>

          <WordBuildingTilesGrid
            allTiles={wordData.allTiles}
            placedTiles={placedTiles}
            onTileClick={handleTileClick}
            isTileDisabled={isChecking && bottomBarState !== 'wrong'}
            isCelebrating={isCelebrating}
            tilesPerRow={3}
            tileSizeClassName='text-2xl sm:text-3xl'
            answerRowClassName='flex min-h-[5rem] w-full items-center border-b-2 border-(--border-color) px-2 pb-2 md:w-3/4 lg:w-2/3 xl:w-1/2'
            tilesContainerClassName={
              isGlassMode ? 'rounded-xl bg-(--card-color) px-4 py-2' : undefined
            }
          />
        </motion.div>
      </AnimatePresence>

      <Stars />

      <GameBottomBar
        state={bottomBarState}
        onAction={
          showContinue
            ? handleContinue
            : showTryAgain
              ? handleTryAgain
              : handleCheck
        }
        canCheck={canCheck}
        feedbackContent={wordData.answerChars.join('')}
        buttonRef={buttonRef}
      />

      {/* Spacer */}
      <div className='h-32' />
    </div>
  );
};

export default WordBuildingGame;
