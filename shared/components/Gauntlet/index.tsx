'use client';

import { useEffect, useState, useRef, useCallback, useMemo } from 'react';
import { usePathname } from 'next/navigation';
import { useRouter } from '@/core/i18n/routing';
import { Random } from 'random-js';
import { useClick, useCorrect, useError } from '@/shared/hooks/useAudio';
import { useSmartReverseMode } from '@/shared/hooks/useSmartReverseMode';
import { saveSession } from '@/shared/lib/gauntletStats';

import EmptyState from './EmptyState';
import PreGameScreen from './PreGameScreen';
import ActiveGame from './ActiveGame';
import ResultsScreen from './ResultsScreen';
import {
  DIFFICULTY_CONFIG,
  REPETITION_OPTIONS,
  type GauntletConfig,
  type GauntletDifficulty,
  type GauntletGameMode,
  type GauntletQuestion,
  type GauntletSessionStats,
  type RepetitionCount
} from './types';

// Re-export types for external use
export type { GauntletGameMode, GauntletConfig } from './types';

const random = new Random();

interface GauntletProps<T> {
  config: GauntletConfig<T>;
}

/**
 * Calculate the threshold for life regeneration based on total questions
 * Scales with game size but has min/max bounds
 */
const calculateRegenThreshold = (totalQuestions: number): number => {
  // 10% of total questions, clamped between 5 and 20
  return Math.max(5, Math.min(20, Math.ceil(totalQuestions * 0.1)));
};

/**
 * Generate a shuffled queue of all questions
 * Each character appears `repetitions` times in random order
 */
function generateQuestionQueue<T>(
  items: T[],
  repetitions: number,
  generateQuestion: (items: T[]) => T
): GauntletQuestion<T>[] {
  const queue: GauntletQuestion<T>[] = [];

  // Create all question entries
  items.forEach(item => {
    for (let rep = 1; rep <= repetitions; rep++) {
      queue.push({
        item,
        index: 0, // Will be set after shuffle
        repetitionNumber: rep
      });
    }
  });

  // Fisher-Yates shuffle
  for (let i = queue.length - 1; i > 0; i--) {
    const j = random.integer(0, i);
    [queue[i], queue[j]] = [queue[j], queue[i]];
  }

  // Set indices after shuffle
  queue.forEach((q, i) => {
    q.index = i;
  });

  return queue;
}

