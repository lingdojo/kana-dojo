'use client';
import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import clsx from 'clsx';
import useKanjiStore, { IKanjiObj } from '@/features/Kanji/store/useKanjiStore';
import { Random } from 'random-js';
import { useCorrect, useError, useClick } from '@/shared/hooks/generic/useAudio';
import { getGlobalAdaptiveSelector } from '@/shared/utils/adaptiveSelection';
import Stars from '@/shared/ui-composite/Game/Stars';
import { useCrazyModeTrigger } from '@/features/CrazyMode/hooks/useCrazyModeTrigger';
import { useAnswerTimer } from '@/shared/hooks/game/useAnswerTimer';
import { useGameStats } from '@/shared/hooks/game/useGameStats';
import { useSmartReverseMode } from '@/shared/hooks/game/useSmartReverseMode';
import { useTilesMode } from '@/shared/hooks/game/useTilesMode';
import { useTilesModeHandlers } from '@/shared/hooks/game/useTilesModeHandlers';
import { useTilesModeState } from '@/shared/hooks/game/useTilesModeState';
import { GameBottomBar } from '@/shared/ui-composite/Game/GameBottomBar';
import FuriganaText from '@/shared/ui-composite/text/FuriganaText';
import AnswerSummary from '@/shared/ui-composite/Game/AnswerSummary';
import { CircleCheck } from 'lucide-react';
import { useThemePreferences } from '@/features/Preferences';
import {
  gameContentVariants,
  getAnswerRowClassName,
  getGlassModeClassName,
  useTilesModeActionKey,
} from '@/shared/ui-composite/Game/TilesModeShared';
import TilesModeGrid from '@/shared/ui-composite/Game/TilesModeGrid';
import useClassicSessionStore from '@/shared/store/useClassicSessionStore';
import useSetProgressStore from '@/features/Progress/store/useSetProgressStore';

const random = new Random();
const adaptiveSelector = getGlobalAdaptiveSelector();


interface KanjiTilesModeProps {
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

const KanjiTilesMode = ({
  selectedKanjiObjs,
  isHidden,
  isReverse: externalIsReverse,
  distractorCount: externalDistractorCount = 3,
  onCorrect: externalOnCorrect,
  onWrong: externalOnWrong,
}: KanjiTilesModeProps) => {
  const logAttempt = useClassicSessionStore(state => state.logAttempt);
  const recordKanjiProgress = useSetProgressStore(
    state => state.recordKanjiProgress,
  );
  // Smart reverse mode - used when not controlled externally
  const {
    isReverse: internalIsReverse,
    decideNextMode: decideNextReverseMode,
    recordWrongAnswer: recordReverseModeWrong,
  } = useSmartReverseMode();
  const {
    decideNextMode: decideNextTilesCelebrationMode,
    nextCelebrationMode,
  } = useTilesMode({
    minConsecutiveForTrigger: 0,
    baseProbability: 1,
    maxProbability: 1,
    enableAdaptiveWordLength: false,
  });

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

  const { startAnswerTimer, pauseAnswerTimer, getAnswerTimeMs, resetAnswerTimer } =
    useAnswerTimer();
  const { playCorrect } = useCorrect();
  const { playErrorTwice } = useError();
  const { playClick } = useClick();
  const { trigger: triggerCrazyMode } = useCrazyModeTrigger();
  const buttonRef = useRef<HTMLButtonElement>(null);

  const stats = useGameStats('kanji');
  const { score, setScore } = stats;
  const incrementKanjiCorrect = stats.incrementKanjiCorrect!;
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

  // Create Map for O(1) lookups
  const kanjiObjMap = useMemo(
    () => new Map(selectedKanjiObjs.map(obj => [obj.kanjiChar, obj])),
    [selectedKanjiObjs],
  );

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

  // Generate question: 1 kanji with multiple answer options
  const generateQuestion = useCallback(() => {
    if (selectedKanjiObjs.length === 0) {
      return { kanjiChar: '', correctAnswer: '', allTiles: new Map() };
    }

    // Select a kanji using adaptive selection
    const kanjiChars = selectedKanjiObjs.map(obj => obj.kanjiChar);
    const selectedKanji = adaptiveSelector.selectWeightedCharacter(kanjiChars);
    adaptiveSelector.markCharacterSeen(selectedKanji);

    const selectedKanjiObj = kanjiObjMap.get(selectedKanji);
    if (!selectedKanjiObj) {
      return { kanjiChar: '', correctAnswer: '', allTiles: new Map() };
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
    const sortedTiles = [correctAnswer, ...distractors].sort(
      () => random.real(0, 1) - 0.5,
    );
    const allTiles = new Map<number, string>();
    sortedTiles.forEach((char, i) => {
      allTiles.set(i, char);
    });

    return {
      kanjiChar: selectedKanji,
      correctAnswer,
      allTiles,
      displayChar: isReverse ? selectedKanjiObj.meanings[0] : selectedKanji,
    };
  }, [isReverse, selectedKanjiObjs, distractorCount, kanjiObjMap]);

  const [questionData, setQuestionData] = useState(() => generateQuestion());
  const [displayAnswerSummary, setDisplayAnswerSummary] = useState(false);
  const [currentKanjiObjForSummary, setCurrentKanjiObjForSummary] =
    useState<IKanjiObj | null>(null);
  const [feedback, setFeedback] = useState<React.ReactElement>(
    <>{'feedback ~'}</>,
  );
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
    const newQuestion = generateQuestion();
    setQuestionData(newQuestion);
    setPlacedTileIds([]);
    setIsChecking(false);
    setIsCelebrating(false);
    setBottomBarState('check');
    setDisplayAnswerSummary(false);
    // Start timing for the new question
    startAnswerTimer();
  }, [
    generateQuestion,
    startAnswerTimer,
    setPlacedTileIds,
    setIsChecking,
    setIsCelebrating,
    setBottomBarState,
  ]);

