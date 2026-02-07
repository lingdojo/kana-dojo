'use client';

import React from 'react';
import useKanjiStore, {
  type IKanjiObj,
} from '@/features/Kanji/store/useKanjiStore';
import Gauntlet, { type GauntletConfig } from '@/shared/components/Gauntlet';
import { getSelectionLabels } from '@/shared/lib/selectionFormatting';
import { shuffle, pickOne } from '@/shared/lib/shuffle';

interface GauntletKanjiProps {
  onCancel?: () => void;
}

const GauntletKanji: React.FC<GauntletKanjiProps> = ({ onCancel }) => {
  const selectedKanjiObjs = useKanjiStore(state => state.selectedKanjiObjs);
  const selectedKanjiSets = useKanjiStore(state => state.selectedKanjiSets);
  const selectedGameModeKanji = useKanjiStore(
    state => state.selectedGameModeKanji,
  );

  // Format selected sets for display
  const formattedSets = React.useMemo(() => {
    return getSelectionLabels('kanji', selectedKanjiSets).full.split(', ');
  }, [selectedKanjiSets]);

  const config: GauntletConfig<IKanjiObj> = {
    dojoType: 'kanji',
    dojoLabel: 'Kanji',
    initialGameMode: selectedGameModeKanji === 'Type' ? 'Type' : 'Pick',
    items: selectedKanjiObjs,
    selectedSets: formattedSets,
    generateQuestion: items => pickOne(items)!,
    // Reverse mode: show meaning, answer is kanji
    // Normal mode: show kanji, answer is meaning
    renderQuestion: (question, isReverse) =>
      isReverse ? question.meanings[0] : question.kanjiChar,
    checkAnswer: (question, answer, isReverse) => {
      if (isReverse) {
        // Reverse: showing meaning, answer should be the kanji character or reading
        return (
          answer.trim() === question.kanjiChar ||
          question.kunyomi.some(k => k.split(' ')[0] === answer) ||
          question.onyomi.some(k => k.split(' ')[0] === answer)
        );
      }
      // Normal: showing kanji, answer should match any meaning
      return question.meanings.some(
        meaning => answer.toLowerCase() === meaning.toLowerCase(),
      );
    },
    getCorrectAnswer: (question, isReverse) =>
      isReverse ? question.kanjiChar : question.meanings[0],
    // Pick mode support with reverse mode
    generateOptions: (question, items, count, isReverse) => {
      if (isReverse) {
        // Reverse: options are kanji characters
        const correctAnswer = question.kanjiChar;
        const seen = new Set([correctAnswer]);
        const incorrectOptions = shuffle(
          items.filter(item => item.kanjiChar !== question.kanjiChar),
        )
          .filter(item => {
            if (seen.has(item.kanjiChar)) return false;
            seen.add(item.kanjiChar);
            return true;
          })
          .slice(0, count - 1)
          .map(item => item.kanjiChar);
        return [correctAnswer, ...incorrectOptions];
      }
      // Normal: options are meanings
      const correctAnswer = question.meanings[0];
      const seen = new Set([correctAnswer]);
      const incorrectOptions = shuffle(
        items.filter(item => item.kanjiChar !== question.kanjiChar),
      )
        .filter(item => {
          const meaning = item.meanings[0];
          if (seen.has(meaning)) return false;
          seen.add(meaning);
          return true;
        })
        .slice(0, count - 1)
        .map(item => item.meanings[0]);
      return [correctAnswer, ...incorrectOptions];
    },
    getCorrectOption: (question, isReverse) =>
      isReverse ? question.kanjiChar : question.meanings[0],
    supportsReverseMode: true,
  };

  return <Gauntlet config={config} onCancel={onCancel} />;
};

export default GauntletKanji;
