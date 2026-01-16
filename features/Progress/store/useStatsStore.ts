import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Types
interface CharacterScore {
  correct: number;
  wrong: number;
  accuracy: number;
}

// Gauntlet-specific stats (Requirements 4.1-4.10)
interface GauntletStats {
  totalRuns: number;
  completedRuns: number;
  normalCompleted: number;
  hardCompleted: number;
  instantDeathCompleted: number;
  perfectRuns: number;
  noDeathRuns: number;
  livesRegenerated: number;
  bestStreak: number;
}

// Blitz-specific stats (Requirements 5.1-5.8)
interface BlitzStats {
  totalSessions: number;
  bestSessionScore: number;
  bestStreak: number;
  totalCorrect: number;
}

interface AllTimeStats {
  totalSessions: number;
  totalCorrect: number;
  totalIncorrect: number;
  bestStreak: number;
  characterMastery: Record<string, { correct: number; incorrect: number }>;
  // Content-specific tracking (Requirements 1.1-1.8, 2.1-2.10, 3.1-3.6)
  hiraganaCorrect: number;
  katakanaCorrect: number;
  kanjiCorrectByLevel: Record<string, number>; // e.g., { N5: 100, N4: 50 }
  vocabularyCorrect: number;
  // Gauntlet-specific tracking (Requirements 4.1-4.10)
  gauntletStats: GauntletStats;
  // Blitz-specific tracking (Requirements 5.1-5.8)
  blitzStats: BlitzStats;
  // Time and speed tracking (Requirements 6.1-6.5)
  fastestAnswerMs: number;
  answerTimesMs: number[];
  // Variety and exploration tracking (Requirements 8.1-8.3)
  dojosUsed: string[];
  modesUsed: string[];
  challengeModesUsed: string[];
  // Day tracking (Requirements 8.4-8.7)
  trainingDays: string[]; // ISO date strings
  // Wrong streak tracking (Requirement 10.2)
  currentWrongStreak: number;
  maxWrongStreak: number;
}

// Default values for new stats
const defaultGauntletStats: GauntletStats = {
  totalRuns: 0,
  completedRuns: 0,
  normalCompleted: 0,
  hardCompleted: 0,
  instantDeathCompleted: 0,
  perfectRuns: 0,
  noDeathRuns: 0,
  livesRegenerated: 0,
  bestStreak: 0
};

const defaultBlitzStats: BlitzStats = {
  totalSessions: 0,
  bestSessionScore: 0,
  bestStreak: 0,
  totalCorrect: 0
};

// Max array sizes to prevent memory exhaustion over extended use
const MAX_ANSWER_TIMES = 1000; // Keep last 1000 answer times
const MAX_TRAINING_DAYS = 400; // Keep last ~13 months of training days
const MAX_CHARACTER_HISTORY = 500; // Keep last 500 characters per session

/**
 * Cap an array to a maximum size, keeping the most recent entries
 */
function capArray<T>(arr: T[], maxSize: number): T[] {
  if (arr.length <= maxSize) return arr;
  return arr.slice(-maxSize);
}

interface IStatsState {
  // Core game stats
  score: number;
  setScore: (newScore: number) => void;
  numCorrectAnswers: number;
  numWrongAnswers: number;
  currentStreak: number;
  incrementCorrectAnswers: () => void;
  incrementWrongAnswers: () => void;

  // UI state
  showStats: boolean;
  toggleStats: () => void;

  // Timing
  correctAnswerTimes: number[];
  addCorrectAnswerTime: (time: number) => void;
  totalMilliseconds: number;
  setNewTotalMilliseconds: (ms: number) => void;

  // Character tracking
  characterHistory: string[];
  addCharacterToHistory: (character: string) => void;
  characterScores: Record<string, CharacterScore>;
  incrementCharacterScore: (
    character: string,
    field: 'correct' | 'wrong'
  ) => void;

  // Progress indicators
  stars: number;
  setStars: (stars: number) => void;
  iconIndices: number[];
  addIconIndex: (index: number) => void;

  // Timed Kana stats
  timedCorrectAnswers: number;
  timedWrongAnswers: number;
  timedStreak: number;
  timedBestStreak: number;
  incrementTimedCorrectAnswers: () => void;
  incrementTimedWrongAnswers: () => void;
  resetTimedStats: () => void;

  // Timed Vocab stats
  timedVocabCorrectAnswers: number;
  timedVocabWrongAnswers: number;
  timedVocabStreak: number;
  timedVocabBestStreak: number;
  incrementTimedVocabCorrectAnswers: () => void;
  incrementTimedVocabWrongAnswers: () => void;
  resetTimedVocabStats: () => void;

