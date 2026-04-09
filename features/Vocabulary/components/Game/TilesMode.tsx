'use client';
import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import clsx from 'clsx';
import useVocabStore, {
  IVocabObj,
} from '@/features/Vocabulary/store/useVocabStore';
import { Random } from 'random-js';
import { useCorrect, useError, useClick } from '@/shared/hooks/generic/useAudio';
import { getGlobalAdaptiveSelector } from '@/shared/lib/adaptiveSelection';
import Stars from '@/shared/components/Game/Stars';
import { useCrazyModeTrigger } from '@/features/CrazyMode/hooks/useCrazyModeTrigger';
import { useStatsStore } from '@/features/Progress';
import { useShallow } from 'zustand/react/shallow';
import { useStopwatch } from 'react-timer-hook';
import { useSmartReverseMode } from '@/shared/hooks/game/useSmartReverseMode';
import { useTilesMode } from '@/shared/hooks/game/useTilesMode';
import { GameBottomBar } from '@/shared/components/Game/GameBottomBar';
import FuriganaText from '@/shared/components/text/FuriganaText';
import AnswerSummary from '@/shared/components/Game/AnswerSummary';
import { CircleCheck } from 'lucide-react';
import SSRAudioButton from '@/shared/components/audio/SSRAudioButton';
import { cn } from '@/shared/lib/utils';
import { useThemePreferences } from '@/features/Preferences';
import {
  BottomBarState,
  gameContentVariants,
  useTilesModeActionKey,
} from '@/shared/components/Game/TilesModeShared';
import TilesModeGrid from '@/shared/components/Game/TilesModeGrid';
import useClassicSessionStore from '@/shared/store/useClassicSessionStore';

const random = new Random();
const adaptiveSelector = getGlobalAdaptiveSelector();

// Helper function to check if a word contains kanji characters
// Kanji are in the CJK Unified Ideographs range (U+4E00 to U+9FAF)
const containsKanji = (text: string): boolean => {
  return /[\u4E00-\u9FAF]/.test(text);
};

const normalizeOption = (value: string | undefined | null): string | null => {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
};

interface VocabTilesModeProps {
  selectedWordObjs: IVocabObj[];
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

const VocabTilesMode = ({
  selectedWordObjs,
  isHidden,
  isReverse: externalIsReverse,
  distractorCount: externalDistractorCount = 3,
  onCorrect: externalOnCorrect,
  onWrong: externalOnWrong,
}: VocabTilesModeProps) => {
  const logAttempt = useClassicSessionStore(state => state.logAttempt);
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
    selectedWordObjs.length - 1,
  );

  // Get the current vocabulary collection from the Vocab store
  const selectedVocabCollection = useVocabStore(
    state => state.selectedVocabCollection,
  );
  const isGlassMode = useThemePreferences().isGlassMode;

  // Answer timing for speed achievements
  const speedStopwatch = useStopwatch({ autoStart: false });
  const { playCorrect } = useCorrect();
  const { playErrorTwice } = useError();
  const { playClick } = useClick();
  const { trigger: triggerCrazyMode } = useCrazyModeTrigger();
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Debounce ref to prevent rapid key presses from skipping AnswerSummary
  const lastActionTimeRef = useRef<number>(0);
  const DEBOUNCE_MS = 300; // Minimum time between actions

