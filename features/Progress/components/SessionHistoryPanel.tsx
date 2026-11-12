'use client';

import { useEffect, useMemo, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/shared/utils/utils';
import {
  History,
  Calendar,
  Clock,
  Target,
  Star,
  Trash2,
  ChevronDown,
  ChevronUp,
  Search,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Flame,
  BookOpen,
  Filter,
  X,
  Swords,
  Zap,
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
} from '@/shared/ui/components/alert-dialog';

import { useClick } from '@/shared/hooks/generic/useAudio';
import {
  getAllSessions,
  deleteSession,
  clearAllSessions,
  type SessionRecord,
  type DojoType,
  type SessionType,
  type EndedReason,
  type AttemptEvent,
} from '@/shared/utils/sessionHistory';

export interface SessionHistoryPanelProps {
  className?: string;
}

// Format duration helper
function formatDuration(ms: number): string {
  if (ms <= 0) return '0s';
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  if (minutes === 0) return `${remainingSeconds}s`;
  return `${minutes}m ${remainingSeconds}s`;
}

// Format date helper
function formatDate(timestamp: number): string {
  const date = new Date(timestamp);
  return date.toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

// Dojo Badge Styling
function getDojoBadge(dojo: DojoType) {
  switch (dojo) {
    case 'kana':
      return {
        label: 'Kana',
        className: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
      };
    case 'kanji':
      return {
        label: 'Kanji',
        className: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
      };
    case 'vocabulary':
      return {
        label: 'Vocab',
        className: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
      };
    default:
      return {
        label: dojo,
        className: 'bg-gray-500/10 text-gray-400 border-gray-500/20',
      };
  }
}

// Mode Badge Styling
function getModeBadge(type: SessionType, modeName: string) {
  switch (type) {
    case 'classic':
      return {
        label: modeName || 'Classic',
        icon: <BookOpen className='h-3.5 w-3.5' />,
        className: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
      };
    case 'blitz':
      return {
        label: modeName || 'Blitz',
        icon: <Zap className='h-3.5 w-3.5' />,
        className: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
      };
    case 'gauntlet':
      return {
        label: modeName || 'Gauntlet',
        icon: <Swords className='h-3.5 w-3.5' />,
        className: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
      };
    default:
      return {
        label: modeName || type,
        icon: null,
        className: 'bg-gray-500/10 text-gray-400 border-gray-500/20',
      };
  }
}

// End Reason Badge Styling
function getEndReasonBadge(reason: EndedReason) {
  switch (reason) {
    case 'completed':
      return {
        label: 'Completed',
        className: 'bg-green-500/10 text-green-400 border-green-500/20',
      };
    case 'failed':
      return {
        label: 'Failed',
        className: 'bg-red-500/10 text-red-400 border-red-500/20',
      };
    case 'manual_quit':
      return {
        label: 'Quit Early',
        className: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
      };
    case 'navigation_exit':
    case 'unload_exit':
      return {
        label: 'Exited',
        className: 'bg-neutral-500/10 text-neutral-400 border-neutral-500/20',
      };
    default:
      return {
        label: reason,
        className: 'bg-neutral-500/10 text-neutral-400 border-neutral-500/20',
      };
  }
}

// Per-character breakdown aggregation helper
interface CharacterBreakdown {
  prompt: string;
  correct: number;
  wrong: number;
  total: number;
  accuracy: number;
}

function aggregateCharacterBreakdown(
  attempts: AttemptEvent[],
): CharacterBreakdown[] {
  const map = new Map<string, { correct: number; wrong: number }>();

  attempts.forEach(att => {
    const key = att.questionPrompt || att.questionId;
    if (!key) return;
    const curr = map.get(key) || { correct: 0, wrong: 0 };
    if (att.isCorrect) {
      curr.correct += 1;
    } else {
      curr.wrong += 1;
    }
    map.set(key, curr);
  });

  const result: CharacterBreakdown[] = [];
  map.forEach((val, prompt) => {
    const total = val.correct + val.wrong;
    result.push({
      prompt,
      correct: val.correct,
      wrong: val.wrong,
      total,
      accuracy: total > 0 ? val.correct / total : 0,
    });
  });

  return result.sort((a, b) => a.accuracy - b.accuracy);
}

export default function SessionHistoryPanel({
  className,
}: SessionHistoryPanelProps) {
  const { playClick } = useClick();
  const [sessions, setSessions] = useState<SessionRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedSessionId, setExpandedSessionId] = useState<string | null>(
    null,
  );

  // Filters state
  const [dojoFilter, setDojoFilter] = useState<string>('all');
  const [modeFilter, setModeFilter] = useState<string>('all');
  const [reasonFilter, setReasonFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Dialog states
  const [showClearModal, setShowClearModal] = useState(false);
  const [sessionToDelete, setSessionToDelete] = useState<string | null>(null);

  const fetchSessions = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await getAllSessions();
      setSessions(data);
    } catch {
      setSessions([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  const handleClearAll = async () => {
    await clearAllSessions();
    setShowClearModal(false);
    setExpandedSessionId(null);
    fetchSessions();
  };

  const handleDeleteSingle = async (sessionId: string) => {
    await deleteSession(sessionId);
    setSessionToDelete(null);
    if (expandedSessionId === sessionId) {
      setExpandedSessionId(null);
    }
    fetchSessions();
  };

  // Filter logic
  const filteredSessions = useMemo(() => {
    return sessions.filter(session => {
      if (dojoFilter !== 'all' && session.dojoType !== dojoFilter) {
        return false;
      }
      if (modeFilter !== 'all' && session.sessionType !== modeFilter) {
        return false;
      }
      if (reasonFilter !== 'all') {
        if (
          reasonFilter === 'quit' &&
          session.endedReason !== 'manual_quit' &&
          session.endedReason !== 'navigation_exit' &&
          session.endedReason !== 'unload_exit'
        ) {
          return false;
        }
        if (reasonFilter !== 'quit' && session.endedReason !== reasonFilter) {
          return false;
        }
      }
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchGameMode = session.gameMode.toLowerCase().includes(query);
        const matchSets = session.selectionContext.selectedSets.some(s =>
          s.toLowerCase().includes(query),
        );
        const matchAttempts = session.attempts.some(
          a =>
            a.questionPrompt.toLowerCase().includes(query) ||
            a.userAnswer.toLowerCase().includes(query) ||
            a.expectedAnswers.some(ans => ans.toLowerCase().includes(query)),
        );
        return matchGameMode || matchSets || matchAttempts;
      }
      return true;
    });
  }, [sessions, dojoFilter, modeFilter, reasonFilter, searchQuery]);

  // Aggregate stats of filtered sessions
  const filteredStats = useMemo(() => {
    const count = filteredSessions.length;
    if (count === 0) return { count: 0, avgAccuracy: 0, totalDuration: 0 };

    let totalCorrect = 0;
    let totalAttempts = 0;
    let totalDuration = 0;

    filteredSessions.forEach(s => {
      totalCorrect += s.summary.correct;
      totalAttempts += s.summary.correct + s.summary.wrong;
      totalDuration += s.durationMs;
    });

    const avgAccuracy =
      totalAttempts > 0 ? (totalCorrect / totalAttempts) * 100 : 0;
    return { count, avgAccuracy, totalDuration };
  }, [filteredSessions]);

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header Bar */}
      <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
        <div>
          <h2 className='flex items-center gap-2 text-2xl font-bold text-(--main-color)'>
            <History className='h-6 w-6 text-(--main-color)' />
            Session History
          </h2>
          <p className='text-sm text-(--secondary-color)/70'>
            Review your past training sessions, item accuracy, and detailed logs
          </p>
        </div>

        <div className='flex items-center gap-2'>
          <button
            onClick={() => {
              playClick();
              fetchSessions();
            }}
            disabled={isLoading}
            className='flex cursor-pointer items-center gap-2 rounded-xl border border-(--border-color) bg-(--card-color) px-4 py-2 text-xs font-semibold text-(--main-color) transition-all hover:bg-(--background-color) disabled:opacity-50'
          >
            <RefreshCw className={cn('h-4 w-4', isLoading && 'animate-spin')} />
            Refresh
          </button>

          {sessions.length > 0 && (
            <button
              onClick={() => {
                playClick();
                setShowClearModal(true);
              }}
              className='flex cursor-pointer items-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-2 text-xs font-semibold text-red-400 transition-all hover:bg-red-500/20'
            >
              <Trash2 className='h-4 w-4' />
              Clear History
            </button>
          )}
        </div>
      </div>

      {/* Confirmation Modal for Clear History */}
      <AlertDialog open={showClearModal} onOpenChange={setShowClearModal}>
        <AlertDialogContent className='rounded-3xl border-(--border-color) bg-(--card-color)'>
          <AlertDialogHeader>
            <div className='mb-4 flex items-center gap-4'>
              <div className='flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-red-500/20 bg-red-500/10'>
                <AlertTriangle className='h-6 w-6 text-red-400' />
              </div>
              <AlertDialogTitle className='text-xl font-bold text-(--main-color)'>
                Clear All Session History?
              </AlertDialogTitle>
            </div>
            <AlertDialogDescription className='text-sm text-(--secondary-color)'>
              This will permanently delete your recorded session history logs.
              Lifetime character statistics and overall progress will not be
              affected.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className='gap-2'>
            <AlertDialogCancel className='cursor-pointer rounded-full border-(--border-color) text-(--main-color)'>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleClearAll}
              className='cursor-pointer rounded-full bg-red-500 text-white hover:bg-red-600'
            >
              Clear History
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Confirmation Modal for Deleting Single Session */}
      <AlertDialog
        open={Boolean(sessionToDelete)}
        onOpenChange={open => !open && setSessionToDelete(null)}
      >
        <AlertDialogContent className='rounded-3xl border-(--border-color) bg-(--card-color)'>
          <AlertDialogHeader>
            <div className='mb-4 flex items-center gap-4'>
              <div className='flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-red-500/20 bg-red-500/10'>
                <AlertTriangle className='h-6 w-6 text-red-400' />
              </div>
              <AlertDialogTitle className='text-xl font-bold text-(--main-color)'>
                Delete This Session?
              </AlertDialogTitle>
            </div>
            <AlertDialogDescription className='text-sm text-(--secondary-color)'>
              This action cannot be undone. This session record will be removed
              from your history.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className='gap-2'>
            <AlertDialogCancel className='cursor-pointer rounded-full border-(--border-color) text-(--main-color)'>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() =>
                sessionToDelete && handleDeleteSingle(sessionToDelete)
              }
              className='cursor-pointer rounded-full bg-red-500 text-white hover:bg-red-600'
            >
              Delete Session
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {sessions.length > 0 && (
        <>
          {/* Filters Bar */}
          <div className='flex flex-col gap-3 rounded-2xl border border-(--border-color) bg-(--card-color) p-4 sm:flex-row sm:items-center sm:justify-between'>
            <div className='flex flex-wrap items-center gap-2'>
              <div className='mr-1 flex items-center gap-1.5 text-xs font-semibold text-(--secondary-color)/70'>
                <Filter className='h-3.5 w-3.5' />
                Filters:
              </div>

              {/* Dojo Filter */}
              <select
                value={dojoFilter}
                onChange={e => setDojoFilter(e.target.value)}
                className='cursor-pointer rounded-xl border border-(--border-color) bg-(--background-color) px-3 py-1.5 text-xs font-medium text-(--main-color) focus:ring-1 focus:ring-(--main-color) focus:outline-none'
              >
                <option value='all'>All Dojos</option>
                <option value='kana'>Kana</option>
                <option value='kanji'>Kanji</option>
                <option value='vocabulary'>Vocabulary</option>
              </select>

              {/* Mode Filter */}
              <select
                value={modeFilter}
                onChange={e => setModeFilter(e.target.value)}
                className='cursor-pointer rounded-xl border border-(--border-color) bg-(--background-color) px-3 py-1.5 text-xs font-medium text-(--main-color) focus:ring-1 focus:ring-(--main-color) focus:outline-none'
              >
                <option value='all'>All Modes</option>
                <option value='classic'>Classic</option>
                <option value='blitz'>Blitz</option>
                <option value='gauntlet'>Gauntlet</option>
              </select>

              {/* Reason Filter */}
              <select
                value={reasonFilter}
                onChange={e => setReasonFilter(e.target.value)}
                className='cursor-pointer rounded-xl border border-(--border-color) bg-(--background-color) px-3 py-1.5 text-xs font-medium text-(--main-color) focus:ring-1 focus:ring-(--main-color) focus:outline-none'
              >
                <option value='all'>All Outcomes</option>
                <option value='completed'>Completed</option>
                <option value='quit'>Quit Early</option>
                <option value='failed'>Failed</option>
              </select>
            </div>

            {/* Search Input */}
            <div className='relative min-w-[200px]'>
              <Search className='absolute top-1/2 left-3 h-3.5 w-3.5 -translate-y-1/2 text-(--secondary-color)/50' />
              <input
                type='text'
                placeholder='Search prompt or mode...'
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className='w-full rounded-xl border border-(--border-color) bg-(--background-color) py-1.5 pr-8 pl-8 text-xs text-(--main-color) placeholder:text-(--secondary-color)/50 focus:ring-1 focus:ring-(--main-color) focus:outline-none'
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className='absolute top-1/2 right-2.5 -translate-y-1/2 text-(--secondary-color)/50 hover:text-(--main-color)'
                >
                  <X className='h-3.5 w-3.5' />
                </button>
              )}
            </div>
          </div>

          {/* Metrics summary banner */}
          <div className='grid grid-cols-3 gap-3 text-center'>
            <div className='rounded-2xl border border-(--border-color) bg-(--card-color) p-3'>
              <span className='block text-xs text-(--secondary-color)/70'>
                Sessions
              </span>
              <span className='text-lg font-bold text-(--main-color)'>
                {filteredStats.count}
              </span>
            </div>
            <div className='rounded-2xl border border-(--border-color) bg-(--card-color) p-3'>
              <span className='block text-xs text-(--secondary-color)/70'>
                Avg Accuracy
              </span>
              <span className='text-lg font-bold text-(--main-color)'>
                {filteredStats.avgAccuracy.toFixed(0)}%
              </span>
            </div>
            <div className='rounded-2xl border border-(--border-color) bg-(--card-color) p-3'>
              <span className='block text-xs text-(--secondary-color)/70'>
                Total Time
              </span>
              <span className='text-lg font-bold text-(--main-color)'>
                {formatDuration(filteredStats.totalDuration)}
              </span>
            </div>
          </div>
        </>
      )}

      {/* Main Sessions List / Empty state */}
      {sessions.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className='flex flex-col items-center justify-center rounded-3xl border border-(--border-color) bg-(--card-color) py-16 text-center'
        >
          <History className='mb-4 h-16 w-16 text-(--secondary-color)/30' />
          <h3 className='mb-2 text-xl font-bold text-(--main-color)'>
            No Session History Yet
          </h3>
          <p className='max-w-sm text-sm text-(--secondary-color)/70'>
            Complete practice drills in Classic, Blitz, or Gauntlet mode to
            record your session logs here.
          </p>
        </motion.div>
      ) : filteredSessions.length === 0 ? (
        <div className='rounded-3xl border border-(--border-color) bg-(--card-color) p-12 text-center'>
          <p className='mb-4 text-sm text-(--secondary-color)'>
            No sessions match your selected filters.
          </p>
          <button
            onClick={() => {
              setDojoFilter('all');
              setModeFilter('all');
              setReasonFilter('all');
              setSearchQuery('');
            }}
            className='rounded-xl bg-(--secondary-color)/10 px-4 py-2 text-xs font-semibold text-(--main-color) hover:bg-(--secondary-color)/20'
          >
            Clear Filters
          </button>
        </div>
      ) : (
        <div className='space-y-4'>
          {filteredSessions.map(session => {
            const isExpanded = expandedSessionId === session.id;
            const dojoBadge = getDojoBadge(session.dojoType);
            const modeBadge = getModeBadge(
              session.sessionType,
              session.gameMode,
            );
            const reasonBadge = getEndReasonBadge(session.endedReason);
            const accuracyPct = Math.round(session.summary.accuracy * 100);
            const breakdown = aggregateCharacterBreakdown(session.attempts);

            return (
              <motion.div
                key={session.id}
                layout
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className='overflow-hidden rounded-2xl border border-(--border-color) bg-(--card-color) transition-colors'
              >
                {/* Main Card Summary Line */}
                <div
                  onClick={() => {
                    playClick();
                    setExpandedSessionId(isExpanded ? null : session.id);
                  }}
                  className='flex cursor-pointer flex-col gap-4 p-4 hover:bg-(--background-color)/50 sm:flex-row sm:items-center sm:justify-between'
                >
                  <div className='flex items-center gap-3'>
                    {/* Dojo Badge */}
                    <span
                      className={cn(
                        'rounded-lg border px-2.5 py-1 text-xs font-bold tracking-wider uppercase',
                        dojoBadge.className,
                      )}
                    >
                      {dojoBadge.label}
                    </span>

                    {/* Mode Badge */}
                    <span
                      className={cn(
                        'flex items-center gap-1 rounded-lg border px-2.5 py-1 text-xs font-medium',
                        modeBadge.className,
                      )}
                    >
                      {modeBadge.icon}
                      {modeBadge.label}
                    </span>

                    {/* Outcome Badge */}
                    <span
                      className={cn(
                        'rounded-lg border px-2.5 py-1 text-xs font-medium',
                        reasonBadge.className,
                      )}
                    >
                      {reasonBadge.label}
                    </span>
                  </div>

                  <div className='flex flex-wrap items-center justify-between gap-4 sm:justify-end'>
                    {/* Date and Duration */}
                    <div className='flex items-center gap-3 text-xs text-(--secondary-color)/80'>
                      <span className='flex items-center gap-1'>
                        <Calendar className='h-3.5 w-3.5' />
                        {formatDate(session.startedAt)}
                      </span>
                      <span className='flex items-center gap-1'>
                        <Clock className='h-3.5 w-3.5' />
                        {formatDuration(session.durationMs)}
                      </span>
                    </div>

                    {/* Accuracy Badge */}
                    <div className='flex items-center gap-3'>
                      <div className='flex items-center gap-1 text-xs font-semibold text-(--main-color)'>
                        <Target className='h-3.5 w-3.5 text-(--main-color)' />
                        <span>{accuracyPct}%</span>
                        <span className='font-normal text-(--secondary-color)/60'>
                          ({session.summary.correct}/
                          {session.summary.correct + session.summary.wrong})
                        </span>
                      </div>

                      {/* Best Streak & Stars if available */}
                      {session.summary.bestStreak > 0 && (
                        <div className='hidden items-center gap-1 text-xs text-amber-400 sm:flex'>
                          <Flame className='h-3.5 w-3.5' />
                          <span>{session.summary.bestStreak}</span>
                        </div>
                      )}
                      {session.summary.stars > 0 && (
                        <div className='hidden items-center gap-1 text-xs text-yellow-400 sm:flex'>
                          <Star className='h-3.5 w-3.5 fill-yellow-400' />
                          <span>{session.summary.stars}</span>
                        </div>
                      )}

                      {/* Action buttons */}
                      <button
                        onClick={e => {
                          e.stopPropagation();
                          playClick();
                          setSessionToDelete(session.id);
                        }}
                        title='Delete session'
                        className='text.secondary-color/40 p-1 hover:text-red-400'
                      >
                        <Trash2 className='h-4 w-4' />
                      </button>

                      <div className='p-1 text-(--secondary-color)'>
                        {isExpanded ? (
                          <ChevronUp className='h-4 w-4' />
                        ) : (
                          <ChevronDown className='h-4 w-4' />
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Expanded Detail View */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className='space-y-6 border-t border-(--border-color) bg-(--background-color)/30 p-4'
                    >
                      {/* Selection Context */}
                      {session.selectionContext.selectedSets.length > 0 && (
                        <div>
                          <h4 className='mb-2 text-xs font-semibold tracking-wider text-(--secondary-color) uppercase'>
                            Sets Practiced (
                            {session.selectionContext.selectedCount})
                          </h4>
                          <div className='flex flex-wrap gap-1.5'>
                            {session.selectionContext.selectedSets.map(set => (
                              <span
                                key={set}
                                className='rounded-md border border-(--border-color) bg-(--card-color) px-2 py-0.5 text-xs text-(--main-color)'
                              >
                                {set}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Per-Character Accuracy Summary */}
                      {breakdown.length > 0 && (
                        <div>
                          <h4 className='mb-3 text-xs font-semibold tracking-wider text-(--secondary-color) uppercase'>
                            Character Performance Breakdown ({breakdown.length}{' '}
                            items)
                          </h4>
                          <div className='grid grid-cols-2 gap-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8'>
                            {breakdown.map(item => {
                              const pct = Math.round(item.accuracy * 100);
                              return (
                                <div
                                  key={item.prompt}
                                  className='flex flex-col items-center justify-center rounded-xl border border-(--border-color) bg-(--card-color) p-2.5 text-center'
                                >
                                  <span className='text-lg font-bold text-(--main-color)'>
                                    {item.prompt}
                                  </span>
                                  <span
                                    className={cn(
                                      'text-xs font-bold',
                                      pct >= 80
                                        ? 'text-green-400'
                                        : pct >= 50
                                          ? 'text-amber-400'
                                          : 'text-red-400',
                                    )}
                                  >
                                    {pct}%
                                  </span>
                                  <span className='text-[10px] text-(--secondary-color)/60'>
                                    {item.correct}/{item.total} correct
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {/* Attempt Timeline */}
                      {session.attempts.length > 0 && (
                        <div>
                          <h4 className='mb-3 text-xs font-semibold tracking-wider text-(--secondary-color) uppercase'>
                            Attempt Timeline ({session.attempts.length}{' '}
                            attempts)
                          </h4>
                          <div className='max-h-60 divide-y divide-(--border-color) overflow-y-auto rounded-xl border border-(--border-color) bg-(--card-color) p-2'>
                            {session.attempts.map(att => (
                              <div
                                key={att.idx}
                                className='flex items-center justify-between px-2 py-1.5 text-xs'
                              >
                                <div className='flex items-center gap-2'>
                                  {att.isCorrect ? (
                                    <CheckCircle2 className='h-4 w-4 shrink-0 text-green-400' />
                                  ) : (
                                    <XCircle className='h-4 w-4 shrink-0 text-red-400' />
                                  )}
                                  <span className='font-bold text-(--main-color)'>
                                    {att.questionPrompt}
                                  </span>
                                  <span className='text-(--secondary-color)/60'>
                                    →
                                  </span>
                                  <span
                                    className={cn(
                                      'font-medium',
                                      att.isCorrect
                                        ? 'text-green-400'
                                        : 'text-red-400 line-through',
                                    )}
                                  >
                                    {att.userAnswer || '(blank)'}
                                  </span>
                                  {!att.isCorrect && (
                                    <span className='font-medium text-green-400'>
                                      ({att.expectedAnswers.join(', ')})
                                    </span>
                                  )}
                                </div>

                                <div className='flex items-center gap-3 text-[11px] text-(--secondary-color)/60'>
                                  <span className='capitalize'>
                                    {att.inputKind}
                                  </span>
                                  {att.timeTakenMs && (
                                    <span>
                                      {(att.timeTakenMs / 1000).toFixed(1)}s
                                    </span>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
