import { describe, it, expect, beforeEach, vi } from 'vitest';
import * as fc from 'fast-check';
import { formatDate } from '../lib/streakCalculations';

// Mock localforage
const mockStorage: Record<string, unknown> = {};
vi.mock('localforage', () => ({
  default: {
    getItem: vi.fn((key: string) => Promise.resolve(mockStorage[key] ?? null)),
    setItem: vi.fn((key: string, value: unknown) => {
      mockStorage[key] = value;
      return Promise.resolve(value);
    })
  }
}));

// Helper to generate valid date strings (filter out invalid dates)
const dateStringArb = fc
  .date({
    min: new Date('2020-01-01'),
    max: new Date('2030-12-31')
  })
  .filter(d => !isNaN(d.getTime()))
  .map(d => formatDate(d))
  .filter(s => /^\d{4}-\d{2}-\d{2}$/.test(s) && !s.includes('NaN'));

describe('useVisitStore', () => {
  beforeEach(() => {
    // Clear mock storage
    Object.keys(mockStorage).forEach(key => delete mockStorage[key]);
    // Reset modules to get fresh store state
    vi.resetModules();
  });

  /**
   * **Feature: visit-streak-tracker, Property 1: Visit Idempotence**
   * For any sequence of visit recordings on the same calendar day,
   * the stored visits array SHALL contain exactly one entry for that day.
   * **Validates: Requirements 1.2**
   */
  describe('Property 1: Visit Idempotence', () => {
    it('recording the same date multiple times results in only one entry', async () => {
      const { default: useVisitStore } = await import('../store/useVisitStore');

      await fc.assert(
        fc.asyncProperty(
          dateStringArb,
          fc.integer({ min: 2, max: 10 }),
          async (date, repeatCount) => {
            // Reset store state
            useVisitStore.setState({ visits: [], isLoaded: true });

            // Record the same date multiple times
            for (let i = 0; i < repeatCount; i++) {
              await useVisitStore.getState().recordVisit(date);
            }

            const visits = useVisitStore.getState().visits;
            const occurrences = visits.filter(v => v === date).length;

            expect(occurrences).toBe(1);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('multiple different dates are all recorded', async () => {
      const { default: useVisitStore } = await import('../store/useVisitStore');

      await fc.assert(
        fc.asyncProperty(
          fc
            .array(dateStringArb, { minLength: 1, maxLength: 20 })
            .map(dates => [...new Set(dates)]), // Ensure unique dates
          async uniqueDates => {
            // Reset store state
            useVisitStore.setState({ visits: [], isLoaded: true });

            // Record each date
            for (const date of uniqueDates) {
              await useVisitStore.getState().recordVisit(date);
            }

            const visits = useVisitStore.getState().visits;
            expect(visits.length).toBe(uniqueDates.length);

            // All dates should be present
            for (const date of uniqueDates) {
              expect(visits).toContain(date);
            }
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  /**
   * **Feature: visit-streak-tracker, Property 2: Visit Serialization Round-Trip**
   * For any valid visits array, serializing to LocalForage and deserializing back
   * SHALL produce an equivalent array.
   * **Validates: Requirements 1.4, 1.5**
   */
  describe('Property 2: Visit Serialization Round-Trip', () => {
    it('visits survive save and load cycle', async () => {
      const { default: useVisitStore } = await import('../store/useVisitStore');

      await fc.assert(
        fc.asyncProperty(
          fc
            .array(dateStringArb, { minLength: 0, maxLength: 30 })
            .map(dates => [...new Set(dates)]), // Ensure unique dates
          async uniqueDates => {
            // Reset store and storage
            useVisitStore.setState({ visits: [], isLoaded: false });
            delete mockStorage['kanadojo-visits'];

            // Record all dates
            useVisitStore.setState({ visits: [], isLoaded: true });
            for (const date of uniqueDates) {
              await useVisitStore.getState().recordVisit(date);
            }

            // Simulate app reload by resetting store state and loading
            const savedVisits = [...useVisitStore.getState().visits];
            useVisitStore.setState({ visits: [], isLoaded: false });

            // Load from storage
            await useVisitStore.getState().loadVisits();

            const loadedVisits = useVisitStore.getState().visits;

            // Should have same length
            expect(loadedVisits.length).toBe(savedVisits.length);

            // Should contain all the same dates
            for (const date of savedVisits) {
              expect(loadedVisits).toContain(date);
            }
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('Store Behavior', () => {
    it('loadVisits handles empty storage', async () => {
      const { default: useVisitStore } = await import('../store/useVisitStore');

      useVisitStore.setState({ visits: [], isLoaded: false });
      delete mockStorage['kanadojo-visits'];

      await useVisitStore.getState().loadVisits();

      expect(useVisitStore.getState().visits).toEqual([]);
      expect(useVisitStore.getState().isLoaded).toBe(true);
    });

    it('loadVisits filters invalid date strings', async () => {
      const { default: useVisitStore } = await import('../store/useVisitStore');

      // Set up storage with some invalid entries
      mockStorage['kanadojo-visits'] = [
        '2024-01-15',
        'invalid',
        '2024-02-20',
        '24-01-15',
        '2024-03-25'
      ];

      useVisitStore.setState({ visits: [], isLoaded: false });
      await useVisitStore.getState().loadVisits();

      const visits = useVisitStore.getState().visits;
      expect(visits).toEqual(['2024-01-15', '2024-02-20', '2024-03-25']);
    });

    it('recordVisit uses today when no date provided', async () => {
      const { default: useVisitStore } = await import('../store/useVisitStore');

      useVisitStore.setState({ visits: [], isLoaded: true });

      await useVisitStore.getState().recordVisit();

      const today = formatDate(new Date());
      expect(useVisitStore.getState().visits).toContain(today);
    });

    it('getVisits returns current visits array', async () => {
      const { default: useVisitStore } = await import('../store/useVisitStore');

      const testVisits = ['2024-01-01', '2024-01-02', '2024-01-03'];
      useVisitStore.setState({ visits: testVisits, isLoaded: true });

      expect(useVisitStore.getState().getVisits()).toEqual(testVisits);
    });
  });
});
