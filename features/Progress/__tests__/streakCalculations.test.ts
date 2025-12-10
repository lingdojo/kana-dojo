import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import {
  formatDate,
  parseDate,
  calculateCurrentStreak,
  calculateLongestStreak,
  calculateTotalVisits,
  getDaysInPeriod,
  hasVisit,
  isValidDateFormat
} from '../lib/streakCalculations';

// Helper to generate valid date strings
const dateStringArb = fc
  .date({
    min: new Date('2020-01-01'),
    max: new Date('2030-12-31')
  })
  .map(d => formatDate(d));

// Helper to generate arrays of unique date strings
const uniqueDateArrayArb = fc
  .array(dateStringArb, { minLength: 0, maxLength: 100 })
  .map(dates => [...new Set(dates)]);

// Helper to generate consecutive date arrays
const consecutiveDatesArb = (length: number) =>
  fc
    .date({
      min: new Date('2020-01-01'),
      max: new Date('2029-12-31')
    })
    .map(startDate => {
      const dates: string[] = [];
      for (let i = 0; i < length; i++) {
        const d = new Date(startDate);
        d.setDate(d.getDate() + i);
        dates.push(formatDate(d));
      }
      return dates;
    });

describe('Streak Calculations', () => {
  /**
   * **Feature: visit-streak-tracker, Property 3: Date Format Consistency**
   * For any stored visit date, the date string SHALL match the pattern YYYY-MM-DD
   * **Validates: Requirements 1.3**
   */
  describe('Property 3: Date Format Consistency', () => {
    it('formatDate always produces YYYY-MM-DD format', () => {
      fc.assert(
        fc.property(
          fc
            .date({ min: new Date('1970-01-01'), max: new Date('2100-12-31') })
            .filter(d => !isNaN(d.getTime())),
          date => {
            const formatted = formatDate(date);
            expect(isValidDateFormat(formatted)).toBe(true);
            expect(formatted).toMatch(/^\d{4}-\d{2}-\d{2}$/);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('parseDate and formatDate are inverses (round-trip)', () => {
      fc.assert(
        fc.property(dateStringArb, dateStr => {
          const parsed = parseDate(dateStr);
          const reformatted = formatDate(parsed);
          expect(reformatted).toBe(dateStr);
        }),
        { numRuns: 100 }
      );
    });
  });

  /**
   * **Feature: visit-streak-tracker, Property 8: Current Streak Calculation**
   * For any visits array, the current streak SHALL equal the count of consecutive days
   * ending at today (if visited today) or yesterday (if not visited today but visited yesterday),
   * and SHALL be 0 if neither condition is met.
   * **Validates: Requirements 6.1, 6.4**
   */
  describe('Property 8: Current Streak Calculation', () => {
    it('returns 0 for empty visits', () => {
      expect(calculateCurrentStreak([])).toBe(0);
    });

    it('returns correct streak for consecutive days ending today', () => {
      fc.assert(
        fc.property(fc.integer({ min: 1, max: 30 }), streakLength => {
          const today = new Date();
          const visits: string[] = [];
          for (let i = 0; i < streakLength; i++) {
            const d = new Date(today);
            d.setDate(d.getDate() - i);
            visits.push(formatDate(d));
          }
          const result = calculateCurrentStreak(visits);
          expect(result).toBe(streakLength);
        }),
        { numRuns: 100 }
      );
    });

    it('returns 0 when no visit today or yesterday', () => {
      fc.assert(
        fc.property(fc.integer({ min: 3, max: 100 }), daysAgo => {
          const oldDate = new Date();
          oldDate.setDate(oldDate.getDate() - daysAgo);
          const visits = [formatDate(oldDate)];
          expect(calculateCurrentStreak(visits)).toBe(0);
        }),
        { numRuns: 100 }
      );
    });
  });

  /**
   * **Feature: visit-streak-tracker, Property 9: Longest Streak Calculation**
   * For any visits array, the longest streak SHALL equal the maximum consecutive
   * day sequence found in the entire visit history.
   * **Validates: Requirements 7.2**
   */
  describe('Property 9: Longest Streak Calculation', () => {
    it('returns 0 for empty visits', () => {
      expect(calculateLongestStreak([])).toBe(0);
    });

    it('returns 1 for single visit', () => {
      fc.assert(
        fc.property(dateStringArb, date => {
          expect(calculateLongestStreak([date])).toBe(1);
        }),
        { numRuns: 100 }
      );
    });

    it('correctly identifies consecutive day sequences', () => {
      fc.assert(
        fc.property(fc.integer({ min: 2, max: 20 }), streakLength => {
          const startDate = new Date('2024-06-01');
          const visits: string[] = [];
          for (let i = 0; i < streakLength; i++) {
            const d = new Date(startDate);
            d.setDate(d.getDate() + i);
            visits.push(formatDate(d));
          }
          expect(calculateLongestStreak(visits)).toBe(streakLength);
        }),
        { numRuns: 100 }
      );
    });

    it('longest streak is at least 1 for non-empty arrays', () => {
      fc.assert(
        fc.property(
          fc.array(dateStringArb, { minLength: 1, maxLength: 50 }),
          visits => {
            expect(calculateLongestStreak(visits)).toBeGreaterThanOrEqual(1);
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  /**
   * **Feature: visit-streak-tracker, Property 10: Total Visits Count**
   * For any visits array, the total visits count SHALL equal the length of the
   * unique dates in the visits array.
   * **Validates: Requirements 7.1**
   */
  describe('Property 10: Total Visits Count', () => {
    it('returns 0 for empty visits', () => {
      expect(calculateTotalVisits([])).toBe(0);
    });

    it('counts unique dates correctly', () => {
      fc.assert(
        fc.property(uniqueDateArrayArb, visits => {
          const result = calculateTotalVisits(visits);
          expect(result).toBe(visits.length);
        }),
        { numRuns: 100 }
      );
    });

    it('handles duplicate dates by counting unique only', () => {
      fc.assert(
        fc.property(
          fc.array(dateStringArb, { minLength: 1, maxLength: 20 }),
          visits => {
            const uniqueCount = new Set(visits).size;
            expect(calculateTotalVisits(visits)).toBe(uniqueCount);
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  /**
   * Additional unit tests for helper functions
   */
  describe('Helper Functions', () => {
    describe('hasVisit', () => {
      it('returns true when date exists in visits', () => {
        fc.assert(
          fc.property(
            fc.array(dateStringArb, { minLength: 1, maxLength: 20 }),
            visits => {
              const randomIndex = Math.floor(Math.random() * visits.length);
              expect(hasVisit(visits, visits[randomIndex])).toBe(true);
            }
          ),
          { numRuns: 100 }
        );
      });

      it('returns false when date does not exist', () => {
        const visits = ['2024-01-01', '2024-01-02'];
        expect(hasVisit(visits, '2024-01-03')).toBe(false);
      });
    });

    describe('getDaysInPeriod', () => {
      it('returns 1-7 days for week period', () => {
        const days = getDaysInPeriod('week');
        expect(days.length).toBeGreaterThanOrEqual(1);
        expect(days.length).toBeLessThanOrEqual(7);
      });

      it('returns 1-31 days for month period', () => {
        const days = getDaysInPeriod('month');
        expect(days.length).toBeGreaterThanOrEqual(1);
        expect(days.length).toBeLessThanOrEqual(31);
      });

      it('returns 1-366 days for year period', () => {
        const days = getDaysInPeriod('year');
        expect(days.length).toBeGreaterThanOrEqual(1);
        expect(days.length).toBeLessThanOrEqual(366);
      });

      it('includes today as the last day', () => {
        const today = formatDate(new Date());
        const daysWeek = getDaysInPeriod('week');
        const daysMonth = getDaysInPeriod('month');
        const daysYear = getDaysInPeriod('year');

        expect(daysWeek[daysWeek.length - 1]).toBe(today);
        expect(daysMonth[daysMonth.length - 1]).toBe(today);
        expect(daysYear[daysYear.length - 1]).toBe(today);
      });
    });

    describe('isValidDateFormat', () => {
      it('validates correct YYYY-MM-DD format', () => {
        expect(isValidDateFormat('2024-01-15')).toBe(true);
        expect(isValidDateFormat('2024-12-31')).toBe(true);
      });

      it('rejects invalid formats', () => {
        expect(isValidDateFormat('2024-1-15')).toBe(false);
        expect(isValidDateFormat('24-01-15')).toBe(false);
        expect(isValidDateFormat('2024/01/15')).toBe(false);
        expect(isValidDateFormat('invalid')).toBe(false);
      });

      it('rejects invalid dates', () => {
        expect(isValidDateFormat('2024-02-30')).toBe(false);
        expect(isValidDateFormat('2024-13-01')).toBe(false);
      });
    });
  });
});
