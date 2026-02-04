'use client';
import { useState, useEffect, useMemo, useCallback, useRef, memo } from 'react';
import {
  motion,
  AnimatePresence,
  type Variants,
  type MotionStyle,
} from 'framer-motion';
import clsx from 'clsx';
import useVocabStore, {
  IVocabObj,
} from '@/features/Vocabulary/store/useVocabStore';
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
import SSRAudioButton from '@/shared/components/audio/SSRAudioButton';

const random = new Random();
const adaptiveSelector = getGlobalAdaptiveSelector();

// Helper function to check if a word contains kanji characters
// Kanji are in the CJK Unified Ideographs range (U+4E00 to U+9FAF)
const containsKanji = (text: string): boolean => {
  return /[\u4E00-\u9FAF]/.test(text);
};

// Duolingo-like spring animation config
const springConfig = {
  type: 'spring' as const,
  stiffness: 400,
  damping: 30,
  mass: 0.8,
};

// Premium entry animation variants for option tiles
const tileContainerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.15,
    },
  },
};

const tileEntryVariants = {
  hidden: {
    opacity: 0,
    scale: 0.7,
    y: 20,
    rotateX: -15,
  },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    rotateX: 0,
    transition: {
      type: 'spring' as const,
      stiffness: 350,
      damping: 25,
      mass: 0.8,
    },
  },
};

// Duolingo-like slide animation for game content transitions
const gameContentVariants = {
  hidden: {
    opacity: 0,
    x: 80,
  },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      x: {
        type: 'spring' as const,
        stiffness: 350,
        damping: 30,
        mass: 0.7,
      },
      opacity: {
        duration: 0.25,
        ease: [0.0, 0.0, 0.2, 1] as [number, number, number, number],
      },
    },
  },
  exit: {
    opacity: 0,
    x: -80,
    transition: {
      x: {
        type: 'spring' as const,
        stiffness: 350,
        damping: 30,
        mass: 0.7,
      },
      opacity: {
        duration: 0.25,
        ease: [0.4, 0.0, 1, 1] as [number, number, number, number],
      },
    },
  },
};

// Celebration bounce animation for correct answers - Duolingo-style sequential jump
const celebrationContainerVariants = {
  idle: {},
  celebrate: {
    transition: {
      staggerChildren: 0.18,
      delayChildren: 0.08,
    },
  },
};

const celebrationBounceVariants = {
  idle: {
    y: 0,
    scaleX: 1,
    scaleY: 1,
    opacity: 1,
  },
  celebrate: {
    y: [0, -32, -35, 0, -10, 0],
    scaleX: [1, 0.94, 0.96, 1.06, 0.98, 1],
    scaleY: [1, 1.08, 1.04, 0.92, 1.02, 1],
    // Use keyframe array to prevent interpolation flicker on last/single tile
    opacity: [1, 1, 1, 1, 1, 1],
    transition: {
      duration: 1,
      ease: [0.16, 1, 0.3, 1] as [number, number, number, number],
      times: [0, 0.25, 0.35, 0.6, 0.8, 1],
    },
  },
};

// Tile styles shared between active and blank tiles
const tileBaseStyles =
  'relative flex items-center justify-center rounded-3xl px-6 sm:px-8 py-3 border-b-10 transition-all duration-150';

interface TileProps {
  id: string;
  char: string;
  onClick: () => void;
  isDisabled?: boolean;
  isJapanese?: boolean;
  variants?: Variants;
  motionStyle?: MotionStyle;
}

// Active tile - uses layoutId for smooth position animations
const ActiveTile = memo(
  ({
    id,
    char,
    onClick,
    isDisabled,
    isJapanese,
    variants,
    motionStyle,
  }: TileProps) => {
    return (
      <motion.button
        layoutId={id}
        layout='position'
        type='button'
        onClick={onClick}
        disabled={isDisabled}
        variants={variants}
        className={clsx(
          tileBaseStyles,
          'cursor-pointer transition-colors',
          'active:mb-[10px] active:translate-y-[10px] active:border-b-0',
          'border-(--secondary-color-accent) bg-(--secondary-color) text-(--background-color)',
          isDisabled && 'cursor-not-allowed opacity-50',
          // Larger font for Japanese tiles, smaller for meaning tiles
          isJapanese ? 'text-3xl sm:text-4xl' : 'text-xl sm:text-2xl',
        )}
        transition={springConfig}
        lang={isJapanese ? 'ja' : undefined}
        style={motionStyle}
      >
        {char}
      </motion.button>
    );
  },
);

ActiveTile.displayName = 'ActiveTile';

// Blank placeholder - no layoutId, just takes up space
const BlankTile = memo(
  ({ char, isJapanese }: { char: string; isJapanese?: boolean }) => {
    return (
      <div
        className={clsx(
          tileBaseStyles,
          'border-transparent bg-(--border-color)/30',
          'select-none',
          isJapanese ? 'text-3xl sm:text-4xl' : 'text-xl sm:text-2xl',
        )}
      >
        <span className='opacity-0'>{char}</span>
      </div>
    );
  },
);

BlankTile.displayName = 'BlankTile';

// Bottom bar states
type BottomBarState = 'check' | 'correct' | 'wrong';

interface VocabWordBuildingGameProps {
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

const VocabWordBuildingGame = ({
  selectedWordObjs,
  isHidden,
  isReverse: externalIsReverse,
  distractorCount: externalDistractorCount = 3,
  onCorrect: externalOnCorrect,
  onWrong: externalOnWrong,
}: VocabWordBuildingGameProps) => {
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
    selectedWordObjs.length - 1,
  );

