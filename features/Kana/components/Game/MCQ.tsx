'use client';
import clsx from 'clsx';
import { useState, useEffect, useRef, useMemo, useCallback, memo } from 'react';
import { kana } from '@/features/Kana/data/kana';
import useKanaStore from '@/features/Kana/store/useKanaStore';
import {
  flattenKanaGroups,
  type KanaCharacter,
} from '@/features/Kana/lib/flattenKanaGroup';
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
import { getUniqueIncorrectOptions } from '@/features/Kana/lib/getUniqueIncorrectOptions';

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

  const isProcessingRef = useRef(false);

  const selectedKanaItems = useMemo(
    () => flattenKanaGroups(kanaGroupIndices),
    [kanaGroupIndices],
  );

  const allKanaItems = useMemo(
    () => flattenKanaGroups(kana.map((_, i) => i)),
    [],
  );

  // State for active question item using structured KanaCharacter
  const [currentItem, setCurrentItem] = useState<KanaCharacter | null>(() => {
    if (selectedKanaItems.length === 0) return null;
    const selectedKanaList = selectedKanaItems.map(item => item.kana);
    const selectedKanaChar = adaptiveSelector.selectWeightedCharacter(
      selectedKanaList,
    );
    adaptiveSelector.markCharacterSeen(selectedKanaChar);
    return (
      selectedKanaItems.find(item => item.kana === selectedKanaChar) ??
      selectedKanaItems[0]
    );
  });

  useEffect(() => {
    if (selectedKanaItems.length === 0) {
      setCurrentItem(null);
      return;
    }
    if (
      !currentItem ||
      !selectedKanaItems.some(
        item => item.kana === currentItem.kana && item.romaji === currentItem.romaji,
      )
    ) {
      setCurrentItem(selectedKanaItems[0]);
    }
  }, [selectedKanaItems, currentItem]);

  const correctKanaChar = currentItem?.kana ?? '';
  const correctRomajiChar = currentItem?.romaji ?? '';

  // Get incorrect options based on mode and current option count with fallback
  const getIncorrectOptions = useCallback(
    (count: number) => {
      const incorrectCount = count - 1; // One slot is for the correct answer
      if (!currentItem) return [];

      if (!isReverse) {
        const primaryCandidates = selectedKanaItems
          .filter(
            item =>
              item.kana !== currentItem.kana || item.romaji !== currentItem.romaji,
          )
          .map(item => item.romaji);

        const primaryOptions = getUniqueIncorrectOptions(
          correctRomajiChar,
          [...primaryCandidates].sort(() => random.real(0, 1) - 0.5),
          incorrectCount,
        );

        if (primaryOptions.length < incorrectCount) {
          const fallbackCandidates = allKanaItems
            .filter(item => item.romaji !== correctRomajiChar)
            .map(item => item.romaji);
          const fullPool = [...primaryOptions, ...fallbackCandidates];
          return getUniqueIncorrectOptions(
            correctRomajiChar,
            fullPool.sort(() => random.real(0, 1) - 0.5),
            incorrectCount,
          );
        }
        return primaryOptions;
      } else {
        const primaryCandidates = selectedKanaItems
          .filter(
            item =>
              item.kana !== currentItem.kana || item.romaji !== currentItem.romaji,
          )
          .map(item => item.kana);

        const primaryOptions = getUniqueIncorrectOptions(
          correctKanaChar,
          [...primaryCandidates].sort(() => random.real(0, 1) - 0.5),
          incorrectCount,
        );

        if (primaryOptions.length < incorrectCount) {
          const fallbackCandidates = allKanaItems
            .filter(item => item.kana !== correctKanaChar)
            .map(item => item.kana);
          const fullPool = [...primaryOptions, ...fallbackCandidates];
          return getUniqueIncorrectOptions(
            correctKanaChar,
            fullPool.sort(() => random.real(0, 1) - 0.5),
            incorrectCount,
          );
        }
        return primaryOptions;
      }
    },
    [isReverse, currentItem, correctKanaChar, correctRomajiChar, selectedKanaItems, allKanaItems],
  );

  const [shuffledVariants, setShuffledVariants] = useState(() => {
    const incorrectOptions = getIncorrectOptions(optionCount);
    const correctAnswer = isReverse ? correctKanaChar : correctRomajiChar;
    return [correctAnswer, ...incorrectOptions].sort(
      () => random.real(0, 1) - 0.5,
    );
  });

  const [wrongSelectedAnswers, setWrongSelectedAnswers] = useState<string[]>(
    [],
  );

  // Update shuffled variants when correct character or option count changes
  useEffect(() => {
    const incorrectOptions = getIncorrectOptions(optionCount);
    const correctAnswer = isReverse ? correctKanaChar : correctRomajiChar;
    setShuffledVariants(
      [correctAnswer, ...incorrectOptions].sort(
        () => random.real(0, 1) - 0.5,
      ),
    );
  }, [
    isReverse,
    currentItem,
    correctKanaChar,
    correctRomajiChar,
    optionCount,
    getIncorrectOptions,
  ]);

  useEffect(() => {
    isProcessingRef.current = false;
  }, [currentItem, wrongSelectedAnswers]);

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
        questionId: correctKanaChar,
        questionPrompt: isReverse ? correctRomajiChar : correctKanaChar,
        expectedAnswers: [
          isReverse ? correctKanaChar : correctRomajiChar,
        ],
        userAnswer: isReverse ? correctKanaChar : correctRomajiChar,
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
      correctRomajiChar,
      shuffledVariants,
      isReverse,
    ],
  );

  const handleWrongAnswer = useCallback(
    (selectedChar: string) => {
      setWrongSelectedAnswers([...wrongSelectedAnswers, selectedChar]);
      playErrorTwice();
      const currentChar = correctKanaChar;
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
        questionId: correctKanaChar,
        questionPrompt: isReverse ? correctRomajiChar : correctKanaChar,
        expectedAnswers: [
          isReverse ? correctKanaChar : correctRomajiChar,
        ],
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
      correctKanaChar,
      correctRomajiChar,
      incrementCharacterScore,
      incrementWrongAnswers,
      score,
      setScore,
      triggerCrazyMode,
      recordWrongAnswer,
      recordDifficultyWrong,
      incrementWrongStreak,
      logAttempt,
      shuffledVariants,
    ],
  );

  const handleOptionClick = useCallback(
    (selectedChar: string) => {
      if (isProcessingRef.current || !currentItem) return;
      isProcessingRef.current = true;

      const expectedAnswer = isReverse ? correctKanaChar : correctRomajiChar;

      if (selectedChar === expectedAnswer) {
        handleCorrectAnswer(correctKanaChar);
        const candidates = isReverse
          ? selectedKanaItems.map(item => item.romaji)
          : selectedKanaItems.map(item => item.kana);
        const currentVal = isReverse ? correctRomajiChar : correctKanaChar;
        const nextVal = adaptiveSelector.selectWeightedCharacter(
          candidates,
          currentVal,
        );
        adaptiveSelector.markCharacterSeen(nextVal);
        const nextItem =
          selectedKanaItems.find(item =>
            isReverse ? item.romaji === nextVal : item.kana === nextVal,
          ) ?? selectedKanaItems[0];
        setCurrentItem(nextItem);
      } else {
        handleWrongAnswer(selectedChar);
      }
    },
    [
      isReverse,
      currentItem,
      correctKanaChar,
      correctRomajiChar,
      handleCorrectAnswer,
      handleWrongAnswer,
      selectedKanaItems,
    ],
  );

  const displayChar = isReverse ? correctRomajiChar : correctKanaChar;
  if (!selectedKanaItems || selectedKanaItems.length === 0) {
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
