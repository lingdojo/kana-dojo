'use client';

import React from 'react';
import useKanaStore from '@/features/Kana/store/useKanaStore';
import { flattenKanaGroups } from '@/features/Kana/lib/flattenKanaGroup';
import type { KanaCharacter } from '@/features/Kana/lib/flattenKanaGroup';
import { getSelectionLabels } from '@/shared/lib/selectionFormatting';
import { shuffle } from '@/shared/lib/shuffle';
import Rush, { type RushConfig } from '@/shared/components/Rush';
import { Random } from 'random-js';

const random = new Random();

/**
 * Generate a random kana question
 */
function generateKanaQuestion(items: KanaCharacter[]): { item: KanaCharacter; index: number } {
  const randomIndex = random.integer(0, items.length - 1);
  return {
    item: items[randomIndex],
    index: randomIndex,
  };
}

export default function RushKana() {
  const kanaGroupIndices = useKanaStore(state => state.kanaGroupIndices);
  const selectedGameModeKana = useKanaStore(
    state => state.selectedGameModeKana,
  );

  const selectedKana = React.useMemo(
    () => flattenKanaGroups(kanaGroupIndices),
    [kanaGroupIndices],
  );

  // Convert indices to group names for display (e.g., "か-group")
  const selectedKanaGroups = React.useMemo(
    () => getSelectionLabels('kana', kanaGroupIndices).full.split(', '),
    [kanaGroupIndices],
  );

  const config: RushConfig<KanaCharacter> = {
    dojoType: 'kana',
    dojoLabel: 'Kana',
    localStorageKey: 'rushDifficulty',
    goalTimerContext: 'Kana Rush',
    initialGameMode: selectedGameModeKana === 'Type' ? 'Type' : 'Pick',
    items: selectedKana,
    selectedSets: selectedKanaGroups,
    generateQuestion: (items: KanaCharacter[]) => generateKanaQuestion(items),
    // Reverse mode: show romaji, answer is kana
    // Normal mode: show kana, answer is romaji
    renderQuestion: (question: KanaCharacter, isReverse: boolean) =>
      isReverse ? question.romaji : question.kana,
    inputPlaceholder: 'Type the romaji...',
    modeDescription: 'Mode: Type (See kana → Type romaji)',
    checkAnswer: (question: KanaCharacter, answer: string, isReverse: boolean) => {
      if (isReverse) {
        // Reverse: answer should be the kana character
        return answer.trim() === question.kana;
      }
      // Normal: answer should match romaji
      return answer.toLowerCase() === question.romaji.toLowerCase();
    },
    getCorrectAnswer: (question: KanaCharacter, isReverse: boolean) =>
      isReverse ? question.kana : question.romaji,
    // Pick mode support with reverse mode
    generateOptions: (question: KanaCharacter, items: KanaCharacter[], count: number, isReverse: boolean) => {
      if (isReverse) {
        // Reverse: options are kana characters
        const correctAnswer = question.kana;
        const incorrectOptions = shuffle(
          items.filter((item: KanaCharacter) => item.kana !== correctAnswer),
        )
          .slice(0, count - 1)
          .map((item: KanaCharacter) => item.kana);
        return [correctAnswer, ...incorrectOptions];
      }
      // Normal: options are romaji
      const correctAnswer = question.romaji;
      const incorrectOptions = shuffle(
        items.filter((item: KanaCharacter) => item.romaji !== correctAnswer),
      )
        .slice(0, count - 1)
        .map((item: KanaCharacter) => item.romaji);
      return [correctAnswer, ...incorrectOptions];
    },
    getCorrectOption: (question: KanaCharacter, isReverse: boolean) =>
      isReverse ? question.kana : question.romaji,
    supportsReverseMode: true,
  };

  return <Rush config={config} />;
}