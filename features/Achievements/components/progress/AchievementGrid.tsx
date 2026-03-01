'use client';

import { motion } from 'framer-motion';
import { Trophy } from 'lucide-react';
import { memo } from 'react';
import { type Achievement } from '@/features/Achievements/store/useAchievementStore';
import { AchievementCard } from './AchievementCard';

import { AchievementProgressData } from './useAchievementProgress';

export interface AchievementGridProps {
  achievements: Achievement[];
  unlockedAchievements: Record<string, Achievement>;
  getAchievementProgress: (achievementId: string) => AchievementProgressData;
  selectedCategory: string;
}

/**
 * Grid display of achievement cards
 * Handles the layout and animation of achievement cards
 * Memoized to prevent unnecessary re-renders when parent updates
 */
const AchievementGridComponent = ({
  achievements,
  unlockedAchievements,
  getAchievementProgress,
  selectedCategory,
}: AchievementGridProps) => {
  if (achievements.length === 0) {
    return (
      <div className='py-12 text-center'>
        <Trophy className='mx-auto mb-4 text-(--border-color)' size={48} />
        <h3 className='mb-2 text-lg font-semibold text-(--main-color)'>
          No achievements in this category
        </h3>
        <p className='text-(--secondary-color)'>
          Try selecting a different category to see more achievements.
        </p>
      </div>
    );
  }

  return (
    <motion.div
      key={selectedCategory}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className='grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3'
    >
      {achievements.map((achievement, index) => {
        const isUnlocked = !!unlockedAchievements[achievement.id];
        const progress = getAchievementProgress(achievement.id);

        return (
          <motion.div
            key={achievement.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 * index }}
            className='flex'
          >
            <AchievementCard
              achievement={achievement}
              isUnlocked={isUnlocked}
              progress={progress}
            />
          </motion.div>
        );
      })}
    </motion.div>
  );
};

// Export memoized component to prevent unnecessary re-renders
export const AchievementGrid = memo(AchievementGridComponent);
