'use client';
import { useState, useEffect, useRef } from 'react';
import { CircleCheck, CircleX, CircleArrowRight } from 'lucide-react';
import { Random } from 'random-js';
import clsx from 'clsx';
import { IKanjiObj } from '@/features/Kanji/store/useKanjiStore';
import { useClick, useCorrect, useError } from '@/shared/hooks/useAudio';
import GameIntel from '@/shared/components/Game/GameIntel';
import { buttonBorderStyles } from '@/shared/lib/styles';
import { useStopwatch } from 'react-timer-hook';
import useStats from '@/shared/hooks/useStats';
import useStatsStore from '@/features/Progress/store/useStatsStore';
import { useShallow } from 'zustand/react/shallow';
import Stars from '@/shared/components/Game/Stars';
import AnswerSummary from '@/shared/components/Game/AnswerSummary';
import SSRAudioButton from '@/shared/components/audio/SSRAudioButton';
import FuriganaText from '@/shared/components/text/FuriganaText';
import { useCrazyModeTrigger } from '@/features/CrazyMode/hooks/useCrazyModeTrigger';
import { getGlobalAdaptiveSelector } from '@/shared/lib/adaptiveSelection';

const random = new Random();

// Get the global adaptive selector for weighted character selection
const adaptiveSelector = getGlobalAdaptiveSelector();

interface KanjiInputGameProps {
  selectedKanjiObjs: IKanjiObj[];
  isHidden: boolean;
  isReverse?: boolean;
}

const KanjiInputGame = ({
  selectedKanjiObjs,
  isHidden,
  isReverse = false
}: KanjiInputGameProps) => {
  const { score, setScore } = useStatsStore(
    useShallow(state => ({
      score: state.score,
      setScore: state.setScore
    }))
  );

  const speedStopwatch = useStopwatch({ autoStart: false });

  const {
    incrementCorrectAnswers,
    incrementWrongAnswers,
    addCharacterToHistory,
    addCorrectAnswerTime,
    incrementCharacterScore
  } = useStats();

  const { playClick } = useClick();
  const { playCorrect } = useCorrect();
  const { playErrorTwice } = useError();
  const { trigger: triggerCrazyMode } = useCrazyModeTrigger();

  const inputRef = useRef<HTMLInputElement>(null);
  const buttonRef = useRef<HTMLButtonElement | null>(null);

  const [inputValue, setInputValue] = useState('');

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
    correctKanjiObj as IKanjiObj
  );

