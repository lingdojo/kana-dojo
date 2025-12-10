import { create } from 'zustand';
import localforage from 'localforage';
import { formatDate } from '../lib/streakCalculations';

const STORAGE_KEY = 'kanadojo-visits';

interface VisitState {
  visits: string[]; // Array of "YYYY-MM-DD" date strings
  isLoaded: boolean;

  // Actions
  loadVisits: () => Promise<void>;
  recordVisit: (date?: string) => Promise<void>;
  getVisits: () => string[];
}

const useVisitStore = create<VisitState>()((set, get) => ({
  visits: [],
  isLoaded: false,

  loadVisits: async () => {
    try {
      const storedVisits = await localforage.getItem<string[]>(STORAGE_KEY);

      if (storedVisits && Array.isArray(storedVisits)) {
        // Filter out any invalid date strings
        const validVisits = storedVisits.filter(
          date => typeof date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(date)
        );
        set({ visits: validVisits, isLoaded: true });
      } else {
        set({ visits: [], isLoaded: true });
      }
    } catch (error) {
      console.warn('Failed to load visits from LocalForage:', error);
      set({ visits: [], isLoaded: true });
    }
  },

  recordVisit: async (date?: string) => {
    const dateToRecord = date || formatDate(new Date());
    const { visits } = get();

    // Check if already recorded (idempotent)
    if (visits.includes(dateToRecord)) {
      return;
    }

    const newVisits = [...visits, dateToRecord];
    set({ visits: newVisits });

    try {
      await localforage.setItem(STORAGE_KEY, newVisits);
    } catch (error) {
      console.warn('Failed to save visit to LocalForage:', error);
    }
  },

  getVisits: () => get().visits
}));

export default useVisitStore;
