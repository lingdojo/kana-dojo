'use client';

import useAchievementStore from '../store/useAchievementStore';

type AchievementStoreState = ReturnType<typeof useAchievementStore.getState>;

export const achievementsBackup = {
  getAchievementsState: (): AchievementStoreState =>
    useAchievementStore.getState(),
  setAchievementsState: (partial: Partial<AchievementStoreState>) =>
    useAchievementStore.setState(partial),
};

export type { AchievementStoreState };