  // Get the current vocabulary collection from the Vocab store
  const selectedVocabCollection = useVocabStore(
    state => state.selectedVocabCollection,
  );

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
          allTiles: [] as string[],
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
          allTiles: [] as string[],
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
      let correctAnswer: string;
      let distractorSource: string[];

      if (effectiveQuizType === 'reading') {
        // Reading quiz: answer is always the reading
        correctAnswer = selectedWordObj.reading;
        distractorSource = selectedWordObjs
          .filter(obj => obj.word !== selectedWord)
          .map(obj => obj.reading);
      } else {
        // Meaning quiz
        if (isReverse) {
          // Reverse: show meaning, answer is word
          correctAnswer = selectedWord;
          distractorSource = selectedWordObjs
            .filter(obj => obj.word !== selectedWord)
            .map(obj => obj.word);
        } else {
          // Normal: show word, answer is meaning
          correctAnswer = selectedWordObj.meanings[0];
          distractorSource = selectedWordObjs
            .filter(obj => obj.word !== selectedWord)
            .map(obj => obj.meanings[0]);
        }
      }

      const distractors = distractorSource
        .sort(() => random.real(0, 1) - 0.5)
        .slice(0, distractorCount);

      // Shuffle all tiles
      const allTiles = [correctAnswer, ...distractors].sort(
        () => random.real(0, 1) - 0.5,
      );

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
  const [placedTiles, setPlacedTiles] = useState<string[]>([]);
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
      setPlacedTiles([]);
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
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (
        event.key === 'Enter' ||
        event.code === 'Space' ||
        event.key === ' '
      ) {
        buttonRef.current?.click();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Handle Check button
  const handleCheck = useCallback(() => {
    if (placedTiles.length === 0) return;

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
    const isCorrect =
      placedTiles.length === 1 && placedTiles[0] === questionData.correctAnswer;

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
    incrementVocabularyCorrect,
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
    externalOnCorrect?.([questionData.word]);

    // Determine next quiz type based on word content
    const nextType = getNextQuizType(questionData.word, quizType);
    setQuizType(nextType);
    resetGame(nextType);
  }, [
    playClick,
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

  // Not enough words
  if (selectedWordObjs.length < 2 || !questionData.word) {
    return null;
  }

  const canCheck = placedTiles.length > 0 && !isChecking;
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
              <div className='flex flex-row items-center justify-center gap-1'>
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
                    />
                  )}
                </motion.div>
              </div>
            </div>

            {/* Answer Row Area - shows placed tiles */}
            <div className='flex w-full flex-col items-center'>
              <div
                className={clsx(
                  'flex w-full items-center border-b-2 border-(--border-color) px-2 pb-2 md:w-3/4 lg:w-2/3 xl:w-1/2',
                  // Use taller min-height when tiles are Japanese (reverse mode OR reading quiz)
                  isReverse || questionData.quizType === 'reading'
                    ? 'min-h-[5.5rem]'
                    : 'min-h-[5rem]',
                )}
              >
                <motion.div
                  className='flex flex-row flex-wrap justify-start gap-3'
                  variants={celebrationContainerVariants}
                  initial='idle'
                  animate={isCelebrating ? 'celebrate' : 'idle'}
                >
                  {/* Render placed tiles in the answer row */}
                  {placedTiles.map(char => (
                    <ActiveTile
                      key={`answer-tile-${char}`}
                      id={`tile-${char}`}
                      char={char}
                      onClick={() => handleTileClick(char)}
                      isDisabled={isChecking && bottomBarState !== 'wrong'}
                      isJapanese={
                        isReverse || questionData.quizType === 'reading'
                      }
                      variants={celebrationBounceVariants}
                      motionStyle={{ transformOrigin: '50% 100%' }}
                    />
                  ))}
                </motion.div>
              </div>
            </div>

            {/* Available Tiles - 2 rows */}
            {(() => {
              const tilesPerRow = 2;
              const topRowTiles = questionData.allTiles.slice(0, tilesPerRow);
              const bottomRowTiles = questionData.allTiles.slice(tilesPerRow);

              const renderTile = (char: string) => {
                const isPlaced = placedTiles.includes(char);
                const isJapaneseTile =
                  isReverse || questionData.quizType === 'reading';

                return (
                  <motion.div
                    key={`tile-slot-${char}`}
                    className='relative'
                    variants={tileEntryVariants}
                    style={{ perspective: 1000 }}
                  >
                    {/* Blank tile underneath */}
                    <BlankTile char={char} isJapanese={isJapaneseTile} />

                    {/* Active tile on top when NOT placed */}
                    {!isPlaced && (
                      <div className='absolute inset-0 z-10'>
                        <ActiveTile
                          id={`tile-${char}`}
                          char={char}
                          onClick={() => handleTileClick(char)}
                          isDisabled={isChecking && bottomBarState !== 'wrong'}
                          isJapanese={isJapaneseTile}
                        />
                      </div>
                    )}
                  </motion.div>
                );
              };

              return (
                <motion.div
                  key={questionData.word}
                  className='flex flex-col items-center gap-3 sm:gap-4'
                  variants={tileContainerVariants}
                  initial='hidden'
                  animate='visible'
                >
                  <motion.div className='flex flex-row justify-center gap-3 sm:gap-4'>
                    {topRowTiles.map(char => renderTile(char))}
                  </motion.div>
                  {bottomRowTiles.length > 0 && (
                    <motion.div className='flex flex-row justify-center gap-3 sm:gap-4'>
                      {bottomRowTiles.map(char => renderTile(char))}
                    </motion.div>
                  )}
                </motion.div>
              );
            })()}
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

export default VocabWordBuildingGame;
