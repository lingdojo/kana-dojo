import localforage from 'localforage';
import type {
  GauntletSessionStats,
  GauntletDifficulty,
  GauntletGameMode,
} from '@/shared/components/Gauntlet/types';

const STORAGE_KEY = 'kanadojo-gauntlet-stats';

interface LifetimeTotals {
  totalSessions: number;
  completedSessions: number;
  totalCorrect: number;
  totalWrong: number;
  bestStreak: number;
}

interface StoredGauntletData {
  version: number;
  sessions: GauntletSessionStats[];
  bestTimes: {
    kana: Record<string, number>;
    kanji: Record<string, number>;
    vocabulary: Record<string, number>;
  };
  /** Accumulated lifetime totals that persist even when sessions are trimmed */
  lifetimeTotals: {
    kana: LifetimeTotals;
    kanji: LifetimeTotals;
    vocabulary: LifetimeTotals;
  };
}

const getDefaultLifetimeTotals = (): LifetimeTotals => ({
  totalSessions: 0,
  completedSessions: 0,
  totalCorrect: 0,
  totalWrong: 0,
  bestStreak: 0,
});

const getDefaultData = (): StoredGauntletData => ({
  version: 1,
  sessions: [],
  bestTimes: {
    kana: {},
    kanji: {},
    vocabulary: {},
  },
  lifetimeTotals: {
    kana: getDefaultLifetimeTotals(),
    kanji: getDefaultLifetimeTotals(),
    vocabulary: getDefaultLifetimeTotals(),
  },
});

/**
 * Generate a key for best time lookup
 */
const getBestTimeKey = (
  difficulty: GauntletDifficulty,
  repetitions: number,
  gameMode: GauntletGameMode,
  totalCharacters: number,
): string => {
  return `${difficulty}-${repetitions}-${gameMode}-${totalCharacters}`;
};

/**
 * Load stored gauntlet data
 */
const loadData = async (): Promise<StoredGauntletData> => {
  try {
    const data = await localforage.getItem<StoredGauntletData>(STORAGE_KEY);
    if (data && data.version === 1) {
      // Migrate: add lifetimeTotals if missing (existing installs)
      if (!data.lifetimeTotals) {
        data.lifetimeTotals = {
          kana: getDefaultLifetimeTotals(),
          kanji: getDefaultLifetimeTotals(),
          vocabulary: getDefaultLifetimeTotals(),
        };
        // Backfill from existing sessions
        for (const session of data.sessions) {
          const totals = data.lifetimeTotals[session.dojoType];
          totals.totalSessions += 1;
          if (session.completed) totals.completedSessions += 1;
          totals.totalCorrect += session.correctAnswers;
          totals.totalWrong += session.wrongAnswers;
          totals.bestStreak = Math.max(totals.bestStreak, session.bestStreak);
        }
      }
      return data;
    }
    return getDefaultData();
  } catch (error) {
    console.warn('[GauntletStats] Failed to load data:', error);
    return getDefaultData();
  }
};

/**
 * Save gauntlet data
 */
const saveData = async (data: StoredGauntletData): Promise<void> => {
  try {
    await localforage.setItem(STORAGE_KEY, data);
  } catch (error) {
    console.warn('[GauntletStats] Failed to save data:', error);
  }
};

/**
 * Generate a unique session ID
 */
