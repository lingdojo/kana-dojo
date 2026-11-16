import {
  afterAll,
  afterEach,
  beforeAll,
  describe,
  expect,
  it,
  vi,
} from 'vitest';
import { calculateCurrentStreak } from '../lib/streakCalculations';

// Calendar days are not always 24 hours long. These tests pin a timezone with
// daylight saving time so that day-stepping logic is exercised across the
// 23-hour (spring forward) and 25-hour (fall back) days.
const ORIGINAL_TZ = process.env.TZ;

describe('calculateCurrentStreak across daylight saving time changes', () => {
  beforeAll(() => {
    process.env.TZ = 'America/New_York';
  });

  afterAll(() => {
    if (ORIGINAL_TZ === undefined) {
      delete process.env.TZ;
    } else {
      process.env.TZ = ORIGINAL_TZ;
    }
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  // DST started on 2024-03-10 in America/New_York (that day had 23 hours).
  it('counts the 23-hour spring-forward day when checked just after midnight', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2024, 2, 11, 0, 30)); // 2024-03-11 00:30 local

    expect(
      calculateCurrentStreak([
        '2024-03-08',
        '2024-03-09',
        '2024-03-10',
        '2024-03-11',
      ]),
    ).toBe(4);
  });

  it('treats the spring-forward day as yesterday when there is no visit today', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2024, 2, 11, 0, 30)); // 2024-03-11 00:30 local

    expect(calculateCurrentStreak(['2024-03-09', '2024-03-10'])).toBe(2);
  });

  // DST ended on 2024-11-03 in America/New_York (that day had 25 hours).
  it('does not count the 25-hour fall-back day twice when checked late at night', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2024, 10, 4, 23, 30)); // 2024-11-04 23:30 local

    expect(
      calculateCurrentStreak([
        '2024-11-01',
        '2024-11-02',
        '2024-11-03',
        '2024-11-04',
      ]),
    ).toBe(4);
  });
});