  // Timed Kanji stats
  timedKanjiCorrectAnswers: number;
  timedKanjiWrongAnswers: number;
  timedKanjiStreak: number;
  timedKanjiBestStreak: number;
  incrementTimedKanjiCorrectAnswers: () => void;
  incrementTimedKanjiWrongAnswers: () => void;
  resetTimedKanjiStats: () => void;

  // Historical tracking
  allTimeStats: AllTimeStats;
  saveSession: () => void;
  clearAllProgress: () => void;
  resetStats: () => void;

  // Content-specific tracking actions (Requirements 1.1-1.8, 2.1-2.10, 3.1-3.6)
  incrementHiraganaCorrect: () => void;
  incrementKatakanaCorrect: () => void;
  incrementKanjiCorrect: (jlptLevel: string) => void;
  incrementVocabularyCorrect: () => void;

  // Gauntlet-specific tracking actions (Requirements 4.1-4.10)
  recordGauntletRun: (params: {
    completed: boolean;
    difficulty: 'normal' | 'hard' | 'instant-death';
    isPerfect: boolean;
    livesLost: number;
    livesRegenerated: number;
    bestStreak: number;
  }) => void;

  // Blitz-specific tracking actions (Requirements 5.1-5.8)
  recordBlitzSession: (params: {
    score: number;
    streak: number;
    correctAnswers: number;
  }) => void;

  // Time and speed tracking actions (Requirements 6.1-6.5)
  recordAnswerTime: (timeMs: number) => void;

  // Variety and exploration tracking actions (Requirements 8.1-8.3)
  recordDojoUsed: (dojo: string) => void;
  recordModeUsed: (mode: string) => void;
  recordChallengeModeUsed: (challengeMode: string) => void;

  // Day tracking actions (Requirements 8.4-8.7)
  recordTrainingDay: () => void;

  // Wrong streak tracking actions (Requirement 10.2)
  incrementWrongStreak: () => void;
  resetWrongStreak: () => void;
}

// Helper for timed stats increment correct
const createTimedCorrectIncrement = (
  correctKey: keyof IStatsState,
  streakKey: keyof IStatsState,
  bestStreakKey: keyof IStatsState
) => {
  return (s: IStatsState) => {
    const newStreak = (s[streakKey] as number) + 1;
    return {
      [correctKey]: (s[correctKey] as number) + 1,
      [streakKey]: newStreak,
      [bestStreakKey]: Math.max(s[bestStreakKey] as number, newStreak)
    };
  };
};

// Helper for timed stats increment wrong
const createTimedWrongIncrement = (
  wrongKey: keyof IStatsState,
  streakKey: keyof IStatsState
) => {
  return (s: IStatsState) => ({
    [wrongKey]: (s[wrongKey] as number) + 1,
    [streakKey]: 0
  });
};

