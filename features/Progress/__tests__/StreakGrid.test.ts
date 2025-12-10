import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import {
  getDaysInPeriod,
  hasVisit,
  formatDate,
  groupDatesByMonth,
  getStartOfWeek,
  getStartOfMonth,
  getStartOfYear
} from '../lib/streakCalculations';

// Helper to generate valid dates (filter out invalid dates)
const validDateArb = fc
  .date({
    min: new Date('2020-01-01'),
    max: new Date('2030-12-31')
  })
  .filter(d => !isNaN(d.getTime()));

// Helper to generate valid date strings
const dateStringArb = validDateArb
  .map(d => formatDate(d))
  .filter(s => /^\d{4}-\d{2}-\d{2}$/.test(s) && !s.includes('NaN'));

// Helper to generate arrays of unique date strings
const uniqueDateArrayArb = fc
  .array(dateStringArb, { minLength: 0, maxLength: 100 })
  .map(dates => [...new Set(dates)]);

describe('StreakGrid Properties', () => {
  /**
   * **Feature: visit-streak-tracker, Property 4: Week View**
   * For any reference date, the week view SHALL produce days from start of week to reference date.
   * **Validates: Requirements 3.1**
   */
  describe('Property 4: Week View', () => {
    it('week view starts from Sunday of current week', () => {
      fc.assert(
        fc.property(validDateArb, referenceDate => {
          const days = getDaysInPeriod('week', referenceDate);
          const startOfWeek = getStartOfWeek(referenceDate);
          expect(days[0]).toBe(formatDate(startOfWeek));
        }),
        { numRuns: 100 }
      );
    });

    it('week view ends at reference date', () => {
      fc.assert(
        fc.property(validDateArb, referenceDate => {
          const days = getDaysInPeriod('week', referenceDate);
          const refDateStr = formatDate(referenceDate);
          expect(days[days.length - 1]).toBe(refDateStr);
        }),
        { numRuns: 100 }
      );
    });

    it('week view produces 1-7 days depending on day of week', () => {
      fc.assert(
        fc.property(validDateArb, referenceDate => {
          const days = getDaysInPeriod('week', referenceDate);
          expect(days.length).toBeGreaterThanOrEqual(1);
          expect(days.length).toBeLessThanOrEqual(7);
        }),
        { numRuns: 100 }
      );
    });
  });

  /**
   * **Feature: visit-streak-tracker, Property 5: Month View**
   * For any reference date, the month view SHALL produce days from start of month to reference date.
   * **Validates: Requirements 4.1**
   */
  describe('Property 5: Month View', () => {
    it('month view starts from 1st of current month', () => {
      fc.assert(
        fc.property(validDateArb, referenceDate => {
          const days = getDaysInPeriod('month', referenceDate);
          const startOfMonth = getStartOfMonth(referenceDate);
          expect(days[0]).toBe(formatDate(startOfMonth));
        }),
        { numRuns: 100 }
      );
    });

    it('month view ends at reference date', () => {
      fc.assert(
        fc.property(validDateArb, referenceDate => {
          const days = getDaysInPeriod('month', referenceDate);
          const refDateStr = formatDate(referenceDate);
          expect(days[days.length - 1]).toBe(refDateStr);
        }),
        { numRuns: 100 }
      );
    });

    it('month view produces 1-31 days', () => {
      fc.assert(
        fc.property(validDateArb, referenceDate => {
          const days = getDaysInPeriod('month', referenceDate);
          expect(days.length).toBeGreaterThanOrEqual(1);
          expect(days.length).toBeLessThanOrEqual(31);
        }),
        { numRuns: 100 }
      );
    });
  });

  /**
   * **Feature: visit-streak-tracker, Property 6: Year View**
   * For any reference date, the year view SHALL produce days from Jan 1 to reference date.
   * **Validates: Requirements 5.1, 5.2**
   */
  describe('Property 6: Year View', () => {
    it('year view starts from Jan 1 of current year', () => {
      fc.assert(
        fc.property(validDateArb, referenceDate => {
          const days = getDaysInPeriod('year', referenceDate);
          const startOfYear = getStartOfYear(referenceDate);
          expect(days[0]).toBe(formatDate(startOfYear));
        }),
        { numRuns: 100 }
      );
    });

    it('year view ends at reference date', () => {
      fc.assert(
        fc.property(validDateArb, referenceDate => {
          const days = getDaysInPeriod('year', referenceDate);
          const refDateStr = formatDate(referenceDate);
          expect(days[days.length - 1]).toBe(refDateStr);
        }),
        { numRuns: 100 }
      );
    });

    it('year view produces 1-366 days', () => {
      fc.assert(
        fc.property(validDateArb, referenceDate => {
          const days = getDaysInPeriod('year', referenceDate);
          expect(days.length).toBeGreaterThanOrEqual(1);
          expect(days.length).toBeLessThanOrEqual(366);
        }),
        { numRuns: 100 }
      );
    });

    it('year view days can be grouped into months', () => {
      fc.assert(
        fc.property(validDateArb, referenceDate => {
          const days = getDaysInPeriod('year', referenceDate);
          if (days.length === 0) return;

          const monthGroups = groupDatesByMonth(days);
          const monthCount = Object.keys(monthGroups).length;

          // Should have 1-12 months depending on reference date
          expect(monthCount).toBeGreaterThanOrEqual(1);
          expect(monthCount).toBeLessThanOrEqual(12);

          // Total days across all months should equal days length
          const totalDays = Object.values(monthGroups).reduce(
            (sum, monthDays) => sum + monthDays.length,
            0
          );
          expect(totalDays).toBe(days.length);
        }),
        { numRuns: 100 }
      );
    });
  });

  /**
   * **Feature: visit-streak-tracker, Property 7: Visit Indicator Correctness**
   * For any visits array and any day in the display period, the day cell SHALL
   * show a filled indicator if and only if that day exists in the visits array.
   * **Validates: Requirements 3.2, 3.3**
   */
  describe('Property 7: Visit Indicator Correctness', () => {
    it('hasVisit returns true only for dates in the visits array', () => {
      fc.assert(
        fc.property(uniqueDateArrayArb, dateStringArb, (visits, testDate) => {
          const result = hasVisit(visits, testDate);
          const expected = visits.includes(testDate);
          expect(result).toBe(expected);
        }),
        { numRuns: 100 }
      );
    });

    it('all visited dates in period are correctly identified', () => {
      fc.assert(
        fc.property(
          validDateArb,
          uniqueDateArrayArb,
          (referenceDate, visits) => {
            const days = getDaysInPeriod('month', referenceDate);

            for (const day of days) {
              const isVisited = hasVisit(visits, day);
              const shouldBeVisited = visits.includes(day);
              expect(isVisited).toBe(shouldBeVisited);
            }
          }
        ),
        { numRuns: 100 }
      );
    });

    it('empty visits array means no days are visited', () => {
      fc.assert(
        fc.property(validDateArb, referenceDate => {
          const days = getDaysInPeriod('week', referenceDate);
          const emptyVisits: string[] = [];

          for (const day of days) {
            expect(hasVisit(emptyVisits, day)).toBe(false);
          }
        }),
        { numRuns: 100 }
      );
    });
  });
});
