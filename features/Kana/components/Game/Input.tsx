'use client';
import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { kana } from '@/features/Kana/data/kana';
import useKanaStore from '@/features/Kana/store/useKanaStore';
import { motion } from 'framer-motion';
import clsx from 'clsx';
import { useClick, useCorrect, useError } from '@/shared/hooks/generic/useAudio';
// import GameIntel from '@/shared/components/Game/GameIntel';
import { useStopwatch } from 'react-timer-hook';
import { useStatsStore } from '@/features/Progress';
import { useShallow } from 'zustand/react/shallow';
import Stars from '@/shared/components/Game/Stars';
import { useCrazyModeTrigger } from '@/features/CrazyMode/hooks/useCrazyModeTrigger';
import { getGlobalAdaptiveSelector } from '@/shared/lib/adaptiveSelection';
import { GameBottomBar } from '@/shared/components/Game/GameBottomBar';
import { isKanaInputAnswerCorrect } from '@/features/Kana/lib/isKanaInputAnswerCorrect';
import useClassicSessionStore from '@/shared/store/useClassicSessionStore';
import { useAdaptiveTargetLength } from '@/shared/hooks/game/useAdaptiveTargetLength';
import { useThemePreferences } from '@/features/Preferences';
import { cn } from '@/shared/lib/utils';

// Get the global adaptive selector for weighted character selection
const adaptiveSelector = getGlobalAdaptiveSelector();

// Helper function to determine if a kana character is hiragana or katakana
const isHiragana = (char: string): boolean => {
  // Hiragana Unicode range: U+3040 to U+309F
  const code = char.charCodeAt(0);
  return code >= 0x3040 && code <= 0x309f;
};

const isKatakana = (char: string): boolean => {
  // Katakana Unicode range: U+30A0 to U+30FF
  const code = char.charCodeAt(0);
  return code >= 0x30a0 && code <= 0x30ff;
};

// Bottom bar states
type BottomBarState = 'check' | 'correct' | 'wrong';

interface InputGameProps {
  isHidden: boolean;
  isReverse?: boolean;
}

