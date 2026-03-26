'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from '@/core/i18n/routing';
import { Random } from 'random-js';
import { motion, AnimatePresence } from 'framer-motion';
import clsx from 'clsx';
import { useClick, useCorrect, useError } from '@/shared/hooks/useAudio';
import { shuffle } from '@/shared/lib/shuffle';
import { statsTracking } from '@/features/Progress';
import { startSession, finalizeSession } from '@/shared/lib/sessionHistory';
import {
  RUSH_DIFFICULTY_CONFIG,
  getComboMultiplier,
  calculateScore,
  getRushStars,
  type RushConfig,
  type RushDifficulty,
  type RushGameMode,
  type RushQuestion,
  type RushSessionStats,
} from './types';

// Re-export types for external use
export type {
  RushConfig,
  RushDifficulty,
  RushGameMode,
  RushQuestion,
  RushSessionStats,
} from './types';
import { buttonBorderStyles } from '@/shared/lib/styles';

const random = new Random();

interface RushProps<T> {
  config: RushConfig<T>;
  onCancel?: () => void;
}

/**
 * Generate a random question from items
 */
function generateRandomQuestion<T>(items: T[]): RushQuestion<T> {
  const randomIndex = random.integer(0, items.length - 1);
  return {
    item: items[randomIndex],
    index: randomIndex,
  };
}

