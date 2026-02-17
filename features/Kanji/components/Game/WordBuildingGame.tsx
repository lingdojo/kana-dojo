'use client';
import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import clsx from 'clsx';
import useKanjiStore, { IKanjiObj } from '@/features/Kanji/store/useKanjiStore';
import { Random } from 'random-js';
import { useCorrect, useError, useClick } from '@/shared/hooks/useAudio';
import { getGlobalAdaptiveSelector } from '@/shared/lib/adaptiveSelection';
import Stars from '@/shared/components/Game/Stars';
import { useCrazyModeTrigger } from '@/features/CrazyMode/hooks/useCrazyModeTrigger';
import { useStatsStore } from '@/features/Progress';
import { useShallow } from 'zustand/react/shallow';
import { useStopwatch } from 'react-timer-hook';
import { useSmartReverseMode } from '@/shared/hooks/useSmartReverseMode';
import { GameBottomBar } from '@/shared/components/Game/GameBottomBar';
import FuriganaText from '@/shared/components/text/FuriganaText';
import AnswerSummary from '@/shared/components/Game/AnswerSummary';
import { CircleCheck } from 'lucide-react';
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


interface KanjiWordBuildingGameProps {
  selectedKanjiObjs: IKanjiObj[];
  isHidden: boolean;
  /** Optional: externally controlled reverse mode. If not provided, uses internal useSmartReverseMode */
  isReverse?: boolean;
  /** Optional: number of distractor tiles. Defaults to 3 (so 4 total options) */
  distractorCount?: number;
  /** Optional: callback when answer is correct */
  onCorrect?: (chars: string[]) => void;
  /** Optional: callback when answer is wrong */
  onWrong?: () => void;
}

