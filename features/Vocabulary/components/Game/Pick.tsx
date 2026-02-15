'use client';
import clsx from 'clsx';
import { useState, useEffect, useRef, useMemo, memo } from 'react';
import { CircleCheck, CircleX } from 'lucide-react';
import { Random } from 'random-js';
import { IVocabObj } from '@/features/Vocabulary/store/useVocabStore';
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

const random = new Random();

// Get the global adaptive selector for weighted character selection
const adaptiveSelector = getGlobalAdaptiveSelector();

// Helper function to check if a word contains kanji characters
// Kanji are in the CJK Unified Ideographs range (U+4E00 to U+9FAF)
const containsKanji = (text: string): boolean => {
  return /[\u4E00-\u9FAF]/.test(text);
};

// Memoized option button component to prevent unnecessary re-renders
interface OptionButtonProps {
  option: string;
  index: number;
  isWrong: boolean;
  isReverse: boolean;
  quizType: 'meaning' | 'reading';
  wordObjMap: Map<string, IVocabObj>;
  onClick: (option: string) => void;
  buttonRef?: (elem: HTMLButtonElement | null) => void;
}

const OptionButton = memo(
  ({
    option,
    index,
    isWrong,
    isReverse,
    quizType,
    wordObjMap,
    onClick,
    buttonRef,
  }: OptionButtonProps) => {
    const optionLang =
      quizType === 'reading' ? 'ja' : isReverse ? 'ja' : undefined;

    return (
      <button
        ref={buttonRef}
        type='button'
        disabled={isWrong}
        className={clsx(
          'flex w-full flex-row items-center justify-start gap-1.5 rounded-xl py-5 pl-8 md:w-1/2',
          buttonBorderStyles,
          'active:scale-95 active:duration-200 md:active:scale-98',
          'text-(--border-color)',
          'border-b-4',
          isReverse ? 'text-4xl' : 'text-3xl',
          isWrong &&
            'border-(--border-color) hover:bg-(--card-color)',
          !isWrong &&
            'border-(--secondary-color)/50 text-(--secondary-color) hover:border-(--secondary-color)',
        )}
        onClick={() => onClick(option)}
        lang={optionLang}
      >
        <span className='flex-1 text-left'>
          {isReverse || quizType === 'meaning' ? (
            <FuriganaText
              text={option}
              reading={isReverse ? wordObjMap.get(option)?.reading : undefined}
            />
          ) : (
            <span>{option}</span>
          )}
        </span>
        <span
          className={clsx(
            'mr-4 hidden rounded-full bg-(--border-color) px-1 text-xs lg:inline',
            isWrong
              ? 'text-(--border-color)'
              : 'text-(--secondary-color)',
          )}
        >
          {index + 1}
        </span>
      </button>
    );
  },
);

OptionButton.displayName = 'OptionButton';

interface VocabPickGameProps {
  selectedWordObjs: IVocabObj[];
  isHidden: boolean;
}

