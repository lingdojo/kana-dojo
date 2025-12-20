'use client';

import React, { useState, useMemo } from 'react';
import { cn } from '@/shared/lib/utils';
import type { BlogPostMeta, Category } from '../types/blog';
import { BlogCard } from './BlogCard';
import { CategoryFilter } from './CategoryFilter';

interface BlogListProps {
  /** Array of blog post metadata to display */
  posts: BlogPostMeta[];
  /** Additional CSS classes */
  className?: string;
  /** Whether to show the category filter */
  showFilter?: boolean;
}

/**
 * Filters posts by category
 * Returns all posts if category is null, otherwise only posts matching the category
 */
export function filterPostsByCategory(
  posts: BlogPostMeta[],
  category: Category | null
): BlogPostMeta[] {
  if (category === null) {
    return posts;
  }
  return posts.filter(post => post.category === category);
}

/**
 * BlogList Component
 * Displays a grid of BlogCard components with optional category filtering.
 */
export function BlogList({
  posts,
  className,
  showFilter = true
}: BlogListProps) {
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(
    null
  );

  const filteredPosts = useMemo(
    () => filterPostsByCategory(posts, selectedCategory),
    [posts, selectedCategory]
  );

  return (
    <div className={cn('space-y-6', className)} data-testid='blog-list'>
      {showFilter && (
        <CategoryFilter
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
        />
      )}

      {filteredPosts.length === 0 ? (
        <div
          className='py-12 text-center text-[var(--secondary-color)]'
          data-testid='blog-list-empty'
        >
          <p>No posts found in this category.</p>
        </div>
      ) : (
        <div
          className='grid gap-6 sm:grid-cols-2 lg:grid-cols-3'
          data-testid='blog-list-grid'
        >
          {filteredPosts.map(post => (
            <BlogCard key={post.slug} post={post} />
          ))}
        </div>
      )}
    </div>
  );
}

export default BlogList;
