import { create } from 'zustand';
import type { IKanjiObj } from '@/entities/kanji';

export type { IKanjiObj } from '@/entities/kanji';

export interface KanjiLevelSelection {
  name: string;
  items: IKanjiObj[];
}

interface IKanjiState {
  selectedGameModeKanji: string;
  selectedKanjiObjs: IKanjiObj[];
  selectedKanjiCollection: 'n5' | 'n4' | 'n3' | 'n2' | 'n1';
  selectedKanjiSets: string[];
  selectedSubunitByUnit: Partial<
    Record<'n5' | 'n4' | 'n3' | 'n2' | 'n1', string>
  >;
  setSelectedGameModeKanji: (mode: string) => void;
  addKanjiObj: (kanji: IKanjiObj) => void;
  addKanjiObjs: (kanjis: IKanjiObj[]) => void;
  selectKanjiLevels: (levels: KanjiLevelSelection[]) => void;
  clearKanjiLevels: (levels: KanjiLevelSelection[]) => void;
  setSelectedKanjiObjs: (kanjis: IKanjiObj[]) => void;
  clearKanjiObjs: () => void;
  setSelectedKanjiCollection: (
    collection: 'n5' | 'n4' | 'n3' | 'n2' | 'n1',
  ) => void;
  setSelectedKanjiSets: (sets: string[]) => void;
  clearKanjiSets: () => void;
  setSelectedSubunitForUnit: (
    unit: 'n5' | 'n4' | 'n3' | 'n2' | 'n1',
    subunitId: string,
  ) => void;

  // Collapsed rows per unit (keyed by collection name)
  collapsedRowsByUnit: Record<string, number[]>;
  setCollapsedRowsForUnit: (unit: string, rows: number[]) => void;
}

const sameKanjiArray = (a: IKanjiObj[], b: IKanjiObj[]) =>
  a.length === b.length && a.every((v, i) => v.kanjiChar === b[i].kanjiChar);

const toggleKanji = (array: IKanjiObj[], kanjiObj: IKanjiObj): IKanjiObj[] => {
  if (!kanjiObj || !kanjiObj.kanjiChar) return array;
  const kanjiIndex = array.findIndex(
    item => item.kanjiChar === kanjiObj.kanjiChar,
  );
  if (kanjiIndex >= 0) {
    if (array.length === 1) return [];
    return array.slice(0, kanjiIndex).concat(array.slice(kanjiIndex + 1));
  }
  return [...array, kanjiObj];
};

const toggleKanjis = (
  array: IKanjiObj[],
  kanjiObjects: IKanjiObj[],
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
    currentChars.has(obj.kanjiChar),
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
  selectedSubunitByUnit: {},

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

  selectKanjiLevels: levels =>
    set(state => {
      if (!levels.length) return state;
      const selectedSets = new Set(state.selectedKanjiSets);
      const selectedKanji = new Map(
        state.selectedKanjiObjs.map(item => [item.kanjiChar, item]),
      );
      for (const level of levels) {
        selectedSets.add(level.name);
        for (const item of level.items) {
          if (item.kanjiChar) selectedKanji.set(item.kanjiChar, item);
        }
      }
      return {
        selectedKanjiSets: [...selectedSets],
        selectedKanjiObjs: [...selectedKanji.values()],
      };
    }),

  clearKanjiLevels: levels =>
    set(state => {
      if (!levels.length) return state;
      const names = new Set(levels.map(level => level.name));
      const chars = new Set(
        levels.flatMap(level => level.items.map(item => item.kanjiChar)),
      );
      return {
        selectedKanjiSets: state.selectedKanjiSets.filter(
          name => !names.has(name),
        ),
        selectedKanjiObjs: state.selectedKanjiObjs.filter(
          item => !chars.has(item.kanjiChar),
        ),
      };
    }),

  setSelectedKanjiObjs: kanjiObjects =>
    set({
      selectedKanjiObjs: Array.from(
        new Map(kanjiObjects.map(item => [item.kanjiChar, item])).values(),
      ),
    }),

  clearKanjiObjs: () => set({ selectedKanjiObjs: [] }),

  setSelectedKanjiCollection: collection =>
    set({ selectedKanjiCollection: collection }),

  setSelectedKanjiSets: sets => set({ selectedKanjiSets: sets }),

  clearKanjiSets: () => set({ selectedKanjiSets: [] }),

  setSelectedSubunitForUnit: (unit, subunitId) =>
    set(state => ({
      selectedSubunitByUnit: {
        ...state.selectedSubunitByUnit,
        [unit]: subunitId,
      },
    })),

  collapsedRowsByUnit: {},
  setCollapsedRowsForUnit: (unit, rows) =>
    set(state => ({
      collapsedRowsByUnit: {
        ...state.collapsedRowsByUnit,
        [unit]: rows,
      },
    })),
}));

export default useKanjiStore;
