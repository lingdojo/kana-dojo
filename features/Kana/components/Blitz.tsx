'use client';

import React from 'react';
import useKanaStore from '@/features/Kana/store/useKanaStore';
import useStatsStore from '@/features/Progress/store/useStatsStore';
import { generateKanaQuestion } from '@/features/Kana/lib/generateKanaQuestions';
import type { KanaCharacter } from '@/features/Kana/lib/generateKanaQuestions';
import { flattenKanaGroups } from '@/features/Kana/lib/flattenKanaGroup';
import { kana } from '@/features/Kana/data/kana';
import Blitz, { type BlitzConfig } from '@/shared/components/Blitz';

export default function BlitzKana() {
  const kanaGroupIndices = useKanaStore(state => state.kanaGroupIndices);
  const selectedGameModeKana = useKanaStore(
    state => state.selectedGameModeKana
  );

  const selectedKana = React.useMemo(
    () => flattenKanaGroups(kanaGroupIndices) as unknown as KanaCharacter[],
    [kanaGroupIndices]
  );

  // Convert indices to group names for display (e.g., "か-group")
  const selectedKanaGroups = React.useMemo(() => {
    const selected = new Set(kanaGroupIndices);

    // Parent group definitions (for "All Hiragana", "All Katakana", "All Challenge")
    const parentGroupDefs: Array<{
      label: string;
      start: number;
      end: number;
    }> = [
      { label: 'All Hiragana', start: 0, end: 26 },
      { label: 'All Katakana', start: 26, end: 60 },
      { label: 'All Challenge', start: 60, end: 69 }
    ];

    const subgroupDefs: Array<{
      label: string;
      start: number;
      end: number;
      isChallenge: boolean;
    }> = [
      { label: 'Hiragana Base', start: 0, end: 10, isChallenge: false },
      { label: 'Hiragana Dakuon', start: 10, end: 15, isChallenge: false },
      { label: 'Hiragana Yoon', start: 15, end: 26, isChallenge: false },
      { label: 'Katakana Base', start: 26, end: 36, isChallenge: false },
      { label: 'Katakana Dakuon', start: 36, end: 41, isChallenge: false },
      { label: 'Katakana Yoon', start: 41, end: 52, isChallenge: false },
      {
        label: 'Katakana Foreign Sounds',
        start: 52,
        end: 60,
        isChallenge: false
      },
      {
        label: 'Challenge Similar Hiragana',
        start: 60,
        end: 65,
        isChallenge: true
      },
      {
        label: 'Challenge Confusing Katakana',
        start: 65,
        end: 69,
        isChallenge: true
      }
    ];

    const nonChallengeIndices = kana
      .map((k, i) => ({ k, i }))
      .filter(({ k }) => !k.groupName.startsWith('challenge.'))
      .map(({ i }) => i);
    const allNonChallengeSelected = nonChallengeIndices.every(i =>
      selected.has(i)
    );

    const labels: string[] = [];

    const covered = new Set<number>();

    if (allNonChallengeSelected) {
      labels.push('all kana');
      nonChallengeIndices.forEach(i => covered.add(i));
    }

    // Check parent groups first (All Hiragana, All Katakana, All Challenge)
    parentGroupDefs.forEach(parentDef => {
      // Skip if already covered by "all kana" and not a challenge group
      if (allNonChallengeSelected && parentDef.label !== 'All Challenge')
        return;

      // Check if all indices in this parent group are already covered
      let allCovered = true;
      for (let i = parentDef.start; i < parentDef.end; i++) {
        if (!covered.has(i)) {
          allCovered = false;
          break;
        }
      }
      if (allCovered) return;

      // Check if all indices in this parent group are selected
      let allInRange = true;
      for (let i = parentDef.start; i < parentDef.end; i++) {
        if (!selected.has(i)) {
          allInRange = false;
          break;
        }
      }

      if (!allInRange) return;

      // All selected - add parent group label and mark as covered
      labels.push(parentDef.label);
      for (let i = parentDef.start; i < parentDef.end; i++) covered.add(i);
    });

    // Then check individual subgroups for partial selections
    subgroupDefs.forEach(def => {
      // Skip if covered by "all kana" or parent group
      let allCovered = true;
      for (let i = def.start; i < def.end; i++) {
        if (!covered.has(i)) {
          allCovered = false;
          break;
        }
      }
      if (allCovered) return;

      let allInRange = true;
      for (let i = def.start; i < def.end; i++) {
        if (!selected.has(i)) {
          allInRange = false;
          break;
        }
      }

      if (!allInRange) return;

      labels.push(def.label);
      for (let i = def.start; i < def.end; i++) covered.add(i);
    });

    const sortedSelected = [...kanaGroupIndices].sort((a, b) => a - b);
    sortedSelected.forEach(i => {
      if (covered.has(i)) return;

      const group = kana[i];
      if (!group) {
        labels.push(`Group ${i + 1}`);
        return;
      }

      const firstKana = group.kana[0];
      const isChallenge = group.groupName.startsWith('challenge.');
      labels.push(
        isChallenge ? `${firstKana}-group (challenge)` : `${firstKana}-group`
      );
    });

    return labels;
  }, [kanaGroupIndices]);

  const {
    timedCorrectAnswers,
    timedWrongAnswers,
    timedStreak,
    timedBestStreak,
    incrementTimedCorrectAnswers,
    incrementTimedWrongAnswers,
    resetTimedStats
  } = useStatsStore();

  const config: BlitzConfig<KanaCharacter> = {
    dojoType: 'kana',
    dojoLabel: 'Kana',
    localStorageKey: 'blitzDuration',
    goalTimerContext: 'Kana Blitz',
    initialGameMode: selectedGameModeKana === 'Type' ? 'Type' : 'Pick',
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

  return <Blitz config={config} />;
}
