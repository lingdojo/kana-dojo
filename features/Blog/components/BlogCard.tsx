'use client';

import React from 'react';
import Image from 'next/image';
import { Link } from '@/shared/ui-composite/navigation/Link';
import { cn } from '@/shared/utils/utils';
import {
  formatLastUpdated,
  getFreshnessBadge,
} from '@/shared/utils/content-freshness';
import type { BlogPostMeta } from '../types/blog';

interface BlogCardProps {
  /** Blog post metadata to display */
  post: BlogPostMeta;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Editorial BlogCard Component
 * Displays a preview card for an article with a refined, magazine-style layout.
 * Supports a "featured" variant for the spotlight article.
 */
export function BlogCard({
  post,
  className,
  isFeatured = false,
}: BlogCardProps & { isFeatured?: boolean }) {
  const formattedDate = new Date(post.publishedAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <article
      className={cn(
        'group relative flex flex-col transition-all duration-500',
        isFeatured ? 'md:flex-row md:gap-12 lg:gap-16' : 'gap-6',
        className,
      )}
      data-testid='blog-card'
    >
      {/* Featured Background Decor (Asymmetric) */}
      {isFeatured && (
        <div className='absolute -inset-4 -z-10 rounded-3xl bg-(--main-color) opacity-[0.02] transition-opacity group-hover:opacity-[0.04]' />
      )}

      {/* Hero Image / Placeholder */}
      <div
        className={cn(
          'relative aspect-[16/10] overflow-hidden rounded-sm bg-(--card-color) brightness-95 transition-all duration-700 group-hover:brightness-100',
          isFeatured ? 'w-full md:w-3/5 lg:w-2/3' : 'w-full',
        )}
      >
        {post.featuredImage ? (
          <Image
            src={post.featuredImage}
            alt={post.title}
            fill
            sizes={isFeatured ? '(min-width: 1024px) 66vw, (min-width: 768px) 60vw, 100vw' : '(min-width: 768px) 50vw, 100vw'}
            className='object-cover transition-transform duration-700 group-hover:scale-105'
          />
        ) : (
          <div className='flex h-full w-full items-center justify-center opacity-10'>
            <span className='premium-serif text-6xl font-black italic select-none'>
              {post.title.charAt(0)}
            </span>
          </div>
        )}

        {/* Category Floating Badge */}
        <div className='absolute top-4 left-4 z-20'>
          <span
            className={cn(
              'inline-flex items-center rounded-sm bg-white/90 px-3 py-1 text-[10px] font-black tracking-widest text-black uppercase shadow-sm backdrop-blur-sm dark:bg-black/90 dark:text-white',
            )}
          >
            {post.category}
          </span>
        </div>
      </div>

      {/* Content Area */}
      <div
        className={cn(
          'flex flex-col justify-center',
          isFeatured ? 'w-full py-4 md:w-2/5 lg:w-1/3' : 'w-full px-1',
        )}
      >
        <div className='mb-3 flex items-center gap-3 font-mono text-[10px] tracking-tighter text-(--secondary-color) uppercase opacity-50'>
          <time dateTime={post.publishedAt}>{formattedDate}</time>
          {post.updatedAt && (
            <>
              <span className='h-px w-3 bg-(--border-color)' />
              <span className='text-(--main-color) opacity-70'>
                {formatLastUpdated(post.updatedAt)}
              </span>
            </>
          )}
          <span className='h-px w-4 bg-(--border-color)' />
          <span>{post.readingTime} min read</span>
          {(() => {
            const badge = getFreshnessBadge(post.updatedAt || post.publishedAt);
            if (badge.variant === 'fresh') {
              return (
                <span className='ml-auto rounded-full bg-emerald-500/15 px-2 py-0.5 text-[9px] font-bold tracking-wider text-emerald-500 normal-case'>
                  {badge.label}
                </span>
              );
            }
            return null;
          })()}
        </div>

        <Link
          href={`/academy/${post.slug}`}
          className='group/title'
          aria-label={`Read ${post.title}`}
        >
          <h2
            className={cn(
              'leading-[1.1] font-bold tracking-tight text-(--main-color) transition-colors group-hover/title:text-(--secondary-color)',
              isFeatured
                ? 'mb-6 text-3xl md:text-5xl lg:text-6xl'
                : 'mb-4 line-clamp-2 text-2xl',
            )}
          >
            {post.title}
          </h2>
        </Link>

        <p
          className={cn(
            'leading-relaxed text-(--secondary-color) opacity-70',
            isFeatured
              ? 'mb-8 text-lg md:text-xl'
              : 'mb-6 line-clamp-3 text-sm',
          )}
        >
          {post.description}
        </p>

        {/* Read More Link */}
        <Link
          href={`/academy/${post.slug}`}
          className='inline-flex items-center gap-2 text-[11px] font-black tracking-[0.2em] text-(--main-color) uppercase underline-offset-8 hover:underline'
        >
          Read Article
          <svg
            width='12'
            height='12'
            viewBox='0 0 24 24'
            fill='none'
            stroke='currentColor'
            strokeWidth='3'
            strokeLinecap='square'
            strokeLinejoin='miter'
          >
            <path d='M5 12h14M12 5l7 7-7 7' />
          </svg>
        </Link>
      </div>

      {/* Hover Decorator for standard cards */}
      {!isFeatured && (
        <div className='absolute right-1 -bottom-4 left-1 h-[1px] origin-left scale-x-0 bg-(--main-color) opacity-10 transition-transform duration-500 group-hover:scale-x-100' />
      )}
    </article>
  );
}

export default BlogCard;

