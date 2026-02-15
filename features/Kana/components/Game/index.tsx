'use client';
import clsx from 'clsx';
import { useEffect } from 'react';
import Return from '@/shared/components/Game/ReturnFromGame';
import Pick from './Pick';
import Input from './Input';
import useKanaStore from '@/features/Kana/store/useKanaStore';
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
  const gameMode = useKanaStore(state => state.selectedGameModeKana);

  useEffect(() => {
    resetStats();
    // Track dojo and mode usage for achievements (Requirements 8.1-8.3)
    recordDojoUsed('kana');
    recordModeUsed(gameMode.toLowerCase());
    recordChallengeModeUsed('classic');
  }, []);

  return (
    <div
      className={clsx(
        'flex min-h-[100dvh] max-w-[100dvw] flex-col items-center gap-6 px-4 md:gap-10',
        // "bg-[url('/wallpapers/neonretrocarcity.jpg')] bg-cover bg-center"
        // "bg-[url('/wallpapers/kanaDojoWallpaper.png')] bg-cover bg-center backdrop-blur-lg"
      )}
    >
      {showStats && <Stats />}
      <Return isHidden={showStats} href='/kana' gameMode={gameMode} />
      {gameMode.toLowerCase() === 'pick' ? (
        <Pick isHidden={showStats} />
      ) : gameMode.toLowerCase() === 'type' ? (
        <Input isHidden={showStats} />
      ) : gameMode.toLowerCase() === 'anti-type' ? (
        <Input isHidden={showStats} isReverse={true} />
      ) : null}
    </div>
  );
};

export default Game;
