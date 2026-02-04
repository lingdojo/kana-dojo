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
  category: Category | null,
): BlogPostMeta[] {
  if (category === null) {
    return posts;
  }
  return posts.filter(post => post.category === category);
}

/**
 * BlogList Component
 * Displays a premium editorial layout with a featured spotlight article
 * and a grid of secondary articles.
 */
export function BlogList({
  posts,
  className,
  showFilter = true,
}: BlogListProps) {
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(
    null,
  );

  const filteredPosts = useMemo(
    () => filterPostsByCategory(posts, selectedCategory),
    [posts, selectedCategory],
  );

  // Identify the featured post (first in the filtered list if no category is selected,
  // or simply the first matching post)
  const featuredPost = filteredPosts.length > 0 ? filteredPosts[0] : null;
  const remainingPosts = filteredPosts.slice(1);

  return (
    <div
      className={cn('space-y-16 lg:space-y-24', className)}
      data-testid='blog-list'
    >
      {showFilter && (
        <div className='flex items-center justify-between border-b border-(--border-color) pb-4'>
          <h3 className='text-[10px] font-black tracking-[0.3em] text-(--secondary-color) uppercase opacity-40'>
            Filter by Category
          </h3>
          <CategoryFilter
            selectedCategory={selectedCategory}
            onCategoryChange={setSelectedCategory}
          />
        </div>
      )}

      {filteredPosts.length === 0 ? (
        <div className='py-24 text-center' data-testid='blog-list-empty'>
          <p className='premium-serif text-2xl text-(--secondary-color) italic opacity-50'>
            No articles found in this collection.
          </p>
        </div>
      ) : (
        <div className='space-y-16 lg:space-y-24'>
          {/* Featured Post Spotlight */}
          {featuredPost && (
            <section aria-label='Featured Article'>
              <BlogCard
                post={featuredPost}
                isFeatured={true}
                className='mb-16 lg:mb-24'
              />
            </section>
          )}

          {/* Secondary Articles Grid */}
          {remainingPosts.length > 0 && (
            <section aria-label='Article Archive'>
              <div
                className='grid gap-x-8 gap-y-16 sm:grid-cols-2 lg:grid-cols-3'
                data-testid='blog-list-grid'
              >
                {remainingPosts.map(post => (
                  <BlogCard key={post.slug} post={post} />
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
}

export default BlogList;
