'use client';

import { useEffect } from 'react';
import Info from '@/shared/components/Menu/Info';
import TrainingActionBar from '@/shared/components/Menu/TrainingActionBar';
import UnitSelector from '@/shared/components/Menu/UnitSelector';
import { VocabCards } from '@/features/Vocabulary';
import { vocabDataService } from '@/features/Vocabulary/services/vocabDataService';

const PRELOAD_FLAG = 'vocab-preload-complete';

const VocabMenu = () => {
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (sessionStorage.getItem(PRELOAD_FLAG)) return;

    sessionStorage.setItem(PRELOAD_FLAG, 'true');
    void vocabDataService.preloadAll();
  }, []);

  return (
    <>
      <div className='flex flex-col gap-4'>
        <Info />
        <UnitSelector />
        <VocabCards />
      </div>
      <TrainingActionBar currentDojo='vocabulary' />
    </>
  );
};

export default VocabMenu;
