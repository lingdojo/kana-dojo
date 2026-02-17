'use client';
import clsx from 'clsx';
import { useState, useEffect, useRef, useMemo, useCallback, memo } from 'react';
import { kana } from '@/features/Kana/data/kana';
import useKanaStore from '@/features/Kana/store/useKanaStore';
import { CircleCheck, CircleX } from 'lucide-react';
import { Random } from 'random-js';
import { useCorrect, useError } from '@/shared/hooks/useAudio';
// import GameIntel from '@/shared/components/Game/GameIntel';
import { buttonBorderStyles } from '@/shared/lib/styles';
import { pickGameKeyMappings } from '@/shared/lib/keyMappings';
import { useStopwatch } from 'react-timer-hook';
import { useStatsStore } from '@/features/Progress';
import { useShallow } from 'zustand/react/shallow';
import Stars from '@/shared/components/Game/Stars';
import { useCrazyModeTrigger } from '@/features/CrazyMode/hooks/useCrazyModeTrigger';
import { getGlobalAdaptiveSelector } from '@/shared/lib/adaptiveSelection';
import { useSmartReverseMode } from '@/shared/hooks/useSmartReverseMode';
import { useProgressiveDifficulty } from '@/shared/hooks/useProgressiveDifficulty';
import { useWordBuildingMode } from '@/shared/hooks/useWordBuildingMode';
import WordBuildingGame from './WordBuildingGame';

const random = new Random();

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

// Memoized option button component to prevent unnecessary re-renders
interface OptionButtonProps {
  variantChar: string;
  index: number;
  isWrong: boolean;
  onClick: (char: string) => void;
  buttonRef?: (elem: HTMLButtonElement | null) => void;
}

