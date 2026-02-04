'use client';

import { useMemo } from 'react';
import {
  Timer,
  Target,
  Play,
  ArrowLeft,
  CheckCircle2,
  MousePointerClick,
  Keyboard,
} from 'lucide-react';
import { Link } from '@/core/i18n/routing';
import clsx from 'clsx';
import GoalTimersPanel from '@/shared/components/Timer/GoalTimersPanel';
import { ActionButton } from '@/shared/components/ui/ActionButton';
import { useClick } from '@/shared/hooks/useAudio';
import type { BlitzGameMode, GoalTimer, AddGoalFn } from './types';

interface PreGameScreenProps {
  dojoType: 'kana' | 'kanji' | 'vocabulary';
  dojoLabel: string;
  itemsCount: number;
  selectedSets?: string[];
  gameMode: BlitzGameMode;
  setGameMode: (mode: BlitzGameMode) => void;
  pickModeSupported: boolean;
  challengeDuration: number;
  setChallengeDuration: (duration: number) => void;
  showGoalTimers: boolean;
  setShowGoalTimers: (show: boolean) => void;
  goalTimers: {
    goals: GoalTimer[];
    addGoal: AddGoalFn;
    removeGoal: (id: string) => void;
    clearGoals: () => void;
  };
  onStart: () => void;
}

