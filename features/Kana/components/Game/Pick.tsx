'use client';
import clsx from 'clsx';
import { useState, useEffect, useRef, useMemo } from 'react';
import { kana } from '@/features/Kana/data/kana';
import useKanaStore from '@/features/Kana/store/useKanaStore';
import { CircleCheck, CircleX } from 'lucide-react';
import { Random } from 'random-js';
import { useCorrect, useError } from '@/shared/hooks/useAudio';
import GameIntel from '@/shared/components/Game/GameIntel';
import { buttonBorderStyles } from '@/shared/lib/styles';
import { pickGameKeyMappings } from '@/shared/lib/keyMappings';
import { useStopwatch } from 'react-timer-hook';
import useStats from '@/shared/hooks/useStats';
import useStatsStore from '@/features/Progress/store/useStatsStore';
import Stars from '@/shared/components/Game/Stars';
import { useCrazyModeTrigger } from '@/features/CrazyMode/hooks/useCrazyModeTrigger';
import { getGlobalAdaptiveSelector } from '@/shared/lib/adaptiveSelection';
import { useSmartReverseMode } from '@/shared/hooks/useSmartReverseMode';
import { useProgressiveDifficulty } from '@/shared/hooks/useProgressiveDifficulty';

const random = new Random();

// Get the global adaptive selector for weighted character selection
const adaptiveSelector = getGlobalAdaptiveSelector();

interface PickGameProps {
  isHidden: boolean;
}

