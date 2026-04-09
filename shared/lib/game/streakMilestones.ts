export const STREAK_MILESTONES = [5, 10, 15, 20, 25] as const;

export type StreakMilestone = (typeof STREAK_MILESTONES)[number];

const STREAK_MESSAGES: Record<StreakMilestone, string[]> = {
  5: [
    "You're finding your rhythm!",
    'Great start - keep it rolling!',
    "Nice streak. You're warmed up now.",
  ],
  10: [
    'Double digits. Beautiful work!',
    "You're in the zone now!",
    "Ten in a row? That's serious momentum.",
  ],
  15: [
    "You're on fire right now!",
    'This run is getting scary good.',
    'Fifteen straight - unstoppable energy.',
  ],
  20: [
    'Twenty in a row. Elite focus.',
    'This is mastery in motion.',
    "You're absolutely locked in.",
  ],
  25: [
    "Legend status. That's 25 straight.",
    'Unreal consistency. Keep going!',
    'This streak is iconic.',
  ],
};

export const isStreakMilestone = (streak: number): streak is StreakMilestone =>
  STREAK_MILESTONES.includes(streak as StreakMilestone);

export const shouldShowStreakMilestoneOverlay = (streak: number): boolean => {
  if (streak === 1) {
    return (
      process.env.NODE_ENV === 'development' ||
      process.env.NEXT_PUBLIC_VERCEL_ENV === 'preview'
    );
  }

  return isStreakMilestone(streak);
};

export const getRandomMilestoneMessage = (
  milestone: StreakMilestone | number,
): string => {
  if (!isStreakMilestone(milestone)) {
    return '';
  }

  const pool = STREAK_MESSAGES[milestone];
  const index = Math.floor(Math.random() * pool.length);
  return pool[index];
};

