'use client';

import { AchievementCard as SharedAchievementCard } from '@/shared/ui';
import { type Achievement } from '@/features/Achievements/store/useAchievementStore';
import { type AchievementProgressData } from './useAchievementProgress';

export interface AchievementCardProps {
  achievement: Achievement;
  isUnlocked: boolean;
  progress: AchievementProgressData;
}

export const AchievementCard = ({
  achievement,
  isUnlocked,
  progress,
}: AchievementCardProps) => (
  <SharedAchievementCard
    achievement={achievement}
    isUnlocked={isUnlocked}
    progress={progress}
    variant='default'
  />
);
