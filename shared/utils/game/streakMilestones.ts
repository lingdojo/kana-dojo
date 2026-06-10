export const STREAK_MILESTONES = [5, 10, 25, 50, 75, 100] as const;

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
  25: [
    "Legend status. That's 25 straight.",
    'Unreal consistency. Keep going!',
    'This streak is iconic.',
  ],
  50: [
    'Half a century of perfect answers!',
    'Fifty straight? You are a master.',
    'Unstoppable. 50 in a row!',
  ],
  75: [
    'Three quarters to a hundred!',
    "Seventy-five. You're in the history books.",
    'This run is legendary.',
  ],
  100: [
    'ONE HUNDRED IN A ROW!',
    'Century club. Absolute perfection.',
    '100 streak - you are a true champion!',
  ],
};

export const isStreakMilestone = (streak: number): streak is StreakMilestone =>
  STREAK_MILESTONES.includes(streak as StreakMilestone);

export const shouldShowStreakMilestoneOverlay = (streak: number): boolean =>
  isStreakMilestone(streak);

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

