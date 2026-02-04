'use client';

import { useMemo, useState } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/shared/lib/utils';
import {
  TrendingUp,
  Target,
  Trophy,
  Users,
  CheckCircle,
  XCircle,
  Trash,
  AlertTriangle,
  ChartColumn,
} from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/shared/components/ui/alert-dialog';
import { ActionButton } from '@/shared/components/ui/ActionButton';
import { useClick } from '@/shared/hooks/useAudio';
import useStatsStore from '../../store/useStatsStore';
import { useStatsAggregator } from '../../hooks/useStatsAggregator';
import OverviewStatsCard from './OverviewStatsCard';
import CharacterMasteryPanel from './CharacterMasteryPanel';
import TimedModeStatsPanel from './TimedModeStatsPanel';
import GauntletStatsPanel from './GauntletStatsPanel';
import MasteryDistributionChart from './MasteryDistributionChart';
import AchievementSummaryBar from './AchievementSummaryBar';

/**
 * Props for the StatsPage component
 */
export interface StatsPageProps {
  /** Optional additional CSS classes */
  className?: string;
}

/**
 * Empty state with premium styling
 */
function EmptyState() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className='flex flex-col items-center justify-center py-24 text-center'
    >
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className='mb-6'
      >
        <ChartColumn className='h-32 w-32 opacity-20' />
      </motion.div>
      <motion.h2
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className='mb-3 text-3xl font-bold text-(--main-color)'
      >
        No Progress Yet
      </motion.h2>
      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className='max-w-md text-(--secondary-color)'
      >
        Start practicing to see your statistics here. Complete training sessions
        to track your progress and character mastery.
      </motion.p>
    </motion.div>
  );
}

/**
 * StatsPage Component
 *
 * Premium dashboard with bold typography, asymmetric layouts,
 * and cohesive visual design.
 */
