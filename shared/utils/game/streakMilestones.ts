export const STREAK_MILESTONES = [
  10, 25, 50, 75, 100, 125, 150, 175, 200, 225, 250,
] as const;
export const ENABLE_EVERY_QUESTION_AD_OVERLAY = true;
export const QUESTIONS_PER_AD_OVERLAY = 15;

export type StreakMilestone = (typeof STREAK_MILESTONES)[number];

export const isStreakMilestone = (streak: number): streak is StreakMilestone =>
  STREAK_MILESTONES.includes(streak as StreakMilestone);

export const shouldShowStreakMilestoneOverlay = (
  streak: number,
  totalQuestionsAnswered: number,
): boolean =>
  ENABLE_EVERY_QUESTION_AD_OVERLAY
    ? totalQuestionsAnswered > 0 &&
      totalQuestionsAnswered % QUESTIONS_PER_AD_OVERLAY === 0
    : isStreakMilestone(streak);
