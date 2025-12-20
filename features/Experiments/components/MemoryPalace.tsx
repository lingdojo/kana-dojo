'use client';
import { useEffect, useState, useCallback } from 'react';
import { EyeOff, Play } from 'lucide-react';
import clsx from 'clsx';
import { useClick, useCorrect, useError } from '@/shared/hooks/useAudio';
import { hiraganaOnly } from '../data/kanaData';

type GamePhase = 'memorize' | 'recall' | 'result';

interface MemoryCard {
  id: number;
  kana: string;
  romanji: string;
  position: number;
  isRevealed: boolean;
  isMatched: boolean;
}

const GRID_SIZE = 8;
const MEMORIZE_TIME = 5000;

const MemoryPalace = () => {
  const [isMounted, setIsMounted] = useState(false);
  const [phase, setPhase] = useState<GamePhase>('memorize');
  const [cards, setCards] = useState<MemoryCard[]>([]);
  const [selectedCard, setSelectedCard] = useState<MemoryCard | null>(null);
  const [score, setScore] = useState(0);
  const [mistakes, setMistakes] = useState(0);
  const [round, setRound] = useState(1);
  const [timeLeft, setTimeLeft] = useState(MEMORIZE_TIME / 1000);
  const { playClick } = useClick();
  const { playCorrect } = useCorrect();
  const { playError } = useError();

  const generateCards = useCallback(() => {
    const shuffled = [...hiraganaOnly].sort(() => Math.random() - 0.5);
    const selected = shuffled.slice(0, GRID_SIZE / 2);
    const pairs: MemoryCard[] = [];
    selected.forEach((k, i) => {
      pairs.push({
        id: i * 2,
        kana: k.kana,
        romanji: k.romanji,
        position: 0,
        isRevealed: true,
        isMatched: false
      });
      pairs.push({
        id: i * 2 + 1,
        kana: k.kana,
        romanji: k.romanji,
        position: 0,
        isRevealed: true,
        isMatched: false
      });
    });
    const shuffledPairs = pairs.sort(() => Math.random() - 0.5);
    shuffledPairs.forEach((card, i) => {
      card.position = i;
    });
    return shuffledPairs;
  }, []);

  const startGame = useCallback(() => {
    playClick();
    setCards(generateCards());
    setPhase('memorize');
    setSelectedCard(null);
    setMistakes(0);
    setTimeLeft(MEMORIZE_TIME / 1000);
  }, [generateCards, playClick]);

  useEffect(() => {
    setIsMounted(true);
    startGame();
  }, []);

  useEffect(() => {
    if (phase !== 'memorize') return;
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          setPhase('recall');
          setCards(c => c.map(card => ({ ...card, isRevealed: false })));
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [phase]);

  const handleCardClick = useCallback(
    (card: MemoryCard) => {
      if (phase !== 'recall' || card.isMatched || card.isRevealed) return;
      playClick();
      if (!selectedCard) {
        setSelectedCard(card);
        setCards(c =>
          c.map(c => (c.id === card.id ? { ...c, isRevealed: true } : c))
        );
      } else {
        setCards(c =>
          c.map(c => (c.id === card.id ? { ...c, isRevealed: true } : c))
        );
        if (selectedCard.kana === card.kana && selectedCard.id !== card.id) {
          playCorrect();
          setScore(s => s + 1);
          setCards(c =>
            c.map(c =>
              c.kana === card.kana
                ? { ...c, isMatched: true, isRevealed: true }
                : c
            )
          );
          setSelectedCard(null);
          setTimeout(() => {
            setCards(current => {
              if (current.every(c => c.isMatched)) setPhase('result');
              return current;
            });
          }, 300);
        } else {
          playError();
          setMistakes(m => m + 1);
          setTimeout(() => {
            setCards(c =>
              c.map(c => (!c.isMatched ? { ...c, isRevealed: false } : c))
            );
            setSelectedCard(null);
          }, 800);
        }
      }
    },
    [phase, selectedCard, playClick, playCorrect, playError]
  );

  const nextRound = useCallback(() => {
    setRound(r => r + 1);
    startGame();
  }, [startGame]);

  if (!isMounted) return null;

  return (
    <div className='flex flex-col items-center justify-center gap-6 flex-1 min-h-[80vh]'>
      <div className='text-center mb-2'>
        <h1 className='text-2xl md:text-3xl text-[var(--main-color)]'>
          Memory Palace
        </h1>
        <p className='text-[var(--secondary-color)] mt-2'>
          {phase === 'memorize' && `Memorize the positions! ${timeLeft}s`}
          {phase === 'recall' && 'Find the matching pairs!'}
          {phase === 'result' && 'Round Complete!'}
        </p>
        <div className='flex gap-4 justify-center mt-2 text-sm'>
          <span className='text-[var(--secondary-color)]'>
            Round: <span className='text-[var(--main-color)]'>{round}</span>
          </span>
          <span className='text-[var(--secondary-color)]'>
            Score: <span className='text-[var(--main-color)]'>{score}</span>
          </span>
          <span className='text-[var(--secondary-color)]'>
            Mistakes: <span className='text-red-400'>{mistakes}</span>
          </span>
        </div>
      </div>
      <div className='grid grid-cols-4 gap-3 md:gap-4 max-w-md'>
        {cards
          .sort((a, b) => a.position - b.position)
          .map(card => (
            <button
              key={card.id}
              onClick={() => handleCardClick(card)}
              disabled={phase === 'memorize' || card.isMatched}
              className={clsx(
                'w-16 h-20 md:w-20 md:h-24 rounded-xl flex flex-col items-center justify-center transition-all duration-300 transform hover:cursor-pointer',
                card.isMatched && 'opacity-50 scale-95',
                card.isRevealed || card.isMatched
                  ? 'bg-[var(--card-color)] border-2 border-[var(--main-color)]'
                  : 'bg-[var(--border-color)] border-2 border-[var(--border-color)] hover:border-[var(--main-color)]'
              )}
            >
              {card.isRevealed || card.isMatched ? (
                <>
                  <span
                    lang='ja'
                    className='text-2xl md:text-3xl text-[var(--main-color)]'
                  >
                    {card.kana}
                  </span>
                  <span className='text-xs text-[var(--secondary-color)]'>
                    {card.romanji}
                  </span>
                </>
              ) : (
                <EyeOff size={24} className='text-[var(--secondary-color)]' />
              )}
            </button>
          ))}
      </div>
      {phase === 'result' && (
        <div className='mt-2 text-center'>
          <p className='text-xl text-[var(--main-color)] mb-4'>
            {mistakes === 0
              ? '🎉 Perfect!'
              : mistakes <= 2
                ? '👍 Great job!'
                : '💪 Keep practicing!'}
          </p>
          <button
            onClick={nextRound}
            className={clsx(
              'px-6 py-3 rounded-xl flex items-center gap-2 mx-auto bg-[var(--card-color)] border border-[var(--border-color)] text-[var(--main-color)] hover:cursor-pointer hover:border-[var(--main-color)] transition-all duration-250 active:scale-95'
            )}
          >
            <Play size={20} />
            Next Round
          </button>
        </div>
      )}
    </div>
  );
};

export default MemoryPalace;
