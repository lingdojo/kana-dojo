'use client';
import clsx from 'clsx';
import { useState, useEffect, useRef, useMemo, memo } from 'react';
import { CircleCheck, CircleX } from 'lucide-react';
import { Random } from 'random-js';
import useKanjiStore, { IKanjiObj } from '@/features/Kanji/store/useKanjiStore';
import { useCorrect, useError } from '@/shared/hooks/useAudio';
import { buttonBorderStyles } from '@/shared/lib/styles';
// import GameIntel from '@/shared/components/Game/GameIntel';
import { pickGameKeyMappings } from '@/shared/lib/keyMappings';
import { useStopwatch } from 'react-timer-hook';
import { useStatsStore } from '@/features/Progress';
import { useShallow } from 'zustand/react/shallow';
import Stars from '@/shared/components/Game/Stars';
import AnswerSummary from '@/shared/components/Game/AnswerSummary';
import SSRAudioButton from '@/shared/components/audio/SSRAudioButton';
import FuriganaText from '@/shared/components/text/FuriganaText';
import { useCrazyModeTrigger } from '@/features/CrazyMode/hooks/useCrazyModeTrigger';
import { getGlobalAdaptiveSelector } from '@/shared/lib/adaptiveSelection';
import { useSmartReverseMode } from '@/shared/hooks/useSmartReverseMode';
import { useWordBuildingMode } from '@/shared/hooks/useWordBuildingMode';
import WordBuildingGame from './WordBuildingGame';

const random = new Random();

// Get the global adaptive selector for weighted character selection
const adaptiveSelector = getGlobalAdaptiveSelector();

// Memoized option button component to prevent unnecessary re-renders
interface OptionButtonProps {
  option: string;
  index: number;
  isWrong: boolean;
  isReverse: boolean;
  correctChar: string;
  kanjiObjMap: Map<string, IKanjiObj>;
  onClick: (option: string) => void;
  buttonRef?: (elem: HTMLButtonElement | null) => void;
}

const OptionButton = memo(
  ({
    option,
    index,
    isWrong,
    isReverse,
    kanjiObjMap,
    onClick,
    buttonRef,
  }: OptionButtonProps) => {
    return (
      <button
        ref={buttonRef}
        type='button'
        disabled={isWrong}
        className={clsx(
          isReverse
            ? 'w-1/3 justify-center text-5xl md:w-1/4 lg:w-1/5'
            : 'w-full justify-start pl-8 text-3xl md:w-1/2 md:text-4xl',
          'flex flex-row items-center gap-1.5 rounded-xl py-5',
          buttonBorderStyles,
          'text-(--border-color)',
          'border-b-4',
          isWrong && 'border-(--border-color) hover:bg-(--card-color)',
          !isWrong &&
            'border-(--secondary-color)/50 text-(--secondary-color) hover:border-(--secondary-color)',
        )}
        onClick={() => onClick(option)}
        lang={isReverse ? 'ja' : undefined}
      >
        <span className={clsx(isReverse ? '' : 'flex-1 text-left')}>
          <FuriganaText
            text={option}
            reading={
              isReverse
                ? kanjiObjMap.get(option)?.onyomi[0] ||
                  kanjiObjMap.get(option)?.kunyomi[0]
                : undefined
            }
          />
        </span>
        <span
          className={clsx(
            'hidden rounded-full bg-(--border-color) px-1 text-xs lg:inline',
            isReverse ? '' : 'mr-4',
            isWrong ? 'text-(--border-color)' : 'text-(--secondary-color)',
          )}
        >
          {index + 1}
        </span>
      </button>
    );
  },
);

OptionButton.displayName = 'OptionButton';

interface KanjiPickGameProps {
  selectedKanjiObjs: IKanjiObj[];
  isHidden: boolean;
}

