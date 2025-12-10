'use client';
import clsx from 'clsx';
import { useState, useEffect, useRef } from 'react';
import { CircleCheck, CircleX } from 'lucide-react';
import { Random } from 'random-js';
import { IKanjiObj } from '@/features/Kanji/store/useKanjiStore';
import { useCorrect, useError } from '@/shared/hooks/useAudio';
import { buttonBorderStyles } from '@/shared/lib/styles';
import GameIntel from '@/shared/components/Game/GameIntel';
import { pickGameKeyMappings } from '@/shared/lib/keyMappings';
import { useStopwatch } from 'react-timer-hook';
import useStats from '@/shared/hooks/useStats';
import useStatsStore from '@/features/Progress/store/useStatsStore';
import Stars from '@/shared/components/Game/Stars';
import AnswerSummary from '@/shared/components/Game/AnswerSummary';
import SSRAudioButton from '@/shared/components/SSRAudioButton';
import FuriganaText from '@/shared/components/FuriganaText';
import { useCrazyModeTrigger } from '@/features/CrazyMode/hooks/useCrazyModeTrigger';
import { getGlobalAdaptiveSelector } from '@/shared/lib/adaptiveSelection';
import { useSmartReverseMode } from '@/shared/hooks/useSmartReverseMode';

const random = new Random();

// Get the global adaptive selector for weighted character selection
const adaptiveSelector = getGlobalAdaptiveSelector();

interface KanjiPickGameProps {
  selectedKanjiObjs: IKanjiObj[];
  isHidden: boolean;
}

