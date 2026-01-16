'use client';

import React from 'react';
import useKanaStore from '@/features/Kana/store/useKanaStore';
import { generateKanaQuestion } from '@/features/Kana/lib/generateKanaQuestions';
import type { KanaCharacter } from '@/features/Kana/lib/generateKanaQuestions';
import { flattenKanaGroups } from '@/features/Kana/lib/flattenKanaGroup';
import { getSelectionLabels } from '@/shared/lib/selectionFormatting';
import { shuffle } from '@/shared/lib/shuffle';
import Gauntlet, { type GauntletConfig } from '@/shared/components/Gauntlet';

interface GauntletKanaProps {
  onCancel?: () => void;
}

const GauntletKana: React.FC<GauntletKanaProps> = ({ onCancel }) => {
  const kanaGroupIndices = useKanaStore(state => state.kanaGroupIndices);
  const selectedGameModeKana = useKanaStore(
    state => state.selectedGameModeKana
  );

  const selectedKana = React.useMemo(
    () => flattenKanaGroups(kanaGroupIndices) as unknown as KanaCharacter[],
    [kanaGroupIndices]
  );

  // Convert indices to group names for display
  const selectedKanaGroups = React.useMemo(
    () => getSelectionLabels('kana', kanaGroupIndices).full.split(', '),
    [kanaGroupIndices]
  );

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
        const incorrectOptions = shuffle(
          items.filter(item => item.kana !== correctAnswer)
        )
          .slice(0, count - 1)
          .map(item => item.kana);
        return [correctAnswer, ...incorrectOptions];
      }
      const correctAnswer = question.romaji;
      const incorrectOptions = shuffle(
        items.filter(item => item.romaji !== correctAnswer)
      )
        .slice(0, count - 1)
        .map(item => item.romaji);
      return [correctAnswer, ...incorrectOptions];
    },
    getCorrectOption: (question, isReverse) =>
      isReverse ? question.kana : question.romaji,
    supportsReverseMode: true
  };

  return <Gauntlet config={config} onCancel={onCancel} />;
};

export default GauntletKana;
