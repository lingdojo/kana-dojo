'use client';

import React, { useEffect, useMemo, useState } from 'react';
import {
  CircleArrowLeft,
  RotateCcw,
  Timer,
  Zap,
  Target,
  Star,
  Trophy,
  Activity,
  Flame,
  Heart,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import { useClick } from '@/shared/hooks/generic/useAudio';
import { getBestTime, formatTime as formatGauntletTime } from '@/shared/utils/gauntletStats';
import {
  DIFFICULTY_CONFIG,
  type GauntletSessionStats,
} from '@/shared/ui-composite/Gauntlet/types';
import type { GoalTimer } from '@/shared/ui-composite/Blitz/types';

type DojoType = 'kana' | 'kanji' | 'vocabulary';
type GauntletStats = Omit<GauntletSessionStats, 'id'>;

interface ClassicSessionSummaryProps {
  mode?: 'classic';
  title?: string;
  subtitle?: string;
  correct: number;
  wrong: number;
  bestStreak: number;
  stars: number;
  totalTimeMs?: number;
  correctAnswerTimes?: number[];
  onBackToSelection: () => void;
  onNewSession: () => void;
}

interface BlitzSessionSummaryProps {
  mode: 'blitz';
  dojoType: DojoType;
  challengeDuration: number;
  stats: { correct: number; wrong: number; bestStreak: number };
  showGoalTimers: boolean;
  goals: GoalTimer[];
  endedReason?: 'completed' | 'manual_quit';
  onBackToSelection: () => void;
  onNewSession: () => void;
}

interface GauntletSessionSummaryProps {
  mode: 'gauntlet';
  dojoType: DojoType;
  stats: GauntletStats;
  isNewBest: boolean;
  endedReason?: 'completed' | 'failed' | 'manual_quit';
  onBackToSelection: () => void;
  onNewSession: () => void;
}

export type SessionSummaryProps =
  | ClassicSessionSummaryProps
  | BlitzSessionSummaryProps
  | GauntletSessionSummaryProps;

const formatTime = (ms: number) => {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
};

export default function SessionSummaryScreen(props: SessionSummaryProps) {
  if (props.mode === 'blitz') return <BlitzSummary {...props} />;
  if (props.mode === 'gauntlet') return <GauntletSummary {...props} />;
  return <ClassicSummary {...props} />;
}

function ClassicSummary({
  title = 'session summary',
  subtitle = 'your progress is saved.',
  correct,
  wrong,
  bestStreak,
  stars,
  totalTimeMs = 0,
  correctAnswerTimes = [],
  onBackToSelection,
  onNewSession,
}: ClassicSessionSummaryProps) {
  const { playClick } = useClick();
  const total = correct + wrong;
  const accuracy = total > 0 ? Math.round((correct / total) * 100) : 0;
  const timeFormatted = formatTime(totalTimeMs);

  const avgResponseTime = useMemo(() => {
    if (correctAnswerTimes.length === 0) return 0;
    const sum = correctAnswerTimes.reduce((a, b) => a + b, 0);
    return sum / correctAnswerTimes.length;
  }, [correctAnswerTimes]);

  const fastestResponse = useMemo(() => {
    if (correctAnswerTimes.length === 0) return 0;
    return Math.min(...correctAnswerTimes);
  }, [correctAnswerTimes]);

  const apm = useMemo(() => {
    if (totalTimeMs === 0) return 0;
    return Math.round((total / (totalTimeMs / 60000)) * 10) / 10;
  }, [total, totalTimeMs]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        playClick();
        onBackToSelection();
      }
      if (event.key === 'Enter') {
        event.preventDefault();
        playClick();
        onNewSession();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onBackToSelection, onNewSession, playClick]);

  return (
    <SummaryLayout
      title={title}
      subtitle={subtitle}
      total={total}
      correct={correct}
      accuracy={accuracy}
      heroValue={accuracy === 100 ? 'perfect run' : `${correct} / ${total}`}
      heroDescription={`out of ${total} attempts, you answered ${correct} correctly.`}
      timeValue={timeFormatted}
      topRightLabel='stars'
      topRightValue={`+${stars}`}
      firstStatLabel='best streak'
      firstStatValue={bestStreak}
      secondStatLabel='avg. speed'
      secondStatValue={`${avgResponseTime.toFixed(1)}s`}
      thirdStatLabel='top speed'
      thirdStatValue={`${fastestResponse.toFixed(2)}s`}
      fourthStatLabel='answers/min'
      fourthStatValue={apm}
      onBackToSelection={onBackToSelection}
      onNewSession={onNewSession}
      primaryAction='new session'
      mobilePrimaryAction='new'
    />
  );
}