const KanjiWordBuildingGame = ({
  selectedKanjiObjs,
  isHidden,
  isReverse: externalIsReverse,
  distractorCount: externalDistractorCount = 3,
  onCorrect: externalOnCorrect,
  onWrong: externalOnWrong,
}: KanjiWordBuildingGameProps) => {
  // Smart reverse mode - used when not controlled externally
  const {
    isReverse: internalIsReverse,
    decideNextMode: decideNextReverseMode,
    recordWrongAnswer: recordReverseModeWrong,
  } = useSmartReverseMode();

  // Use external isReverse if provided, otherwise use internal smart mode
  const isReverse = externalIsReverse ?? internalIsReverse;
  const distractorCount = Math.min(
    externalDistractorCount,
    selectedKanjiObjs.length - 1,
  );

  // Get the current JLPT level from the Kanji store
  const selectedKanjiCollection = useKanjiStore(
    state => state.selectedKanjiCollection,
  );
  const isGlassMode = useThemePreferences().isGlassMode;

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
    incrementKanjiCorrect,
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
      incrementKanjiCorrect: state.incrementKanjiCorrect,
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

  // Create Map for O(1) lookups
  const kanjiObjMap = useMemo(
    () => new Map(selectedKanjiObjs.map(obj => [obj.kanjiChar, obj])),
    [selectedKanjiObjs],
  );

  const [bottomBarState, setBottomBarState] = useState<BottomBarState>('check');

  // Generate question: 1 kanji with multiple answer options
  const generateQuestion = useCallback(() => {
    if (selectedKanjiObjs.length === 0) {
      return { kanjiChar: '', correctAnswer: '', allTiles: [] };
    }

    // Select a kanji using adaptive selection
    const kanjiChars = selectedKanjiObjs.map(obj => obj.kanjiChar);
    const selectedKanji = adaptiveSelector.selectWeightedCharacter(kanjiChars);
    adaptiveSelector.markCharacterSeen(selectedKanji);

    const selectedKanjiObj = kanjiObjMap.get(selectedKanji);
    if (!selectedKanjiObj) {
      return { kanjiChar: '', correctAnswer: '', allTiles: [] };
    }

    // In normal mode: show kanji, answer with meaning
    // In reverse mode: show meaning, answer with kanji
    const correctAnswer = isReverse
      ? selectedKanji
      : selectedKanjiObj.meanings[0];

    // Generate distractors
    const distractorSource = isReverse
      ? selectedKanjiObjs
          .filter(obj => obj.kanjiChar !== selectedKanji)
          .map(obj => obj.kanjiChar)
      : selectedKanjiObjs
          .filter(obj => obj.kanjiChar !== selectedKanji)
          .map(obj => obj.meanings[0]);

    const distractors = distractorSource
      .sort(() => random.real(0, 1) - 0.5)
      .slice(0, distractorCount);

    // Shuffle all tiles
    const allTiles = [correctAnswer, ...distractors].sort(
      () => random.real(0, 1) - 0.5,
    );

    return {
      kanjiChar: selectedKanji,
      correctAnswer,
      allTiles,
      displayChar: isReverse ? selectedKanjiObj.meanings[0] : selectedKanji,
    };
  }, [isReverse, selectedKanjiObjs, distractorCount, kanjiObjMap]);

  const [questionData, setQuestionData] = useState(() => generateQuestion());
  const [placedTiles, setPlacedTiles] = useState<string[]>([]);
  const [isChecking, setIsChecking] = useState(false);
  const [isCelebrating, setIsCelebrating] = useState(false);
  const [displayAnswerSummary, setDisplayAnswerSummary] = useState(false);
  const [currentKanjiObjForSummary, setCurrentKanjiObjForSummary] =
    useState<IKanjiObj | null>(null);
  const [feedback, setFeedback] = useState<React.ReactElement>(
    <>{'feedback ~'}</>,
  );

  const resetGame = useCallback(() => {
    const newQuestion = generateQuestion();
    setQuestionData(newQuestion);
    setPlacedTiles([]);
    setIsChecking(false);
    setIsCelebrating(false);
    setBottomBarState('check');
    setDisplayAnswerSummary(false);
    // Start timing for the new question
    speedStopwatch.reset();
    speedStopwatch.start();
  }, [generateQuestion]);

  useEffect(() => {
    resetGame();
  }, [isReverse, resetGame]);

  // Pause stopwatch when game is hidden
  useEffect(() => {
    if (isHidden) {
      speedStopwatch.pause();
    }
  }, [isHidden]);

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

    // Correct if exactly one tile placed and it matches the correct answer
    const isCorrect =
      placedTiles.length === 1 && placedTiles[0] === questionData.correctAnswer;

    if (isCorrect) {
      // Record answer time for speed achievements
      addCorrectAnswerTime(answerTimeMs / 1000);
      recordAnswerTime(answerTimeMs);
      speedStopwatch.reset();

      playCorrect();
      triggerCrazyMode();
      resetWrongStreak();

      // Track stats for the kanji
      addCharacterToHistory(questionData.kanjiChar);
      incrementCharacterScore(questionData.kanjiChar, 'correct');
      adaptiveSelector.updateCharacterWeight(questionData.kanjiChar, true);
      incrementKanjiCorrect(selectedKanjiCollection.toUpperCase());

      incrementCorrectAnswers();
      setScore(score + 1);
      setBottomBarState('correct');
      setIsCelebrating(true);
      setDisplayAnswerSummary(true);
      // Store the current kanji object for summary display
      setCurrentKanjiObjForSummary(selectedKanjiObj || null);
      // Set feedback for the summary
      const displayText = isReverse
        ? selectedKanjiObj?.meanings[0]
        : questionData.kanjiChar;
      setFeedback(
        <>
          <span className='text-(--secondary-color)'>{`${displayText} = ${questionData.correctAnswer} `}</span>
          <CircleCheck className='inline text-(--main-color)' />
        </>,
      );

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

      incrementCharacterScore(questionData.kanjiChar, 'wrong');
      adaptiveSelector.updateCharacterWeight(questionData.kanjiChar, false);

      if (score - 1 >= 0) {
        setScore(score - 1);
      }

      setBottomBarState('wrong');

      // Reset smart reverse mode streak if not externally controlled
      if (externalIsReverse === undefined) {
        recordReverseModeWrong();
      }

      externalOnWrong?.();
    }
  }, [
    placedTiles,
    questionData,
    playClick,
    playCorrect,
    playErrorTwice,
    triggerCrazyMode,
    resetWrongStreak,
    incrementWrongStreak,
    addCharacterToHistory,
    incrementCharacterScore,
    incrementKanjiCorrect,
    selectedKanjiCollection,
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
  ]);

  // Handle Continue button (only for correct answers)
  const handleContinue = useCallback(() => {
    playClick();
    setDisplayAnswerSummary(false);
    externalOnCorrect?.([questionData.kanjiChar]);
    resetGame();
  }, [playClick, externalOnCorrect, questionData.kanjiChar, resetGame]);

  // Handle Try Again button (for wrong answers)
  const handleTryAgain = useCallback(() => {
    playClick();
    setPlacedTiles([]);
    setIsChecking(false);
    setBottomBarState('check');
    speedStopwatch.reset();
    speedStopwatch.start();
  }, [playClick]);

  // Handle tile click - add or remove from placed tiles
  const handleTileClick = useCallback(
    (char: string) => {
      if (isChecking && bottomBarState !== 'wrong') return;

      playClick();

      // If in wrong state, reset to check state and continue with normal tile logic
      if (bottomBarState === 'wrong') {
        setIsChecking(false);
        setBottomBarState('check');
        speedStopwatch.reset();
        speedStopwatch.start();
      }

      // Toggle tile in placed tiles array
      if (placedTiles.includes(char)) {
        setPlacedTiles(prev => prev.filter(c => c !== char));
      } else {
        setPlacedTiles(prev => [...prev, char]);
      }
    },
    [isChecking, bottomBarState, placedTiles, playClick],
  );

  // Not enough characters
  if (selectedKanjiObjs.length < 2 || !questionData.kanjiChar) {
    return null;
  }

  const canCheck = placedTiles.length > 0 && !isChecking;
  const showContinue = bottomBarState === 'correct';
  const showTryAgain = bottomBarState === 'wrong';

  // Helper to get reading for a kanji tile
  const getKanjiReading = (kanjiChar: string) => {
    const obj = kanjiObjMap.get(kanjiChar);
    return obj?.onyomi[0] || obj?.kunyomi[0];
  };

  // Get the kanji object for display
  const currentKanjiObj = kanjiObjMap.get(questionData.kanjiChar);

  // Get the selected kanji object for correct answer handling
  const selectedKanjiObj = kanjiObjMap.get(questionData.kanjiChar);

  return (
    <div
      className={clsx(
        'flex w-full flex-col items-center gap-6 sm:w-4/5 sm:gap-10',
        isHidden && 'hidden',
      )}
    >
      <AnimatePresence mode='wait'>
        {/* Answer Summary - displayed after correct answer */}
        {displayAnswerSummary && currentKanjiObjForSummary && (
          <AnswerSummary
            payload={currentKanjiObjForSummary}
            setDisplayAnswerSummary={setDisplayAnswerSummary}
            feedback={feedback}
            isEmbedded={true}
          />
        )}

        {/* Game Content - Question, Answer Row, and Tiles */}
        {!displayAnswerSummary && (
          <motion.div
            key='game-content'
            variants={gameContentVariants}
            initial='hidden'
            animate='visible'
            exit='exit'
            className='flex w-full flex-col items-center gap-6 sm:gap-10'
          >
            {/* Question Display - shows kanji in normal mode, meaning in reverse mode */}
            <div
              className={cn(
                'flex flex-row items-center gap-1',
                isGlassMode && 'rounded-xl bg-(--card-color) px-4 py-2',
              )}
            >
              <motion.div
                className='flex flex-row items-center gap-2'
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                key={questionData.kanjiChar}
              >
                <span
                  className={clsx(
                    isReverse ? 'text-5xl sm:text-6xl' : 'text-8xl sm:text-9xl',
                  )}
                  lang={!isReverse ? 'ja' : undefined}
                >
                  {!isReverse ? (
                    <FuriganaText
                      text={questionData.kanjiChar}
                      reading={getKanjiReading(questionData.kanjiChar)}
                    />
                  ) : (
                    currentKanjiObj?.meanings[0]
                  )}
                </span>
              </motion.div>
            </div>

            <WordBuildingTilesGrid
              allTiles={questionData.allTiles}
              placedTiles={placedTiles}
              onTileClick={handleTileClick}
              isTileDisabled={isChecking && bottomBarState !== 'wrong'}
              isCelebrating={isCelebrating}
              tilesPerRow={2}
              tileSizeClassName={
                isReverse ? 'text-3xl sm:text-4xl' : 'text-xl sm:text-2xl'
              }
              tileLang={isReverse ? 'ja' : undefined}
              answerRowClassName={clsx(
                'flex w-full items-center border-b-2 border-(--border-color) px-2 pb-2 md:w-3/4 lg:w-2/3 xl:w-1/2',
                isReverse ? 'min-h-[5.5rem]' : 'min-h-[5rem]',
              )}
              tilesContainerClassName={
                isGlassMode ? 'rounded-xl bg-(--card-color) px-4 py-2' : undefined
              }
              tilesWrapperKey={questionData.kanjiChar}
            />
          </motion.div>
        )}
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
        feedbackContent={questionData.correctAnswer}
        buttonRef={buttonRef}
      />

      {/* Spacer */}
      <div className='h-32' />
    </div>
  );
};

export default KanjiWordBuildingGame;