const VocabPickGame = ({ selectedWordObjs, isHidden }: VocabPickGameProps) => {
  const hasWords = !!selectedWordObjs && selectedWordObjs.length > 0;
  const { isReverse, decideNextMode, recordWrongAnswer } =
    useSmartReverseMode();
  const {
    score,
    setScore,
    incrementVocabularyCorrect,
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
      incrementVocabularyCorrect: state.incrementVocabularyCorrect,
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

  // Quiz type: 'meaning' or 'reading'
  const [quizType, setQuizType] = useState<'meaning' | 'reading'>('meaning');

  // State management - correctChar always stores the word (Japanese)
  // This ensures consistency when isReverse changes dynamically
  const [correctChar, setCorrectChar] = useState(() => {
    if (!hasWords) return '';
    const sourceArray = selectedWordObjs.map(obj => obj.word);
    const selected = adaptiveSelector.selectWeightedCharacter(sourceArray);
    adaptiveSelector.markCharacterSeen(selected);
    return selected;
  });

  // Create Map for O(1) lookups instead of O(n) find() calls
  const wordObjMap = useMemo(
    () => new Map(selectedWordObjs.map(obj => [obj.word, obj])),
    [selectedWordObjs],
  );

  // Find the correct object - O(1) lookup
  const correctWordObj = wordObjMap.get(correctChar);

  const [currentWordObj, setCurrentWordObj] = useState<IVocabObj>(
    correctWordObj as IVocabObj,
  );

  // What to display as the question
  const displayChar = isReverse ? correctWordObj?.meanings[0] : correctChar;

  // Determine target (correct answer) based on quiz type and mode
  const targetChar =
    quizType === 'meaning'
      ? isReverse
        ? correctWordObj?.word // reverse: show meaning, answer is word
        : correctWordObj?.meanings[0] // normal: show word, answer is meaning
      : correctWordObj?.reading; // reading quiz: answer is always reading

  // Get incorrect options based on mode and quiz type
  const getIncorrectOptions = (): string[] => {
    // Filter out the current word
    const incorrectWordObjs = selectedWordObjs.filter(
      obj => obj.word !== correctChar,
    );

    if (quizType === 'meaning') {
      return incorrectWordObjs
        .map(obj => (isReverse ? obj.word : obj.meanings[0]))
        .sort(() => random.real(0, 1) - 0.5)
        .slice(0, 2);
    } else if (quizType === 'reading') {
      return incorrectWordObjs
        .map(obj => obj.reading)
        .sort(() => random.real(0, 1) - 0.5)
        .slice(0, 2);
    }
    return []; // Fallback in case quizType is neither 'meaning' nor 'reading'
  };

  const randomIncorrectOptions = getIncorrectOptions();

  const [shuffledOptions, setShuffledOptions] = useState(
    [targetChar ?? '', ...randomIncorrectOptions].sort(
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
    if (!hasWords) return;
    setShuffledOptions(
      [targetChar ?? '', ...getIncorrectOptions()].sort(
        () => random.real(0, 1) - 0.5,
      ) as string[],
    );
    setWrongSelectedAnswers([]);
  }, [correctChar, hasWords, isReverse, quizType]);

  const buttonRefs = useRef<(HTMLButtonElement | null)[]>([]);

  useEffect(() => {
    if (!hasWords) return;
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
  }, [hasWords, shuffledOptions.length]);

  useEffect(() => {
    if (isHidden) speedStopwatch.pause();
  }, [isHidden]);

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
      setCurrentWordObj(correctWordObj as IVocabObj);
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
    addCharacterToHistory(correctChar);
    incrementCharacterScore(correctChar, 'correct');
    incrementCorrectAnswers();
    setScore(score + 1);
    setWrongSelectedAnswers([]);
    triggerCrazyMode();
    // Update adaptive weight system - reduces probability of mastered words
    adaptiveSelector.updateCharacterWeight(correctChar, true);
    // Smart algorithm decides next mode based on performance
    decideNextMode();
    // Track vocabulary correct for achievements
    incrementVocabularyCorrect();
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
    // Update adaptive weight system - increases probability of difficult words
    adaptiveSelector.updateCharacterWeight(correctChar, false);
    // Reset consecutive streak without changing mode (avoids rerolling the question)
    recordWrongAnswer();
    // Track wrong streak for achievements (Requirement 10.2)
    incrementWrongStreak();
  };

  const generateNewCharacter = () => {
    // Always select from words - the correctWordObj lookup will handle the mode
    const sourceArray = selectedWordObjs.map(obj => obj.word);

    // Use weighted selection - prioritizes words user struggles with
    const newChar = adaptiveSelector.selectWeightedCharacter(
      sourceArray,
      // Exclude current word to avoid repetition
      correctWordObj?.word,
    );
    adaptiveSelector.markCharacterSeen(newChar);
    setCorrectChar(newChar);

    // Get the actual word for the new character to check if it contains kanji
    const newWordObj = wordObjMap.get(newChar);
    const wordToCheck = newWordObj?.word ?? '';

    // Only toggle to reading quiz if the word contains kanji
    // Pure kana words skip reading quiz since reading === word
    if (containsKanji(wordToCheck)) {
      setQuizType(prev => (prev === 'meaning' ? 'reading' : 'meaning'));
    } else {
      // For pure kana words, always use meaning quiz
      setQuizType('meaning');
    }
  };

  const gameMode = 'pick';
  const displayCharLang =
    isReverse && quizType === 'meaning' ? undefined : 'ja';
  const optionLang =
    quizType === 'reading' ? 'ja' : isReverse ? 'ja' : undefined;
  const textSize = isReverse ? 'text-4xl md:text-7xl' : 'text-6xl md:text-9xl';

  if (!hasWords) {
    return null;
  }

  return (
    <div
      className={clsx(
        'flex w-full flex-col items-center gap-6 sm:w-4/5 sm:gap-10',
        isHidden ? 'hidden' : '',
      )}
    >
      {/* <GameIntel gameMode={gameMode} /> */}
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
            <span className='mb-2 text-sm text-(--secondary-color)'>
              {quizType === 'meaning'
                ? isReverse
                  ? 'What is the word?' // reverse: given meaning, find word
                  : 'What is the meaning?' // normal: given word, find meaning
                : 'What is the reading?'}
            </span>
            <div className='flex flex-row items-center justify-center gap-1'>
              <FuriganaText
                text={displayChar ?? ''}
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
            </div>
          </div>

          <div
            className={clsx(
              'flex w-full flex-col items-center gap-6',
              // 'lg:flex-row'
            )}
          >
            {shuffledOptions.map((option, i) => (
              <OptionButton
                key={`${correctChar}-${option}-${i}`}
                option={option}
                index={i}
                isWrong={wrongSelectedAnswers.includes(option)}
                isReverse={isReverse}
                quizType={quizType}
                wordObjMap={wordObjMap}
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

export default VocabPickGame;
