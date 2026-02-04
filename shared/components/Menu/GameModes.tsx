'use client';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useKanaSelection } from '@/features/Kana';
import { useKanjiSelection } from '@/features/Kanji';
import { useVocabSelection } from '@/features/Vocabulary';
import { getSelectionLabels } from '@/shared/lib/selectionFormatting';
import {
  MousePointerClick,
  Keyboard,
  Play,
  ArrowLeft,
  CheckCircle2,
  Zap,
} from 'lucide-react';
import clsx from 'clsx';
import { useClick } from '@/shared/hooks/useAudio';
import { Link, useRouter } from '@/core/i18n/routing';

import { ActionButton } from '@/shared/components/ui/ActionButton';

interface GameModesProps {
  isOpen: boolean;
  onClose: () => void;
  currentDojo: string;
  mode?: 'train' | 'blitz' | 'gauntlet';
}

const GameModes = ({
  isOpen,
  onClose,
  currentDojo,
  mode = 'train',
}: GameModesProps) => {
  const { playClick } = useClick();
  const router = useRouter();

  const durationStorageKey =
    currentDojo === 'kana'
      ? 'blitzDuration'
      : currentDojo === 'kanji'
        ? 'blitzKanjiDuration'
        : 'blitzVocabDuration';

  const DURATION_OPTIONS = [30, 60, 90, 120, 180];

  const [challengeDuration, setChallengeDuration] = useState<number>(60);

  const persistDuration = useCallback(
    (duration: number) => {
      if (typeof window === 'undefined') return;
      localStorage.setItem(durationStorageKey, duration.toString());
    },
    [durationStorageKey],
  );

  useEffect(() => {
    if (!isOpen || mode !== 'blitz') return;
    if (typeof window === 'undefined') return;

    const saved = localStorage.getItem(durationStorageKey);
    const parsed = saved ? parseInt(saved) : NaN;
    setChallengeDuration(Number.isFinite(parsed) ? parsed : 60);
  }, [isOpen, mode, durationStorageKey, persistDuration]);

  const kanaSelection = useKanaSelection();
  const kanjiSelection = useKanjiSelection();
  const vocabSelection = useVocabSelection();

  const selectedGameModeKana = kanaSelection.gameMode;
  const setSelectedGameModeKana = kanaSelection.setGameMode;
  const kanaGroupIndices = kanaSelection.selectedGroupIndices;

  const selectedGameModeKanji = kanjiSelection.gameMode;
  const setSelectedGameModeKanji = kanjiSelection.setGameMode;
  const selectedKanjiSets = kanjiSelection.selectedSets;

  const selectedGameModeVocab = vocabSelection.gameMode;
  const setSelectedGameModeVocab = vocabSelection.setGameMode;
  const selectedVocabSets = vocabSelection.selectedSets;

  // Get formatted selection labels
  const { full: kanaGroupNamesFull, compact: kanaGroupNamesCompact } =
    useMemo(() => {
      const type = currentDojo as 'kana' | 'kanji' | 'vocabulary';
      const selection =
        type === 'kana'
          ? kanaGroupIndices
          : type === 'kanji'
            ? selectedKanjiSets
            : selectedVocabSets;
      return getSelectionLabels(type, selection);
    }, [currentDojo, kanaGroupIndices, selectedKanjiSets, selectedVocabSets]);

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
        if (mode === 'blitz') {
          persistDuration(challengeDuration);
        }
        const route =
          mode === 'blitz'
            ? `/${currentDojo}/blitz`
            : mode === 'gauntlet'
              ? `/${currentDojo}/gauntlet`
              : `/${currentDojo}/train`;
        router.push(route);
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
  }, [
    isOpen,
    onClose,
    selectedGameMode,
    currentDojo,
    playClick,
    router,
    mode,
    challengeDuration,
    persistDuration,
  ]);

  const gameModes = [
    {
      id: 'Pick',
      title: 'Pick',
      description: 'Pick the correct answer from multiple options',
      icon: MousePointerClick,
    },
    {
      id: 'Type',
      title: 'Type',
      description: 'Type the correct answer',
      icon: Keyboard,
    },
  ];

  const dojoLabel =
    currentDojo === 'kana'
      ? 'Kana'
      : currentDojo === 'kanji'
        ? 'Kanji'
        : 'Vocabulary';

  if (!isOpen) return null;

  return (
    <div className='fixed inset-0 z-[70] bg-(--background-color)'>
      <div className='flex min-h-[100dvh] flex-col items-center justify-center p-4'>
        <div className='w-full max-w-lg space-y-4'>
          {/* Header */}
          <div className='space-y-3 text-center'>
            {mode === 'blitz' && (
              <Zap
                size={56}
                className='mx-auto text-(--secondary-color)'
              />
            )}
            {mode === 'train' && (
              <Play
                size={56}
                className='mx-auto text-(--secondary-color)'
              />
            )}
            <h1 className='text-2xl font-bold text-(--main-color)'>
              {dojoLabel}{' '}
              {mode === 'blitz'
                ? 'Blitz'
                : mode === 'gauntlet'
                  ? 'Gauntlet'
                  : 'Training'}
            </h1>
            <p className='text-(--secondary-color)'>
              {mode === 'blitz'
                ? 'Practice in a fast-paced, time-limited way'
                : 'Practice in a classic, endless way'}
            </p>
          </div>

          {/* Selected Levels */}
          <SelectedLevelsCard
            currentDojo={currentDojo}
            fullLabel={kanaGroupNamesFull}
            compactLabel={kanaGroupNamesCompact}
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
                    'w-full rounded-2xl p-5 text-left hover:cursor-pointer',
                    'flex items-center gap-4 border-2 bg-(--card-color)',
                    isSelected
                      ? 'border-(--main-color)'
                      : 'border-(--border-color)',
                  )}
                >
                  {/* Icon */}
                  <div
                    className={clsx(
                      'flex h-12 w-12 shrink-0 items-center justify-center rounded-xl',
                      isSelected
                        ? 'bg-(--main-color) text-(--background-color)'
                        : 'bg-(--border-color) text-(--muted-color)',
                    )}
                  >
                    <Icon
                      size={24}
                      /* className={cn(
                        selectedGameMode.toLowerCase() === 'pick'
                          ? 'fill-current'
                          : ''
                      )} */
                    />
                  </div>

                  {/* Content */}
                  <div className='min-w-0 flex-1'>
                    <h3
                      className={clsx(
                        'text-lg font-medium',
                        'text-(--main-color)',
                      )}
                    >
                      {mode.title}
                    </h3>
                    <p className='mt-0.5 text-sm text-(--secondary-color)'>
                      {mode.description}
                    </p>
                  </div>

                  {/* Selection indicator */}
                  <div
                    className={clsx(
                      'flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2',
                      isSelected
                        ? 'border-(--secondary-color) bg-(--secondary-color)'
                        : 'border-(--border-color)',
                    )}
                  >
                    {isSelected && (
                      <svg
                        className='h-3 w-3 text-(--background-color)'
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

          {mode === 'blitz' && (
            <div className='space-y-3 rounded-lg bg-(--card-color) p-4'>
              <p className='text-sm font-medium text-(--secondary-color)'>
                Duration:
              </p>
              <div className='flex flex-wrap justify-center gap-2'>
                {DURATION_OPTIONS.map(duration => (
                  <ActionButton
                    key={duration}
                    onClick={() => {
                      playClick();
                      setChallengeDuration(duration);
                      persistDuration(duration);
                    }}
                    colorScheme={
                      challengeDuration === duration ? 'main' : 'secondary'
                    }
                    borderColorScheme={
                      challengeDuration === duration ? 'main' : 'secondary'
                    }
                    borderBottomThickness={8}
                    borderRadius='3xl'
                    className={clsx(
                      'w-auto px-4 py-2',
                      challengeDuration !== duration && 'opacity-60',
                    )}
                  >
                    {duration < 60 ? `${duration}s` : `${duration / 60}m`}
                  </ActionButton>
                ))}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className='mx-auto flex w-full max-w-4xl flex-row items-center justify-center gap-2 md:gap-4'>
            <button
              className={clsx(
                'flex w-1/2 flex-row items-center justify-center gap-2 px-2 py-3 sm:px-6',
                'bg-(--secondary-color) text-(--background-color)',
                'rounded-3xl transition-colors duration-200',
                'border-b-10 border-(--secondary-color-accent)',
                'hover:cursor-pointer',
              )}
              onClick={() => {
                playClick();
                onClose();
              }}
            >
              <ArrowLeft size={20} />
              <span className='whitespace-nowrap'>Back</span>
            </button>

            {/* Start Button */}
            <Link
              href={
                mode === 'blitz'
                  ? `/${currentDojo}/blitz`
                  : mode === 'gauntlet'
                    ? `/${currentDojo}/gauntlet`
                    : `/${currentDojo}/train`
              }
              className='w-1/2'
              onClick={e => {
                if (!selectedGameMode) {
                  e.preventDefault();
                  return;
                }
                playClick();
                if (mode === 'blitz') {
                  persistDuration(challengeDuration);
                }
              }}
            >
              <button
                disabled={!selectedGameMode}
                className={clsx(
                  'flex w-full flex-row items-center justify-center gap-2 px-2 py-3 sm:px-6',
                  'rounded-3xl transition-colors duration-200',
                  'border-b-10',
                  'hover:cursor-pointer',
                  selectedGameMode
                    ? 'border-(--main-color-accent) bg-(--main-color) text-(--background-color)'
                    : 'cursor-not-allowed bg-(--card-color) text-(--border-color)',
                )}
              >
                <Play
                  className={clsx(selectedGameMode && 'fill-current')}
                  size={20}
                />
                <span className='whitespace-nowrap'>
                  {mode === 'blitz'
                    ? 'Start Blitz'
                    : mode === 'gauntlet'
                      ? 'Start Gauntlet'
                      : 'Start Training'}
                </span>
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
  fullLabel,
  compactLabel,
}: {
  currentDojo: string;
  fullLabel: string;
  compactLabel: string;
}) {
  const isKana = currentDojo === 'kana';

  return (
    <div className='rounded-xl bg-(--card-color) p-4'>
      <div className='flex flex-col gap-2'>
        <div className='flex flex-row items-center gap-2'>
          <CheckCircle2
            className='shrink-0 text-(--secondary-color)'
            size={20}
          />
          <span className='text-sm'>
            {isKana ? 'Selected Groups:' : 'Selected Levels:'}
          </span>
        </div>
        <span className='text-sm break-words text-(--secondary-color) md:hidden'>
          {compactLabel}
        </span>
        <span className='hidden text-sm break-words text-(--secondary-color) md:inline'>
          {fullLabel}
        </span>
      </div>
    </div>
  );
}

export default GameModes;