function BlitzSummary({
  challengeDuration,
  stats,
  showGoalTimers,
  goals,
  endedReason = 'completed',
  onBackToSelection,
  onNewSession,
}: BlitzSessionSummaryProps) {
  const total = stats.correct + stats.wrong;
  const accuracy = total > 0 ? Math.round((stats.correct / total) * 100) : 0;
  const qpm = total > 0 ? ((total / challengeDuration) * 60).toFixed(1) : '0';
  const reached = goals.filter(goal => goal.reached);
  const missed = goals.filter(goal => !goal.reached);

  return (
    <SummaryLayout
      title={endedReason === 'manual_quit' ? 'session ended' : 'challenge complete!'}
      subtitle={
        endedReason === 'manual_quit'
          ? 'you quit this blitz session early.'
          : `${challengeDuration < 60 ? `${challengeDuration} seconds` : `${challengeDuration / 60} minute${challengeDuration > 60 ? 's' : ''}`} challenge finished`
      }
      total={total}
      correct={stats.correct}
      accuracy={accuracy}
      heroValue={`${stats.correct} / ${total}`}
      heroDescription={`out of ${total} attempts, you answered ${stats.correct} correctly.`}
      timeValue={formatTime(challengeDuration * 1000)}
      topRightLabel='q/min'
      topRightValue={qpm}
      firstStatLabel='best streak'
      firstStatValue={stats.bestStreak}
      secondStatLabel='correct'
      secondStatValue={stats.correct}
      thirdStatLabel='wrong'
      thirdStatValue={stats.wrong}
      fourthStatLabel='answers/min'
      fourthStatValue={qpm}
      onBackToSelection={onBackToSelection}
      onNewSession={onNewSession}
      primaryAction='try again'
      mobilePrimaryAction='again'
      extraContent={
        showGoalTimers && goals.length > 0 ? (
          <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6'>
            <div className='flex flex-col rounded-[2rem] border-2 border-(--secondary-color)/10 bg-(--background-color) p-5 sm:p-6'>
              <div className='mb-2 flex items-center gap-2'>
                <CheckCircle2 className='h-4 w-4 text-(--main-color)' />
                <span className='text-xs leading-none font-bold tracking-widest text-(--secondary-color) uppercase opacity-60'>
                  reached ({reached.length})
                </span>
              </div>
              <div className='space-y-2'>
                {reached.map(goal => (
                  <div key={goal.id} className='rounded-xl border border-(--main-color)/20 p-2 text-sm text-(--main-color)'>
                    {goal.label}
                  </div>
                ))}
              </div>
            </div>
            <div className='flex flex-col rounded-[2rem] border-2 border-(--secondary-color)/10 bg-(--background-color) p-5 sm:p-6'>
              <div className='mb-2 flex items-center gap-2'>
                <XCircle className='h-4 w-4 text-(--secondary-color) opacity-60' />
                <span className='text-xs leading-none font-bold tracking-widest text-(--secondary-color) uppercase opacity-60'>
                  missed ({missed.length})
                </span>
              </div>
              <div className='space-y-2'>
                {missed.map(goal => (
                  <div key={goal.id} className='rounded-xl border border-(--border-color) p-2 text-sm text-(--secondary-color) opacity-70'>
                    {goal.label}
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : null
      }
    />
  );
}

function GauntletSummary({
  dojoType,
  stats,
  isNewBest,
  endedReason = stats.completed ? 'completed' : 'failed',
  onBackToSelection,
  onNewSession,
}: GauntletSessionSummaryProps) {
  const { playClick } = useClick();
  const [showCharacterBreakdown, setShowCharacterBreakdown] = useState(false);
  const [previousBest, setPreviousBest] = useState<number | null>(null);
  const total = stats.correctAnswers + stats.wrongAnswers;
  const accuracy = total > 0 ? Math.round((stats.correctAnswers / total) * 100) : 0;
  const breakdown = Object.entries(stats.characterStats)
    .map(([char, data]) => ({
      char,
      correct: data.correct,
      wrong: data.wrong,
      accuracy:
        data.correct + data.wrong > 0 ? data.correct / (data.correct + data.wrong) : 0,
    }))
    .sort((a, b) => a.accuracy - b.accuracy);

  useEffect(() => {
    if (isNewBest) {
      setPreviousBest(null);
      return;
    }
    const loadBest = async () => {
      const best = await getBestTime(
        dojoType,
        stats.difficulty,
        stats.repetitionsPerChar,
        stats.gameMode,
        stats.totalCharacters,
      );
      if (best) setPreviousBest(best);
    };
    void loadBest();
  }, [dojoType, isNewBest, stats]);

  return (
    <SummaryLayout
      title={endedReason === 'completed' ? 'victory!' : endedReason === 'manual_quit' ? 'session ended' : 'game over'}
      subtitle={
        endedReason === 'manual_quit'
          ? `you ended this run early at ${Math.round((stats.questionsCompleted / stats.totalQuestions) * 100)}%.`
          : endedReason === 'completed'
            ? 'gauntlet cleared.'
            : `you got ${Math.round((stats.questionsCompleted / stats.totalQuestions) * 100)}% through the gauntlet`
      }
      total={total}
      correct={stats.correctAnswers}
      accuracy={accuracy}
      heroValue={`${stats.correctAnswers} / ${total}`}
      heroDescription={`out of ${total} attempts, you answered ${stats.correctAnswers} correctly.`}
      timeValue={formatGauntletTime(stats.totalTimeMs)}
      topRightLabel='lives'
      topRightValue={`${stats.livesRemaining}/${stats.startingLives}`}
      firstStatLabel='best streak'
      firstStatValue={stats.bestStreak}
      secondStatLabel='avg/question'
      secondStatValue={formatGauntletTime(stats.averageTimePerQuestionMs)}
      thirdStatLabel='fastest'
      thirdStatValue={formatGauntletTime(stats.fastestAnswerMs)}
      fourthStatLabel='accuracy'
      fourthStatValue={`${accuracy}%`}
      onBackToSelection={onBackToSelection}
      onNewSession={onNewSession}
      primaryAction='try again'
      mobilePrimaryAction='again'
      extraContent={
        <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6'>
          <div className='flex flex-col rounded-[2rem] border-2 border-(--secondary-color)/10 bg-(--background-color) p-5 sm:p-6'>
            <div className='mb-2 flex items-center gap-2'>
              <Flame className='h-4 w-4 text-(--secondary-color) opacity-60' />
              <span className='text-xs leading-none font-bold tracking-widest text-(--secondary-color) uppercase opacity-60'>
                difficulty
              </span>
            </div>
            <div className='text-xl font-black tracking-tighter text-(--main-color) sm:text-2xl'>
              {DIFFICULTY_CONFIG[stats.difficulty].icon} {DIFFICULTY_CONFIG[stats.difficulty].label} • {stats.gameMode}
            </div>
            {(isNewBest || previousBest) && (
              <p className='mt-2 text-sm text-(--secondary-color) lowercase opacity-60'>
                {isNewBest ? 'new personal best!' : `best: ${formatGauntletTime(previousBest!)}`}
              </p>
            )}
          </div>

          <div className='flex flex-col rounded-[2rem] border-2 border-(--secondary-color)/10 bg-(--background-color) p-5 sm:p-6'>
            <button
              onClick={() => {
                playClick();
                setShowCharacterBreakdown(prev => !prev);
              }}
              className='mb-2 flex items-center gap-2 text-left'
            >
              <Heart className='h-4 w-4 text-(--secondary-color) opacity-60' />
              <span className='text-xs leading-none font-bold tracking-widest text-(--secondary-color) uppercase opacity-60'>
                character breakdown
              </span>
            </button>
            {showCharacterBreakdown ? (
              <div className='max-h-44 space-y-2 overflow-y-auto'>
                {breakdown.map(item => (
                  <div key={item.char} className='flex items-center justify-between rounded-xl border border-(--border-color) p-2'>
                    <span className='text-lg font-bold text-(--main-color)'>{item.char}</span>
                    <span className='text-sm text-(--secondary-color)'>
                      {item.correct}✓ {item.wrong}✗ {Math.round(item.accuracy * 100)}%
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className='text-sm text-(--secondary-color) lowercase opacity-60'>tap to view weakest characters first.</p>
            )}
          </div>
        </div>
      }
    />
  );
}

interface SummaryLayoutProps {
  title: string;
  subtitle: string;
  total: number;
  correct: number;
  accuracy: number;
  heroValue: string;
  heroDescription: string;
  timeValue: string | number;
  topRightLabel: string;
  topRightValue: string | number;
  firstStatLabel: string;
  firstStatValue: string | number;
  secondStatLabel: string;
  secondStatValue: string | number;
  thirdStatLabel: string;
  thirdStatValue: string | number;
  fourthStatLabel: string;
  fourthStatValue: string | number;
  onBackToSelection: () => void;
  onNewSession: () => void;
  primaryAction: string;
  mobilePrimaryAction: string;
  extraContent?: React.ReactNode;
}

function SummaryLayout({
  title,
  subtitle,
  total,
  correct,
  accuracy,
  heroValue,
  heroDescription,
  timeValue,
  topRightLabel,
  topRightValue,
  firstStatLabel,
  firstStatValue,
  secondStatLabel,
  secondStatValue,
  thirdStatLabel,
  thirdStatValue,
  fourthStatLabel,
  fourthStatValue,
  onBackToSelection,
  onNewSession,
  primaryAction,
  mobilePrimaryAction,
  extraContent,
}: SummaryLayoutProps) {
  const { playClick } = useClick();

  return (
    <div className='fixed inset-0 z-50 flex h-full w-full flex-col overflow-x-hidden overflow-y-auto bg-(--background-color)'>
      <div className='mx-auto flex min-h-full w-full max-w-7xl flex-1 flex-col justify-start px-4 py-8 sm:min-h-[100dvh] sm:justify-center sm:px-8 sm:py-20 lg:px-12 lg:py-16'>
        <div className='mb-8 flex flex-col items-center gap-1 text-center select-none sm:mb-12 sm:items-start sm:text-left lg:mb-16'>
          <h1 className='text-3xl font-black tracking-tighter text-(--main-color) lowercase sm:text-5xl lg:text-6xl'>{title}</h1>
          <p className='text-base font-medium tracking-tight text-(--secondary-color) lowercase opacity-60 sm:text-xl'>{subtitle}</p>
        </div>

        <div className='mb-8 flex flex-col gap-4 sm:mb-12 sm:gap-6 lg:mb-16'>
          <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-4'>
            <div className='relative flex flex-col items-center justify-center rounded-[2.5rem] border-2 border-(--main-color)/20 bg-(--background-color) p-6 sm:col-span-2 sm:flex-row sm:gap-12 sm:p-10'>
              <div className='relative flex aspect-square w-full max-w-36 flex-col items-center justify-center sm:max-w-44'>
                <div className='h-full w-full rounded-full' style={{ background: `conic-gradient(var(--main-color) 0deg ${accuracy * 3.6}deg, var(--border-color) ${accuracy * 3.6}deg 360deg)` }} />
                <div className='absolute inset-[12%] rounded-full bg-(--background-color)' />
                <div className='absolute inset-0 flex flex-col items-center justify-center'>
                  <span className='text-4xl font-black tracking-tighter text-(--main-color) sm:text-5xl'>{accuracy}%</span>
                </div>
              </div>
              <div className='mt-6 flex flex-col items-center text-center sm:mt-0 sm:items-start sm:text-left'>
                <div className='mb-1 flex items-center gap-2'>
                  <Target className='h-5 w-5 text-(--main-color)' />
                  <span className='text-sm leading-none font-bold tracking-wider text-(--secondary-color) uppercase opacity-60'>accuracy</span>
                </div>
                <div className='text-3xl font-black tracking-tighter text-(--main-color) sm:text-5xl'>{heroValue}</div>
                <p className='mt-2 text-sm text-(--secondary-color) lowercase opacity-60 sm:text-base'>{heroDescription}</p>
              </div>
            </div>

            <div className='flex flex-col justify-between rounded-[2.5rem] border-2 border-(--main-color)/20 bg-(--background-color) p-6 sm:p-8'>
              <div className='mb-auto flex items-center gap-2'>
                <Timer className='h-5 w-5 text-(--main-color)' />
                <span className='text-xs leading-none font-bold tracking-widest text-(--secondary-color) uppercase opacity-60'>time spent</span>
              </div>
              <div className='mt-4 text-4xl font-black tracking-tighter text-(--main-color) sm:text-5xl'>{timeValue}</div>
            </div>

            <div className='flex flex-col justify-between rounded-[2.5rem] border-2 border-(--main-color)/20 bg-(--background-color) p-6 sm:p-8'>
              <div className='mb-auto flex items-center gap-2'>
                <Star className='h-5 w-5 text-(--main-color)' />
                <span className='text-xs leading-none font-bold tracking-widest text-(--secondary-color) uppercase opacity-60'>{topRightLabel}</span>
              </div>
              <div className='mt-4 text-4xl font-black tracking-tighter text-(--main-color) sm:text-5xl'>{topRightValue}</div>
            </div>
          </div>

          <div className='grid grid-cols-2 gap-4 sm:grid-cols-4 sm:gap-6'>
            <MiniStat icon={<Trophy className='h-4 w-4 text-(--secondary-color) opacity-60' />} label={firstStatLabel} value={firstStatValue} />
            <MiniStat icon={<Zap className='h-4 w-4 text-(--secondary-color) opacity-60' />} label={secondStatLabel} value={secondStatValue} />
            <MiniStat icon={<Activity className='h-4 w-4 text-(--secondary-color) opacity-60' />} label={thirdStatLabel} value={thirdStatValue} />
            <MiniStat icon={<Zap className='h-4 w-4 text-(--secondary-color) opacity-60' />} label={fourthStatLabel} value={fourthStatValue} />
          </div>

          {extraContent}
        </div>

        <div className='sticky bottom-0 z-10 -mx-4 mt-auto flex w-auto items-center justify-center gap-3 border-t-2 border-(--border-color) bg-(--background-color) py-4 px-4 select-none sm:static sm:mx-0 sm:w-full sm:justify-start sm:gap-5 sm:border-0 sm:bg-transparent sm:px-0 sm:py-0'>
          <button onClick={() => { playClick(); onBackToSelection(); }} className='group flex h-14 flex-1 cursor-pointer items-center justify-center gap-3 rounded-xl bg-(--secondary-color) px-4 text-lg font-bold text-(--background-color) lowercase outline-hidden transition-all duration-150 sm:px-10 sm:text-xl md:flex-none'>
            <CircleArrowLeft className='h-5 w-5 group-hover:animate-none sm:h-6 sm:w-6' strokeWidth={2.5} />
            <span className='leading-none'>menu</span>
          </button>
          <button onClick={() => { playClick(); onNewSession(); }} className='group flex h-14 flex-1 cursor-pointer items-center justify-center gap-3 rounded-xl bg-(--main-color) px-4 text-lg font-bold text-(--background-color) lowercase outline-hidden transition-all duration-150 sm:px-12 sm:text-xl md:flex-none'>
            <RotateCcw className='h-5 w-5 group-hover:animate-none sm:h-6 sm:w-6' strokeWidth={2.5} />
            <span className='leading-none sm:hidden'>{mobilePrimaryAction}</span>
            <span className='hidden leading-none sm:inline'>{primaryAction}</span>
          </button>
        </div>
      </div>
    </div>
  );
}

function MiniStat({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
}) {
  return (
    <div className='flex flex-col rounded-[2rem] border-2 border-(--secondary-color)/10 bg-(--background-color) p-5 sm:p-6'>
      <div className='mb-2 flex items-center gap-2'>
        {icon}
        <span className='text-xs leading-none font-bold tracking-widest text-(--secondary-color) uppercase opacity-60'>{label}</span>
      </div>
      <div className='text-2xl font-black tracking-tighter text-(--main-color) sm:text-3xl'>{value}</div>
    </div>
  );
}
