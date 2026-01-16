'use client';

import React from 'react';
import useVocabStore, {
  type IVocabObj
} from '@/features/Vocabulary/store/useVocabStore';
import Gauntlet, { type GauntletConfig } from '@/shared/components/Gauntlet';
import { getSelectionLabels } from '@/shared/lib/selectionFormatting';
import { shuffle, pickOne } from '@/shared/lib/shuffle';
import FuriganaText from '@/shared/components/text/FuriganaText';

interface GauntletVocabProps {
  onCancel?: () => void;
}

const GauntletVocab: React.FC<GauntletVocabProps> = ({ onCancel }) => {
  const selectedVocabObjs = useVocabStore(state => state.selectedVocabObjs);
  const selectedVocabSets = useVocabStore(state => state.selectedVocabSets);
  const selectedGameModeVocab = useVocabStore(
    state => state.selectedGameModeVocab
  );

  // Format selected sets for display
  const formattedSets = React.useMemo(() => {
    return getSelectionLabels('vocabulary', selectedVocabSets).full.split(', ');
  }, [selectedVocabSets]);

  const config: GauntletConfig<IVocabObj> = {
    dojoType: 'vocabulary',
    dojoLabel: 'Vocabulary',
    initialGameMode: selectedGameModeVocab === 'Type' ? 'Type' : 'Pick',
    items: selectedVocabObjs,
    selectedSets: formattedSets,
    generateQuestion: items => pickOne(items)!,
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
        const incorrectOptions = shuffle(
          items.filter(item => item.word !== question.word)
        )
          .slice(0, count - 1)
          .map(item => item.word);
        return [correctAnswer, ...incorrectOptions];
      }
      // Normal: options are meanings
      const correctAnswer = question.meanings[0];
      const incorrectOptions = shuffle(
        items.filter(item => item.word !== question.word)
      )
        .slice(0, count - 1)
        .map(item => item.meanings[0]);
      return [correctAnswer, ...incorrectOptions];
    },
    getCorrectOption: (question, isReverse) =>
      isReverse ? question.word : question.meanings[0],
    supportsReverseMode: true
  };

  return <Gauntlet config={config} onCancel={onCancel} />;
};

export default GauntletVocab;