export default function Rush<T>({ config, onCancel }: RushProps<T>) {
  const router = useRouter();
  const {
    dojoType,
    dojoLabel,
    items,
    selectedSets,
    generateQuestion,
    renderQuestion,
    checkAnswer,
    getCorrectAnswer,
    generateOptions,
    getCorrectOption,
    renderOption,
    initialGameMode,
    supportsReverseMode,
    inputPlaceholder,
  } = config;

  // Audio hooks
  const { playClick } = useClick();
  const { playCorrect } = useCorrect();
  const { playError } = useError();

  // Game configuration state
  const [gameMode, setGameMode] = useState<RushGameMode>(
    initialGameMode || 'Pick',
  );
  const [difficulty, setDifficulty] = useState<RushDifficulty>('medium');
  const [isReverse, setIsReverse] = useState(false);

  // Game phase state
  const [phase, setPhase] = useState<'pregame' | 'playing' | 'results'>(
    'pregame',
  );

  // Timer state
  const [timeRemaining, setTimeRemaining] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Game state
  const [currentQuestion, setCurrentQuestion] = useState<RushQuestion<T> | null>(
    null,
  );
  const [shuffledOptions, setShuffledOptions] = useState<string[]>([]);
  const [wrongSelectedAnswers, setWrongSelectedAnswers] = useState<string[]>(
    [],
  );
  const [userAnswer, setUserAnswer] = useState('');

  // Score state
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [maxCombo, setMaxCombo] = useState(0);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [wrongAnswers, setWrongAnswers] = useState(0);
  const [baseScore, setBaseScore] = useState(0);
  const [comboBonus, setComboBonus] = useState(0);

  // Time tracking
  const [answerTimes, setAnswerTimes] = useState<number[]>([]);
  const lastAnswerTime = useRef(0);
  const sessionIdRef = useRef<string | null>(null);

  // Session stats for results
  const [sessionStats, setSessionStats] = useState<RushSessionStats | null>(
    null,
  );

  // Preload sounds on mount
  useEffect(() => {
    void import('@/shared/hooks/useAudio').then(({ preloadGameSounds }) => {
      preloadGameSounds();
    });
  }, []);

  // Track challenge mode usage on mount
  useEffect(() => {
    statsTracking.recordChallengeModeUsed('rush');
    statsTracking.recordDojoUsed(dojoType);
  }, [dojoType]);

  // Check if Pick mode is supported
  const pickModeSupported = !!(generateOptions && getCorrectOption);

  // Generate shuffled options for Pick mode
  const generateShuffledOptions = useCallback(
    (questionItem: T) => {
      if (!generateOptions || gameMode !== 'Pick') return;
      const options = generateOptions(questionItem, items, 4, isReverse);
      setShuffledOptions(shuffle(options));
    },
    [generateOptions, gameMode, items, isReverse],
  );

  // Start the game
  const handleStart = useCallback(() => {
    playClick();

    const config = RUSH_DIFFICULTY_CONFIG[difficulty];
    setTimeRemaining(config.timeLimitSeconds);

    // Reset all state
    setScore(0);
    setCombo(0);
    setMaxCombo(0);
    setCorrectAnswers(0);
    setWrongAnswers(0);
    setBaseScore(0);
    setComboBonus(0);
    setAnswerTimes([]);
    setWrongSelectedAnswers([]);
    setUserAnswer('');
    lastAnswerTime.current = Date.now();

    // Generate first question
    const firstQuestion = generateQuestion(items);
    setCurrentQuestion(firstQuestion);
    generateShuffledOptions(firstQuestion.item);

    // Start session tracking
    startSession({
      sessionType: 'rush',
      dojoType,
      gameMode: gameMode.toLowerCase(),
      selectedSets: selectedSets || [],
      selectedCount: items.length,
      route: `/${dojoType}/rush`,
    }).then(id => {
      sessionIdRef.current = id;
    });

    setPhase('playing');
  }, [
    difficulty,
    playClick,
    items,
    generateQuestion,
    generateShuffledOptions,
    dojoType,
    gameMode,
    selectedSets,
  ]);

  // Timer effect
  useEffect(() => {
    if (phase !== 'playing') return;

    timerRef.current = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          // Time's up - end game
          clearInterval(timerRef.current!);
          handleEndGame();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [phase]);

  // End game and calculate stats
  const handleEndGame = useCallback(() => {
    const totalTimeMs =
      answerTimes.length > 0
        ? answerTimes.reduce((a, b) => a + b, 0)
        : 0;
    const validAnswerTimes = answerTimes.filter(t => t > 0);

    const stats: RushSessionStats = {
      timestamp: Date.now(),
      dojoType,
      difficulty,
      gameMode,
      timeLimitSeconds: RUSH_DIFFICULTY_CONFIG[difficulty].timeLimitSeconds,
      correctAnswers,
      wrongAnswers,
      accuracy:
        correctAnswers + wrongAnswers > 0
          ? correctAnswers / (correctAnswers + wrongAnswers)
          : 0,
      maxCombo,
      finalScore: score,
      baseScore,
      comboBonus,
      averageTimeMs:
        validAnswerTimes.length > 0
          ? validAnswerTimes.reduce((a, b) => a + b, 0) / validAnswerTimes.length
          : 0,
      fastestAnswerMs:
        validAnswerTimes.length > 0 ? Math.min(...validAnswerTimes) : 0,
      slowestAnswerMs:
        validAnswerTimes.length > 0 ? Math.max(...validAnswerTimes) : 0,
      totalCharacters: items.length,
      selectedSets: selectedSets || [],
    };

    setSessionStats(stats);

    // Finalize session
    if (sessionIdRef.current) {
      finalizeSession({
        sessionId: sessionIdRef.current,
        endedReason: 'completed',
        endedAbruptly: false,
        correct: correctAnswers,
        wrong: wrongAnswers,
        bestStreak: maxCombo,
        modePayload: {
          difficulty,
          gameMode,
          timeLimitSeconds: RUSH_DIFFICULTY_CONFIG[difficulty].timeLimitSeconds,
          finalScore: score,
          maxCombo,
        },
      });
    }

    // Track stats
    statsTracking.recordBlitzSession({
      score,
      streak: maxCombo,
      correctAnswers,
      wrongAnswers,
    });

    setPhase('results');
  }, [
    answerTimes,
    dojoType,
    difficulty,
    gameMode,
    correctAnswers,
    wrongAnswers,
    maxCombo,
    score,
    baseScore,
    comboBonus,
    items.length,
    selectedSets,
  ]);

  // Record answer time
  const recordAnswerTime = useCallback(() => {
    const now = Date.now();
    if (lastAnswerTime.current > 0) {
      const timeTaken = now - lastAnswerTime.current;
      if (timeTaken > 0) {
        setAnswerTimes(prev => [...prev, timeTaken]);
      }
    }
    lastAnswerTime.current = now;
  }, []);

  // Handle correct answer
  const handleCorrectAnswer = useCallback(() => {
    playCorrect();
    recordAnswerTime();

    const difficultyConfig = RUSH_DIFFICULTY_CONFIG[difficulty];
    const newCombo = combo + 1;
    const newMaxCombo = Math.max(maxCombo, newCombo);

    // Calculate score with combo bonus
    const basePoints = 100;
    const points = calculateScore(basePoints, combo, difficultyConfig.scoreMultiplier);
    const comboPoints = points - Math.round(basePoints * difficultyConfig.scoreMultiplier);

    setScore(prev => prev + points);
    setCombo(newCombo);
    setMaxCombo(newMaxCombo);
    setCorrectAnswers(prev => prev + 1);
    setBaseScore(prev => prev + Math.round(basePoints * difficultyConfig.scoreMultiplier));
    setComboBonus(prev => prev + comboPoints);
    setWrongSelectedAnswers([]);

    // Generate next question
    const nextQuestion = generateQuestion(items);
    setCurrentQuestion(nextQuestion);
    generateShuffledOptions(nextQuestion.item);
  }, [
    playCorrect,
    recordAnswerTime,
    difficulty,
    combo,
    maxCombo,
    items,
    generateQuestion,
    generateShuffledOptions,
  ]);

  // Handle wrong answer
  const handleWrongAnswer = useCallback(() => {
    playError();
    recordAnswerTime();

    setCombo(0);
    setWrongAnswers(prev => prev + 1);
  }, [playError, recordAnswerTime]);

  // Handle option click (Pick mode)
  const handleOptionClick = useCallback(
    (selectedOption: string) => {
      if (!currentQuestion) return;

      const correctOption = getCorrectOption
        ? getCorrectOption(currentQuestion.item, isReverse)
        : getCorrectAnswer(currentQuestion.item, isReverse);

      if (selectedOption === correctOption) {
        handleCorrectAnswer();
      } else {
        setWrongSelectedAnswers(prev => [...prev, selectedOption]);
        handleWrongAnswer();
      }
    },
    [
      currentQuestion,
      getCorrectOption,
      getCorrectAnswer,
      isReverse,
      handleCorrectAnswer,
      handleWrongAnswer,
    ],
  );

  // Handle input submit (Type mode)
  const handleInputSubmit = useCallback(() => {
    if (!currentQuestion || !userAnswer.trim()) return;

    const isCorrect = checkAnswer(
      currentQuestion.item,
      userAnswer.trim(),
      isReverse,
    );

    if (isCorrect) {
      handleCorrectAnswer();
      setUserAnswer('');
    } else {
      handleWrongAnswer();
      setUserAnswer('');
    }
  }, [
    currentQuestion,
    userAnswer,
    checkAnswer,
    isReverse,
    handleCorrectAnswer,
    handleWrongAnswer,
  ]);

  // Handle cancel
  const handleCancel = useCallback(() => {
    playClick();
    if (phase === 'playing') {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      handleEndGame();
      return;
    }
    router.push(`/${dojoType}`);
  }, [playClick, phase, router, dojoType, handleEndGame]);

  // Handle restart
  const handleRestart = useCallback(() => {
    playClick();
    setPhase('pregame');
  }, [playClick]);

  // Render pregame screen
  if (phase === 'pregame') {
    return (
      <div className='flex min-h-[80dvh] w-full flex-col items-center justify-center gap-8 px-4'>
        <div className='text-center'>
          <h1 className='text-4xl font-bold text-(--main-color)'>⚡ Rush Mode</h1>
          <p className='mt-2 text-lg text-(--secondary-color)'>
            {dojoLabel} - Answer fast, build combos!
          </p>
        </div>

        {/* Difficulty Selection */}
        <div className='flex flex-col gap-4'>
          <p className='text-center font-medium text-(--secondary-color)'>
            Select Difficulty
          </p>
          <div className='flex flex-wrap justify-center gap-3'>
            {(Object.keys(RUSH_DIFFICULTY_CONFIG) as RushDifficulty[]).map(
              diff => (
                <button
                  key={diff}
                  onClick={() => setDifficulty(diff)}
                  className={clsx(
                    'rounded-xl px-6 py-3 text-sm font-semibold transition-all',
                    difficulty === diff
                      ? 'bg-(--main-color) text-(--bg-color) scale-105'
                      : 'bg-(--card-color) text-(--secondary-color) hover:bg-(--main-color)/20',
                  )}
                >
                  <div>{RUSH_DIFFICULTY_CONFIG[diff].label}</div>
                  <div className='text-xs opacity-75'>
                    {RUSH_DIFFICULTY_CONFIG[diff].description}
                  </div>
                </button>
              ),
            )}
          </div>
        </div>

        {/* Game Mode Selection */}
        <div className='flex flex-col gap-4'>
          <p className='text-center font-medium text-(--secondary-color)'>
            Game Mode
          </p>
          <div className='flex gap-3'>
            <button
              onClick={() => setGameMode('Pick')}
              className={clsx(
                'rounded-xl px-6 py-3 font-semibold transition-all',
                gameMode === 'Pick'
                  ? 'bg-(--main-color) text-(--bg-color)'
                  : 'bg-(--card-color) text-(--secondary-color) hover:bg-(--main-color)/20',
              )}
            >
              🎯 Pick
            </button>
            <button
              onClick={() => setGameMode('Type')}
              disabled={!checkAnswer}
              className={clsx(
                'rounded-xl px-6 py-3 font-semibold transition-all',
                gameMode === 'Type'
                  ? 'bg-(--main-color) text-(--bg-color)'
                  : 'bg-(--card-color) text-(--secondary-color) hover:bg-(--main-color)/20',
                !checkAnswer && 'opacity-50 cursor-not-allowed',
              )}
            >
              ⌨️ Type
            </button>
          </div>
        </div>

        {/* Reverse Mode Toggle */}
        {supportsReverseMode && (
          <div className='flex items-center gap-3'>
            <button
              onClick={() => setIsReverse(!isReverse)}
              className={clsx(
                'rounded-xl px-6 py-3 font-semibold transition-all',
                isReverse
                  ? 'bg-(--main-color) text-(--bg-color)'
                  : 'bg-(--card-color) text-(--secondary-color) hover:bg-(--main-color)/20',
              )}
            >
              🔄 Reverse Mode
            </button>
            <span className='text-sm text-(--secondary-color)'>
              {isReverse ? 'Answer → Question' : 'Question → Answer'}
            </span>
          </div>
        )}

        {/* Selected Sets Display */}
        <div className='text-center text-sm text-(--secondary-color)/70'>
          <p>Practicing: {selectedSets.join(', ')}</p>
          <p className='mt-1'>{items.length} items selected</p>
        </div>

        {/* Start Button */}
        <button
          onClick={handleStart}
          disabled={items.length === 0}
          className={clsx(
            'rounded-2xl px-12 py-4 text-xl font-bold transition-all',
            'bg-(--main-color) text-(--bg-color)',
            'hover:scale-105 active:scale-95',
            items.length === 0 && 'opacity-50 cursor-not-allowed',
          )}
        >
          🚀 Start Rush!
        </button>

        {onCancel && (
          <button
            onClick={onCancel}
            className='text-(--secondary-color)/50 hover:text-(--secondary-color)'
          >
            Cancel
          </button>
        )}
      </div>
    );
  }

  // Render results screen
  if (phase === 'results' && sessionStats) {
    const stars = getRushStars(score, correctAnswers * 100 * RUSH_DIFFICULTY_CONFIG[difficulty].scoreMultiplier * 3);
    
    return (
      <div className='flex min-h-[80dvh] w-full flex-col items-center justify-center gap-6 px-4'>
        <div className='text-center'>
          <h1 className='text-4xl font-bold text-(--main-color)'>🎉 Time's Up!</h1>
          <p className='mt-2 text-lg text-(--secondary-color)'>{dojoLabel} Rush Complete</p>
        </div>

        {/* Stars */}
        <div className='flex gap-2 text-4xl'>
          {[1, 2, 3].map(i => (
            <span key={i} className={i <= stars ? 'text-yellow-400' : 'text-(--border-color)'}>
              {i <= stars ? '⭐' : '☆'}
            </span>
          ))}
        </div>

        {/* Score */}
        <div className='text-center'>
          <p className='text-6xl font-bold text-(--main-color)'>{sessionStats.finalScore}</p>
          <p className='text-sm text-(--secondary-color)'>Total Score</p>
        </div>

        {/* Stats Grid */}
        <div className='grid grid-cols-2 gap-4 text-center'>
          <div className='rounded-xl bg-(--card-color) p-4'>
            <p className='text-2xl font-bold text-(--main-color)'>
              {sessionStats.correctAnswers}
            </p>
            <p className='text-xs text-(--secondary-color)'>Correct</p>
          </div>
          <div className='rounded-xl bg-(--card-color) p-4'>
            <p className='text-2xl font-bold text-(--main-color)'>
              {sessionStats.wrongAnswers}
            </p>
            <p className='text-xs text-(--secondary-color)'>Wrong</p>
          </div>
          <div className='rounded-xl bg-(--card-color) p-4'>
            <p className='text-2xl font-bold text-(--main-color)'>
              {sessionStats.maxCombo}x
            </p>
            <p className='text-xs text-(--secondary-color)'>Max Combo</p>
          </div>
          <div className='rounded-xl bg-(--card-color) p-4'>
            <p className='text-2xl font-bold text-(--main-color)'>
              {Math.round(sessionStats.accuracy * 100)}%
            </p>
            <p className='text-xs text-(--secondary-color)'>Accuracy</p>
          </div>
        </div>

        {/* Score Breakdown */}
        <div className='text-center text-sm text-(--secondary-color)'>
          <p>Base Score: {sessionStats.baseScore}</p>
          <p className='text-(--main-color)'>Combo Bonus: +{sessionStats.comboBonus}</p>
        </div>

        {/* Actions */}
        <div className='flex gap-4'>
          <button
            onClick={handleStart}
            className='rounded-xl bg-(--main-color) px-8 py-3 font-bold text-(--bg-color) hover:scale-105'
          >
            🔄 Play Again
          </button>
          <button
            onClick={handleRestart}
            className='rounded-xl bg-(--card-color) px-8 py-3 font-bold text-(--secondary-color) hover:bg-(--main-color)/20'
          >
            ⚙️ Change Settings
          </button>
        </div>

        <button
          onClick={() => router.push(`/${dojoType}`)}
          className='text-(--secondary-color)/50 hover:text-(--secondary-color)'
        >
          ← Back to {dojoLabel}
        </button>
      </div>
    );
  }

  // Render playing screen
  if (!currentQuestion) return null;

  const difficultyConfig = RUSH_DIFFICULTY_CONFIG[difficulty];
  const comboMultiplier = getComboMultiplier(combo);

  return (
    <div className='flex min-h-[100dvh] w-full flex-col items-center gap-4 px-4 py-6'>
      {/* Top Bar: Timer and Score */}
      <div className='flex w-full max-w-2xl items-center justify-between'>
        {/* Timer */}
        <div className='flex items-center gap-2'>
          <span className='text-2xl'>⏱️</span>
          <span
            className={clsx(
              'text-3xl font-bold tabular-nums',
              timeRemaining <= 10 ? 'text-red-500 animate-pulse' : 'text-(--main-color)',
            )}
          >
            {timeRemaining}s
          </span>
        </div>

        {/* Score and Combo */}
        <div className='flex items-center gap-4'>
          {combo > 0 && (
            <motion.div
              key={combo}
              initial={{ scale: 1.2 }}
              animate={{ scale: 1 }}
              className='rounded-lg bg-(--main-color)/20 px-3 py-1'
            >
              <span className='text-lg font-bold text-(--main-color)'>
                🔥 {combo}x
              </span>
            </motion.div>
          )}
          <div className='text-right'>
            <p className='text-2xl font-bold text-(--main-color)'>{score}</p>
            <p className='text-xs text-(--secondary-color)'>Score</p>
          </div>
        </div>
      </div>

      {/* Quit Button */}
      <button
        onClick={handleCancel}
        className='absolute right-4 top-4 rounded-lg bg-(--card-color) px-3 py-1 text-sm text-(--secondary-color) hover:bg-(--main-color)/20'
      >
        ✕ Quit
      </button>

      {/* Combo Multiplier Indicator */}
      <AnimatePresence>
        {combo > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className='text-center'
          >
            <span className='text-sm text-(--secondary-color)'>
              Combo Multiplier: {comboMultiplier.toFixed(1)}x
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Question Display */}
      <div className='flex flex-1 flex-col items-center justify-center gap-8'>
        <motion.div
          key={currentQuestion.index}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className='text-center'
        >
          <p className='text-8xl font-medium sm:text-9xl'>
            {renderQuestion(currentQuestion.item, isReverse)}
          </p>
        </motion.div>

        {/* Pick Mode Options */}
        {gameMode === 'Pick' && shuffledOptions.length > 0 && (
          <div className='flex w-full max-w-lg flex-col gap-3'>
            <div className='flex gap-3'>
              {shuffledOptions.slice(0, 2).map((option, i) => (
                <button
                  key={option + i}
                  onClick={() => handleOptionClick(option)}
                  disabled={wrongSelectedAnswers.includes(option)}
                  className={clsx(
                    'flex-1 rounded-xl py-4 text-xl font-semibold transition-all',
                    buttonBorderStyles,
                    wrongSelectedAnswers.includes(option)
                      ? 'border-(--border-color) text-(--border-color) opacity-50'
                      : 'border-(--secondary-color)/50 text-(--secondary-color) hover:border-(--secondary-color) hover:scale-105',
                  )}
                >
                  {renderOption ? renderOption(option) : option}
                </button>
              ))}
            </div>
            <div className='flex gap-3'>
              {shuffledOptions.slice(2, 4).map((option, i) => (
                <button
                  key={option + i}
                  onClick={() => handleOptionClick(option)}
                  disabled={wrongSelectedAnswers.includes(option)}
                  className={clsx(
                    'flex-1 rounded-xl py-4 text-xl font-semibold transition-all',
                    buttonBorderStyles,
                    wrongSelectedAnswers.includes(option)
                      ? 'border-(--border-color) text-(--border-color) opacity-50'
                      : 'border-(--secondary-color)/50 text-(--secondary-color) hover:border-(--secondary-color) hover:scale-105',
                  )}
                >
                  {renderOption ? renderOption(option) : option}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Type Mode Input */}
        {gameMode === 'Type' && (
          <div className='flex w-full max-w-md flex-col gap-4'>
            <input
              type='text'
              value={userAnswer}
              onChange={e => setUserAnswer(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter') {
                  handleInputSubmit();
                }
              }}
              placeholder={inputPlaceholder || 'Type your answer...'}
              autoFocus
              className={clsx(
                'w-full rounded-2xl border-2 border-(--border-color) bg-(--card-color)',
                'px-5 py-4 text-center text-2xl font-medium',
                'text-(--secondary-color) placeholder:text-(--secondary-color)/40',
                'focus:border-(--main-color) focus:outline-none',
              )}
            />
            <button
              onClick={handleInputSubmit}
              disabled={!userAnswer.trim()}
              className={clsx(
                'rounded-xl py-3 text-lg font-bold transition-all',
                userAnswer.trim()
                  ? 'bg-(--main-color) text-(--bg-color) hover:scale-105'
                  : 'bg-(--card-color) text-(--border-color)',
              )}
            >
              Submit
            </button>
          </div>
        )}
      </div>

      {/* Progress Stats */}
      <div className='flex gap-6 text-center text-sm text-(--secondary-color)'>
        <div>
          <span className='text-green-500'>✓ {correctAnswers}</span>
        </div>
        <div>
          <span className='text-red-500'>✗ {wrongAnswers}</span>
        </div>
      </div>
    </div>
  );
}