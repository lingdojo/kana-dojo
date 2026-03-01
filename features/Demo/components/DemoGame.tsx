'use client';
import { useState, useEffect, useCallback, useRef, memo, useMemo } from 'react';
import {
  motion,
  AnimatePresence,
  type Variants,
  type MotionStyle,
} from 'framer-motion';
import clsx from 'clsx';
import { Random } from 'random-js';
import { useCorrect, useError, useClick } from '@/shared/hooks/useAudio';
import Stars from '@/shared/components/Game/Stars';
import { useCrazyModeTrigger } from '@/features/CrazyMode/hooks/useCrazyModeTrigger';
import { useStopwatch } from 'react-timer-hook';
import { GameBottomBar } from '@/shared/components/Game/GameBottomBar';
import { useThemePreferences } from '@/features/Preferences/facade/useThemePreferences';
import {
  X,
  SquareCheck,
  SquareX,
  Star,
  Flame,
  MousePointerClick,
  type LucideIcon,
} from 'lucide-react';
import { Link } from '@/core/i18n/routing';

const random = new Random();

// ============================================================================
// CONFIGURATION - Toggle these to show/hide UI elements
// ============================================================================
const SHOW_PROGRESS_BAR = true;
const SHOW_GAME_MODE_NAME = true;
const SHOW_STATS_LINE = true;
// ============================================================================

// Pre-selected simple items - maximally simple characters for beginners
// These characters are chosen for visual simplicity and distinctiveness

// Simple Kana: 10 visually distinct, simple hiragana
// TEMPORARILY DISABLED - focusing on kanji only
// const DEMO_KANA = [
//   { kana: 'あ', romaji: 'a' },
//   { kana: 'い', romaji: 'i' },
//   { kana: 'う', romaji: 'u' },
//   { kana: 'え', romaji: 'e' },
//   { kana: 'お', romaji: 'o' },
//   { kana: 'か', romaji: 'ka' },
//   { kana: 'き', romaji: 'ki' },
//   { kana: 'く', romaji: 'ku' },
//   { kana: 'し', romaji: 'shi' },
//   { kana: 'た', romaji: 'ta' },
// ];

// Simple Kanji: 29 visually simple, high-frequency kanji with clear meanings and minimal strokes
const DEMO_KANJI = [
  { kanji: '一', meaning: 'one', reading: 'ichi' },
  { kanji: '二', meaning: 'two', reading: 'ni' },
  { kanji: '三', meaning: 'three', reading: 'san' },
  { kanji: '大', meaning: 'big', reading: 'dai' },
  { kanji: '小', meaning: 'small', reading: 'shō' },
  { kanji: '山', meaning: 'mountain', reading: 'yama' },
  { kanji: '川', meaning: 'river', reading: 'kawa' },
  { kanji: '日', meaning: 'sun', reading: 'hi' },
  { kanji: '月', meaning: 'moon', reading: 'tsuki' },
  { kanji: '木', meaning: 'tree', reading: 'ki' },
  { kanji: '口', meaning: 'mouth', reading: 'kuchi' },
  { kanji: '人', meaning: 'person', reading: 'hito' },
  { kanji: '五', meaning: 'five', reading: 'go' },
  { kanji: '雨', meaning: 'rain', reading: 'ame' },
  { kanji: '田', meaning: 'field', reading: 'ta' },
  { kanji: '猫', meaning: 'cat', reading: 'neko' },
  { kanji: '虫', meaning: 'insect', reading: 'mushi' },
  { kanji: '火', meaning: 'fire', reading: 'hi' },
  { kanji: '水', meaning: 'water', reading: 'mizu' },
  { kanji: '子', meaning: 'child', reading: 'ko' },
  { kanji: '女', meaning: 'woman', reading: 'onna' },
];

type QuestionType = 'kana' | 'kanji'; // | 'vocab' - vocab commented out for now

interface Question {
  type: QuestionType;
  display: string;
  correctAnswer: string;
  wrongAnswer: string;
}

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
  isLarge?: boolean;
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
    isLarge,
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
          isLarge ? 'text-3xl sm:text-4xl' : 'text-xl sm:text-2xl',
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
  ({ char, isLarge }: { char: string; isLarge?: boolean }) => {
    return (
      <div
        className={clsx(
          tileBaseStyles,
          'border-transparent bg-(--border-color)/30',
          'select-none',
          isLarge ? 'text-3xl sm:text-4xl' : 'text-xl sm:text-2xl',
        )}
      >
        <span className='opacity-0'>{char}</span>
      </div>
    );
  },
);

