'use client';
import { useCallback, useEffect, useMemo, useState } from 'react';
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
import { formatLevelsAsRanges } from '@/shared/lib/helperFunctions';
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
  mode = 'train'
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
    [durationStorageKey]
  );

  useEffect(() => {
    if (!isOpen || mode !== 'blitz') return;
    if (typeof window === 'undefined') return;

    const saved = localStorage.getItem(durationStorageKey);
    const parsed = saved ? parseInt(saved) : NaN;
    setChallengeDuration(Number.isFinite(parsed) ? parsed : 60);
  }, [isOpen, mode, durationStorageKey, persistDuration]);

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
    const selected = new Set(kanaGroupIndices);

    // Parent group definitions (for "All Hiragana", "All Katakana", "All Challenge")
    const parentGroupDefs: Array<{
      label: string;
      start: number;
      end: number;
    }> = [
      { label: 'All Hiragana', start: 0, end: 26 },
      { label: 'All Katakana', start: 26, end: 60 },
      { label: 'All Challenge', start: 60, end: 69 }
    ];

    const subgroupDefs: Array<{
      label: string;
      start: number;
      end: number;
      isChallenge: boolean;
    }> = [
      { label: 'Hiragana Base', start: 0, end: 10, isChallenge: false },
      { label: 'Hiragana Dakuon', start: 10, end: 15, isChallenge: false },
      { label: 'Hiragana Yoon', start: 15, end: 26, isChallenge: false },
      { label: 'Katakana Base', start: 26, end: 36, isChallenge: false },
      { label: 'Katakana Dakuon', start: 36, end: 41, isChallenge: false },
      { label: 'Katakana Yoon', start: 41, end: 52, isChallenge: false },
      {
        label: 'Katakana Foreign Sounds',
        start: 52,
        end: 60,
        isChallenge: false
      },
      {
        label: 'Challenge Similar Hiragana',
        start: 60,
        end: 65,
        isChallenge: true
      },
      {
        label: 'Challenge Confusing Katakana',
        start: 65,
        end: 69,
        isChallenge: true
      }
    ];

    const nonChallengeIndices = kana
      .map((k, i) => ({ k, i }))
      .filter(({ k }) => !k.groupName.startsWith('challenge.'))
      .map(({ i }) => i);
    const allNonChallengeSelected = nonChallengeIndices.every(i =>
      selected.has(i)
    );

    const full: string[] = [];
    const compact: string[] = [];

    const covered = new Set<number>();

    if (allNonChallengeSelected) {
      full.push('all kana');
      compact.push('all kana');

      nonChallengeIndices.forEach(i => covered.add(i));
    }

    // Check parent groups first (All Hiragana, All Katakana, All Challenge)
    parentGroupDefs.forEach(parentDef => {
      // Skip if already covered by "all kana" and not a challenge group
      if (allNonChallengeSelected && parentDef.label !== 'All Challenge')
        return;

      // Check if all indices in this parent group are already covered
      let allCovered = true;
      for (let i = parentDef.start; i < parentDef.end; i++) {
        if (!covered.has(i)) {
          allCovered = false;
          break;
        }
      }
      if (allCovered) return;

      // Check if all indices in this parent group are selected
      let allInRange = true;
      for (let i = parentDef.start; i < parentDef.end; i++) {
        if (!selected.has(i)) {
          allInRange = false;
          break;
        }
      }

      if (!allInRange) return;

      // All selected - add parent group label and mark as covered
      full.push(parentDef.label);
      compact.push(parentDef.label);
      for (let i = parentDef.start; i < parentDef.end; i++) covered.add(i);
    });

    // Then check individual subgroups for partial selections
    subgroupDefs.forEach(def => {
      // Skip if covered by "all kana" or parent group
      let allCovered = true;
      for (let i = def.start; i < def.end; i++) {
        if (!covered.has(i)) {
          allCovered = false;
          break;
        }
      }
      if (allCovered) return;

      let allInRange = true;
      for (let i = def.start; i < def.end; i++) {
        if (!selected.has(i)) {
          allInRange = false;
          break;
        }
      }

      if (!allInRange) return;

      full.push(def.label);
      compact.push(def.label);
      for (let i = def.start; i < def.end; i++) covered.add(i);
    });

    const sortedSelected = [...kanaGroupIndices].sort((a, b) => a - b);
    sortedSelected.forEach(i => {
      if (covered.has(i)) return;

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
    persistDuration
  ]);

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
      <div className='flex min-h-[100dvh] flex-col items-center justify-center p-4'>
        <div className='w-full max-w-lg space-y-4'>
          {/* Header */}
          <div className='space-y-3 text-center'>
            <Play size={56} className='mx-auto text-[var(--main-color)]' />
            <h1 className='text-2xl font-bold text-[var(--secondary-color)]'>
              {dojoLabel}{' '}
              {mode === 'blitz'
                ? 'Blitz'
                : mode === 'gauntlet'
                  ? 'Gauntlet'
                  : 'Training'}
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
                    'w-full rounded-xl p-5 text-left hover:cursor-pointer',
                    'flex items-center gap-4 border-2 bg-[var(--card-color)]',
                    isSelected
                      ? 'border-[var(--main-color)]'
                      : 'border-[var(--border-color)]'
                  )}
                >
                  {/* Icon */}
                  <div
                    className={clsx(
                      'flex h-12 w-12 shrink-0 items-center justify-center rounded-xl',
                      isSelected
                        ? 'bg-[var(--main-color)] text-[var(--background-color)]'
                        : 'bg-[var(--border-color)] text-[var(--muted-color)]'
                    )}
                  >
                    <Icon size={24} />
                  </div>

                  {/* Content */}
                  <div className='min-w-0 flex-1'>
                    <h3
                      className={clsx(
                        'text-lg font-medium',
                        'text-[var(--main-color)]'
                      )}
                    >
                      {mode.title}
                    </h3>
                    <p className='mt-0.5 text-sm text-[var(--secondary-color)]'>
                      {mode.description}
                    </p>
                  </div>

                  {/* Selection indicator */}
                  <div
                    className={clsx(
                      'flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2',
                      isSelected
                        ? 'border-[var(--secondary-color)] bg-[var(--secondary-color)]'
                        : 'border-[var(--border-color)]'
                    )}
                  >
                    {isSelected && (
                      <svg
                        className='h-3 w-3 text-[var(--background-color)]'
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
            <div className='space-y-3 rounded-lg bg-[var(--card-color)] p-4'>
              <p className='text-sm font-medium text-[var(--secondary-color)]'>
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
                    borderBottomThickness={6}
                    borderRadius='2xl'
                    className={clsx(
                      'w-auto px-4 py-2',
                      challengeDuration !== duration && 'opacity-60'
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
                'flex h-12 w-1/2 flex-row items-center justify-center gap-2 px-2 sm:px-6',
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
                  'flex h-12 w-full flex-row items-center justify-center gap-2 px-2 sm:px-6',
                  'rounded-2xl transition-colors duration-200',
                  'border-b-6 font-medium shadow-sm',
                  'hover:cursor-pointer',
                  selectedGameMode
                    ? 'border-[var(--main-color-accent)] bg-[var(--main-color)] text-[var(--background-color)]'
                    : 'cursor-not-allowed bg-[var(--card-color)] text-[var(--border-color)]'
                )}
              >
                <span className='whitespace-nowrap'>
                  {mode === 'blitz'
                    ? 'Start Blitz'
                    : mode === 'gauntlet'
                      ? 'Start Gauntlet'
                      : 'Start Training'}
                </span>
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
    return formatLevelsAsRanges(sets);
  };

  const formatFull = () => {
    if (isKana)
      return kanaGroupNamesFull.length ? kanaGroupNamesFull.join(', ') : 'None';
    const sets = isKanji ? selectedKanjiSets : selectedVocabSets;
    return sets.length
      ? formatLevelsAsRanges(sets)
          .split(', ')
          .map(r => `${r.includes('-') ? 'Levels' : 'Level'} ${r}`)
          .join(', ')
      : 'None';
  };

  return (
    <div className='rounded-lg bg-[var(--card-color)] p-4'>
      <div className='flex flex-col gap-2'>
        <div className='flex flex-row items-center gap-2'>
          <CheckCircle2
            className='shrink-0 text-[var(--secondary-color)]'
            size={20}
          />
          <span className='text-sm'>
            {isKana ? 'Selected Groups:' : 'Selected Levels:'}
          </span>
        </div>
        <span className='text-sm break-words text-[var(--secondary-color)] md:hidden'>
          {formatCompact()}
        </span>
        <span className='hidden text-sm break-words text-[var(--secondary-color)] md:inline'>
          {formatFull()}
        </span>
      </div>
    </div>
  );
}

export default GameModes;