const OptionButton = memo(
  ({ variantChar, index, isWrong, onClick, buttonRef }: OptionButtonProps) => {
    return (
      <button
        ref={buttonRef}
        key={variantChar + index}
        type='button'
        disabled={isWrong}
        className={clsx(
          'relative flex w-full flex-row items-center justify-center gap-1 pt-3 pb-6 text-5xl font-semibold sm:w-1/5',
          buttonBorderStyles,
          'border-b-4',
          isWrong &&
            'text-(--border-color) hover:border-(--border-color) hover:bg-(--card-color)',
          !isWrong &&
            'border-(--secondary-color)/50 text-(--secondary-color) hover:border-(--secondary-color)',
        )}
        onClick={() => onClick(variantChar)}
      >
        <span>{variantChar}</span>
        <span
          className={clsx(
            'absolute top-1/2 right-4 hidden h-5 min-w-5 -translate-y-1/2 items-center justify-center rounded-full bg-(--border-color) px-1 text-xs leading-none lg:inline-flex',
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

interface PickGameProps {
  isHidden: boolean;
}

const PickGame = ({ isHidden }: PickGameProps) => {
  const { isReverse, decideNextMode, recordWrongAnswer } =
    useSmartReverseMode();
  const {
    optionCount,
    recordCorrect: recordDifficultyCorrect,
    recordWrong: recordDifficultyWrong,
  } = useProgressiveDifficulty({
    minOptions: 3,
    maxOptions: 6,
    streakPerLevel: 5,
    wrongsToDecrease: 2,
  });

  // Set to true to force word building mode for testing
  const FORCE_WORD_BUILDING_MODE = true;

  // Word building mode hook - triggers adaptively based on performance
  const {
    isWordBuildingMode: isWordBuildingModeFromHook,
    isWordBuildingReverse,
    wordLength,
    decideNextMode: decideNextWordBuildingMode,
    recordWrongAnswer: recordWordBuildingWrong,
    exitWordBuildingMode,
  } = useWordBuildingMode({
    minConsecutiveForTrigger: FORCE_WORD_BUILDING_MODE ? 0 : 3,
    baseProbability: FORCE_WORD_BUILDING_MODE ? 1.0 : 0.15,
    maxProbability: FORCE_WORD_BUILDING_MODE ? 1.0 : 0.4,
    enableAdaptiveWordLength: true,
    minWordLength: 1,
    maxWordLength: 3,
  });

  // Override with forced mode for testing
  const isWordBuildingMode =
    FORCE_WORD_BUILDING_MODE || isWordBuildingModeFromHook;

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
    incrementCharacterScore,
    addCorrectAnswerTime,
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
      incrementCharacterScore: state.incrementCharacterScore,
      addCorrectAnswerTime: state.addCorrectAnswerTime,
    })),
  );

  const speedStopwatch = useStopwatch({ autoStart: false });

  const { playCorrect } = useCorrect();
  const { playErrorTwice } = useError();
  const { trigger: triggerCrazyMode } = useCrazyModeTrigger();

  const kanaGroupIndices = useKanaStore(state => state.kanaGroupIndices);

  const selectedKana = useMemo(
    () => kanaGroupIndices.map(i => kana[i].kana).flat(),
    [kanaGroupIndices],
  );
  const selectedRomaji = useMemo(
    () => kanaGroupIndices.map(i => kana[i].romanji).flat(),
    [kanaGroupIndices],
  );

  // For normal pick mode
  const selectedPairs = useMemo(
    () =>
      Object.fromEntries(
        selectedKana.map((key, i) => [key, selectedRomaji[i]]),
      ),
    [selectedKana, selectedRomaji],
  );

  // For reverse pick mode
  const selectedPairs1 = useMemo(
    () =>
      Object.fromEntries(
        selectedRomaji.map((key, i) => [key, selectedKana[i]]),
      ),
    [selectedRomaji, selectedKana],
  );
  const selectedPairs2 = useMemo(
    () =>
      Object.fromEntries(
        selectedRomaji.map((key, i) => [key, selectedKana[i]]).reverse(),
      ),
    [selectedRomaji, selectedKana],
  );
  const reversedPairs1 = useMemo(
    () =>
      Object.fromEntries(
        Object.entries(selectedPairs1).map(([key, value]) => [value, key]),
      ),
    [selectedPairs1],
  );
  const reversedPairs2 = useMemo(
    () =>
      Object.fromEntries(
        Object.entries(selectedPairs2).map(([key, value]) => [value, key]),
      ),
    [selectedPairs2],
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
    },
  );
  const correctKanaCharReverse = random.bool()
    ? selectedPairs1[correctRomajiCharReverse]
    : selectedPairs2[correctRomajiCharReverse];

  // Get incorrect options based on mode and current option count
  const getIncorrectOptions = useCallback(
    (count: number) => {
      const incorrectCount = count - 1; // One slot is for the correct answer
      if (!isReverse) {
        const { [correctKanaChar]: _, ...incorrectPairs } = selectedPairs;
        void _;
        return [...Object.values(incorrectPairs)]
          .sort(() => random.real(0, 1) - 0.5)
          .slice(0, incorrectCount);
      } else {
        const { [correctRomajiCharReverse]: _, ...incorrectPairs } =
          random.bool() ? selectedPairs1 : selectedPairs2;
        void _;
        return [...Object.values(incorrectPairs)]
          .sort(() => random.real(0, 1) - 0.5)
          .slice(0, incorrectCount);
      }
    },
    [
      isReverse,
      correctKanaChar,
      correctRomajiCharReverse,
      selectedPairs,
      selectedPairs1,
      selectedPairs2,
    ],
  );

  const [shuffledVariants, setShuffledVariants] = useState(() => {
    const incorrectOptions = getIncorrectOptions(optionCount);
    return isReverse
      ? [correctKanaCharReverse, ...incorrectOptions].sort(
          () => random.real(0, 1) - 0.5,
        )
      : [correctRomajiChar, ...incorrectOptions].sort(
          () => random.real(0, 1) - 0.5,
        );
  });

  const [feedback, setFeedback] = useState(<>{'feedback ~'}</>);
  const [wrongSelectedAnswers, setWrongSelectedAnswers] = useState<string[]>(
    [],
  );

  // Update shuffled variants when correct character or option count changes
  useEffect(() => {
    const incorrectOptions = getIncorrectOptions(optionCount);
    setShuffledVariants(
      isReverse
        ? [correctKanaCharReverse, ...incorrectOptions].sort(
            () => random.real(0, 1) - 0.5,
          )
        : [correctRomajiChar, ...incorrectOptions].sort(
            () => random.real(0, 1) - 0.5,
          ),
    );
    if (isReverse) {
      speedStopwatch.start();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    isReverse,
    correctRomajiCharReverse,
    correctKanaChar,
    correctRomajiChar,
    correctKanaCharReverse,
    optionCount,
    getIncorrectOptions,
    // speedStopwatch intentionally excluded - only calling methods, not reading values
  ]);

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isHidden]); // speedStopwatch intentionally excluded - only calling methods

  // Split variants into rows: first row always has 3, second row has the rest (0-3)
  const { topRow, bottomRow } = useMemo(() => {
    return {
      topRow: shuffledVariants.slice(0, 3),
      bottomRow: shuffledVariants.slice(3),
    };
  }, [shuffledVariants]);

  const handleCorrectAnswer = useCallback(
    (correctChar: string) => {
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
      setWrongSelectedAnswers([]);
      triggerCrazyMode();
      // Update adaptive weight system - reduces probability of mastered characters
      adaptiveSelector.updateCharacterWeight(correctChar, true);
      // Smart algorithm decides next mode based on performance
      decideNextMode();
      // Progressive difficulty - track correct answer
      recordDifficultyCorrect();
      // Track content-specific stats for achievements (Requirements 1.1-1.8)
      if (isHiragana(correctChar)) {
        incrementHiraganaCorrect();
      } else if (isKatakana(correctChar)) {
        incrementKatakanaCorrect();
      }
      // Reset wrong streak on correct answer (Requirement 10.2)
      resetWrongStreak();
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      addCorrectAnswerTime,
      playCorrect,
      addCharacterToHistory,
      incrementCharacterScore,
      incrementCorrectAnswers,
      score,
      setScore,
      triggerCrazyMode,
      decideNextMode,
      recordDifficultyCorrect,
      incrementHiraganaCorrect,
      incrementKatakanaCorrect,
      recordAnswerTime,
      resetWrongStreak,
      // speedStopwatch, adaptiveSelector intentionally excluded
    ],
  );

  const handleWrongAnswer = useCallback(
    (selectedChar: string) => {
      setWrongSelectedAnswers([...wrongSelectedAnswers, selectedChar]);
      playErrorTwice();
      const currentChar = isReverse
        ? correctRomajiCharReverse
        : correctKanaChar;
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
      // Track wrong streak for achievements (Requirement 10.2)
      incrementWrongStreak();
    },
    [
      wrongSelectedAnswers,
      playErrorTwice,
      isReverse,
      correctRomajiCharReverse,
      correctKanaChar,
      incrementCharacterScore,
      incrementWrongAnswers,
      score,
      setScore,
      triggerCrazyMode,
      recordWrongAnswer,
      recordDifficultyWrong,
      incrementWrongStreak,
    ],
  );

  const handleOptionClick = useCallback(
    (selectedChar: string) => {
      if (!isReverse) {
        // Normal pick mode logic
        if (selectedChar === correctRomajiChar) {
          handleCorrectAnswer(correctKanaChar);
          // Use weighted selection - prioritizes characters user struggles with
          const newKana = adaptiveSelector.selectWeightedCharacter(
            selectedKana,
            correctKanaChar,
          );
          adaptiveSelector.markCharacterSeen(newKana);
          setCorrectKanaChar(newKana);
          setFeedback(
            <>
              <span>{`${correctKanaChar} = ${correctRomajiChar} `}</span>
              <CircleCheck className='inline text-(--main-color)' />
            </>,
          );
        } else {
          handleWrongAnswer(selectedChar);
          setFeedback(
            <>
              <span>{`${correctKanaChar} ≠ ${selectedChar} `}</span>
              <CircleX className='inline text-(--main-color)' />
            </>,
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
            correctRomajiCharReverse,
          );
          adaptiveSelector.markCharacterSeen(newRomaji);
          setCorrectRomajiCharReverse(newRomaji);
          setFeedback(
            <>
              <span>{`${correctRomajiCharReverse} = ${correctKanaCharReverse} `}</span>
              <CircleCheck className='inline text-(--main-color)' />
            </>,
          );
        } else {
          handleWrongAnswer(selectedChar);
          setFeedback(
            <>
              <span>{`${correctRomajiCharReverse} ≠ ${selectedChar} `}</span>
              <CircleX className='inline text-(--main-color)' />
            </>,
          );
        }
      }
    },
    [
      isReverse,
      correctRomajiChar,
      handleCorrectAnswer,
      correctKanaChar,
      selectedKana,
      handleWrongAnswer,
      reversedPairs1,
      reversedPairs2,
      correctRomajiCharReverse,
      selectedRomaji,
      correctKanaCharReverse,
    ],
  );

  const displayChar = isReverse ? correctRomajiCharReverse : correctKanaChar;
  const gameMode = 'pick';

  // Exit word building mode if not enough characters
  const hasEnoughCharsForWordBuilding = selectedKana.length >= wordLength;

  if (!selectedKana || selectedKana.length === 0) {
    return null;
  }

  // Handle word building mode correct answer
  const handleWordBuildingCorrect = (chars: string[]) => {
    // Update both difficulty systems
    chars.forEach(() => {
      recordDifficultyCorrect();
    });
    // Decide next mode (may exit word building)
    decideNextWordBuildingMode();
    decideNextMode();
  };

  // Handle word building mode wrong answer
  const handleWordBuildingWrong = () => {
    recordWordBuildingWrong();
    recordDifficultyWrong();
    recordWrongAnswer();
  };

  // Render word building game if in that mode and have enough characters
  if (isWordBuildingMode && hasEnoughCharsForWordBuilding) {
    return (
      <WordBuildingGame
        isHidden={isHidden}
        isReverse={isWordBuildingReverse}
        wordLength={wordLength}
        onCorrect={handleWordBuildingCorrect}
        onWrong={handleWordBuildingWrong}
      />
    );
  }

  // Exit word building mode if not enough chars
  if (isWordBuildingMode && !hasEnoughCharsForWordBuilding) {
    exitWordBuildingMode();
  }

  return (
    <div
      className={clsx(
        'flex w-full flex-col items-center gap-4 sm:w-4/5 sm:gap-10',
        isHidden ? 'hidden' : '',
      )}
    >
      {/* <GameIntel gameMode={gameMode} /> */}
      <div className='flex flex-row items-center gap-1'>
        <p className='text-8xl font-medium sm:text-9xl'>{displayChar}</p>
      </div>
      {/* First row - always 3 options */}
      <div className='flex w-full flex-row gap-5 sm:justify-evenly sm:gap-0'>
        {topRow.map((variantChar: string, i: number) => (
          <OptionButton
            key={variantChar + i}
            variantChar={variantChar}
            index={i}
            isWrong={wrongSelectedAnswers.includes(variantChar)}
            onClick={handleOptionClick}
            buttonRef={elem => {
              buttonRefs.current[i] = elem;
            }}
          />
        ))}
      </div>
      {/* Second row - progressively fills with 1-3 additional options */}
      {bottomRow.length > 0 && (
        <div className='flex w-full flex-row gap-5 sm:justify-evenly sm:gap-0'>
          {bottomRow.map((variantChar: string, i: number) => (
            <OptionButton
              key={variantChar + i}
              variantChar={variantChar}
              index={3 + i}
              isWrong={wrongSelectedAnswers.includes(variantChar)}
              onClick={handleOptionClick}
              buttonRef={elem => {
                buttonRefs.current[3 + i] = elem;
              }}
            />
          ))}
        </div>
      )}
      <Stars />
    </div>
  );
};

export default PickGame;
