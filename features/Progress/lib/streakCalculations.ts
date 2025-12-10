/**
 * Streak calculation utility functions
 * Pure functions for calculating visit streaks and date operations
 */

export type TimePeriod = 'week' | 'month' | 'year';

/**
 * Formats a Date object to YYYY-MM-DD string in local timezone
 */
export function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Parses a YYYY-MM-DD string to a Date object (at midnight local time)
 */
export function parseDate(dateString: string): Date {
  const [year, month, day] = dateString.split('-').map(Number);
  return new Date(year, month - 1, day);
}

/**
 * Checks if a date string exists in the visits array
 */
export function hasVisit(visits: string[], date: string): boolean {
  return visits.includes(date);
}

/**
 * Calculates the current consecutive day streak
 * - If visited today, counts consecutive days ending at today
 * - If not visited today but visited yesterday, counts consecutive days ending at yesterday
 * - Returns 0 if neither condition is met
 */
export function calculateCurrentStreak(visits: string[]): number {
  if (visits.length === 0) return 0;

  const sortedVisits = [...visits].sort().reverse(); // Most recent first
  const today = formatDate(new Date());
  const yesterday = formatDate(new Date(Date.now() - 24 * 60 * 60 * 1000));

  // Check if we have a visit today or yesterday to start counting
  const hasToday = sortedVisits.includes(today);
  const hasYesterday = sortedVisits.includes(yesterday);

  if (!hasToday && !hasYesterday) return 0;

  // Start from today if visited, otherwise from yesterday
  let currentDate = hasToday
    ? new Date()
    : new Date(Date.now() - 24 * 60 * 60 * 1000);
  let streak = 0;

  while (true) {
    const dateStr = formatDate(currentDate);
    if (sortedVisits.includes(dateStr)) {
      streak++;
      // Move to previous day
      currentDate = new Date(currentDate.getTime() - 24 * 60 * 60 * 1000);
    } else {
      break;
    }
  }

  return streak;
}

/**
 * Calculates the longest consecutive day streak in the entire visit history
 */
export function calculateLongestStreak(visits: string[]): number {
  if (visits.length === 0) return 0;
  if (visits.length === 1) return 1;

  const sortedVisits = [...visits].sort(); // Oldest first
  let longestStreak = 1;
  let currentStreak = 1;

  for (let i = 1; i < sortedVisits.length; i++) {
    const prevDate = parseDate(sortedVisits[i - 1]);
    const currDate = parseDate(sortedVisits[i]);

    // Calculate difference in days
    const diffTime = currDate.getTime() - prevDate.getTime();
    const diffDays = Math.round(diffTime / (24 * 60 * 60 * 1000));

    if (diffDays === 1) {
      // Consecutive day
      currentStreak++;
      longestStreak = Math.max(longestStreak, currentStreak);
    } else if (diffDays > 1) {
      // Gap in visits, reset streak
      currentStreak = 1;
    }
    // diffDays === 0 means duplicate date, ignore
  }

  return longestStreak;
}

/**
 * Gets the start of the current week (Monday)
 */
export function getStartOfWeek(referenceDate: Date = new Date()): Date {
  const date = new Date(referenceDate);
  const day = date.getDay(); // 0 = Sunday, 1 = Monday, etc.
  // Convert to Monday-based: Monday = 0, Sunday = 6
  const mondayBasedDay = day === 0 ? 6 : day - 1;
  date.setDate(date.getDate() - mondayBasedDay);
  date.setHours(0, 0, 0, 0);
  return date;
}

/**
 * Gets the start of the current month
 */
export function getStartOfMonth(referenceDate: Date = new Date()): Date {
  const date = new Date(referenceDate);
  date.setDate(1);
  date.setHours(0, 0, 0, 0);
  return date;
}

/**
 * Gets the start of the current year
 */
export function getStartOfYear(referenceDate: Date = new Date()): Date {
  const date = new Date(referenceDate);
  date.setMonth(0, 1);
  date.setHours(0, 0, 0, 0);
  return date;
}

/**
 * Gets an array of date strings for a specific time period
 * Returns dates from the start of the period to today
 */
export function getDaysInPeriod(
  period: TimePeriod,
  referenceDate: Date = new Date()
): string[] {
  const days: string[] = [];
  let startDate: Date;
  const endDate = new Date(referenceDate);
  endDate.setHours(0, 0, 0, 0);

  switch (period) {
    case 'week':
      startDate = getStartOfWeek(referenceDate);
      break;
    case 'month':
      startDate = getStartOfMonth(referenceDate);
      break;
    case 'year':
      startDate = getStartOfYear(referenceDate);
      break;
  }

  // Generate dates from start of period to today
  const currentDate = new Date(startDate);
  while (currentDate <= endDate) {
    days.push(formatDate(currentDate));
    currentDate.setDate(currentDate.getDate() + 1);
  }

  return days;
}

/**
 * Groups dates by month for yearly view
 * Returns an object with month keys (YYYY-MM) and arrays of dates
 */
export function groupDatesByMonth(dates: string[]): Record<string, string[]> {
  const grouped: Record<string, string[]> = {};

  for (const date of dates) {
    const monthKey = date.substring(0, 7); // YYYY-MM
    if (!grouped[monthKey]) {
      grouped[monthKey] = [];
    }
    grouped[monthKey].push(date);
  }

  return grouped;
}

/**
 * Gets the day of week (0 = Monday, 6 = Sunday) for a date string
 * Uses Monday-based week (Monday = 0, Sunday = 6)
 */
export function getDayOfWeek(dateString: string): number {
  const jsDay = parseDate(dateString).getDay(); // 0 = Sunday
  // Convert to Monday-based: Monday = 0, Sunday = 6
  return jsDay === 0 ? 6 : jsDay - 1;
}

/**
 * Gets the short day name for a date string
 */
export function getDayName(dateString: string): string {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  return days[getDayOfWeek(dateString)];
}

/**
 * Gets the month name from a month key (YYYY-MM)
 */
export function getMonthName(monthKey: string): string {
  const months = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec'
  ];
  const monthIndex = parseInt(monthKey.split('-')[1], 10) - 1;
  return months[monthIndex];
}

/**
 * Validates that a date string matches YYYY-MM-DD format
 */
export function isValidDateFormat(dateString: string): boolean {
  const regex = /^\d{4}-\d{2}-\d{2}$/;
  if (!regex.test(dateString)) return false;

  // Also validate it's a real date
  const parsed = parseDate(dateString);
  return formatDate(parsed) === dateString;
}

/**
 * Calculates total unique visit days
 */
export function calculateTotalVisits(visits: string[]): number {
  return new Set(visits).size;
}
