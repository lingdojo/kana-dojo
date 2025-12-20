'use client';

import React from 'react';
import useKanaStore from '@/features/Kana/store/useKanaStore';
import { generateKanaQuestion } from '@/features/Kana/lib/generateKanaQuestions';
import type { KanaCharacter } from '@/features/Kana/lib/generateKanaQuestions';
import { flattenKanaGroups } from '@/features/Kana/lib/flattenKanaGroup';
import { kana } from '@/features/Kana/data/kana';
import Gauntlet, { type GauntletConfig } from '@/shared/components/Gauntlet';

export default function GauntletKana() {
  const kanaGroupIndices = useKanaStore(state => state.kanaGroupIndices);
  const selectedGameModeKana = useKanaStore(
    state => state.selectedGameModeKana
  );

  const selectedKana = React.useMemo(
    () => flattenKanaGroups(kanaGroupIndices) as unknown as KanaCharacter[],
    [kanaGroupIndices]
  );

  // Convert indices to group names for display
  const selectedKanaGroups = React.useMemo(() => {
    const selected = new Set(kanaGroupIndices);

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

    parentGroupDefs.forEach(parentDef => {
      if (allNonChallengeSelected && parentDef.label !== 'All Challenge')
        return;

      let allCovered = true;
      for (let i = parentDef.start; i < parentDef.end; i++) {
        if (!covered.has(i)) {
          allCovered = false;
          break;
        }
      }
      if (allCovered) return;

      let allInRange = true;
      for (let i = parentDef.start; i < parentDef.end; i++) {
        if (!selected.has(i)) {
          allInRange = false;
          break;
        }
      }
      if (!allInRange) return;

      labels.push(parentDef.label);
      for (let i = parentDef.start; i < parentDef.end; i++) covered.add(i);
    });

    subgroupDefs.forEach(def => {
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

  const config: GauntletConfig<KanaCharacter> = {
    dojoType: 'kana',
    dojoLabel: 'Kana',
    initialGameMode: selectedGameModeKana === 'Type' ? 'Type' : 'Pick',
    items: selectedKana,
    selectedSets: selectedKanaGroups,
    generateQuestion: items => generateKanaQuestion(items),
    renderQuestion: (question, isReverse) =>
      isReverse ? question.romaji : question.kana,
    checkAnswer: (question, answer, isReverse) => {
      if (isReverse) {
        return answer.trim() === question.kana;
      }
      return answer.toLowerCase() === question.romaji.toLowerCase();
    },
    getCorrectAnswer: (question, isReverse) =>
      isReverse ? question.kana : question.romaji,
    generateOptions: (question, items, count, isReverse) => {
      if (isReverse) {
        const correctAnswer = question.kana;
        const incorrectOptions = items
          .filter(item => item.kana !== correctAnswer)
          .sort(() => Math.random() - 0.5)
          .slice(0, count - 1)
          .map(item => item.kana);
        return [correctAnswer, ...incorrectOptions];
      }
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
    supportsReverseMode: true
  };

  return <Gauntlet config={config} />;
}
