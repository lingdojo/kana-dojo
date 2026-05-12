'use client';

import React from 'react';
import { cn } from '@/shared/utils/utils';
import type { Category } from '../types/blog';
import { VALID_CATEGORIES } from '../types/blog';

/**
 * Category display names
 */
const categoryLabels: Record<Category, string> = {
  hiragana: 'Hiragana',
  katakana: 'Katakana',
  kanji: 'Kanji',
  vocabulary: 'Vocabulary',
  grammar: 'Grammar',
  culture: 'Culture',
  comparison: 'Comparison',
  tutorial: 'Tutorial',
  resources: 'Resources',
  'study-tips': 'Study Tips',
  jlpt: 'JLPT',
};

/**
 * Category badge color mappings (inverted: solid color bg, --background-color text)
 */
const categoryColors: Record<Category, string> = {
  hiragana:
    'bg-pink-400 text-(--background-color) border-pink-400 hover:bg-pink-500',
  katakana:
    'bg-purple-400 text-(--background-color) border-purple-400 hover:bg-purple-500',
  kanji:
    'bg-blue-400 text-(--background-color) border-blue-400 hover:bg-blue-500',
  vocabulary:
    'bg-green-400 text-(--background-color) border-green-400 hover:bg-green-500',
  grammar:
    'bg-yellow-400 text-(--background-color) border-yellow-400 hover:bg-yellow-500',
  culture:
    'bg-orange-400 text-(--background-color) border-orange-400 hover:bg-orange-500',
  comparison:
    'bg-cyan-400 text-(--background-color) border-cyan-400 hover:bg-cyan-500',
  tutorial:
    'bg-indigo-400 text-(--background-color) border-indigo-400 hover:bg-indigo-500',
  resources:
    'bg-teal-400 text-(--background-color) border-teal-400 hover:bg-teal-500',
  'study-tips':
    'bg-lime-400 text-(--background-color) border-lime-400 hover:bg-lime-500',
  jlpt: 'bg-red-400 text-(--background-color) border-red-400 hover:bg-red-500',
};

interface CategoryFilterProps {
  /** Currently selected category (null for all) */
  selectedCategory: Category | null;
  /** Callback when category is selected */
  onCategoryChange: (category: Category | null) => void;
  /** Additional CSS classes */
  className?: string;
}

/**
 * CategoryFilter Component
 * Displays filter buttons for each blog category.
 * Highlights the active category.
 */
export function CategoryFilter({
  selectedCategory,
  onCategoryChange,
  className,
}: CategoryFilterProps) {
  return (
    <nav
      className={cn('flex flex-wrap gap-2', className)}
      aria-label='Filter posts by category'
      data-testid='category-filter'
    >
      {/* All categories button */}
      <button
        type='button'
        onClick={() => onCategoryChange(null)}
        className={cn(
          'inline-flex cursor-pointer items-center rounded-full border px-3 py-1.5 text-sm font-medium transition-all duration-200',
          selectedCategory === null
            ? 'border-(--main-color) bg-(--main-color) text-(--background-color)'
            : 'border-(--border-color) bg-transparent text-(--secondary-color) hover:border-(--main-color) hover:text-(--main-color)',
        )}
        aria-pressed={selectedCategory === null}
        data-testid='category-filter-all'
      >
        All
      </button>

      {/* Category buttons */}
      {VALID_CATEGORIES.map(category => (
        <button
          key={category}
          type='button'
          onClick={() => onCategoryChange(category)}
          className={cn(
            'inline-flex cursor-pointer items-center rounded-full border px-3 py-1.5 text-sm font-medium capitalize transition-all duration-200',
            categoryColors[category],
            selectedCategory === category &&
              'ring-2 ring-offset-2 ring-offset-(--background-color)',
          )}
          aria-pressed={selectedCategory === category}
          data-testid={`category-filter-${category}`}
        >
          {categoryLabels[category]}
        </button>
      ))}
    </nav>
  );
}

export default CategoryFilter;

