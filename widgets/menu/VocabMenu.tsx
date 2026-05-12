'use client';

import { useEffect } from 'react';
import Info from '@/shared/ui-composite/Menu/Info';
import TrainingActionBar from '@/shared/ui-composite/Menu/TrainingActionBar';
import UnitSelector from '@/shared/ui-composite/Menu/UnitSelector';
import { VocabCards, useVocabSelection } from '@/features/Vocabulary';
import { vocabDataService } from '@/features/Vocabulary/services/vocabDataService';

const PRELOAD_FLAG = 'vocab-preload-complete';

type VocabMenuProps = {
  fixedCollection?: 'n5' | 'n4' | 'n3' | 'n2' | 'n1';
  hideUnitSelector?: boolean;
};

const VocabMenu = ({
  fixedCollection,
  hideUnitSelector = false,
}: VocabMenuProps) => {
  const vocabSelection = useVocabSelection();

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (sessionStorage.getItem(PRELOAD_FLAG)) return;

    sessionStorage.setItem(PRELOAD_FLAG, 'true');
    void vocabDataService.preloadAll();
  }, []);

  useEffect(() => {
    if (!fixedCollection) return;
    if (vocabSelection.selectedCollection === fixedCollection) return;

    vocabSelection.setCollection(fixedCollection);
    vocabSelection.clearVocab();
    vocabSelection.clearSets();
  }, [fixedCollection, vocabSelection]);

  return (
    <>
      <div className='flex flex-col gap-4'>
        <Info />
        {!hideUnitSelector && <UnitSelector />}
        <VocabCards />
      </div>
      <TrainingActionBar currentDojo='vocabulary' />
    </>
  );
};

export default VocabMenu;

