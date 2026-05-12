import { useStatsStore } from '@/features/Progress';
import { useShallow } from 'zustand/react/shallow';

type GameFeature = 'kana' | 'kanji' | 'vocabulary';

type CommonGameStats = {
  score: number;
  setScore: (score: number) => void;
  incrementWrongStreak: () => void;
  resetWrongStreak: () => void;
  recordAnswerTime: (milliseconds: number) => void;
  incrementCorrectAnswers: () => void;
  incrementWrongAnswers: () => void;
  addCharacterToHistory: (character: string) => void;
  incrementCharacterScore: (character: string, result: 'correct' | 'wrong') => void;
  addCorrectAnswerTime: (seconds: number) => void;
};

type KanaGameStats = CommonGameStats & {
  incrementHiraganaCorrect: () => void;
  incrementKatakanaCorrect: () => void;
};

type KanjiGameStats = CommonGameStats & {
  incrementKanjiCorrect: (level: string) => void;
};

type VocabularyGameStats = CommonGameStats & {
  incrementVocabularyCorrect: () => void;
};

type FeatureGameStats<T extends GameFeature> = T extends 'kana'
  ? KanaGameStats
  : T extends 'kanji'
    ? KanjiGameStats
    : VocabularyGameStats;

export const useGameStats = <T extends GameFeature>(
  feature: T,
): FeatureGameStats<T> => {
  const commonStats = useStatsStore(
    useShallow(state => ({
      score: state.score,
      setScore: state.setScore,
      incrementWrongStreak: state.incrementWrongStreak,
      resetWrongStreak: state.resetWrongStreak,
      recordAnswerTime: state.recordAnswerTime,
      incrementCorrectAnswers: state.incrementCorrectAnswers,
      incrementWrongAnswers: state.incrementWrongAnswers,
      addCharacterToHistory: state.addCharacterToHistory,
      incrementCharacterScore: state.incrementCharacterScore,
      addCorrectAnswerTime: state.addCorrectAnswerTime,
    })),
  );

  const kanaStats = useStatsStore(
    useShallow(state => ({
      incrementHiraganaCorrect: state.incrementHiraganaCorrect,
      incrementKatakanaCorrect: state.incrementKatakanaCorrect,
    })),
  );

  const kanjiStats = useStatsStore(
    useShallow(state => ({
      incrementKanjiCorrect: state.incrementKanjiCorrect,
    })),
  );

  const vocabularyStats = useStatsStore(
    useShallow(state => ({
      incrementVocabularyCorrect: state.incrementVocabularyCorrect,
    })),
  );

  if (feature === 'kana') {
    return { ...commonStats, ...kanaStats } as FeatureGameStats<T>;
  }

  if (feature === 'kanji') {
    return { ...commonStats, ...kanjiStats } as FeatureGameStats<T>;
  }

  return { ...commonStats, ...vocabularyStats } as FeatureGameStats<T>;
};