BlankTile.displayName = 'BlankTile';

// Stat item component for the stats line
interface StatItemProps {
  icon: LucideIcon;
  value: number;
}

const StatItem = ({ icon: Icon, value }: StatItemProps) => (
  <p className='flex flex-row items-center gap-0.75 text-xl sm:gap-1'>
    <Icon />
    <span className='text-(--main-color)'>{value}</span>
  </p>
);

// Progress Bar component (simplified version for demo)
const DemoProgressBar = ({
  score,
  max = 20,
}: {
  score: number;
  max?: number;
}) => {
  const percentage = (score / max) * 100;

  return (
    <div className='relative flex w-full flex-col items-center'>
      <div className='relative h-4 w-full overflow-hidden rounded-full bg-(--card-color)'>
        <div
          className='relative z-10 h-4 rounded-full transition-all duration-500'
          style={{
            width: `${percentage}%`,
            background:
              'linear-gradient(to right, var(--secondary-color), var(--main-color))',
          }}
        />
        {[25, 50, 75].map(cp => (
          <div
            key={cp}
            className='absolute top-0 z-0 h-4 w-0 bg-(--border-color)'
            style={{
              left: `calc(${cp}% - 2px)`,
            }}
          />
        ))}
      </div>
    </div>
  );
};

// Bottom bar states
type BottomBarState = 'check' | 'correct' | 'wrong';

