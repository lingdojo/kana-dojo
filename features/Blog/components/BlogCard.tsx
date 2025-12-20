'use client';

import React from 'react';
import { Link } from '@/shared/components/navigation/Link';
import { cn } from '@/shared/lib/utils';
import type { BlogPostMeta, Category } from '../types/blog';

/**
 * Category badge color mappings
 */
const categoryColors: Record<Category, string> = {
  hiragana: 'bg-pink-500/20 text-pink-400 border-pink-500/30',
  katakana: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  kanji: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  vocabulary: 'bg-green-500/20 text-green-400 border-green-500/30',
  grammar: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  culture: 'bg-orange-500/20 text-orange-400 border-orange-500/30'
};

interface BlogCardProps {
  /** Blog post metadata to display */
  post: BlogPostMeta;
  /** Additional CSS classes */
  className?: string;
}

/**
 * BlogCard Component
 * Displays a preview card for a blog post with title, description,
 * category badge, reading time, and publication date.
 * Links to the individual post page.
 */
export function BlogCard({ post, className }: BlogCardProps) {
  const formattedDate = new Date(post.publishedAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <article
      className={cn(
        'group relative flex flex-col rounded-xl border border-[var(--border-color)] bg-[var(--card-color)] p-6 transition-all duration-200 hover:border-[var(--main-color)] hover:shadow-lg',
        className
      )}
      data-testid='blog-card'
    >
      <Link
        href={`/academy/${post.slug}`}
        className='absolute inset-0 z-10'
        aria-label={`Read more about ${post.title}`}
      >
        <span className='sr-only'>Read article: {post.title}</span>
      </Link>

      {/* Category Badge */}
      <div className='mb-3 flex items-center gap-2'>
        <span
          className={cn(
            'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium capitalize',
            categoryColors[post.category]
          )}
          data-testid='blog-card-category'
        >
          {post.category}
        </span>
        {post.difficulty && (
          <span
            className='inline-flex items-center rounded-full border border-[var(--border-color)] bg-[var(--background-color)] px-2.5 py-0.5 text-xs font-medium capitalize text-[var(--secondary-color)]'
            data-testid='blog-card-difficulty'
          >
            {post.difficulty}
          </span>
        )}
      </div>

      {/* Title */}
      <h2
        className='mb-2 text-lg font-semibold text-[var(--main-color)] transition-colors group-hover:text-[var(--secondary-color)]'
        data-testid='blog-card-title'
      >
        {post.title}
      </h2>

      {/* Description */}
      <p
        className='mb-4 line-clamp-2 flex-grow text-sm text-[var(--secondary-color)]'
        data-testid='blog-card-description'
      >
        {post.description}
      </p>

      {/* Meta Information */}
      <footer className='flex items-center justify-between text-xs text-[var(--secondary-color)]'>
        <time dateTime={post.publishedAt} data-testid='blog-card-date'>
          {formattedDate}
        </time>
        <span data-testid='blog-card-reading-time'>
          {post.readingTime} min read
        </span>
      </footer>
    </article>
  );
}

export default BlogCard;
