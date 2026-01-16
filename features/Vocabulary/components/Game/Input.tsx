'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import clsx from 'clsx';
import { motion } from 'framer-motion';
import { toHiragana } from 'wanakana';
import { IVocabObj } from '@/features/Vocabulary/store/useVocabStore';
import { useClick, useCorrect, useError } from '@/shared/hooks/useAudio';
import { useStopwatch } from 'react-timer-hook';
import { useGameStats, useStatsDisplay } from '@/features/Progress';
import Stars from '@/shared/components/Game/Stars';
import AnswerSummary from '@/shared/components/Game/AnswerSummary';
import SSRAudioButton from '@/shared/components/audio/SSRAudioButton';
import FuriganaText from '@/shared/components/text/FuriganaText';
import { useCrazyModeTrigger } from '@/features/CrazyMode/hooks/useCrazyModeTrigger';
import { getGlobalAdaptiveSelector } from '@/shared/lib/adaptiveSelection';
import { GameBottomBar } from '@/shared/components/Game/GameBottomBar';

// Get the global adaptive selector for weighted character selection
const adaptiveSelector = getGlobalAdaptiveSelector();

// Bottom bar states
type BottomBarState = 'check' | 'correct' | 'wrong';

interface VocabInputGameProps {
  selectedWordObjs: IVocabObj[];
  isHidden: boolean;
  isReverse?: boolean;
}