  useEffect(() => {
    resetGame();
  }, [isReverse, resetGame]);

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

    // Correct if exactly one tile placed and it matches the correct answer
    const selectedTileChar = questionData.allTiles.get(placedTileIds[0]);
    const isCorrect =
      placedTileIds.length === 1 &&
      selectedTileChar === questionData.correctAnswer;

    if (isCorrect) {
      // Record answer time for speed achievements
      addCorrectAnswerTime(answerTimeMs / 1000);
      recordAnswerTime(answerTimeMs);
      resetAnswerTimer();

      playCorrect();
      triggerCrazyMode();
      resetWrongStreak();

      // Track stats for the kanji
      addCharacterToHistory(questionData.kanjiChar);
      incrementCharacterScore(questionData.kanjiChar, 'correct');
      void recordKanjiProgress(questionData.kanjiChar);
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
      logAttempt({
        questionId: questionData.kanjiChar,
        questionPrompt: String(questionData.displayChar ?? questionData.kanjiChar),
        expectedAnswers: [questionData.correctAnswer],
        userAnswer: String(selectedTileChar ?? ''),
        inputKind: 'word_building',
        isCorrect: true,
        timeTakenMs: answerTimeMs,
        optionsShown: Array.from(questionData.allTiles.values()),
        extra: {
          contentType: 'kanji',
          canonicalItemKey: questionData.kanjiChar,
          isReverse,
        },
      });
    } else {
      resetAnswerTimer();
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
      logAttempt({
        questionId: questionData.kanjiChar,
        questionPrompt: String(questionData.displayChar ?? questionData.kanjiChar),
        expectedAnswers: [questionData.correctAnswer],
        userAnswer: String(selectedTileChar ?? ''),
        inputKind: 'word_building',
        isCorrect: false,
        optionsShown: Array.from(questionData.allTiles.values()),
        extra: {
          contentType: 'kanji',
          canonicalItemKey: questionData.kanjiChar,
          isReverse,
        },
      });
    }
  }, [
    placedTileIds,
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
    logAttempt,
    isReverse,
    addCorrectAnswerTime,
    recordAnswerTime,
    pauseAnswerTimer,
    getAnswerTimeMs,
    resetAnswerTimer,
    setIsChecking,
    setBottomBarState,
    setIsCelebrating,
  ]);

  // Handle Continue button (only for correct answers)
  const handleContinue = useCallback(() => {
    playClick();
    setDisplayAnswerSummary(false);
    if (externalIsReverse === undefined) {
      decideNextReverseMode();
    }
    decideNextTilesCelebrationMode();
    externalOnCorrect?.([questionData.kanjiChar]);
    resetGame();
  }, [
    playClick,
    externalIsReverse,
    decideNextReverseMode,
    decideNextTilesCelebrationMode,
    externalOnCorrect,
    questionData.kanjiChar,
    resetGame,
  ]);

  // Not enough characters
  if (selectedKanjiObjs.length < 2 || !questionData.kanjiChar) {
    return null;
  }

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
              className={getGlassModeClassName(
                'flex flex-row items-center gap-1',
                isGlassMode,
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

            <TilesModeGrid
              allTiles={questionData.allTiles}
              placedTileIds={placedTileIds}
              onTileClick={handleTileClick}
              isTileDisabled={isChecking && bottomBarState !== 'wrong'}
              isCelebrating={isCelebrating}
              celebrationMode={nextCelebrationMode}
              tilesPerRow={2}
              tileSizeClassName={
                isReverse ? 'text-3xl sm:text-4xl' : 'text-xl sm:text-2xl'
              }
              tileLang={isReverse ? 'ja' : undefined}
              answerRowClassName={getAnswerRowClassName(
                isReverse ? '5.5rem' : '5rem',
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

export default KanjiTilesMode;
