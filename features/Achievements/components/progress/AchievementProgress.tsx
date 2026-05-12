'use client';

import { HeroSection } from './HeroSection';
import { CategoryTabs } from './CategoryTabs';
import { AchievementGrid } from './AchievementGrid';
import { AchievementManagement } from './AchievementManagement';
import { useAchievementProgress } from './useAchievementProgress';

/**
 * Main AchievementProgress component
 * Displays the complete achievements page with:
 * - Hero section with stats
 * - Category filter tabs
 * - Achievement grid
 * - Achievement management section
 */
const AchievementProgress = () => {
  const {
    selectedCategory,
    unlockedAchievements,
    totalPoints,
    level,
    filteredAchievements,
    unlockedCount,
    totalCount,
    completionPercentage,
    handleCategorySelect,
    getAchievementProgress,
    getCategoryStats,
  } = useAchievementProgress();

  return (
    <div className='w-full'>
      {/* Hero Section */}
      <HeroSection
        unlockedCount={unlockedCount}
        totalCount={totalCount}
        totalPoints={totalPoints}
        level={level}
        completionPercentage={completionPercentage}
      />

      {/* Category Tabs & Achievement Grid */}
      <div className='py-6 sm:px-6'>
        <div className='mx-auto max-w-6xl'>
          <div className='px-4 sm:px-0'>
            <CategoryTabs
              selectedCategory={selectedCategory}
              onCategorySelect={handleCategorySelect}
              getCategoryStats={getCategoryStats}
            />
          </div>

          <AchievementGrid
            achievements={filteredAchievements}
            unlockedAchievements={unlockedAchievements}
            getAchievementProgress={getAchievementProgress}
            selectedCategory={selectedCategory}
          />
        </div>

        {/* Achievement Management Section */}
        <div className='mt-8 px-4 sm:px-0'>
          <AchievementManagement />
        </div>
      </div>
    </div>
  );
};

export default AchievementProgress;