const GAME_MODES: {
  id: BlitzGameMode;
  title: string;
  description: string;
  icon: typeof MousePointerClick;
}[] = [
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

const DURATION_OPTIONS = [30, 60, 90, 120, 180];

export default function PreGameScreen({
  dojoType,
  dojoLabel,
  itemsCount,
  selectedSets,
  gameMode,
  setGameMode,
  pickModeSupported,
  challengeDuration,
  setChallengeDuration,
  showGoalTimers,
  setShowGoalTimers,
  goalTimers,
  onStart,
}: PreGameScreenProps) {
  const { playClick } = useClick();

  return (
    <div className='flex min-h-[100dvh] flex-col items-start justify-center gap-6 p-4 lg:flex-row'>
      <div className='w-full max-w-md space-y-5 text-center lg:max-w-lg'>
        <Timer size={64} className='mx-auto text-(--main-color)' />
        <h1 className='text-2xl font-bold text-(--secondary-color)'>
          Blitz
        </h1>
        <p className='text-(--muted-color)'>
          Test your {dojoLabel.toLowerCase()} recognition speed! Answer as many
          questions as possible before time runs out.
        </p>

        {/* Selected Levels */}
        <SelectedLevelsCard
          dojoType={dojoType}
          dojoLabel={dojoLabel}
          itemsCount={itemsCount}
          selectedSets={selectedSets}
        />

        {/* Game Mode Selection */}
        <GameModeSelector
          gameMode={gameMode}
          setGameMode={setGameMode}
          pickModeSupported={pickModeSupported}
        />

        {/* Duration Selection */}
        <DurationSelector
          challengeDuration={challengeDuration}
          setChallengeDuration={setChallengeDuration}
        />

        {/* Action Buttons */}
        <div className='flex w-full flex-row items-center justify-center gap-2 md:gap-4'>
          <Link href={`/${dojoType}`} className='w-1/2'>
            <button
              className={clsx(
                'flex h-12 w-full flex-row items-center justify-center gap-2 px-2 sm:px-6',
                'bg-(--secondary-color) text-(--background-color)',
                'rounded-2xl transition-colors duration-200',
                'border-b-6 border-(--secondary-color-accent) shadow-sm',
                'hover:cursor-pointer',
              )}
              onClick={() => playClick()}
            >
              <ArrowLeft size={20} />
              <span className='whitespace-nowrap'>Back</span>
            </button>
          </Link>
          <button
            onClick={onStart}
            className={clsx(
              'flex h-12 w-1/2 flex-row items-center justify-center gap-2 px-2 sm:px-6',
              'bg-(--main-color) text-(--background-color)',
              'rounded-2xl transition-colors duration-200',
              'border-b-6 border-(--main-color-accent) font-medium shadow-sm',
              'hover:cursor-pointer',
            )}
          >
            <span className='whitespace-nowrap'>Start</span>
            <Play size={20} className='fill-current' />
          </button>
        </div>
      </div>

      {/* Goal Timers Panel */}
      <div className='w-full space-y-4 lg:w-80'>
        <ActionButton
          onClick={() => {
            playClick();
            setShowGoalTimers(!showGoalTimers);
          }}
          colorScheme='secondary'
          borderColorScheme='secondary'
          borderBottomThickness={4}
          borderRadius='xl'
          className='flex w-full items-center justify-center gap-2 px-4 py-2'
        >
          <Target size={20} />
          <span>{showGoalTimers ? 'Hide' : 'Show'} Goal Timers</span>
        </ActionButton>
        {showGoalTimers && (
          <GoalTimersPanel
            goals={goalTimers.goals}
            currentSeconds={0}
            onAddGoal={goalTimers.addGoal}
            onRemoveGoal={goalTimers.removeGoal}
            onClearGoals={goalTimers.clearGoals}
            disabled={false}
          />
        )}
      </div>
    </div>
  );
}

// Sub-components for PreGameScreen

function SelectedLevelsCard({
  dojoType,
  dojoLabel,
  itemsCount,
  selectedSets,
}: {
  dojoType: 'kana' | 'kanji' | 'vocabulary';
  dojoLabel: string;
  itemsCount: number;
  selectedSets?: string[];
}) {
  const sortedSets = useMemo(() => {
    if (!selectedSets || selectedSets.length === 0) return [];
    return [...selectedSets].sort((a, b) => {
      const numA = parseInt(a.replace(/\D/g, '')) || 0;
      const numB = parseInt(b.replace(/\D/g, '')) || 0;
      return numA - numB;
    });
  }, [selectedSets]);

  const compactText = useMemo(() => {
    if (sortedSets.length === 0) {
      return `${itemsCount} ${dojoLabel.toLowerCase()}`;
    }
    return sortedSets
      .map(set =>
        set
          .replace('Set ', '')
          .replace('Level ', '')
          .replace(/-group.*$/, ''),
      )
      .join(', ');
  }, [dojoLabel, itemsCount, sortedSets]);

  const fullText = useMemo(() => {
    if (sortedSets.length === 0) {
      return `${itemsCount} ${dojoLabel.toLowerCase()}`;
    }
    return sortedSets
      .map(set => {
        const cleaned = set.replace('Set ', '').replace('Level ', '');
        return dojoType === 'kana'
          ? cleaned
          : `${cleaned.includes('-') ? 'Levels' : 'Level'} ${cleaned}`;
      })
      .join(', ');
  }, [dojoLabel, dojoType, itemsCount, sortedSets]);

  return (
    <div className='rounded-lg bg-(--card-color) p-4 text-left'>
      <div className='flex flex-col gap-2'>
        <div className='flex flex-row items-center gap-2'>
          <CheckCircle2
            className='shrink-0 text-(--secondary-color)'
            size={20}
          />
          <span className='text-sm'>
            {dojoType === 'kana' ? 'Selected Groups:' : 'Selected Levels:'}
          </span>
        </div>
        <span className='text-sm break-words text-(--secondary-color) md:hidden'>
          {compactText}
        </span>
        <span className='hidden text-sm break-words text-(--secondary-color) md:inline'>
          {fullText}
        </span>
      </div>
    </div>
  );
}

function GameModeSelector({
  gameMode,
  setGameMode,
  pickModeSupported,
}: {
  gameMode: BlitzGameMode;
  setGameMode: (mode: BlitzGameMode) => void;
  pickModeSupported: boolean;
}) {
  const { playClick } = useClick();

  return (
    <div className='space-y-3'>
      {GAME_MODES.map(mode => {
        const isSelected = mode.id === gameMode;
        const Icon = mode.icon;
        const isDisabled = mode.id === 'Pick' && !pickModeSupported;

        return (
          <button
            key={mode.id}
            onClick={() => {
              if (!isDisabled) {
                playClick();
                setGameMode(mode.id);
              }
            }}
            disabled={isDisabled}
            className={clsx(
              'w-full rounded-xl p-4 text-left hover:cursor-pointer',
              'flex items-center gap-4 border-2 bg-(--card-color)',
              isDisabled && 'cursor-not-allowed opacity-50',
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
              <h3 className='text-base font-medium text-(--main-color)'>
                {mode.title}
              </h3>
              <p className='text-xs text-(--secondary-color)'>
                {mode.description}
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

function DurationSelector({
  challengeDuration,
  setChallengeDuration,
}: {
  challengeDuration: number;
  setChallengeDuration: (duration: number) => void;
}) {
  const { playClick } = useClick();

  return (
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
            }}
            colorScheme={challengeDuration === duration ? 'main' : 'secondary'}
            borderColorScheme={
              challengeDuration === duration ? 'main' : 'secondary'
            }
            borderBottomThickness={8}
            borderRadius='2xl'
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
  );
}
