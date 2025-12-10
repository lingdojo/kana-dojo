'use client';

import React from 'react';
import useKanaStore from '@/features/Kana/store/useKanaStore';
import useStatsStore from '@/features/Progress/store/useStatsStore';
import { generateKanaQuestion } from '@/features/Kana/lib/generateKanaQuestions';
import type { KanaCharacter } from '@/features/Kana/lib/generateKanaQuestions';
import { flattenKanaGroups } from '@/features/Kana/lib/flattenKanaGroup';
import { kana } from '@/features/Kana/data/kana';
import TimedChallenge, {
  type TimedChallengeConfig
} from '@/shared/components/TimedChallenge';

export default function TimedChallengeKana() {
  const kanaGroupIndices = useKanaStore(state => state.kanaGroupIndices);

  const selectedKana = React.useMemo(
    () => flattenKanaGroups(kanaGroupIndices) as unknown as KanaCharacter[],
    [kanaGroupIndices]
  );

  // Convert indices to group names for display (e.g., "か-group")
  const selectedKanaGroups = React.useMemo(
    () =>
      kanaGroupIndices.map(i => {
        const group = kana[i];
        if (!group) return `Group ${i + 1}`;
        // Use the first kana character of the group
        const firstKana = group.kana[0];
        const isChallenge = group.groupName.startsWith('challenge.');
        return isChallenge
          ? `${firstKana}-group (challenge)`
          : `${firstKana}-group`;
      }),
    [kanaGroupIndices]
  );

  const {
    timedCorrectAnswers,
    timedWrongAnswers,
    timedStreak,
    timedBestStreak,
    incrementTimedCorrectAnswers,
    incrementTimedWrongAnswers,
    resetTimedStats
  } = useStatsStore();

  const config: TimedChallengeConfig<KanaCharacter> = {
    dojoType: 'kana',
    dojoLabel: 'Kana',
    localStorageKey: 'timedChallengeDuration',
    goalTimerContext: 'Kana Timed Challenge',
    items: selectedKana,
    selectedSets: selectedKanaGroups,
    generateQuestion: items => generateKanaQuestion(items),
    // Reverse mode: show romaji, answer is kana
    // Normal mode: show kana, answer is romaji
    renderQuestion: (question, isReverse) =>
      isReverse ? question.romaji : question.kana,
    inputPlaceholder: 'Type the romaji...',
    modeDescription: 'Mode: Type (See kana → Type romaji)',
    checkAnswer: (question, answer, isReverse) => {
      if (isReverse) {
        // Reverse: answer should be the kana character
        return answer.trim() === question.kana;
      }
      // Normal: answer should match romaji
      return answer.toLowerCase() === question.romaji.toLowerCase();
    },
    getCorrectAnswer: (question, isReverse) =>
      isReverse ? question.kana : question.romaji,
    // Pick mode support with reverse mode
    generateOptions: (question, items, count, isReverse) => {
      if (isReverse) {
        // Reverse: options are kana characters
        const correctAnswer = question.kana;
        const incorrectOptions = items
          .filter(item => item.kana !== correctAnswer)
          .sort(() => Math.random() - 0.5)
          .slice(0, count - 1)
          .map(item => item.kana);
        return [correctAnswer, ...incorrectOptions];
      }
      // Normal: options are romaji
      const correctAnswer = question.romaji;
      const incorrectOptions = items
        .filter(item => item.romaji !== correctAnswer)
        .sort(() => Math.random() - 0.5)
        .slice(0, count - 1)
        .map(item => item.romaji);
      return [correctAnswer, ...incorrectOptions];
    },
    getCorrectOption: (question, isReverse) =>
      isReverse ? question.kana : question.romaji,
    supportsReverseMode: true,
    stats: {
      correct: timedCorrectAnswers,
      wrong: timedWrongAnswers,
      streak: timedStreak,
      bestStreak: timedBestStreak,
      incrementCorrect: incrementTimedCorrectAnswers,
      incrementWrong: incrementTimedWrongAnswers,
      reset: resetTimedStats
    }
  };

  return <TimedChallenge config={config} />;
}
