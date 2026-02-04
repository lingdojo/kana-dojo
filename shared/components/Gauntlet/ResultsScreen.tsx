'use client';

import { useState, useEffect } from 'react';
import clsx from 'clsx';
import { Link } from '@/core/i18n/routing';
import {
  Trophy,
  Clock,
  Target,
  Flame,
  Heart,
  ArrowLeft,
  RotateCcw,
  ChevronDown,
  ChevronUp,
  Skull,
  Crown,
  Sparkles,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { DIFFICULTY_CONFIG, type GauntletSessionStats } from './types';
import { formatTime, getBestTime } from '@/shared/lib/gauntletStats';
import { useClick } from '@/shared/hooks/useAudio';

interface ResultsScreenProps {
  dojoType: 'kana' | 'kanji' | 'vocabulary';
  stats: Omit<GauntletSessionStats, 'id'>;
  isNewBest: boolean;
  onRestart: () => void;
  onChangeSettings: () => void;
}

export default function ResultsScreen({
  dojoType,
  stats,
  isNewBest,
  onRestart,
  onChangeSettings,
}: ResultsScreenProps) {
  const { playClick } = useClick();
  const [showCharacterBreakdown, setShowCharacterBreakdown] = useState(false);
  const [previousBest, setPreviousBest] = useState<number | null>(null);

  const isVictory = stats.completed;
  const difficultyConfig = DIFFICULTY_CONFIG[stats.difficulty];

  // Trigger confetti on victory (keeping this as it's celebratory, not UI animation)
  useEffect(() => {
    if (isVictory) {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });

      if (isNewBest) {
        setTimeout(() => {
          confetti({
            particleCount: 50,
            angle: 60,
            spread: 55,
            origin: { x: 0 },
          });
          confetti({
            particleCount: 50,
            angle: 120,
            spread: 55,
            origin: { x: 1 },
          });
        }, 250);
      }
    }
  }, [isVictory, isNewBest]);

  // Load previous best for comparison
  useEffect(() => {
    const loadBest = async () => {
      const best = await getBestTime(
        dojoType,
        stats.difficulty,
        stats.repetitionsPerChar,
        stats.gameMode,
        stats.totalCharacters,
      );
      if (best && !isNewBest) {
        setPreviousBest(best);
      }
    };
    loadBest();
  }, [dojoType, stats, isNewBest]);

  // Sort character breakdown by accuracy (worst first)
  const characterBreakdownSorted = Object.entries(stats.characterStats)
    .map(([char, data]) => ({
      char,
      ...data,
      accuracy:
        data.correct + data.wrong > 0
          ? data.correct / (data.correct + data.wrong)
          : 0,
    }))
    .sort((a, b) => a.accuracy - b.accuracy);

  return (
    <div className='flex min-h-[100dvh] flex-col items-center justify-center p-4'>
      <div className='w-full max-w-lg space-y-6'>
        {/* Outcome Banner */}
        <div className='text-center'>
          {isVictory ? (
            <>
              <Trophy size={80} className='mx-auto text-(--main-color)' />
              <h1 className='mt-4 text-3xl font-bold text-(--main-color)'>
                Victory!
              </h1>
              {isNewBest && (
                <div className='mt-2 flex items-center justify-center gap-2 text-(--main-color)'>
                  <Crown size={20} className='fill-current' />
                  <span className='font-medium'>New Personal Best!</span>
                  <Sparkles size={16} />
                </div>
              )}
            </>
          ) : (
            <>
              <Skull
                size={80}
                className='mx-auto text-(--secondary-color)'
              />
              <h1 className='mt-4 text-3xl font-bold text-(--secondary-color)'>
                Game Over
              </h1>
              <p className='mt-2 text-(--muted-color)'>
                You got{' '}
                {Math.round(
                  (stats.questionsCompleted / stats.totalQuestions) * 100,
                )}
                % through the gauntlet
              </p>
            </>
          )}
        </div>

        {/* Difficulty Badge */}
        <div className='flex justify-center'>
          <span
            className={clsx(
              'inline-flex items-center gap-2 rounded-full px-4 py-1',
              'bg-(--card-color) text-sm text-(--secondary-color)',
            )}
          >
            <span>{difficultyConfig.icon}</span>
            {difficultyConfig.label} • {stats.gameMode}
          </span>
        </div>

        {/* Stats Grid */}
        <div className='grid grid-cols-2 gap-3'>
          {/* Time */}
          <div className='rounded-xl bg-(--card-color) p-4'>
            <div className='flex items-center gap-2 text-(--muted-color)'>
              <Clock size={18} />
              <span className='text-sm'>Time</span>
            </div>
            <p className='mt-1 text-2xl font-bold text-(--secondary-color)'>
              {formatTime(stats.totalTimeMs)}
            </p>
            {previousBest && (
              <p className='text-xs text-(--muted-color)'>
                Best: {formatTime(previousBest)}
              </p>
            )}
          </div>

          {/* Accuracy */}
          <div className='rounded-xl bg-(--card-color) p-4'>
            <div className='flex items-center gap-2 text-(--muted-color)'>
              <Target size={18} />
              <span className='text-sm'>Accuracy</span>
            </div>
            <p className='mt-1 text-2xl font-bold text-(--secondary-color)'>
              {Math.round(stats.accuracy * 100)}%
            </p>
            <p className='text-xs text-(--muted-color)'>
              {stats.correctAnswers}/{stats.correctAnswers + stats.wrongAnswers}
            </p>
          </div>

          {/* Best Streak */}
          <div className='rounded-xl bg-(--card-color) p-4'>
            <div className='flex items-center gap-2 text-(--muted-color)'>
              <Flame size={18} />
              <span className='text-sm'>Best Streak</span>
            </div>
            <p className='mt-1 text-2xl font-bold text-(--secondary-color)'>
              {stats.bestStreak}
            </p>
          </div>

          {/* Lives */}
          <div className='rounded-xl bg-(--card-color) p-4'>
            <div className='flex items-center gap-2 text-(--muted-color)'>
              <Heart size={18} />
              <span className='text-sm'>Lives</span>
            </div>
            <p className='mt-1 text-2xl font-bold text-(--secondary-color)'>
              {stats.livesRemaining}/{stats.startingLives}
            </p>
            {stats.livesRegenerated > 0 && (
              <p className='text-xs text-(--main-color)'>
                +{stats.livesRegenerated} regenerated
              </p>
            )}
          </div>
        </div>

        {/* Average Time */}
        <div className='rounded-xl bg-(--card-color) p-4'>
          <div className='flex justify-between text-sm'>
            <span className='text-(--muted-color)'>Avg per question</span>
            <span className='text-(--secondary-color)'>
              {formatTime(stats.averageTimePerQuestionMs)}
            </span>
          </div>
          <div className='mt-2 flex justify-between text-sm'>
            <span className='text-(--muted-color)'>Fastest</span>
            <span className='text-(--main-color)'>
              {formatTime(stats.fastestAnswerMs)}
            </span>
          </div>
          <div className='mt-1 flex justify-between text-sm'>
            <span className='text-(--muted-color)'>Slowest</span>
            <span className='text-(--secondary-color)'>
              {formatTime(stats.slowestAnswerMs)}
            </span>
          </div>
        </div>

        {/* Character Breakdown (Collapsible) */}
        <div className='overflow-hidden rounded-xl bg-(--card-color)'>
          <button
            onClick={() => {
              playClick();
              setShowCharacterBreakdown(!showCharacterBreakdown);
            }}
            className='flex w-full items-center justify-between p-4 text-left hover:bg-(--border-color)/20'
          >
            <span className='font-medium text-(--secondary-color)'>
              Character Breakdown
            </span>
            {showCharacterBreakdown ? (
              <ChevronUp size={20} className='text-(--muted-color)' />
            ) : (
              <ChevronDown size={20} className='text-(--muted-color)' />
            )}
          </button>

          {showCharacterBreakdown && (
            <div className='border-t border-(--border-color) p-4'>
              <div className='max-h-60 space-y-2 overflow-y-auto'>
                {characterBreakdownSorted.map(
                  ({ char, correct, wrong, accuracy }) => (
                    <div
                      key={char}
                      className='flex items-center justify-between rounded-lg bg-(--background-color) p-2'
                    >
                      <span className='text-lg font-medium text-(--secondary-color)'>
                        {char}
                      </span>
                      <div className='flex items-center gap-3'>
                        <span className='text-sm text-(--main-color)'>
                          {correct}✓
                        </span>
                        <span className='text-sm text-(--muted-color)'>
                          {wrong}✗
                        </span>
                        <span
                          className={clsx(
                            'text-sm font-medium',
                            accuracy >= 0.8
                              ? 'text-(--main-color)'
                              : 'text-(--secondary-color)',
                          )}
                        >
                          {Math.round(accuracy * 100)}%
                        </span>
                      </div>
                    </div>
                  ),
                )}
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className='flex flex-col gap-3'>
          <div className='flex gap-3'>
            <button
              onClick={() => {
                playClick();
                onRestart();
              }}
              className={clsx(
                'flex flex-1 items-center justify-center gap-2 rounded-2xl py-3',
                'bg-(--main-color) text-(--background-color)',
                'border-b-4 border-(--main-color-accent)',
                'transition-opacity hover:opacity-90',
              )}
            >
              <RotateCcw size={20} />
              <span>Try Again</span>
            </button>

            <button
              onClick={() => {
                playClick();
                onChangeSettings();
              }}
              className={clsx(
                'flex flex-1 items-center justify-center gap-2 rounded-2xl py-3',
                'bg-(--secondary-color) text-(--background-color)',
                'border-b-4 border-(--secondary-color-accent)',
                'transition-opacity hover:opacity-90',
              )}
            >
              Settings
            </button>
          </div>

          <Link href={`/${dojoType}`} className='w-full'>
            <button
              onClick={() => playClick()}
              className={clsx(
                'flex w-full items-center justify-center gap-2 rounded-2xl py-3',
                'bg-(--card-color) text-(--secondary-color)',
                'border-b-4 border-(--border-color)',
                'transition-colors hover:bg-(--border-color)/50',
              )}
            >
              <ArrowLeft size={20} />
              <span>Back to Menu</span>
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
