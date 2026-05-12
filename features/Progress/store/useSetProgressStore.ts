'use client';

import localforage from 'localforage';
import { create } from 'zustand';

import {
  KANJI_SET_PROGRESS_TARGET,
  VOCAB_MEANING_PROGRESS_TARGET,
  VOCAB_READING_PROGRESS_TARGET,
} from '@/features/Progress/lib/setProgress';

export interface AllTimeSetProgress {
  version: 1;
  updatedAt: number;
  kanji: Record<string, { correct: number }>;
  vocabulary: Record<string, { meaningCorrect: number; readingCorrect: number }>;
}

interface SetProgressState {
  isHydrated: boolean;
  data: AllTimeSetProgress;
  hydrate: () => Promise<void>;
  recordKanjiProgress: (kanjiChar: string) => Promise<void>;
  recordVocabularyProgress: (
    word: string,
    questionType: 'meaning' | 'reading',
  ) => Promise<void>;
  clearSetProgress: () => Promise<void>;
}

const STORAGE_KEY = 'kanadojo-set-progress-v1';

const setProgressStore = localforage.createInstance({
  name: 'kanadojo',
  storeName: 'set_progress',
});

const createDefaultSetProgress = (): AllTimeSetProgress => ({
  version: 1,
  updatedAt: Date.now(),
  kanji: {},
  vocabulary: {},
});

async function loadPersistedSetProgress(): Promise<AllTimeSetProgress> {
  try {
    const data = await setProgressStore.getItem<AllTimeSetProgress>(STORAGE_KEY);
    if (!data || data.version !== 1) {
      return createDefaultSetProgress();
    }

    return {
      version: 1,
      updatedAt: data.updatedAt ?? Date.now(),
      kanji: data.kanji ?? {},
      vocabulary: data.vocabulary ?? {},
    };
  } catch {
    return createDefaultSetProgress();
  }
}

async function persistSetProgress(data: AllTimeSetProgress): Promise<void> {
  await setProgressStore.setItem(STORAGE_KEY, data);
}

let hydrationPromise: Promise<void> | null = null;

const useSetProgressStore = create<SetProgressState>((set, get) => ({
  isHydrated: false,
  data: createDefaultSetProgress(),

  hydrate: async () => {
    if (get().isHydrated) return;
    if (hydrationPromise) return hydrationPromise;

    hydrationPromise = (async () => {
      const data = await loadPersistedSetProgress();
      set({ data, isHydrated: true });
      hydrationPromise = null;
    })();

    return hydrationPromise;
  },

  recordKanjiProgress: async kanjiChar => {
    if (!kanjiChar) return;
    if (!get().isHydrated) {
      await get().hydrate();
    }

    let nextData = get().data;
    let didChange = false;

    set(state => {
      const current = state.data.kanji[kanjiChar] ?? { correct: 0 };
      const nextCorrect = Math.min(
        current.correct + 1,
        KANJI_SET_PROGRESS_TARGET,
      );

      if (nextCorrect === current.correct) {
        nextData = state.data;
        return state;
      }

      didChange = true;
      nextData = {
        ...state.data,
        updatedAt: Date.now(),
        kanji: {
          ...state.data.kanji,
          [kanjiChar]: { correct: nextCorrect },
        },
      };

      return { data: nextData };
    });

    if (!didChange) {
      return;
    }

    await persistSetProgress(nextData);
  },

  recordVocabularyProgress: async (word, questionType) => {
    if (!word) return;
    if (!get().isHydrated) {
      await get().hydrate();
    }

    let nextData = get().data;
    let didChange = false;

    set(state => {
      const current = state.data.vocabulary[word] ?? {
        meaningCorrect: 0,
        readingCorrect: 0,
      };

      const nextEntry =
        questionType === 'meaning'
          ? {
              ...current,
              meaningCorrect: Math.min(
                current.meaningCorrect + 1,
                VOCAB_MEANING_PROGRESS_TARGET,
              ),
            }
          : {
              ...current,
              readingCorrect: Math.min(
                current.readingCorrect + 1,
                VOCAB_READING_PROGRESS_TARGET,
              ),
            };

      const isUnchanged =
        nextEntry.meaningCorrect === current.meaningCorrect &&
        nextEntry.readingCorrect === current.readingCorrect;

      if (isUnchanged) {
        nextData = state.data;
        return state;
      }

      didChange = true;
      nextData = {
        ...state.data,
        updatedAt: Date.now(),
        vocabulary: {
          ...state.data.vocabulary,
          [word]: nextEntry,
        },
      };

      return { data: nextData };
    });

    if (!didChange) {
      return;
    }

    await persistSetProgress(nextData);
  },

  clearSetProgress: async () => {
    const data = createDefaultSetProgress();
    set({ data, isHydrated: true });
    await persistSetProgress(data);
  },
}));

if (typeof window !== 'undefined') {
  void useSetProgressStore.getState().hydrate();
}

export default useSetProgressStore;
