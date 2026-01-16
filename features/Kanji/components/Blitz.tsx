'use client';

import React from 'react';
import useKanjiStore, {
  type IKanjiObj
} from '@/features/Kanji/store/useKanjiStore';
import { useStatsStore } from '@/features/Progress';
import Blitz, { type BlitzConfig } from '@/shared/components/Blitz';
import { getSelectionLabels } from '@/shared/lib/selectionFormatting';
import { shuffle, pickOne } from '@/shared/lib/shuffle';

export default function BlitzKanji() {
  const selectedKanjiObjs = useKanjiStore(state => state.selectedKanjiObjs);
  const selectedKanjiSets = useKanjiStore(state => state.selectedKanjiSets);
  const selectedGameModeKanji = useKanjiStore(
    state => state.selectedGameModeKanji
  );

  const {
    timedKanjiCorrectAnswers,
    timedKanjiWrongAnswers,
    timedKanjiStreak,
    timedKanjiBestStreak,
    incrementTimedKanjiCorrectAnswers,
    incrementTimedKanjiWrongAnswers,
    resetTimedKanjiStats
  } = useStatsStore();

  const formattedSets = React.useMemo(() => {
    return getSelectionLabels('kanji', selectedKanjiSets).full.split(', ');
  }, [selectedKanjiSets]);

  const config: BlitzConfig<IKanjiObj> = {
    dojoType: 'kanji',
    dojoLabel: 'Kanji',
    localStorageKey: 'blitzKanjiDuration',
    goalTimerContext: 'Kanji Blitz',
    initialGameMode: selectedGameModeKanji === 'Type' ? 'Type' : 'Pick',
    items: selectedKanjiObjs,
    selectedSets: formattedSets,
    generateQuestion: items => pickOne(items)!,
    // Reverse mode: show meaning, answer is kanji
    // Normal mode: show kanji, answer is meaning
    renderQuestion: (question, isReverse) =>
      isReverse ? question.meanings[0] : question.kanjiChar,
    inputPlaceholder: 'Type the meaning...',
    modeDescription: 'Mode: Type (See kanji → Type meaning)',
    checkAnswer: (question, answer, isReverse) => {
      if (!isReverse) {
        // Reverse: answer should be the kanji character or kunyomi or onyomi
        return (
          answer.trim() === question.kanjiChar ||
          question.kunyomi.some(k => k.split(' ')[0] === answer) ||
          question.onyomi.some(k => k.split(' ')[0] === answer) ||
          question.meanings.some(
            meaning => answer.toLowerCase() === meaning.toLowerCase()
          )
        );
      }
      // Normal: answer should match any meaning
      return question.meanings.some(
        meaning => answer.toLowerCase() === meaning.toLowerCase()
      );
    },
    getCorrectAnswer: (question, isReverse) =>
      isReverse ? question.kanjiChar : question.meanings[0],
    // Pick mode support with reverse mode
    generateOptions: (question, items, count, isReverse) => {
      if (isReverse) {
        // Reverse: options are kanji characters
        const correctAnswer = question.kanjiChar;
        const incorrectOptions = shuffle(
          items.filter(item => item.kanjiChar !== question.kanjiChar)
        )
          .slice(0, count - 1)
          .map(item => item.kanjiChar);
        return [correctAnswer, ...incorrectOptions];
      }
      // Normal: options are meanings
      const correctAnswer = question.meanings[0];
      const incorrectOptions = shuffle(
        items.filter(item => item.kanjiChar !== question.kanjiChar)
      )
        .slice(0, count - 1)
        .map(item => item.meanings[0]);
      return [correctAnswer, ...incorrectOptions];
    },
    getCorrectOption: (question, isReverse) =>
      isReverse ? question.kanjiChar : question.meanings[0],
    supportsReverseMode: true,
    stats: {
      correct: timedKanjiCorrectAnswers,
      wrong: timedKanjiWrongAnswers,
      streak: timedKanjiStreak,
      bestStreak: timedKanjiBestStreak,
      incrementCorrect: incrementTimedKanjiCorrectAnswers,
      incrementWrong: incrementTimedKanjiWrongAnswers,
      reset: resetTimedKanjiStats
    }
  };

  return <Blitz config={config} />;
}
