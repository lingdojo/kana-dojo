import { create } from 'zustand';

export interface IVocabObj {
  word: string;
  reading: string;
  displayMeanings: string[];
  meanings: string[];
}

interface IFormState {
  selectedGameModeVocab: string;
  selectedVocabObjs: IVocabObj[];
  setSelectedGameModeVocab: (mode: string) => void;
  addVocabObj: (vocabObj: IVocabObj) => void;
  addVocabObjs: (vocabObjs: IVocabObj[]) => void;
  clearVocabObjs: () => void;

  selectedVocabCollection: string;
  setSelectedVocabCollection: (collection: string) => void;

  selectedVocabSets: string[];
  setSelectedVocabSets: (sets: string[]) => void;
  clearVocabSets: () => void;

  // Collapsed rows per unit (keyed by collection name)
  collapsedRowsByUnit: Record<string, number[]>;
  setCollapsedRowsForUnit: (unit: string, rows: number[]) => void;
}

const useVocabStore = create<IFormState>(set => ({
  selectedGameModeVocab: 'Pick',
  selectedVocabObjs: [],
  setSelectedGameModeVocab: gameMode =>
    set({ selectedGameModeVocab: gameMode }),
  addVocabObj: vocabObj =>
    set(state => ({
      selectedVocabObjs: state.selectedVocabObjs
        .map(vocabObj => vocabObj.word)
        .includes(vocabObj.word)
        ? state.selectedVocabObjs.filter(
            currentVocabObj => currentVocabObj.word !== vocabObj.word
          )
        : [...state.selectedVocabObjs, vocabObj]
    })),
  addVocabObjs: vocabObjs =>
    set(state => ({
      selectedVocabObjs: vocabObjs.every(currentVocabObj =>
        state.selectedVocabObjs
          .map(currentVocabObj => currentVocabObj.word)
          .includes(currentVocabObj.word)
      )
        ? state.selectedVocabObjs.filter(
            currentVocabObj =>
              !vocabObjs
                .map(currentVocabObj => currentVocabObj.word)
                .includes(currentVocabObj.word)
          )
        : [...new Set([...state.selectedVocabObjs, ...vocabObjs])]
    })),
  clearVocabObjs: () => {
    set(() => ({
      selectedVocabObjs: []
    }));
  },

  selectedVocabCollection: 'n5',
  setSelectedVocabCollection: collection =>
    set({ selectedVocabCollection: collection }),
  selectedVocabSets: [],
  setSelectedVocabSets: sets => set({ selectedVocabSets: sets }),
  clearVocabSets: () => {
    set(() => ({
      selectedVocabSets: []
    }));
  },

  collapsedRowsByUnit: {},
  setCollapsedRowsForUnit: (unit, rows) =>
    set(state => ({
      collapsedRowsByUnit: {
        ...state.collapsedRowsByUnit,
        [unit]: rows
      }
    }))
}));

export default useVocabStore;