const targetChar = isReverse
  ? correctKanjiObj?.kanjiChar
  : [
      ...(correctKanjiObj?.meanings ?? []),
      ...(correctKanjiObj?.kunyomi?.map(k => k.split(' ')[0]) ?? []),
      ...(correctKanjiObj?.onyomi?.map(k => k.split(' ')[0]) ?? []),
    ];

  const [displayAnswerSummary, setDisplayAnswerSummary] = useState(false);
  const [feedback, setFeedback] = useState(<>{'feedback ~'}</>);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.ctrlKey && event.code === 'Space') {
        buttonRef.current?.click();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  useEffect(() => {
    if (isHidden) speedStopwatch.pause();
  }, [isHidden]);

  if (!selectedKanjiObjs || selectedKanjiObjs.length === 0) {
    return null;
  }

  const handleEnter = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && inputValue.trim().length) {
      if (isInputCorrect(inputValue)) {
        setDisplayAnswerSummary(true);
        handleCorrectAnswer(inputValue);
      } else {
        handleWrongAnswer();
      }
    }
  };

  const isInputCorrect = (input: string): boolean => {
    if (!isReverse) {
      // Normal mode: input should match any of the meanings (case insensitive)
      return (
        Array.isArray(targetChar) &&
        targetChar.includes(input.trim().toLowerCase())
      );
    } else {
      // Reverse mode: input should match the exact kanji character
      return input.trim().toLowerCase() === targetChar;
    }
  };

  const handleCorrectAnswer = (userInput: string) => {
    speedStopwatch.pause();
    addCorrectAnswerTime(speedStopwatch.totalMilliseconds / 1000);
    speedStopwatch.reset();
    setCurrentKanjiObj(correctKanjiObj as IKanjiObj);

    playCorrect();
    addCharacterToHistory(correctChar);
    incrementCharacterScore(correctChar, 'correct');
    incrementCorrectAnswers();
    setScore(score + 1);

    setInputValue('');
    generateNewCharacter();
    setFeedback(
      <>
        <span className='text-[var(--secondary-color)]'>{`${correctChar} = ${userInput
          .trim()
          .toLowerCase()} `}</span>
        <CircleCheck className='inline text-[var(--main-color)]' />
      </>
    );
    triggerCrazyMode();
    // Update adaptive weight system - reduces probability of mastered characters
    adaptiveSelector.updateCharacterWeight(correctChar, true);
  };

  const handleWrongAnswer = () => {
    setInputValue('');
    setFeedback(
      <>
        <span className='text-[var(--secondary-color)]'>{`${correctChar} ≠ ${inputValue
          .trim()
          .toLowerCase()} `}</span>

        <CircleX className='inline text-[var(--main-color)]' />
      </>
    );
    playErrorTwice();

    incrementCharacterScore(correctChar, 'wrong');
    incrementWrongAnswers();
    if (score - 1 < 0) {
      setScore(0);
    } else {
      setScore(score - 1);
    }
    triggerCrazyMode();
    // Update adaptive weight system - increases probability of difficult characters
    adaptiveSelector.updateCharacterWeight(correctChar, false);
  };

  const generateNewCharacter = () => {
    const sourceArray = isReverse
      ? selectedKanjiObjs.map(obj => obj.meanings[0])
      : selectedKanjiObjs.map(obj => obj.kanjiChar);

    // Use weighted selection - prioritizes characters user struggles with
    const newChar = adaptiveSelector.selectWeightedCharacter(
      sourceArray,
      correctChar
    );
    adaptiveSelector.markCharacterSeen(newChar);
    setCorrectChar(newChar);
  };

  const handleSkip = (e: React.MouseEvent<HTMLButtonElement>) => {
    playClick();
    e.currentTarget.blur();
    setInputValue('');
    generateNewCharacter();

    const displayTarget = isReverse
      ? targetChar
      : Array.isArray(targetChar)
        ? targetChar[0]
        : targetChar;

    setFeedback(<>{`skipped ~ ${correctChar} = ${displayTarget}`}</>);
  };

  const gameMode = isReverse ? 'reverse input' : 'input';
  const displayCharLang = isReverse ? 'en' : 'ja';
  const inputLang = isReverse ? 'ja' : 'en';
  const textSize = isReverse ? 'text-6xl sm:text-8xl' : 'text-8xl sm:text-9xl';
  const gapSize = isReverse ? 'gap-6 sm:gap-10' : 'gap-4 sm:gap-10';

  return (
    <div
      className={clsx(
        'flex w-full flex-col items-center sm:w-4/5',
        gapSize,
        isHidden ? 'hidden' : ''
      )}
    >
      <GameIntel gameMode={gameMode} />
      {displayAnswerSummary && (
        <AnswerSummary
          payload={currentKanjiObj}
          setDisplayAnswerSummary={setDisplayAnswerSummary}
          feedback={feedback}
        />
      )}
      {!displayAnswerSummary && (
        <>
          <div className='flex flex-row items-center gap-1'>
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
                className='bg-[var(--card-color)] text-[var(--secondary-color)]'
              />
            )}
          </div>

          <input
            ref={inputRef}
            type='text'
            value={inputValue}
            className={clsx(
              'border-b-2 pb-1 text-center text-2xl text-[var(--secondary-color)] focus:outline-none lg:text-5xl',
              'border-[var(--border-color)] focus:border-[var(--secondary-color)]/80'
            )}
            onChange={e => setInputValue(e.target.value)}
            onKeyDown={handleEnter}
            lang={inputLang}
            autoFocus={!isReverse}
          />

          <button
            ref={buttonRef}
            className={clsx(
              'px-16 py-4 text-xl font-medium',
              buttonBorderStyles,
              'active:scale-95 active:duration-200 md:active:scale-98',
              'flex flex-row items-end gap-2',
              'text-[var(--secondary-color)]',
              'border-b-4 border-[var(--border-color)] hover:border-[var(--secondary-color)]/80'
            )}
            onClick={handleSkip}
          >
            <span>skip</span>
            <CircleArrowRight />
          </button>

          <Stars />
        </>
      )}
    </div>
  );
};

export default KanjiInputGame;
