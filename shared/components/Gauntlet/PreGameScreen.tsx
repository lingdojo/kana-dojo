'use client';

import { useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import clsx from 'clsx';
import { Link, useRouter } from '@/core/i18n/routing';
import {
  Swords,
  ArrowLeft,
  Play,
  MousePointerClick,
  Keyboard,
  Shield,
  Skull,
  Zap,
} from 'lucide-react';
import { useClick } from '@/shared/hooks/useAudio';
import {
  DIFFICULTY_CONFIG,
  REPETITION_OPTIONS,
  type GauntletDifficulty,
  type GauntletGameMode,
  type RepetitionCount,
} from './types';
import { ActionButton } from '@/shared/components/ui/ActionButton';
import { cn } from '@/shared/lib/utils';

interface PreGameScreenProps {
  dojoType: 'kana' | 'kanji' | 'vocabulary';
  dojoLabel: string;
  itemsCount: number;
  selectedSets: string[];
  gameMode: GauntletGameMode;
  setGameMode: (mode: GauntletGameMode) => void;
  difficulty: GauntletDifficulty;
  setDifficulty: (difficulty: GauntletDifficulty) => void;
  repetitions: RepetitionCount;
  setRepetitions: (reps: RepetitionCount) => void;
  pickModeSupported: boolean;
  onStart?: () => void; // Kept for backwards compatibility but no longer used
  onCancel?: () => void; // Optional callback to handle back/cancel in modal mode
}

const difficultyIcons: Record<GauntletDifficulty, React.ReactNode> = {
  normal: <Shield size={24} />,
  hard: <Zap size={24} />,
  'instant-death': <Skull size={24} />,
};

export default function PreGameScreen({
  dojoType,
  dojoLabel,
  itemsCount,
  selectedSets,
  gameMode,
  setGameMode,
  difficulty,
  setDifficulty,
  repetitions,
  setRepetitions,
  pickModeSupported,
  onCancel,
}: PreGameScreenProps) {
  const { playClick } = useClick();
  const router = useRouter();

  // Handle back button - close modal if in modal mode, navigate if on route
  const handleBack = () => {
    playClick();
    if (onCancel) {
      // In modal mode - just close the modal
      onCancel();
    } else {
      // On route - navigate back to dojo
      router.push(`/${dojoType}`);
    }
  };

  const totalQuestions = useMemo(
    () => itemsCount * repetitions,
    [itemsCount, repetitions],
  );
  const estimatedMinutes = useMemo(
    () => Math.ceil((totalQuestions * 3) / 60),
    [totalQuestions],
  );

  const selectedSetsLabel = useMemo(
    () => (selectedSets.length > 0 ? selectedSets.join(', ') : 'None'),
    [selectedSets],
  );

  const gameModes = useMemo(
    () => [
      {
        id: 'Pick' as GauntletGameMode,
        title: 'Pick',
        description: 'Pick the correct answer from multiple options',
        icon: MousePointerClick,
      },
      {
        id: 'Type' as GauntletGameMode,
        title: 'Type',
        description: 'Type the correct answer',
        icon: Keyboard,
      },
    ],
    [],
  );

  const handleDifficultyClick = useCallback(
    (diff: GauntletDifficulty) => {
      playClick();
      setDifficulty(diff);
    },
    [playClick, setDifficulty],
  );

  // Shared design toggle for Difficulty and Mode selector sections:
  // true = New design (ActionButtons with main/secondary colors and opacity)
  // false = Old design (transparent non-selected or detailed cards)
  const useNewSelectorDesign = false;

  return (
    <div className='fixed inset-0 z-[70] overflow-y-auto bg-(--background-color)'>
      <div className='flex min-h-[100dvh] flex-col items-center justify-center p-4'>
        <div className='w-full max-w-lg space-y-4'>
          {/* Header */}
          <div className='space-y-3 text-center'>
            <Swords
              size={56}
              className='mx-auto text-(--secondary-color)'
            />
            <h1 className='text-2xl font-bold text-(--main-color)'>
              {dojoLabel} Gauntlet
            </h1>
            <p className='text-(--secondary-color)'>
              Master every character. No random help.
            </p>
          </div>

          {/* Selected Sets */}
          <div className='rounded-2xl bg-(--card-color) p-4'>
            <div className='flex flex-col gap-2'>
              <span className='text-sm font-medium text-(--main-color)'>
                Selected:
              </span>
              <span className='text-sm text-(--secondary-color)'>
                {selectedSetsLabel}
              </span>
              <span className='text-xs text-(--secondary-color)'>
                {itemsCount} characters × {repetitions} = {totalQuestions}{' '}
                questions (~{estimatedMinutes} min)
              </span>
            </div>
          </div>

          {/* Difficulty Selection */}
          {(() => {
            if (useNewSelectorDesign) {
              // New design: UnitSelector-style ActionButtons (main/secondary with opacity)
              return (
                <div
                  className={cn(
                    'space-y-3',
                    true && 'rounded-2xl bg-(--card-color) p-4',
                  )}
                >
                  <h3 className='text-sm text-(--main-color)'>
                    Difficulty
                  </h3>
                  <div className='flex w-full justify-center gap-3'>
                    {(
                      Object.entries(DIFFICULTY_CONFIG) as [
                        GauntletDifficulty,
                        (typeof DIFFICULTY_CONFIG)[GauntletDifficulty],
                      ][]
                    ).map(([key, config]) => {
                      const isSelected = key === difficulty;
                      return (
                        <ActionButton
                          key={key}
                          onClick={() => handleDifficultyClick(key)}
                          colorScheme={isSelected ? 'main' : 'secondary'}
                          borderColorScheme={isSelected ? 'main' : 'secondary'}
                          borderBottomThickness={10}
                          borderRadius='3xl'
                          className={clsx(
                            'flex-1 gap-1.5 px-4 py-2.5 text-sm',
                            !isSelected && 'opacity-60',
                          )}
                        >
                          {difficultyIcons[key]}
                          <span>{config.label}</span>
                        </ActionButton>
                      );
                    })}
                  </div>
                  <p className='text-center text-xs text-(--secondary-color)'>
                    {DIFFICULTY_CONFIG[difficulty].description}
                  </p>
                </div>
              );
            }

            // Old design: Card with transparent non-selected buttons
            return (
              <div className='space-y-3'>
                <h3 className='text-sm text-(--main-color)'>Difficulty</h3>
                <div className='flex w-full justify-center gap-1 rounded-[22px] bg-(--card-color) p-1.5'>
                  {(
                    Object.entries(DIFFICULTY_CONFIG) as [
                      GauntletDifficulty,
                      (typeof DIFFICULTY_CONFIG)[GauntletDifficulty],
                    ][]
                  ).map(([key, config]) => {
                    const isSelected = key === difficulty;
                    return (
                      <div key={key} className='relative flex-1'>
                        {/* Smooth sliding background indicator */}
                        {isSelected && (
                          <motion.div
                            layoutId='activeDifficultyTab'
                            className='absolute inset-0 rounded-2xl border-b-10 border-(--main-color-accent) bg-(--main-color)'
                            transition={{
                              type: 'spring',
                              stiffness: 300,
                              damping: 30,
                            }}
                          />
                        )}
                        <button
                          onClick={() => handleDifficultyClick(key)}
                          className={clsx(
                            'relative z-10 flex w-full cursor-pointer items-center justify-center gap-1.5 rounded-2xl px-4 pt-3 pb-5 text-sm font-semibold transition-colors duration-300',
                            isSelected
                              ? 'text-(--background-color)'
                              : 'text-(--secondary-color) hover:text-(--main-color)',
                          )}
                        >
                          {difficultyIcons[key]}
                          <span>{config.label}</span>
                        </button>
                      </div>
                    );
                  })}
                </div>
                <p className='text-center text-xs text-(--secondary-color)'>
                  {DIFFICULTY_CONFIG[difficulty].description}
                </p>
              </div>
            );
          })()}

          {/* Game Mode Cards */}
          {(() => {
            if (useNewSelectorDesign) {
              // New design: ActionButton style (matching UnitSelector/Difficulty)
              const selectedMode = gameModes.find(m => m.id === gameMode);
              return (
                <div
                  className={cn(
                    'space-y-3',
                    true && 'rounded-2xl bg-(--card-color) p-4',
                  )}
                >
                  <h3 className='text-sm text-(--main-color)'>Mode</h3>
                  <div className='flex w-full justify-center gap-3'>
                    {gameModes.map(mode => {
                      const isSelected = mode.id === gameMode;
                      const Icon = mode.icon;
                      const isDisabled =
                        mode.id === 'Pick' && !pickModeSupported;

                      return (
                        <ActionButton
                          key={mode.id}
                          disabled={isDisabled}
                          onClick={() => {
                            if (!isDisabled) {
                              playClick();
                              setGameMode(mode.id);
                            }
                          }}
                          colorScheme={isSelected ? 'main' : 'secondary'}
                          borderColorScheme={isSelected ? 'main' : 'secondary'}
                          borderBottomThickness={10}
                          borderRadius='3xl'
                          className={clsx(
                            'flex-1 gap-2 px-4 py-3 text-sm',
                            !isSelected && 'opacity-60',
                            isDisabled && 'cursor-not-allowed opacity-30',
                          )}
                        >
                          <Icon size={20} />
                          <span>{mode.title}</span>
                        </ActionButton>
                      );
                    })}
                  </div>
                  <p className='text-center text-xs text-(--secondary-color)'>
                    {selectedMode?.description}
                  </p>
                </div>
              );
            }

            // Old design: Detailed cards with icons and radio indicators
            return (
              <div className='space-y-3'>
                <h3 className='text-sm text-(--main-color)'>Mode</h3>
                {gameModes.map(mode => {
                  const isSelected = mode.id === gameMode;
                  const Icon = mode.icon;
                  const isDisabled = mode.id === 'Pick' && !pickModeSupported;

                  return (
                    <button
                      key={mode.id}
                      disabled={isDisabled}
                      onClick={() => {
                        if (!isDisabled) {
                          playClick();
                          setGameMode(mode.id);
                        }
                      }}
                      className={clsx(
                        'w-full rounded-2xl p-4 text-left',
                        'flex items-center gap-4 border-2 bg-(--card-color)',
                        isDisabled && 'cursor-not-allowed opacity-50',
                        !isDisabled && 'hover:cursor-pointer',
                        isSelected
                          ? 'border-(--main-color)'
                          : 'border-(--border-color)',
                      )}
                    >
                      <div
                        className={clsx(
                          'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl',
                          isSelected
                            ? 'bg-(--main-color) text-(--background-color)'
                            : 'bg-(--border-color) text-(--muted-color)',
                        )}
                      >
                        <Icon size={20} />
                      </div>
                      <div className='min-w-0 flex-1'>
                        <h4 className='font-medium text-(--secondary-color)'>
                          {mode.title}
                        </h4>
                        <p className='text-xs text-(--muted-color)'>
                          {mode.description}
                        </p>
                      </div>
                      <div
                        className={clsx(
                          'flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2',
                          isSelected
                            ? 'border-(--main-color) bg-(--main-color)'
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
          })()}

          {/* Repetitions per character */}
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
                    setRepetitions(rep);
                  }}
                  colorScheme={repetitions === rep ? 'main' : 'secondary'}
                  borderColorScheme={repetitions === rep ? 'main' : 'secondary'}
                  borderBottomThickness={10}
                  borderRadius='3xl'
                  className={clsx(
                    'w-auto px-4 py-2',
                    repetitions !== rep && 'opacity-60',
                  )}
                >
                  {rep}×
                </ActionButton>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className='flex flex-row items-center justify-center gap-2 pt-2 md:gap-4'>
            <button
              onClick={handleBack}
              className={clsx(
                'flex w-1/2 flex-row items-center justify-center gap-2 px-2 py-3 sm:px-6',
                'bg-(--secondary-color) text-(--background-color)',
                'rounded-3xl transition-colors duration-200',
                'border-b-10 border-(--secondary-color-accent)',
                'hover:cursor-pointer',
              )}
            >
              <ArrowLeft size={20} />
              <span className='whitespace-nowrap'>Back</span>
            </button>

            {/* Start button: Navigate to gauntlet route to start the game */}
            <Link href={`/${dojoType}/gauntlet`} className='w-1/2'>
              <button
                onClick={() => playClick()}
                className={clsx(
                  'flex w-full flex-row items-center justify-center gap-2 px-2 py-3 sm:px-6',
                  'rounded-3xl transition-colors duration-200',
                  'border-b-10',
                  'hover:cursor-pointer',
                  'border-(--main-color-accent) bg-(--main-color) text-(--background-color)',
                )}
              >
                <Play className='fill-current' size={20} />
                <span className='whitespace-nowrap'>Start Gauntlet</span>
              </button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