const InputGame = ({ isHidden, isReverse = false }: InputGameProps) => {
  const logAttempt = useClassicSessionStore(state => state.logAttempt);
  const {
    score,
    setScore,
    incrementHiraganaCorrect,
    incrementKatakanaCorrect,
    recordAnswerTime,
    incrementWrongStreak,
    resetWrongStreak,
    incrementCorrectAnswers,
    incrementWrongAnswers,
    addCharacterToHistory,
    addCorrectAnswerTime,
    incrementCharacterScore,
  } = useStatsStore(
    useShallow(state => ({
      score: state.score,
      setScore: state.setScore,
      incrementHiraganaCorrect: state.incrementHiraganaCorrect,
      incrementKatakanaCorrect: state.incrementKatakanaCorrect,
      recordAnswerTime: state.recordAnswerTime,
      incrementWrongStreak: state.incrementWrongStreak,
      resetWrongStreak: state.resetWrongStreak,
      incrementCorrectAnswers: state.incrementCorrectAnswers,
      incrementWrongAnswers: state.incrementWrongAnswers,
      addCharacterToHistory: state.addCharacterToHistory,
      addCorrectAnswerTime: state.addCorrectAnswerTime,
      incrementCharacterScore: state.incrementCharacterScore,
    })),
  );

  const isGlassMode = useThemePreferences().isGlassMode;

  const speedStopwatch = useStopwatch({ autoStart: false });

  const { playClick } = useClick();
  const { playCorrect } = useCorrect();
  const { playErrorTwice } = useError();
  const { trigger: triggerCrazyMode } = useCrazyModeTrigger();

  const inputRef = useRef<HTMLTextAreaElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const {
    targetLength,
    recordCorrect: recordTargetLengthCorrect,
    recordWrong: recordTargetLengthWrong,
  } = useAdaptiveTargetLength();

  const [inputValue, setInputValue] = useState('');
  const [bottomBarState, setBottomBarState] = useState<BottomBarState>('check');
  const [_lastWrongInput, setLastWrongInput] = useState('');

  const kanaGroupIndices = useKanaStore(state => state.kanaGroupIndices);

  const selectedKana = useMemo(
    () => kanaGroupIndices.map(i => kana[i].kana).flat(),
    [kanaGroupIndices],
  );
  const selectedRomaji = useMemo(
    () => kanaGroupIndices.map(i => kana[i].romanji).flat(),
    [kanaGroupIndices],
  );

  // Map: kana → alternative romanji
  // Example: 'ん' → ['nn']
  const altRomanjiMap = useMemo(() => {
    const map = new Map<string, string[]>();
    kanaGroupIndices.forEach(i => {
      const group = kana[i];
      group.altRomanji?.forEach((alternatives, idx) => {
        if (alternatives.length > 0) {
          map.set(group.kana[idx], alternatives);
        }
      });
    });
    return map;
  }, [kanaGroupIndices]);

  // Create mapping pairs based on mode
  const selectedPairs = useMemo(
    () =>
      Object.fromEntries(
        isReverse
          ? selectedRomaji.map((key, i) => [key, selectedKana[i]])
          : selectedKana.map((key, i) => [key, selectedRomaji[i]]),
      ),
    [isReverse, selectedRomaji, selectedKana],
  );

  const buildTargetPair = useCallback(() => {
    const sourceArray = isReverse ? selectedRomaji : selectedKana;
    if (sourceArray.length === 0) return { correctChar: '', targetChar: '' };

    const used = new Set<string>();
    const promptParts: string[] = [];
    const answerParts: string[] = [];

    for (let i = 0; i < targetLength; i++) {
      const available = sourceArray.filter(char => !used.has(char));
      if (available.length === 0) break;
      const selected = adaptiveSelector.selectWeightedCharacter(available);
      used.add(selected);
      adaptiveSelector.markCharacterSeen(selected);
      promptParts.push(selected);
      answerParts.push(selectedPairs[selected]);
    }

    return { correctChar: promptParts.join(''), targetChar: answerParts.join('') };
  }, [isReverse, selectedRomaji, selectedKana, targetLength, selectedPairs]);

  const [pairData, setPairData] = useState(() => buildTargetPair());
  const correctChar = pairData.correctChar;
  const targetChar = pairData.targetChar;

  const hasKana = selectedKana.length > 0;
  const hasRomaji = selectedRomaji.length > 0;
  const isReady = isReverse ? hasRomaji : hasKana;

  useEffect(() => {
    if (inputRef.current && bottomBarState === 'check') {
      inputRef.current.focus();
    }
  }, [bottomBarState]);

  // Keyboard shortcut for Enter/Space to trigger button
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const isEnter = event.key === 'Enter';
      const isSpace = event.code === 'Space' || event.key === ' ';

      if (isEnter) {
        // Allow Enter to trigger Next button when correct
        if (bottomBarState === 'correct') {
          event.preventDefault();
          buttonRef.current?.click();
        }
      } else if (isSpace) {
        // Only trigger button for continue state.
        // If it's 'wrong', user might be trying to type a space to fix their answer.
        if (bottomBarState === 'correct') {
          event.preventDefault();
          buttonRef.current?.click();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [bottomBarState]);

  useEffect(() => {
    if (isHidden) speedStopwatch.pause();
  }, [isHidden, speedStopwatch]);

  useEffect(() => {
    if (isReady) {
      setPairData(buildTargetPair());
    }
  }, [buildTargetPair, isReady]);

  const generateNewCharacter = useCallback(() => {
    if (!isReady) return;
    setPairData(buildTargetPair());
  }, [isReady, buildTargetPair]);

  const handleCheck = () => {
    const trimmedInput = inputValue.trim();
    if (trimmedInput.length === 0) return;

    const isCorrect = isKanaInputAnswerCorrect({
      inputValue: trimmedInput,
      correctChar,
      targetChar,
      isReverse,
      altRomanjiMap,
    });

    playClick();

    if (isCorrect) {
      handleCorrectAnswer();
    } else {
      handleWrongAnswer(trimmedInput);
    }
  };

  const handleCorrectAnswer = () => {
    speedStopwatch.pause();
    const answerTimeMs = speedStopwatch.totalMilliseconds;
    addCorrectAnswerTime(answerTimeMs / 1000);
    // Track answer time for speed achievements (Requirements 6.1-6.5)
    recordAnswerTime(answerTimeMs);
    speedStopwatch.reset();
    playCorrect();
    addCharacterToHistory(correctChar);
    incrementCharacterScore(correctChar, 'correct');
    incrementCorrectAnswers();
    setScore(score + 1);

    triggerCrazyMode();
    correctChar.split('').forEach(char => {
      adaptiveSelector.updateCharacterWeight(char, true);
      if (isHiragana(char)) incrementHiraganaCorrect();
      else if (isKatakana(char)) incrementKatakanaCorrect();
    });
    // Reset wrong streak on correct answer (Requirement 10.2)
    resetWrongStreak();
    recordTargetLengthCorrect();
    setBottomBarState('correct');
    logAttempt({
      questionId: correctChar,
      questionPrompt: correctChar,
      expectedAnswers: [String(targetChar)],
      userAnswer: inputValue.trim(),
      inputKind: 'type',
      isCorrect: true,
      timeTakenMs: answerTimeMs,
      extra: { isReverse },
    });
  };

  const handleWrongAnswer = (wrongInput: string) => {
    setLastWrongInput(wrongInput);
    setInputValue('');
    playErrorTwice();

    incrementCharacterScore(correctChar, 'wrong');
    incrementWrongAnswers();
    if (score - 1 < 0) {
      setScore(0);
    } else {
      setScore(score - 1);
    }
    triggerCrazyMode();
    correctChar.split('').forEach(char =>
      adaptiveSelector.updateCharacterWeight(char, false),
    );
    incrementWrongStreak();
    recordTargetLengthWrong();
    setBottomBarState('wrong');
    logAttempt({
      questionId: correctChar,
      questionPrompt: correctChar,
      expectedAnswers: [String(targetChar)],
      userAnswer: wrongInput,
      inputKind: 'type',
      isCorrect: false,
      extra: { isReverse },
    });
  };

  const handleContinue = useCallback(() => {
    playClick();
    setInputValue('');
    generateNewCharacter();
    setBottomBarState('check');
    speedStopwatch.reset();
    speedStopwatch.start();
  }, [playClick, generateNewCharacter, speedStopwatch]);

  const _gameMode = isReverse ? 'reverse input' : 'input';
  const canCheck = inputValue.trim().length > 0 && bottomBarState !== 'correct';
  const showContinue = bottomBarState === 'correct';
  const _showFeedback = bottomBarState !== 'check';

  if (!isReady) {
    return null;
  }

  return (
    <div
      className={clsx(
        'flex w-full flex-col items-center gap-4 sm:w-4/5 sm:gap-10',
        isHidden ? 'hidden' : '',
      )}
    >
      {/* <GameIntel gameMode={gameMode} /> */}
      <div
        className={cn(
          'flex flex-row items-center gap-1',
          isGlassMode && 'rounded-xl bg-(--card-color) px-4 py-2',
        )}
      >
        <motion.p
          className='text-7xl font-medium sm:text-8xl'
          initial={{ opacity: 0, x: 30, scale: 0.95 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          transition={{
            type: 'spring',
            stiffness: 150,
            damping: 20,
            mass: 1,
            duration: 0.5,
          }}
          key={correctChar}
        >
          {correctChar}
        </motion.p>
      </div>
      <textarea
        ref={inputRef}
        value={inputValue}
        placeholder='Type your answer...'
        disabled={showContinue}
        rows={4}
        className={clsx(
          'w-full max-w-xs sm:max-w-sm md:max-w-md',
          'rounded-2xl px-5 py-4',
          'rounded-2xl border-1 border-(--border-color) bg-(--card-color)',
          'text-top text-left text-lg font-medium lg:text-xl',
          'text-(--secondary-color) placeholder:text-base placeholder:font-normal placeholder:text-(--secondary-color)/40',
          'game-input resize-none focus:outline-none',
          'transition-colors duration-200 ease-out',
          showContinue && 'cursor-not-allowed opacity-60',
        )}
        autoFocus
        onChange={e => setInputValue(e.target.value)}
        onKeyDown={e => {
          if (e.key === 'Enter') {
            e.preventDefault();
            if (inputValue.trim().length > 0 && bottomBarState !== 'correct') {
              handleCheck();
            }
          }
        }}
      />
      <Stars />

      <GameBottomBar
        state={bottomBarState}
        onAction={showContinue ? handleContinue : handleCheck}
        canCheck={canCheck}
        feedbackContent={targetChar}
        buttonRef={buttonRef}
        hideRetry
      />

      {/* Spacer */}
      <div className='h-32' />
    </div>
  );
};

export default InputGame;
