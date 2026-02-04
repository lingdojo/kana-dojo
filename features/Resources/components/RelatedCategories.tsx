'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import type { Category, CategoryWithCount } from '../types';
import { cn } from '@/shared/lib/utils';

interface RelatedCategoriesProps {
  /** Current category to find related categories for */
  currentCategory: Category;
  /** All categories with counts */
  allCategories: CategoryWithCount[];
  /** Base path for links */
  basePath: string;
  /** Additional CSS classes */
  className?: string;
}

// Define related category mappings based on content relationships
const RELATED_CATEGORIES_MAP: Record<string, string[]> = {
  apps: ['websites', 'textbooks', 'jlpt'],
  websites: ['apps', 'grammar', 'vocabulary'],
  textbooks: ['apps', 'grammar', 'jlpt'],
  youtube: ['podcasts', 'listening', 'immersion'],
  podcasts: ['youtube', 'listening', 'speaking'],
  games: ['immersion', 'reading', 'vocabulary'],
  jlpt: ['apps', 'textbooks', 'grammar'],
  reading: ['games', 'kanji', 'vocabulary'],
  listening: ['podcasts', 'youtube', 'speaking'],
  speaking: ['listening', 'podcasts', 'community'],
  writing: ['kanji', 'grammar', 'textbooks'],
  grammar: ['textbooks', 'websites', 'jlpt'],
  vocabulary: ['apps', 'kanji', 'reading'],
  kanji: ['vocabulary', 'writing', 'apps'],
  immersion: ['games', 'youtube', 'reading'],
  community: ['speaking', 'immersion', 'websites'],
};

/**
 * Get related categories for a given category
 */
export function getRelatedCategories(
  currentCategoryId: string,
  allCategories: CategoryWithCount[],
  limit: number = 3,
): CategoryWithCount[] {
  const relatedIds = RELATED_CATEGORIES_MAP[currentCategoryId] || [];

  return relatedIds
    .map(id => allCategories.find(cat => cat.id === id))
    .filter((cat): cat is CategoryWithCount => cat !== undefined)
    .slice(0, limit);
}

/**
 * RelatedCategories component displays links to related category pages
 * for improved internal linking and SEO
 *
 * @requirements 10.11, 8.1, 8.2, 8.5
 */
export function RelatedCategories({
  currentCategory,
  allCategories,
  basePath,
  className,
}: RelatedCategoriesProps) {
  const relatedCategories = getRelatedCategories(
    currentCategory.id,
    allCategories,
  );

  if (relatedCategories.length === 0) {
    return null;
  }

  return (
    <section
      className={cn(
        'rounded-xl border border-(--border-color) bg-(--card-color) p-6',
        className,
      )}
      aria-labelledby='related-categories-heading'
    >
      <h2
        id='related-categories-heading'
        className='mb-4 text-lg font-semibold text-(--main-color)'
      >
        Related Categories
      </h2>
      <p className='mb-4 text-sm text-(--secondary-color)'>
        Explore more Japanese learning resources in these related categories:
      </p>
      <ul className='space-y-3' role='list' aria-label='Related categories'>
        {relatedCategories.map(category => (
          <li key={category.id} role='listitem'>
            <Link
              href={`${basePath}/${category.id}`}
              className='group flex cursor-pointer items-center justify-between rounded-lg border border-(--border-color) bg-(--background-color) p-3 transition-colors hover:border-(--main-color) hover:shadow-sm focus-visible:ring-2 focus-visible:ring-(--main-color) focus-visible:ring-offset-2 focus-visible:outline-none'
              aria-label={`${category.name} - ${category.resourceCount} resources`}
            >
              <div className='flex-1'>
                <span className='font-medium text-(--main-color) group-hover:text-(--main-color)'>
                  {category.name}
                </span>
                <p className='mt-0.5 text-xs text-(--secondary-color)'>
                  {category.resourceCount} resources
                </p>
              </div>
              <ArrowRight
                className='h-4 w-4 text-(--secondary-color) transition-colors group-hover:text-(--main-color)'
                aria-hidden='true'
              />
            </Link>
          </li>
        ))}
      </ul>

      {/* Link back to main resources page */}
      <div className='mt-4 border-t border-(--border-color) pt-4'>
        <Link
          href={basePath}
          className='inline-flex cursor-pointer items-center gap-1 rounded-md text-sm text-(--main-color) hover:underline focus-visible:ring-2 focus-visible:ring-(--main-color) focus-visible:ring-offset-2 focus-visible:outline-none'
        >
          View all categories
          <ArrowRight className='h-3 w-3' aria-hidden='true' />
        </Link>
      </div>
    </section>
  );
}