const generateSessionId = (): string => {
  return `gauntlet-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
};

/**
 * Save a completed gauntlet session
 * Returns true if this was a new best time
 */
export const saveSession = async (
  stats: Omit<GauntletSessionStats, 'id'>,
): Promise<{ saved: boolean; isNewBest: boolean }> => {
  const data = await loadData();

  const session: GauntletSessionStats = {
    ...stats,
    id: generateSessionId(),
  };

  // Accumulate lifetime totals (persists even when sessions are trimmed)
  const totals = data.lifetimeTotals[stats.dojoType];
  totals.totalSessions += 1;
  if (stats.completed) totals.completedSessions += 1;
  totals.totalCorrect += stats.correctAnswers;
  totals.totalWrong += stats.wrongAnswers;
  totals.bestStreak = Math.max(totals.bestStreak, stats.bestStreak);

  // Add to sessions (keep last 100 for detailed history)
  data.sessions.unshift(session);
  if (data.sessions.length > 100) {
    data.sessions = data.sessions.slice(0, 100);
  }

  // Check/update best time (only for completed runs)
  let isNewBest = false;
  if (stats.completed) {
    const key = getBestTimeKey(
      stats.difficulty,
      stats.repetitionsPerChar,
      stats.gameMode,
      stats.totalCharacters,
    );
    const currentBest = data.bestTimes[stats.dojoType][key];

    if (!currentBest || stats.totalTimeMs < currentBest) {
      data.bestTimes[stats.dojoType][key] = stats.totalTimeMs;
      isNewBest = true;
    }
  }

  await saveData(data);

  return { saved: true, isNewBest };
};

/**
 * Get session history for a dojo
 */
export const getSessionHistory = async (
  dojoType: 'kana' | 'kanji' | 'vocabulary',
  limit: number = 20,
): Promise<GauntletSessionStats[]> => {
  const data = await loadData();
  return data.sessions.filter(s => s.dojoType === dojoType).slice(0, limit);
};

/**
 * Get best time for a specific configuration
 */
export const getBestTime = async (
  dojoType: 'kana' | 'kanji' | 'vocabulary',
  difficulty: GauntletDifficulty,
  repetitions: number,
  gameMode: GauntletGameMode,
  totalCharacters: number,
): Promise<number | null> => {
  const data = await loadData();
  const key = getBestTimeKey(
    difficulty,
    repetitions,
    gameMode,
    totalCharacters,
  );
  return data.bestTimes[dojoType][key] ?? null;
};

/**
 * Get leaderboard (top completed runs) for a dojo
 */
export const getLeaderboard = async (
  dojoType: 'kana' | 'kanji' | 'vocabulary',
  difficulty?: GauntletDifficulty,
  limit: number = 10,
): Promise<GauntletSessionStats[]> => {
  const data = await loadData();

  let sessions = data.sessions.filter(
    s => s.dojoType === dojoType && s.completed,
  );

  if (difficulty) {
    sessions = sessions.filter(s => s.difficulty === difficulty);
  }

  // Sort by time (fastest first)
  sessions.sort((a, b) => a.totalTimeMs - b.totalTimeMs);

  return sessions.slice(0, limit);
};

/**
 * Get overall statistics for a dojo
 */
export const getOverallStats = async (
  dojoType: 'kana' | 'kanji' | 'vocabulary',
): Promise<{
  totalSessions: number;
  completedSessions: number;
  totalCorrect: number;
  totalWrong: number;
  bestStreak: number;
  fastestTime: number | null;
}> => {
  const data = await loadData();
  const totals = data.lifetimeTotals[dojoType];

  // Fastest time still comes from stored sessions (best times are also tracked separately)
  const completedSessions = data.sessions.filter(
    s => s.dojoType === dojoType && s.completed,
  );
  const fastestTime =
    completedSessions.length > 0
      ? Math.min(...completedSessions.map(s => s.totalTimeMs))
      : null;

  return {
    totalSessions: totals.totalSessions,
    completedSessions: totals.completedSessions,
    totalCorrect: totals.totalCorrect,
    totalWrong: totals.totalWrong,
    bestStreak: totals.bestStreak,
    fastestTime,
  };
};

/**
 * Clear all gauntlet stats (for testing/reset)
 */
export const clearAllStats = async (): Promise<void> => {
  await localforage.removeItem(STORAGE_KEY);
};

/**
 * Format time in milliseconds to display string
 */
export const formatTime = (ms: number): string => {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  const centis = Math.floor((ms % 1000) / 10);

  if (minutes > 0) {
    return `${minutes}:${seconds.toString().padStart(2, '0')}.${centis.toString().padStart(2, '0')}`;
  }
  return `${seconds}.${centis.toString().padStart(2, '0')}s`;
};
