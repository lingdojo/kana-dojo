export const STREAK_MILESTONES = [10, 25, 50, 75, 100, 125, 150, 175, 200, 225, 250] as const;

export type StreakMilestone = (typeof STREAK_MILESTONES)[number];

export const isStreakMilestone = (streak: number): streak is StreakMilestone =>
  STREAK_MILESTONES.includes(streak as StreakMilestone);

export const shouldShowStreakMilestoneOverlay = (streak: number): boolean =>
  isStreakMilestone(streak);

