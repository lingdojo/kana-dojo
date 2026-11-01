'use client';

import localforage from 'localforage';

import useStatsStore from '../store/useStatsStore';
import useVisitStore from '../store/useVisitStore';
import useSetProgressStore from '../store/useSetProgressStore';
import type { AllTimeSetProgress } from '../store/useSetProgressStore';

type StatsStoreState = ReturnType<typeof useStatsStore.getState>;

// Storage keys must match the constants used in the original stores
const VISIT_STORAGE_KEY = 'kanadojo-visits';
const SET_PROGRESS_STORAGE_KEY = 'kanadojo-set-progress-v1';

// Dedicated localforage instance matching useSetProgressStore's setup
const setProgressInstance = localforage.createInstance({
  name: 'kanadojo',
  storeName: 'set_progress',
});

export const progressBackup = {
  // Stats (synchronous — Zustand persist / localStorage)
  getStatsState: (): StatsStoreState => useStatsStore.getState(),
  setStatsState: (partial: Partial<StatsStoreState>) =>
    useStatsStore.setState(partial),

  // Visits / streak calendar (async — localforage / IndexedDB)
  getVisits: async (): Promise<string[]> => {
    try {
      const stored = await localforage.getItem<string[]>(VISIT_STORAGE_KEY);
      return Array.isArray(stored) ? stored : [];
    } catch {
      return [];
    }
  },
  setVisits: async (visits: string[]): Promise<void> => {
    try {
      await localforage.setItem(VISIT_STORAGE_KEY, visits);
      // Sync into the in-memory Zustand store so the UI reflects the change
      useVisitStore.setState({ visits, isLoaded: true });
    } catch {
      // Non-fatal
    }
  },

  // Set progress / mastery (async — localforage / IndexedDB)
  getSetProgress: async (): Promise<AllTimeSetProgress | null> => {
    try {
      return await setProgressInstance.getItem<AllTimeSetProgress>(
        SET_PROGRESS_STORAGE_KEY,
      );
    } catch {
      return null;
    }
  },
  setSetProgress: async (data: AllTimeSetProgress): Promise<void> => {
    try {
      await setProgressInstance.setItem(SET_PROGRESS_STORAGE_KEY, data);
      // Sync into the in-memory Zustand store
      useSetProgressStore.setState({ data, isHydrated: true });
    } catch {
      // Non-fatal
    }
  },
};

export type { StatsStoreState };
