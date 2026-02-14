'use client';

import clsx from 'clsx';
import {
  type TimePeriod,
  getDaysInPeriod,
  hasVisit,
  getDayOfWeek,
  getMonthName,
  formatDate,
} from '../lib/streakCalculations';

// Constant empty week array to avoid recreating on every render
const EMPTY_WEEK: (string | null)[] = Array(7).fill(null);

interface StreakGridProps {
  visits: string[];
  period: TimePeriod;
}

/**
 * Check if a date string is in the future (after today)
 */
function isFutureDate(dateStr: string): boolean {
  const today = formatDate(new Date());
  return dateStr > today;
}

// Monday-based day labels
const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const FULL_MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

/**
 * GitHub-style contribution grid cell
 */
function DayCell({
  date,
  isVisited,
  isFuture = false,
  size = 'sm',
}: {
  date: string;
  isVisited: boolean;
  isFuture?: boolean;
  size?: 'sm' | 'md' | 'lg';
}) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  };

  return (
    <div
      className={clsx(
        'cursor-default rounded transition-colors',
        sizeClasses[size],
        isFuture
          ? 'border border-(--border-color) bg-transparent opacity-40'
          : isVisited
            ? 'bg-(--main-color)'
            : 'bg-(--border-color) opacity-25',
      )}
      title={`${date}${isFuture ? ' (future)' : isVisited ? ' ✓' : ''}`}
    />
  );
}

/**
 * Get all days of the current week (Mon-Sun), including future days
 */
function getFullWeekDays(days: string[]): (string | null)[] {
  // Get the start of the week (Monday) from the first day in days
  if (days.length === 0) return [...EMPTY_WEEK];

  const firstDay = new Date(days[0]);
  const dayOfWeek = firstDay.getDay();
  const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  const monday = new Date(firstDay);
  monday.setDate(firstDay.getDate() + mondayOffset);

  const weekDays: (string | null)[] = [];
  for (let i = 0; i < 7; i++) {
    const date = new Date(monday);
    date.setDate(monday.getDate() + i);
    weekDays.push(formatDate(date));
  }
  return weekDays;
}

/**
 * Week view - horizontal row of 7 days (Mon-Sun)
 */
