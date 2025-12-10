'use client';

import { useEffect, useState, useRef } from 'react';
import { useChallengeTimer } from '@/shared/hooks/useTimer';
import { useGoalTimers } from '@/shared/hooks/useGoalTimers';
import { useSmartReverseMode } from '@/shared/hooks/useSmartReverseMode';
import { useClick, useCorrect, useError } from '@/shared/hooks/useAudio';
import confetti from 'canvas-confetti';

import EmptyState from './EmptyState';
import PreGameScreen from './PreGameScreen';
import ActiveGame from './ActiveGame';
import ResultsScreen from './ResultsScreen';
import type { BlitzGameMode, TimedChallengeConfig } from './types';

// Re-export types for external use
export type { BlitzGameMode, TimedChallengeConfig } from './types';

interface TimedChallengeProps<T> {
  config: TimedChallengeConfig<T>;
}

export default function TimedChallenge<T>({ config }: TimedChallengeProps<T>) {
  const { playClick } = useClick();
  const { playCorrect } = useCorrect();
  const { playError } = useError();

  const {
    dojoType,
    dojoLabel,
    localStorageKey,
    goalTimerContext,
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
    supportsReverseMode,
    stats
  } = config;

  // Smart reverse mode
  const {
    isReverse,
    decideNextMode,
    recordWrongAnswer: resetReverseStreak
  } = useSmartReverseMode();

  // Game mode state
  const [gameMode, setGameMode] = useState<BlitzGameMode>(() => {
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

  const isReverseActive = supportsReverseMode && isReverse;

  // Generate shuffled options when question changes (Pick mode)
  useEffect(() => {
    if (currentQuestion && gameMode === 'Pick' && generateOptionsRef.current) {
      const options = generateOptionsRef.current(
        currentQuestion,
        items,
        3,
        isReverseActive
      );
      const shuffled = [...options].sort(() => Math.random() - 0.5);
      setShuffledOptions(shuffled);
      setWrongSelectedAnswers([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentQuestion, gameMode, isReverseActive]);

  // Handle timer end
  useEffect(() => {
    if (timeLeft === 0 && !isFinished) {
      setIsFinished(true);
      confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
    }
  }, [timeLeft, isFinished]);

  // Focus input for Type mode
  useEffect(() => {
    if (isRunning && gameMode === 'Type' && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isRunning, currentQuestion, gameMode]);

  // Handlers
  const handleStart = () => {
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
  };

  const handleCancel = () => {
    playClick();
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
      if (supportsReverseMode) {
        decideNextMode();
      }
      setTimeout(() => {
        setCurrentQuestion(generateQuestionRef.current(items));
        setLastAnswerCorrect(null);
      }, 300);
    } else {
      playError();
      stats.incrementWrong();
      if (supportsReverseMode) {
        resetReverseStreak();
      }
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
      if (supportsReverseMode) {
        decideNextMode();
      }
      setTimeout(() => {
        setCurrentQuestion(generateQuestionRef.current(items));
        setLastAnswerCorrect(null);
      }, 300);
    } else {
      playError();
      stats.incrementWrong();
      setWrongSelectedAnswers(prev => [...prev, selectedOption]);
      setLastAnswerCorrect(false);
      if (supportsReverseMode) {
        resetReverseStreak();
      }
    }
  };

  // Render states
  if (items.length === 0) {
    return <EmptyState dojoType={dojoType} dojoLabel={dojoLabel} />;
  }

  if (!isRunning && !isFinished) {
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
