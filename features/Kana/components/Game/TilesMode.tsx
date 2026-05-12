'use client';
import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import clsx from 'clsx';
import { kana } from '@/features/Kana/data/kana';
import useKanaStore from '@/features/Kana/store/useKanaStore';
import { Random } from 'random-js';
import { useCorrect, useError, useClick } from '@/shared/hooks/generic/useAudio';
// import GameIntel from '@/shared/ui-composite/Game/GameIntel';
import { getGlobalAdaptiveSelector } from '@/shared/utils/adaptiveSelection';
import Stars from '@/shared/ui-composite/Game/Stars';
import { useCrazyModeTrigger } from '@/features/CrazyMode/hooks/useCrazyModeTrigger';
import { useSmartReverseMode } from '@/shared/hooks/game/useSmartReverseMode';
import { useTilesMode } from '@/shared/hooks/game/useTilesMode';
import { useAnswerTimer } from '@/shared/hooks/game/useAnswerTimer';
import { useGameStats } from '@/shared/hooks/game/useGameStats';
import { useTilesModeHandlers } from '@/shared/hooks/game/useTilesModeHandlers';
import { useTilesModeState } from '@/shared/hooks/game/useTilesModeState';

import { GameBottomBar } from '@/shared/ui-composite/Game/GameBottomBar';
import { cn } from '@/shared/utils/utils';
import { useThemePreferences } from '@/features/Preferences';
import {
  gameContentVariants,
  getAnswerRowClassName,
  getGlassModeClassName,

  useTilesModeActionKey,
} from '@/shared/ui-composite/Game/TilesModeShared';
import TilesModeGrid from '@/shared/ui-composite/Game/TilesModeGrid';
import useClassicSessionStore from '@/shared/store/useClassicSessionStore';

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

interface KanaTilesModeProps {
  isHidden: boolean;
  /** Optional: externally controlled reverse mode. If not provided, uses internal useSmartReverseMode */
  isReverse?: boolean;
  /** Optional: externally controlled word length. If not provided, uses internal useTilesMode progression */
  wordLength?: number;
  /** Optional: callback when answer is correct. If not provided, handles internally */
  onCorrect?: (chars: string[]) => void;
  /** Optional: callback when answer is wrong. If not provided, handles internally */
  onWrong?: () => void;
}