export default function StatsPage({ className }: StatsPageProps) {
  const { playClick } = useClick();
  const { clearAllProgress } = useStatsStore(
    useShallow(state => ({ clearAllProgress: state.clearAllProgress })),
  );
  const { stats, isLoading } = useStatsAggregator();
  const [showResetModal, setShowResetModal] = useState(false);

  const hasData = stats.totalSessions > 0 || stats.uniqueCharactersLearned > 0;

  const handleResetClick = () => {
    playClick();
    setShowResetModal(true);
  };

  const handleConfirmReset = () => {
    clearAllProgress();
    setShowResetModal(false);
  };

  const overviewStats = useMemo(
    () => [
      {
        title: 'Total Sessions',
        value: stats.totalSessions,
        icon: <TrendingUp className='h-5 w-5' />,
      },
      {
        title: 'Accuracy',
        value: `${stats.overallAccuracy.toFixed(0)}%`,
        subtitle: `${stats.totalCorrect}/${stats.totalCorrect + stats.totalIncorrect}`,
        icon: <Target className='h-5 w-5' />,
      },
      {
        title: 'Best Streak',
        value: stats.bestStreak,
        icon: <Trophy className='h-5 w-5' />,
      },
      {
        title: 'Characters',
        value: stats.uniqueCharactersLearned,
        icon: <Users className='h-5 w-5' />,
      },
      {
        title: 'Correct',
        value: stats.totalCorrect,
        icon: <CheckCircle className='h-5 w-5' />,
      },
      {
        title: 'Incorrect',
        value: stats.totalIncorrect,
        icon: <XCircle className='h-5 w-5' />,
      },
    ],
    [
      stats.bestStreak,
      stats.overallAccuracy,
      stats.totalCorrect,
      stats.totalIncorrect,
      stats.totalSessions,
      stats.uniqueCharactersLearned,
    ],
  );

  const characterMasteryMap = useMemo(
    () =>
      Object.fromEntries(
        stats.characterMastery.map(item => [
          item.character,
          { correct: item.correct, incorrect: item.incorrect },
        ]),
      ),
    [stats.characterMastery],
  );

  return (
    <div className={cn('space-y-8', className)}>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className='flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between'
      >
        <div className='space-y-2'>
          <h1 className='text-4xl font-bold tracking-tight text-(--main-color)'>
            Your Progress
          </h1>
          <p className='text-lg text-(--secondary-color)/70'>
            Track your Japanese learning journey
          </p>
        </div>
        <ActionButton
          onClick={handleResetClick}
          colorScheme='secondary'
          borderColorScheme='secondary'
          borderBottomThickness={8}
          disabled={!hasData}
          className='w-auto cursor-pointer gap-2 px-6 py-3 text-sm font-semibold disabled:bg-(--secondary-color)/70'
        >
          <Trash className='h-4 w-4' />
          Reset
        </ActionButton>
      </motion.div>

      {/* Reset Confirmation Dialog */}
      <AlertDialog open={showResetModal} onOpenChange={setShowResetModal}>
        <AlertDialogContent className='rounded-3xl border-(--border-color) bg-(--card-color)'>
          <AlertDialogHeader>
            <div className='mb-4 flex items-center gap-4'>
              <div className='flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-(--secondary-color)/20 bg-(--secondary-color)/10'>
                <AlertTriangle className='h-7 w-7 text-(--secondary-color)' />
              </div>
              <AlertDialogTitle className='text-2xl font-bold text-(--main-color)'>
                Reset All Progress?
              </AlertDialogTitle>
            </div>
            <AlertDialogDescription className='text-base leading-relaxed text-(--secondary-color)'>
              This will permanently delete all your progress data, including
              sessions, accuracy stats, and character mastery. This action
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className='gap-3'>
            <AlertDialogCancel className='cursor-pointer rounded-full border-(--border-color) px-6 text-(--main-color) transition-colors duration-300 hover:bg-(--background-color)'>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmReset}
              className='cursor-pointer rounded-full bg-(--secondary-color) px-6 transition-colors duration-300 hover:bg-(--secondary-color)/80'
            >
              Reset Progress
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AnimatePresence mode='wait'>
        {!hasData ? (
          <EmptyState key='empty' />
        ) : (
          <motion.div
            key='content'
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className='space-y-8'
          >
            {/* Overview Stats Grid - 3 columns on large screens */}
            <div className='grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6'>
              {overviewStats.map((stat, index) => (
                <OverviewStatsCard
                  key={stat.title}
                  title={stat.title}
                  value={stat.value}
                  subtitle={stat.subtitle}
                  icon={stat.icon}
                  index={index}
                />
              ))}
            </div>

            {/* Achievement Summary */}
            <AchievementSummaryBar summary={stats.achievements} />

            {/* Two-column layout for panels */}
            <div className='grid grid-cols-1 gap-6 lg:grid-cols-2'>
              <CharacterMasteryPanel characterMastery={characterMasteryMap} />
              <MasteryDistributionChart
                distribution={stats.masteryDistribution}
              />
            </div>

            {/* Second two-column row */}
            <div className='grid grid-cols-1 gap-6 lg:grid-cols-2'>
              <TimedModeStatsPanel
                kanaStats={stats.timedKana}
                kanjiStats={stats.timedKanji}
                vocabularyStats={stats.timedVocabulary}
              />
              <GauntletStatsPanel
                stats={stats.gauntlet}
                isLoading={isLoading}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/**
 * Helper function for testing
 */
export function getStatsOverviewDisplayValues(stats: {
  totalSessions: number;
  totalCorrect: number;
  totalIncorrect: number;
  overallAccuracy: number;
  bestStreak: number;
  uniqueCharactersLearned: number;
}): {
  totalSessions: number;
  overallAccuracy: string;
  bestStreak: number;
  uniqueCharactersLearned: number;
  totalCorrect: number;
  totalIncorrect: number;
  hasAllMetrics: boolean;
} {
  return {
    totalSessions: stats.totalSessions,
    overallAccuracy: `${stats.overallAccuracy.toFixed(1)}%`,
    bestStreak: stats.bestStreak,
    uniqueCharactersLearned: stats.uniqueCharactersLearned,
    totalCorrect: stats.totalCorrect,
    totalIncorrect: stats.totalIncorrect,
    hasAllMetrics: true,
  };
}
