'use client';

import { useState } from 'react';
import { motion } from 'motion/react';
import clsx from 'clsx';
import { Trophy, Star, Zap, Crown, Gem, Lock, RotateCcw } from 'lucide-react';
import { LucideProps } from 'lucide-react'; //
import useAchievementStore, {
  ACHIEVEMENTS,
  type Achievement,
  type AchievementRarity
} from '@/features/Achievements/store/useAchievementStore';
import useStatsStore from '@/features/Progress/store/useStatsStore';
import { useClick } from '@/shared/hooks/useAudio';
import { cardBorderStyles, buttonBorderStyles } from '@/shared/lib/styles';

const rarityConfig: Record<
  AchievementRarity,
  {
    color: string;
    bgColor: string;
    borderColor: string;
    icon: React.FC<LucideProps>;
    label: string;
  }
> = {
  common: {
    color: '#6B7280',
    bgColor: '#F9FAFB',
    borderColor: '#D1D5DB',
    icon: Star,
    label: 'Common'
  },
  uncommon: {
    color: '#059669',
    bgColor: '#ECFDF5',
    borderColor: '#A7F3D0',
    icon: Zap,
    label: 'Uncommon'
  },
  rare: {
    color: '#2563EB',
    bgColor: '#EFF6FF',
    borderColor: '#93C5FD',
    icon: Trophy,
    label: 'Rare'
  },
  epic: {
    color: '#7C3AED',
    bgColor: '#F5F3FF',
    borderColor: '#C4B5FD',
    icon: Crown,
    label: 'Epic'
  },
  legendary: {
    color: '#DC2626',
    bgColor: '#FEF2F2',
    borderColor: '#FECACA',
    icon: Gem,
    label: 'Legendary'
  }
};

const categories = [
  { id: 'all', label: 'All Achievements', icon: Trophy },
  { id: 'milestone', label: 'Milestones', icon: Star },
  { id: 'streak', label: 'Streaks', icon: Zap },
  { id: 'consistency', label: 'Consistency', icon: Crown },
  { id: 'mastery', label: 'Mastery', icon: Gem }
] as const;

interface AchievementCardProps {
  achievement: Achievement;
  isUnlocked: boolean;
  progress: number;
  onClick: () => void;
}

