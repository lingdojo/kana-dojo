'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { usePathname } from 'next/navigation';
import { useRouter } from '@/core/i18n/routing';
import { useChallengeTimer } from '@/shared/hooks/game/useChallengeTimer';
import { useGoalTimers } from '@/shared/hooks/game/useGoalTimers';
import { useClick, useCorrect, useError } from '@/shared/hooks/generic/useAudio';
import { shuffle } from '@/shared/utils/shuffle';
import confetti from 'canvas-confetti';
import { statsTracking } from '@/features/Progress';
import {
  appendAttempt,
  finalizeSession,
  startSession,
} from '@/shared/utils/sessionHistory';

import EmptyState from './EmptyState';
import ActiveGame from './ActiveGame';
import SessionSummaryScreen from '@/shared/ui-composite/Game/SessionSummaryScreen';
import type { BlitzGameMode, BlitzConfig } from './types';

// Re-export types for external use
export type { BlitzGameMode, BlitzConfig } from './types';

interface BlitzProps<T> {
  config: BlitzConfig<T>;
}

export default function Blitz<T>({ config }: BlitzProps<T>) {
  const pathname = usePathname();
  const router = useRouter();

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
    stats,
  } = config;

  // Game mode state - use initialGameMode if provided (from store), otherwise use localStorage
  const [gameMode] = useState<BlitzGameMode>(() => {
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

  // Challenge duration
  const [challengeDuration] = useState(() => {
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
  const [endedReason, setEndedReason] = useState<'completed' | 'manual_quit'>(
    'completed',
  );
  const [lastAnswerCorrect, setLastAnswerCorrect] = useState<boolean | null>(
    null,
  );
  const [showGoalTimers] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const sessionIdRef = useRef<string | null>(null);
  const sessionStartPromiseRef = useRef<Promise<string> | null>(null);
  const finalizedRef = useRef(false);

  const [isBlitzBooting, setIsBlitzBooting] = useState(true);
  const hasAutoStartedBlitz = useRef(false);

  // Pick mode state
  const [shuffledOptions, setShuffledOptions] = useState<string[]>([]);
  const [wrongSelectedAnswers, setWrongSelectedAnswers] = useState<string[]>(
    [],
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
    },
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

  // Auto-start once when ready.
  useEffect(() => {
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
    finalizedRef.current = false;
    setIsFinished(false);
    setEndedReason('completed');
    setUserAnswer('');
    setLastAnswerCorrect(null);
    setWrongSelectedAnswers([]);
    goalTimers.resetGoals();
    resetTimer();
    startTimer();
    sessionStartPromiseRef.current = startSession({
      sessionType: 'blitz',
      dojoType,
      gameMode: gameMode.toLowerCase(),
      selectedSets: selectedSets || [],
      selectedCount: items.length,
      route: pathname || '',
    });
    sessionStartPromiseRef.current.then(id => {
      sessionIdRef.current = id;
    });
    setIsBlitzBooting(false);
  }, [
    currentQuestion,
    dojoType,
    gameMode,
    pathname,
    isFinished,
    isRunning,
    items.length,
    playClick,
    selectedSets,
    goalTimers,
    resetTimer,
    startTimer,
    stats,
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
        isReverseActive,
      );
      setShuffledOptions(shuffle(options));
      setWrongSelectedAnswers([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentQuestion, gameMode, isReverseActive]);

  const ensureSessionId = useCallback(async (): Promise<string> => {
    if (sessionIdRef.current) return sessionIdRef.current;
    if (sessionStartPromiseRef.current) {
      const id = await sessionStartPromiseRef.current;
      sessionIdRef.current = id;
      return id;
    }
    const id = await startSession({
      sessionType: 'blitz',
      dojoType,
      gameMode: gameMode.toLowerCase(),
      selectedSets: selectedSets || [],
      selectedCount: items.length,
      route: pathname || '',
    });
    sessionIdRef.current = id;
    return id;
  }, [dojoType, gameMode, selectedSets, items.length, pathname]);

  // Handle timer end
  useEffect(() => {
    if (timeLeft === 0 && !isFinished) {
      setIsFinished(true);
      setEndedReason('completed');
      confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
      // Track blitz stats for achievements
      statsTracking.recordBlitzSession({
        score: stats.correct,
        streak: stats.bestStreak,
        correctAnswers: stats.correct,
        wrongAnswers: stats.wrong,
      });
      if (!finalizedRef.current) {
        finalizedRef.current = true;
        void (async () => {
          const sessionId = await ensureSessionId();
          await finalizeSession({
            sessionId,
            endedReason: 'completed',
            endedAbruptly: false,
            correct: stats.correct,
            wrong: stats.wrong,
            bestStreak: stats.bestStreak,
            modePayload: {
              challengeDuration,
              showGoalTimers,
              goals: goalTimers.goals,
            },
          });
        })();
      }
    }
  }, [
    challengeDuration,
    goalTimers.goals,
    isFinished,
    showGoalTimers,
    stats.bestStreak,
    stats.correct,
    stats.wrong,
    timeLeft,
    ensureSessionId,
  ]);

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

  const toQuestionPrompt = useCallback(
    (question: T) => {
      const rendered = renderQuestion(question, isReverseActive);
      return typeof rendered === 'string' ? rendered : getCorrectAnswer(question);
    },
    [renderQuestion, getCorrectAnswer, isReverseActive],
  );

  // Handlers
  const handleStart = useCallback(() => {
    playClick();
    stats.reset();
    finalizedRef.current = false;
    setIsFinished(false);
    setEndedReason('completed');
    setUserAnswer('');
    setLastAnswerCorrect(null);
    setWrongSelectedAnswers([]);
    setCurrentQuestion(generateQuestionRef.current(items));
    goalTimers.resetGoals();
    resetTimer();
    setTimeout(() => startTimer(), 50);
    sessionStartPromiseRef.current = startSession({
      sessionType: 'blitz',
      dojoType,
      gameMode: gameMode.toLowerCase(),
      selectedSets: selectedSets || [],
      selectedCount: items.length,
      route: pathname || '',
    });
    sessionStartPromiseRef.current.then(id => {
      sessionIdRef.current = id;
    });
    setTimeout(() => {
      if (gameMode === 'Type' && inputRef.current) {
        inputRef.current.focus();
        inputRef.current.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
        });
      }
    }, 100);
  }, [items, gameMode, dojoType, pathname, selectedSets, goalTimers, playClick, resetTimer, startTimer, stats]);

  const handleCancel = async () => {
    playClick();
    if (!finalizedRef.current) {
      finalizedRef.current = true;
      const sessionId = await ensureSessionId();
      await finalizeSession({
        sessionId,
        endedReason: 'manual_quit',
        endedAbruptly: true,
        correct: stats.correct,
        wrong: stats.wrong,
        bestStreak: stats.bestStreak,
        modePayload: {
          challengeDuration,
          showGoalTimers,
          goals: goalTimers.goals,
        },
      });
    }
    resetTimer();
    setEndedReason('manual_quit');
    setIsFinished(true);
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
      isReverseActive,
    );

    if (isCorrect) {
      playCorrect();
      stats.incrementCorrect();
      setLastAnswerCorrect(true);
      setTimeout(() => {
        setCurrentQuestion(generateQuestionRef.current(items));
        setLastAnswerCorrect(null);
      }, 300);
      if (sessionIdRef.current) {
        void appendAttempt(sessionIdRef.current, {
          questionId: getCorrectAnswer(currentQuestion),
          questionPrompt: toQuestionPrompt(currentQuestion),
          expectedAnswers: [getCorrectAnswer(currentQuestion)],
          userAnswer: userAnswer.trim(),
          inputKind: 'type',
          isCorrect: true,
        });
      }
    } else {
      playError();
      stats.incrementWrong();
      setLastAnswerCorrect(false);
      setTimeout(() => setLastAnswerCorrect(null), 800);
      if (sessionIdRef.current) {
        void appendAttempt(sessionIdRef.current, {
          questionId: getCorrectAnswer(currentQuestion),
          questionPrompt: toQuestionPrompt(currentQuestion),
          expectedAnswers: [getCorrectAnswer(currentQuestion)],
          userAnswer: userAnswer.trim(),
          inputKind: 'type',
          isCorrect: false,
        });
      }
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
      if (sessionIdRef.current) {
        void appendAttempt(sessionIdRef.current, {
          questionId: correctOption,
          questionPrompt: toQuestionPrompt(currentQuestion),
          expectedAnswers: [correctOption],
          userAnswer: selectedOption,
          inputKind: 'pick',
          isCorrect: true,
          optionsShown: shuffledOptions,
        });
      }
    } else {
      playError();
      stats.incrementWrong();
      setWrongSelectedAnswers(prev => [...prev, selectedOption]);
      setLastAnswerCorrect(false);
      if (sessionIdRef.current) {
        void appendAttempt(sessionIdRef.current, {
          questionId: correctOption,
          questionPrompt: toQuestionPrompt(currentQuestion),
          expectedAnswers: [correctOption],
          userAnswer: selectedOption,
          inputKind: 'pick',
          isCorrect: false,
          optionsShown: shuffledOptions,
        });
      }
    }
  };

  // Render states
  if (items.length === 0) {
    return <EmptyState dojoType={dojoType} dojoLabel={dojoLabel} />;
  }

  if (isBlitzBooting) {
    return null;
  }

  if (isFinished) {
    return (
      <SessionSummaryScreen
        mode='blitz'
        dojoType={dojoType}
        challengeDuration={challengeDuration}
        stats={{
          correct: stats.correct,
          wrong: stats.wrong,
          bestStreak: stats.bestStreak,
        }}
        showGoalTimers={showGoalTimers}
        goals={goalTimers.goals}
        onNewSession={handleStart}
        onBackToSelection={() => router.push(`/${dojoType}`)}
        endedReason={endedReason}
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
        streak: stats.streak,
      }}
      showGoalTimers={showGoalTimers}
      elapsedTime={elapsedTime}
      goalTimers={{
        goals: goalTimers.goals,
        addGoal: goalTimers.addGoal,
        removeGoal: goalTimers.removeGoal,
        clearGoals: goalTimers.clearGoals,
        nextGoal: goalTimers.nextGoal,
        progressToNextGoal: goalTimers.progressToNextGoal,
      }}
      onCancel={handleCancel}
    />
  );
}

