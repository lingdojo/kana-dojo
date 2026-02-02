'use client';

import React, {
  memo,
  useRef,
  useEffect,
  useCallback,
  useState,
  useMemo,
} from 'react';
import clsx from 'clsx';
import {
  motion,
  AnimatePresence,
  type Variants,
  type MotionStyle,
} from 'framer-motion';
import { Heart, HeartCrack, X } from 'lucide-react';
import {
  GameBottomBar,
  type BottomBarState,
} from '@/shared/components/Game/GameBottomBar';
import Stars from '@/shared/components/Game/Stars';
import ProgressBar from '@/shared/components/Game/ProgressBar';
import { useClick } from '@/shared/hooks/useAudio';

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

// Celebration bounce animation for correct answers
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
  tileSizeClass: string;
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
    tileSizeClass,
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
          'border-[var(--secondary-color-accent)] bg-[var(--secondary-color)] text-[var(--background-color)]',
          isDisabled && 'cursor-not-allowed opacity-50',
          // Kana tiles use text-2xl sm:text-3xl, Kanji/Vocab use larger for Japanese
          tileSizeClass,
        )}
        transition={springConfig}
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
  ({ char, tileSizeClass }: { char: string; tileSizeClass: string }) => {
    return (
      <div
        className={clsx(
          tileBaseStyles,
          'border-transparent bg-[var(--border-color)]/30',
          'select-none',
          // Kana tiles use text-2xl sm:text-3xl, Kanji/Vocab use larger for Japanese
          tileSizeClass,
        )}
      >
        <span className='opacity-0'>{char}</span>
      </div>
    );
  },
);

BlankTile.displayName = 'BlankTile';

interface ActiveGameProps<T> {
  // Dojo type for layout customization
  dojoType: 'kana' | 'kanji' | 'vocabulary';

  // Progress
  currentIndex: number;
  totalQuestions: number;

  // Lives
  lives: number;
  maxLives: number;

  // Question display
  currentQuestion: T | null;
  renderQuestion: (question: T, isReverse?: boolean) => React.ReactNode;
  isReverseActive: boolean;

  // Pick mode options
  shuffledOptions: string[];
  renderOption?: (
    option: string,
    items: T[],
    isReverse?: boolean,
  ) => React.ReactNode;
  items: T[];

  // Answer handling
  onSubmit: (selectedOption: string, isCorrect: boolean) => void;
  getCorrectOption: (question: T, isReverse?: boolean) => string;

  // Navigation
  onCancel: () => void;

  // Unique key for the current question (to reset internal state)
  questionKey: string;
}

