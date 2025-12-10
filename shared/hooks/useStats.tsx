'use client';
import { useCallback } from 'react';
import useStatsStore from '@/features/Progress/store/useStatsStore';
import { useAchievementTrigger } from '@/features/Achievements/hooks/useAchievements';

const useStats = () => {
  const { triggerAchievementCheck } = useAchievementTrigger();

  const baseIncrementCorrectAnswers = useStatsStore(
    state => state.incrementCorrectAnswers
  );
  const baseIncrementWrongAnswers = useStatsStore(
    state => state.incrementWrongAnswers
  );

  // Wrap the increment functions to trigger achievement checks
  const incrementCorrectAnswers = useCallback(() => {
    baseIncrementCorrectAnswers();
    // Trigger achievement check after updating stats
    setTimeout(() => triggerAchievementCheck(), 100);
  }, [baseIncrementCorrectAnswers, triggerAchievementCheck]);

  const incrementWrongAnswers = useCallback(() => {
    baseIncrementWrongAnswers();
    // Trigger achievement check after updating stats
    setTimeout(() => triggerAchievementCheck(), 100);
  }, [baseIncrementWrongAnswers, triggerAchievementCheck]);
  const addCharacterToHistory = useStatsStore(
    state => state.addCharacterToHistory
  );
  const characterHistory = useStatsStore(state => state.characterHistory);
  const addCorrectAnswerTime = useStatsStore(
    state => state.addCorrectAnswerTime
  );
  const correctAnswerTimes = useStatsStore(state => state.correctAnswerTimes);

  const incrementCharacterScore = useStatsStore(
    state => state.incrementCharacterScore
  );

  return {
    incrementCorrectAnswers,
    incrementWrongAnswers,
    addCharacterToHistory,
    characterHistory,
    addCorrectAnswerTime,
    correctAnswerTimes,
    incrementCharacterScore
  };
};

export default useStats;
