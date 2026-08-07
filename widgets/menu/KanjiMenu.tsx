'use client';

import { useEffect } from 'react';
import Info from '@/shared/ui-composite/Menu/Info';
import TrainingActionBar from '@/shared/ui-composite/Menu/TrainingActionBar';
import UnitSelector from '@/shared/ui-composite/Menu/UnitSelector';
import { KanjiCards, useKanjiSelection } from '@/features/Kanji';
import { useMenuSelectorStore } from '@/shared/ui-composite/Menu/store/useMenuSelectorStore';
import { useAutoLearningStore } from '@/features/Progress';

type KanjiMenuProps = {
  fixedCollection?: 'n5' | 'n4' | 'n3' | 'n2' | 'n1';
  hideUnitSelector?: boolean;
};

const KanjiMenu = ({
  fixedCollection,
  hideUnitSelector = false,
}: KanjiMenuProps) => {
  const kanjiSelection = useKanjiSelection();
  const selectedKanjiCollection = kanjiSelection.selectedCollection;
  const setKanjiCollection = kanjiSelection.setCollection;
  const clearKanji = kanjiSelection.clearKanji;
  const clearKanjiSets = kanjiSelection.clearSets;
  const replaceKanji = kanjiSelection.replaceKanji;
  const isAutoSelectionActive = useAutoLearningStore(
    state => state.activeSelections.kanji,
  );
  const setAutoSelectionActive = useAutoLearningStore(
    state => state.setAutoSelectionActive,
  );
  const setPersistedCollectionSelection = useMenuSelectorStore(
    state => state.setCollectionSelection,
  );

  useEffect(() => {
    if (!isAutoSelectionActive) return;
    replaceKanji([]);
    clearKanjiSets();
    setAutoSelectionActive('kanji', false);
  }, [
    clearKanjiSets,
    isAutoSelectionActive,
    replaceKanji,
    setAutoSelectionActive,
  ]);

  useEffect(() => {
    if (!fixedCollection) return;
    if (selectedKanjiCollection === fixedCollection) return;

    setKanjiCollection(fixedCollection);
    clearKanji();
    clearKanjiSets();
    setPersistedCollectionSelection('kanji', {
      selectedCollection: fixedCollection,
      selectedSubunitByUnit: {},
    });
  }, [
    fixedCollection,
    selectedKanjiCollection,
    setKanjiCollection,
    clearKanji,
    clearKanjiSets,
    setPersistedCollectionSelection,
  ]);

  return (
    <>
      <div className='flex flex-col gap-4'>
        <Info />
        {!hideUnitSelector && <UnitSelector />}
        <KanjiCards showAutoLearning={!fixedCollection} />
      </div>
      <TrainingActionBar currentDojo='kanji' />
    </>
  );
};

export default KanjiMenu;