export default function ActiveGame<T>({
  dojoType,
  currentIndex,
  totalQuestions,
  lives,
  maxLives,
  currentQuestion,
  renderQuestion,
  isReverseActive,
  shuffledOptions,
  renderOption,
  items,
  onSubmit,
  getCorrectOption,
  onCancel,
  questionKey,
}: ActiveGameProps<T>) {
  const { playClick } = useClick();
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Internal game state - reset when question changes
  const [placedTiles, setPlacedTiles] = useState<string[]>([]);
  const [bottomBarState, setBottomBarState] = useState<BottomBarState>('check');
  const [isChecking, setIsChecking] = useState(false);
  const [isCelebrating, setIsCelebrating] = useState(false);

  // Reset state when question changes
  useEffect(() => {
    setPlacedTiles([]);
    setBottomBarState('check');
    setIsChecking(false);
    setIsCelebrating(false);
  }, [questionKey]);

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

  // Get correct answer for current question
  const correctAnswer = useMemo(() => {
    if (!currentQuestion) return '';
    return getCorrectOption(currentQuestion, isReverseActive);
  }, [currentQuestion, getCorrectOption, isReverseActive]);

  // Handle Check button
  const handleCheck = useCallback(() => {
    if (placedTiles.length === 0 || !currentQuestion) return;

    playClick();
    setIsChecking(true);

    // Correct if exactly one tile placed and it matches the correct answer
    const isCorrect =
      placedTiles.length === 1 && placedTiles[0] === correctAnswer;

    if (isCorrect) {
      setBottomBarState('correct');
      setIsCelebrating(true);
    } else {
      setBottomBarState('wrong');
    }
  }, [placedTiles, currentQuestion, playClick, correctAnswer]);

  // Handle Continue/Next button (auto-advance regardless of correctness)
  const handleContinue = useCallback(() => {
    playClick();

    // Determine if was correct or wrong for parent callback
    const wasCorrect =
      placedTiles.length === 1 && placedTiles[0] === correctAnswer;

    // Call parent with selected option and result
    onSubmit(placedTiles[0] || '', wasCorrect);
  }, [playClick, placedTiles, correctAnswer, onSubmit]);

  // Handle tile click - add or remove from placed tiles
  const handleTileClick = useCallback(
    (char: string) => {
      if (isChecking && bottomBarState !== 'wrong') return;

      playClick();

      // If already in a checked state, clicking a tile restarts checking
      if (bottomBarState !== 'check') {
        setIsChecking(false);
        setBottomBarState('check');
        setIsCelebrating(false);
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

  // Not enough data to render
  if (!currentQuestion) {
    return null;
  }

  const canCheck = placedTiles.length > 0 && !isChecking;
  const showContinue = bottomBarState === 'correct';
  const showTryAgain = bottomBarState === 'wrong';

  // Sizing classes based on dojoType (matching exact sizes from each WordBuildingGame)
  // Kana: tiles text-2xl sm:text-3xl, question text-7xl sm:text-8xl
  // Kanji: tiles text-3xl/4xl (kanji) or text-xl/2xl (meaning), question text-8xl/9xl
  // Vocab: tiles text-3xl/4xl (japanese) or text-xl/2xl (meaning), question text-6xl/8xl
  const tileSizeClass =
    dojoType === 'kana'
      ? 'text-2xl sm:text-3xl' // Kana tiles are always this size
      : isReverseActive
        ? 'text-3xl sm:text-4xl' // Kanji/Vocab in reverse: Japanese tiles
        : 'text-xl sm:text-2xl'; // Kanji/Vocab normal: meaning tiles

  const questionSizeClass =
    dojoType === 'kana'
      ? 'text-7xl sm:text-8xl' // Kana question
      : dojoType === 'kanji'
        ? isReverseActive
          ? 'text-5xl sm:text-6xl' // Kanji reverse (showing meaning)
          : 'text-8xl sm:text-9xl' // Kanji normal (showing kanji)
        : isReverseActive
          ? 'text-5xl sm:text-6xl' // Vocab reverse (showing meaning)
          : 'text-6xl sm:text-8xl'; // Vocab normal (showing word)

  const answerRowMinHeight =
    dojoType === 'kana'
      ? 'min-h-[5rem]'
      : isReverseActive
        ? 'min-h-[5.5rem]'
        : 'min-h-[5rem]';

  return (
    <div
      className={clsx(
        'flex min-h-[100dvh] flex-col items-center px-4 pt-4 md:pt-8',
      )}
    >
      {/* Minimal Header - Exit, Progress, and Lives only */}
      <div className='flex w-full flex-row items-center justify-between gap-4 md:w-2/3 md:gap-6 lg:w-1/2'>
        {/* Exit Button */}
        <button
          onClick={onCancel}
          className='text-[var(--border-color)] duration-250 hover:cursor-pointer hover:text-[var(--secondary-color)]'
        >
          <X size={32} />
        </button>

        {/* Progress Display */}
        <div className='flex items-center gap-2 text-sm text-[var(--muted-color)]'>
          <span>
            {currentIndex + 1} / {totalQuestions}
          </span>
        </div>

        {/* Lives Display */}
        <div className='flex items-center gap-1'>
          {Array.from({ length: maxLives }).map((_, i) => {
            const hasLife = i < lives;
            return (
              <div key={i}>
                {hasLife ? (
                  <Heart
                    size={24}
                    className='fill-[var(--main-color)] text-[var(--main-color)]'
                  />
                ) : (
                  <HeartCrack
                    size={24}
                    className='text-[var(--border-color)]'
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Progress Bar */}
      <div className='mt-4 w-full md:w-2/3 lg:w-1/2'>
        <ProgressBar />
      </div>

      {/* Main Game Area - EXACTLY matching WordBuildingGame */}
      <div className='mt-8 flex w-full flex-col items-center gap-6 sm:mt-12 sm:w-4/5 sm:gap-10'>
        <AnimatePresence mode='wait'>
          <motion.div
            key={questionKey}
            variants={gameContentVariants}
            initial='hidden'
            animate='visible'
            exit='exit'
            className='flex w-full flex-col items-center gap-6 sm:gap-10'
          >
            {/* Question Display */}
            <div className='flex flex-row items-center gap-1'>
              <motion.div
                className={questionSizeClass}
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                {renderQuestion(currentQuestion, isReverseActive)}
              </motion.div>
            </div>

            {/* Answer Row Area - shows placed tiles */}
            <div className='flex w-full flex-col items-center'>
              <div
                className={clsx(
                  'flex w-full items-center border-b-2 border-[var(--border-color)] px-2 pb-2 md:w-3/4 lg:w-2/3 xl:w-1/2',
                  answerRowMinHeight,
                )}
              >
                <motion.div
                  className='flex flex-row flex-wrap justify-start gap-3'
                  variants={celebrationContainerVariants}
                  initial='idle'
                  animate={isCelebrating ? 'celebrate' : 'idle'}
                >
                  {/* Render placed tiles in the answer row */}
                  {placedTiles.map(char => {
                    // Get display text - use renderOption if available
                    const displayChar = renderOption
                      ? String(renderOption(char, items, isReverseActive))
                      : char;
                    return (
                      <ActiveTile
                        key={`answer-tile-${char}`}
                        id={`tile-${char}`}
                        char={displayChar}
                        onClick={() => handleTileClick(char)}
                        isDisabled={isChecking && bottomBarState !== 'wrong'}
                        tileSizeClass={tileSizeClass}
                        variants={celebrationBounceVariants}
                        motionStyle={{ transformOrigin: '50% 100%' }}
                      />
                    );
                  })}
                </motion.div>
              </div>
            </div>

            {/* Available Tiles - 2 rows */}
            {(() => {
              const tilesPerRow = 2;
              const topRowTiles = shuffledOptions.slice(0, tilesPerRow);
              const bottomRowTiles = shuffledOptions.slice(tilesPerRow);

              const renderTile = (option: string) => {
                const isPlaced = placedTiles.includes(option);
                // Get display text - use renderOption if available
                const displayChar = renderOption
                  ? String(renderOption(option, items, isReverseActive))
                  : option;

                return (
                  <motion.div
                    key={`tile-slot-${option}`}
                    className='relative'
                    variants={tileEntryVariants}
                    style={{ perspective: 1000 }}
                  >
                    {/* Blank tile underneath */}
                    <BlankTile
                      char={displayChar}
                      tileSizeClass={tileSizeClass}
                    />

                    {/* Active tile on top when NOT placed */}
                    {!isPlaced && (
                      <div className='absolute inset-0 z-10'>
                        <ActiveTile
                          id={`tile-${option}`}
                          char={displayChar}
                          onClick={() => handleTileClick(option)}
                          isDisabled={isChecking && bottomBarState !== 'wrong'}
                          tileSizeClass={tileSizeClass}
                        />
                      </div>
                    )}
                  </motion.div>
                );
              };

              return shuffledOptions.length > 0 ? (
                <motion.div
                  className='flex flex-col items-center gap-3 sm:gap-4'
                  variants={tileContainerVariants}
                  initial='hidden'
                  animate='visible'
                >
                  <motion.div className='flex flex-row justify-center gap-3 sm:gap-4'>
                    {topRowTiles.map(option => renderTile(option))}
                  </motion.div>
                  {bottomRowTiles.length > 0 && (
                    <motion.div className='flex flex-row justify-center gap-3 sm:gap-4'>
                      {bottomRowTiles.map(option => renderTile(option))}
                    </motion.div>
                  )}
                </motion.div>
              ) : null;
            })()}
          </motion.div>
        </AnimatePresence>

        <Stars />

        <GameBottomBar
          state={bottomBarState}
          onAction={showContinue || showTryAgain ? handleContinue : handleCheck}
          canCheck={canCheck}
          feedbackTitle={showContinue ? 'Correct!' : 'Wrong!'}
          feedbackContent=''
          buttonRef={buttonRef}
          actionLabel={showContinue ? 'next' : showTryAgain ? 'next' : 'check'}
        />

        {/* Spacer */}
        <div className='h-32' />
      </div>
    </div>
  );
}
