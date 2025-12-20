'use client';
import { useEffect } from 'react';
import Return from '@/shared/components/Game/ReturnFromGame';
import Pick from './Pick';
import Input from './Input';
import useKanjiStore from '@/features/Kanji/store/useKanjiStore';
import useStatsStore from '@/features/Progress/store/useStatsStore';
import { useShallow } from 'zustand/react/shallow';
import Stats from '@/shared/components/Game/Stats';

const Game = () => {
  const { showStats, resetStats } = useStatsStore(
    useShallow(state => ({
      showStats: state.showStats,
      resetStats: state.resetStats
    }))
  );

  const gameMode = useKanjiStore(state => state.selectedGameModeKanji);
  const selectedKanjiObjs = useKanjiStore(state => state.selectedKanjiObjs);

  useEffect(() => {
    resetStats();
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
      ) : null}
    </div>
  );
};

export default Game;
