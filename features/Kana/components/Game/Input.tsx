'use client';
import { useState, useEffect, useRef } from 'react';
import { kana } from '@/features/Kana/data/kana';
import useKanaStore from '@/features/Kana/store/useKanaStore';
import { CircleCheck, CircleX, CircleArrowRight } from 'lucide-react';
import { Random } from 'random-js';
import clsx from 'clsx';
import { useClick, useCorrect, useError } from '@/shared/hooks/useAudio';
import GameIntel from '@/shared/components/Game/GameIntel';
import { buttonBorderStyles } from '@/shared/lib/styles';
import { useStopwatch } from 'react-timer-hook';
import useStats from '@/shared/hooks/useStats';
import useStatsStore from '@/features/Progress/store/useStatsStore';
import Stars from '@/shared/components/Game/Stars';
import { useCrazyModeTrigger } from '@/features/CrazyMode/hooks/useCrazyModeTrigger';
import { getGlobalAdaptiveSelector } from '@/shared/lib/adaptiveSelection';

const random = new Random();

// Get the global adaptive selector for weighted character selection
const adaptiveSelector = getGlobalAdaptiveSelector();

interface InputGameProps {
  isHidden: boolean;
  isReverse?: boolean;
}

const InputGame = ({ isHidden, isReverse = false }: InputGameProps) => {
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

  const kanaGroupIndices = useKanaStore(state => state.kanaGroupIndices);

  const selectedKana = kanaGroupIndices.map(i => kana[i].kana).flat();
  const selectedRomaji = kanaGroupIndices.map(i => kana[i].romanji).flat();

  // Create mapping pairs based on mode
  const selectedPairs = Object.fromEntries(
    isReverse
      ? selectedRomaji.map((key, i) => [key, selectedKana[i]])
      : selectedKana.map((key, i) => [key, selectedRomaji[i]])
  );

  // State for characters - uses weighted selection for adaptive learning
  const [correctChar, setCorrectChar] = useState(() => {
    if (isReverse) {
      if (selectedRomaji.length === 0) return '';
      const selected = adaptiveSelector.selectWeightedCharacter(selectedRomaji);
      adaptiveSelector.markCharacterSeen(selected);
      return selected;
    } else {
      if (selectedKana.length === 0) return '';
      const selected = adaptiveSelector.selectWeightedCharacter(selectedKana);
      adaptiveSelector.markCharacterSeen(selected);
      return selected;
    }
  });

  const targetChar = selectedPairs[correctChar];

  const [feedback, setFeedback] = useState(<>{'feeback ~'}</>);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const skipKey = isReverse ? ' ' : '/';
      if (event.key === skipKey) {
        buttonRef.current?.click();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isReverse]);

  useEffect(() => {
    if (isHidden) speedStopwatch.pause();
  }, [isHidden]);

  if (
    (isReverse && (!selectedRomaji || selectedRomaji.length === 0)) ||
    (!isReverse && (!selectedKana || selectedKana.length === 0))
  ) {
    return null;
  }

  const handleEnter = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && inputValue.trim().length) {
      const trimmedInput = inputValue.trim();
      const isCorrect = isReverse
        ? trimmedInput === targetChar
        : trimmedInput.toLowerCase() === targetChar ||
          trimmedInput === correctChar;

      if (isCorrect) {
        handleCorrectAnswer();
      } else {
        handleWrongAnswer();
      }
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

    setInputValue('');
    generateNewCharacter();
    setFeedback(
      <>
        <span>{`${correctChar} = ${targetChar} `}</span>
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
        <span>{`${correctChar} ≠ ${inputValue} `}</span>
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
    const sourceArray = isReverse ? selectedRomaji : selectedKana;
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
    setFeedback(<>{`skipped ~ ${correctChar} = ${targetChar}`}</>);
  };

  const gameMode = isReverse ? 'reverse input' : 'input';

  return (
    <div
      className={clsx(
        'flex flex-col gap-4 sm:gap-10 items-center w-full sm:w-4/5',
        isHidden ? 'hidden' : ''
      )}
    >
      <GameIntel gameMode={gameMode} feedback={feedback} />
      <div className='flex flex-row items-center gap-1'>
        <p className='text-8xl sm:text-9xl font-medium'>{correctChar}</p>

        {/* {!isReverse && (
          <SSRAudioButton
            text={correctChar}
            variant='icon-only'
            size='sm'
            className='bg-[var(--card-color)] text-[var(--secondary-color)]'
          />
        )}
 */}
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
      />
      <button
        ref={buttonRef}
        className={clsx(
          'text-xl font-medium py-4 px-16 rounded-3xl',
          'flex flex-row items-end gap-2',
          buttonBorderStyles,
          'active:scale-95 md:active:scale-98 active:duration-200',
          'text-[var(--secondary-color)]',
          'border-b-4 border-[var(--border-color)] hover:border-[var(--secondary-color)]/80'
        )}
        onClick={handleSkip}
      >
        <span>skip</span>
        <CircleArrowRight />
      </button>
      <Stars />
    </div>
  );
};

export default InputGame;
