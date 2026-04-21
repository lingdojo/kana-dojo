'use client';
import clsx from 'clsx';
import { useState, useEffect, useRef, useMemo, useCallback, memo } from 'react';
import { kana } from '@/features/Kana/data/kana';
import useKanaStore from '@/features/Kana/store/useKanaStore';
import { Random } from 'random-js';
import { useCorrect, useError } from '@/shared/hooks/generic/useAudio';
// import GameIntel from '@/shared/ui-composite/Game/GameIntel';
import { buttonBorderStyles } from '@/shared/utils/styles';
import { mcqKeyMappings } from '@/shared/utils/keyMappings';
import { useStatsStore } from '@/features/Progress';
import { useShallow } from 'zustand/react/shallow';
import Stars from '@/shared/ui-composite/Game/Stars';
import { useCrazyModeTrigger } from '@/features/CrazyMode/hooks/useCrazyModeTrigger';
import { getGlobalAdaptiveSelector } from '@/shared/utils/adaptiveSelection';
import { useSmartReverseMode } from '@/shared/hooks/game/useSmartReverseMode';
import { useAdaptiveOptionCount } from '@/shared/hooks/game/useAdaptiveOptionCount';
import useClassicSessionStore from '@/shared/store/useClassicSessionStore';

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

interface KanaMCQProps {
  isHidden: boolean;
}

const KanaMCQ = ({ isHidden }: KanaMCQProps) => {
  const logAttempt = useClassicSessionStore(state => state.logAttempt);
  const { isReverse, decideNextMode, recordWrongAnswer } =
    useSmartReverseMode();
  const {
    optionCount,
    recordCorrect: recordDifficultyCorrect,
    recordWrong: recordDifficultyWrong,
  } = useAdaptiveOptionCount({
    minOptions: 3,
    maxOptions: 6,
    streakPerLevel: 5,
    wrongsToDecrease: 2,
  });

  const {
    score,
    setScore,
    incrementHiraganaCorrect,
    incrementKatakanaCorrect,
    incrementWrongStreak,
    resetWrongStreak,
    incrementCorrectAnswers,
    incrementWrongAnswers,
    addCharacterToHistory,
    incrementCharacterScore,
  } = useStatsStore(
    useShallow(state => ({
      score: state.score,
      setScore: state.setScore,
      incrementHiraganaCorrect: state.incrementHiraganaCorrect,
      incrementKatakanaCorrect: state.incrementKatakanaCorrect,
      incrementWrongStreak: state.incrementWrongStreak,
      resetWrongStreak: state.resetWrongStreak,
      incrementCorrectAnswers: state.incrementCorrectAnswers,
      incrementWrongAnswers: state.incrementWrongAnswers,
      addCharacterToHistory: state.addCharacterToHistory,
      incrementCharacterScore: state.incrementCharacterScore,
    })),
  );

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
  }, [
    isReverse,
    correctRomajiCharReverse,
    correctKanaChar,
    correctRomajiChar,
    correctKanaCharReverse,
    optionCount,
    getIncorrectOptions,
  ]);

  const buttonRefs = useRef<(HTMLButtonElement | null)[]>([]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const index = mcqKeyMappings[event.code];
      if (index !== undefined && index < shuffledVariants.length) {
        buttonRefs.current[index]?.click();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [shuffledVariants.length]);

  // Split variants into rows: first row always has 3, second row has the rest (0-3)
  const { topRow, bottomRow } = useMemo(() => {
    return {
      topRow: shuffledVariants.slice(0, 3),
      bottomRow: shuffledVariants.slice(3),
    };
  }, [shuffledVariants]);

  const handleCorrectAnswer = useCallback(
    (correctChar: string) => {
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
      logAttempt({
        questionId: correctChar,
        questionPrompt: isReverse
          ? correctRomajiCharReverse
          : correctKanaChar,
        expectedAnswers: [isReverse ? correctKanaCharReverse : correctRomajiChar],
        userAnswer: isReverse ? correctKanaCharReverse : correctRomajiChar,
        inputKind: 'pick',
        isCorrect: true,
        optionsShown: shuffledVariants,
        extra: { isReverse },
      });
    },
    [
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
      resetWrongStreak,
      logAttempt,
      correctKanaChar,
      correctKanaCharReverse,
      correctRomajiChar,
      correctRomajiCharReverse,
      shuffledVariants,
      isReverse,
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
      logAttempt({
        questionId: isReverse ? correctRomajiCharReverse : correctKanaChar,
        questionPrompt: isReverse ? correctRomajiCharReverse : correctKanaChar,
        expectedAnswers: [isReverse ? correctKanaCharReverse : correctRomajiChar],
        userAnswer: selectedChar,
        inputKind: 'pick',
        isCorrect: false,
        optionsShown: shuffledVariants,
        extra: { isReverse },
      });
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
      logAttempt,
      correctKanaCharReverse,
      correctRomajiChar,
      shuffledVariants,
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
        } else {
          handleWrongAnswer(selectedChar);
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
        } else {
          handleWrongAnswer(selectedChar);
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
    ],
  );

  const displayChar = isReverse ? correctRomajiCharReverse : correctKanaChar;
  if (!selectedKana || selectedKana.length === 0) {
    return null;
  }

  return (
    <div
      className={clsx(
        'flex w-full flex-col items-center gap-4 sm:w-4/5 sm:gap-10',
        isHidden ? 'hidden' : '',
      )}
    >
      {/* <GameIntel gameMode='mcq' /> */}
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

export default KanaMCQ;

