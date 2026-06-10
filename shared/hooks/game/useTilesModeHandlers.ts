import { useCallback } from 'react';
import type { Dispatch, SetStateAction } from 'react';
import type { BottomBarState } from '@/shared/ui-composite/Game/TilesModeShared';

interface UseTilesModeHandlersParams {
  isChecking: boolean;
  bottomBarState: BottomBarState;
  setPlacedTileIds: Dispatch<SetStateAction<number[]>>;
  setIsChecking: Dispatch<SetStateAction<boolean>>;
  setBottomBarState: Dispatch<SetStateAction<BottomBarState>>;
  startAnswerTimer: () => void;
  playClick: () => void;
}

export const useTilesModeHandlers = ({
  isChecking,
  bottomBarState,
  setPlacedTileIds,
  setIsChecking,
  setBottomBarState,
  startAnswerTimer,
  playClick,
}: UseTilesModeHandlersParams) => {
  const handleTileClick = useCallback(
    (id: number, _char: string) => {
      if (isChecking && bottomBarState !== 'wrong') return;

      playClick();

      if (bottomBarState === 'wrong') {
        setIsChecking(false);
        setBottomBarState('check');
        startAnswerTimer();
      }

      setPlacedTileIds(prevIds =>
        prevIds.includes(id)
          ? prevIds.filter(tileId => tileId !== id)
          : [...prevIds, id],
      );
    },
    [
      isChecking,
      bottomBarState,
      playClick,
      setIsChecking,
      setBottomBarState,
      startAnswerTimer,
      setPlacedTileIds,
    ],
  );

  const handleTryAgain = useCallback(() => {
    playClick();
    setPlacedTileIds([]);
    setIsChecking(false);
    setBottomBarState('check');
    startAnswerTimer();
  }, [
    playClick,
    setPlacedTileIds,
    setIsChecking,
    setBottomBarState,
    startAnswerTimer,
  ]);

  return {
    handleTileClick,
    handleTryAgain,
  };
};
