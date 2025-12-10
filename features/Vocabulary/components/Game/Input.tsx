'use client';
import { useState, useEffect, useRef } from 'react';
import { CircleCheck, CircleX, CircleArrowRight } from 'lucide-react';
import { Random } from 'random-js';
import clsx from 'clsx';
import * as wanakana from 'wanakana';
import { IVocabObj } from '@/features/Vocabulary/store/useVocabStore';
import { useClick, useCorrect, useError } from '@/shared/hooks/useAudio';
import GameIntel from '@/shared/components/Game/GameIntel';
import { buttonBorderStyles } from '@/shared/lib/styles';
import { useStopwatch } from 'react-timer-hook';
import useStats from '@/shared/hooks/useStats';
import useStatsStore from '@/features/Progress/store/useStatsStore';
import Stars from '@/shared/components/Game/Stars';
import AnswerSummary from '@/shared/components/Game/AnswerSummary';
import SSRAudioButton from '@/shared/components/SSRAudioButton';
import FuriganaText from '@/shared/components/FuriganaText';
import { useCrazyModeTrigger } from '@/features/CrazyMode/hooks/useCrazyModeTrigger';
import { getGlobalAdaptiveSelector } from '@/shared/lib/adaptiveSelection';

const random = new Random();

// Get the global adaptive selector for weighted character selection
const adaptiveSelector = getGlobalAdaptiveSelector();

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
  const score = useStatsStore(state => state.score);
  const setScore = useStatsStore(state => state.setScore);

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

  if (!selectedWordObjs || selectedWordObjs.length === 0) {
    return null;
  }

  const handleEnter = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && inputValue.trim().length) {
      if (isInputCorrect(inputValue.trim())) {
        handleCorrectAnswer(inputValue.trim());
        setDisplayAnswerSummary(true);
      } else {
        handleWrongAnswer();
      }
    }
  };

  const isInputCorrect = (input: string): boolean => {
    if (quizType === 'meaning') {
      if (!isReverse) {
        // Normal mode: input should match any of the meanings (case insensitive)
        return (
          Array.isArray(targetChar) && targetChar.includes(input.toLowerCase())
        );
      } else {
        // Reverse mode: input should match the exact word
        return input === targetChar;
      }
    } else {
      // Reading quiz: accept both romaji and kana input
      // Convert romaji input to hiragana for comparison
      const targetReading = typeof targetChar === 'string' ? targetChar : '';
      const inputAsHiragana = wanakana.toHiragana(input);
      const targetAsHiragana = wanakana.toHiragana(targetReading);
      return inputAsHiragana === targetAsHiragana || input === targetReading;
    }
  };

  const handleCorrectAnswer = (userInput: string) => {
    speedStopwatch.pause();
    addCorrectAnswerTime(speedStopwatch.totalMilliseconds / 1000);
    speedStopwatch.reset();
    setCurrentWordObj(correctWordObj as IVocabObj);

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
    // Update adaptive weight system - reduces probability of mastered words
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
    // Update adaptive weight system - increases probability of difficult words
    adaptiveSelector.updateCharacterWeight(correctChar, false);
  };

  const generateNewCharacter = () => {
    const sourceArray = isReverse
      ? selectedWordObjs.map(obj => obj.meanings[0])
      : selectedWordObjs.map(obj => obj.word);

    // Use weighted selection - prioritizes words user struggles with
    const newChar = adaptiveSelector.selectWeightedCharacter(
      sourceArray,
      correctChar
    );
    adaptiveSelector.markCharacterSeen(newChar);
    setCorrectChar(newChar);

    // Toggle quiz type for the next question
    setQuizType(prev => (prev === 'meaning' ? 'reading' : 'meaning'));
  };

  const handleSkip = (e: React.MouseEvent<HTMLButtonElement>) => {
    playClick();
    e.currentTarget.blur();
    setCurrentWordObj(correctWordObj as IVocabObj);
    setDisplayAnswerSummary(true);
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
  const displayCharLang = isReverse && quizType === 'meaning' ? 'en' : 'ja';
  const inputLang = quizType === 'reading' ? 'ja' : isReverse ? 'ja' : 'en';
  const textSize = isReverse ? 'text-5xl sm:text-7xl' : 'text-5xl md:text-8xl';

  return (
    <div
      className={clsx(
        'flex flex-col gap-10 items-center w-full sm:w-4/5',
        isHidden ? 'hidden' : ''
      )}
    >
      <GameIntel gameMode={gameMode} />

      {displayAnswerSummary && (
        <AnswerSummary
          payload={currentWordObj}
          setDisplayAnswerSummary={setDisplayAnswerSummary}
          feedback={feedback}
        />
      )}
      {!displayAnswerSummary && (
        <>
          <div className='flex flex-col items-center gap-4'>
            {/* Show prompt based on quiz type */}
            <span className='text-sm text-[var(--secondary-color)] mb-2'>
              {quizType === 'meaning'
                ? isReverse
                  ? 'What is the meaning?'
                  : 'What is the meaning?'
                : 'What is the reading?'}
            </span>
            <div className='flex flex-row items-center gap-1'>
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
                  className='bg-[var(--card-color)] text-[var(--secondary-color)]'
                />
              )}
            </div>
          </div>

          <input
            ref={inputRef}
            type='text'
            value={inputValue}
            className={clsx(
              'border-b-2 pb-1 text-center focus:outline-none text-2xl lg:text-5xl text-[var(--secondary-color)]',
              'border-[var(--border-color)] focus:border-[var(--secondary-color)]/80'
            )}
            onChange={e => setInputValue(e.target.value)}
            onKeyDown={handleEnter}
            lang={inputLang}
          />

          <button
            ref={buttonRef}
            className={clsx(
              'text-xl font-medium py-4 px-16',
              buttonBorderStyles,
              'flex flex-row items-end gap-2',
              'active:scale-95 md:active:scale-98 active:duration-225',
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

export default VocabInputGame;
