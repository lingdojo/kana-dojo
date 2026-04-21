'use client';
import { useState, useEffect, useRef } from 'react';
import { CircleCheck } from 'lucide-react';
import clsx from 'clsx';
import { motion } from 'framer-motion';
import useKanjiStore, { IKanjiObj } from '@/features/Kanji/store/useKanjiStore';
import { useClick, useCorrect, useError } from '@/shared/hooks/generic/useAudio';
// import GameIntel from '@/shared/ui-composite/Game/GameIntel';
import { useStatsStore } from '@/features/Progress';
import { useShallow } from 'zustand/react/shallow';
import Stars from '@/shared/ui-composite/Game/Stars';
import AnswerSummary from '@/shared/ui-composite/Game/AnswerSummary';
import SSRAudioButton from '@/shared/ui-composite/audio/SSRAudioButton';
import FuriganaText from '@/shared/ui-composite/text/FuriganaText';
import { useCrazyModeTrigger } from '@/features/CrazyMode/hooks/useCrazyModeTrigger';
import { getGlobalAdaptiveSelector } from '@/shared/utils/adaptiveSelection';
import { GameBottomBar } from '@/shared/ui-composite/Game/GameBottomBar';
import useClassicSessionStore from '@/shared/store/useClassicSessionStore';
import { useThemePreferences } from '@/features/Preferences';
import { cn } from '@/shared/utils/utils';
import useSetProgressStore from '@/features/Progress/store/useSetProgressStore';

// Get the global adaptive selector for weighted character selection
const adaptiveSelector = getGlobalAdaptiveSelector();

// Bottom bar states
type BottomBarState = 'check' | 'correct' | 'wrong';

interface KanjiInputGameProps {
  selectedKanjiObjs: IKanjiObj[];
  isHidden: boolean;
  isReverse?: boolean;
}

