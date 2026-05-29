'use client';
import { lazy, Suspense, useCallback, useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { useKanaSelection } from '@/features/Kana';
import { useKanjiSelection } from '@/features/Kanji';
import { useVocabSelection } from '@/features/Vocabulary';
import { getSelectionLabels } from '@/shared/utils/selectionFormatting';
import {
  MousePointerClick,
  Keyboard,
  Play,
  ArrowLeft,
  CheckCircle2,
  Zap,
  Swords,
  Shield,
  Skull,
} from 'lucide-react';
import clsx from 'clsx';
import { useClick } from '@/shared/hooks/generic/useAudio';
import { Link, useRouter } from '@/core/i18n/routing';
import useGauntletSettingsStore from '@/shared/store/useGauntletSettingsStore';
import {
  DIFFICULTY_CONFIG,
  REPETITION_OPTIONS,
  type GauntletDifficulty,
} from '@/shared/ui-composite/Gauntlet/types';
import { SelectedLevelsCard } from '@/shared/ui-composite/Menu/SelectedLevelsCard';

import { ActionButton } from '@/shared/ui/components/ActionButton';

const Decorations = lazy(() => import('@/shared/ui-composite/Decorations/Decorations'));

interface ModeSetupMenuProps {
  isOpen: boolean;
  onClose: () => void;
  currentDojo: string;
  mode?: 'train' | 'blitz' | 'gauntlet';
}

type GameModeOption = {
  id: 'Pick' | 'Type';
  title: string;
  description: string;
  icon: typeof MousePointerClick;
};

const difficultyIcons: Record<GauntletDifficulty, React.ReactNode> = {
  normal: <Shield size={20} />,
  hard: <Zap size={20} />,
  'instant-death': <Skull size={20} />,
};
const USE_NEW_GAME_MODE_ICON_STYLE = true;
const GAME_MODE_ICON_SIZE = 22;
const GAME_MODE_ICON_FLOAT_DELAY_CLASS = '[animation-delay:180ms]';
const USE_FLUSH_DIFFICULTY_TABS = false;
const USE_TILDE_SEPARATOR = false;
const gameModeIconStyle = {
  base: 'motion-safe:animate-float flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border-b-6 transition-colors [--float-distance:-2px]',
  selected:
    'border-(--main-color-accent) bg-(--main-color) text-(--background-color)',
  unselected:
    'border-(--secondary-color-accent) bg-(--secondary-color) text-(--background-color) opacity-85',
} as const;

const ModeSetupMenu = ({
  isOpen,
  onClose,
  currentDojo,
  mode = 'train',
}: ModeSetupMenuProps) => {
  const { playClick } = useClick();
  const router = useRouter();
  const gauntletSettings = useGauntletSettingsStore();
  const dojoType = currentDojo as 'kana' | 'kanji' | 'vocabulary';

  const durationStorageKey =
    currentDojo === 'kana'
      ? 'blitzDuration'
      : currentDojo === 'kanji'
        ? 'blitzKanjiDuration'
        : 'blitzVocabDuration';

  const DURATION_OPTIONS = [30, 60, 90, 120, 180];

  const [challengeDuration, setChallengeDuration] = useState<number>(60);
  const [gauntletDifficulty, setGauntletDifficulty] =
    useState<GauntletDifficulty>('normal');
  const [gauntletRepetitions, setGauntletRepetitions] = useState<number>(10);

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

  const setSelectedGameMode = useCallback(
    (nextMode: 'Pick' | 'Type') => {
      if (currentDojo === 'kana') {
        setSelectedGameModeKana(nextMode);
        return;
      }
      if (currentDojo === 'kanji') {
        setSelectedGameModeKanji(nextMode);
        return;
      }
      if (currentDojo === 'vocabulary') {
        setSelectedGameModeVocab(nextMode);
      }
    },
    [
      currentDojo,
      setSelectedGameModeKana,
      setSelectedGameModeKanji,
      setSelectedGameModeVocab,
    ],
  );

  useEffect(() => {
    if (!isOpen || mode !== 'gauntlet') return;
    const storedGauntletMode = gauntletSettings.getGameMode(dojoType);
    setSelectedGameMode(storedGauntletMode);
    setGauntletDifficulty(gauntletSettings.getDifficulty(dojoType));
    setGauntletRepetitions(gauntletSettings.getRepetitions(dojoType));
  }, [isOpen, mode, dojoType, gauntletSettings, setSelectedGameMode]);

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

  const gameModes: GameModeOption[] = [
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
  const ModeIcon = mode === 'blitz' ? Zap : mode === 'gauntlet' ? Swords : Play;

  if (!isOpen) return null;

  return (
    <div className='fixed inset-0 z-[70]'>
      <div className='absolute inset-0 -z-20 bg-(--background-color)' />
      <div className='absolute inset-0 -z-10'>
        <Suspense fallback={<></>}>
          <Decorations
            expandDecorations={false}
            interactive={true}
            context='mode-setup'
          />
        </Suspense>
      </div>
      <div className='h-full w-full overflow-x-hidden overflow-y-auto overscroll-y-contain'>
        <div className='mx-auto flex min-h-[100dvh] w-full max-w-lg flex-col justify-center p-4'>
          <div className='w-full space-y-4'>
          {/* Header */}
          <div className='space-y-3 text-center'>
            <span className='motion-safe:animate-float mx-auto flex h-20 w-20 items-center justify-center rounded-4xl border-b-14 border-(--secondary-color-accent) bg-(--secondary-color) text-(--background-color) [--float-distance:-5px]'>
              <ModeIcon size={40} className='fill-current' />
            </span>
            <h1 className='text-2xl font-bold text-(--main-color)'>
              {dojoLabel}{' '}
              {mode === 'blitz'
                ? 'Blitz'
                : mode === 'gauntlet'
                  ? 'Gauntlet'
                  : 'Classic'}
            </h1>
            <p className='text-(--secondary-color)'>
              {mode === 'blitz'
                ? 'Practice in a fast-paced, time-limited way'
                : mode === 'gauntlet'
                  ? 'Master every character. No random help.'
                  : 'Practice in a classic, endless way'}
            </p>
          </div>

          {/* Selected Levels */}
          <SelectedLevelsCard
            currentDojo={currentDojo}
            fullLabel={kanaGroupNamesFull}
            compactLabel={kanaGroupNamesCompact}
            useTildeSeparator={USE_TILDE_SEPARATOR}
          />

          {mode !== 'gauntlet' && (
            <GameModeCards
              gameModes={gameModes}
              selectedGameMode={selectedGameMode}
              onSelect={selectedMode => {
                setSelectedGameMode(selectedMode);
              }}
            />
          )}

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

          {mode === 'gauntlet' && (
            <>
              <div className='space-y-3'>
                <h3 className='text-sm text-(--main-color)'>Difficulty</h3>
                <div className='mx-auto w-full rounded-2xl border-1 border-(--border-color) bg-(--background-color) p-1 shadow-[0_12px_40px_rgba(0,0,0,0.12)] backdrop-blur-xl'>
                  <div
                    className={clsx(
                      'flex w-full gap-0 bg-(--card-color)',
                      USE_FLUSH_DIFFICULTY_TABS
                        ? 'rounded-[22px] p-0'
                        : 'rounded-[22px] p-1.5',
                    )}
                  >
                    {(
                      Object.entries(DIFFICULTY_CONFIG) as [
                        GauntletDifficulty,
                        (typeof DIFFICULTY_CONFIG)[GauntletDifficulty],
                      ][]
                    ).map(([key, config]) => {
                      const isSelected = key === gauntletDifficulty;
                      return (
                        <div key={key} className='relative flex-1'>
                          {isSelected && (
                            <motion.div
                              layoutId='activeDifficultyTab'
                              className={clsx(
                                'absolute inset-0 border-b-10 border-(--main-color-accent) bg-(--main-color)',
                                USE_FLUSH_DIFFICULTY_TABS
                                  ? 'rounded-[22px]'
                                  : 'rounded-2xl',
                              )}
                              transition={{
                                type: 'spring',
                                stiffness: 300,
                                damping: 30,
                              }}
                            />
                          )}
                          <button
                            onClick={() => {
                              playClick();
                              setGauntletDifficulty(key);
                              gauntletSettings.setDifficulty(dojoType, key);
                            }}
                            className={clsx(
                              'relative z-10 flex w-full cursor-pointer items-center justify-center gap-1.5 px-4 pt-3 pb-5 text-sm font-semibold transition-colors duration-300',
                              USE_FLUSH_DIFFICULTY_TABS
                                ? 'rounded-[22px]'
                                : 'rounded-2xl',
                              isSelected
                                ? 'text-(--background-color)'
                                : 'bg-transparent text-(--secondary-color) hover:text-(--main-color)',
                            )}
                          >
                            {difficultyIcons[key]}
                            <span>{config.label}</span>
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
                <p className='text-center text-xs text-(--secondary-color)'>
                  {DIFFICULTY_CONFIG[gauntletDifficulty].description}
                </p>
              </div>

              <GameModeCards
                gameModes={gameModes}
                selectedGameMode={selectedGameMode}
                onSelect={selectedMode => {
                  setSelectedGameMode(selectedMode);
                  gauntletSettings.setGameMode(dojoType, selectedMode);
                }}
              />

              <div className='space-y-3 rounded-2xl bg-(--card-color) p-4'>
                <p className='text-sm font-medium text-(--main-color)'>
                  Repetitions per character:
                </p>
                <div className='flex flex-wrap justify-center gap-2'>
                  {REPETITION_OPTIONS.map(rep => (
                    <ActionButton
                      key={rep}
                      onClick={() => {
                        playClick();
                        setGauntletRepetitions(rep);
                        gauntletSettings.setRepetitions(
                          dojoType,
                          rep,
                        );
                      }}
                      colorScheme={gauntletRepetitions === rep ? 'main' : 'secondary'}
                      borderColorScheme={
                        gauntletRepetitions === rep ? 'main' : 'secondary'
                      }
                      borderBottomThickness={10}
                      borderRadius='3xl'
                      className={clsx(
                        'w-auto px-4 py-2',
                        gauntletRepetitions !== rep && 'opacity-60',
                      )}
                    >
                      {rep}×
                    </ActionButton>
                  ))}
                </div>
              </div>
            </>
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
    </div>
  );
};

function GameModeCards({
  gameModes,
  selectedGameMode,
  onSelect,
}: {
  gameModes: GameModeOption[];
  selectedGameMode: string;
  onSelect: (mode: 'Pick' | 'Type') => void;
}) {
  const { playClick } = useClick();

  return (
    <div className='space-y-3'>
      {gameModes.map((gameModeOption, index) => {
        const isSelected = gameModeOption.id === selectedGameMode;
        const Icon = gameModeOption.icon;

        return (
          <button
            key={gameModeOption.id}
            onClick={() => {
              playClick();
              onSelect(gameModeOption.id);
            }}
            className={clsx(
              'w-full rounded-2xl p-5 text-left hover:cursor-pointer',
              'flex items-center gap-4 border-4 bg-(--card-color)',
              isSelected ? 'border-(--main-color)' : 'border-(--border-color)',
            )}
          >
            <div
              className={clsx(
                USE_NEW_GAME_MODE_ICON_STYLE
                  ? gameModeIconStyle.base
                  : 'flex h-12 w-12 shrink-0 items-center justify-center rounded-xl',
                USE_NEW_GAME_MODE_ICON_STYLE &&
                  (isSelected
                    ? gameModeIconStyle.selected
                    : gameModeIconStyle.unselected),
                USE_NEW_GAME_MODE_ICON_STYLE &&
                  index === 1 &&
                  GAME_MODE_ICON_FLOAT_DELAY_CLASS,
                !USE_NEW_GAME_MODE_ICON_STYLE &&
                  (isSelected
                    ? 'bg-(--main-color) text-(--background-color)'
                    : 'bg-(--border-color) text-(--muted-color)'),
              )}
            >
              <Icon size={USE_NEW_GAME_MODE_ICON_STYLE ? GAME_MODE_ICON_SIZE : 24} />
            </div>
            <div className='min-w-0 flex-1'>
              <h3 className='text-lg font-medium text-(--main-color)'>
                {gameModeOption.title}
              </h3>
              <p className='mt-0.5 text-sm text-(--secondary-color)'>
                {gameModeOption.description}
              </p>
            </div>
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
  );
}

export default ModeSetupMenu;

