'use client';

import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

type KanaSelectorUnit = 'hiragana' | 'katakana';
type CollectionSelectorContentType = 'kanji' | 'vocabulary';
type CollectionLevel = 'n5' | 'n4' | 'n3' | 'n2' | 'n1';

interface CollectionSelectorState {
  selectedCollection: CollectionLevel;
  selectedSubunitByUnit: Partial<Record<CollectionLevel, string>>;
}

interface MenuSelectorState {
  kana: {
    selected: KanaSelectorUnit;
    selectedSubset: string;
    selectedSubsetByUnit: Partial<Record<KanaSelectorUnit, string>>;
  };
  collections: Record<CollectionSelectorContentType, CollectionSelectorState>;
  setKanaSelection: (selection: {
    selected: KanaSelectorUnit;
    selectedSubset: string;
  }) => void;
  resetKanaSelection: () => void;
  setCollectionSelection: (
    contentType: CollectionSelectorContentType,
    selection: CollectionSelectorState,
  ) => void;
  setCollectionSubunit: (
    contentType: CollectionSelectorContentType,
    unit: CollectionLevel,
    subunitId: string,
  ) => void;
  resetCollectionSelection: (
    contentType: CollectionSelectorContentType,
  ) => void;
}

const DEFAULT_COLLECTION_SELECTOR_STATE: CollectionSelectorState = {
  selectedCollection: 'n5',
  selectedSubunitByUnit: {
    n5: '1-10',
  },
};

const createDefaultCollectionSelectorState = (): CollectionSelectorState => ({
  selectedCollection: DEFAULT_COLLECTION_SELECTOR_STATE.selectedCollection,
  selectedSubunitByUnit: {
    ...DEFAULT_COLLECTION_SELECTOR_STATE.selectedSubunitByUnit,
  },
});

export const useMenuSelectorStore = create<MenuSelectorState>()(
  persist(
    set => ({
      kana: {
        selected: 'hiragana',
        selectedSubset: 'base',
        selectedSubsetByUnit: {},
      },
      collections: {
        kanji: createDefaultCollectionSelectorState(),
        vocabulary: createDefaultCollectionSelectorState(),
      },
      setKanaSelection: selection =>
        set(state => ({
          kana: {
            selected: selection.selected,
            selectedSubset: selection.selectedSubset,
            selectedSubsetByUnit: {
              ...state.kana.selectedSubsetByUnit,
              [selection.selected]: selection.selectedSubset,
            },
          },
        })),
      resetKanaSelection: () =>
        set({
          kana: {
            selected: 'hiragana',
            selectedSubset: 'base',
            selectedSubsetByUnit: {},
          },
        }),
      setCollectionSelection: (contentType, selection) =>
        set(state => ({
          collections: {
            ...state.collections,
            [contentType]: {
              selectedCollection: selection.selectedCollection,
              selectedSubunitByUnit: {
                ...selection.selectedSubunitByUnit,
              },
            },
          },
        })),
      setCollectionSubunit: (contentType, unit, subunitId) =>
        set(state => ({
          collections: {
            ...state.collections,
            [contentType]: {
              ...state.collections[contentType],
              selectedSubunitByUnit: {
                ...state.collections[contentType].selectedSubunitByUnit,
                [unit]: subunitId,
              },
            },
          },
        })),
      resetCollectionSelection: contentType =>
        set(state => ({
          collections: {
            ...state.collections,
            [contentType]: createDefaultCollectionSelectorState(),
          },
        })),
    }),
    {
      name: 'kanadojo-menu-selector-session',
      storage:
        typeof window !== 'undefined'
          ? createJSONStorage(() => sessionStorage)
          : undefined,
      partialize: state => ({
        kana: state.kana,
        collections: state.collections,
      }),
    },
  ),
);