  const {
    score,
    setScore,
    incrementVocabularyCorrect,
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
      incrementVocabularyCorrect: state.incrementVocabularyCorrect,
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
  const wordObjMap = useMemo(
    () => new Map(selectedWordObjs.map(obj => [obj.word, obj])),
    [selectedWordObjs],
  );

  const [bottomBarState, setBottomBarState] = useState<BottomBarState>('check');

  // Quiz type: 'meaning' or 'reading' - alternates for kanji-containing words
  const [quizType, setQuizType] = useState<'meaning' | 'reading'>('meaning');

  // Generate question: 1 word with multiple answer options
  const generateQuestion = useCallback(
    (currentQuizType: 'meaning' | 'reading') => {
      if (selectedWordObjs.length === 0) {
        return {
          word: '',
          wordObj: null as IVocabObj | null,
          correctAnswer: '',
          allTiles: new Map<number, string>(),
          quizType: currentQuizType,
        };
      }

      // Select a word using adaptive selection
      const words = selectedWordObjs.map(obj => obj.word);
      const selectedWord = adaptiveSelector.selectWeightedCharacter(words);
      adaptiveSelector.markCharacterSeen(selectedWord);

      const selectedWordObj = wordObjMap.get(selectedWord);
      if (!selectedWordObj) {
        return {
          word: '',
          wordObj: null as IVocabObj | null,
          correctAnswer: '',
          allTiles: new Map<number, string>(),
          quizType: currentQuizType,
        };
      }

      // Adjust quiz type based on the selected word
      // Skip reading quiz for kana-only words since reading === word (pointless exercise)
      let effectiveQuizType = currentQuizType;
      if (currentQuizType === 'reading' && !containsKanji(selectedWord)) {
        effectiveQuizType = 'meaning';
      }

      // Determine correct answer based on quiz type and mode
      let correctAnswerRaw: string | undefined;
      let distractorSourceRaw: Array<string | undefined>;

      if (effectiveQuizType === 'reading') {
        // Reading quiz: answer is always the reading
        correctAnswerRaw = selectedWordObj.reading;
        distractorSourceRaw = selectedWordObjs
          .filter(obj => obj.word !== selectedWord)
          .map(obj => obj.reading);
      } else {
        // Meaning quiz
        if (isReverse) {
          // Reverse: show meaning, answer is word
          correctAnswerRaw = selectedWord;
          distractorSourceRaw = selectedWordObjs
            .filter(obj => obj.word !== selectedWord)
            .map(obj => obj.word);
        } else {
          // Normal: show word, answer is meaning
          correctAnswerRaw = selectedWordObj.meanings[0];
          distractorSourceRaw = selectedWordObjs
            .filter(obj => obj.word !== selectedWord)
            .map(obj => obj.meanings[0]);
        }
      }

      const correctAnswer = normalizeOption(correctAnswerRaw);
      if (!correctAnswer) {
        return {
          word: '',
          wordObj: null as IVocabObj | null,
          correctAnswer: '',
          allTiles: new Map<number, string>(),
          quizType: effectiveQuizType,
        };
      }

      const distractors = distractorSourceRaw
        .map(normalizeOption)
        .filter((value): value is string => value !== null)
        .filter(option => option !== correctAnswer)
        .filter((option, idx, arr) => arr.indexOf(option) === idx)
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
        word: selectedWord,
        wordObj: selectedWordObj, // Store the object directly!
        correctAnswer,
        allTiles,
        displayChar: isReverse ? selectedWordObj.meanings[0] : selectedWord,
        quizType: effectiveQuizType, // Use the effective quiz type (adjusted for kana words)
      };
    },
    [isReverse, selectedWordObjs, distractorCount, wordObjMap],
  );

  const [questionData, setQuestionData] = useState(() =>
    generateQuestion(quizType),
  );
  const [promptSequence, setPromptSequence] = useState(0);
  const [placedTileIds, setPlacedTileIds] = useState<number[]>([]);
  const [isChecking, setIsChecking] = useState(false);
  const [isCelebrating, setIsCelebrating] = useState(false);
  const [displayAnswerSummary, setDisplayAnswerSummary] = useState(false);
  const [currentWordObjForSummary, setCurrentWordObjForSummary] =
    useState<IVocabObj | null>(null);
  const [feedback, setFeedback] = useState<React.ReactElement>(
    <>{'feedback ~'}</>,
  );

  // Determine next quiz type based on word content
  const getNextQuizType = useCallback(
    (
      word: string,
      currentType: 'meaning' | 'reading',
    ): 'meaning' | 'reading' => {
      // Only toggle to reading quiz if the word contains kanji
      // Pure kana words skip reading quiz since reading === word
      if (containsKanji(word)) {
        return currentType === 'meaning' ? 'reading' : 'meaning';
      }
      // For pure kana words, always use meaning quiz
      return 'meaning';
    },
    [],
  );

  const resetGame = useCallback(
    (nextQuizType?: 'meaning' | 'reading') => {
      const typeToUse = nextQuizType ?? quizType;
      const newQuestion = generateQuestion(typeToUse);
      setQuestionData(newQuestion);
      setPromptSequence(prev => prev + 1);
      setPlacedTileIds([]);
      setIsChecking(false);
      setIsCelebrating(false);
      setBottomBarState('check');
      setDisplayAnswerSummary(false);
      // Start timing for the new question
      speedStopwatch.reset();
      speedStopwatch.start();
    },
    [generateQuestion, quizType],
  );

  // Only reset game on isReverse change if we're NOT showing the answer summary
  // This prevents the summary from being hidden when smart reverse mode changes after a correct answer
  useEffect(() => {
    if (!displayAnswerSummary) {
      resetGame();
    }
  }, [isReverse, resetGame, displayAnswerSummary]);

  // Pause stopwatch when game is hidden
  useEffect(() => {
    if (isHidden) {
      speedStopwatch.pause();
    }
  }, [isHidden]);

  // Keyboard shortcut for Enter/Space to trigger button
  useTilesModeActionKey(buttonRef);