const KanjiInputGame = ({
  selectedKanjiObjs,
  isHidden,
  isReverse = false,
}: KanjiInputGameProps) => {
  const logAttempt = useClassicSessionStore(state => state.logAttempt);
  const recordKanjiProgress = useSetProgressStore(
    state => state.recordKanjiProgress,
  );
  // Get the current JLPT level from the Kanji store
  const selectedKanjiCollection = useKanjiStore(
    state => state.selectedKanjiCollection,
  );

  const {
    score,
    setScore,
    incrementKanjiCorrect,
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
      incrementKanjiCorrect: state.incrementKanjiCorrect,
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

  const answerStartTimeRef = useRef<number | null>(null);
  const elapsedTimeMsRef = useRef(0);

  const { playClick } = useClick();
  const { playCorrect } = useCorrect();
  const { playErrorTwice } = useError();
  const { trigger: triggerCrazyMode } = useCrazyModeTrigger();

  const inputRef = useRef<HTMLTextAreaElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  // Guard to prevent Enter key repeat from immediately triggering continue after correct answer
  const justAnsweredRef = useRef(false);

  const [inputValue, setInputValue] = useState('');
  const [bottomBarState, setBottomBarState] = useState<BottomBarState>('check');

  // State management based on mode - uses weighted selection for adaptive learning
  const [correctChar, setCorrectChar] = useState(() => {
    if (selectedKanjiObjs.length === 0) return '';
    const sourceArray = isReverse
      ? selectedKanjiObjs.map(obj => obj.meanings[0])
      : selectedKanjiObjs.map(obj => obj.kanjiChar);
    const selected = adaptiveSelector.selectWeightedCharacter(sourceArray);
    adaptiveSelector.markCharacterSeen(selected);
    return selected;
  });

  // Find the target character/meaning based on mode
  const correctKanjiObj = isReverse
    ? selectedKanjiObjs.find(obj => obj.meanings[0] === correctChar)
    : selectedKanjiObjs.find(obj => obj.kanjiChar === correctChar);

  const [currentKanjiObj, setCurrentKanjiObj] = useState<IKanjiObj>(
    correctKanjiObj as IKanjiObj,
  );

  const targetChar = isReverse
    ? correctKanjiObj?.kanjiChar
    : [
        ...(correctKanjiObj?.meanings ?? []),
        ...(correctKanjiObj?.kunyomi?.map(k => k.split(' ')[0]) ?? []),
        ...(correctKanjiObj?.onyomi?.map(k => k.split(' ')[0]) ?? []),
      ];

  const [displayAnswerSummary, setDisplayAnswerSummary] = useState(false);
  const [promptSequence, setPromptSequence] = useState(0);
  const pauseTimer = () => {
    if (answerStartTimeRef.current !== null) {
      elapsedTimeMsRef.current += performance.now() - answerStartTimeRef.current;
      answerStartTimeRef.current = null;
    }
  };
  const getElapsedTimeMs = () => {
    if (answerStartTimeRef.current !== null) {
      return elapsedTimeMsRef.current + (performance.now() - answerStartTimeRef.current);
    }
    return elapsedTimeMsRef.current;
  };
  const resetTimer = () => {
    answerStartTimeRef.current = null;
    elapsedTimeMsRef.current = 0;
  };
  const startTimer = () => {
    answerStartTimeRef.current = performance.now();
    elapsedTimeMsRef.current = 0;
  };
  const [feedback, setFeedback] = useState<React.ReactElement>(
    <>{'feedback ~'}</>,
  );

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
        // Guard against Enter key repeat immediately after correct answer
        if (justAnsweredRef.current) {
          event.preventDefault();
          return;
        }
        // Allow Enter to trigger Next button when correct
        if (bottomBarState === 'correct') {
          event.preventDefault();
          buttonRef.current?.click();
        }
      } else if (isSpace) {
        // Only trigger button for continue state.
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
    if (isHidden) pauseTimer();
  }, [isHidden]);

  if (!selectedKanjiObjs || selectedKanjiObjs.length === 0) {
    return null;
  }

  const handleEnter = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (
      e.key === 'Enter' &&
      inputValue.trim().length &&
      bottomBarState !== 'correct'
    ) {
      handleCheck();
    }
  };

  const isInputCorrect = (input: string): boolean => {
    if (!isReverse) {
      return (
        Array.isArray(targetChar) &&
        targetChar.includes(input.trim().toLowerCase())
      );
    } else {
      return input.trim().toLowerCase() === targetChar;
    }
  };

  const handleCheck = () => {
    if (inputValue.trim().length === 0) return;
    const trimmedInput = inputValue.trim();

    playClick();

    if (isInputCorrect(trimmedInput)) {
      handleCorrectAnswer(trimmedInput);
    } else {
      handleWrongAnswer();
    }
  };

  const handleCorrectAnswer = (userInput: string) => {
    pauseTimer();
    const answerTimeMs = getElapsedTimeMs();
    addCorrectAnswerTime(answerTimeMs / 1000);
    recordAnswerTime(answerTimeMs);
    resetTimer();
    setCurrentKanjiObj(correctKanjiObj as IKanjiObj);
    const canonicalKanjiChar = correctKanjiObj?.kanjiChar ?? correctChar;

    playCorrect();
    addCharacterToHistory(canonicalKanjiChar);
    incrementCharacterScore(canonicalKanjiChar, 'correct');
    incrementCorrectAnswers();
    void recordKanjiProgress(canonicalKanjiChar);
    setScore(score + 1);

    triggerCrazyMode();
    adaptiveSelector.updateCharacterWeight(correctChar, true);
    incrementKanjiCorrect(selectedKanjiCollection.toUpperCase());
    resetWrongStreak();
    setBottomBarState('correct');
    setDisplayAnswerSummary(true);

    // Set guard to prevent Enter key repeat from immediately triggering continue
    justAnsweredRef.current = true;
    setTimeout(() => {
      justAnsweredRef.current = false;
    }, 300);

    // Set feedback for the answer summary
    const displayText = isReverse ? correctKanjiObj?.meanings[0] : correctChar;
    const answerText = isReverse ? correctKanjiObj?.kanjiChar : userInput;
    setFeedback(
      <>
        <span className='text-(--secondary-color)'>{`${displayText} = ${answerText} `}</span>
        <CircleCheck className='inline text-(--main-color)' />
      </>,
    );
    logAttempt({
      questionId: canonicalKanjiChar,
      questionPrompt: correctChar,
      expectedAnswers: Array.isArray(targetChar)
        ? targetChar.map(v => String(v))
        : [String(targetChar)],
      userAnswer: userInput,
      inputKind: 'type',
      isCorrect: true,
      timeTakenMs: answerTimeMs,
      extra: {
        contentType: 'kanji',
        canonicalItemKey: canonicalKanjiChar,
        isReverse,
      },
    });
  };

  const handleWrongAnswer = () => {
    const canonicalKanjiChar = correctKanjiObj?.kanjiChar ?? correctChar;
    setInputValue('');
    playErrorTwice();

    incrementCharacterScore(canonicalKanjiChar, 'wrong');
    incrementWrongAnswers();
    if (score - 1 < 0) {
      setScore(0);
    } else {
      setScore(score - 1);
    }
    triggerCrazyMode();
    adaptiveSelector.updateCharacterWeight(correctChar, false);
    incrementWrongStreak();
    setBottomBarState('wrong');
    logAttempt({
      questionId: canonicalKanjiChar,
      questionPrompt: correctChar,
      expectedAnswers: Array.isArray(targetChar)
        ? targetChar.map(v => String(v))
        : [String(targetChar)],
      userAnswer: inputValue.trim(),
      inputKind: 'type',
      isCorrect: false,
      extra: {
        contentType: 'kanji',
        canonicalItemKey: canonicalKanjiChar,
        isReverse,
      },
    });
  };

  const generateNewCharacter = () => {
    const sourceArray = isReverse
      ? selectedKanjiObjs.map(obj => obj.meanings[0])
      : selectedKanjiObjs.map(obj => obj.kanjiChar);

    const newChar = adaptiveSelector.selectWeightedCharacter(
      sourceArray,
      correctChar,
    );
    adaptiveSelector.markCharacterSeen(newChar);
    setCorrectChar(newChar);
  };

  const handleContinue = () => {
    playClick();
    setInputValue('');
    setDisplayAnswerSummary(false);
    generateNewCharacter();
    setPromptSequence(prev => prev + 1);
    setBottomBarState('check');
    startTimer();
  };

  const gameMode = isReverse ? 'reverse input' : 'input';
  const displayCharLang = isReverse ? 'en' : 'ja';
  const inputLang = isReverse ? 'ja' : 'en';
  const textSize = isReverse ? 'text-6xl sm:text-8xl' : 'text-8xl sm:text-9xl';
  const gapSize = isReverse ? 'gap-6 sm:gap-10' : 'gap-4 sm:gap-10';
  const canCheck = inputValue.trim().length > 0 && bottomBarState !== 'correct';
  const showContinue = bottomBarState === 'correct';
  const showFeedback = bottomBarState !== 'check';

  // For Bottom Bar feedback
  const feedbackText = isReverse
    ? targetChar
    : Array.isArray(targetChar)
      ? targetChar[0]
      : targetChar;

  return (
    <div
      className={clsx(
        'flex w-full flex-col items-center sm:w-4/5',
        gapSize,
        isHidden ? 'hidden' : '',
      )}
    >
      {/* <GameIntel gameMode={gameMode} /> */}

      {displayAnswerSummary ? (
        <AnswerSummary
          payload={currentKanjiObj}
          setDisplayAnswerSummary={setDisplayAnswerSummary}
          feedback={feedback}
          isEmbedded={true}
        />
      ) : (
        <>
          <div
            className={cn(
              'flex flex-row items-center gap-1',
              isGlassMode && 'rounded-xl bg-(--card-color) px-4 py-2',
            )}
          >
            <motion.div
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
              className='flex flex-row items-center gap-1'
            >
              <FuriganaText
                text={correctChar}
                reading={
                  !isReverse
                    ? correctKanjiObj?.onyomi[0] || correctKanjiObj?.kunyomi[0]
                    : undefined
                }
                className={textSize}
                lang={displayCharLang}
              />
              {!isReverse && (
                <SSRAudioButton
                  text={correctChar}
                  variant='icon-only'
                  size='sm'
                  className='bg-(--card-color) text-(--secondary-color)'
                  autoPlay
                  autoPlayTrigger={promptSequence}
                />
              )}
            </motion.div>
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
                handleEnter(e);
              }
            }}
            lang={inputLang}
          />
        </>
      )}

      <Stars />

      <GameBottomBar
        state={bottomBarState}
        onAction={showContinue ? handleContinue : handleCheck}
        canCheck={canCheck}
        feedbackContent={feedbackText}
        buttonRef={buttonRef}
        hideRetry
      />

      <div className='h-32' />
    </div>
  );
};

export default KanjiInputGame;