const PickGame = ({ isHidden }: PickGameProps) => {
  const { isReverse, decideNextMode, recordWrongAnswer } =
    useSmartReverseMode();
  const {
    optionCount,
    recordCorrect: recordDifficultyCorrect,
    recordWrong: recordDifficultyWrong
  } = useProgressiveDifficulty({
    minOptions: 3,
    maxOptions: 6,
    streakPerLevel: 5,
    wrongsToDecrease: 2
  });

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

  const kanaGroupIndices = useKanaStore(state => state.kanaGroupIndices);

  const selectedKana = kanaGroupIndices.map(i => kana[i].kana).flat();
  const selectedRomaji = kanaGroupIndices.map(i => kana[i].romanji).flat();

  // For normal pick mode
  const selectedPairs = Object.fromEntries(
    selectedKana.map((key, i) => [key, selectedRomaji[i]])
  );

  // For reverse pick mode
  const selectedPairs1 = Object.fromEntries(
    selectedRomaji.map((key, i) => [key, selectedKana[i]])
  );
  const selectedPairs2 = Object.fromEntries(
    selectedRomaji
      .map((key, i) => [key, selectedKana[i]])
      .slice()
      .reverse()
  );
  const reversedPairs1 = Object.fromEntries(
    Object.entries(selectedPairs1).map(([key, value]) => [value, key])
  );
  const reversedPairs2 = Object.fromEntries(
    Object.entries(selectedPairs2).map(([key, value]) => [value, key])
  );

  // State for normal pick mode - uses weighted selection for adaptive learning
  const [correctKanaChar, setCorrectKanaChar] = useState(() => {
    if (selectedKana.length === 0) return '';
    const selected = adaptiveSelector.selectWeightedCharacter(selectedKana);
    adaptiveSelector.markCharacterSeen(selected);
    return selected;
  });
  const correctRomajiChar = selectedPairs[correctKanaChar];

  // State for reverse pick mode - uses weighted selection for adaptive learning
  const [correctRomajiCharReverse, setCorrectRomajiCharReverse] = useState(
    () => {
      if (selectedRomaji.length === 0) return '';
      const selected = adaptiveSelector.selectWeightedCharacter(selectedRomaji);
      adaptiveSelector.markCharacterSeen(selected);
      return selected;
    }
  );
  const correctKanaCharReverse = random.bool()
    ? selectedPairs1[correctRomajiCharReverse]
    : selectedPairs2[correctRomajiCharReverse];

  // Get incorrect options based on mode and current option count
  const getIncorrectOptions = (count: number) => {
    const incorrectCount = count - 1; // One slot is for the correct answer
    if (!isReverse) {
      const { [correctKanaChar]: _, ...incorrectPairs } = selectedPairs;
      void _;
      return [...Object.values(incorrectPairs)]
        .sort(() => random.real(0, 1) - 0.5)
        .slice(0, incorrectCount);
    } else {
      const { [correctRomajiCharReverse]: _, ...incorrectPairs } = random.bool()
        ? selectedPairs1
        : selectedPairs2;
      void _;
      return [...Object.values(incorrectPairs)]
        .sort(() => random.real(0, 1) - 0.5)
        .slice(0, incorrectCount);
    }
  };

  const [shuffledVariants, setShuffledVariants] = useState(() => {
    const incorrectOptions = getIncorrectOptions(optionCount);
    return isReverse
      ? [correctKanaCharReverse, ...incorrectOptions].sort(
          () => random.real(0, 1) - 0.5
        )
      : [correctRomajiChar, ...incorrectOptions].sort(
          () => random.real(0, 1) - 0.5
        );
  });

  const [feedback, setFeedback] = useState(<>{'feedback ~'}</>);
  const [wrongSelectedAnswers, setWrongSelectedAnswers] = useState<string[]>(
    []
  );

  // Update shuffled variants when correct character or option count changes
  useEffect(() => {
    const incorrectOptions = getIncorrectOptions(optionCount);
    setShuffledVariants(
      isReverse
        ? [correctKanaCharReverse, ...incorrectOptions].sort(
            () => random.real(0, 1) - 0.5
          )
        : [correctRomajiChar, ...incorrectOptions].sort(
            () => random.real(0, 1) - 0.5
          )
    );
    if (isReverse) {
      speedStopwatch.start();
    }
  }, [isReverse ? correctRomajiCharReverse : correctKanaChar, optionCount]);

  const buttonRefs = useRef<(HTMLButtonElement | null)[]>([]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const index = pickGameKeyMappings[event.code];
      if (index !== undefined && index < shuffledVariants.length) {
        buttonRefs.current[index]?.click();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [shuffledVariants.length]);

  useEffect(() => {
    if (isHidden) speedStopwatch.pause();
  }, [isHidden]);

  // Split variants into rows: first row always has 3, second row has the rest (0-3)
  const { topRow, bottomRow } = useMemo(() => {
    return {
      topRow: shuffledVariants.slice(0, 3),
      bottomRow: shuffledVariants.slice(3)
    };
  }, [shuffledVariants]);

  if (!selectedKana || selectedKana.length === 0) {
    return null;
  }

  const handleOptionClick = (selectedChar: string) => {
    if (!isReverse) {
      // Normal pick mode logic
      if (selectedChar === correctRomajiChar) {
        handleCorrectAnswer(correctKanaChar);
        // Use weighted selection - prioritizes characters user struggles with
        const newKana = adaptiveSelector.selectWeightedCharacter(
          selectedKana,
          correctKanaChar
        );
        adaptiveSelector.markCharacterSeen(newKana);
        setCorrectKanaChar(newKana);
        setFeedback(
          <>
            <span>{`${correctKanaChar} = ${correctRomajiChar} `}</span>
            <CircleCheck className='inline text-[var(--main-color)]' />
          </>
        );
      } else {
        handleWrongAnswer(selectedChar);
        setFeedback(
          <>
            <span>{`${correctKanaChar} ≠ ${selectedChar} `}</span>
            <CircleX className='inline text-[var(--main-color)]' />
          </>
        );
      }
    } else {
      // Reverse pick mode logic
      if (
        reversedPairs1[selectedChar] === correctRomajiCharReverse ||
        reversedPairs2[selectedChar] === correctRomajiCharReverse
      ) {
        handleCorrectAnswer(correctRomajiCharReverse);
        // Use weighted selection - prioritizes characters user struggles with
        const newRomaji = adaptiveSelector.selectWeightedCharacter(
          selectedRomaji,
          correctRomajiCharReverse
        );
        adaptiveSelector.markCharacterSeen(newRomaji);
        setCorrectRomajiCharReverse(newRomaji);
        setFeedback(
          <>
            <span>{`${correctRomajiCharReverse} = ${correctKanaCharReverse} `}</span>
            <CircleCheck className='inline text-[var(--main-color)]' />
          </>
        );
      } else {
        handleWrongAnswer(selectedChar);
        setFeedback(
          <>
            <span>{`${correctRomajiCharReverse} ≠ ${selectedChar} `}</span>
            <CircleX className='inline text-[var(--main-color)]' />
          </>
        );
      }
    }
  };

  const handleCorrectAnswer = (correctChar: string) => {
    speedStopwatch.pause();
    addCorrectAnswerTime(speedStopwatch.totalMilliseconds / 1000);
    speedStopwatch.reset();
    playCorrect();
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
    // Progressive difficulty - track correct answer
    recordDifficultyCorrect();
  };

  const handleWrongAnswer = (selectedChar: string) => {
    setWrongSelectedAnswers([...wrongSelectedAnswers, selectedChar]);
    playErrorTwice();
    const currentChar = isReverse ? correctRomajiCharReverse : correctKanaChar;
    incrementCharacterScore(currentChar, 'wrong');
    incrementWrongAnswers();
    if (score - 1 < 0) {
      setScore(0);
    } else {
      setScore(score - 1);
    }
    triggerCrazyMode();
    // Update adaptive weight system - increases probability of difficult characters
    adaptiveSelector.updateCharacterWeight(currentChar, false);
    // Reset consecutive streak without changing mode (avoids rerolling the question)
    recordWrongAnswer();
    // Progressive difficulty - track wrong answer
    recordDifficultyWrong();
  };

  const displayChar = isReverse ? correctRomajiCharReverse : correctKanaChar;
  const gameMode = 'pick';

  return (
    <div
      className={clsx(
        'flex flex-col gap-4 sm:gap-10 items-center w-full sm:w-4/5',
        isHidden ? 'hidden' : ''
      )}
    >
      <GameIntel gameMode={gameMode} feedback={feedback} />
      <div className='flex flex-row items-center gap-1'>
        <p className='text-8xl sm:text-9xl font-medium'>{displayChar}</p>
      </div>
      {/* First row - always 3 options */}
      <div className='flex flex-row w-full gap-5 sm:gap-0 sm:justify-evenly'>
        {topRow.map((variantChar: string, i: number) => (
          <button
            ref={elem => {
              buttonRefs.current[i] = elem;
            }}
            key={variantChar + i}
            type='button'
            disabled={wrongSelectedAnswers.includes(variantChar)}
            className={clsx(
              'text-5xl font-semibold pb-6 pt-3 w-full sm:w-1/5 flex flex-row justify-center items-center gap-1',
              buttonBorderStyles,
              'border-b-4 ',
              wrongSelectedAnswers.includes(variantChar) &&
                'hover:bg-[var(--card-color)] hover:border-[var(--border-color)] text-[var(--border-color)]',
              !wrongSelectedAnswers.includes(variantChar) &&
                'text-[var(--secondary-color)] border-[var(--secondary-color)]/50 hover:border-[var(--secondary-color)]'
            )}
            onClick={() => handleOptionClick(variantChar)}
          >
            <span>{variantChar}</span>
            <span
              className={clsx(
                'hidden lg:inline text-xs rounded-full bg-[var(--border-color)]  px-1',
                wrongSelectedAnswers.includes(variantChar)
                  ? 'text-[var(--border-color)]'
                  : 'text-[var(--secondary-color)]'
              )}
            >
              {i + 1}
            </span>
          </button>
        ))}
      </div>
      {/* Second row - progressively fills with 1-3 additional options */}
      {bottomRow.length > 0 && (
        <div className='flex flex-row w-full gap-5 sm:gap-0 sm:justify-evenly'>
          {bottomRow.map((variantChar: string, i: number) => (
            <button
              ref={elem => {
                buttonRefs.current[3 + i] = elem;
              }}
              key={variantChar + i}
              type='button'
              disabled={wrongSelectedAnswers.includes(variantChar)}
              className={clsx(
                'text-5xl font-semibold pb-6 pt-3 w-full sm:w-1/5 flex flex-row justify-center items-center gap-1',
                buttonBorderStyles,
                'border-b-4 ',
                wrongSelectedAnswers.includes(variantChar) &&
                  'hover:bg-[var(--card-color)] hover:border-[var(--border-color)] text-[var(--border-color)]',
                !wrongSelectedAnswers.includes(variantChar) &&
                  'text-[var(--secondary-color)] border-[var(--secondary-color)]/50 hover:border-[var(--secondary-color)]'
              )}
              onClick={() => handleOptionClick(variantChar)}
            >
              <span>{variantChar}</span>
              <span
                className={clsx(
                  'hidden lg:inline text-xs rounded-full bg-[var(--border-color)]  px-1',
                  wrongSelectedAnswers.includes(variantChar)
                    ? 'text-[var(--border-color)]'
                    : 'text-[var(--secondary-color)]'
                )}
              >
                {4 + i}
              </span>
            </button>
          ))}
        </div>
      )}
      <Stars />
    </div>
  );
};

export default PickGame;