const DemoGame = () => {
  const { setTheme, theme } = useThemePreferences();
  const hasMountedRef = useRef(false);
  const originalThemeRef = useRef<string | null>(null);

  // Apply sapphire-bloom theme on mount
  useEffect(() => {
    if (!hasMountedRef.current) {
      hasMountedRef.current = true;
      originalThemeRef.current = theme;
      // Only set theme if it's not already sapphire-bloom
      if (theme !== 'sapphire-bloom') {
        setTheme('sapphire-bloom');
      }
    }
  }, [theme, setTheme]);

  const speedStopwatch = useStopwatch({ autoStart: false });
  const { playCorrect } = useCorrect();
  const { playErrorTwice } = useError();
  const { playClick } = useClick();
  const { trigger: triggerCrazyMode } = useCrazyModeTrigger();
  const buttonRef = useRef<HTMLButtonElement>(null);
  const totalTimeStopwatch = useStopwatch({ autoStart: true });

  const [score, setScore] = useState(0);
  const [stars, setStars] = useState(0);
  const [numCorrectAnswers, setNumCorrectAnswers] = useState(0);
  const [numWrongAnswers, setNumWrongAnswers] = useState(0);
  const [currentStreak, setCurrentStreak] = useState(0);

  const [bottomBarState, setBottomBarState] = useState<BottomBarState>('check');
  const [questionIndex, setQuestionIndex] = useState(0);
  const [placedTiles, setPlacedTiles] = useState<string[]>([]);
  const [isChecking, setIsChecking] = useState(false);
  const [isCelebrating, setIsCelebrating] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);

  // Question type order: kanji only (kana temporarily disabled)
  const questionTypes: QuestionType[] = ['kanji']; // 'kana' and 'vocab' commented out

  // Generate a question based on the current type
  const generateQuestion = useCallback((type: QuestionType): Question => {
    // KANA TEMPORARILY DISABLED
    // if (type === 'kana') {
    //   const correctIndex = random.integer(0, DEMO_KANA.length - 1);
    //   let wrongIndex = random.integer(0, DEMO_KANA.length - 1);
    //   while (wrongIndex === correctIndex) {
    //     wrongIndex = random.integer(0, DEMO_KANA.length - 1);
    //   }
    //   return {
    //     type: 'kana',
    //     display: DEMO_KANA[correctIndex].kana,
    //     correctAnswer: DEMO_KANA[correctIndex].romaji,
    //     wrongAnswer: DEMO_KANA[wrongIndex].romaji,
    //   };
    // } else {
    // type === 'kanji' (only kanji is active)
    const correctIndex = random.integer(0, DEMO_KANJI.length - 1);
    let wrongIndex = random.integer(0, DEMO_KANJI.length - 1);
    while (wrongIndex === correctIndex) {
      wrongIndex = random.integer(0, DEMO_KANJI.length - 1);
    }
    return {
      type: 'kanji',
      display: DEMO_KANJI[correctIndex].kanji,
      correctAnswer: DEMO_KANJI[correctIndex].meaning,
      wrongAnswer: DEMO_KANJI[wrongIndex].meaning,
    };
    // }
  }, []);

  // Get shuffled tiles (always 2: correct + wrong)
  const allTiles = useMemo(() => {
    if (!currentQuestion) return [];
    const tiles = [currentQuestion.correctAnswer, currentQuestion.wrongAnswer];
    return tiles.sort(() => random.real(0, 1) - 0.5);
  }, [currentQuestion]);

  // Reset game with new question
  const resetGame = useCallback(() => {
    const currentType = questionTypes[0]; // Always use kanji since kana is disabled
    const newQuestion = generateQuestion(currentType);
    setCurrentQuestion(newQuestion);
    setPlacedTiles([]);
    setIsChecking(false);
    setIsCelebrating(false);
    setBottomBarState('check');
    speedStopwatch.reset();
    speedStopwatch.start();
  }, [questionIndex, generateQuestion]);

  // Initialize first question
  useEffect(() => {
    resetGame();
  }, []);

  // Update question when index changes
  useEffect(() => {
    if (questionIndex > 0) {
      resetGame();
    }
  }, [questionIndex]);

  // Handle star increment when score reaches max
  useEffect(() => {
    if (score >= 20) {
      setScore(0);
      setStars(stars + 1);
    }
  }, [score, setScore, setStars, stars]);

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
    if (placedTiles.length === 0 || !currentQuestion) return;

    speedStopwatch.pause();
    const answerTimeMs = speedStopwatch.totalMilliseconds;

    playClick();
    setIsChecking(true);

    const isCorrect =
      placedTiles.length === 1 &&
      placedTiles[0] === currentQuestion.correctAnswer;

    if (isCorrect) {
      speedStopwatch.reset();

      playCorrect();
      triggerCrazyMode();
      setNumCorrectAnswers(prev => prev + 1);
      setCurrentStreak(prev => prev + 1);
      setScore(score + 1);
      setBottomBarState('correct');
      setIsCelebrating(true);
    } else {
      speedStopwatch.reset();
      playErrorTwice();
      triggerCrazyMode();
      setNumWrongAnswers(prev => prev + 1);
      setCurrentStreak(0);

      if (score - 1 >= 0) {
        setScore(score - 1);
      }

      setBottomBarState('wrong');
    }
  }, [
    placedTiles,
    currentQuestion,
    playClick,
    playCorrect,
    playErrorTwice,
    triggerCrazyMode,
    score,
    setScore,
  ]);

  // Handle Continue button (only for correct answers)
  const handleContinue = useCallback(() => {
    playClick();
    setQuestionIndex(prev => prev + 1);
  }, [playClick]);

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

      if (bottomBarState === 'wrong') {
        setIsChecking(false);
        setBottomBarState('check');
        speedStopwatch.reset();
        speedStopwatch.start();
      }

      if (placedTiles.includes(char)) {
        setPlacedTiles(prev => prev.filter(c => c !== char));
      } else {
        setPlacedTiles(prev => [...prev, char]);
      }
    },
    [isChecking, bottomBarState, placedTiles, playClick],
  );

  const handleExit = () => {
    playClick();
  };

  if (!currentQuestion) {
    return null;
  }

  const canCheck = placedTiles.length > 0 && !isChecking;
  const showContinue = bottomBarState === 'correct';
  const showTryAgain = bottomBarState === 'wrong';

  // Demo answers are romaji/meanings, so keep option tiles at the standard size.
  const isLargeTile = false;

  return (
    <div className='flex min-h-[100dvh] max-w-[100dvw] flex-col items-center gap-6 px-4 md:gap-10'>
      {/* Header with progress bar, game mode, and stats */}
      <div className='mt-2 flex w-full flex-col md:mt-4 md:w-2/3 lg:w-1/2'>
        {/* Header with exit and progress */}
        {SHOW_PROGRESS_BAR && (
          <div className='flex w-full flex-row items-center gap-3 md:gap-4'>
            <Link href='/' onClick={handleExit}>
              <X
                size={32}
                className='text-(--border-color) duration-250 hover:scale-125 hover:cursor-pointer hover:text-(--secondary-color)'
              />
            </Link>
            <div className='flex-1'>
              <DemoProgressBar score={score} />
            </div>
          </div>
        )}

        {/* Game mode and stats row */}
        {(SHOW_GAME_MODE_NAME || SHOW_STATS_LINE) && (
          <div className='flex w-full flex-row items-center'>
            {/* Game mode indicator */}
            {SHOW_GAME_MODE_NAME && (
              <p className='flex w-1/2 items-center justify-start gap-1 text-lg sm:gap-2 sm:pl-1 md:text-xl'>
                <MousePointerClick className='text-(--main-color)' />
                <span className='text-(--secondary-color)'>demo</span>
              </p>
            )}

            {/* Stats display */}
            {SHOW_STATS_LINE && (
              <div
                className={clsx(
                  'flex flex-row items-center justify-end gap-2.5 py-2 text-(--secondary-color) sm:gap-3',
                  SHOW_GAME_MODE_NAME ? 'w-1/2' : 'w-full',
                )}
              >
                <StatItem icon={SquareCheck} value={numCorrectAnswers} />
                <StatItem icon={SquareX} value={numWrongAnswers} />
                <StatItem icon={Flame} value={currentStreak} />
                <StatItem icon={Star} value={stars} />
              </div>
            )}
          </div>
        )}
      </div>

      {/* Game content */}
      <div className='flex w-full flex-col items-center gap-6 sm:w-4/5 sm:gap-10'>
        <AnimatePresence mode='wait'>
          <motion.div
            key={`${currentQuestion.type}-${questionIndex}`}
            variants={gameContentVariants}
            initial='hidden'
            animate='visible'
            exit='exit'
            className='flex w-full flex-col items-center gap-6 sm:gap-10'
          >
            {/* Question Display */}
            <div className='flex flex-row items-center gap-1'>
              <motion.p
                className={clsx(
                  currentQuestion.type === 'kana'
                    ? 'text-7xl sm:text-8xl'
                    : 'text-8xl sm:text-9xl',
                )}
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                lang='ja'
              >
                {currentQuestion.display}
              </motion.p>
            </div>

            {/* Answer Row Area */}
            <div className='flex w-full flex-col items-center'>
              <div
                className={clsx(
                  'flex w-full items-center border-b-2 border-(--border-color) px-2 pb-2 md:w-3/4 lg:w-2/3 xl:w-1/2',
                  isLargeTile ? 'min-h-[5.5rem]' : 'min-h-[5rem]',
                )}
              >
                <motion.div
                  className='flex flex-row flex-wrap justify-start gap-3'
                  variants={celebrationContainerVariants}
                  initial='idle'
                  animate={isCelebrating ? 'celebrate' : 'idle'}
                >
                  {placedTiles.map(char => (
                    <ActiveTile
                      key={`answer-tile-${char}`}
                      id={`tile-${char}`}
                      char={char}
                      onClick={() => handleTileClick(char)}
                      isDisabled={isChecking && bottomBarState !== 'wrong'}
                      isLarge={isLargeTile}
                      variants={celebrationBounceVariants}
                      motionStyle={{ transformOrigin: '50% 100%' }}
                    />
                  ))}
                </motion.div>
              </div>
            </div>

            {/* Available Tiles - Single row with 2 options */}
            <motion.div
              className='flex flex-col items-center gap-3 sm:gap-4'
              variants={tileContainerVariants}
              initial='hidden'
              animate='visible'
            >
              <motion.div className='flex flex-row justify-center gap-3 sm:gap-4'>
                {allTiles.map(char => {
                  const isPlaced = placedTiles.includes(char);

                  return (
                    <motion.div
                      key={`tile-slot-${char}`}
                      className='relative'
                      variants={tileEntryVariants}
                      style={{ perspective: 1000 }}
                    >
                      <BlankTile char={char} isLarge={isLargeTile} />

                      {!isPlaced && (
                        <div className='absolute inset-0 z-10'>
                          <ActiveTile
                            id={`tile-${char}`}
                            char={char}
                            onClick={() => handleTileClick(char)}
                            isDisabled={
                              isChecking && bottomBarState !== 'wrong'
                            }
                            isLarge={isLargeTile}
                          />
                        </div>
                      )}
                    </motion.div>
                  );
                })}
              </motion.div>
            </motion.div>
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
          feedbackContent={currentQuestion.correctAnswer}
          buttonRef={buttonRef}
        />

        {/* Spacer */}
        <div className='h-32' />
      </div>
    </div>
  );
};

export default DemoGame;
