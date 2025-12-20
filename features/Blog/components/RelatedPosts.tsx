'use client';

import React from 'react';
import { Link } from '@/shared/components/navigation/Link';
import { cn } from '@/shared/lib/utils';
import type { BlogPostMeta } from '../types/blog';

interface RelatedPostsProps {
  /** Array of related blog post metadata */
  posts: BlogPostMeta[];
  /** Additional CSS classes */
  className?: string;
}

/**
 * RelatedPosts Component
 * Displays links to related posts when the array is non-empty.
 */
export function RelatedPosts({ posts, className }: RelatedPostsProps) {
  if (posts.length === 0) {
    return null;
  }

  return (
    <aside
      className={cn(
        'rounded-xl border border-[var(--border-color)] bg-[var(--card-color)] p-6',
        className
      )}
      aria-label='Related posts'
      data-testid='related-posts'
    >
      <h2 className='mb-4 text-lg font-semibold text-[var(--main-color)]'>
        Related Posts
      </h2>
      <ul className='space-y-3' data-testid='related-posts-list'>
        {posts.map(post => (
          <li key={post.slug} data-testid={`related-post-${post.slug}`}>
            <Link
              href={`/blog/${post.slug}`}
              className='group block'
              data-testid={`related-post-link-${post.slug}`}
            >
              <span className='text-[var(--secondary-color)] transition-colors group-hover:text-[var(--main-color)]'>
                {post.title}
              </span>
              <span className='ml-2 text-xs text-[var(--secondary-color)] opacity-60'>
                {post.readingTime} min read
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </aside>
  );
}

export default RelatedPosts;
