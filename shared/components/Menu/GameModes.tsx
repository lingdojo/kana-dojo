'use client';
import { useEffect, useMemo } from 'react';
import useKanaStore from '@/features/Kana/store/useKanaStore';
import useKanjiStore from '@/features/Kanji/store/useKanjiStore';
import useVocabStore from '@/features/Vocabulary/store/useVocabStore';
import { kana } from '@/features/Kana/data/kana';
import {
  MousePointerClick,
  Keyboard,
  Play,
  ArrowLeft,
  CheckCircle2
} from 'lucide-react';
import clsx from 'clsx';
import { useClick } from '@/shared/hooks/useAudio';
import { useShallow } from 'zustand/react/shallow';
import { Link, useRouter } from '@/core/i18n/routing';

interface GameModesProps {
  isOpen: boolean;
  onClose: () => void;
  currentDojo: string;
}

const GameModes = ({ isOpen, onClose, currentDojo }: GameModesProps) => {
  const { playClick } = useClick();
  const router = useRouter();

  const { selectedGameModeKana, setSelectedGameModeKana, kanaGroupIndices } =
    useKanaStore(
      useShallow(state => ({
        selectedGameModeKana: state.selectedGameModeKana,
        setSelectedGameModeKana: state.setSelectedGameModeKana,
        kanaGroupIndices: state.kanaGroupIndices
      }))
    );

  const { selectedGameModeKanji, setSelectedGameModeKanji, selectedKanjiSets } =
    useKanjiStore(
      useShallow(state => ({
        selectedGameModeKanji: state.selectedGameModeKanji,
        setSelectedGameModeKanji: state.setSelectedGameModeKanji,
        selectedKanjiSets: state.selectedKanjiSets
      }))
    );

  const { selectedGameModeVocab, setSelectedGameModeVocab, selectedVocabSets } =
    useVocabStore(
      useShallow(state => ({
        selectedGameModeVocab: state.selectedGameModeVocab,
        setSelectedGameModeVocab: state.setSelectedGameModeVocab,
        selectedVocabSets: state.selectedVocabSets
      }))
    );

  // Convert kana indices to display names
  const { kanaGroupNamesFull, kanaGroupNamesCompact } = useMemo(() => {
    const full: string[] = [];
    const compact: string[] = [];

    kanaGroupIndices.forEach(i => {
      const group = kana[i];
      if (!group) {
        const fallback = `Group ${i + 1}`;
        full.push(fallback);
        compact.push(fallback);
        return;
      }

      const firstKana = group.kana[0];
      const isChallenge = group.groupName.startsWith('challenge.');

      full.push(
        isChallenge ? `${firstKana}-group (challenge)` : `${firstKana}-group`
      );
      compact.push(firstKana);
    });

    return { kanaGroupNamesFull: full, kanaGroupNamesCompact: compact };
  }, [kanaGroupIndices]);

  const selectedGameMode =
    currentDojo === 'kana'
      ? selectedGameModeKana
      : currentDojo === 'kanji'
      ? selectedGameModeKanji
      : currentDojo === 'vocabulary'
      ? selectedGameModeVocab
      : '';

  const setSelectedGameMode =
    currentDojo === 'kana'
      ? setSelectedGameModeKana
      : currentDojo === 'kanji'
      ? setSelectedGameModeKanji
      : currentDojo === 'vocabulary'
      ? setSelectedGameModeVocab
      : () => {};

  // Keyboard shortcuts: Escape to close, Enter to start training
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
      if (e.key === 'Enter' && selectedGameMode) {
        playClick();
        router.push(`/${currentDojo}/train`);
      }
    };

    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose, selectedGameMode, currentDojo, playClick, router]);

  const gameModes = [
    {
      id: 'Pick',
      title: 'Pick',
      description: 'Pick the correct answer from multiple options',
      icon: MousePointerClick
    },
    {
      id: 'Type',
      title: 'Type',
      description: 'Type the correct answer',
      icon: Keyboard
    }
  ];

  const dojoLabel =
    currentDojo === 'kana'
      ? 'Kana'
      : currentDojo === 'kanji'
      ? 'Kanji'
      : 'Vocabulary';

  if (!isOpen) return null;

  return (
    <div className='fixed inset-0 z-[70] bg-[var(--background-color)]'>
      <div className='min-h-[100dvh] flex flex-col items-center justify-center p-4'>
        <div className='max-w-lg w-full space-y-4'>
          {/* Header */}
          <div className='text-center space-y-3'>
            <Play size={56} className='mx-auto text-[var(--main-color)]' />
            <h1 className='text-2xl font-bold text-[var(--secondary-color)]'>
              {dojoLabel} Training
            </h1>
            <p className='text-[var(--muted-color)]'>
              Choose your training mode
            </p>
          </div>

          {/* Selected Levels */}
          <SelectedLevelsCard
            currentDojo={currentDojo}
            kanaGroupNamesCompact={kanaGroupNamesCompact}
            kanaGroupNamesFull={kanaGroupNamesFull}
            selectedKanjiSets={selectedKanjiSets}
            selectedVocabSets={selectedVocabSets}
          />

          {/* Game Mode Cards */}
          <div className='space-y-3'>
            {gameModes.map(mode => {
              const isSelected = mode.id === selectedGameMode;
              const Icon = mode.icon;

              return (
                <button
                  key={mode.id}
                  onClick={() => {
                    playClick();
                    setSelectedGameMode(mode.id);
                  }}
                  className={clsx(
                    'w-full p-5 rounded-xl text-left hover:cursor-pointer',
                    'border-2 flex items-center gap-4 bg-[var(--card-color)]',
                    isSelected
                      ? 'border-[var(--main-color)] '
                      : 'border-[var(--border-color)]  '
                  )}
                >
                  {/* Icon */}
                  <div
                    className={clsx(
                      'w-12 h-12 rounded-xl flex items-center justify-center shrink-0',
                      isSelected
                        ? 'bg-[var(--main-color)] text-[var(--background-color)]'
                        : 'bg-[var(--border-color)] text-[var(--muted-color)]'
                    )}
                  >
                    <Icon size={24} />
                  </div>

                  {/* Content */}
                  <div className='flex-1 min-w-0'>
                    <h3
                      className={clsx(
                        'text-lg font-medium',
                        'text-[var(--main-color)]'
                      )}
                    >
                      {mode.title}
                    </h3>
                    <p className='text-sm text-[var(--secondary-color)] mt-0.5'>
                      {mode.description}
                    </p>
                  </div>

                  {/* Selection indicator */}
                  <div
                    className={clsx(
                      'w-5 h-5 rounded-full border-2 shrink-0 flex items-center justify-center',
                      isSelected
                        ? 'border-[var(--secondary-color)] bg-[var(--secondary-color)]'
                        : 'border-[var(--border-color)]'
                    )}
                  >
                    {isSelected && (
                      <svg
                        className='w-3 h-3 text-[var(--background-color)]'
                        fill='none'
                        viewBox='0 0 24 24'
                        stroke='currentColor'
                      >
                        <path
                          strokeLinecap='round'
                          strokeLinejoin='round'
                          strokeWidth={3}
                          d='M5 13l4 4L19 7'
                        />
                      </svg>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Action Buttons */}
          <div className='flex flex-row items-center justify-center gap-2 md:gap-4 w-full max-w-4xl mx-auto'>
            <button
              className={clsx(
                'w-1/2 h-12 px-2 sm:px-6 flex flex-row justify-center items-center gap-2',
                'bg-[var(--secondary-color)] text-[var(--background-color)]',
                'rounded-2xl transition-colors duration-200',
                'border-b-6 border-[var(--secondary-color-accent)] shadow-sm',
                'hover:cursor-pointer'
              )}
              onClick={() => {
                playClick();
                onClose();
              }}
            >
              <ArrowLeft size={20} />
              <span className='whitespace-nowrap'>Back</span>
            </button>

            {/* Start Training Button */}
            <Link
              href={`/${currentDojo}/train`}
              className='w-1/2'
              onClick={e => {
                if (!selectedGameMode) {
                  e.preventDefault();
                  return;
                }
                playClick();
              }}
            >
              <button
                disabled={!selectedGameMode}
                className={clsx(
                  'w-full h-12 px-2 sm:px-6 flex flex-row justify-center items-center gap-2',
                  'rounded-2xl transition-colors duration-200',
                  'font-medium border-b-6 shadow-sm',
                  'hover:cursor-pointer',
                  selectedGameMode
                    ? 'bg-[var(--main-color)] text-[var(--background-color)] border-[var(--main-color-accent)]'
                    : 'bg-[var(--card-color)] text-[var(--border-color)] cursor-not-allowed'
                )}
              >
                <span className='whitespace-nowrap'>Start Training</span>
                <Play
                  className={clsx(selectedGameMode && 'fill-current')}
                  size={20}
                />
              </button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

// Sub-component for displaying selected levels/groups
function SelectedLevelsCard({
  currentDojo,
  kanaGroupNamesCompact,
  kanaGroupNamesFull,
  selectedKanjiSets,
  selectedVocabSets
}: {
  currentDojo: string;
  kanaGroupNamesCompact: string[];
  kanaGroupNamesFull: string[];
  selectedKanjiSets: string[];
  selectedVocabSets: string[];
}) {
  const isKana = currentDojo === 'kana';
  const isKanji = currentDojo === 'kanji';

  const formatCompact = () => {
    if (isKana) {
      return kanaGroupNamesCompact.length > 0
        ? kanaGroupNamesCompact.join(', ')
        : 'None';
    }
    const sets = isKanji ? selectedKanjiSets : selectedVocabSets;
    return sets.length > 0
      ? sets
          .sort((a, b) => {
            const numA = parseInt(a.replace(/\D/g, '')) || 0;
            const numB = parseInt(b.replace(/\D/g, '')) || 0;
            return numA - numB;
          })
          .map(set => set.replace('Set ', ''))
          .join(', ')
      : 'None';
  };

  const formatFull = () => {
    if (isKana) {
      return kanaGroupNamesFull.length > 0
        ? kanaGroupNamesFull.join(', ')
        : 'None';
    }
    const sets = isKanji ? selectedKanjiSets : selectedVocabSets;
    return sets.length > 0
      ? sets
          .sort((a, b) => {
            const numA = parseInt(a.replace(/\D/g, '')) || 0;
            const numB = parseInt(b.replace(/\D/g, '')) || 0;
            return numA - numB;
          })
          .map(set => `Level ${set.replace('Set ', '')}`)
          .join(', ')
      : 'None';
  };

  return (
    <div className='bg-[var(--card-color)] rounded-lg p-4'>
      <div className='flex flex-col gap-2'>
        <div className='flex flex-row items-center gap-2'>
          <CheckCircle2
            className='text-[var(--secondary-color)] shrink-0'
            size={20}
          />
          <span className='text-sm'>
            {isKana ? 'Selected Groups:' : 'Selected Levels:'}
          </span>
        </div>
        <span className='text-[var(--secondary-color)] text-sm break-words md:hidden'>
          {formatCompact()}
        </span>
        <span className='text-[var(--secondary-color)] text-sm break-words hidden md:inline'>
          {formatFull()}
        </span>
      </div>
    </div>
  );
}

export default GameModes;