  // Handle Check button
  const handleCheck = useCallback(() => {
    if (placedTileIds.length === 0) return;

    // Debounce: prevent rapid button presses
    const now = Date.now();
    if (now - lastActionTimeRef.current < DEBOUNCE_MS) return;
    lastActionTimeRef.current = now;

    // Stop timing and record answer time
    speedStopwatch.pause();
    const answerTimeMs = speedStopwatch.totalMilliseconds;

    playClick();
    setIsChecking(true);

    // Correct if exactly one tile placed and it matches the correct answer
    const selectedTileChar = questionData.allTiles.get(placedTileIds[0]);
    const isCorrect =
      placedTileIds.length === 1 &&
      selectedTileChar === questionData.correctAnswer;

    // Use the word object stored with the question (guaranteed to be correct)
    const selectedWordObj = questionData.wordObj;

    if (isCorrect) {
      // Record answer time for speed achievements
      addCorrectAnswerTime(answerTimeMs / 1000);
      recordAnswerTime(answerTimeMs);
      speedStopwatch.reset();

      playCorrect();
      triggerCrazyMode();
      resetWrongStreak();

      // Track stats for the word
      addCharacterToHistory(questionData.word);
      incrementCharacterScore(questionData.word, 'correct');
      adaptiveSelector.updateCharacterWeight(questionData.word, true);
      incrementVocabularyCorrect();

      incrementCorrectAnswers();
      setScore(score + 1);
      setBottomBarState('correct');
      setIsCelebrating(true);

      // Use the word object stored with the question - guaranteed to be valid
      // since the question wouldn't have been generated without it
      if (selectedWordObj) {
        setCurrentWordObjForSummary(selectedWordObj);
        setDisplayAnswerSummary(true);
      }

      // Set feedback for the summary
      // displayText should match what was shown as the question
      const displayText =
        quizType === 'meaning' && isReverse
          ? selectedWordObj?.meanings[0] // meaning+reverse: showed meaning
          : questionData.word; // meaning+normal or reading: showed word
      setFeedback(
        <>
          <span className='text-(--secondary-color)'>{`${displayText} = ${questionData.correctAnswer} `}</span>
          <CircleCheck className='inline text-(--main-color)' />
        </>,
      );
      logAttempt({
        questionId: questionData.word,
        questionPrompt: String(
          questionData.quizType === 'meaning' && isReverse
            ? questionData.wordObj?.meanings?.[0] ?? questionData.word
            : questionData.word,
        ),
        expectedAnswers: [questionData.correctAnswer],
        userAnswer: String(selectedTileChar ?? ''),
        inputKind: 'word_building',
        isCorrect: true,
        timeTakenMs: answerTimeMs,
        optionsShown: Array.from(questionData.allTiles.values()),
        extra: { isReverse, quizType: questionData.quizType },
      });
    } else {
      speedStopwatch.reset();
      playErrorTwice();
      triggerCrazyMode();
      incrementWrongStreak();
      incrementWrongAnswers();

      incrementCharacterScore(questionData.word, 'wrong');
      adaptiveSelector.updateCharacterWeight(questionData.word, false);

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
        questionId: questionData.word,
        questionPrompt: String(
          questionData.quizType === 'meaning' && isReverse
            ? questionData.wordObj?.meanings?.[0] ?? questionData.word
            : questionData.word,
        ),
        expectedAnswers: [questionData.correctAnswer],
        userAnswer: String(selectedTileChar ?? ''),
        inputKind: 'word_building',
        isCorrect: false,
        optionsShown: Array.from(questionData.allTiles.values()),
        extra: { isReverse, quizType: questionData.quizType },
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
    incrementVocabularyCorrect,
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
    isReverse,
    quizType,
  ]);

  // Handle Continue button (only for correct answers)
  const handleContinue = useCallback(() => {
    // Debounce: prevent rapid button presses from skipping summary
    const now = Date.now();
    if (now - lastActionTimeRef.current < DEBOUNCE_MS) return;
    lastActionTimeRef.current = now;

    playClick();
    setDisplayAnswerSummary(false);
    if (externalIsReverse === undefined) {
      decideNextReverseMode();
    }
    decideNextTilesCelebrationMode();
    externalOnCorrect?.([questionData.word]);

    // Determine next quiz type based on word content
    const nextType = getNextQuizType(questionData.word, quizType);
    setQuizType(nextType);
    resetGame(nextType);
  }, [
    playClick,
    externalIsReverse,
    decideNextReverseMode,
    decideNextTilesCelebrationMode,
    externalOnCorrect,
    questionData.word,
    resetGame,
    getNextQuizType,
    quizType,
  ]);

  // Handle Try Again button (for wrong answers)
  const handleTryAgain = useCallback(() => {
    // Debounce: prevent rapid button presses
    const now = Date.now();
    if (now - lastActionTimeRef.current < DEBOUNCE_MS) return;
    lastActionTimeRef.current = now;

    playClick();
    setPlacedTileIds([]);
    setIsChecking(false);
    setBottomBarState('check');
    speedStopwatch.reset();
    speedStopwatch.start();
  }, [playClick]);

  // Handle tile click - add or remove from placed tiles
  const handleTileClick = useCallback(
    (id: number, _char: string) => {
      if (isChecking && bottomBarState !== 'wrong') return;

      playClick();

      // If in wrong state, reset to check state and continue with normal tile logic
      if (bottomBarState === 'wrong') {
        setIsChecking(false);
        setBottomBarState('check');
        speedStopwatch.reset();
        speedStopwatch.start();
      }

      setPlacedTileIds(prevIds =>
        prevIds.includes(id)
          ? prevIds.filter(tileId => tileId !== id)
          : [...prevIds, id],
      );
    },
    [isChecking, bottomBarState, playClick],
  );

  // Not enough words
  if (selectedWordObjs.length < 2 || !questionData.word) {
    return null;
  }

  const canCheck = placedTileIds.length > 0 && !isChecking;
  const showContinue = bottomBarState === 'correct';
  const showTryAgain = bottomBarState === 'wrong';

  // Get the current word object for display (stored with the question)
  const currentWordObj = questionData.wordObj;

  return (
    <div
      className={clsx(
        'flex w-full flex-col items-center gap-6 sm:w-4/5 sm:gap-10',
        isHidden && 'hidden',
      )}
    >
      <AnimatePresence mode='wait'>
        {/* Answer Summary - displayed after correct answer */}
        {displayAnswerSummary && currentWordObjForSummary && (
          <AnswerSummary
            payload={currentWordObjForSummary}
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
            {/* Question Display */}
            <div className='flex flex-col items-center gap-4'>
              {/* Show prompt based on quiz type (use effective quiz type from question) */}
              <span className='mb-2 text-sm text-(--secondary-color)'>
                {questionData.quizType === 'meaning'
                  ? isReverse
                    ? 'What is the word?' // meaning+reverse: given meaning, find word
                    : 'What is the meaning?' // meaning+normal: given word, find meaning
                  : 'What is the reading?'}{' '}
                {/* reading quiz: always asks for reading */}
              </span>
              <div
                className={cn(
                  'flex flex-row items-center justify-center gap-1',
                  isGlassMode && 'rounded-xl bg-(--card-color) px-4 py-2',
                )}
              >
                <motion.div
                  className='flex flex-row items-center gap-2'
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  key={`${questionData.word}-${questionData.quizType}`}
                >
                  {/* 
                    Display logic by case:
                    - Meaning + Normal: Show word with furigana
                    - Meaning + Reverse: Show meaning (English)
                    - Reading + Normal/Reverse: Show word WITHOUT furigana (user must guess reading)
                  */}
                  {questionData.quizType === 'meaning' && isReverse ? (
                    // Meaning quiz in reverse: show English meaning
                    <span className='text-center text-5xl sm:text-6xl'>
                      {currentWordObj?.meanings[0]}
                    </span>
                  ) : (
                    // Meaning quiz normal OR Reading quiz (any mode): show Japanese word
                    <FuriganaText
                      text={questionData.word}
                      reading={
                        // Only show furigana for meaning quiz in normal mode
                        questionData.quizType === 'meaning' && !isReverse
                          ? currentWordObj?.reading
                          : undefined
                      }
                      className={clsx(
                        questionData.quizType === 'meaning' && isReverse
                          ? 'text-5xl sm:text-6xl'
                          : 'text-6xl sm:text-8xl',
                        'text-center',
                      )}
                      lang='ja'
                    />
                  )}
                  {/* Audio button - show for word display (not for meaning-only display) */}
                  {!(questionData.quizType === 'meaning' && isReverse) && (
                    <SSRAudioButton
                      text={questionData.word}
                      variant='icon-only'
                      size='sm'
                      className='bg-(--card-color) text-(--secondary-color)'
                      autoPlay
                      autoPlayTrigger={promptSequence}
                    />
                  )}
                </motion.div>
              </div>
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
                isReverse || questionData.quizType === 'reading'
                  ? 'text-3xl sm:text-4xl'
                  : 'text-xl sm:text-2xl'
              }
              tileLang={
                isReverse || questionData.quizType === 'reading'
                  ? 'ja'
                  : undefined
              }
              answerRowClassName={clsx(
                'flex w-full items-center border-b-2 border-(--border-color) px-2 pb-2 md:w-3/4 lg:w-2/3 xl:w-1/2',
                isReverse || questionData.quizType === 'reading'
                  ? 'min-h-[5.5rem]'
                  : 'min-h-[5rem]',
              )}
              tilesContainerClassName={
                isGlassMode
                  ? 'rounded-xl bg-(--card-color) px-4 py-2'
                  : undefined
              }
              tilesWrapperKey={questionData.word}
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

export default VocabTilesMode;

