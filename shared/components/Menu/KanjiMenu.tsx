'use client';

import { useEffect } from 'react';
import Info from '@/shared/components/Menu/Info';
import TrainingActionBar from '@/shared/components/Menu/TrainingActionBar';
import UnitSelector from '@/shared/components/Menu/UnitSelector';
import { KanjiCards } from '@/features/Kanji';
import { kanjiDataService } from '@/features/Kanji/services/kanjiDataService';

const PRELOAD_FLAG = 'kanji-preload-complete';

const KanjiMenu = () => {
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (sessionStorage.getItem(PRELOAD_FLAG)) return;

    sessionStorage.setItem(PRELOAD_FLAG, 'true');
    void kanjiDataService.preloadAll();
  }, []);

  return (
    <>
      <div className='flex flex-col gap-4'>
        <Info />
        <UnitSelector />
        <KanjiCards />
      </div>
      <TrainingActionBar currentDojo='kanji' />
    </>
  );
};

export default KanjiMenu;
