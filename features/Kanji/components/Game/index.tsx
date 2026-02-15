'use client';
import { useEffect } from 'react';
import Return from '@/shared/components/Game/ReturnFromGame';
import Pick from './Pick';
import Input from './Input';
import WordBuildingGame from './WordBuildingGame';
import useKanjiStore from '@/features/Kanji/store/useKanjiStore';
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

  const gameMode = useKanjiStore(state => state.selectedGameModeKanji);
  const selectedKanjiObjs = useKanjiStore(state => state.selectedKanjiObjs);

  useEffect(() => {
    resetStats();
    // Track dojo and mode usage for achievements (Requirements 8.1-8.3)
    recordDojoUsed('kanji');
    recordModeUsed(gameMode.toLowerCase());
    recordChallengeModeUsed('classic');
  }, []);

  return (
    <div className='flex min-h-[100dvh] max-w-[100dvw] flex-col items-center gap-4 px-4 md:gap-6'>
      {showStats && <Stats />}
      <Return isHidden={showStats} href='/kanji' gameMode={gameMode} />
      {gameMode.toLowerCase() === 'pick' ? (
        <Pick selectedKanjiObjs={selectedKanjiObjs} isHidden={showStats} />
      ) : gameMode.toLowerCase() === 'type' ? (
        <Input selectedKanjiObjs={selectedKanjiObjs} isHidden={showStats} />
      ) : gameMode.toLowerCase() === 'anti-type' ? (
        <Input
          selectedKanjiObjs={selectedKanjiObjs}
          isHidden={showStats}
          isReverse={true}
        />
      ) : gameMode.toLowerCase() === 'word-building' ? (
        <WordBuildingGame
          selectedKanjiObjs={selectedKanjiObjs}
          isHidden={showStats}
        />
      ) : null}
    </div>
  );
};

export default Game;
