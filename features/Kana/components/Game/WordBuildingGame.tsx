'use client';
import { useState, useEffect, useMemo, useCallback, useRef, memo } from 'react';
import {
  motion,
  AnimatePresence,
  type Variants,
  type MotionStyle
} from 'framer-motion';
import clsx from 'clsx';
import { kana } from '@/features/Kana/data/kana';
import useKanaStore from '@/features/Kana/store/useKanaStore';
import { CircleCheck, CircleX, CircleArrowRight, Trash2 } from 'lucide-react';
import { Random } from 'random-js';
import { useCorrect, useError, useClick } from '@/shared/hooks/useAudio';
// import GameIntel from '@/shared/components/Game/GameIntel';
import { getGlobalAdaptiveSelector } from '@/shared/lib/adaptiveSelection';
import Stars from '@/shared/components/Game/Stars';
import { useCrazyModeTrigger } from '@/features/CrazyMode/hooks/useCrazyModeTrigger';
import { useStatsStore } from '@/features/Progress';
import { useShallow } from 'zustand/react/shallow';
import { ActionButton } from '@/shared/components/ui/ActionButton';
import { useStopwatch } from 'react-timer-hook';
import { useSmartReverseMode } from '@/shared/hooks/useSmartReverseMode';
import { GameBottomBar } from '@/shared/components/Game/GameBottomBar';

const random = new Random();
const adaptiveSelector = getGlobalAdaptiveSelector();

// Duolingo-like spring animation config
const springConfig = {
  type: 'spring' as const,
  stiffness: 400,
  damping: 30,
  mass: 0.8
};

// Premium entry animation variants for option tiles
const tileContainerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.15
    }
  }
};

const tileEntryVariants = {
  hidden: {
    opacity: 0,
    scale: 0.7,
    y: 20,
    rotateX: -15
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
      mass: 0.8
    }
  }
};

// Duolingo-like slide animation for game content transitions
const gameContentVariants = {
  hidden: {
    opacity: 0,
    x: 80
  },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      x: {
        type: 'spring' as const,
        stiffness: 350,
        damping: 30,
        mass: 0.7
      },
      opacity: {
        duration: 0.25,
        ease: [0.0, 0.0, 0.2, 1] as [number, number, number, number]
      }
    }
  },
  exit: {
    opacity: 0,
    x: -80,
    transition: {
      x: {
        type: 'spring' as const,
        stiffness: 350,
        damping: 30,
        mass: 0.7
      },
      opacity: {
        duration: 0.25,
        ease: [0.4, 0.0, 1, 1] as [number, number, number, number]
      }
    }
  }
};

// Celebration bounce animation for correct answers - Duolingo-style sequential jump
const celebrationContainerVariants = {
  idle: {},
  celebrate: {
    transition: {
      staggerChildren: 0.18,
      delayChildren: 0.08
    }
  }
};

const celebrationBounceVariants = {
  idle: {
    y: 0,
    scaleX: 1,
    scaleY: 1,
    opacity: 1
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
      times: [0, 0.25, 0.35, 0.6, 0.8, 1]
    }
  }
};

// Helper function to determine if a kana character is hiragana or katakana
const isHiragana = (char: string): boolean => {
  const code = char.charCodeAt(0);
  return code >= 0x3040 && code <= 0x309f;
};

const isKatakana = (char: string): boolean => {
  const code = char.charCodeAt(0);
  return code >= 0x30a0 && code <= 0x30ff;
};

// Tile styles shared between active and blank tiles
const tileBaseStyles =
  'relative flex items-center justify-center rounded-3xl px-6 sm:px-8 py-3 text-2xl  sm:text-3xl border-b-10 transition-all duration-150';

interface TileProps {
  id: string;
  char: string;
  onClick: () => void;
  isDisabled?: boolean;
  variants?: Variants;
  motionStyle?: MotionStyle;
}

// Active tile - uses layoutId for smooth position animations
const ActiveTile = memo(
  ({ id, char, onClick, isDisabled, variants, motionStyle }: TileProps) => {
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
          // Match ActionButton's smooth press animation: translate down + add margin to prevent layout shift
          'active:mb-[10px] active:translate-y-[10px] active:border-b-0',
          'border-[var(--secondary-color-accent)] bg-[var(--secondary-color)] text-[var(--background-color)]',
          isDisabled && 'cursor-not-allowed opacity-50'
        )}
        transition={springConfig}
        style={motionStyle}
      >
        {char}
      </motion.button>
    );
  },
  (prevProps, nextProps) =>
    prevProps.id === nextProps.id &&
    prevProps.char === nextProps.char &&
    prevProps.isDisabled === nextProps.isDisabled &&
    prevProps.onClick === nextProps.onClick
);

ActiveTile.displayName = 'ActiveTile';

// Blank placeholder - no layoutId, just takes up space
const BlankTile = memo(
  ({ char }: { char: string }) => {
    return (
      <div
        className={clsx(
          tileBaseStyles,
          'border-transparent bg-[var(--border-color)]/30',
          'select-none'
        )}
      >
        <span className='opacity-0'>{char}</span>
      </div>
    );
  },
  (prevProps, nextProps) => prevProps.char === nextProps.char
);