const KanjiPickGame = ({ selectedKanjiObjs, isHidden }: KanjiPickGameProps) => {
  const { isReverse, decideNextMode, recordWrongAnswer } =
    useSmartReverseMode();
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

  const { playCorrect } = useCorrect();
  const { playErrorTwice } = useError();
  const { trigger: triggerCrazyMode } = useCrazyModeTrigger();

  // State management - correctChar always stores the kanji character
  // This ensures consistency when isReverse changes dynamically
  const [correctChar, setCorrectChar] = useState(() => {
    if (selectedKanjiObjs.length === 0) return '';
    const sourceArray = selectedKanjiObjs.map(obj => obj.kanjiChar);
    const selected = adaptiveSelector.selectWeightedCharacter(sourceArray);
    adaptiveSelector.markCharacterSeen(selected);
    return selected;
  });

  // Find the correct object - always by kanjiChar since correctChar stores the kanji
  const correctKanjiObj = selectedKanjiObjs.find(
    obj => obj.kanjiChar === correctChar
  );

  const [currentKanjiObj, setCurrentKanjiObj] = useState<IKanjiObj>(
    correctKanjiObj as IKanjiObj
  );

  // What to display as the question
  const displayChar = isReverse ? correctKanjiObj?.meanings[0] : correctChar;

  // Target (correct answer) based on mode
  const targetChar = isReverse
    ? correctKanjiObj?.kanjiChar // reverse: show meaning, answer is kanji
    : correctKanjiObj?.meanings?.[0]; // normal: show kanji, answer is meaning

  // Get incorrect options based on mode
  const getIncorrectOptions = () => {
    // Filter out the current kanji
    const incorrectKanjiObjs = selectedKanjiObjs.filter(
      obj => obj.kanjiChar !== correctChar
    );

    if (!isReverse) {
      // Normal mode: answers are meanings
      return incorrectKanjiObjs
        .map(obj => obj.meanings[0])
        .sort(() => random.real(0, 1) - 0.5)
        .slice(0, 2);
    } else {
      // Reverse mode: answers are kanji characters
      return incorrectKanjiObjs
        .map(obj => obj.kanjiChar)
        .sort(() => random.real(0, 1) - 0.5)
        .slice(0, 2);
    }
  };

  const randomIncorrectOptions = getIncorrectOptions();

  const [shuffledOptions, setShuffledOptions] = useState(
    [targetChar, ...randomIncorrectOptions].sort(
      () => random.real(0, 1) - 0.5
    ) as string[]
  );

  const [displayAnswerSummary, setDisplayAnswerSummary] = useState(false);
  const [feedback, setFeedback] = useState(<>{'feedback ~'}</>);
  const [wrongSelectedAnswers, setWrongSelectedAnswers] = useState<string[]>(
    []
  );

  // Update shuffled options when correctChar or isReverse changes
  useEffect(() => {
    setShuffledOptions(
      [targetChar, ...getIncorrectOptions()].sort(
        () => random.real(0, 1) - 0.5
      ) as string[]
    );
    setWrongSelectedAnswers([]);
  }, [correctChar, isReverse]);

  const buttonRefs = useRef<(HTMLButtonElement | null)[]>([]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const index = pickGameKeyMappings[event.code];
      if (index !== undefined && index < shuffledOptions.length) {
        buttonRefs.current[index]?.click();
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

  const handleOptionClick = (selectedOption: string) => {
    if (selectedOption === targetChar) {
      setDisplayAnswerSummary(true);
      handleCorrectAnswer();
      generateNewCharacter();
      setFeedback(
        <>
          <span className='text-[var(--secondary-color)]'>{`${displayChar} = ${selectedOption} `}</span>
          <CircleCheck className='inline text-[var(--main-color)]' />
        </>
      );
    } else {
      handleWrongAnswer(selectedOption);
      setFeedback(
        <>
          <span className='text-[var(--secondary-color)]'>{`${displayChar} ≠ ${selectedOption} `}</span>
          <CircleX className='inline text-[var(--main-color)]' />
        </>
      );
    }
  };

  const handleCorrectAnswer = () => {
    speedStopwatch.pause();
    addCorrectAnswerTime(speedStopwatch.totalMilliseconds / 1000);
    speedStopwatch.reset();
    playCorrect();
    setCurrentKanjiObj(correctKanjiObj as IKanjiObj);

    addCharacterToHistory(correctChar);
    incrementCharacterScore(correctChar, 'correct');
    incrementCorrectAnswers();
    setScore(score + 1);
    setWrongSelectedAnswers([]);
    triggerCrazyMode();
    // Update adaptive weight system - reduces probability of mastered characters
    adaptiveSelector.updateCharacterWeight(correctChar, true);
    // Smart algorithm decides next mode based on performance
    decideNextMode();
  };

  const handleWrongAnswer = (selectedOption: string) => {
    setWrongSelectedAnswers([...wrongSelectedAnswers, selectedOption]);
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
    // Reset consecutive streak without changing mode (avoids rerolling the question)
    recordWrongAnswer();
  };

  const generateNewCharacter = () => {
    // Always select from kanji characters - correctChar stores the kanji
    const sourceArray = selectedKanjiObjs.map(obj => obj.kanjiChar);

    // Use weighted selection - prioritizes characters user struggles with
    const newChar = adaptiveSelector.selectWeightedCharacter(
      sourceArray,
      correctChar
    );
    adaptiveSelector.markCharacterSeen(newChar);
    setCorrectChar(newChar);
  };

  const gameMode = 'pick';
  const displayCharLang = isReverse ? undefined : 'ja';

  return (
    <div
      className={clsx(
        'flex flex-col gap-8 sm:gap-10 items-center w-full sm:w-4/5',
        isHidden ? 'hidden' : '',
        !isReverse && ''
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
          <div className='flex flex-row justify-center items-center gap-1'>
            <FuriganaText
              text={displayChar ?? ''}
              reading={
                !isReverse
                  ? correctKanjiObj?.onyomi[0] || correctKanjiObj?.kunyomi[0]
                  : undefined
              }
              className={clsx(isReverse ? 'text-6xl md:text-8xl' : 'text-9xl')}
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

          <div
            className={clsx(
              'flex w-full gap-6 items-center',
              isReverse ? 'flex-row justify-evenly' : 'flex-col'
            )}
          >
            {shuffledOptions.map((option, i) => (
              <button
                ref={elem => {
                  buttonRefs.current[i] = elem;
                }}
                key={option + i}
                type='button'
                disabled={wrongSelectedAnswers.includes(option)}
                className={clsx(
                  isReverse
                    ? 'w-1/3 md:w-1/4 lg:w-1/5 justify-center text-5xl'
                    : 'w-full md:w-1/2 pl-8 justify-start text-3xl md:text-4xl',
                  ' py-5   rounded-xl flex flex-row  items-center gap-1.5',
                  buttonBorderStyles,
                  'text-[var(--border-color)]',

                  ' border-b-4',

                  wrongSelectedAnswers.includes(option) &&
                    'hover:bg-[var(--card-color)] border-[var(--border-color)]',
                  !wrongSelectedAnswers.includes(option) &&
                    'text-[var(--secondary-color)] border-[var(--secondary-color)]/50 hover:border-[var(--secondary-color)]'
                )}
                onClick={() => handleOptionClick(option)}
                lang={isReverse ? 'ja' : undefined}
              >
                <FuriganaText
                  text={option}
                  reading={
                    isReverse
                      ? selectedKanjiObjs.find(obj => obj.kanjiChar === option)
                          ?.onyomi[0] ||
                        selectedKanjiObjs.find(obj => obj.kanjiChar === option)
                          ?.kunyomi[0]
                      : undefined
                  }
                />
                <span
                  className={clsx(
                    'hidden lg:inline text-xs rounded-full bg-[var(--border-color)] px-1',
                    wrongSelectedAnswers.includes(option)
                      ? 'text-[var(--border-color)]'
                      : 'text-[var(--secondary-color)]'
                  )}
                >
                  {i + 1 === 1 ? '1' : i + 1 === 2 ? '2' : '3'}
                </span>
              </button>
            ))}
          </div>

          <Stars />
        </>
      )}
    </div>
  );
};

export default KanjiPickGame;
