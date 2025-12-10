import { create } from 'zustand';

interface IKanaState {
  selectedGameModeKana: string;
  kanaGroupIndices: number[];
  setSelectedGameModeKana: (mode: string) => void;
  addKanaGroupIndex: (kanaGroupIndex: number) => void;
  addKanaGroupIndices: (kanaGroupIndices: number[]) => void;
}

const sameArray = (a: number[], b: number[]) =>
  a.length === b.length && a.every((v, i) => v === b[i]);

const toggleNumber = (arr: number[], v: number): number[] => {
  const present = arr.includes(v);
  if (present) {
    const next = arr.filter(i => i !== v);
    return next.length === arr.length ? arr : next;
  } else {
    return [...arr, v];
  }
};

const toggleNumbers = (arr: number[], input: number[]): number[] => {
  if (!input.length) return arr;

  const dedupInput: number[] = [];
  const seenIn = new Set<number>();
  for (const v of input) {
    if (!seenIn.has(v)) {
      seenIn.add(v);
      dedupInput.push(v);
    }
  }

  const current = new Set(arr);
  const incoming = new Set(dedupInput);

  const allPresent = dedupInput.every(v => current.has(v));
  if (allPresent) {
    let changed = false;
    const next = arr.filter(v => {
      const drop = incoming.has(v);
      if (drop) changed = true;
      return !drop;
    });
    return changed ? next : arr;
  }

  let changed = false;
  const next = arr.slice();
  for (const v of dedupInput) {
    if (!current.has(v)) {
      next.push(v);
      current.add(v);
      changed = true;
    }
  }
  return changed ? next : arr;
};

const useKanaStore = create<IKanaState>(set => ({
  selectedGameModeKana: 'Pick',
  kanaGroupIndices: [],
  setSelectedGameModeKana: gameMode => set({ selectedGameModeKana: gameMode }),

  addKanaGroupIndex: kanaGroupIndex =>
    set(state => {
      const next = toggleNumber(state.kanaGroupIndices, kanaGroupIndex);
      return sameArray(next, state.kanaGroupIndices)
        ? state
        : { kanaGroupIndices: next };
    }),

  addKanaGroupIndices: kanaGroupIndices =>
    set(state => {
      const next = toggleNumbers(state.kanaGroupIndices, kanaGroupIndices);
      return sameArray(next, state.kanaGroupIndices)
        ? state
        : { kanaGroupIndices: next };
    })
}));

export default useKanaStore;
