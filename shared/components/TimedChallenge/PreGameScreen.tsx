'use client';

import {
  Timer,
  Target,
  Play,
  ArrowLeft,
  CheckCircle2,
  MousePointerClick,
  Keyboard
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
    icon: MousePointerClick
  },
  {
    id: 'Type',
    title: 'Type',
    description: 'Type the correct answer',
    icon: Keyboard
  }
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
  onStart
}: PreGameScreenProps) {
  const { playClick } = useClick();

  return (
    <div className='min-h-[100dvh] flex flex-col lg:flex-row items-start justify-center p-4 gap-6'>
      <div className='max-w-md w-full lg:max-w-lg text-center space-y-5'>
        <Timer size={64} className='mx-auto text-[var(--main-color)]' />
        <h1 className='text-2xl font-bold text-[var(--secondary-color)]'>
          Blitz
        </h1>
        <p className='text-[var(--muted-color)]'>
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
        <div className='flex flex-row items-center justify-center gap-2 md:gap-4 w-full'>
          <Link href={`/${dojoType}`} className='w-1/2'>
            <button
              className={clsx(
                'w-full h-12 px-2 sm:px-6 flex flex-row justify-center items-center gap-2',
                'bg-[var(--secondary-color)] text-[var(--background-color)]',
                'rounded-2xl transition-colors duration-200',
                'border-b-6 border-[var(--secondary-color-accent)] shadow-sm',
                'hover:cursor-pointer'
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
              'w-1/2 h-12 px-2 sm:px-6 flex flex-row justify-center items-center gap-2',
              'bg-[var(--main-color)] text-[var(--background-color)]',
              'rounded-2xl transition-colors duration-200',
              'font-medium border-b-6 border-[var(--main-color-accent)] shadow-sm',
              'hover:cursor-pointer'
            )}
          >
            <span className='whitespace-nowrap'>Start</span>
            <Play size={20} className='fill-current' />
          </button>
        </div>
      </div>

      {/* Goal Timers Panel */}
      <div className='w-full lg:w-80 space-y-4'>
        <ActionButton
          onClick={() => {
            playClick();
            setShowGoalTimers(!showGoalTimers);
          }}
          colorScheme='secondary'
          borderColorScheme='secondary'
          borderBottomThickness={4}
          borderRadius='xl'
          className='w-full px-4 py-2 flex items-center justify-center gap-2'
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
  selectedSets
}: {
  dojoType: 'kana' | 'kanji' | 'vocabulary';
  dojoLabel: string;
  itemsCount: number;
  selectedSets?: string[];
}) {
  const formatCompact = () => {
    if (!selectedSets || selectedSets.length === 0) {
      return `${itemsCount} ${dojoLabel.toLowerCase()}`;
    }
    return selectedSets
      .sort((a, b) => {
        const numA = parseInt(a.replace(/\D/g, '')) || 0;
        const numB = parseInt(b.replace(/\D/g, '')) || 0;
        return numA - numB;
      })
      .map(set =>
        set
          .replace('Set ', '')
          .replace('Level ', '')
          .replace(/-group.*$/, '')
      )
      .join(', ');
  };

  const formatFull = () => {
    if (!selectedSets || selectedSets.length === 0) {
      return `${itemsCount} ${dojoLabel.toLowerCase()}`;
    }
    return selectedSets
      .sort((a, b) => {
        const numA = parseInt(a.replace(/\D/g, '')) || 0;
        const numB = parseInt(b.replace(/\D/g, '')) || 0;
        return numA - numB;
      })
      .map(set => {
        const cleaned = set.replace('Set ', '').replace('Level ', '');
        return dojoType === 'kana' ? cleaned : `Level ${cleaned}`;
      })
      .join(', ');
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
            {dojoType === 'kana' ? 'Selected Groups:' : 'Selected Levels:'}
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

function GameModeSelector({
  gameMode,
  setGameMode,
  pickModeSupported
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
              'w-full p-4 rounded-xl text-left hover:cursor-pointer',
              'border-2 flex items-center gap-4 bg-[var(--card-color)]',
              isDisabled && 'opacity-50 cursor-not-allowed',
              isSelected
                ? 'border-[var(--main-color)]'
                : 'border-[var(--border-color)]'
            )}
          >
            <div
              className={clsx(
                'w-10 h-10 rounded-xl flex items-center justify-center shrink-0',
                isSelected
                  ? 'bg-[var(--main-color)] text-[var(--background-color)]'
                  : 'bg-[var(--border-color)] text-[var(--muted-color)]'
              )}
            >
              <Icon size={20} />
            </div>
            <div className='flex-1 min-w-0'>
              <h3 className='text-base font-medium text-[var(--main-color)]'>
                {mode.title}
              </h3>
              <p className='text-xs text-[var(--secondary-color)]'>
                {mode.description}
              </p>
            </div>
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
  );
}

function DurationSelector({
  challengeDuration,
  setChallengeDuration
}: {
  challengeDuration: number;
  setChallengeDuration: (duration: number) => void;
}) {
  const { playClick } = useClick();

  return (
    <div className='bg-[var(--card-color)] rounded-lg p-4 space-y-3'>
      <p className='text-sm font-medium text-[var(--secondary-color)]'>
        Duration:
      </p>
      <div className='flex gap-2 justify-center flex-wrap'>
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
            borderBottomThickness={6}
            borderRadius='2xl'
            className={clsx(
              'px-4 py-2 w-auto ',
              challengeDuration !== duration && 'opacity-60'
            )}
          >
            {duration < 60 ? `${duration}s` : `${duration / 60}m`}
          </ActionButton>
        ))}
      </div>
    </div>
  );
}