const KanaTilesMode = ({
  isHidden,
  isReverse: externalIsReverse,
  wordLength: externalWordLength,
  onCorrect: externalOnCorrect,
  onWrong: externalOnWrong,
}: KanaTilesModeProps) => {
  const logAttempt = useClassicSessionStore(state => state.logAttempt);
  const isWordLengthControlled = externalWordLength !== undefined;
  // Smart reverse mode - used when not controlled externally
  const {
    isReverse: internalIsReverse,
    decideNextMode: decideNextReverseMode,
    recordWrongAnswer: recordReverseModeWrong,
  } = useSmartReverseMode();

  // Use external isReverse if provided, otherwise use internal smart mode
  const isReverse = externalIsReverse ?? internalIsReverse;
  const {
    wordLength: internalWordLength,
    decideNextMode: decideNextTilesProgression,
    recordWrongAnswer: recordTilesProgressionWrong,
    nextCelebrationMode,
  } = useTilesMode({
    minConsecutiveForTrigger: 0,
    baseProbability: 1,
    maxProbability: 1,
    enableAdaptiveWordLength: true,
    minWordLength: 1,
    maxWordLength: 3,
  });
  const wordLength = isWordLengthControlled ? externalWordLength : internalWordLength;

  const { startAnswerTimer, pauseAnswerTimer, getAnswerTimeMs, resetAnswerTimer } =
    useAnswerTimer();
  const { playCorrect } = useCorrect();
  const { playErrorTwice } = useError();
  const { playClick } = useClick();
  const { trigger: triggerCrazyMode } = useCrazyModeTrigger();
  const buttonRef = useRef<HTMLButtonElement>(null);

  const stats = useGameStats('kana');
  const { score, setScore } = stats;
  const incrementHiraganaCorrect = stats.incrementHiraganaCorrect!;
  const incrementKatakanaCorrect = stats.incrementKatakanaCorrect!;
  const {
    incrementWrongStreak,
    resetWrongStreak,
    recordAnswerTime,
    incrementCorrectAnswers,
    incrementWrongAnswers,
    addCharacterToHistory,
    incrementCharacterScore,
    addCorrectAnswerTime,
  } = stats;

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

  const {
    bottomBarState,
    setBottomBarState,
    placedTileIds,
    setPlacedTileIds,
    isChecking,
    setIsChecking,
    isCelebrating,
    setIsCelebrating,
    canCheck,
    showContinue,
    showTryAgain,
  } = useTilesModeState();

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
    const totalTileCount = wordLength <= 1 ? 3 : wordLength === 2 ? 4 : 5;
    if (sourceChars.length < totalTileCount) {
      return { wordChars: [], answerChars: [], allTiles: new Map() };
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

    const sortedTiles = [...answerChars, ...distractors].sort(
      () => random.real(0, 1) - 0.5,
    );

    const allTiles = new Map<number, string>();
    sortedTiles.forEach((char, i) => {
      allTiles.set(i, char);
    });

    return { wordChars, answerChars, allTiles };
  }, [generateWordDeps]);

  const [wordData, setWordData] = useState(() => generateWord());
  const hasInitializedResetRef = useRef(false);
  const previousWordLengthRef = useRef(wordLength);
  const skipNextWordLengthResetRef = useRef(false);

  const { handleTileClick, handleTryAgain } = useTilesModeHandlers({
    isChecking,
    bottomBarState,
    setPlacedTileIds,
    setIsChecking,
    setBottomBarState,
    startAnswerTimer,
    playClick,
  });

  const resetGame = useCallback(() => {
    const newWord = generateWord();
    setWordData(newWord);
    setPlacedTileIds([]);
    setIsChecking(false);
    setIsCelebrating(false);
    setBottomBarState('check');
    // Start timing for the new question
    startAnswerTimer();
  }, [
    generateWord,
    startAnswerTimer,
    setPlacedTileIds,
    setIsChecking,
    setIsCelebrating,
    setBottomBarState,
  ]);

  useEffect(() => {
    if (!hasInitializedResetRef.current) {
      hasInitializedResetRef.current = true;
      previousWordLengthRef.current = wordLength;
      resetGame();
      return;
    }

    const didWordLengthChange = previousWordLengthRef.current !== wordLength;
    previousWordLengthRef.current = wordLength;

    if (didWordLengthChange && skipNextWordLengthResetRef.current) {
      skipNextWordLengthResetRef.current = false;
      return;
    }

    skipNextWordLengthResetRef.current = false;
    resetGame();
  }, [isReverse, wordLength, resetGame]);

  // Pause timer when game is hidden
  useEffect(() => {
    if (isHidden) {
      pauseAnswerTimer();
    }
  }, [isHidden, pauseAnswerTimer]);

  // Keyboard shortcut for Enter/Space to trigger button
  useTilesModeActionKey(buttonRef);

  // Handle Check button
  const handleCheck = useCallback(() => {
    if (placedTileIds.length === 0) return;

    // Stop timing and record answer time
    pauseAnswerTimer();
    const answerTimeMs = getAnswerTimeMs();

    playClick();
    setIsChecking(true);

    let isCorrect = false;

    if (placedTileIds.length === wordData.answerChars.length) {
      const placedArray = placedTileIds.map(id => wordData.allTiles.get(id) ?? '');
      isCorrect = placedArray.every(
        (tile, i) => tile === wordData.answerChars[i],
      );
    }

    if (isCorrect) {
      // Record answer time for speed achievements
      addCorrectAnswerTime(answerTimeMs / 1000);
      recordAnswerTime(answerTimeMs);
      resetAnswerTimer();

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

      logAttempt({
        questionId: wordData.wordChars.join(''),
        questionPrompt: wordData.wordChars.join(''),
        expectedAnswers: [wordData.answerChars.join('')],
        userAnswer: placedTileIds
          .map(id => wordData.allTiles.get(id) ?? '')
          .join(''),
        inputKind: 'word_building',
        isCorrect: true,
        timeTakenMs: answerTimeMs,
        optionsShown: Array.from(wordData.allTiles.values()),
        extra: { isReverse, wordLength },
      });
    } else {
      resetAnswerTimer();
      playErrorTwice();
      triggerCrazyMode();
      incrementWrongStreak();
      incrementWrongAnswers();

      const placedArray = placedTileIds.map(id => wordData.allTiles.get(id) ?? '');
      wordData.wordChars.forEach((char, index) => {
        incrementCharacterScore(char, 'wrong');
        adaptiveSelector.updateCharacterWeight(
          char,
          placedArray[index] === wordData.answerChars[index],
        );
      });

      if (score - 1 >= 0) {
        setScore(score - 1);
      }

      setBottomBarState('wrong');

      // Reset smart reverse mode streak if not externally controlled
      if (externalIsReverse === undefined) {
        recordReverseModeWrong();
      }

      if (!isWordLengthControlled) {
        skipNextWordLengthResetRef.current = true;
        recordTilesProgressionWrong();
      }

      externalOnWrong?.();
      logAttempt({
        questionId: wordData.wordChars.join(''),
        questionPrompt: wordData.wordChars.join(''),
        expectedAnswers: [wordData.answerChars.join('')],
        userAnswer: placedTileIds
          .map(id => wordData.allTiles.get(id) ?? '')
          .join(''),
        inputKind: 'word_building',
        isCorrect: false,
        optionsShown: Array.from(wordData.allTiles.values()),
        extra: { isReverse, wordLength },
      });
    }
  }, [
    placedTileIds,
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
    recordReverseModeWrong,
    recordTilesProgressionWrong,
    logAttempt,
    isReverse,
    wordLength,
    isWordLengthControlled,
    addCorrectAnswerTime,
    recordAnswerTime,
    pauseAnswerTimer,
    getAnswerTimeMs,
    resetAnswerTimer,
  ]);

  // Handle Continue button (only for correct answers)
  const handleContinue = useCallback(() => {
    playClick();
    if (externalIsReverse === undefined) {
      decideNextReverseMode();
    }
    if (!isWordLengthControlled) {
      decideNextTilesProgression();
    }
    externalOnCorrect?.(wordData.wordChars);
    resetGame();
  }, [
    playClick,
    externalIsReverse,
    decideNextReverseMode,
    isWordLengthControlled,
    decideNextTilesProgression,
    externalOnCorrect,
    wordData.wordChars,
    resetGame,
  ]);

  // Not enough characters for tiles mode
  const requiredTileCount = wordLength <= 1 ? 3 : wordLength === 2 ? 4 : 5;
  if (
    selectedKana.length < requiredTileCount ||
    wordData.wordChars.length === 0
  ) {
    return null;
  }

  return (
    <div
      className={clsx(
        'flex w-full flex-col items-center gap-6 sm:w-4/5 sm:gap-10',
        isHidden && 'hidden',
      )}
    >
      {/* <GameIntel gameMode='tiles' /> */}

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
              className={getGlassModeClassName(
                'flex flex-row items-center gap-1',
                isGlassMode,
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

          <TilesModeGrid
            allTiles={wordData.allTiles}
            placedTileIds={placedTileIds}
            onTileClick={handleTileClick}
            isTileDisabled={isChecking && bottomBarState !== 'wrong'}
            isCelebrating={isCelebrating}
            celebrationMode={nextCelebrationMode}
            tilesPerRow={3}
            tileSizeClassName='text-2xl sm:text-3xl'
            answerRowClassName={getAnswerRowClassName()}
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

export default KanaTilesMode;

