'use client';

import { motion } from 'framer-motion';
import clsx from 'clsx';
import { ActionButton } from '@/shared/components/ui/ActionButton';
import { categories, CategoryId } from './constants';

interface CategoryStats {
  total: number;
  unlocked: number;
}

export interface CategoryTabsProps {
  selectedCategory: CategoryId;
  onCategorySelect: (categoryId: CategoryId) => void;
  getCategoryStats: (categoryId: string) => CategoryStats;
}

/**
 * Category filter tabs for achievements
 * Allows filtering achievements by category with visual feedback
 */
export const CategoryTabs = ({
  selectedCategory,
  onCategorySelect,
  getCategoryStats,
}: CategoryTabsProps) => {
  return (
    <div className='mb-8 flex flex-wrap justify-center gap-x-2 gap-y-4 sm:gap-4'>
      {categories.map((category, index) => {
        const categoryStats = getCategoryStats(category.id);
        const CategoryIcon = category.icon;
        const isSelected = selectedCategory === category.id;

        return (
          <motion.div
            key={category.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 * index }}
          >
            <ActionButton
              onClick={() => onCategorySelect(category.id)}
              colorScheme={isSelected ? 'main' : 'secondary'}
              borderColorScheme={isSelected ? 'main' : 'secondary'}
              borderBottomThickness={10}
              borderRadius='3xl'
              className='w-auto px-3 py-2 text-sm font-medium sm:px-4 sm:py-3 sm:text-base'
            >
              <CategoryIcon size={18} className='fill-current' />
              <span>{category.label}</span>
              <span
                className={clsx(
                  'rounded-full px-2 py-1 text-xs',
                  isSelected
                    ? 'bg-(--background-color)/20 text-(--background-color)'
                    : 'bg-(--background-color) text-(--secondary-color)',
                )}
              >
                {categoryStats.unlocked}/{categoryStats.total}
              </span>
            </ActionButton>
          </motion.div>
        );
      })}
    </div>
  );
};