BlankTile.displayName = 'BlankTile';

// Bottom bar states
type BottomBarState = 'check' | 'correct' | 'wrong';

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
  onWrong: externalOnWrong
}: WordBuildingGameProps) => {
  // Smart reverse mode - used when not controlled externally
  const {
    isReverse: internalIsReverse,
    decideNextMode: decideNextReverseMode,
    recordWrongAnswer: recordReverseModeWrong
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
    addCorrectAnswerTime
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
      addCorrectAnswerTime: state.addCorrectAnswerTime
    }))
  );

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
        romajiToKana: r2k
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
      romajiToKana
    }),
    [isReverse, selectedKana, selectedRomaji, wordLength, kanaToRomaji, romajiToKana]
  );

  // Generate a word (array of characters) and distractors
  const generateWord = useCallback(() => {
    const { isReverse, selectedKana, selectedRomaji, wordLength, kanaToRomaji, romajiToKana } = generateWordDeps;
    const sourceChars = isReverse ? selectedRomaji : selectedKana;
    if (sourceChars.length < wordLength) {
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

    const distractorCount = Math.min(3, sourceChars.length - wordLength);
    const distractorSource = isReverse ? selectedKana : selectedRomaji;
    const distractors: string[] = [];
    const usedAnswers = new Set(answerChars);

    for (let i = 0; i < distractorCount; i++) {
      const available = distractorSource.filter(
        c => !usedAnswers.has(c) && !distractors.includes(c)
      );
      if (available.length === 0) break;
      const selected = available[random.integer(0, available.length - 1)];
      distractors.push(selected);
    }

    const allTiles = [...answerChars, ...distractors].sort(
      () => random.real(0, 1) - 0.5
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
    recordAnswerTime
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
    [isChecking, bottomBarState, placedTiles, playClick]
  );
  // Note: speedStopwatch deliberately excluded - only calling methods

  const handleClearPlaced = useCallback(() => {
    if (isChecking) return;
    playClick();
    setPlacedTiles([]);
  }, [isChecking, playClick]);

  // Not enough characters for word building
  if (selectedKana.length < wordLength || wordData.wordChars.length === 0) {
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
        isHidden && 'hidden'
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
          className='flex w-full flex-col items-center gap-6 sm:gap-10'
        >
          {/* Word Display */}
          <div className='flex flex-row items-center gap-1'>
            <motion.p
              className={clsx(
                'sm:text-8xl',
                !isReverse && wordData.wordChars.length === 3 ? 'text-6xl' : 'text-7xl'
              )}
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              {wordData.wordChars.join('')}
            </motion.p>
          </div>

          {/* Answer Row Area */}
          <div className='flex w-full flex-col items-center'>
            <div className='flex min-h-[5rem] w-full items-center border-b-2 border-[var(--border-color)] px-2 pb-2 md:w-3/4 lg:w-2/3 xl:w-1/2'>
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
                    variants={celebrationBounceVariants}
                    motionStyle={{ transformOrigin: '50% 100%' }}
                  />
                ))}
              </motion.div>
            </div>
          </div>

          {/* Available Tiles - 2 rows on mobile, centered */}
          {(() => {
            // Split tiles into 2 rows for mobile (3 per row max)
            const tilesPerRow = 3;
            const topRowTiles = wordData.allTiles.slice(0, tilesPerRow);
            const bottomRowTiles = wordData.allTiles.slice(tilesPerRow);

            const renderTile = (char: string, index: number) => {
              const isPlaced = placedTiles.includes(char);

              return (
                <motion.div
                  key={`tile-slot-${char}`}
                  className='relative'
                  variants={tileEntryVariants}
                  style={{ perspective: 1000 }}
                >
                  {/* Blank tile is ALWAYS rendered underneath (z-0) */}
                  <BlankTile char={char} />

                  {/* Active tile overlays on top (z-10 + absolute) when NOT placed.
                      This ensures when it animates back here, the blank is already there. */}
                  {!isPlaced && (
                    <div className='absolute inset-0 z-10'>
                      <ActiveTile
                        id={`tile-${char}`}
                        char={char}
                        onClick={() => handleTileClick(char)}
                        isDisabled={isChecking && bottomBarState !== 'wrong'}
                      />
                    </div>
                  )}
                </motion.div>
              );
            };

            return (
              <motion.div
                className='flex flex-col items-center gap-3 sm:gap-4'
                variants={tileContainerVariants}
                initial='hidden'
                animate='visible'
              >
                <motion.div className='flex flex-row justify-center gap-3 sm:gap-4'>
                  {topRowTiles.map((char, i) => renderTile(char, i))}
                </motion.div>
                {bottomRowTiles.length > 0 && (
                  <motion.div className='flex flex-row justify-center gap-3 sm:gap-4'>
                    {bottomRowTiles.map((char, i) =>
                      renderTile(char, i + tilesPerRow)
                    )}
                  </motion.div>
                )}
              </motion.div>
            );
          })()}
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
