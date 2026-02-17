'use client';
import { useEffect } from 'react';
import Return from '@/shared/components/Game/ReturnFromGame';
import Pick from './Pick';
import Input from './Input';
import WordBuildingGame from './WordBuildingGame';

import useVocabStore from '@/features/Vocabulary/store/useVocabStore';
import { useStatsStore } from '@/features/Progress';
import { useShallow } from 'zustand/react/shallow';
import Stats from '@/shared/components/Game/Stats';

const Game = () => {
  const {
    showStats,
    resetStats,
    recordDojoUsed,
    recordModeUsed,
    recordChallengeModeUsed,
  } =
    useStatsStore(
      useShallow(state => ({
        showStats: state.showStats,
        resetStats: state.resetStats,
        recordDojoUsed: state.recordDojoUsed,
        recordModeUsed: state.recordModeUsed,
        recordChallengeModeUsed: state.recordChallengeModeUsed,
      })),
    );

  const gameMode = useVocabStore(state => state.selectedGameModeVocab);
  const selectedVocabObjs = useVocabStore(state => state.selectedVocabObjs);

  useEffect(() => {
    resetStats();
    // Track dojo and mode usage for achievements (Requirements 8.1-8.3)
    recordDojoUsed('vocabulary');
    recordModeUsed(gameMode.toLowerCase());
    recordChallengeModeUsed('classic');
  }, []);

  return (
    <div className='flex min-h-[100dvh] max-w-[100dvw] flex-col items-center gap-4 px-4 md:gap-6'>
      {showStats && <Stats />}
      <Return isHidden={showStats} href='/vocabulary' gameMode={gameMode} />
      {gameMode.toLowerCase() === 'pick' ? (
        <WordBuildingGame
          selectedWordObjs={selectedVocabObjs}
          isHidden={showStats}
        />
      ) : gameMode.toLowerCase() === 'type' ? (
        <Input selectedWordObjs={selectedVocabObjs} isHidden={showStats} />
      ) : gameMode.toLowerCase() === 'anti-type' ? (
        <Input
          selectedWordObjs={selectedVocabObjs}
          isHidden={showStats}
          isReverse={true}
        />
      ) : null}
    </div>
  );
};

export default Game;