const useStatsStore = create<IStatsState>()(
  persist(
    (set, get) => ({
      // Core game stats
      score: 0,
      setScore: score => set({ score }),
      numCorrectAnswers: 0,
      numWrongAnswers: 0,
      currentStreak: 0,

      incrementCorrectAnswers: () =>
        set(s => ({
          numCorrectAnswers: s.numCorrectAnswers + 1,
          currentStreak: s.currentStreak + 1
        })),

      incrementWrongAnswers: () =>
        set(s => ({
          numWrongAnswers: s.numWrongAnswers + 1,
          currentStreak: 0
        })),

      // UI state
      showStats: false,
      toggleStats: () => set(s => ({ showStats: !s.showStats })),

      // Timing
      correctAnswerTimes: [],
      addCorrectAnswerTime: time =>
        set(s => ({
          correctAnswerTimes: capArray(
            [...s.correctAnswerTimes, time],
            MAX_ANSWER_TIMES
          )
        })),
      totalMilliseconds: 0,
      setNewTotalMilliseconds: totalMilliseconds => set({ totalMilliseconds }),

      // Character tracking
      characterHistory: [],
      addCharacterToHistory: character =>
        set(s => ({
          characterHistory: capArray(
            [...s.characterHistory, character],
            MAX_CHARACTER_HISTORY
          )
        })),

      characterScores: {},
      incrementCharacterScore: (character, field) =>
        set(s => {
          const currentScore = s.characterScores[character] || {
            correct: 0,
            wrong: 0,
            accuracy: 0
          };
          const updatedScore = {
            ...currentScore,
            [field]: currentScore[field] + 1
          };
          const { correct, wrong } = updatedScore;
          updatedScore.accuracy = correct / (correct + wrong);
          return {
            characterScores: {
              ...s.characterScores,
              [character]: updatedScore
            }
          };
        }),

      // Progress indicators
      stars: 0,
      setStars: stars => set({ stars }),
      iconIndices: [],
      addIconIndex: index =>
        set(s => ({ iconIndices: [...s.iconIndices, index] })),

      // Timed Kana stats
      timedCorrectAnswers: 0,
      timedWrongAnswers: 0,
      timedStreak: 0,
      timedBestStreak: 0,

      incrementTimedCorrectAnswers: () =>
        set(
          createTimedCorrectIncrement(
            'timedCorrectAnswers',
            'timedStreak',
            'timedBestStreak'
          )
        ),

      incrementTimedWrongAnswers: () =>
        set(createTimedWrongIncrement('timedWrongAnswers', 'timedStreak')),

      resetTimedStats: () =>
        set({ timedCorrectAnswers: 0, timedWrongAnswers: 0, timedStreak: 0 }),

      // Timed Vocab stats
      timedVocabCorrectAnswers: 0,
      timedVocabWrongAnswers: 0,
      timedVocabStreak: 0,
      timedVocabBestStreak: 0,

      incrementTimedVocabCorrectAnswers: () =>
        set(
          createTimedCorrectIncrement(
            'timedVocabCorrectAnswers',
            'timedVocabStreak',
            'timedVocabBestStreak'
          )
        ),

      incrementTimedVocabWrongAnswers: () =>
        set(
          createTimedWrongIncrement(
            'timedVocabWrongAnswers',
            'timedVocabStreak'
          )
        ),

      resetTimedVocabStats: () =>
        set({
          timedVocabCorrectAnswers: 0,
          timedVocabWrongAnswers: 0,
          timedVocabStreak: 0
        }),

      // Timed Kanji stats
      timedKanjiCorrectAnswers: 0,
      timedKanjiWrongAnswers: 0,
      timedKanjiStreak: 0,
      timedKanjiBestStreak: 0,

      incrementTimedKanjiCorrectAnswers: () =>
        set(
          createTimedCorrectIncrement(
            'timedKanjiCorrectAnswers',
            'timedKanjiStreak',
            'timedKanjiBestStreak'
          )
        ),

      incrementTimedKanjiWrongAnswers: () =>
        set(
          createTimedWrongIncrement(
            'timedKanjiWrongAnswers',
            'timedKanjiStreak'
          )
        ),

      resetTimedKanjiStats: () =>
        set({
          timedKanjiCorrectAnswers: 0,
          timedKanjiWrongAnswers: 0,
          timedKanjiStreak: 0
        }),

      // Historical tracking
      allTimeStats: {
        totalSessions: 0,
        totalCorrect: 0,
        totalIncorrect: 0,
        bestStreak: 0,
        characterMastery: {},
        // Content-specific tracking
        hiraganaCorrect: 0,
        katakanaCorrect: 0,
        kanjiCorrectByLevel: {},
        vocabularyCorrect: 0,
        // Gauntlet-specific tracking
        gauntletStats: { ...defaultGauntletStats },
        // Blitz-specific tracking
        blitzStats: { ...defaultBlitzStats },
        // Time and speed tracking
        fastestAnswerMs: Infinity,
        answerTimesMs: [],
        // Variety and exploration tracking
        dojosUsed: [],
        modesUsed: [],
        challengeModesUsed: [],
        // Day tracking
        trainingDays: [],
        // Wrong streak tracking
        currentWrongStreak: 0,
        maxWrongStreak: 0
      },

      saveSession: () => {
        set(s => {
          const mastery = { ...s.allTimeStats.characterMastery };

          Object.entries(s.characterScores).forEach(([char, scores]) => {
            if (!mastery[char]) {
              mastery[char] = { correct: 0, incorrect: 0 };
            }
            mastery[char].correct += scores.correct;
            mastery[char].incorrect += scores.wrong;
          });

          // Track training day (Requirements 8.4-8.7)
          const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
          const trainingDays = s.allTimeStats.trainingDays.includes(today)
            ? s.allTimeStats.trainingDays
            : capArray([...s.allTimeStats.trainingDays, today], MAX_TRAINING_DAYS);

          return {
            allTimeStats: {
              ...s.allTimeStats,
              totalSessions: s.allTimeStats.totalSessions + 1,
              totalCorrect: s.allTimeStats.totalCorrect + s.numCorrectAnswers,
              totalIncorrect: s.allTimeStats.totalIncorrect + s.numWrongAnswers,
              bestStreak: Math.max(s.allTimeStats.bestStreak, s.currentStreak),
              characterMastery: mastery,
              trainingDays
            }
          };
        });

        // Trigger achievement check
        if (typeof window !== 'undefined') {
          setTimeout(() => {
            const win = window as unknown as Record<string, unknown>;
            const store = win.__achievementStore as
              | { getState: () => { checkAchievements: (s: unknown) => void } }
              | undefined;
            store?.getState().checkAchievements(get());
          }, 100);
        }
      },

      clearAllProgress: () =>
        set({
          allTimeStats: {
            totalSessions: 0,
            totalCorrect: 0,
            totalIncorrect: 0,
            bestStreak: 0,
            characterMastery: {},
            // Content-specific tracking
            hiraganaCorrect: 0,
            katakanaCorrect: 0,
            kanjiCorrectByLevel: {},
            vocabularyCorrect: 0,
            // Gauntlet-specific tracking
            gauntletStats: { ...defaultGauntletStats },
            // Blitz-specific tracking
            blitzStats: { ...defaultBlitzStats },
            // Time and speed tracking
            fastestAnswerMs: Infinity,
            answerTimesMs: [],
            // Variety and exploration tracking
            dojosUsed: [],
            modesUsed: [],
            challengeModesUsed: [],
            // Day tracking
            trainingDays: [],
            // Wrong streak tracking
            currentWrongStreak: 0,
            maxWrongStreak: 0
          }
        }),

      resetStats: () =>
        set({
          numCorrectAnswers: 0,
          numWrongAnswers: 0,
          currentStreak: 0,
          characterHistory: [],
          characterScores: {},
          totalMilliseconds: 0,
          correctAnswerTimes: [],
          score: 0,
          stars: 0,
          iconIndices: []
        }),

      // Content-specific tracking actions (Requirements 1.1-1.8, 2.1-2.10, 3.1-3.6)
      incrementHiraganaCorrect: () =>
        set(s => ({
          allTimeStats: {
            ...s.allTimeStats,
            hiraganaCorrect: s.allTimeStats.hiraganaCorrect + 1
          }
        })),

      incrementKatakanaCorrect: () =>
        set(s => ({
          allTimeStats: {
            ...s.allTimeStats,
            katakanaCorrect: s.allTimeStats.katakanaCorrect + 1
          }
        })),

      incrementKanjiCorrect: (jlptLevel: string) =>
        set(s => ({
          allTimeStats: {
            ...s.allTimeStats,
            kanjiCorrectByLevel: {
              ...s.allTimeStats.kanjiCorrectByLevel,
              [jlptLevel]:
                (s.allTimeStats.kanjiCorrectByLevel[jlptLevel] || 0) + 1
            }
          }
        })),

      incrementVocabularyCorrect: () =>
        set(s => ({
          allTimeStats: {
            ...s.allTimeStats,
            vocabularyCorrect: s.allTimeStats.vocabularyCorrect + 1
          }
        })),

      // Gauntlet-specific tracking actions (Requirements 4.1-4.10)
      recordGauntletRun: ({
        completed,
        difficulty,
        isPerfect,
        livesLost,
        livesRegenerated,
        bestStreak
      }) =>
        set(s => {
          const gauntletStats = { ...s.allTimeStats.gauntletStats };
          gauntletStats.totalRuns += 1;

          if (completed) {
            gauntletStats.completedRuns += 1;

            // Track difficulty-specific completions
            if (difficulty === 'normal') {
              gauntletStats.normalCompleted += 1;
            } else if (difficulty === 'hard') {
              gauntletStats.hardCompleted += 1;
            } else if (difficulty === 'instant-death') {
              gauntletStats.instantDeathCompleted += 1;
            }

            // Track perfect runs (100% accuracy)
            if (isPerfect) {
              gauntletStats.perfectRuns += 1;
            }

            // Track no-death runs
            if (livesLost === 0) {
              gauntletStats.noDeathRuns += 1;
            }
          }

          // Track lives regenerated
          gauntletStats.livesRegenerated += livesRegenerated;

          // Track best streak
          gauntletStats.bestStreak = Math.max(
            gauntletStats.bestStreak,
            bestStreak
          );

          return {
            allTimeStats: {
              ...s.allTimeStats,
              gauntletStats
            }
          };
        }),

      // Blitz-specific tracking actions (Requirements 5.1-5.8)
      recordBlitzSession: ({ score, streak, correctAnswers }) =>
        set(s => {
          const blitzStats = { ...s.allTimeStats.blitzStats };
          blitzStats.totalSessions += 1;
          blitzStats.bestSessionScore = Math.max(
            blitzStats.bestSessionScore,
            score
          );
          blitzStats.bestStreak = Math.max(blitzStats.bestStreak, streak);
          blitzStats.totalCorrect += correctAnswers;

          return {
            allTimeStats: {
              ...s.allTimeStats,
              blitzStats
            }
          };
        }),

      // Time and speed tracking actions (Requirements 6.1-6.5)
      recordAnswerTime: (timeMs: number) =>
        set(s => ({
          allTimeStats: {
            ...s.allTimeStats,
            fastestAnswerMs: Math.min(s.allTimeStats.fastestAnswerMs, timeMs),
            answerTimesMs: capArray(
              [...s.allTimeStats.answerTimesMs, timeMs],
              MAX_ANSWER_TIMES
            )
          }
        })),

      // Variety and exploration tracking actions (Requirements 8.1-8.3)
      recordDojoUsed: (dojo: string) =>
        set(s => {
          if (s.allTimeStats.dojosUsed.includes(dojo)) {
            return s; // Already recorded
          }
          return {
            allTimeStats: {
              ...s.allTimeStats,
              dojosUsed: [...s.allTimeStats.dojosUsed, dojo]
            }
          };
        }),

      recordModeUsed: (mode: string) =>
        set(s => {
          if (s.allTimeStats.modesUsed.includes(mode)) {
            return s; // Already recorded
          }
          return {
            allTimeStats: {
              ...s.allTimeStats,
              modesUsed: [...s.allTimeStats.modesUsed, mode]
            }
          };
        }),

      recordChallengeModeUsed: (challengeMode: string) =>
        set(s => {
          if (s.allTimeStats.challengeModesUsed.includes(challengeMode)) {
            return s; // Already recorded
          }
          return {
            allTimeStats: {
              ...s.allTimeStats,
              challengeModesUsed: [
                ...s.allTimeStats.challengeModesUsed,
                challengeMode
              ]
            }
          };
        }),

      // Day tracking actions (Requirements 8.4-8.7)
      recordTrainingDay: () =>
        set(s => {
          const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
          if (s.allTimeStats.trainingDays.includes(today)) {
            return s; // Already recorded today
          }
          return {
            allTimeStats: {
              ...s.allTimeStats,
              trainingDays: capArray(
                [...s.allTimeStats.trainingDays, today],
                MAX_TRAINING_DAYS
              )
            }
          };
        }),

      // Wrong streak tracking actions (Requirement 10.2)
      incrementWrongStreak: () =>
        set(s => {
          const newWrongStreak = s.allTimeStats.currentWrongStreak + 1;
          return {
            allTimeStats: {
              ...s.allTimeStats,
              currentWrongStreak: newWrongStreak,
              maxWrongStreak: Math.max(
                s.allTimeStats.maxWrongStreak,
                newWrongStreak
              )
            }
          };
        }),

      resetWrongStreak: () =>
        set(s => ({
          allTimeStats: {
            ...s.allTimeStats,
            currentWrongStreak: 0
          }
        }))
    }),
    {
      name: 'kanadojo-stats',
      partialize: state => ({ allTimeStats: state.allTimeStats }),
      merge: (persistedState, currentState) => {
        const persisted = persistedState as Partial<IStatsState> | undefined;
        const defaultAllTimeStats = currentState.allTimeStats;

        return {
          ...currentState,
          allTimeStats: {
            ...defaultAllTimeStats,
            ...(persisted?.allTimeStats || {}),
            // Ensure nested objects/arrays are properly merged with defaults
            gauntletStats: {
              ...defaultGauntletStats,
              ...(persisted?.allTimeStats?.gauntletStats || {})
            },
            blitzStats: {
              ...defaultBlitzStats,
              ...(persisted?.allTimeStats?.blitzStats || {})
            },
            // Ensure arrays have defaults if missing from persisted state
            dojosUsed: persisted?.allTimeStats?.dojosUsed ?? [],
            modesUsed: persisted?.allTimeStats?.modesUsed ?? [],
            challengeModesUsed:
              persisted?.allTimeStats?.challengeModesUsed ?? [],
            trainingDays: persisted?.allTimeStats?.trainingDays ?? [],
            answerTimesMs: persisted?.allTimeStats?.answerTimesMs ?? [],
            kanjiCorrectByLevel:
              persisted?.allTimeStats?.kanjiCorrectByLevel ?? {},
            characterMastery: persisted?.allTimeStats?.characterMastery ?? {}
          }
        };
      }
    }
  )
);

export default useStatsStore;
