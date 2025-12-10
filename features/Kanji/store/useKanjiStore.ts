import { create } from 'zustand';

export interface IKanjiObj {
  id: number;
  kanjiChar: string;
  onyomi: string[];
  kunyomi: string[];
  displayMeanings: string[];
  fullDisplayMeanings: string[];
  meanings: string[];
}

interface IKanjiState {
  selectedGameModeKanji: string;
  selectedKanjiObjs: IKanjiObj[];
  selectedKanjiCollection: 'n5' | 'n4' | 'n3' | 'n2' | 'n1';
  selectedKanjiSets: string[];
  setSelectedGameModeKanji: (mode: string) => void;
  addKanjiObj: (kanji: IKanjiObj) => void;
  addKanjiObjs: (kanjis: IKanjiObj[]) => void;
  clearKanjiObjs: () => void;
  setSelectedKanjiCollection: (
    collection: 'n5' | 'n4' | 'n3' | 'n2' | 'n1'
  ) => void;
  setSelectedKanjiSets: (sets: string[]) => void;
  clearKanjiSets: () => void;

  // Collapsed rows per unit (keyed by collection name)
  collapsedRowsByUnit: Record<string, number[]>;
  setCollapsedRowsForUnit: (unit: string, rows: number[]) => void;
}

const sameKanjiArray = (a: IKanjiObj[], b: IKanjiObj[]) =>
  a.length === b.length && a.every((v, i) => v.kanjiChar === b[i].kanjiChar);

const toggleKanji = (array: IKanjiObj[], kanjiObj: IKanjiObj): IKanjiObj[] => {
  if (!kanjiObj || !kanjiObj.kanjiChar) return array;
  const kanjiIndex = array.findIndex(
    item => item.kanjiChar === kanjiObj.kanjiChar
  );
  if (kanjiIndex >= 0) {
    if (array.length === 1) return [];
    return array.slice(0, kanjiIndex).concat(array.slice(kanjiIndex + 1));
  }
  return [...array, kanjiObj];
};

const toggleKanjis = (
  array: IKanjiObj[],
  kanjiObjects: IKanjiObj[]
): IKanjiObj[] => {
  if (!kanjiObjects.length) return array;

  const dedupIncoming: IKanjiObj[] = [];
  const seen = new Set<string>();
  for (const obj of kanjiObjects) {
    const c = obj?.kanjiChar;
    if (!c) continue;
    if (!seen.has(c)) {
      seen.add(c);
      dedupIncoming.push(obj);
    }
  }
  if (!dedupIncoming.length) return array;

  const currentChars = new Set(array.map(item => item.kanjiChar));
  const incomingChars = new Set(dedupIncoming.map(item => item.kanjiChar));

  const allPresent = dedupIncoming.every(obj =>
    currentChars.has(obj.kanjiChar)
  );
  if (allPresent) {
    let changed = false;
    const next = array.filter(item => {
      const drop = incomingChars.has(item.kanjiChar);
      if (drop) changed = true;
      return !drop;
    });
    return changed ? next : array;
  }

  let changed = false;
  const next = array.slice();
  for (const obj of dedupIncoming) {
    if (!currentChars.has(obj.kanjiChar)) {
      next.push(obj);
      currentChars.add(obj.kanjiChar);
      changed = true;
    }
  }
  return changed ? next : array;
};

const useKanjiStore = create<IKanjiState>(set => ({
  selectedGameModeKanji: 'Pick',
  selectedKanjiObjs: [],
  selectedKanjiCollection: 'n5',
  selectedKanjiSets: [],

  setSelectedGameModeKanji: gameMode =>
    set({ selectedGameModeKanji: gameMode }),

  addKanjiObj: kanjiObj =>
    set(state => {
      const next = toggleKanji(state.selectedKanjiObjs, kanjiObj);
      return sameKanjiArray(next, state.selectedKanjiObjs)
        ? state
        : { selectedKanjiObjs: next };
    }),

  addKanjiObjs: kanjiObjects =>
    set(state => {
      const next = toggleKanjis(state.selectedKanjiObjs, kanjiObjects);
      return sameKanjiArray(next, state.selectedKanjiObjs)
        ? state
        : { selectedKanjiObjs: next };
    }),

  clearKanjiObjs: () => set({ selectedKanjiObjs: [] }),

  setSelectedKanjiCollection: collection =>
    set({ selectedKanjiCollection: collection }),

  setSelectedKanjiSets: sets => set({ selectedKanjiSets: sets }),

  clearKanjiSets: () => set({ selectedKanjiSets: [] }),

  collapsedRowsByUnit: {},
  setCollapsedRowsForUnit: (unit, rows) =>
    set(state => ({
      collapsedRowsByUnit: {
        ...state.collapsedRowsByUnit,
        [unit]: rows
      }
    }))
}));

export default useKanjiStore;
