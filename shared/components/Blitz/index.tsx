'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { usePathname } from 'next/navigation';
import { useChallengeTimer } from '@/shared/hooks/useTimer';
import { useGoalTimers } from '@/shared/hooks/useGoalTimers';
import { useClick, useCorrect, useError } from '@/shared/hooks/useAudio';
import { shuffle } from '@/shared/lib/shuffle';
import confetti from 'canvas-confetti';
import { useRouter } from '@/core/i18n/routing';
import { statsTracking } from '@/features/Progress';

import EmptyState from './EmptyState';
import PreGameScreen from './PreGameScreen';
import ActiveGame from './ActiveGame';
import ResultsScreen from './ResultsScreen';
import type { BlitzGameMode, BlitzConfig } from './types';

// Re-export types for external use
export type { BlitzGameMode, BlitzConfig } from './types';

interface BlitzProps<T> {
  config: BlitzConfig<T>;
}

export default function Blitz<T>({ config }: BlitzProps<T>) {
  const router = useRouter();
  const pathname = usePathname();
  const isBlitzRoute = pathname?.includes('/blitz') ?? false;

  const { playClick } = useClick();
  const { playCorrect } = useCorrect();
  const { playError } = useError();

  const {
    dojoType,
    dojoLabel,
    localStorageKey,
    goalTimerContext,
    initialGameMode,
    items,
    selectedSets,
    generateQuestion,
    renderQuestion,
    inputPlaceholder,
    checkAnswer,
    getCorrectAnswer,
    generateOptions,
    renderOption,
    getCorrectOption,
    stats
  } = config;

  // Game mode state - use initialGameMode if provided (from store), otherwise use localStorage
  const [gameMode, setGameMode] = useState<BlitzGameMode>(() => {
    if (initialGameMode) {
      return initialGameMode;
    }
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(`${localStorageKey}_gameMode`);
      return (saved as BlitzGameMode) || 'Pick';
    }
    return 'Pick';
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(`${localStorageKey}_gameMode`, gameMode);
    }
  }, [gameMode, localStorageKey]);

  const pickModeSupported = !!(generateOptions && getCorrectOption);

  // Challenge duration
  const [challengeDuration, setChallengeDuration] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(localStorageKey);
      return saved ? parseInt(saved) : 60;
    }
    return 60;
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(localStorageKey, challengeDuration.toString());
    }
  }, [challengeDuration, localStorageKey]);

  // Timer
  const { seconds, minutes, isRunning, startTimer, resetTimer, timeLeft } =
    useChallengeTimer(challengeDuration);

  // Game state
  const [currentQuestion, setCurrentQuestion] = useState<T | null>(null);
  const [userAnswer, setUserAnswer] = useState('');
  const [isFinished, setIsFinished] = useState(false);
  const [lastAnswerCorrect, setLastAnswerCorrect] = useState<boolean | null>(
    null
  );
  const [showGoalTimers, setShowGoalTimers] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const [isBlitzBooting, setIsBlitzBooting] = useState(() => isBlitzRoute);
  const hasAutoStartedBlitz = useRef(false);

  // Pick mode state
  const [shuffledOptions, setShuffledOptions] = useState<string[]>([]);
  const [wrongSelectedAnswers, setWrongSelectedAnswers] = useState<string[]>(
    []
  );

  // Elapsed time for goal timers
  const elapsedTime = challengeDuration - timeLeft;

  // Goal Timers
  const goalTimers = useGoalTimers(elapsedTime, {
    enabled: showGoalTimers,
    saveToHistory: true,
    context: goalTimerContext,
    onGoalReached: goal => {
      console.log(`🎯 Goal reached: ${goal.label} at ${elapsedTime}s`);
    }
  });

  // Refs for stable callbacks
  const generateQuestionRef = useRef(generateQuestion);
  generateQuestionRef.current = generateQuestion;

  const generateOptionsRef = useRef(generateOptions);
  generateOptionsRef.current = generateOptions;

  // Initialize question
  useEffect(() => {
    if (items.length > 0 && !currentQuestion) {
      setCurrentQuestion(generateQuestionRef.current(items));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items]);

  // Blitz pages should not show the PreGameScreen at all; auto-start once when ready.
  useEffect(() => {
    if (!isBlitzRoute) {
      setIsBlitzBooting(false);
      return;
    }
    if (hasAutoStartedBlitz.current) return;
    if (isRunning || isFinished) return;
    if (items.length === 0) {
      setIsBlitzBooting(false);
      return;
    }
    if (!currentQuestion) return;

    hasAutoStartedBlitz.current = true;

    playClick();
    stats.reset();
    setIsFinished(false);
    setUserAnswer('');
    setLastAnswerCorrect(null);
    setWrongSelectedAnswers([]);
    goalTimers.resetGoals();
    resetTimer();
    startTimer();
    setIsBlitzBooting(false);
  }, [
    currentQuestion,
    isBlitzRoute,
    isFinished,
    isRunning,
    items.length,
    playClick,
    goalTimers,
    resetTimer,
    startTimer,
    stats
  ]);

  // Blitz mode always uses normal mode (never reverse)
  const isReverseActive = false;

  // Generate shuffled options when question changes (Pick mode)
  useEffect(() => {
    if (currentQuestion && gameMode === 'Pick' && generateOptionsRef.current) {
      const options = generateOptionsRef.current(
        currentQuestion,
        items,
        3,
        isReverseActive
      );
      setShuffledOptions(shuffle(options));
      setWrongSelectedAnswers([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentQuestion, gameMode, isReverseActive]);

  // Handle timer end
  useEffect(() => {
    if (timeLeft === 0 && !isFinished) {
      setIsFinished(true);
      confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
      // Track blitz stats for achievements
      statsTracking.recordBlitzSession({
        score: stats.correct,
        streak: stats.bestStreak,
        correctAnswers: stats.correct
      });
    }
  }, [timeLeft, isFinished, stats.correct, stats.bestStreak]);

  // Track challenge mode usage on mount
  useEffect(() => {
    // Track challenge mode usage for achievements (Requirements 8.1-8.3)
    statsTracking.recordChallengeModeUsed('blitz');
    statsTracking.recordDojoUsed(dojoType);
  }, [dojoType]);

  // Focus input for Type mode
  useEffect(() => {
    if (isRunning && gameMode === 'Type' && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isRunning, currentQuestion, gameMode]);

  // Handlers
  const handleStart = useCallback(() => {
    playClick();
    stats.reset();
    setIsFinished(false);
    setUserAnswer('');
    setLastAnswerCorrect(null);
    setWrongSelectedAnswers([]);
    setCurrentQuestion(generateQuestionRef.current(items));
    goalTimers.resetGoals();
    resetTimer();
    setTimeout(() => startTimer(), 50);
    setTimeout(() => {
      if (gameMode === 'Type' && inputRef.current) {
        inputRef.current.focus();
        inputRef.current.scrollIntoView({
          behavior: 'smooth',
          block: 'center'
        });
      }
    }, 100);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items, gameMode]);

  const handleCancel = () => {
    playClick();
    if (isBlitzRoute) {
      router.push(`/${dojoType}`);
      return;
    }
    resetTimer();
    setIsFinished(false);
    setUserAnswer('');
    setLastAnswerCorrect(null);
    setWrongSelectedAnswers([]);
  };

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!currentQuestion || !userAnswer.trim()) return;
    playClick();

    const isCorrect = checkAnswer(
      currentQuestion,
      userAnswer.trim(),
      isReverseActive
    );

    if (isCorrect) {
      playCorrect();
      stats.incrementCorrect();
      setLastAnswerCorrect(true);
      setTimeout(() => {
        setCurrentQuestion(generateQuestionRef.current(items));
        setLastAnswerCorrect(null);
      }, 300);
    } else {
      playError();
      stats.incrementWrong();
      setLastAnswerCorrect(false);
      setTimeout(() => setLastAnswerCorrect(null), 800);
    }
    setUserAnswer('');
  };

  const handleOptionClick = (selectedOption: string) => {
    if (!currentQuestion || !getCorrectOption) return;

    const correctOption = getCorrectOption(currentQuestion, isReverseActive);
    const isCorrect = selectedOption === correctOption;

    if (isCorrect) {
      playCorrect();
      stats.incrementCorrect();
      setLastAnswerCorrect(true);
      setWrongSelectedAnswers([]);
      setTimeout(() => {
        setCurrentQuestion(generateQuestionRef.current(items));
        setLastAnswerCorrect(null);
      }, 300);
    } else {
      playError();
      stats.incrementWrong();
      setWrongSelectedAnswers(prev => [...prev, selectedOption]);
      setLastAnswerCorrect(false);
    }
  };

  // Render states
  if (items.length === 0) {
    return <EmptyState dojoType={dojoType} dojoLabel={dojoLabel} />;
  }

  if (isBlitzRoute && isBlitzBooting) {
    return null;
  }

  if (!isBlitzRoute && !isRunning && !isFinished) {
    return (
      <PreGameScreen
        dojoType={dojoType}
        dojoLabel={dojoLabel}
        itemsCount={items.length}
        selectedSets={selectedSets}
        gameMode={gameMode}
        setGameMode={setGameMode}
        pickModeSupported={pickModeSupported}
        challengeDuration={challengeDuration}
        setChallengeDuration={setChallengeDuration}
        showGoalTimers={showGoalTimers}
        setShowGoalTimers={setShowGoalTimers}
        goalTimers={{
          goals: goalTimers.goals,
          addGoal: goalTimers.addGoal,
          removeGoal: goalTimers.removeGoal,
          clearGoals: goalTimers.clearGoals
        }}
        onStart={handleStart}
      />
    );
  }

  if (isFinished) {
    return (
      <ResultsScreen
        dojoType={dojoType}
        challengeDuration={challengeDuration}
        stats={{
          correct: stats.correct,
          wrong: stats.wrong,
          bestStreak: stats.bestStreak
        }}
        showGoalTimers={showGoalTimers}
        goals={goalTimers.goals}
        onRestart={handleStart}
      />
    );
  }

  return (
    <ActiveGame
      minutes={minutes}
      seconds={seconds}
      timeLeft={timeLeft}
      challengeDuration={challengeDuration}
      currentQuestion={currentQuestion}
      renderQuestion={renderQuestion}
      isReverseActive={isReverseActive ?? false}
      gameMode={gameMode}
      inputPlaceholder={inputPlaceholder}
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
      stats={{
        correct: stats.correct,
        wrong: stats.wrong,
        streak: stats.streak
      }}
      showGoalTimers={showGoalTimers}
      elapsedTime={elapsedTime}
      goalTimers={{
        goals: goalTimers.goals,
        addGoal: goalTimers.addGoal,
        removeGoal: goalTimers.removeGoal,
        clearGoals: goalTimers.clearGoals,
        nextGoal: goalTimers.nextGoal,
        progressToNextGoal: goalTimers.progressToNextGoal
      }}
      onCancel={handleCancel}
    />
  );
}
