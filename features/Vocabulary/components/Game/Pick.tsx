'use client';
import clsx from 'clsx';
import { useState, useEffect, useRef } from 'react';
import { CircleCheck, CircleX } from 'lucide-react';
import { Random } from 'random-js';
import { IVocabObj } from '@/features/Vocabulary/store/useVocabStore';
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

// Helper function to check if a word contains kanji characters
// Kanji are in the CJK Unified Ideographs range (U+4E00 to U+9FAF)
const containsKanji = (text: string): boolean => {
  return /[\u4E00-\u9FAF]/.test(text);
};

interface VocabPickGameProps {
  selectedWordObjs: IVocabObj[];
  isHidden: boolean;
}

const VocabPickGame = ({ selectedWordObjs, isHidden }: VocabPickGameProps) => {
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

  // Quiz type: 'meaning' or 'reading'
  const [quizType, setQuizType] = useState<'meaning' | 'reading'>('meaning');

  // State management - correctChar always stores the word (Japanese)
  // This ensures consistency when isReverse changes dynamically
  const [correctChar, setCorrectChar] = useState(() => {
    if (selectedWordObjs.length === 0) return '';
    const sourceArray = selectedWordObjs.map(obj => obj.word);
    const selected = adaptiveSelector.selectWeightedCharacter(sourceArray);
    adaptiveSelector.markCharacterSeen(selected);
    return selected;
  });

  // Find the correct object - always by word since correctChar stores the word
  const correctWordObj = selectedWordObjs.find(obj => obj.word === correctChar);

  const [currentWordObj, setCurrentWordObj] = useState<IVocabObj>(
    correctWordObj as IVocabObj
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
      obj => obj.word !== correctChar
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
      [targetChar ?? '', ...getIncorrectOptions()].sort(
        () => random.real(0, 1) - 0.5
      ) as string[]
    );
    setWrongSelectedAnswers([]);
  }, [correctChar, isReverse, quizType]);

  if (!selectedWordObjs || selectedWordObjs.length === 0) {
    return null;
  }

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
      setCurrentWordObj(correctWordObj as IVocabObj);
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
  };

  const generateNewCharacter = () => {
    // Always select from words - the correctWordObj lookup will handle the mode
    const sourceArray = selectedWordObjs.map(obj => obj.word);

    // Use weighted selection - prioritizes words user struggles with
    const newChar = adaptiveSelector.selectWeightedCharacter(
      sourceArray,
      // Exclude current word to avoid repetition
      correctWordObj?.word
    );
    adaptiveSelector.markCharacterSeen(newChar);
    setCorrectChar(newChar);

    // Get the actual word for the new character to check if it contains kanji
    const newWordObj = selectedWordObjs.find(obj => obj.word === newChar);
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

  return (
    <div
      className={clsx(
        'flex flex-col gap-6 sm:gap-10 items-center w-full sm:w-4/5',
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
                  ? 'What is the word?' // reverse: given meaning, find word
                  : 'What is the meaning?' // normal: given word, find meaning
                : 'What is the reading?'}
            </span>
            <div className='flex flex-row justify-center items-center gap-1'>
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
                  className='bg-[var(--card-color)] text-[var(--secondary-color)]'
                />
              )}
            </div>
          </div>

          <div
            className={clsx(
              'flex flex-col w-full gap-6 items-center '
              // 'lg:flex-row'
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
                  'py-5 pl-8 rounded-xl w-full md:w-1/2 flex flex-row justify-start items-center gap-1.5',
                  buttonBorderStyles,
                  'active:scale-95 md:active:scale-98 active:duration-200',
                  'text-[var(--border-color)]',
                  ' border-b-4',

                  isReverse ? 'text-4xl' : 'text-3xl',
                  wrongSelectedAnswers.includes(option) &&
                    'hover:bg-[var(--card-color)] border-[var(--border-color)]',
                  !wrongSelectedAnswers.includes(option) &&
                    'text-[var(--secondary-color)] border-[var(--secondary-color)]/50 hover:border-[var(--secondary-color)]'
                )}
                onClick={() => handleOptionClick(option)}
                lang={optionLang}
              >
                {/* Only use FuriganaText when we need furigana (reverse mode or meaning quiz) */}
                {isReverse || quizType === 'meaning' ? (
                  <FuriganaText
                    text={option}
                    reading={
                      isReverse
                        ? selectedWordObjs.find(obj => obj.word === option)
                            ?.reading
                        : undefined
                    }
                  />
                ) : (
                  <span>{option}</span>
                )}
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

export default VocabPickGame;
