'use client';

import { useEffect } from 'react';
import Info from '@/shared/ui-composite/Menu/Info';
import TrainingActionBar from '@/shared/ui-composite/Menu/TrainingActionBar';
import UnitSelector from '@/shared/ui-composite/Menu/UnitSelector';
import { VocabCards, useVocabSelection } from '@/features/Vocabulary';
import { useMenuSelectorStore } from '@/shared/ui-composite/Menu/store/useMenuSelectorStore';
import { useAutoLearningStore } from '@/features/Progress';

type VocabMenuProps = {
  fixedCollection?: 'n5' | 'n4' | 'n3' | 'n2' | 'n1';
  hideUnitSelector?: boolean;
};

const VocabMenu = ({
  fixedCollection,
  hideUnitSelector = false,
}: VocabMenuProps) => {
  const vocabSelection = useVocabSelection();
  const selectedVocabCollection = vocabSelection.selectedCollection;
  const setVocabCollection = vocabSelection.setCollection;
  const clearVocab = vocabSelection.clearVocab;
  const clearVocabSets = vocabSelection.clearSets;
  const replaceVocab = vocabSelection.replaceVocab;
  const isAutoSelectionActive = useAutoLearningStore(
    state => state.activeSelections.vocabulary,
  );
  const setAutoSelectionActive = useAutoLearningStore(
    state => state.setAutoSelectionActive,
  );
  const setPersistedCollectionSelection = useMenuSelectorStore(
    state => state.setCollectionSelection,
  );

  useEffect(() => {
    if (!isAutoSelectionActive) return;
    replaceVocab([]);
    clearVocabSets();
    setAutoSelectionActive('vocabulary', false);
  }, [
    clearVocabSets,
    isAutoSelectionActive,
    replaceVocab,
    setAutoSelectionActive,
  ]);

  useEffect(() => {
    if (!fixedCollection) return;
    if (selectedVocabCollection === fixedCollection) return;

    setVocabCollection(fixedCollection);
    clearVocab();
    clearVocabSets();
    setPersistedCollectionSelection('vocabulary', {
      selectedCollection: fixedCollection,
      selectedSubunitByUnit: {},
    });
  }, [
    fixedCollection,
    selectedVocabCollection,
    setVocabCollection,
    clearVocab,
    clearVocabSets,
    setPersistedCollectionSelection,
  ]);

  return (
    <>
      <div className='flex flex-col gap-4'>
        <Info />
        {!hideUnitSelector && <UnitSelector />}
        <VocabCards showAutoLearning={!fixedCollection} />
      </div>
      <TrainingActionBar currentDojo='vocabulary' />
    </>
  );
};

export default VocabMenu;