function WeekGrid({ visits, days }: { visits: string[]; days: string[] }) {
  const fullWeekDays = getFullWeekDays(days);

  return (
    <div className='flex flex-col gap-3'>
      {/* Day labels */}
      <div className='flex justify-center gap-2'>
        {DAY_LABELS.map(label => (
          <div
            key={label}
            className='w-10 text-center text-xs font-medium text-(--secondary-color)'
          >
            {label}
          </div>
        ))}
      </div>
      {/* Day cells */}
      <div className='flex justify-center gap-2'>
        {fullWeekDays.map((dayDate, dayIndex) => {
          if (!dayDate) {
            return <div key={dayIndex} className='h-10 w-10' />;
          }
          const isFuture = isFutureDate(dayDate);
          const isVisited = hasVisit(visits, dayDate);
          return (
            <div
              key={dayDate}
              className='flex h-10 w-10 items-center justify-center'
            >
              <div
                className={clsx(
                  'h-8 w-8 rounded-md transition-colors',
                  isFuture
                    ? 'border border-(--border-color) bg-transparent opacity-40'
                    : isVisited
                      ? 'bg-(--main-color)'
                      : 'bg-(--border-color) opacity-25',
                )}
                title={`${dayDate}${
                  isFuture ? ' (future)' : isVisited ? ' ✓' : ''
                }`}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}

/**
 * Get all days of the current month, including future days
 */
function getFullMonthDays(): string[] {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();

  // Get the last day of the month
  const lastDay = new Date(year, month + 1, 0).getDate();

  const monthDays: string[] = [];
  for (let day = 1; day <= lastDay; day++) {
    const date = new Date(year, month, day);
    monthDays.push(formatDate(date));
  }
  return monthDays;
}

/**
 * Month view - GitHub-style grid with weeks as columns
 * Each column is a week, rows are days of week (Mon-Sun)
 */
function MonthGrid({ visits }: { visits: string[]; days: string[] }) {
  // Get current month name
  const currentDate = new Date();
  const monthName = FULL_MONTH_NAMES[currentDate.getMonth()];

  // Get all days of the month (including future)
  const allMonthDays = getFullMonthDays();

  // Group days into weeks (columns) - Monday-based
  const weeks: (string | null)[][] = [];
  let currentWeek: (string | null)[] = [...EMPTY_WEEK];

  for (const day of allMonthDays) {
    const dayOfWeek = getDayOfWeek(day); // 0 = Monday, 6 = Sunday
    currentWeek[dayOfWeek] = day;

    // If Sunday (6), start a new week
    if (dayOfWeek === 6) {
      weeks.push(currentWeek);
      currentWeek = [...EMPTY_WEEK];
    }
  }

  // Push the last partial week if it has any days
  if (currentWeek.some(d => d !== null)) {
    weeks.push(currentWeek);
  }

  return (
    <div className='flex flex-col gap-3'>
      {/* Month title */}
      <h3 className='text-lg font-semibold text-(--main-color)'>{monthName}</h3>

      <div className='flex gap-2'>
        {/* Day labels on the left */}
        <div className='flex flex-col gap-0.5'>
          {DAY_LABELS.map(label => (
            <div
              key={label}
              className='flex h-5 w-8 items-center justify-end pr-2 text-xs text-(--secondary-color)'
            >
              {label}
            </div>
          ))}
        </div>

        {/* Grid of weeks */}
        <div className='flex gap-0.5'>
          {weeks.map((week, weekIndex) => {
            // Use first non-null day in week as key, fallback to week index
            const weekKey = week.find(d => d !== null) || `week-${weekIndex}`;
            return (
              <div key={weekKey} className='flex flex-col gap-0.5'>
                {week.map((day, dayIndex) => {
                  // Use day as key if available, otherwise use week+day index combination
                  const dayKey = day || `${weekKey}-empty-${dayIndex}`;
                  return (
                    <div key={dayKey}>
                      {day ? (
                        <DayCell
                          date={day}
                          isVisited={hasVisit(visits, day)}
                          isFuture={isFutureDate(day)}
                          size='md'
                        />
                      ) : (
                        <div className='h-5 w-5' />
                      )}
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/**
 * Get all days of the current year (Jan 1 to Dec 31), including future days
 */
function getFullYearDays(): string[] {
  const year = new Date().getFullYear();
  const yearDays: string[] = [];

  // Start from Jan 1
  const startDate = new Date(year, 0, 1);
  // End at Dec 31
  const endDate = new Date(year, 11, 31);

  const currentDate = new Date(startDate);
  while (currentDate <= endDate) {
    yearDays.push(formatDate(currentDate));
    currentDate.setDate(currentDate.getDate() + 1);
  }

  return yearDays;
}

/**
 * Year view - GitHub-style continuous grid (no splits between months)
 * Weeks are columns, days of week are rows
 */
function YearGrid({ visits }: { visits: string[]; days: string[] }) {
  const currentYear = new Date().getFullYear();

  // Get ALL days of the year (Jan 1 - Dec 31)
  const allYearDays = getFullYearDays();

  // Build continuous weeks for the entire year - GitHub style
  // Each week is a column, start from the first week containing Jan 1
  const allWeeks: (string | null)[][] = [];
  let currentWeek: (string | null)[] = [...EMPTY_WEEK];

  // Find what day of the week Jan 1 falls on
  const jan1 = new Date(currentYear, 0, 1);
  const jan1DayOfWeek = jan1.getDay() === 0 ? 6 : jan1.getDay() - 1; // Monday = 0

  // Fill in days before Jan 1 in the first week with nulls (already done)
  for (const day of allYearDays) {
    const dayOfWeek = getDayOfWeek(day); // 0 = Monday, 6 = Sunday
    currentWeek[dayOfWeek] = day;

    // If Sunday (6), push week and start new
    if (dayOfWeek === 6) {
      allWeeks.push(currentWeek);
      currentWeek = [...EMPTY_WEEK];
    }
  }

  // Push the last partial week if it has any days
  if (currentWeek.some(d => d !== null)) {
    allWeeks.push(currentWeek);
  }

  // Calculate month labels - show label at the week containing the 1st day of each month
  const monthLabels: string[] = [];
  for (const week of allWeeks) {
    // Check if this week contains the 1st day of any month
    const firstOfMonth = week.find(d => {
      if (!d) return false;
      const day = parseInt(d.split('-')[2], 10);
      return day === 1;
    });

    if (firstOfMonth) {
      const monthKey = firstOfMonth.substring(0, 7); // YYYY-MM
      monthLabels.push(getMonthName(monthKey));
    } else {
      monthLabels.push('');
    }
  }

  return (
    <div className='flex flex-col gap-3'>
      {/* Year title */}
      <h3 className='text-lg font-semibold text-(--main-color)'>
        {currentYear}
      </h3>

      <div className='flex gap-2'>
        {/* Day labels on the left - aligned with grid rows */}
        <div className='flex shrink-0 flex-col'>
          {/* Spacer for month labels row */}
          <div className='h-4' />
          {/* Day labels */}
          <div className='flex flex-col gap-0.5'>
            {DAY_LABELS.map(label => (
              <div
                key={label}
                className='flex h-4 w-8 items-center justify-end pr-2 text-xs text-(--secondary-color)'
              >
                {label}
              </div>
            ))}
          </div>
        </div>

        {/* Grid container - horizontal scroll on small screens */}
        <div className='flex-1 overflow-x-auto pb-2'>
          <div className='flex min-w-max flex-col gap-0.5'>
            {/* Month labels */}
            <div className='flex h-4 items-end gap-0.5'>
              {monthLabels.map((label, i) => (
                <div
                  key={`month-${label}-${i}`}
                  className='w-4 text-xs whitespace-nowrap text-(--secondary-color)'
                >
                  {label}
                </div>
              ))}
            </div>

            {/* Grid rows - one row per day of week */}
            <div className='flex flex-col gap-0.5'>
              {DAY_LABELS.map((label, dayIndex) => (
                <div key={`day-${label}-${dayIndex}`} className='flex gap-0.5'>
                  {allWeeks.map((week, weekIndex) => {
                    const day = week[dayIndex];
                    // Use day as key if available, otherwise use week+day combination
                    const cellKey = day || `week-${weekIndex}-day-${dayIndex}`;
                    return (
                      <div key={cellKey}>
                        {day ? (
                          <DayCell
                            date={day}
                            isVisited={hasVisit(visits, day)}
                            isFuture={isFutureDate(day)}
                            size='sm'
                          />
                        ) : (
                          <div className='h-4 w-4' />
                        )}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function StreakGrid({ visits, period }: StreakGridProps) {
  const days = getDaysInPeriod(period);

  return (
    <div className='rounded-2xl border border-(--border-color) bg-(--card-color) p-5'>
      {period === 'week' && <WeekGrid visits={visits} days={days} />}
      {period === 'month' && <MonthGrid visits={visits} days={days} />}
      {period === 'year' && <YearGrid visits={visits} days={days} />}
    </div>
  );
}

// Export for testing
export { getDaysInPeriod };