const AchievementCard = ({
  achievement,
  isUnlocked,
  progress,
  onClick
}: AchievementCardProps) => {
  const config = rarityConfig[achievement.rarity];
  const RarityIcon = config.icon;

  return (
    <div
      className={clsx(
        'relative p-6 cursor-pointer',
        'rounded-2xl border-2 overflow-hidden',
        isUnlocked
          ? 'bg-[var(--card-color)] border-[var(--border-color)]'
          : 'bg-[var(--background-color)] border-[var(--border-color)]/50 opacity-80'
      )}
      onClick={onClick}
    >
      {/* Gradient overlay for unlocked achievements */}
      {isUnlocked && (
        <div
          className='absolute inset-0 opacity-5'
          style={{
            background: `linear-gradient(135deg, ${config.color}20, transparent)`
          }}
        />
      )}

      {/* Rarity badge */}
      <div className='absolute top-3 right-3'>
        <div
          className={clsx(
            'flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium',
            'border backdrop-blur-sm'
          )}
          style={
            isUnlocked
              ? {
                  backgroundColor: `${config.color}15`,
                  borderColor: `${config.color}30`,
                  color: config.color
                }
              : {
                  backgroundColor: '#F3F4F620',
                  borderColor: '#D1D5DB50',
                  color: '#9CA3AF'
                }
          }
        >
          <RarityIcon size={12} />
          {config.label}
        </div>
      </div>

      <div className='space-y-4'>
        {/* Achievement icon and title */}
        <div className='flex items-center gap-4'>
          <div
            className={clsx(
              'w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-bold',
              'border-2'
            )}
            style={
              isUnlocked
                ? {
                    backgroundColor: config.bgColor,
                    borderColor: config.borderColor,
                    color: config.color
                  }
                : {
                    backgroundColor: '#F3F4F6',
                    borderColor: '#D1D5DB',
                    color: '#9CA3AF'
                  }
            }
          >
            {isUnlocked ? achievement.icon : <Lock size={24} />}
          </div>

          <div className='flex-1 min-w-0'>
            <h3
              className={clsx(
                'font-bold text-lg mb-1',
                isUnlocked
                  ? 'text-[var(--main-color)]'
                  : 'text-[var(--secondary-color)]'
              )}
            >
              {achievement.title}
            </h3>

            <p
              className={clsx(
                'text-sm leading-relaxed',
                isUnlocked
                  ? 'text-[var(--secondary-color)]'
                  : 'text-[var(--secondary-color)]/70'
              )}
            >
              {achievement.description}
            </p>
          </div>
        </div>

        {/* Progress bar for locked achievements */}
        {!isUnlocked && progress > 0 && (
          <div className='space-y-2'>
            <div className='flex justify-between items-center'>
              <span className='text-sm font-medium text-[var(--main-color)]'>
                Progress
              </span>
              <span className='text-sm font-bold text-[var(--main-color)]'>
                {Math.round(progress)}%
              </span>
            </div>
            <div className='w-full bg-[var(--card-color)] rounded-full h-3'>
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
                className='h-3 rounded-full'
                style={{
                  background:
                    'linear-gradient(to right, var(--secondary-color), var(--main-color))'
                }}
              />
            </div>
          </div>
        )}

        {/* Footer */}
        <div className='flex items-center justify-between pt-2 border-t border-[var(--border-color)]/30'>
          <div className='flex items-center gap-2'>
            <Trophy
              size={16}
              className={
                isUnlocked ? 'text-yellow-500' : 'text-[var(--border-color)]'
              }
            />
            <span
              className={clsx(
                'text-sm font-bold',
                isUnlocked
                  ? 'text-[var(--main-color)]'
                  : 'text-[var(--secondary-color)]'
              )}
            >
              {achievement.points} points
            </span>
          </div>

          {isUnlocked && (
            <div className='text-xs text-[var(--secondary-color)] bg-[var(--background-color)] px-2 py-1 rounded-full'>
              Unlocked ✓
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const AchievementProgress = () => {
  const { playClick } = useClick();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const unlockedAchievements = useAchievementStore(
    state => state.unlockedAchievements
  );
  const totalPoints = useAchievementStore(state => state.totalPoints);
  const level = useAchievementStore(state => state.level);
  const stats = useStatsStore();

  // Helper function to calculate achievement progress
  const getAchievementProgress = (achievementId: string) => {
    const achievement = ACHIEVEMENTS.find(a => a.id === achievementId);
    if (!achievement) return 0;

    let current = 0;
    const target = achievement.requirements.value;

    switch (achievement.requirements.type) {
      case 'total_correct':
        current = stats.allTimeStats.totalCorrect;
        break;
      case 'streak':
        current = stats.allTimeStats.bestStreak;
        break;
      case 'sessions':
        current = stats.allTimeStats.totalSessions;
        break;
      case 'accuracy':
        const totalAnswers =
          stats.allTimeStats.totalCorrect + stats.allTimeStats.totalIncorrect;
        current =
          totalAnswers > 0
            ? (stats.allTimeStats.totalCorrect / totalAnswers) * 100
            : 0;
        break;
    }

    return Math.min((current / target) * 100, 100);
  };

  const filteredAchievements =
    selectedCategory === 'all'
      ? ACHIEVEMENTS
      : ACHIEVEMENTS.filter(
          achievement => achievement.category === selectedCategory
        );

  const unlockedCount = Object.keys(unlockedAchievements).length;
  const totalCount = ACHIEVEMENTS.length;
  const completionPercentage = (unlockedCount / totalCount) * 100;

  const handleCategorySelect = (categoryId: string) => {
    playClick();
    setSelectedCategory(categoryId);
  };

  const handleAchievementClick = (achievement: Achievement) => {
    playClick();
    // Could open achievement details modal here
    console.log(achievement);
  };

  // Get category stats
  const getCategoryStats = (categoryId: string) => {
    const categoryAchievements =
      categoryId === 'all'
        ? ACHIEVEMENTS
        : ACHIEVEMENTS.filter(a => a.category === categoryId);
    const categoryUnlocked = categoryAchievements.filter(
      a => unlockedAchievements[a.id]
    ).length;
    return { total: categoryAchievements.length, unlocked: categoryUnlocked };
  };

  return (
    <div className='w-full'>
      {/* Hero Section */}
      <div className='relative overflow-hidden'>
        <div className='relative px-6 py-12 text-center'>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className='space-y-4'
          >
            <div className='flex items-center justify-center gap-3 mb-4'>
              <Trophy className='text-yellow-500' size={40} />
              <h1 className='text-4xl font-bold text-[var(--main-color)]'>
                Achievements
              </h1>
            </div>
            <p className='text-lg text-[var(--secondary-color)] max-w-2xl mx-auto'>
              Track your Japanese learning journey and celebrate your milestones
            </p>

            {/* Stats Cards */}
            <div className='grid grid-cols-1 md:grid-cols-4 gap-4 max-w-4xl mx-auto mt-8'>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className={clsx('p-6 text-center', cardBorderStyles)}
              >
                <div className='text-3xl font-bold text-[var(--main-color)] mb-1'>
                  {unlockedCount}
                </div>
                <div className='text-sm text-[var(--secondary-color)]'>
                  Unlocked
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className={clsx('p-6 text-center', cardBorderStyles)}
              >
                <div className='text-3xl font-bold text-[var(--main-color)] mb-1'>
                  {totalCount}
                </div>
                <div className='text-sm text-[var(--secondary-color)]'>
                  Total
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className={clsx('p-6 text-center', cardBorderStyles)}
              >
                <div className='text-3xl font-bold text-[var(--main-color)] mb-1'>
                  {totalPoints}
                </div>
                <div className='text-sm text-[var(--secondary-color)]'>
                  Points
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className={clsx('p-6 text-center', cardBorderStyles)}
              >
                <div className='text-3xl font-bold text-[var(--main-color)] mb-1'>
                  {level}
                </div>
                <div className='text-sm text-[var(--secondary-color)]'>
                  Level
                </div>
              </motion.div>
            </div>

            {/* Overall Progress */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className='max-w-md mx-auto mt-6'
            >
              <div className='flex justify-between items-center mb-2'>
                <span className='text-sm font-medium text-[var(--main-color)]'>
                  Overall Progress
                </span>
                <span className='text-sm font-bold text-[var(--main-color)]'>
                  {Math.round(completionPercentage)}%
                </span>
              </div>
              <div className='w-full bg-[var(--card-color)] rounded-full h-4'>
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${completionPercentage}%` }}
                  transition={{ duration: 1.5, ease: 'easeOut' }}
                  className='h-4 rounded-full'
                  style={{
                    background:
                      'linear-gradient(to right, var(--secondary-color), var(--main-color))'
                  }}
                />
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Category Tabs */}
      <div className='px-6 py-6'>
        <div className='max-w-6xl mx-auto'>
          <div className='flex flex-wrap gap-2 mb-8 justify-center'>
            {categories.map((category, index) => {
              const stats = getCategoryStats(category.id);
              const CategoryIcon = category.icon;
              const isSelected = selectedCategory === category.id;

              return (
                <motion.button
                  key={category.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * index }}
                  onClick={() => handleCategorySelect(category.id)}
                  className={clsx(
                    'flex items-center gap-2 px-4 py-3 rounded-xl transition-all duration-200 hover:cursor-pointer',
                    'border-2 font-medium',
                    isSelected
                      ? 'bg-[var(--main-color)] text-[var(--background-color)] border-[var(--main-color)]'
                      : 'bg-[var(--card-color)] text-[var(--main-color)] border-[var(--border-color)] hover:border-[var(--main-color)]'
                  )}
                >
                  <CategoryIcon size={18} />
                  <span>{category.label}</span>
                  <span
                    className={clsx(
                      'text-xs px-2 py-1 rounded-full',
                      isSelected
                        ? 'bg-[var(--background-color)]/20 text-[var(--background-color)]'
                        : 'bg-[var(--background-color)] text-[var(--secondary-color)]'
                    )}
                  >
                    {stats.unlocked}/{stats.total}
                  </span>
                </motion.button>
              );
            })}
          </div>

          {/* Achievement Grid */}
          <motion.div
            key={selectedCategory}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
          >
            {filteredAchievements.map((achievement, index) => {
              const isUnlocked = !!unlockedAchievements[achievement.id];
              const progress = getAchievementProgress(achievement.id);

              return (
                <motion.div
                  key={achievement.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.05 * index }}
                >
                  <AchievementCard
                    achievement={achievement}
                    isUnlocked={isUnlocked}
                    progress={progress}
                    onClick={() => handleAchievementClick(achievement)}
                  />
                </motion.div>
              );
            })}
          </motion.div>

          {/* Empty State */}
          {filteredAchievements.length === 0 && (
            <div className='text-center py-12'>
              <Trophy
                className='mx-auto text-[var(--border-color)] mb-4'
                size={48}
              />
              <h3 className='text-lg font-semibold text-[var(--main-color)] mb-2'>
                No achievements in this category
              </h3>
              <p className='text-[var(--secondary-color)]'>
                Try selecting a different category to see more achievements.
              </p>
            </div>
          )}
        </div>

        {/* Achievement Management Section */}
        <AchievementManagement />
      </div>
    </div>
  );
};

// Achievement Management Component
const AchievementManagement = () => {
  const { playClick } = useClick();
  const stats = useStatsStore();

  const handleRecalculateAchievements = () => {
    playClick();
    // Trigger a full recalculation of achievements based on current stats
    useAchievementStore.getState().checkAchievements(stats);
  };

  return (
    <div className='max-w-4xl mx-auto mt-12'>
      {/* Management Header */}
      <div className={clsx('p-6', cardBorderStyles)}>
        <div className='flex items-center gap-3 mb-4'>
          <RotateCcw className='text-[var(--main-color)]' size={24} />
          <h2 className='text-xl font-bold text-[var(--main-color)]'>
            Achievement Management
          </h2>
        </div>

        <p className='text-[var(--secondary-color)] mb-6'>
          Check for any missed achievements based on your current progress.
        </p>

        {/* Recalculate Achievements */}
        <div className='flex items-center justify-between p-4 bg-[var(--background-color)] rounded-lg'>
          <div>
            <h4 className='font-medium text-[var(--main-color)]'>
              Recalculate Achievements
            </h4>
            <p className='text-sm text-[var(--secondary-color)]'>
              Scan your progress and unlock any achievements you may have earned
            </p>
          </div>
          <button
            onClick={handleRecalculateAchievements}
            className={clsx(
              'px-4 py-2 rounded-lg flex items-center gap-2',
              buttonBorderStyles,
              'text-[var(--main-color)] hover:bg-[var(--border-color)]'
            )}
          >
            <RotateCcw size={16} />
            Recalculate
          </button>
        </div>
      </div>
    </div>
  );
};

export default AchievementProgress;
