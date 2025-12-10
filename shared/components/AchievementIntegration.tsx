'use client';

import { useEffect } from 'react';
import useAchievementStore from '@/features/Achievements/store/useAchievementStore';

/**
 * Component to make achievement store available globally for integration
 * This is a workaround to allow the stats store to trigger achievement checks
 */
const AchievementIntegration = () => {
  const achievementStore = useAchievementStore;

  useEffect(() => {
    // Make achievement store available globally for cross-store communication
    if (typeof window !== 'undefined') {
      (
        window as Window & { __achievementStore?: typeof achievementStore }
      ).__achievementStore = achievementStore;
    }
    return () => {
      if (typeof window !== 'undefined') {
        delete (
          window as Window & { __achievementStore?: typeof achievementStore }
        ).__achievementStore;
      }
    };
  }, [achievementStore]);

  return null; //This component doesn't render anything
};

export default AchievementIntegration;
