'use client';

import { useEffect } from 'react';
import Info from '@/shared/ui-composite/Menu/Info';
import TrainingActionBar from '@/shared/ui-composite/Menu/TrainingActionBar';
import UnitSelector from '@/shared/ui-composite/Menu/UnitSelector';
import { KanjiCards, useKanjiSelection } from '@/features/Kanji';
import { kanjiDataService } from '@/features/Kanji/services/kanjiDataService';

const PRELOAD_FLAG = 'kanji-preload-complete';

type KanjiMenuProps = {
  fixedCollection?: 'n5' | 'n4' | 'n3' | 'n2' | 'n1';
  hideUnitSelector?: boolean;
};

const KanjiMenu = ({
  fixedCollection,
  hideUnitSelector = false,
}: KanjiMenuProps) => {
  const kanjiSelection = useKanjiSelection();

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (sessionStorage.getItem(PRELOAD_FLAG)) return;

    sessionStorage.setItem(PRELOAD_FLAG, 'true');
    void kanjiDataService.preloadAll();
  }, []);

  useEffect(() => {
    if (!fixedCollection) return;
    if (kanjiSelection.selectedCollection === fixedCollection) return;

    kanjiSelection.setCollection(fixedCollection);
    kanjiSelection.clearKanji();
    kanjiSelection.clearSets();
  }, [fixedCollection, kanjiSelection]);

  return (
    <>
      <div className='flex flex-col gap-4'>
        <Info />
        {!hideUnitSelector && <UnitSelector />}
        <KanjiCards />
      </div>
      <TrainingActionBar currentDojo='kanji' />
    </>
  );
};

export default KanjiMenu;