const KanjiPickGame = ({ selectedKanjiObjs, isHidden }: KanjiPickGameProps) => {
  const { isReverse, decideNextMode, recordWrongAnswer } =
    useSmartReverseMode();

  // Set to true to force word building mode for testing
  const FORCE_WORD_BUILDING_MODE = true;

  // Word building mode hook - triggers adaptively based on performance
  const {
    isWordBuildingMode: isWordBuildingModeFromHook,
    isWordBuildingReverse,
    decideNextMode: decideNextWordBuildingMode,
    recordWrongAnswer: recordWordBuildingWrong,
  } = useWordBuildingMode({
    minConsecutiveForTrigger: FORCE_WORD_BUILDING_MODE ? 0 : 3,
    baseProbability: FORCE_WORD_BUILDING_MODE ? 1.0 : 0.15,
    maxProbability: FORCE_WORD_BUILDING_MODE ? 1.0 : 0.4,
  });

  // Override with forced mode for testing
  const isWordBuildingMode =
    FORCE_WORD_BUILDING_MODE || isWordBuildingModeFromHook;

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

  const speedStopwatch = useStopwatch({ autoStart: false });

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

  // Create Map for O(1) lookups instead of O(n) find() calls
  const kanjiObjMap = useMemo(
    () => new Map(selectedKanjiObjs.map(obj => [obj.kanjiChar, obj])),
    [selectedKanjiObjs],
  );

  // Find the correct object - O(1) lookup
  const correctKanjiObj = kanjiObjMap.get(correctChar);

  const [currentKanjiObj, setCurrentKanjiObj] = useState<IKanjiObj>(
    correctKanjiObj as IKanjiObj,
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
      obj => obj.kanjiChar !== correctChar,
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
      () => random.real(0, 1) - 0.5,
    ) as string[],
  );

  const [displayAnswerSummary, setDisplayAnswerSummary] = useState(false);
  const [feedback, setFeedback] = useState(<>{'feedback ~'}</>);
  const [wrongSelectedAnswers, setWrongSelectedAnswers] = useState<string[]>(
    [],
  );

  // Update shuffled options when correctChar or isReverse changes
  useEffect(() => {
    setShuffledOptions(
      [targetChar, ...getIncorrectOptions()].sort(
        () => random.real(0, 1) - 0.5,
      ) as string[],
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
  }, [shuffledOptions.length]);

  useEffect(() => {
    if (isHidden) speedStopwatch.pause();
  }, [isHidden]);

  if (!selectedKanjiObjs || selectedKanjiObjs.length === 0) {
    return null;
  }

  // Handle word building mode correct answer
  const handleWordBuildingCorrect = (chars: string[]) => {
    // Decide next mode (may exit word building)
    decideNextWordBuildingMode();
    decideNextMode();
  };

  // Handle word building mode wrong answer
  const handleWordBuildingWrong = () => {
    recordWordBuildingWrong();
    recordWrongAnswer();
  };

  // Render word building game if in that mode
  if (isWordBuildingMode) {
    return (
      <WordBuildingGame
        selectedKanjiObjs={selectedKanjiObjs}
        isHidden={isHidden}
        isReverse={isWordBuildingReverse}
        onCorrect={handleWordBuildingCorrect}
        onWrong={handleWordBuildingWrong}
      />
    );
  }

  const handleOptionClick = (selectedOption: string) => {
    if (selectedOption === targetChar) {
      setDisplayAnswerSummary(true);
      handleCorrectAnswer();
      generateNewCharacter();
      setFeedback(
        <>
          <span className='text-(--secondary-color)'>{`${displayChar} = ${selectedOption} `}</span>
          <CircleCheck className='inline text-(--main-color)' />
        </>,
      );
    } else {
      handleWrongAnswer(selectedOption);
      setFeedback(
        <>
          <span className='text-(--secondary-color)'>{`${displayChar} ≠ ${selectedOption} `}</span>
          <CircleX className='inline text-(--main-color)' />
        </>,
      );
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
    // Track content-specific stats for achievements (Requirements 2.1-2.10)
    incrementKanjiCorrect(selectedKanjiCollection.toUpperCase());
    // Reset wrong streak on correct answer (Requirement 10.2)
    resetWrongStreak();
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
    // Track wrong streak for achievements (Requirement 10.2)
    incrementWrongStreak();
  };

  const generateNewCharacter = () => {
    // Always select from kanji characters - correctChar stores the kanji
    const sourceArray = selectedKanjiObjs.map(obj => obj.kanjiChar);

    // Use weighted selection - prioritizes characters user struggles with
    const newChar = adaptiveSelector.selectWeightedCharacter(
      sourceArray,
      correctChar,
    );
    adaptiveSelector.markCharacterSeen(newChar);
    setCorrectChar(newChar);
  };

  const gameMode = 'pick';
  const displayCharLang = isReverse ? undefined : 'ja';

  return (
    <div
      className={clsx(
        'flex w-full flex-col items-center gap-8 sm:w-4/5 sm:gap-10',
        isHidden ? 'hidden' : '',
        !isReverse && '',
      )}
    >
      {/* <GameIntel gameMode={gameMode} /> */}
      {displayAnswerSummary && (
        <AnswerSummary
          payload={currentKanjiObj}
          setDisplayAnswerSummary={setDisplayAnswerSummary}
          feedback={feedback}
        />
      )}

      {!displayAnswerSummary && (
        <>
          <div className='flex flex-row items-center justify-center gap-1'>
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
                className='bg-(--card-color) text-(--secondary-color)'
              />
            )}
          </div>

          <div
            className={clsx(
              'flex w-full items-center gap-6',
              isReverse ? 'flex-row justify-evenly' : 'flex-col',
            )}
          >
            {shuffledOptions.map((option, i) => (
              <OptionButton
                key={`${correctChar}-${option}-${i}`}
                option={option}
                index={i}
                isWrong={wrongSelectedAnswers.includes(option)}
                isReverse={isReverse}
                correctChar={correctChar}
                kanjiObjMap={kanjiObjMap}
                onClick={handleOptionClick}
                buttonRef={elem => {
                  buttonRefs.current[i] = elem;
                }}
              />
            ))}
          </div>

          <Stars />
        </>
      )}
    </div>
  );
};

export default KanjiPickGame;
