import { useState } from 'react';
import type { BottomBarState } from '@/shared/ui-composite/Game/TilesModeShared';

export const useTilesModeState = () => {
  const [bottomBarState, setBottomBarState] =
    useState<BottomBarState>('check');
  const [placedTileIds, setPlacedTileIds] = useState<number[]>([]);
  const [isChecking, setIsChecking] = useState(false);
  const [isCelebrating, setIsCelebrating] = useState(false);

  const canCheck = placedTileIds.length > 0 && !isChecking;
  const showContinue = bottomBarState === 'correct';
  const showTryAgain = bottomBarState === 'wrong';

  return {
    bottomBarState,
    setBottomBarState,
    placedTileIds,
    setPlacedTileIds,
    isChecking,
    setIsChecking,
    isCelebrating,
    setIsCelebrating,
    canCheck,
    showContinue,
    showTryAgain,
  };
};