export default function Gauntlet<T>({ config }: GauntletProps<T>) {
  const router = useRouter();
  const pathname = usePathname();
  const isGauntletRoute = pathname?.includes('/gauntlet') ?? false;

  const { playClick } = useClick();
  const { playCorrect } = useCorrect();
  const { playError } = useError();

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
    renderOption,
    getCorrectOption,
    supportsReverseMode,
    initialGameMode
  } = config;

  // Smart reverse mode
  const {
    isReverse,
    decideNextMode,
    recordWrongAnswer: resetReverseStreak
  } = useSmartReverseMode();

  // Game configuration state
  const [gameMode, setGameMode] = useState<GauntletGameMode>(
    initialGameMode || 'Pick'
  );
  const [difficulty, setDifficulty] = useState<GauntletDifficulty>('normal');
  const [repetitions, setRepetitions] = useState<RepetitionCount>(10);

  // Game phase state
  const [phase, setPhase] = useState<'pregame' | 'playing' | 'results'>(
    'pregame'
  );

  // Game state
  const [questionQueue, setQuestionQueue] = useState<GauntletQuestion<T>[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [lives, setLives] = useState(3);
  const [maxLives, setMaxLives] = useState(3);
  const [correctSinceLastRegen, setCorrectSinceLastRegen] = useState(0);
  const [regenThreshold, setRegenThreshold] = useState(10);

  // Stats tracking
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [wrongAnswers, setWrongAnswers] = useState(0);
  const [currentStreak, setCurrentStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [livesRegenerated, setLivesRegenerated] = useState(0);
  const [characterStats, setCharacterStats] = useState<
    Record<string, { correct: number; wrong: number }>
  >({});

  // Time tracking
  const [startTime, setStartTime] = useState(0);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [answerTimes, setAnswerTimes] = useState<number[]>([]);
  const lastAnswerTime = useRef(0);

  // Answer feedback
  const [lastAnswerCorrect, setLastAnswerCorrect] = useState<boolean | null>(
    null
  );
  const [lifeJustGained, setLifeJustGained] = useState(false);
  const [lifeJustLost, setLifeJustLost] = useState(false);

  // Input state
  const [userAnswer, setUserAnswer] = useState('');
  const [shuffledOptions, setShuffledOptions] = useState<string[]>([]);
  const [wrongSelectedAnswers, setWrongSelectedAnswers] = useState<string[]>(
    []
  );

  // Session stats for results
  const [sessionStats, setSessionStats] = useState<Omit<
    GauntletSessionStats,
    'id'
  > | null>(null);
  const [isNewBest, setIsNewBest] = useState(false);

  const pickModeSupported = !!(generateOptions && getCorrectOption);
  const isReverseActive = supportsReverseMode && isReverse;

  const totalQuestions = items.length * repetitions;
  const currentQuestion = questionQueue[currentIndex] || null;

  // Timer effect
  useEffect(() => {
    if (phase !== 'playing' || startTime === 0) return;

    const interval = setInterval(() => {
      setElapsedTime(Date.now() - startTime);
    }, 100);

    return () => clearInterval(interval);
  }, [phase, startTime]);

  // Generate options when question changes (Pick mode)
  useEffect(() => {
    if (
      currentQuestion &&
      gameMode === 'Pick' &&
      generateOptions &&
      phase === 'playing'
    ) {
      const options = generateOptions(
        currentQuestion.item,
        items,
        3,
        isReverseActive
      );
      const shuffled = [...options].sort(() => random.real(0, 1) - 0.5);
      setShuffledOptions(shuffled);
      setWrongSelectedAnswers([]);
    }
  }, [
    currentQuestion,
    gameMode,
    generateOptions,
    items,
    isReverseActive,
    phase
  ]);

  // Handle game start
  const handleStart = useCallback(() => {
    playClick();

    const queue = generateQuestionQueue(items, repetitions, generateQuestion);
    const diffConfig = DIFFICULTY_CONFIG[difficulty];
    const threshold = calculateRegenThreshold(queue.length);

    setQuestionQueue(queue);
    setCurrentIndex(0);
    setLives(diffConfig.lives);
    setMaxLives(diffConfig.lives);
    setCorrectSinceLastRegen(0);
    setRegenThreshold(threshold);

    setCorrectAnswers(0);
    setWrongAnswers(0);
    setCurrentStreak(0);
    setBestStreak(0);
    setLivesRegenerated(0);
    setCharacterStats({});

    const now = Date.now();
    setStartTime(now);
    setElapsedTime(0);
    setAnswerTimes([]);
    lastAnswerTime.current = now;

    setLastAnswerCorrect(null);
    setLifeJustGained(false);
    setLifeJustLost(false);
    setUserAnswer('');
    setWrongSelectedAnswers([]);

    setPhase('playing');
  }, [items, repetitions, difficulty, generateQuestion, playClick]);

  // Get a unique identifier for the current question item
  const getItemId = useCallback((item: T): string => {
    // Try common patterns for getting an identifier
    if (typeof item === 'object' && item !== null) {
      const obj = item as Record<string, unknown>;
      if ('kana' in obj) return String(obj.kana);
      if ('kanji' in obj) return String(obj.kanji);
      if ('word' in obj) return String(obj.word);
      if ('id' in obj) return String(obj.id);
    }
    return String(item);
  }, []);

  // End game and calculate stats
  const endGame = useCallback(
    async (completed: boolean) => {
      const totalTimeMs = Date.now() - startTime;
      const validAnswerTimes = answerTimes.filter(t => t > 0);

      const stats: Omit<GauntletSessionStats, 'id'> = {
        timestamp: Date.now(),
        dojoType,
        difficulty,
        gameMode,
        totalQuestions,
        correctAnswers,
        wrongAnswers,
        accuracy:
          correctAnswers + wrongAnswers > 0
            ? correctAnswers / (correctAnswers + wrongAnswers)
            : 0,
        bestStreak,
        currentStreak,
        startingLives: maxLives,
        livesRemaining: lives,
        livesLost: maxLives - lives + livesRegenerated,
        livesRegenerated,
        totalTimeMs,
        averageTimePerQuestionMs:
          validAnswerTimes.length > 0
            ? validAnswerTimes.reduce((a, b) => a + b, 0) /
              validAnswerTimes.length
            : 0,
        fastestAnswerMs:
          validAnswerTimes.length > 0 ? Math.min(...validAnswerTimes) : 0,
        slowestAnswerMs:
          validAnswerTimes.length > 0 ? Math.max(...validAnswerTimes) : 0,
        completed,
        questionsCompleted: currentIndex,
        characterStats,
        totalCharacters: items.length,
        repetitionsPerChar: repetitions,
        selectedSets: selectedSets || []
      };

      setSessionStats(stats);

      // Save to storage
      const { isNewBest: newBest } = await saveSession(stats);
      setIsNewBest(newBest);

      setPhase('results');
    },
    [
      startTime,
      answerTimes,
      dojoType,
      difficulty,
      gameMode,
      totalQuestions,
      correctAnswers,
      wrongAnswers,
      bestStreak,
      currentStreak,
      maxLives,
      lives,
      livesRegenerated,
      currentIndex,
      characterStats,
      items.length,
      repetitions,
      selectedSets
    ]
  );

  // Process correct answer
  const processCorrectAnswer = useCallback(() => {
    playCorrect();
    setLastAnswerCorrect(true);

    const now = Date.now();
    const timeTaken = now - lastAnswerTime.current;
    lastAnswerTime.current = now;
    setAnswerTimes(prev => [...prev, timeTaken]);

    setCorrectAnswers(prev => prev + 1);
    setCurrentStreak(prev => {
      const newStreak = prev + 1;
      if (newStreak > bestStreak) {
        setBestStreak(newStreak);
      }
      return newStreak;
    });

    // Update character stats
    if (currentQuestion) {
      const charId = getItemId(currentQuestion.item);
      setCharacterStats(prev => ({
        ...prev,
        [charId]: {
          correct: (prev[charId]?.correct || 0) + 1,
          wrong: prev[charId]?.wrong || 0
        }
      }));
    }

    // Check for life regeneration (Normal mode only)
    const canRegen = DIFFICULTY_CONFIG[difficulty].regenerates;
    if (canRegen && lives < maxLives) {
      const newCorrectSinceRegen = correctSinceLastRegen + 1;
      if (newCorrectSinceRegen >= regenThreshold) {
        setLives(prev => Math.min(prev + 1, maxLives));
        setCorrectSinceLastRegen(0);
        setLivesRegenerated(prev => prev + 1);
        setLifeJustGained(true);
        setTimeout(() => setLifeJustGained(false), 500);
      } else {
        setCorrectSinceLastRegen(newCorrectSinceRegen);
      }
    }

    // Smart reverse mode
    if (supportsReverseMode) {
      decideNextMode();
    }

    // Clear feedback and move to next
    setTimeout(() => {
      setLastAnswerCorrect(null);
      setUserAnswer('');
      setWrongSelectedAnswers([]);

      // Check if game is complete
      if (currentIndex + 1 >= totalQuestions) {
        endGame(true);
      } else {
        setCurrentIndex(prev => prev + 1);
      }
    }, 300);
  }, [
    playCorrect,
    currentQuestion,
    getItemId,
    difficulty,
    lives,
    maxLives,
    correctSinceLastRegen,
    regenThreshold,
    supportsReverseMode,
    decideNextMode,
    currentIndex,
    totalQuestions,
    endGame,
    bestStreak
  ]);

  // Process wrong answer
  const processWrongAnswer = useCallback(() => {
    playError();
    setLastAnswerCorrect(false);

    setWrongAnswers(prev => prev + 1);
    setCurrentStreak(0);
    setCorrectSinceLastRegen(0); // Reset regen progress on wrong answer

    // Update character stats
    if (currentQuestion) {
      const charId = getItemId(currentQuestion.item);
      setCharacterStats(prev => ({
        ...prev,
        [charId]: {
          correct: prev[charId]?.correct || 0,
          wrong: (prev[charId]?.wrong || 0) + 1
        }
      }));
    }

    // Smart reverse mode
    if (supportsReverseMode) {
      resetReverseStreak();
    }

    // Lose a life
    const newLives = lives - 1;
    setLives(newLives);
    setLifeJustLost(true);
    setTimeout(() => setLifeJustLost(false), 500);

    // Check for game over
    if (newLives <= 0) {
      setTimeout(() => {
        endGame(false);
      }, 500);
    } else {
      setTimeout(() => setLastAnswerCorrect(null), 800);
    }
  }, [
    playError,
    currentQuestion,
    getItemId,
    supportsReverseMode,
    resetReverseStreak,
    lives,
    endGame
  ]);

  // Handle answer submission (Type mode)
  const handleSubmit = useCallback(
    (e?: React.FormEvent) => {
      e?.preventDefault();
      if (!currentQuestion || !userAnswer.trim()) return;

      const isCorrect = checkAnswer(
        currentQuestion.item,
        userAnswer.trim(),
        isReverseActive
      );

      if (isCorrect) {
        processCorrectAnswer();
      } else {
        processWrongAnswer();
      }
    },
    [
      currentQuestion,
      userAnswer,
      checkAnswer,
      isReverseActive,
      processCorrectAnswer,
      processWrongAnswer
    ]
  );

  // Handle option click (Pick mode)
  const handleOptionClick = useCallback(
    (selectedOption: string) => {
      if (!currentQuestion || !getCorrectOption) return;

      const correctOption = getCorrectOption(
        currentQuestion.item,
        isReverseActive
      );
      const isCorrect = selectedOption === correctOption;

      if (isCorrect) {
        processCorrectAnswer();
      } else {
        setWrongSelectedAnswers(prev => [...prev, selectedOption]);
        processWrongAnswer();
      }
    },
    [
      currentQuestion,
      getCorrectOption,
      isReverseActive,
      processCorrectAnswer,
      processWrongAnswer
    ]
  );

  // Handle cancel
  const handleCancel = useCallback(() => {
    playClick();
    if (isGauntletRoute) {
      router.push(`/${dojoType}`);
    } else {
      setPhase('pregame');
    }
  }, [playClick, isGauntletRoute, router, dojoType]);

  // Render states
  if (items.length === 0) {
    return <EmptyState dojoType={dojoType} dojoLabel={dojoLabel} />;
  }

  if (phase === 'pregame') {
    return (
      <PreGameScreen
        dojoType={dojoType}
        dojoLabel={dojoLabel}
        itemsCount={items.length}
        selectedSets={selectedSets || []}
        gameMode={gameMode}
        setGameMode={setGameMode}
        difficulty={difficulty}
        setDifficulty={setDifficulty}
        repetitions={repetitions}
        setRepetitions={setRepetitions}
        pickModeSupported={pickModeSupported}
        onStart={handleStart}
      />
    );
  }

  if (phase === 'results' && sessionStats) {
    return (
      <ResultsScreen
        dojoType={dojoType}
        stats={sessionStats}
        isNewBest={isNewBest}
        onRestart={handleStart}
        onChangeSettings={() => setPhase('pregame')}
      />
    );
  }

  return (
    <ActiveGame
      dojoType={dojoType}
      currentIndex={currentIndex}
      totalQuestions={totalQuestions}
      lives={lives}
      maxLives={maxLives}
      difficulty={difficulty}
      lifeJustGained={lifeJustGained}
      lifeJustLost={lifeJustLost}
      elapsedTime={elapsedTime}
      currentQuestion={currentQuestion?.item || null}
      renderQuestion={renderQuestion}
      isReverseActive={isReverseActive ?? false}
      gameMode={gameMode}
      inputPlaceholder='Type your answer...'
      userAnswer={userAnswer}
      setUserAnswer={setUserAnswer}
      onSubmit={handleSubmit}
      getCorrectAnswer={getCorrectAnswer}
      shuffledOptions={shuffledOptions}
      wrongSelectedAnswers={wrongSelectedAnswers}
      onOptionClick={handleOptionClick}
      renderOption={renderOption}
      items={items}
      lastAnswerCorrect={lastAnswerCorrect}
      currentStreak={currentStreak}
      correctSinceLastRegen={correctSinceLastRegen}
      regenThreshold={regenThreshold}
      correctAnswers={correctAnswers}
      wrongAnswers={wrongAnswers}
      onCancel={handleCancel}
    />
  );
}
