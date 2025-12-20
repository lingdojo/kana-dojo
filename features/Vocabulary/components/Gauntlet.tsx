'use client';

import React from 'react';
import useVocabStore, {
  type IVocabObj
} from '@/features/Vocabulary/store/useVocabStore';
import Gauntlet, { type GauntletConfig } from '@/shared/components/Gauntlet';
import { formatLevelsAsRanges } from '@/shared/lib/helperFunctions';
import FuriganaText from '@/shared/components/text/FuriganaText';

export default function GauntletVocab() {
  const selectedVocabObjs = useVocabStore(state => state.selectedVocabObjs);
  const selectedVocabSets = useVocabStore(state => state.selectedVocabSets);
  const selectedGameModeVocab = useVocabStore(
    state => state.selectedGameModeVocab
  );

  // Format selected sets for display
  const formattedSets = React.useMemo(() => {
    if (selectedVocabSets.length === 0) return [];
    const rangeStr = formatLevelsAsRanges(selectedVocabSets);
    return rangeStr
      .split(', ')
      .map(r => `${r.includes('-') ? 'Levels' : 'Level'} ${r}`);
  }, [selectedVocabSets]);

  const config: GauntletConfig<IVocabObj> = {
    dojoType: 'vocabulary',
    dojoLabel: 'Vocabulary',
    initialGameMode: selectedGameModeVocab === 'Type' ? 'Type' : 'Pick',
    items: selectedVocabObjs,
    selectedSets: formattedSets,
    generateQuestion: items => items[Math.floor(Math.random() * items.length)],
    // Reverse mode: show meaning, answer is Japanese word
    // Normal mode: show Japanese word, answer is meaning
    renderQuestion: (question, isReverse) =>
      isReverse ? (
        question.meanings[0]
      ) : (
        <FuriganaText text={question.word} reading={question.reading} />
      ),
    checkAnswer: (question, answer, isReverse) => {
      if (isReverse) {
        // Reverse: answer should be the Japanese word
        return answer.trim() === question.word;
      }
      // Normal: answer should match any meaning
      return question.meanings.some(
        meaning => answer.toLowerCase() === meaning.toLowerCase()
      );
    },
    getCorrectAnswer: (question, isReverse) =>
      isReverse ? question.word : question.meanings[0],
    // Pick mode support with reverse mode
    generateOptions: (question, items, count, isReverse) => {
      if (isReverse) {
        // Reverse: options are Japanese words
        const correctAnswer = question.word;
        const incorrectOptions = items
          .filter(item => item.word !== question.word)
          .sort(() => Math.random() - 0.5)
          .slice(0, count - 1)
          .map(item => item.word);
        return [correctAnswer, ...incorrectOptions];
      }
      // Normal: options are meanings
      const correctAnswer = question.meanings[0];
      const incorrectOptions = items
        .filter(item => item.word !== question.word)
        .sort(() => Math.random() - 0.5)
        .slice(0, count - 1)
        .map(item => item.meanings[0]);
      return [correctAnswer, ...incorrectOptions];
    },
    getCorrectOption: (question, isReverse) =>
      isReverse ? question.word : question.meanings[0],
    supportsReverseMode: true
  };

  return <Gauntlet config={config} />;
}
