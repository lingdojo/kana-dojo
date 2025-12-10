'use client';
import { useEffect } from 'react';
import Return from '@/shared/components/Game/ReturnFromGame';
import Pick from './Pick';
import Input from './Input';

import useVocabStore from '@/features/Vocabulary/store/useVocabStore';
import useStatsStore from '@/features/Progress/store/useStatsStore';
import Stats from '@/shared/components/Game/Stats';

const Game = () => {
  const showStats = useStatsStore(state => state.showStats);

  const resetStats = useStatsStore(state => state.resetStats);

  const gameMode = useVocabStore(state => state.selectedGameModeVocab);
  const selectedVocabObjs = useVocabStore(state => state.selectedVocabObjs);

  useEffect(() => {
    resetStats();
  }, []);

  return (
    <div className='flex flex-col gap-4 md:gap-6 items-center min-h-[100dvh] max-w-[100dvw] px-4'>
      {showStats && <Stats />}
      <Return isHidden={showStats} href='/vocabulary' gameMode={gameMode} />
      {gameMode.toLowerCase() === 'pick' ? (
        <Pick selectedWordObjs={selectedVocabObjs} isHidden={showStats} />
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
