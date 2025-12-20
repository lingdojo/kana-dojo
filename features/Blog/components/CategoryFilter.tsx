'use client';

import React from 'react';
import { cn } from '@/shared/lib/utils';
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
  culture: 'Culture'
};

/**
 * Category badge color mappings
 */
const categoryColors: Record<Category, string> = {
  hiragana:
    'bg-pink-500/20 text-pink-400 border-pink-500/30 hover:bg-pink-500/30',
  katakana:
    'bg-purple-500/20 text-purple-400 border-purple-500/30 hover:bg-purple-500/30',
  kanji: 'bg-blue-500/20 text-blue-400 border-blue-500/30 hover:bg-blue-500/30',
  vocabulary:
    'bg-green-500/20 text-green-400 border-green-500/30 hover:bg-green-500/30',
  grammar:
    'bg-yellow-500/20 text-yellow-400 border-yellow-500/30 hover:bg-yellow-500/30',
  culture:
    'bg-orange-500/20 text-orange-400 border-orange-500/30 hover:bg-orange-500/30'
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
  className
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
          'inline-flex items-center rounded-full border px-3 py-1.5 text-sm font-medium transition-all duration-200',
          selectedCategory === null
            ? 'border-[var(--main-color)] bg-[var(--main-color)] text-[var(--background-color)]'
            : 'border-[var(--border-color)] bg-transparent text-[var(--secondary-color)] hover:border-[var(--main-color)] hover:text-[var(--main-color)]'
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
            'inline-flex items-center rounded-full border px-3 py-1.5 text-sm font-medium capitalize transition-all duration-200',
            selectedCategory === category
              ? cn(
                  categoryColors[category],
                  'ring-2 ring-offset-2 ring-offset-[var(--background-color)]'
                )
              : cn(
                  'border-[var(--border-color)] bg-transparent text-[var(--secondary-color)]',
                  categoryColors[category]
                    .split(' ')
                    .slice(0, 2)
                    .join(' ')
                    .replace('bg-', 'hover:bg-')
                )
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
