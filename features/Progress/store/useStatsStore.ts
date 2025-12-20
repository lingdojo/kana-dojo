import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Types
interface CharacterScore {
  correct: number;
  wrong: number;
  accuracy: number;
}

interface AllTimeStats {
  totalSessions: number;
  totalCorrect: number;
  totalIncorrect: number;
  bestStreak: number;
  characterMastery: Record<string, { correct: number; incorrect: number }>;
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
        set(s => ({ correctAnswerTimes: [...s.correctAnswerTimes, time] })),
      totalMilliseconds: 0,
      setNewTotalMilliseconds: totalMilliseconds => set({ totalMilliseconds }),

      // Character tracking
      characterHistory: [],
      addCharacterToHistory: character =>
        set(s => ({ characterHistory: [...s.characterHistory, character] })),

      characterScores: {},
      incrementCharacterScore: (character, field) =>
        set(s => {
          const currentScore = s.characterScores[character] || { correct: 0, wrong: 0, accuracy: 0 };
          const updatedScore = { ...currentScore, [field]: currentScore[field] + 1 };
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
        characterMastery: {}
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

          return {
            allTimeStats: {
              totalSessions: s.allTimeStats.totalSessions + 1,
              totalCorrect: s.allTimeStats.totalCorrect + s.numCorrectAnswers,
              totalIncorrect: s.allTimeStats.totalIncorrect + s.numWrongAnswers,
              bestStreak: Math.max(
                s.allTimeStats.bestStreak,
                s.numCorrectAnswers
              ),
              characterMastery: mastery
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
            characterMastery: {}
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
        })
    }),
    {
      name: 'kanadojo-stats',
      partialize: state => ({ allTimeStats: state.allTimeStats })
    }
  )
);

export default useStatsStore;
