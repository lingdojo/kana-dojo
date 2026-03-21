import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export interface IVocabObj {
  word: string;
  reading: string;
  meanings: string[];
}

interface IFormState {
  selectedGameModeVocab: string;
  selectedVocabObjs: IVocabObj[];
  setSelectedGameModeVocab: (mode: string) => void;
  setSelectedVocabObjs: (vocabObjs: IVocabObj[]) => void;
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

const uniqByWord = (vocabObjs: IVocabObj[]) => {
  const seenWords = new Set<string>();
  return vocabObjs.filter(vocabObj => {
    if (seenWords.has(vocabObj.word)) return false;
    seenWords.add(vocabObj.word);
    return true;
  });
};

const useVocabStore = create<IFormState>()(
  persist(
    set => ({
      selectedGameModeVocab: 'Pick',
      selectedVocabObjs: [],
      setSelectedGameModeVocab: gameMode =>
        set({ selectedGameModeVocab: gameMode }),
      setSelectedVocabObjs: vocabObjs =>
        set({ selectedVocabObjs: uniqByWord(vocabObjs) }),
      addVocabObj: vocabObj =>
        set(state => ({
          selectedVocabObjs: state.selectedVocabObjs
            .map(currentVocabObj => currentVocabObj.word)
            .includes(vocabObj.word)
            ? state.selectedVocabObjs.filter(
                currentVocabObj => currentVocabObj.word !== vocabObj.word,
              )
            : [...state.selectedVocabObjs, vocabObj],
        })),
      addVocabObjs: vocabObjs =>
        set(state => ({
          selectedVocabObjs: vocabObjs.every(currentVocabObj =>
            state.selectedVocabObjs
              .map(selectedVocabObj => selectedVocabObj.word)
              .includes(currentVocabObj.word),
          )
            ? state.selectedVocabObjs.filter(
                currentVocabObj =>
                  !vocabObjs
                    .map(vocabObj => vocabObj.word)
                    .includes(currentVocabObj.word),
              )
            : uniqByWord([...state.selectedVocabObjs, ...vocabObjs]),
        })),
      clearVocabObjs: () => {
        set(() => ({
          selectedVocabObjs: [],
        }));
      },

      selectedVocabCollection: 'n5',
      setSelectedVocabCollection: collection =>
        set({ selectedVocabCollection: collection }),
      selectedVocabSets: [],
      setSelectedVocabSets: sets => set({ selectedVocabSets: sets }),
      clearVocabSets: () => {
        set(() => ({
          selectedVocabSets: [],
        }));
      },

      collapsedRowsByUnit: {},
      setCollapsedRowsForUnit: (unit, rows) =>
        set(state => ({
          collapsedRowsByUnit: {
            ...state.collapsedRowsByUnit,
            [unit]: rows,
          },
        })),
    }),
    {
      name: 'vocabulary-storage',
      storage:
        typeof window !== 'undefined'
          ? createJSONStorage(() => localStorage)
          : undefined,
    },
  ),
);

export default useVocabStore;