const VocabInputGame = ({
  selectedWordObjs,
  isHidden,
  isReverse = false
}: VocabInputGameProps) => {
  const { score, setScore } = useStatsDisplay();
  const gameStats = useGameStats();

  const speedStopwatch = useStopwatch({ autoStart: false });

  const { playClick } = useClick();
  const { playCorrect } = useCorrect();
  const { playErrorTwice } = useError();
  const { trigger: triggerCrazyMode } = useCrazyModeTrigger();

  const inputRef = useRef<HTMLTextAreaElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const [inputValue, setInputValue] = useState('');
  const [bottomBarState, setBottomBarState] = useState<BottomBarState>('check');

  // Quiz type: 'meaning' or 'reading'
  const [quizType, setQuizType] = useState<'meaning' | 'reading'>('meaning');

  // State management based on mode - uses weighted selection for adaptive learning
  const [correctChar, setCorrectChar] = useState(() => {
    if (selectedWordObjs.length === 0) return '';
    const sourceArray = isReverse
      ? selectedWordObjs.map(obj => obj.meanings[0])
      : selectedWordObjs.map(obj => obj.word);
    const selected = adaptiveSelector.selectWeightedCharacter(sourceArray);
    adaptiveSelector.markCharacterSeen(selected);
    return selected;
  });

  // Find the target character/meaning based on mode
  const correctWordObj = isReverse
    ? selectedWordObjs.find(obj => obj.meanings[0] === correctChar)
    : selectedWordObjs.find(obj => obj.word === correctChar);

  const [currentWordObj, setCurrentWordObj] = useState<IVocabObj>(
    correctWordObj as IVocabObj
  );

  // Determine target based on quiz type and mode
  const targetChar =
    quizType === 'meaning'
      ? isReverse
        ? correctWordObj?.word
        : correctWordObj?.meanings
      : correctWordObj?.reading;

  const [displayAnswerSummary, setDisplayAnswerSummary] = useState(false);

  // Generate new character - defined before useCallback that uses it
  const generateNewCharacter = useCallback(() => {
    const sourceArray = isReverse
      ? selectedWordObjs.map(obj => obj.meanings[0])
      : selectedWordObjs.map(obj => obj.word);

    const newChar = adaptiveSelector.selectWeightedCharacter(
      sourceArray,
      correctChar
    );
    adaptiveSelector.markCharacterSeen(newChar);
    setCorrectChar(newChar);

    // Toggle quiz type for the next question
    setQuizType(prev => (prev === 'meaning' ? 'reading' : 'meaning'));
  }, [isReverse, selectedWordObjs, correctChar]);

  const handleContinue = useCallback(() => {
    playClick();
    setInputValue('');
    setDisplayAnswerSummary(false);
    generateNewCharacter();
    setBottomBarState('check');
    speedStopwatch.reset();
    speedStopwatch.start();
  }, [playClick, generateNewCharacter, speedStopwatch]);

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isHidden]);

  if (!selectedWordObjs || selectedWordObjs.length === 0) {
    return null;
  }

  const isInputCorrect = (input: string): boolean => {
    if (quizType === 'meaning') {
      if (!isReverse) {
        return (
          Array.isArray(targetChar) && targetChar.includes(input.toLowerCase())
        );
      } else {
        return input === targetChar;
      }
    } else {
      const targetReading = typeof targetChar === 'string' ? targetChar : '';
      const inputAsHiragana = toHiragana(input);
      const targetAsHiragana = toHiragana(targetReading);
      return inputAsHiragana === targetAsHiragana || input === targetReading;
    }
  };

  const handleCheck = () => {
    if (inputValue.trim().length === 0) return;
    const trimmedInput = inputValue.trim();

    playClick();

    if (isInputCorrect(trimmedInput)) {
      handleCorrectAnswer();
    } else {
      handleWrongAnswer();
    }
  };

  const handleCorrectAnswer = () => {
    speedStopwatch.pause();
    const answerTimeMs = speedStopwatch.totalMilliseconds;
    speedStopwatch.reset();
    setCurrentWordObj(correctWordObj as IVocabObj);

    playCorrect();
    gameStats.recordCorrect('vocabulary', correctChar, {
      timeTaken: answerTimeMs
    });
    setScore(score + 1);

    triggerCrazyMode();
    adaptiveSelector.updateCharacterWeight(correctChar, true);
    setBottomBarState('correct');
    setDisplayAnswerSummary(true);
  };

  const handleWrongAnswer = () => {
    setInputValue('');
    playErrorTwice();

    const correctAnswer = Array.isArray(targetChar)
      ? targetChar[0]
      : (targetChar ?? '');
    gameStats.recordIncorrect(
      'vocabulary',
      correctChar,
      inputValue.trim(),
      correctAnswer
    );
    if (score - 1 < 0) {
      setScore(0);
    } else {
      setScore(score - 1);
    }
    triggerCrazyMode();
    adaptiveSelector.updateCharacterWeight(correctChar, false);
    setBottomBarState('wrong');
  };

  const handleEnter = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (
      e.key === 'Enter' &&
      inputValue.trim().length &&
      bottomBarState !== 'correct'
    ) {
      handleCheck();
    }
  };

  const displayCharLang = isReverse && quizType === 'meaning' ? 'en' : 'ja';
  const inputLang = quizType === 'reading' ? 'ja' : isReverse ? 'ja' : 'en';
  const textSize = isReverse ? 'text-5xl sm:text-7xl' : 'text-5xl md:text-8xl';
  const canCheck = inputValue.trim().length > 0 && bottomBarState !== 'correct';
  const showContinue = bottomBarState === 'correct';

  // For Bottom Bar feedback
  const feedbackText = isReverse
    ? targetChar
    : Array.isArray(targetChar)
      ? targetChar[0]
      : targetChar;

  return (
    <div
      className={clsx(
        'flex w-full flex-col items-center gap-10 sm:w-4/5',
        isHidden ? 'hidden' : ''
      )}
    >
      {displayAnswerSummary ? (
        <AnswerSummary
          payload={currentWordObj}
          setDisplayAnswerSummary={setDisplayAnswerSummary}
          feedback={<></>}
          isEmbedded={true}
        />
      ) : (
        <>
          <div className='flex flex-col items-center gap-4'>
            <span className='mb-2 text-sm text-(--secondary-color)'>
              {quizType === 'meaning'
                ? isReverse
                  ? 'What is the meaning?'
                  : 'What is the meaning?'
                : 'What is the reading?'}
            </span>
            <div className='flex flex-row items-center gap-1'>
              <motion.div
                initial={{ opacity: 0, y: -30, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{
                  type: 'spring',
                  stiffness: 150,
                  damping: 20,
                  mass: 1,
                  duration: 0.5
                }}
                key={correctChar + quizType}
                className='flex flex-row items-center gap-1'
              >
                <FuriganaText
                  text={correctChar}
                  reading={
                    !isReverse && quizType === 'meaning'
                      ? correctWordObj?.reading
                      : undefined
                  }
                  className={clsx(textSize, 'text-center')}
                  lang={displayCharLang}
                />
                {!isReverse && (
                  <SSRAudioButton
                    text={correctChar}
                    variant='icon-only'
                    size='sm'
                    className='bg-(--card-color) text-(--secondary-color)'
                  />
                )}
              </motion.div>
            </div>
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
              'rounded-2xl border border-(--border-color) bg-(--card-color)',
              'text-top text-left text-lg font-medium lg:text-xl',
              'text-(--secondary-color) placeholder:text-base placeholder:font-normal placeholder:text-(--secondary-color)/40',
              'resize-none focus:outline-none',
              'transition-colors duration-200 ease-out',
              showContinue && 'cursor-not-allowed opacity-60'
            )}
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

export default VocabInputGame;
